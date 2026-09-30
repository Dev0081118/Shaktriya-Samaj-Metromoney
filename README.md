# Kshatriya Matrimonial Society

A web-first, privacy-conscious matrimonial platform for Kshatriya and Rajput families. The existing editorial homepage is preserved and extended with a complete React application foundation and a separate Express/MongoDB REST API.

## What is included

- Luxury public homepage, responsive member shell, authentication and route guards
- Ten-step persisted matrimonial onboarding with account/profile separation
- Dashboard, preference-based discovery, profiles, shortlist, interests and mutual-match flows
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

The idempotent seed upserts only the named development accounts, their profiles, and the four plan slugs; it does not clear unrelated data. Do not use development credentials in production.

## Development fallbacks and external providers

- OTP: outside production, a random six-digit code is hashed in MongoDB, expires after ten minutes, and is logged to the API console. Production fails safely until a provider adapter is configured.
- Images: validated JPG/PNG/WebP files up to 5 MB use `server/uploads`. Add the Cloudinary adapter before distributed production deployment.
- Payments: development creates a `Created` mock order only; it never marks payment successful. Razorpay checkout and verified webhooks remain deferred until credentials and business rules are supplied.
- Email/SMS delivery, real-time messaging, contact requests and production analytics are intentionally deferred provider integrations.

## Verification

```bash
npm run build
npm run lint
cd server && npm run check
```
