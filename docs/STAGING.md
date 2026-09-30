# Staging setup

Use a separate database, Razorpay test-mode account, SMS test sender, Resend test domain, and Cloudinary folder. Copy both `.env.example` files and replace every placeholder. Production startup intentionally fails when core settings or development-only providers remain.

Configure the frontend with `VITE_API_URL` and `VITE_APP_URL`; configure the API with `CLIENT_URL`, a strong `JWT_SECRET`, legal version/effective date, and all provider secrets. Expose the Razorpay webhook at `/api/webhooks/razorpay` and subscribe to captured, failed, and refund events.

Before the production build, run `npm run sitemap` with the production `VITE_APP_URL` so every sitemap entry is an absolute HTTPS URL.

After deployment, run API readiness checks, create a non-demo super admin, seed only non-production environments, complete the QA matrix, perform one signed payment, confirm the webhook replay is harmless, and verify the expiry task scheduler.
