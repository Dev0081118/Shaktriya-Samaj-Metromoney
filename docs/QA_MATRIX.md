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
