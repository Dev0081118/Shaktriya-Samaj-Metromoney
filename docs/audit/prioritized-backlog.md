# Prioritized Implementation Backlog

## Backlog Classification
- **P0**: Critical security, data integrity, or release-blocking defects.
- **P1**: Core product correctness, workflow integrity, and data persistence issues.
- **P2**: Major UX, accessibility, operational ergonomics, and reliability enhancements.
- **P3**: Visual polish, subtle motion refinements, and non-essential convenience features.

---

## 1. Backlog Items

### ITEM-P0-01: Admin Navigation Integrity & Redundant Link Elimination
- **Severity**: P0 / P1
- **Component**: `src/pages/admin/AdminPage.jsx`
- **Evidence**: Line 2248 contains `<Link to="/admin/success-stories" className="mb-5 inline-flex rounded-full border border-[#CBB8A4] px-5 py-2 text-sm text-[#681D25]">Review success stories</Link>` statically rendered above the sub-route switch on every admin page. It duplicates the sidebar item already in `AdminNav.jsx` and disrupts layout hierarchy.
- **Impact**: Inconsistent UI, broken spacing, and visual clutter for operational staff.
- **Fix**: Remove redundant unstyled link from `AdminPage.jsx` and ensure `AdminNav.jsx` appropriately highlights the active route.
- **Acceptance Criteria**: Admin layout renders cleanly without floating duplicate links.

### ITEM-P0-02: Test Runner Concurrency Optimization for Mongoose Isolation
- **Severity**: P0 (Build & Testing Reliability)
- **Component**: `server/package.json`
- **Evidence**: `npm test` runs `node --test` which executes test files concurrently. When test files tear down connections via `mongoose.disconnect()`, concurrent suites hang waiting for reconnection.
- **Impact**: False negative test timeouts and stalled CI pipelines.
- **Fix**: Configure `"test": "node --test --test-concurrency=1"` in `server/package.json`.
- **Acceptance Criteria**: Running `npm test` inside `server` executes all test files sequentially without cross-test connection drops.

### ITEM-P1-01: Cleanup of Obsolete Temporary Files
- **Severity**: P1
- **Component**: `src/pages/admin/AdminPage.test.jsx.before-task004-fix`
- **Evidence**: File exists on filesystem as orphaned dead code from a prior debugging step.
- **Impact**: Codebase clutter, potential confusion for future maintainers.
- **Fix**: Safely remove `AdminPage.test.jsx.before-task004-fix` after verifying `AdminPage.test.jsx` is healthy and passing.
- **Acceptance Criteria**: Repository contains no stale backup files.

### ITEM-P1-02: Customer Search Input Sanitization Consistency
- **Severity**: P1
- **Component**: `server/src/controllers/adminController.js`
- **Evidence**: Verify that all query regexes in `adminController.js` and `relationshipManagerController.js` utilize `escapedRegex` to safeguard against malicious ReDoS inputs.
- **Impact**: Denial of Service vulnerability if staff enters unescaped regex metacharacters.
- **Fix**: Ensure `escapedRegex` is applied across all search endpoints.
- **Acceptance Criteria**: Search queries containing characters like `.*+?^${}()` execute without regex parsing errors or CPU spikes.

### ITEM-P2-01: Enhanced Mobile Sidebar Touch Ergonomics
- **Severity**: P2
- **Component**: `src/components/ui/AppSidebar.jsx`, `src/styles/sidebar.css`
- **Evidence**: Touch dismiss on mobile overlay and accessible ARIA attributes (`aria-expanded`, `aria-label`) should have explicit test assertions.
- **Impact**: Screen reader accessibility and mobile UX consistency.
- **Fix**: Verify ARIA attributes on sidebar trigger and drawer overlay.
- **Acceptance Criteria**: Lighthouse/Axe accessibility check reports zero violations for navigation sidebar.

### ITEM-P2-02: Editorial Visual Hierarchy & Contrast Verification
- **Severity**: P2
- **Component**: `src/components/Hero.jsx`, `src/components/MatchShowcase.jsx`, `src/index.css`
- **Evidence**: Verify color contrast of muted text (`#756a60`) against warm ivory background (`#f5f0e8`) meets WCAG AA 4.5:1 ratio for standard text.
- **Impact**: Readability for elderly family members and users on low-contrast screens.
- **Fix**: Ensure font weights and shades comply with WCAG 2.1 AA standards.
- **Acceptance Criteria**: All body copy satisfies minimum 4.5:1 contrast ratio.

### ITEM-P3-01: Smooth Transition Polish for Profile Card Interactions
- **Severity**: P3
- **Component**: `src/components/ui/ProfileCard.jsx`
- **Evidence**: Hover micro-interactions and image transitions can be made more responsive and tactile.
- **Impact**: Premium, bespoke feeling reflecting high-end editorial product standards.
- **Fix**: Add subtle hover elevation and smooth image scale transitions with `transform-gpu`.
- **Acceptance Criteria**: 60fps smooth animations without layout thrashing.
