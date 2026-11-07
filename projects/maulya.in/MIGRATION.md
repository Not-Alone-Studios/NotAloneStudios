# Maulya Public Site Hosting Notes

This project contains the external static marketing/public site for:
- `maulya.in`
- `www.maulya.in`

It is intentionally separate from the application runtime.

## Host ownership

- `maulya.in` and `www.maulya.in`
  - static marketing/public site
  - product pages, pricing framing, updates discovery, policies, pilot/contact entry
- `app.maulya.in`
  - workspace shell
  - live onboarding and request-access flows
  - public updates reader
  - public account/comment/admin participation flows
- `auth.maulya.in`
  - browser auth origin
- `demo.maulya.in`
  - demo/evaluation lane

## Source of truth

- editable source pages live in `projects/maulya.in/src/`
- deploy mirrors are generated from that source:
  - `projects/maulya.in/public_clean/`
  - `projects/maulya.in/public_hostinger/`
  - `projects/maulya.in/Maulya_hostinger_ready/`

Do not treat a deploy mirror as the canonical place to edit the site.

## Static deployment model

The public site is meant to stay plain static HTML/CSS/JS for easier server hosting and lower DNS/runtime complexity.

Key implications:
- no app rebuild here
- no duplication of workspace flows here
- public CTAs should route into the correct live hosts
- articles live on this site at `/blog/`, built from Markdown (the old `/updates/` redirects there)

## Important public-route expectations

Primary internal routes on the static site:
- `/`
- `/product/`
- `/solutions/`
- `/pricing/`
- `/updates/`
- `/associates/`
- `/demo/`
- `/pilot/`
- `/survey/`
- `/privacy/`
- `/terms/`

Primary external/product links:
- workspace: `https://app.maulya.in/`
- sign up: `https://app.maulya.in/auth/sign-up`
- associate access: `https://app.maulya.in/auth/sign-up?mode=associate`
- pilot contact: `mailto:support@maulya.in?subject=Maulya%20pilot%20request`
- updates reader: `https://app.maulya.in/updates`
- updates account: `https://app.maulya.in/updates/account`
- sign in: `https://app.maulya.in/auth/sign-in`
- demo: `https://demo.maulya.in/`

## Publishing flow (since Nov 2026)

1. Edit `src/`, `content/blog/` or `site.config.mjs`
2. Run `node build/build.mjs` (it writes the mirrors and both zips)
3. Upload `Maulya_hostinger_ready.zip` to Hostinger (the card: `~/Downloads/Maulya/3_DEPLOY/CARD_MAULYA_IN_SITE_2026-11.md`)
4. The way back: `rollback/Maulya_hostinger_ready_before_2026-11.zip` is the zip that was live before the rebuild

## DNS / routing reminders

Expected DNS targets:
- `A maulya.in -> [STATIC_HOST_OR_VPS]`
- `A www.maulya.in -> [STATIC_HOST_OR_VPS]`
- `A app.maulya.in -> [VPS_IP]`
- `A auth.maulya.in -> [VPS_IP]`
- `A demo.maulya.in -> [VPS_IP]`

## Public-site policy positioning

This repo can expose privacy/terms visibility and public disclaimers, but authoritative product/account/comment acceptance may still happen on the app host where the interaction actually occurs.
