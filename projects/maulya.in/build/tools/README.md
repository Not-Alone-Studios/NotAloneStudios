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

- **`apply-site.cjs <outdir> [base]`** (MLP/ARK-719): drives `/early-access/apply/` at 360, 768, 1280 and 1440 px. Checks the buttons (real, `aria-pressed`, 44 px), every pick-one reply's words, the tick-all replies, "Other", the keyboard, what the send button says is missing, a send with no Apps Script address (nothing sent, said plainly), a send that fails (answers stay) and one that works (the confirmation; the payload's 26 keys), reduced motion and no script. Every send goes to a fake address the script answers itself: nothing reaches Google. Writes pictures to `<outdir>`.
- **`check-apply.mjs [approved.md]`** (MLP/ARK-719): no browser, so light. Compares the page's words (its source and what the build shipped in `dist/live/early-access/apply/`) with Shrinivas's approved file, and `early-access-apps-script/code.gs`'s columns with the 26 questions. Prints every difference; "No differences." is the goal. Run it after any edit to `src/pages/early-access-apply.mjs`.
