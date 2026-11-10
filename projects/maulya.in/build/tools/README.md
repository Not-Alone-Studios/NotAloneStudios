# Tools (not part of the build)

They use Playwright from the app repo's checkout, `~/V3/node_modules/playwright` (the old `~/V3-lanes/site-shots` checkout is gone; set `PW=<path to playwright>` to use another). Run them through `~/Downloads/Maulya/6_TOOLS/mac_load/heavy.sh` (a browser is heavy work).

- **`shoot-app.cjs` + `app-shots.json`:** retake the app's pictures.
  1. Start review mode from `apps/web`: `VITE_UI_REVIEW_MODE=1 npx vite --port 5189 --host 127.0.0.1 --strictPort`.
  2. Run `node build/tools/shoot-app.cjs src/assets/media/app build/tools/app-shots.json` (from `projects/maulya.in`, with `cd` into `~/V3-lanes/site-shots/apps/web` first if Node can't find Playwright).
  3. Stop the server.

  The script:
  - closes the "report is ready to check" prompt;
  - replaces any phone number with "+91 90000 00000";
  - writes each page's text beside the pictures (`*.txt`: move them out). Read them for real-looking names before using a picture.

  **Left out on purpose** (real-looking borrower names in review data): My Office (`/office`), Reports (`/reports`), and the phone-in-browser Home (its notifications).

- **`check-site.cjs <base> <outdir> <widths>`:** every page at each width. It reports one `h1`, console errors, failed requests and sideways scroll, and takes full-page screenshots. Serve a build first: `python3 -m http.server 8768 --bind 127.0.0.1` inside `dist/preview/Maulya_preview_all_posts`.

- **`keys-site.cjs <outdir>`:** the keyboard walk. Home's tab order, the file scale's arrow keys, "Apply for early access" → `/early-access/apply/` and the first 22 Tab stops of the application page, and the phone menu with Enter and Escape.

- **`audit-site.cjs <base> <outdir> <widths> [reduced 0|1] [paths]`** (MLP/ARK-693): full-page pictures of every page, plus what a picture can't show: sideways scroll, tap targets under 44 px (links inside running text are not counted), lines wider than about 80 characters, text contrast under AA, heading order, images without a size or alt, layout shift, and page weight. Writes `audit.txt` (or `audit-reduced.txt`).

- **`journey-site.cjs <base> <outdir>`** (MLP/ARK-693): Home's "How a file moves" part-way through (steps 2, 5 and 7), at 360 and 1440 px, with and without reduced motion, and once with no script. It prints the card's place and next step, and how many steps are still waiting to come in.

- **`apply-site.cjs <outdir> [base]`** (MLP/ARK-719, MLP/SRK-99): drives `/early-access/apply/` at 360, 768, 1280 and 1440 px. Checks the start line and the "why it is free" paragraph, the buttons (real, `aria-pressed`, 44 px), every pick-one reply's words (an answer with no reply shows nothing), the tick-all replies, "Other", the keyboard, what the send button says is missing, pressing it half-done (nothing sent; the list of what is missing, each item a link to its question, and the links work), a send with no Apps Script address ("Applications open shortly…", nothing sent), a send that fails (answers stay) and one that works (the confirmation; the payload's 27 keys), reduced motion and no script. Every send goes to a fake address the script answers itself: nothing reaches Google. Writes pictures to `<outdir>`. On Windows: `PW=<path to playwright-core>` and `CHROME=<path to msedge.exe or chrome.exe>`, and `MSYS_NO_PATHCONV=1` in Git Bash.
- **`check-apply.mjs [EARLY_ACCESS_FORM_CONTENT.md]`** (MLP/ARK-719, rewritten for MLP/SRK-99): no browser, so light. Compares the page's words (its source and what the build shipped in `dist/live/early-access/`) with the founder's content file beside this project (its "Updates of 10 Nov" included), `early-access-apps-script/code.gs`'s columns with the 27 questions, the Privacy page's early-access line, and checks the founder's name and photo appear on no page but About (live build and preview). Prints every difference; "No differences." is the goal. Run it after any edit to `src/pages/early-access.mjs`.
- **`check-appsscript.cjs <code.gs>`** (MLP/SRK-99): runs the script against a stand-in for Google (no network): the row, the founders' email, the failure cases. Not a test in Google.
- **`contract.cjs`, `stub-server.cjs`** (MLP/SRK-99 addenda 1 and 2): `contract.cjs` is Maulya's server contract for the site (the three endpoints, the events, every application key and value, the Survey's keys and values), typed separately from the pages' own tables, with validators. `stub-server.cjs` is a small local stand-in for the server (127.0.0.1 only): it answers the three endpoints and a real CORS preflight, validates every body against the contract, and records every request. `node build/tools/stub-server.cjs 8770` runs it by hand.
- **`server-site.cjs <outdir> [base]`:** drives `/early-access/` and `/early-access/apply/` against the stub, with `sendTo` "sheet" and with "server": the counting events (once each, one visit id, sessionStorage only, no cookie, nothing more once a server fails to answer), the application body (every value of every pick question, Other, the 10-digit WhatsApp, the trap field), and the server's answers (201, 422 with links, 429, 5xx, a dropped connection). It sets the two settings with an init script, so no rebuild is needed. Never touches the real server or Google.
- **`survey-site.cjs <outdir> [base]`:** the same for `/survey/`: `sendTo` "sheet" (the old Apps Script path, no request to app.maulya.in) and "server" (the three site_survey events, the answers with the contract's codes across four runs, a 5xx and a dropped connection with Try again, and the part-way leave sent once with completed:false).
- Every browser tool answers `https://app.maulya.in/**` itself (`NO_REAL_SERVER`): the early-access pages count visits to it, and a test must never reach the real server.
