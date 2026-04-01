# Maulya Static Site Rebuild Notes

## Scope

This build applies the founder-approved commercial direction to the static `maulya.in` site:

- trial-first public CTA
- pricing promoted publicly
- survey preserved as the canonical public survey at `/survey/`
- updates remain app-hosted for full reading and participation
- static site stays useful even if the app is unhealthy

## Live linkage status

The static site now states that:

- beta pricing is early-access pricing
- the first `50` firms receive beta access
- later firms join the waitlist

That commercial behavior is now enforced in the V3 auth flow. The marketing site points to the real signup route at:

- `https://app.maulya.in/auth/sign-up`

The app or API side now owns:

- first-50-firms beta-cap enforcement
- waitlist creation for later public signups
- waitlist return handling for later sign-ins and auth callback flows
- the waitlist confirmation page stating "You've joined the waitlist."

## Still intentionally softened on the static site

The static site does not promise exact day-count or report-credit trial mechanics yet. Those detailed beta entitlements still need a separate app-side implementation before they can be marketed as hard guarantees.

Because of that, this rebuild deliberately avoids exact public claims such as:

- `7 days`
- `3 report credits`
- survey-based extension numbers

The pricing page still shows the real commercial plans and credit model, but beta onboarding allowances are left to the live app flow until that implementation lands.

## Survey page note

The survey experience at `/survey/` is preserved as a standalone full-screen experience because it uses its own custom static shell and Google Apps Script submission flow. It remains the canonical survey, but it is no longer the main public homepage gate.
