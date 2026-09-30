# Launch checklist

## Required approvals

- [ ] Counsel has approved the Terms, Privacy Policy, refund policy, consent wording, retention policy, and effective dates. Until then the legal pages remain clearly labelled as pre-launch drafts.
- [ ] Razorpay live account, webhook URL, signing secrets, refund ownership, and a real low-value payment/refund have been verified.
- [ ] Production SMS, email, and Cloudinary credentials pass the admin provider diagnostics.
- [ ] DNS, TLS, production `CLIENT_URL`, API URL, and an absolute sitemap base URL are configured.
- [ ] Database backups and a restore rehearsal are complete.

## Release gate

- [ ] `npm run lint && npm run build && npm test`
- [ ] `cd server && npm run check && npm test`
- [ ] QA matrix completed on staging at mobile and desktop widths.
- [ ] A super admin was created with `npm run admin:create -- --email ...`; demo seed credentials are absent.
- [ ] The subscription expiry command is scheduled daily and monitored.
- [ ] Error logs, uptime checks, provider alerts, and on-call ownership are configured.
- [ ] Maintenance mode and rollback have been rehearsed.

No unchecked item above should be treated as implicitly complete.
