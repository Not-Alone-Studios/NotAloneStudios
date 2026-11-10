# Handoff · MLP/ARK-719 · maulya.in: the early-access application page, as Shrinivas approved it

Lane LW, Tue 10 Nov 2026, main chat #31. Ran on Sonnet, no helper agents.

- **Branch:** `maulya-site/2026-11-new`, from `5ccef8a`. The commit is named in `7_STATUS/LW.md`.
- **Nothing is deployed, uploaded or published.** The live maulya.in, Hostinger and Google were not touched. No request left the Mac for a real address (every test send went to a fake one).

**BUILT, NOT PROVEN by a person.** Checked in a browser by script at 360, 768, 1280 and 1440 px, and by eye in the pictures. Nobody has used it on a real phone, and the Apps Script has not been deployed in Google.

## What is here

| | |
|---|---|
| **The page** `/early-access/apply/` | `src/pages/early-access-apply.mjs` (the words, as data), `src/assets/apply.js` (the behaviour), the end of `src/assets/site.css` (the look, in the site's own tokens: no new colour or font) |
| **Where answers go** | `early-access-apps-script/code.gs` (one row per application, a column per question in the form's order, plus the time; it writes only, never reads a row back; every cell is plain text) |
| **Settings** | `site.config.mjs` → `earlyAccess.formUrl` (`/early-access/apply/`), `earlyAccess.appsScriptUrl` (**empty**), `earlyAccess.open` |
| **Checks** | `build/tools/check-apply.mjs` (words against the approved file; light), `build/tools/apply-site.cjs` (behaviour in a browser; heavy). README beside them. |

## What the page does (Shrinivas's words; the approved file is the source)

- His heading, intro (3 paragraphs), five parts (title and line each), 26 questions, the reply under each answer (the shared sentences VISIT, RATE, CALC, INVOICE and TRACK written out in full), the consent line, "Send my application", and the confirmation line.
- **Compared by script, not by eye:** `node build/tools/check-apply.mjs` reads his file, expands the shared sentences and compares 629 things (47 replies) in the page's source and in the shipped build, and `code.gs`'s 26 columns with the 26 questions. Result: **no differences**. A deliberate change to two of his words made it print both, so it does catch a difference.
- Phone first. Answer buttons are real `<button type="button">` with `aria-pressed`, 48 px tall (full width on a phone). Replies are in `role="status"` boxes under the question. "Other" (questions 21 and 22) opens a short text box and adds no reply line. Keyboard: Tab, Space and Enter; a ring shows on every stop. Reduced motion: the reply appears with no animation.
- **Every question is required except 26.** "Send my application" is off until all are answered and the box is ticked; the line above it says which are missing ("Still needed before you can send: questions 2–25 and the box to agree.").
- **"Send my application" is `aria-disabled`, not `disabled`:** it looks off and does nothing, but a keyboard or screen-reader user can still reach it. Pressing it half-done names what is missing and moves focus to the first missing question. (Playwright treats `aria-disabled` as not clickable: the test forces that one click.)
- After a send that worked, the form is replaced by his confirmation line and focus moves to it.

## While `earlyAccess.appsScriptUrl` is empty (today)

- The page shows the whole form. At "Send my application" it says **"Sending applications opens soon. Nothing was sent. Your answers are still on this screen."** and sends nothing. **No application is collected.** (#31's call.)
- The build prints a boxed WARNING until the address is set, as it did for `formUrl`.
- A send that fails (no network, the script answers "not ok", 25 seconds with no answer) says **"Your application was not sent. Your answers are still on this screen: try again in a moment, or write to support@maulya.in."** and keeps every answer.

## The gold buttons

All 18 "Apply for early access" buttons on the built pages (header, footer, each page's end; the survey's last screen and each article's end too, when an article is published) open `/early-access/apply/`. The `/early-access/` page's button goes there too; its email fallback is gone. If `formUrl` were ever emptied the buttons still go to the application page (never back to `/early-access/`).

## Privacy

The early-access line on `/privacy/` now reads: "An application for early access: your name, email, WhatsApp number, place, firm details and answers are used only to choose early-access firms and to contact you." That is Shrinivas's **draft** G1: **waiting for his yes.** The old line (Sat 7 Nov: "the details you give in the application form are used to choose firms and to contact them") is in git history at `bf0b39e`. No mention of Google as the place the Sheet lives: that is A8, not answered.

## Checked

- `node build/build.mjs`: builds 11 pages in the sitemap; the only warning is the empty `appsScriptUrl`.
- `check-apply.mjs`: no differences (above).
- `apply-site.cjs` at 360, 768, 1280 and 1440 px: **all passed.** One h1; no sideways scroll; 81 answer buttons, all at least 48 px; all 35 pick-one replies show exactly their words with one answer pressed at a time; tick-all lines and headings for 21 and 22; Other; keyboard; the missing list and the focus move; an email without "@" or a number under 10 digits is "still needed"; no address → "opens soon", nothing sent, answers stay; a failed send keeps the answers; a good send shows the approved line and the payload has `q1`…`q26` in order and a time; reduced motion; no script.
- `code.gs` run against a stand-in for Google's services: one row, 27 columns, lists joined with " | ", `=1+1` kept as text, empty body refused, the health check shows nothing from the Sheet. **Not yet run in Google.**
- `audit-site.cjs` (360, 768, 1280, 1440, and reduced motion at 360 and 1440) on the new page and the pages whose buttons changed (Home, Product, Who it's for, Pricing, About, Early access, Blog, Privacy, Terms): one h1 each, layout shift ≤ 0.001, no console errors, no failed requests, no contrast or heading-order faults. **One flag, left as it is:** the consent box's tick is 24 px, but its whole 48 px row is the target (the same as the blog's checklist).
- `journey-site.cjs` and `keys-site.cjs`: as before; Enter on the header's gold button now lands on `/early-access/apply/`, and its first Tab stops are the questions' buttons.
- Pictures: `~/Downloads/Maulya/5_PLANS_AND_REFERENCE/SITE_2026-11-10/apply/` (`apply-top`, `-replies`, `-missing`, `-ready`, `-not-open`, `-failed`, `-sent`, `-full` at four widths; `-reduced__360`; `-no-script__360`; `audit/`, `journey/`, `keys/`).

## What ARK and chat #31B do next

1. **Deploy the Apps Script in Google** (with #31B; I never do): follow the steps at the top of `early-access-apps-script/code.gs` (new Sheet, paste the file, Deploy → Web app, Execute as Me, Anyone). **Whose Google account holds the Sheet is A8, still Shrinivas's to answer.**
2. Paste the `/exec` address into `site.config.mjs` → `earlyAccess.appsScriptUrl`, run `node build/build.mjs` (the WARNING must be gone), open the preview, send one test application, and look at the Sheet (one row, 27 columns).
3. Open the preview with Shrinivas on his phone.
4. Upload only after that, and only with the rest of the site (Deploy 14 is live; his answers F1–F10, G1, G3 and the survey's script, blocker 2, are still open: see `HANDOFF_ARK693.md` and `LW_ACTIONS.md`).

## Not built (still Shrinivas's to answer)

- **A5:** an email to the founders for each application.
- **A7:** a waiting-list button after the 10 to 15 are chosen.
- **A8:** whose Google account holds the Sheet.
- **The extra Email hint** "The email you will sign in with": a draft, not approved. The hint stays "name@example.com".

## My calls (the approved text does not give these lines; ARK may overrule)

- The four short lines above (the missing list, "opens soon", the failed send, and the no-script line "This form needs JavaScript. If it will not run for you, write to support@maulya.in.").
- An email without "@", or a WhatsApp number under 10 digits, counts as not answered (the hints say "name@example.com" and "10-digit mobile number"). Nothing else is checked.
- The text box under "Other" is optional (a ticked Other with an empty box is stored as "Other").
- Screen readers hear "(required)" after each starred question; nothing is added for sighted readers.
- The send button is `aria-disabled` (above); "Sending…" shows while it works.
- No automatic second try after a failed send, so a slow success is not saved twice; a person can press the button again.
- The Sheet's tab is named "Applications"; columns are the time (`sent_at`) then "1. …" to "26. …" in the question's own words.

## Risks to know

- **Anyone can post to the script's address** (it has to be "Anyone" so the page can send, and the address sits in the page). A stranger could add rows; `code.gs` caps each cell at 2,000 characters and each request at 60,000, and writes plain text only, but it cannot tell a real firm from a made-up one. The Sheet is read by people, not by anything that acts on it.
- Nothing is saved on the visitor's device: a closed tab loses the answers.
- The page needs JavaScript; without it a line says so.
