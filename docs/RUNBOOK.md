# Operations runbook

## Daily operations

Run `npm run subscriptions:expire` from `server/` once daily. The command is idempotent: it expires elapsed subscriptions and records each 7-day/1-day reminder before sending it. Alert on non-zero exit, provider errors, elevated HTTP 5xx, payment webhook failures, database disconnects, and repeated authentication throttling.

## Payment incident

1. Disable new payments in Admin → System Settings.
2. Preserve request IDs, Razorpay order/payment IDs, and webhook event IDs; never log card data or secrets.
3. Reconcile Razorpay with the Payments view. Paid membership is granted only by verified checkout signatures or verified webhooks.
4. Re-enable payments only after a signed staging transaction succeeds.

## Maintenance and rollback

Enable maintenance mode before incompatible migrations; administrators retain access. Deploy the prior immutable release to roll back application code. Do not reverse a data migration until a reviewed restore/migration plan exists. Confirm `/api/health`, `/api/ready`, login, discovery, and payment creation after recovery.

## Access and backups

Create super admins interactively with `npm run admin:create -- --email admin@example.com`. Do not pass passwords as command arguments. Test database restore procedures at least quarterly and after material schema changes.
