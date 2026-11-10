# The early-access script (Google Apps Script)

`code.gs` receives each application from `https://maulya.in/early-access/`. For every application it:

1. adds **one row** to a Google Sheet (a column for each of the 27 questions, plus the time sent), and
2. **emails the founders** that application.

It only writes. It never sends a row back to the browser. No email address is in this repo: the founders' addresses are set in the script's own settings (step 3).

## Deploy (ARK, once)

1. **A Sheet.** In the Google account that will hold the applications (a shared Maulya account), make a new Google Sheet, for example "Maulya early-access applications". In it: **Extensions → Apps Script**. Replace the default code with all of `code.gs`. Save.
2. **Check the Sheet.** In the editor, pick `testSheet` and **Run**. Google asks you to allow access: allow it. The log names your Sheet.
3. **The founders' emails.** In the Apps Script editor: **Project Settings** (the gear) → **Script properties** → **Add script property**:
   - Property: `FOUNDER_EMAILS`
   - Value: the founders' addresses, separated by commas (for example `a@…, b@…`).

   Then pick `testEmail` and **Run**. Google asks for permission to send email: allow it. Both founders should receive "Maulya early access: test message". (It writes nothing to the Sheet.)
4. **Deploy as a Web app.** **Deploy → New deployment**, type **Web app**:
   - **Execute as:** Me
   - **Who has access:** Anyone  ← needed so the page can send without a sign-in

   Deploy and authorise when Google asks.
5. **Copy the Web app URL.** It must contain `/macros/s/` and end with `/exec`. (Never a `/macros/library/` or `/macros/edit` address.) Open it in a browser: it must show `{"ok":true,"service":"maulya-early-access", …}`.
6. **Tell the site.** Paste that URL into `projects/maulya.in/site.config.mjs` as `earlyAccess.appsScriptUrl`. From `projects/maulya.in`, run `node build/build.mjs`: the WARNING about an empty `appsScriptUrl` must be gone.
7. **Try it once.** Open the built page, fill it in with a made-up firm, send it. Check the Sheet (one new row, 28 columns: the time and 27 answers) and that both founders got the email. Delete the test row.
8. **Upload** the zip (`Maulya_hostinger_ready.zip`) with the deploy card.

## After any change to `code.gs`

Edits do not reach a live deployment by themselves. **Deploy → Manage deployments → the pencil → Version: New version → Deploy.** The `/exec` address stays the same.

## Good to know

- **Anyone can post to the address** (it has to be "Anyone", and the address is in the page). A stranger could add rows. `code.gs` cuts each cell at 2,000 characters, refuses a request over 60,000, and writes plain text only, but it cannot tell a real firm from a made-up one.
- **If the email fails**, the application is still in the Sheet and the visitor still sees "sent". Check the Sheet. (Gmail's daily limit for scripts on a free Google account is about 100 emails.)
- **To change who gets the email**, change `FOUNDER_EMAILS` in Script properties. No new deployment is needed.
- **The form's questions** are columns in `code.gs`. If a question is added or moved on the page, change `COLUMNS` to match and make a new version. `node build/tools/check-apply.mjs` compares the two.
