# UI/UX & Design Audit: Cultural Resonance, Usability & Accessibility

## 1. Design Direction: Heritage-Inspired Editorial Matrimony

The platform caters to the Rajput / Kshatriya community. Matchmaking in this community is an honored familial tradition characterized by dignity, reciprocal respect, lineage transparency, and deep cultural values.

### 1.1 Aesthetic Philosophy
- **Color Discipline**:
  - Sandstone / Warm Ivory (`#f5f0e8`): Reflects royal haveli architecture and fine parchment.
  - Deep Heritage Crimson (`#681d25`): Traditional royal color denoting auspicious celebration and honor.
  - Dark Maroon / Royal Umber (`#431318`): Anchor color for primary actions and active borders.
  - Antique Gold / Sandstone Ochre (`#91683f` / `#b38749`): Subtle heraldic accents without gaudy gradients.
  - Editorial Muted Slate (`#756a60`): Calm, legible auxiliary typography.
  - Pure Warm White (`#fffdf8`): Elevates content cards with clean contrast.
- **Typography Hierarchy**:
  - Display & Headings: `Cormorant Garamond` (English), `Noto Serif Gujarati` (Gujarati), `Noto Serif Devanagari` (Hindi).
  - Body & Form Controls: `Manrope` (English), `Noto Sans Gujarati` (Gujarati), `Noto Sans Devanagari` (Hindi).
  - All headings automatically adapt their serif family when the user switches between English, Gujarati, and Hindi via `html[lang='...']` stylesheet rules.

---

## 2. Screen-by-Screen UX Inventory

### 2.1 Public Homepage (`/`)
- **Primary Goal**: Establish immediate trust, explain community ethos, showcase genuine match finding capabilities, and guide eligible singles/parents to register.
- **Key Sections**:
  - Hero with dignified headline, cultural badge, and primary registration CTA
  - Quick Search widget filtering by Gender, Age range, Clan/Shakh, and Native District
  - Heritage narrative section highlighting verified Rajput lineage and privacy-first ethos
  - Success Stories showcase with verified couple consent badges
  - Verification & Trust pillar (Admin ID check, phone verification, privacy controls)
- **State Handling**:
  - Loading: Graceful inline shimmer
  - No stories: Informative placeholder welcoming couples to submit their story

### 2.2 Registration & Authentication (`/login`, `/register`, `/forgot-password`)
- **Primary Goal**: Frictionless onboarding while strictly establishing legal consent (Terms and Privacy Policy acknowledgment).
- **UX Features**:
  - Toggle between email or phone authentication
  - Password strength guidance (minimum 8 characters)
  - Explicit non-checked checkboxes for Terms of Service and Privacy Policy
  - Password reset with rate-limited OTP and secure new password form
  - Accessible error states highlighting field-specific issues rather than generic failures

### 2.3 Member Onboarding (`/onboarding`)
- **Primary Goal**: Complete an authentic, comprehensive matrimonial biodata across 7 logical stages without cognitive overload.
- **Stage Progression**:
  1. Profile For (Self, Son, Daughter, Brother, Sister) & Basic Identity
  2. Physical Attributes & Lifestyle (Height in cm, Diet, Habits)
  3. Rajput Heritage (Clan/Shakh, Gotra, Vansh: Suryavanshi, Chandravanshi, Agnivanshi, Nagvanshi)
  4. Native Roots (Native Village/Place, Taluka, District in Gujarat/Rajasthan, State)
  5. Education & Profession (Degree, University, Designation, Income Bracket)
  6. Family Background & Assets (Paternal lineage, Maternal lineage, Land ownership, Properties)
  7. Privacy Tiers & Photo Upload
- **Persistence**: Auto-saves on step navigation; allows returning later without losing progress.

### 2.4 Member Dashboard (`/dashboard`)
- **Primary Goal**: Actionable, honest operational cockpit for the active matrimonial search.
- **Elements**:
  - Profile Completeness Meter with direct link to missing sections
  - Actionable metric counters: Received Interests (Pending), Mutual Matches, Shortlisted Candidates, Unread Notifications, 30-Day Profile Views
  - Match Recommendations: Filtered and ranked by matching engine with verified compatibility reasons (shared native district, compatible dietary habits, education match)
  - Plan Entitlement Meter: Real-time display of remaining interests and contact views
  - Quick shortcuts to Edit Profile, Biodata, Settings, and Discovery

