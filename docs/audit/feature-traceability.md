# Feature Traceability Matrix: User Journeys & End-to-End Contracts

## Overview
This document traces each critical matrimonial and operational journey from user interaction in the React frontend, through the network and Express API, down to the database persistence layer and resulting feedback loop.

---

## 1. Journey 1: Registration, Legal Consent & Onboarding

| Stage | Frontend Component | Client API Call | Backend Route & Middleware | Controller / Service | Database Mutation | Resulting State |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Registration** | `src/pages/AuthPage.jsx` (`mode="register"`) | `api('/auth/register', { method: 'POST', body: { email, password, phone, acceptTerms, acceptPrivacy, preferredLanguage } })` | `POST /api/auth/register` (Guarded by `authLimiter`) | `authController.register` -> `emailUser('welcome')` | Creates `User` document with hashed password (bcrypt cost 12), `acceptedTermsVersion`, `acceptedPrivacyVersion`, `tokenVersion: 0`. Sets httpOnly session cookie. | 201 Created. Frontend updates `AuthContext.user` and navigates user to `/onboarding`. |
| **Duplicate Attempt** | `AuthPage.jsx` | Same call with existing email or phone | `POST /api/auth/register` | `User.findOne({ $or: [{ email }, { phone }] })` | None. Throws `ApiError(409, 'An account already exists with these details.')`. | 409 Conflict. Client renders accessible error banner without resetting inputs. |
| **Onboarding Step 1-7** | `src/pages/OnboardingPage.jsx` | `api('/profiles/me', { method: 'PUT', body: sectionData })` | `PUT /api/profiles/me` (`protect`, `maintenanceGuard`) | `profileController.updateMyProfile` -> Sanitizes nested structures (`community`, `location`, `familyAssets`, `biodataPrivacy`). | Upserts `MatrimonialProfile` document. Auto-generates `profileId` (`KSM-XXXX`) via `Counter` sequence if new. Recalculates `completionPercentage`. | Profile saved. On step 7 completion, profile enters `UnderReview` / `Active` status; user is redirected to `/dashboard`. |

---

## 2. Journey 2: Member Profile Management & Biodata Generation

| Stage | Frontend Component | Client API Call | Backend Route & Middleware | Controller / Service | Database Mutation | Resulting State |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Inspect Own Profile** | `src/pages/ProfilePage.jsx` (`own={true}`) | `api('/profiles/me')` | `GET /api/profiles/me` (`protect`) | `profileController.getMyProfile` | None (Read query). Returns unredacted own profile data. | Profile fields rendered in organized tabs with completion checklist. |
| **Update Assets / Family** | `src/components/FamilyAssetsEditor.jsx` inside `ProfilePage.jsx` | `api('/profiles/me', { method: 'PUT', body: { familyAssets } })` | `PUT /api/profiles/me` (`protect`) | `profileController.updateMyProfile` | Updates `familyAssets.agricultureLand`, `residentialProperties`, etc. Validates numbers and booleans. | 200 OK. UI displays green confirmation toast and updates preview. |
| **Photo Upload** | `ProfilePage.jsx` | `api.upload('/profiles/me/photo', formData)` | `POST /api/profiles/me/photo` (`protect`, `upload.single('photo')`) | `upload.js` -> `mediaService.optimizeImage` -> `profileController.uploadPhoto` | Magic-byte verification (JPEG/PNG/WebP), strips metadata, resizes to <=1600px, transcodes to WebP, persists to Cloudinary/Disk, updates `profilePhoto`. | 200 OK with signed media URL. UI refreshes avatar thumbnail. |
| **Biodata Generation** | `src/pages/BiodataPage.jsx` | `api('/profiles/me')` | `GET /api/profiles/me` (`protect`) | `profileController.getMyProfile` | None. Reads `biodataPrivacy` settings to selectively filter contact/asset sections. | Clean, printable, high-aesthetic Rajputana biodata card with QR code and print stylesheet. |

---

## 3. Journey 3: Discovery, Multi-Criteria Search & Privacy Enforcement

| Stage | Frontend Component | Client API Call | Backend Route & Middleware | Controller / Service | Database Mutation | Resulting State |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Discovery Query** | `src/pages/DiscoverPage.jsx` | `api('/profiles/discover?page=1&limit=12&gender=...&district=...&clan=...&ageMin=...&ageMax=...')` | `GET /api/profiles/discover` (`protect`, `maintenanceGuard`) | `profileController.discover` -> `sameSurnameMongoExclusion` -> `clearExpiredProfileBoosts` -> `serializeProfileForViewer` | Queries `MatrimonialProfile` with `$nin: [mine, myBlocked, blockedBy]`. Excludes same surname. Applies boosted sort order (`boostedUntil: -1`). | Paginated candidate cards returned. Private fields (contact, maternal lineage, assets) stripped based on relationship context. |
| **Candidate Inspection** | `src/pages/ProfilePage.jsx` (`/profile/:profileId`) | `api('/profiles/:profileId')` | `GET /api/profiles/:profileId` (`protect`) | `profileController.getProfileByProfileId` -> `relationshipContext` -> `serializeProfileForViewer` | Logs a `ProfileView` event in `Business.ProfileView` if viewer is distinct member. | Candidate profile presented with relationship-appropriate redactions (e.g., "Locked until Interest Accepted"). |

---

## 4. Journey 4: Interactions (Interest, Match, Shortlist, Contact Unlock)

