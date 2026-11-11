# HANDOFF · MLP/ARK-752 · Shrinivas's early-access form against Maulya's early-access server (Lane LW, Wed 11 Nov 2026)

Ran on **Opus 5.5 (high)**, no helper agents. **Read only.** Nothing changed on his branches or on the server's; nothing built,
uploaded or deployed. This file is the only thing this lane added (on `maulya-site/2026-11-new`).

## What was read
| Side | Branch | Head |
|---|---|---|
| His form | `origin/srk/early-access-form-1110` | `a0decc048cbd2aa27099bf8cd26b9413ac899bac` (SRK-107B) |
| His logo | `origin/srk/site-logo-1110` | `21d7840287c5058fe5b06f8073a3c02655121867` (SRK-109, one commit on top of the form branch) |
| The server (#507) | `origin/mlp/ark/724-l2-early-access-server` (app repository, read through `~/V3-lanes/laneI-inspect`, no checkout) | `009331ed35f3aa06bf176d1aee903567c581a245` (ARK-756: comment lines in the CSV import only; ARK-748 `bba7d2b1a` below it) |

Also read: L4's ARK-751 handoff (`982dc16ff:docs/handoffs/MLP_ARK751_L4.md`, #507 unchanged by it), `MLP_ARK724_L2.md`,
the plan `5_PLANS_AND_REFERENCE/EARLY_ACCESS_2026-11-10/EARLY_ACCESS_SERVER_AND_STUDIO_PLAN_2026-11-10.md` §4, and
`infra/traefik/dynamic.yml` on the app's `main`.

Below, **his** = `projects/maulya.in/…` at `a0decc048`; **server** = `services/api/app/…` at `009331ed3`.

## Result: 5 found · server 3 · his form 2

### Server changes (ARK's side)
1. **The survey's free text: the server takes 500 characters, his survey page lets people type 800 (and is built to send 2000).**
   Server `services/early_access/door_input.py:33` `SURVEY_TEXT_MAX = 500`, used at `:89`. His `src/survey/index.html:960`
   (`maxlength="800"` on c5 and c6), `:579` (`SURVEY_TEXT_MAX = 2000`), `build/tools/contract.cjs:100-101` (`T(2000)`).
   What happens: someone types 501 to 800 characters into "the single biggest problem…" (c5) or "what kind of solution…"
   (c6); the server answers `422` (`early_access_public.py:137-145`); his page says "Not sent… Try again", and every
   try fails the same way; the part-way send on leaving (`:801`) is lost without a word. **Change:** `door_input.py:33` to
   `2000`, the application's own free-text limit (`answers.py:86`). No guard is loosened: the 32 KB body cap
   (`answers.py:119`, `early_access_public.py:131`), the 60-key cap and the 20-a-day limit stay.
2. **A visitor who hits the day limit reads a placeholder, not his words.** Server `services/early_access/words.py:115-117`
   `TOO_MANY` ("Too many applications have been sent from this connection today. Please try again tomorrow."), marked
   `PLACEHOLDER` at `:138`, sent in the `429` (`early_access_public.py:44-49`). His `src/assets/apply.js:314` shows the
   server's `message` as it comes. **Change:** `words.py:115-117` to Shrinivas's line once he gives it (asked, once, in
   `FOR_SHRINIVAS.md`). The other placeholders do not reach his visitor: `TOO_BIG` (413) and `UNAVAILABLE` (503) get his own
   "Not sent…" line (`apply.js:315`); `MISSING` only when a `422` names no key his page knows, which his page never causes.
3. **"Kept for one year": his consent line and Privacy say it; the server keeps applications with no end.** His
   `src/pages/early-access-apply.mjs:35` (CONSENT) and `src/pages/legal.mjs:25`. Server: no job removes
   `early_access_applications` rows (ARK-751 §1 "For how long"). By "take Shrinivas's side" his words stand: **change:** a
   removal (or blanking) of an application a year after it came in. Already asked to him as ARK-751's Q2 (`FOR_SHRINIVAS.md`);
   if he answers that the words change instead, this one falls away.

### His form (Shrinivas's side), where the server must refuse or ARK's rule decides
4. **Answers still go to Google.** His `site.config.mjs:39` `sendTo: "sheet"`: the application goes to an Apps Script whose
   address is empty (`:40`), so the page says "Applications open shortly…" and **nothing is collected**; the Survey goes to the
   live Apps Script at `:46-47` (also written into `src/survey/index.html:543`). ARK's rule: the answers move to the server,
   no Google Sheet or Apps Script anywhere. His page already has the server path built and tested (`apply.js:256-318`,
   `src/survey/index.html:765-809`). **His change:** `sendTo: "server"`, but only for the upload that follows #507 being live
   on `app.maulya.in` (Deploy 14b, Thu 12 after 19:00 at the earliest), and then take out the Apps Script addresses and code
   (`appsScriptUrl`, `survey.appsScriptUrl`, the survey's `APPS_SCRIPT_URL` and `submitToSheet`, `apply.js` `sendSheet`,
   `early-access-apps-script/`, the build's Sheet warning) so nothing can reach Google again.
5. **The page must open only at `https://`.** The server answers the browser only for `https://maulya.in` and
   `https://www.maulya.in` (`early_access_cors.py:16`), which is right and stays. His built site's `.htaccess` sends no
   `http://` visitor to `https://`. A person who opens `http://maulya.in/early-access/apply/` would get "Not sent…" on every
   try (the browser refuses an answer with no `Access-Control-Allow-Origin` for `http://maulya.in`) and no visit is counted.
   **His change (or the deploy card's):** make the site `https://` only (Hostinger's Force HTTPS, or a rewrite in
   `.htaccess`). **Not checked whether the live host already does this:** this lane does not touch the live site.

## What matches (checked)
- **Addresses:** `POST https://app.maulya.in/api/v3/public/early-access/events`, `…/early-access/applications`,
  `…/site-survey/responses` (his `site.config.mjs:38` `apiBase`; `visit.js:41-45,53`; `apply.js:294`;
  `src/survey/index.html:788,801`) = the server's three routes (`early_access_public.py:52,68,119`). `app.maulya.in/api`
  goes to the API (`infra/traefik/dynamic.yml:15,82` on the app's `main`).
- **Headers:** his `Content-Type: application/json`, `credentials: "omit"`, `mode: "cors"` (`visit.js:42`) = the server's
  allowed `POST, OPTIONS`, header `Content-Type`, no credentials (`early_access_cors.py:16-19`). `keepalive` on the counts and
  on the survey's part-way send: his `build/tools/server-site.cjs:95-102` shows Chromium making the real preflight to a
  stand-in on another origin.
- **The application body:** `{"visit","answers","consent":true,"website":""}` (his `apply.js:258`) = the server's
  (`early_access_public.py:86-102`). **All 27 questions by script** (his `SERVER` table, `early-access-apply.mjs:166-194`,
  against the server's `answers.py:14-117`): every key, every value and its order, the two "other" values and their
  300-character texts, the text limits (full name 120, place 120, firm 160, anything else 2000): **no difference**; no key on
  one side that the other lacks. His page is stricter in two harmless places: email at most 200 characters (server 254), and
  "Who is in your team?" needs a tick (the server would take none: see the question below). WhatsApp: his `phone10`
  (`apply.js:94-99`) always sends 10 digits, the server's rule (`answers.py:92`). Body under 32 KB both sides
  (`apply.js:277`, `answers.py:119`). The trap field `website`: his page never sends it filled (`apply.js:331`); the server
  answers `201` and keeps nothing if it is (`:86-87`).
- **Visit and events:** a version 4 id (`visit.js:20-35`) = `door_input.py:47-55`; the seven events (his `contract.cjs:7`,
  sent from `early-access.mjs`, `early-access-apply.mjs:317`, `apply.js:40,204`, the survey) = `door_input.py:17-25`; the page
  path fits `door_input.py:29`. A refused count never shows anything (`visit.js:48-63`; the server always answers 204, a
  429 only past 60 a minute).
- **The survey body:** `{"visit","version":"2026-11-survey-1","answers","completed"}` = `door_input.py:97-124` (keys a1 to
  f4 fit `[a-z0-9_]`; one row per visit and version, so the part-way send and the finished one meet: `door_writes.py:122-151`).
  Only the text length differs (finding 1).
- **What the visitor is told:** `201` → "Thank you. You're on the waiting list. We read every application and reply to everyone
  within a week, chosen or not." (`early-access-apply.mjs:41`, `apply.js:300`): **on the waiting list, and within a week**, as
  ARK's 10 Nov words ask. `422 early_access.missing` → his "Still needed before you can send:" and each question as a link
  (`apply.js:301-312`; the server's keys are his keys). `413`, `503`, a network error, a timeout → his "Not sent. Your answers are
  still on this screen. Please try again, or WhatsApp 99801 40777." (`early-access-apply.mjs:209`). `429` → finding 2. The
  Survey: `201` → "Thanks — responses received." / anything else → "Not sent… Try again" with a download fallback.
- **"28 December":** in neither branch's pages, form, build or config (searched `28 dec`, `december`, `28/12`,
  `2026-12-28` in `src/`, `build/`, `site.config.mjs`, `public_hostinger/`). The start line is "The first firms start on 16
  November and use Maulya free for six weeks." and "Why is it free?" says six weeks, extended until 31 March 2027
  (`early-access-apply.mjs:30,33`). (The server's 3.2 welcome email still says "28 December 2026", `words.py:34,69-70`: his
  own 14:57 words, already asked as ARK-751's Q1; not part of the form.)
- **Consent:** "I agree that Maulya may contact me about early access and later about Maulya. My answers are used to choose
  early-access firms and are kept for one year." (`early-access-apply.mjs:35`): **later contact about Maulya is allowed**. The
  server needs `consent: true` (`early_access_public.py:90`), which his page sends only once the box is ticked
  (`apply.js:324-329`).

## His logo branch (what it changes, nothing more)
`srk/site-logo-1110` is one commit (SRK-109) on top of the form branch. It puts his own logo files (from the app's
`public/brand/`) in `src/assets/brand/`; the header shows the lockup without the tagline, the footer the reverse lockup; the
survey's intro card the header lockup; new tab icons (`favicon.svg`, 32 px PNG, `favicon.ico` at the root,
`apple-touch-icon`); schema.org `logo` is the 512 px icon; the social image `og-maulya.png` now shows the new lockup; the old
scales files are no longer built. **It touches nothing the form sends or the server reads** (`apply.js`, `visit.js`,
`early-access-apply.mjs`, `site.config.mjs` and the survey's sending are the same as on the form branch).

## Notes (not findings)
- **Question for him (asked once):** "Who is in your team?" (15) needs a tick, so a valuer who works alone ("Just me" at 14) has
  to tick someone to send. The server already takes an empty list for that one question (`answers.py:82-83`). His words decide.
- The server's day limit (5 applications a connection, `config.py` `early_access_applications_per_day`) counts tries that
  fail as well (ARK-751's ARK Q1). His page checks everything before it sends, so a typing slip never uses one up; a "Not
  sent" and a new try does. Offices or phones that share one internet address share the five.
- A preview on any address other than the two above (Hostinger's temporary address, a laptop) cannot send or count: the
  server rightly refuses it. Try the form's sending only on `https://maulya.in` after the upload.
