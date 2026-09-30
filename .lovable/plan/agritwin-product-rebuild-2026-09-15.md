# AgriTwin product rebuild

## Goal

Replace the visible expense-management template with a cohesive AgriTwin application using the same dark, animated green theme as the sign-in experience. The result will feel designed for Kenyan smallholder farmers and work across desktop, tablet, and mobile.

## What will be built

### 1. Complete the account journey
- Rebrand Login, Sign up, Forgot password, and Reset password consistently as AgriTwin.
- Add preferred-language and phone fields to registration.
- Add a clear email verification state and return confirmed users to the correct next step.
- Send new farmers into onboarding rather than the old dashboard.

### 2. Guided farm onboarding
- Create a responsive four-step flow:
  1. Farmer information
  2. Farm information, crops, varieties, and planting stage
  3. Satellite farm mapping with location search, boundary drawing controls, imagery, calculated area, and confirmation
  4. Farm structure tagging for crop zones, buildings, water, irrigation, storage, and access points
- Preserve progress while moving between steps.
- Finish with a clear “digital twin ready” handoff into the product.

### 3. Replace the old signed-in shell
- Replace Expense It branding, expense navigation, receipt upload actions, and admin/persona controls.
- Create AgriTwin navigation for Overview, Digital Twin, Crop Health, Markets, Financing, Assistant, and Profile.
- Use a compact desktop rail and a practical mobile bottom bar with an overflow menu.

### 4. Build the main AgriTwin experience
- Overview: farm health summary, weather, disease-risk alert, crop progress, market opportunity, and finance readiness.
- Digital Twin: an interactive-looking satellite/farm visualization with layers, zones, farm assets, and live status.
- Crop Health: NDVI/NDRE trend chart, disease-risk cards, environmental conditions, and image diagnosis upload flow.
- Markets: Kenyan market price comparison, trend indicators, and best-selling opportunity.
- Financing: farmer readiness profile and matched SACCO/agricultural loan cards.
- Assistant: localized text/voice conversation interface with contextual farm prompts.
- Profile: farmer, farm, language, notification, and connected-data settings.

### 5. Visual and usability system
- Keep the login theme: deep charcoal, emerald crop-health accents, translucent surfaces, and subtle animated green atmosphere.
- Add restrained soil-gold and warning-red accents for market and risk information.
- Use clear professional typography, accessible contrast, large touch targets, and stable responsive layouts.
- Use semantic icons, cards only for discrete information, meaningful motion, and reduced-motion support.

## Technical details

- Keep the existing TanStack Start and Lovable Cloud authentication setup.
- Use route-level metadata for every new content page.
- Reuse the current design tokens, button system, charts, and motion library.
- Keep this phase focused on the production-quality interface and connected navigation; farm analytics, satellite boundaries, IoT readings, disease inference, and financing matches will use realistic demo states until their external data services are connected.
- Remove old expense terminology from all user-facing primary screens without deleting unrelated backend data.
- Verify sign-in, onboarding navigation, all new routes, and desktop/mobile rendering in the browser.

## Scope boundary

- No live satellite provider, IoT broker, disease model, market feed, or lender API connection in this pass.
- No destructive database migration or deletion of the previous expense records.
