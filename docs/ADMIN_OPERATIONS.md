# Admin Operations

The administrative application is the operational control center for Kshatriya Matrimonial Society. Backend authorization is authoritative; navigation visibility is only a usability layer.

## Roles and landing pages

- `member` lands on `/dashboard` and can use only the matrimonial product.
- `relationship_manager` lands on `/manager` and sees only assigned Assisted clients.
- `moderator` lands on `/admin` and can access profile moderation and safety reports.
- `admin` lands on `/admin` and can operate customers, support, subscriptions, payments, moderation, reports, and relationship-manager assignments.
- `super_admin` lands on `/admin` and additionally controls plans, roles, settings, health, revenue analytics, and audit logs.

Staff accounts do not require a `MatrimonialProfile`. Member routes redirect staff to their role home.

## Customer support workflow

Open **Customers**, search by email, phone, name, profile ID, or—for super admins—provider payment/order ID, and open Customer 360. It combines account and verification state, profile visibility, subscription history, payments, matrimonial activity, support tickets, relationship-manager assignment, internal notes, and relevant audit events.

Account activation, suspension, and blocking are validated server-side. Suspensions and blocks require a reason and every change creates an `AuditLog`. Internal customer notes are staff-only and are never included in member APIs.

## Moderation and safety

Moderators review the pending queue and may approve, request changes, reject, or hide a profile. Negative decisions should include a moderation note. Decisions create a notification, email attempt, and audit record. Reports can be reviewed, resolved, or dismissed from the safety queue.

## Payments, revenue, and subscriptions

Only verified `Paid` payments with `verifiedAt` contribute to captured revenue. `Created` and `Failed` payments never count as revenue. Refunded records are reported separately and subtracted for net captured revenue. There is intentionally no “Mark Paid” operation; payment success originates from provider verification/webhooks.

Subscriptions retain plan and entitlement snapshots so later plan edits do not rewrite historical contracts. Relationship managers can be assigned only to active members whose entitlement snapshot includes the service.

## Plans, settings, and health

Plans are created or edited by super admins and should be deactivated instead of deleted when historical subscriptions refer to them. System settings enforce registration, payments, maintenance mode, maximum photos, and public support information at the API layer. Secrets remain environment variables. Health endpoints expose only availability/configuration state, runtime environment, and uptime.

## Audit logs

High-impact events record actor, action, entity type, entity ID, timestamp, request ID when available, and bounded metadata. Typical actions include `user.suspended`, `user.blocked`, `role.changed`, `profile.approve`, `support.updated`, `system.settings.updated`, and `relationship-manager.assigned`.

## Emergency boundary

Routine customer, profile, payment, subscription, support, moderation, plan, and assignment work belongs in the UI. Direct database/server access remains reserved for migrations, deployment, recovery, and engineering incidents.