| Stage | Frontend Component | Client API Call | Backend Route & Middleware | Controller / Service | Database Mutation | Resulting State |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Send Interest** | `ProfileCard.jsx` / `ProfilePage.jsx` | `api('/interests', { method: 'POST', body: { receiverProfileId } })` | `POST /api/interests` (`protect`, `maintenanceGuard`, `checkInterestLimit`) | `interactionController.sendInterest` -> `entitlementService.consumeInterest` | Creates `Interest` (status: `Pending`). Decrements available interest count in `PlanUsage`. Dispatches `Notification` and Socket.IO event. | 201 Created. Button state updates to "Interest Sent". Receiver's badge increments. |
| **Accept Interest** | `src/pages/CollectionPage.jsx` (`type="interests"`) | `api('/interests/:id/accept', { method: 'POST' })` | `POST /api/interests/:id/accept` (`protect`) | `interactionController.respondInterest` | Updates `Interest` status to `Accepted`. Creates bilateral `Match` (status: `Active`). Sends notification. | 200 OK. Profiles now qualify for `AcceptedInterests` privacy visibility. |
| **Shortlist Profile** | `ProfileCard.jsx` | `api('/shortlist', { method: 'POST', body: { targetProfileId } })` | `POST /api/shortlist` (`protect`) | `interactionController.toggleShortlist` | Upserts or removes `Shortlist` document for user profile. | 200 OK. Bookmark icon toggles active state. Shortlist counter updates. |
| **Request / Unlock Contact** | `ProfilePage.jsx` | `api('/contact-requests', { method: 'POST', body: { targetProfileId } })` | `POST /api/contact-requests` (`protect`, `checkContactViewLimit`) | `businessController.requestContact` -> `entitlementService.consumeContactView` | Creates `ContactRequest`. When accepted, stamps `requesterUnlockedAt`. Deducts contact unlock entitlement. | Phone and residential address unlocked and rendered for authorized member. |

---

## 5. Journey 5: Commercial Membership & Boost Packs

| Stage | Frontend Component | Client API Call | Backend Route & Middleware | Controller / Service | Database Mutation | Resulting State |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Initiate Order** | `src/pages/MembershipPage.jsx` | `api('/payments/orders', { method: 'POST', body: { planId } })` | `POST /api/payments/orders` (`protect`, `paymentLimiter`) | `membershipController.createOrder` -> `paymentService.createOrder` | Checks if active subscription exists (prevents duplicate purchase). Creates `Payment` (status: `Created`). Reuses unexpired recent orders. | Returns Razorpay order details (`orderId`, `amount`, `currency`, `keyId`). |
| **Gateway Verification** | Razorpay Checkout Modal -> `MembershipPage.jsx` | `api('/payments/verify', { method: 'POST', body: { razorpay_order_id, razorpay_payment_id, razorpay_signature } })` | `POST /api/payments/verify` (`protect`, `paymentLimiter`) | `membershipController.verify` -> `paymentService.verifyCheckout` -> `activatePayment` | Validates HMAC-SHA256 signature with `crypto.timingSafeEqual`. Locks payment, transitions status to `Paid`. Creates `Subscription` with plan snapshot. Grants bonus boost credits. | 200 OK. User membership upgraded, badge displayed in sidebar, entitlement usage reset. |
| **Razorpay Webhook** | Razorpay Server-to-Server | Raw POST payload + `x-razorpay-signature` | `POST /api/payments/webhook` (Raw body parser) | `membershipController.razorpayWebhook` -> `paymentService.verifyWebhook` -> `activatePayment` | Replay-resistant idempotent activation. If payment already `Paid`, safely no-ops. If pending, activates subscription and audit logs. | 200 OK received by gateway. |
| **Profile Boost** | `src/pages/BoostPage.jsx` | `api('/profile-boost/activate', { method: 'POST' })` | `POST /api/profile-boost/activate` (`protect`, `maintenanceGuard`) | `boostController.activateBoost` -> `boostService.activateProfileBoost` | Atomically consumes 1 credit from earliest expiring grant. Stamps `MatrimonialProfile.boostedUntil = now + duration`. Preserves original `updatedAt`. | 200 OK. Profile elevates to top rank in Discovery and Recommendations. |

---

## 6. Journey 6: Administrative Moderation & Operations

| Stage | Frontend Component | Client API Call | Backend Route & Middleware | Controller / Service | Database Mutation | Resulting State |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Review Profile** | `src/pages/admin/AdminPage.jsx` (`Queue` / `Review`) | `api('/admin/profiles/:id/decision', { method: 'POST', body: { decision: 'approve'|'reject', reason } })` | `POST /api/admin/profiles/:id/decision` (`protect`, `permit('moderator','admin','super_admin')`) | `adminController.moderateProfile` | Sets `verification.adminVerified = true`, `lifecycleStatus = 'Active'`. If rejected, records note and notifies user. Appends `AuditLog`. | Profile becomes visible in public search. Member notified via email and in-app alert. |
| **Customer 360 & Role Escalation** | `src/pages/admin/CustomerOperationsPage.jsx` | `api('/admin/users/:id/role', { method: 'POST', body: { role } })` | `POST /api/admin/users/:id/role` (`protect`, `permit('super_admin')`) | `adminController.changeUserRole` | Validates caller is SuperAdmin. Prevents demoting the last active SuperAdmin. Updates `User.role`. Increments `tokenVersion` to force re-login. Records `AuditLog`. | Role updated. Target user required to authenticate under new privileges. |
| **Success Story Moderation** | `src/pages/admin/StoryModerationPage.jsx` | `api('/admin/success-stories/:id/decision', { method: 'POST', body: { status: 'Approved'|'Rejected', reviewNotes } })` | `POST /api/admin/success-stories/:id/decision` (`protect`, `permit('admin','super_admin')`) | `successStoryController.moderateStory` | Requires partner consent to be `Verified` before approval is permitted. Sets `status = 'Approved'`, `publishedAt = now`. Creates `AuditLog`. | Story becomes publicly viewable on `/success-stories`. |
