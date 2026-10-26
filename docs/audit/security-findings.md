# Application Security & Privacy Review: Findings & Mitigations

## Executive Summary
This security review covers the web application and API boundaries, assessing them against OWASP Top 10 and OWASP ASVS Level 2 requirements for sensitive matrimonial and personal information.

---

## 1. Security Architecture Assessment

### 1.1 Authentication & Session Integrity
- **JWT Storage**: Session tokens are strictly stored and transported via `httpOnly`, `sameSite: lax`, `secure` cookies (`ksm_session`). Browser JavaScript has zero access to the session JWT, mitigating XSS token theft.
- **Immediate Session Invalidation**: The `User` model incorporates an integer field `tokenVersion`. Each JWT payload embeds `ver: user.tokenVersion`. Changing passwords, initiating password resets, or administrative account suspensions increment `tokenVersion`, invalidating outstanding tokens across all active sessions instantly.
- **Password Protection**: Passwords are hashed using `bcrypt` with work factor 12. Password fields are marked `select: false` by default in Mongoose schemas and sanitized in `.toJSON()` transforms.
- **Password Reset & OTP**: OTP codes are generated via `crypto.randomInt(100000, 1000000)` and hashed with SHA-256 before storage in `OtpVerification`. Verification enforces a maximum of 5 attempts and a 10-minute expiry window.

### 1.2 Authorization & Access Control (Broken Object Level Authorization / IDOR)
- **Profile Redaction Engine**: In `server/src/services/profilePrivacy.js`, the function `serializeProfileForViewer` evaluates the real-time relationship between viewer and profile. Sensitive family details, maternal lineage, residential addresses, and private contact numbers are stripped server-side unless explicit consent (`AcceptedInterests` or `contactUnlocked`) is recorded in the database.
- **Role Enforcement**: Administrative routes require `protect` followed by `permit('admin', 'super_admin')`. Operations on member roles prevent horizontal privilege escalation. A SuperAdmin cannot demote or suspend the last remaining SuperAdmin.

### 1.3 Payment Integrity & Replay Resistance
- **Signature Verification**: Checkout verification in `server/src/services/paymentService.js` calculates HMAC-SHA256 digests using `process.env.RAZORPAY_KEY_SECRET`. Signatures are validated using constant-time `crypto.timingSafeEqual`.
- **Amount & Currency Validation**: Webhook handler `razorpayWebhook` validates that incoming payment entities exactly match the database order amount in paise and currency (`INR`).
- **Idempotent Subscription Activation**: Uses Mongoose optimistic locking (`findOneAndUpdate` matching status `Created` or `Failed` with transition to `Processing`). Duplicate webhook delivery safely resolves as no-op.

### 1.4 Media & Upload Security
- **Magic-Byte Sniffing**: `server/src/services/mediaService.js` inspects raw buffer magic bytes (`FF D8 FF` for JPEG, `89 50 4E 47` for PNG, `52 49 46 46 ... 57 45 42 50` for WebP), rejecting arbitrary disguised file uploads.
- **Sharp Image Normalization**: All uploaded media is transcoded to WebP format, EXIF/GPS metadata is stripped, and dimensions are constrained to <= 1600px width/height.
- **Static File Isolation**: Express static file server disables directory listing (`index: false`) and rejects dotfiles (`dotfiles: 'deny'`).

---

## 2. Security Findings & Backlog

### SEC-001 [P1 - Confirmed Minor]
- **Component**: `server/src/controllers/adminController.js`
- **Finding**: In customer search or queue queries, ensure all user-supplied search parameters use regex escaping to avoid CPU-intensive regular expressions (ReDoS).
- **Status**: Partially mitigated in `profileController.js` via `escapedRegex()`. Verify consistency across all admin search handlers.
- **Remediation**: Standardize `escapedRegex` utility across `adminController.js` and `businessController.js`.

### SEC-002 [P2 - Recommended Hardening]
- **Component**: `server/src/app.js` Content Security Policy
- **Finding**: While Helmet is configured with restrictive CSP directives, ensure production environments explicitly declare allowed font and image CDNs (e.g., `fonts.googleapis.com`, `fonts.gstatic.com`, `res.cloudinary.com`).
- **Status**: Documented in `docs/CSP.md`. Enforce in production middleware.

### SEC-003 [P2 - Defense in Depth]
- **Component**: `server/src/middleware/auth.js`
- **Finding**: Rate limiters use in-memory store. For multi-instance horizontal scaling, connect to a shared Redis store to enforce distributed limits.
- **Status**: Acceptable for single-node deployment; documented for multi-instance production clustering.
