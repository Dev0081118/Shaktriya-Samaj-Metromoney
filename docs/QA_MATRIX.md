# QA matrix

| Area | Required staging checks |
| --- | --- |
| Registration | Disabled switch; unchecked legal consent rejected; accepted versions stored; duplicate email/phone |
| Authentication | Login/logout; wrong password; reset expiry and attempt limit; password-change notice |
| Profiles | Draft/review/approve/reject; privacy roles; pause/married; gallery limit and deletion |
| Discovery | Basic filters on Free; advanced filters rejected server-side; boost ordering; blocks excluded |
| Interactions | Duplicate/self/blocked interest; limits; accept/decline; match; notifications/email preferences |
| Contact | Mutual match required; each party explicitly unlocks; allowance charged once; contact hidden beforehand |
| Membership | Cancelled/failed checkout; signed success; webhook replay; same-plan extension; upgrade; snapshot stability; expiry |
| Admin | Every role’s navigation/API permissions; last-super-admin protection; audit entries; plan CRUD/settings |
| Operations | Maintenance bypass for staff; provider diagnostics; health/readiness; expiry job replay |
| Responsive/accessibility | 375px, tablet, desktop; keyboard flow; focus; labels; errors; contrast; reduced motion |

Record browser/device, build SHA, tester, timestamp, evidence, and defect link for each run.
# Admin operations

- [ ] Member login lands on `/dashboard`; member admin API requests return 403.
- [ ] Moderator login lands on `/admin`; customer, payment, and revenue operations return 403.
- [ ] Admin/super-admin login lands on `/admin`; no matrimonial profile is required.
- [ ] Relationship-manager login lands on `/manager` and only assigned clients are returned.
- [ ] Customer search and URL-backed filters survive refresh/back navigation.
- [ ] Customer 360 shows account, profile, membership, payments, activity, support, notes, and audit context.
- [ ] Suspension/block requires a reason, uses the in-app confirmation dialog, and creates an audit event.
- [ ] Captured revenue excludes Created/Failed payments and subtracts refunded amounts from net captured revenue.
- [ ] Registration, payments, and maintenance settings are enforced by backend routes.
- [ ] Provider health exposes configuration state without keys or secrets.
