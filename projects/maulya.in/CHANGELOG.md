# Changelog - maulya.in

## [2026-11-10] - The founder's answers on the early-access page (MLP/SRK-101)
- The "Why is it free?" paragraph and Home's "Who built it" text: approved by the founder, Tue 10 Nov 2026 15:06 (code comments only; the visible text does not change).
- One confirmation for both ways of sending: "Thank you. You're on the waiting list. We read every application and reply to everyone within a week, chosen or not." (one constant, `CONFIRMATION`; the second one is gone).
- `earlyAccess.phase "waitlist"`: the form's heading (and page title) is "Join Maulya's waiting list".
- Privacy: one more line directly after the early-access line, on counting visits to the early-access pages.

## [2026-11-10] - The form brought to the founder's 10 Nov content; sending to Maulya's server, switchable (MLP/SRK-99)
- Built on ARK's page (`551b66f`): `/early-access/` stays the intro page, the application stays at `/early-access/apply/`, and every gold button goes to `/early-access/apply/`.
- The founder's 10 Nov updates: a new Part 3 question "How many districts do you work in?" (27 questions now; old 17 to 26 are 18 to 27); the Email hint "The email you will sign in with"; the consent line "... My answers are kept for one year."; the line "The first firms start on 16 November and use Maulya free until 28 December."; WhatsApp 99801 40777 in the fallback lines; the Privacy line. A "Why is it free?" paragraph under the intro (DRAFT for the founder's yes).
- "Send my application", pressed half-done, lists what is missing, each item a link to its question. Hints are real text under the label, not placeholders.
- New settings in `site.config.mjs`: `earlyAccess.apiBase` (`https://app.maulya.in`), `earlyAccess.sendTo` (`"sheet"` default, or `"server"`), `earlyAccess.phase` (`"open"` default, or `"waitlist"`: every apply button reads "Join the waiting list" and the start line changes).
- `sendTo "server"`: the application goes to `{apiBase}/api/v3/public/early-access/applications` with the contract's keys, a hidden `website` trap field, and its 201 / 422 / 429 / 5xx answers handled; the Survey page sends to `.../site-survey/responses` the same way (version `2026-11-survey-1`; a part-way leave is sent once with `completed:false`). `sendTo "sheet"`: both send to their Google Apps Scripts as before.
- Visit counting (`src/assets/visit.js`, shared by the three pages): a uuid v4 in `sessionStorage` only (no cookie), fire-and-forget events to `.../early-access/events`, sent only once the server has answered. The Survey counts only while `sendTo` is `"server"`.
- `early-access-apps-script/code.gs`: 27 columns, and an email to the founders per application (addresses in the script's Script properties, none in the repo); a README with the deploy steps.
- The founder's name and photo only on About: removed from Home, the blog byline and lead, the blog feed and article data; the unused face crop is deleted.
- New tools: `contract.cjs`, `stub-server.cjs`, `server-site.cjs`, `survey-site.cjs`, `check-appsscript.cjs`; `check-apply.mjs` rewritten. Not uploaded.

## [2026-11-10] - The early-access application page, as Shrinivas approved it (MLP/ARK-719)
- New `/early-access/apply/`: Shrinivas's heading, intro, five parts, 26 questions, the reply under each answer, the consent line, "Send my application" and the confirmation, word for word (`build/tools/check-apply.mjs` compares them with his approved file: no differences). Source: `src/pages/early-access-apply.mjs`, behaviour `src/assets/apply.js`, styles at the end of `site.css`.
- Every gold "Apply for early access" button opens it (`earlyAccess.formUrl` is the site's own page; the build's old WARNING is gone). The `/early-access/` page's button goes there too, not to an email.
- Answers go to a Google Sheet through `early-access-apps-script/code.gs` (one row per application, a column per question, plus the time; write-only). New setting `earlyAccess.appsScriptUrl`, EMPTY until ARK deploys the script: the page then says sending opens soon and that nothing was sent, and the build prints a WARNING.
- Privacy: the early-access line now says "your name, email, WhatsApp number, place, firm details and answers are used only to choose early-access firms and to contact you" (Shrinivas's draft G1; waiting for his yes).
- Not uploaded. See `HANDOFF_ARK719.md`.

## [2026-11-09] - Alignment, "How a file moves" in motion, an honest pull to apply (MLP/ARK-693)
- 25 alignment and detail faults fixed (list and before/after pictures in `5_PLANS_AND_REFERENCE/SITE_2026-11-09/`): section spacing, the founders' faces, Pricing's ticks, heading order, 44 px tap targets, the footer, the phone menu, the hero, borders, the jobs grid, line lengths, the blog's chips.
- Home's "How a file moves" is one file's way through the office in the app's own words (Shrinivas's train, SRK-84 to SRK-90), with a file card that follows the step being read; still for reduced motion and without the script. Product's seven places and Who it's for use the same words.
- Home: the working day in Shrinivas's words, Ruling 20, "Built by a practising registered valuer", and three steps after applying (also on `/early-access/`).
- Upload only after Deploy 14 is live: the journey describes Deploy 14's app (`HANDOFF_ARK693.md`).

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
