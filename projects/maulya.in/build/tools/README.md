# Tools (not part of the build)

They use Playwright from the app repo's checkout (`~/V3-lanes/site-shots`, `npm ci` done).

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

- **`keys-site.cjs <outdir>`:** the keyboard walk. Home's tab order, the file scale's arrow keys, "Apply for early access" → `/early-access/` (or the form, once `earlyAccess.formUrl` is set), and the phone menu with Enter and Escape.