### 2.5 Discovery & Search (`/discover`)
- **Primary Goal**: Multi-dimensional candidate discovery respecting community traditions and personal preferences.
- **Controls**:
  - Text search across name, village, native place, profession, education
  - Dedicated dropdowns for Clan/Shakh, Gotra, Vansh, Native District, Marital Status
  - Age and Height sliders / range selectors
  - Toggle for "Verified Profiles Only" and "With Photograph Only"
  - Server-side exclusion of same-surname/forbidden gotra candidates
  - Clean pagination with stable URL state

### 2.6 Member Profile View (`/profile/:id`)
- **Primary Goal**: Evaluate matrimonial compatibility with complete dignity and respect for family boundaries.
- **Information Architecture**:
  - Primary Hero: Verified badge, photos (with watermark protection and relationship gating), key vitals (Age, Height, Native Place, Clan)
  - Heritage & Lineage Tab: Clan, Gotra, Vansh, Paternal ancestral village, Maternal grandfather's clan (Mosal)
  - Education & Career Tab: Higher education, profession, current city
  - Family & Assets Tab: Father/Mother details, sibling status, agricultural land status, residential properties (gated by Accepted Interest / Mutual Match)
  - Contact Details Tab: Phone number, residential address, family representative contact (gated by Contact Unlock request)
  - Action Bar: Send Interest, Shortlist, Unlock Contact, Report Profile, Block Member

### 2.7 Biodata Generator (`/my-profile/biodata`)
- **Primary Goal**: Export or print an exquisite traditional Rajputana matrimonial biodata.
- **UX Features**:
  - Configurable disclosure toggles: include/exclude sensitive family assets, astrology details, or contact information
  - Elegant borders featuring subtle heritage architectural motifs
  - Direct Print stylesheet optimizing layout for A4 page printing or PDF generation

### 2.8 Commercial Membership & Boosts (`/membership`, `/boosts`)
- **Primary Goal**: Transparent commercial options with zero deception.
- **UX Features**:
  - Side-by-side comparison of Free, Premium, and Royal / Assisted plans
  - Feature matrix clearly displaying interest limits, contact view limits, and relationship manager inclusion
  - Boost wallet showing available credits, active boost countdown timer, and pack purchase options
  - Razorpay checkout integration with explicit currency indicators (`INR`) and GST transparency

### 2.9 Administrative & Moderation Console (`/admin/*`)
- **Primary Goal**: Mission-critical operational tool for platform stewards and moderators.
- **Features**:
  - Role-scoped sidebar navigation (Moderator vs. Admin vs. SuperAdmin)
  - Moderation queue with side-by-side photo inspection, name check, and mandatory decision notes
  - Safety Reports queue with resolve/dismiss actions
  - Customer 360 inspector providing complete audit trail of customer lifecycle
  - Financial ledger tracking captured revenue and processed refunds
  - SuperAdmin system settings and health probes

---

## 3. Accessibility & Responsive Verification

### 3.1 Keyboard Navigation & Focus Visibility
- All interactive controls (buttons, links, form inputs, modal closures) feature high-contrast focus rings (`focus-visible:ring-2 focus-visible:ring-[#681d25]`).
- Modal dialogs trap focus and release on `Escape` key.
- Mobile drawer (`AppSidebar`) closes on `Escape` and background click with body scroll lock.

### 3.2 Responsive Breakpoints
- **Mobile (<768px)**: Single column layouts, touch-friendly tap targets (minimum 45px height), slide-over mobile navigation drawer, fixed bottom action bars on candidate profiles.
- **Tablet (768px - 1024px)**: 2-column discovery grids, collapsible sidebar.
- **Desktop (>1024px)**: 3-column discovery grids, pinned/expandable sidebar navigation, side-by-side moderation review panes.
