# Kshatriya Matrimonial Society

The repository includes a role-aware operations console. See [Admin Operations](docs/ADMIN_OPERATIONS.md) for permissions, customer-support workflows, payment/revenue rules, moderation, settings, and audit behavior.

A web-first, privacy-conscious matrimonial platform for Kshatriya and Rajput families. The existing editorial homepage is preserved and extended with a complete React application foundation and a separate Express/MongoDB REST API.

## What is included

- Luxury public homepage, responsive member shell, authentication and route guards
- Ten-step persisted matrimonial onboarding with account/profile separation
- MongoDB-driven dashboard, filtered discovery, profiles, shortlist, interests and mutual-match flows
- Partner preferences, backend privacy filtering, block/report foundations and notifications
- Profile completion, protected local image upload abstraction and printable digital biodata
- Membership plans and a safe payment-order abstraction (mock orders never auto-succeed)
- Role-protected admin overview and profile moderation
- MongoDB seed data with fictional profiles and editable plan records
- Consistent responses, JWT authorization, bcrypt hashing, Helmet, CORS and rate limiting

## Repository structure

```text
src/
  components/       public and reusable UI
  context/          authentication state
  data/             visual fallback/demo content
  layouts/          member application shell
  pages/            public, member, onboarding and admin screens
  services/         centralized API client
server/
  src/
    config/         MongoDB connection
    controllers/    request handlers
    middleware/     JWT roles and safe uploads
    models/         users, profiles, interactions, plans and payments
    routes/          REST routing
    services/        OTP and payment abstractions
    utils/           responses, completion and compatibility
  uploads/           development-only local image storage
```

## Frontend setup

Requires Node.js 20+.

```bash
cd /Users/divyarajsinhrana/Desktop/Shaktriya-Samaj-Metromoney
npm install
cp .env.example .env
npm run dev
```

Frontend: `http://localhost:5173`

## Backend setup

Run MongoDB locally or provide a MongoDB Atlas connection string.

```bash
cd /Users/divyarajsinhrana/Desktop/Shaktriya-Samaj-Metromoney/server
npm install
cp .env.example .env
npm run seed
npm run dev
```

Backend: `http://localhost:3001`  
Health check: `http://localhost:3001/api/health`

## Environment variables

Frontend: `VITE_API_URL=http://localhost:3001/api`

Backend variables are documented in `server/.env.example`: `PORT`, `NODE_ENV`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, the OTP variables, Cloudinary variables, and Razorpay variables. Never commit populated `.env` files.

## Development seed credentials

| Role | Email | Password |
|---|---|---|
| Super admin | `admin@ksm.dev` | `Admin@123` |
| Member | `rajveer@ksm.dev` | `Member@123` |
| Member | `devika@ksm.dev` | `Member@123` |

The idempotent seed upserts only the named development accounts, their profiles, testing interactions, and the four plan slugs; it does not clear unrelated data. Do not use development credentials in production.

The authenticated product does not use frontend demo profile or plan data. Member screens load through the REST API, including dashboard metrics, recommendations, profiles, interests, matches, shortlist, notifications, settings, membership plans and biodata. The admin overview, moderation queue, users, reports and subscriptions are API-driven.

Additional endpoints include `GET /api/dashboard`, `GET /api/matches`, `GET/PUT /api/preferences`, `PATCH /api/profiles/privacy`, `PATCH /api/profiles/pause`, `GET/DELETE /api/blocks`, `PATCH /api/auth/change-password`, and protected admin resources for users, reports, subscriptions and individual profile reviews.

## Development fallbacks and external providers

- OTP: `OTP_PROVIDER=development|twilio|msg91`. Development codes are hashed in MongoDB, expire after ten minutes, and are logged locally. Production adapters fail safely when credentials are incomplete.
- Images: `MEDIA_PROVIDER=local|cloudinary`. JPG/PNG/WebP files up to 5 MB use local storage in development and signed Cloudinary uploads in production.
- Payments: Razorpay orders use server credentials. Checkout signatures and raw-body webhooks are verified before an idempotent subscription activation. Without keys, development creates a `Created` mock order that can never activate membership.
- Email: `EMAIL_PROVIDER=development|resend`. Delivery is non-blocking and provider failures are logged without failing the member action.

## Security notes

The current web client keeps the JWT in `localStorage` for compatibility with the existing API. This makes strict XSS prevention important: keep third-party scripts to a minimum, maintain a restrictive Content Security Policy at the reverse proxy, and never render untrusted HTML. A future cookie migration should use secure HTTP-only cookies, `SameSite` controls, and CSRF protection as one coordinated change rather than a partial migration.

Authentication and OTP endpoints are rate-limited. Uploads are type- and size-limited, API bodies are capped, ObjectIds and ownership are checked in sensitive routes, role checks are server-side, private contact data is released only after an accepted contact request, and payment success is never trusted from the browser.

## Production integrations

Configure `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`, then point Razorpay at `POST /api/webhooks/razorpay`. Configure Cloudinary, OTP and email variables from `server/.env.example`. The readiness endpoint is `GET /api/ready` and returns 503 until MongoDB is connected.

## Verification

```bash
npm run build
npm run lint
cd server && npm run check
```
