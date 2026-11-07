# maulya.in build notes (Nov 2026 rebuild, MLP/ARK-668)

## One command
`node build/build.mjs` (Node 18+, no packages). Sources:
- `site.config.mjs`: **every app and survey address**, the "Start your firm" target, and the blog's publish rule. The host change is one line.
- `src/pages/*.mjs`: the pages (Home, Product, Who it's for, Pricing, About, Start, Privacy, Terms, 404). `src/assets/`: css, js, fonts (Atkinson Hyperlegible Next, OFL), brand, the app's pictures.
- `src/survey/index.html`: the canonical survey, kept as it was. Its Apps Script address comes from the config.
- `content/blog/*.md`: the blog (see `content/blog/README.md`).

It writes `public_clean/`, `public_hostinger/`, `Maulya_hostinger_ready/` and `Maulya_hostinger_ready.zip` (the live site), plus `Maulya_preview_all_posts.zip` (every post, never upload). The mirrors are generated: never edit them by hand.

## What the site may say
- Product lines trace to the app's review-mode screens (`~/V3` `main` 9a94cade8) or to Shrinivas's posts.
- Prices come from the app's plan list: `services/api/app/services/billing/catalogue.py` (Platform ₹2,000, Tier 1 ₹3,500 with 100 reports, Assisted ₹6,000 coming soon, Enterprise; 7 places, ₹500 an extra place; GST on top).
- Kept off the site until the founders say so: trial numbers, the founding-firm offer, the 50-firm cap (not enforced in the app: FUNNEL.md step 4), and the address lock (not in code).
- The phone's new design is shown as "in beta" (`PHONE_V2_ENABLED` is off in production).
- The line from the blogs stands everywhere: Maulya organises the work around the valuer's judgment; it does not decide a property's value.

## Pictures
- Only from the app's review mode: invented names, branches and places.
- Phone numbers were replaced with "+91 90000 00000" before each picture was taken.
- Screens showing real-looking borrower names (My Office, Reports, the phone's notifications) were left out.
- To retake them, see the shooter notes in `~/Downloads/Maulya/7_STATUS/LW.md`.

## Old addresses
`/solutions/` and `/associates/` go to `/for-whom/`, `/pilot/` to `/start/`, `/demo/` to `/product/`, and `/updates/` to `/blog/`. Each is a 301 in `.htaccess`, plus a small page for hosts that ignore it.
