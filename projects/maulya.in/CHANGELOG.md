# Changelog - maulya.in

## [2026-11-07] - "Apply for early access" (MLP/ARK-683)
- The site's one gold button is now "Apply for early access" (header, hero, the end of Home, Product, Who it's for, Pricing, About and each article; also the footer and the survey's last screen). "Start your firm" is gone.
- One setting, `earlyAccess: { formUrl, open }` in `site.config.mjs`. Empty `formUrl`: buttons go to `/early-access/` and the build warns loudly. Set: buttons go straight to the Google Form, same tab. `open: false`: "Applications are closed".
- New `/early-access/` page (10 to 15 valuation firms chosen from the applications; free for six weeks; real use and feedback in return). `/start/` and `/pilot/` now 301 to it. Pricing has one line about it. Privacy has one sentence on what the application's details are used for.

## [2026-11-07] - The new maulya.in (MLP/ARK-668)
- New site in the app's own design language. Pages: Home, Product, Who it's for, Pricing, About, Start, Blog, Survey, Privacy, Terms, 404.
- Pictures are the current app (web and phone) in review mode.
- The blog is built from Markdown files (`content/blog/`) by `node build/build.mjs`. It has search and categories on the page, an Atom feed and the sitemap. A post goes live when its status is "Published".
- Every app address now comes from `site.config.mjs`. "Start your firm" goes to `/start/` until the app has a public sign-up (FUNNEL.md).
- Prices follow the app's plan list. Claims the app doesn't support are removed: the 50-firm waitlist, the address lock and `auth.maulya.in`.
- Old addresses redirect. The March zip is kept in `rollback/`.

## [2026-03-07] - Initial Marketing Site
- Initial release of the standalone `maulya.in` marketing site.
- Implemented core branding with a warm V2 palette.
- Created multi-page navigation: Home, Product, Demo, Associates, and Pilot.
- Integrated global CTA stack pointing to `app.maulya.in` and `demo.maulya.in`.
- Reused NAS design system (grid, spacing, button, and card components).
- Built static HTML/CSS/JS architecture for Hostinger compatibility.
