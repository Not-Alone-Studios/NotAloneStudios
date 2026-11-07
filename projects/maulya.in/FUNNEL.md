# The road: maulya.in → sign-up or sign-in → the firm's onboarding → the app

MLP/ARK-668, Lane LW, Sat 7 Nov 2026.

**Sources:**
- The site: this folder, at `46edd37` (identical to what is live on https://maulya.in today, checked by hash page by page).
- The app: `~/V3` `origin/main` at `9a94cade8`, read only.
- The live hosts: checked with `curl` on 7 Nov, about 15:30 IST.

App paths are relative to the app repo.

**In one line:** today a stranger who clicks "Try free" on maulya.in cannot get in. The app has no working public sign-up. The survey's address no longer answers. The onboarding page shows only on `/`, and only for a firm Studio created and left unapproved.

---

## Step 1: the site's buttons (today)

| What | Where on the site (at `46edd37`) | Points to |
|---|---|---|
| "Try free" (header, drawer, hero and every closing band) | `src/index.html:54,69,83` and 53 times across `src/` | `https://app.maulya.in/auth/sign-up` |
| "Sign in" | `src/index.html:53,68` and 38 times in all | `https://app.maulya.in/auth/sign-in` |
| "Open associate sign-up" | `src/associates/index.html:88` | `…/auth/sign-up?mode=associate` (the app ignores `mode`: no code reads it) |
| Updates and articles | 21 links | `https://app.maulya.in/updates` |
| Survey | `/survey/` | Apps Script, see step 5 |
| Survey "done" screen | `src/survey/index.html:925` | `/pilot/?src=maulya-survey-done`, which is only a page with a `mailto:` |

**In the new site** every app address comes from one file, `site.config.mjs`, as `app.origin` plus paths. Today's values are kept (`https://app.maulya.in`) until ARK decides (step 2).

## Step 2: the hosts

| Host | What answers (7 Nov) | Notes |
|---|---|---|
| `app.maulya.in/auth/sign-in` | 200, the web app | Production on this host is behind `main`: `GET /api/v3/public/plans` (on `main` at `services/api/app/api/routes/public_plans.py:19`) answers **404** here |
| `app.maulya.in/health` | 200 `{"status":"ok"}` | The founders' record says app.maulya.in "isn't exchanging data with the server properly; fixing it is deliberately left for later". Not proven or disproven here |
| `pilot.maulya.in/auth/sign-in` | **401**, a browser username and password | `pilot-basic-auth`, `infra/traefik/dynamic.yml:167-169`, on router `maulya-pilot-web` (:34-44). Every page route, `/auth/*` included, is behind it. `/api`, `/health` and `/readyz` are not (:45-54) |

**Config facts:**
- The repo's production example sets `PUBLIC_APP_ORIGIN=https://app.maulya.in` (`infra/compose/.env.production.example:60`). The founders' record says production runs with `https://pilot.maulya.in`. The real `.env` is not in the repo, so this can't be checked from code.
- `PUBLIC_APP_ORIGIN` decides where every emailed link and every Studio invitation points (`services/api/app/workos_settings.py:177`, `services/api/app/services/invitation_tokens.py:75-78`). With pilot set, an invited owner lands on pilot's password gate.
- CORS allows `app.maulya.in` and `pilot.maulya.in` (`.env.production.example:67`), **not `maulya.in`**. So the marketing site cannot call the API from the browser.
- The Google sign-in return address is `<the host you are on>/auth/callback`. It must match `WORKOS_REDIRECT_URIS` (:48), which lists both hosts.

## Step 3: sign-up and sign-in pages in the app

- **Routes** (`apps/web/src/app/router/authRoutes.tsx`): `/auth/sign-in` :22, `/auth/sign-up` :29, `/auth/waitlist` :79.
- **`/auth/sign-up` is not a sign-up.** `apps/web/src/pages/auth/SignUpPage.tsx:5-12` only redirects to `/auth/sign-in`.
  - **BREAK 1:** the site's main button lands on a sign-in page.
- **Sign-in has no way to sign up.** `apps/web/src/pages/auth/workos/WorkOSSignIn.tsx:47-48` says "No sign-up: there is no public sign-up."
- **A stranger is refused.** An unknown person gets `no_account` and nothing is created (`services/api/app/api/routes/auth/_workos_sign_in.py:95-104`). So does a person with no firm (:108-114). The page shows them the wrong-password wording (`WorkOSSignIn.tsx:61-63`).
  - **BREAK 2:** a stranger who signs in with Google gets an error that doesn't tell them what to do.
- **A firm set-up page was half built.** `apps/web/src/pages/auth/signup/setUpApi.ts:13` calls `POST /api/v3/auth/firm/set-up`. No page uses it, and the server has no such route.

## Step 4: the 50-firm beta cap and the waitlist

- **The number exists.** `public_beta_max_firms = 50` (`services/api/app/config.py:276`), counted in `services/api/app/services/beta_waitlist.py:26-48`.
- **It is never enforced.** `beta_signup_capacity_full` and `upsert_beta_waitlist_entry` have no callers outside tests.
  - **BREAK 3:** the site's "first 50 firms, then the waitlist" is not what the app does. The new site does not repeat the claim.
- **The waitlist page is never reached.** A person with an old waitlist row gets status `waitlist` (`_workos_sign_in.py:110-113`). The web has no case for it (`apps/web/src/pages/auth/workos/finishSignIn.ts:98-108`), so they see "something went wrong". `/auth/waitlist` is never navigated to.

## Step 5: the survey (the site's only data channel that exists today)

- **What it sends:** the page posts JSON as `text/plain` (no preflight) to the Apps Script address. The address is at `src/survey/index.html:543`, and the post at :713.
  - The fields are `timestamp_iso`, `src`, `survey_version`, `answers`, `page_url`, `user_agent`, `referrer`, `lang`.
  - The questions are about the firm's workflow. There are no contact fields.
- **Where it goes:** `survey-apps-script/code.gs` writes a row to the sheet "Responses".
- **BREAK 4:** `GET` on that address on 7 Nov returned Google's **"Page not found. Sorry, the file you have requested does not exist."**
  - A live deployment would answer `{"ok":true,"service":"maulya-survey"}` (code.gs:112-121).
  - So the script's deployment appears to be deleted or replaced, and survey answers are not reaching the sheet.
  - I did not POST a test (it would add a row if it worked).
  - On failure the page offers its own fallbacks: download the answers, or email them to `hello@maulya.in`.
  - **Fix (ARK):** redeploy `code.gs` as a web app (Execute as: Me, Who has access: Anyone). Then either paste the new `/exec` address into `site.config.mjs` → `survey.appsScriptUrl` and rebuild, or redeploy over the old one if it can still be found.

## Step 6: "the channel for new users' data to the web app"

- **What exists on `main`:** `POST /api/v3/public/applications`, the firm application.
  - Sends: full name, firm, email, phone, city, basis, registration, banks, how they heard, consent, and a hidden trap field (`services/api/app/schemas/firm_application.py:21-33`).
  - Follow-up steps are in `public_application_steps.py`. Studio reviews applications at `/api/v3/studio/joining-requests` (`studio_joining.py:80`).
- **BREAK 5: it is switched off.** It answers 404 unless `applications_intake_enabled` is set (`public_applications.py:224-230`). The default is False (`config.py:279`), and the production example does not set it.
  - Even switched on, a form on maulya.in could not post to it from the browser (no CORS entry for maulya.in).
  - No site page posts to it today.
- **Nothing else found.** There is no lead, request-access or Sheet-import endpoint. No `script.google.com` appears anywhere in the app.

## Step 7: a new firm's onboarding

- `TenantOnboardingPage` has **no address of its own**.
  - It is drawn instead of Home, on `/` only (`apps/web/src/app/router/useRouterState.ts:96`, `AppRouter.tsx:447`).
  - It shows only while the firm's approval state is `approval_required`, `approval_pending` or `rejected` (`apps/web/src/app/navigation.ts:73-87`).
- After sign-in the app goes to `next` or `/` (`apps/web/src/lib/authFlow.ts:30-41`, `finishSignIn.ts:66-83`). No link and no redirect names onboarding.
- **Why "only by typing the address":**
  1. A firm Studio approves at creation never sees it (`services/api/app/services/firm_setup.py:285-286`).
  2. Phones are moved off `/` to `/m/home` (`apps/web/src/routing/MobileAutoRedirect.tsx:13-24`), which shows a status line instead (`PhoneHome.tsx:101`).
  3. The v3 Today page shows a "waiting" notice instead (`TodayPage.tsx:34`).
  4. Owners arrive by `/auth/invitation?token=…` from Studio (`firm_setup.py:219,252`), not from sign-up.
- **BREAK 6:** no stable onboarding address and no redirect to it.

---

## The road as it can be: three ways (ARK decides; asked atop `7_STATUS/LW_ACTIONS.md`)

**(A) Request access on the site, founders invite. #29's recommendation for now, ARK may overrule.**
- The site's main button goes to a "Start your firm" page that says plainly how joining works today. It has two actions:
  - the survey (once its script is redeployed), with a contact line added to the Sheet;
  - or an email to support.
- Studio creates the firm and sends the invitation. The owner signs in and lands in the app.
- Needs: the survey script redeployed (ARK); `PUBLIC_APP_ORIGIN` pointing at a host strangers can open (app.maulya.in); and for the onboarding page, app task 6/7 below.
- **No app change is needed to start.** It is honest today.

**(B) The app's own apply door.** The site's button goes to the app's application page (`/api/v3/public/applications` behind a page).
- Needs: `APPLICATIONS_INTAKE_ENABLED=true` on production, a web page for it at `/auth/sign-up` (app task 2), and the host answering properly (app.maulya.in fixed, or pilot's gate opened for `/auth/*` only).

**(C) Self-serve sign-up** (Google, then set up your firm, then onboarding).
- Needs: app tasks 1–3, 6, 7, 9, 10, and app.maulya.in fixed. It is the most work, and the founders' record put the app.maulya.in fix "for later".

**Switching between them on the site** is one line in `site.config.mjs`: `app.origin`, `app.signUpPath`, `app.signInPath`. (ARK-683, 7 Nov night: the site's main button is now "Apply for early access", set by `earlyAccess` in the same file; the old `start.mode` and the `/start/` page are gone, and `/start/` redirects to `/early-access/`. The road described below is the one that was built before that; the app still has no public sign-up.)

## Tasks for the app's lanes (not done here: this lane does not edit the app repo)

1. `apps/web/src/pages/auth/workos/WorkOSSignIn.tsx:48`: under sign-in, add "New firm? Here is how to join" linking to the chosen road. Replace the wrong-password wording for `no_account` (:61-63) with one that says the person has no firm yet and what to do.
2. `apps/web/src/pages/auth/SignUpPage.tsx:6-9`: replace the redirect with the chosen form (the application form for B, or the set-up form for C).
3. `services/api/app/api/routes/auth/`: add `POST /api/v3/auth/firm/set-up` (called by `setUpApi.ts:13`), or delete the unused client.
4. Production env and `services/api/app/config.py:279`: `APPLICATIONS_INTAKE_ENABLED=true` (road B).
5. `infra/compose/.env.production.example:67`: add `https://maulya.in` to CORS only if the site will call the API from the browser (it does not today).
6. `apps/web/src/app/router/routes.tsx` (near :94): a stable address for onboarding, e.g. `/onboarding`, drawing `TenantOnboardingPage`.
7. `apps/web/src/lib/authFlow.ts:30-33`: after sign-in or invitation, send a firm in `approval_required`/`approval_pending`/`rejected` to that address. Also `apps/web/src/routing/MobileAutoRedirect.tsx:16`, so phones can open it.
8. `services/api/app/services/beta_waitlist.py:47`: call `beta_signup_capacity_full` on the sign-up path and write the waitlist row at firm 51. Also `finishSignIn.ts:98-108`: handle `waitlist`.
9. `apps/web/src/pages/auth/WaitlistPage.tsx:21,32,35`: it hard-codes "first 50 firms" and links to `maulya.in/pricing/` and `/survey/`. Keep them in step with the site, which keeps both pages.
10. Production `PUBLIC_APP_ORIGIN`: the host strangers and invited owners can open, not pilot behind its password.
11. `services/api/app/services/billing/catalogue.py:27-29`: "Tier 1" is a working name. The site shows it as it is until the founders name it.
12. `services/api/app/services/assignment_update_flow.py:279-389`: the borrower and bank lock after the first report. The old site also claimed the **address** locks: not in code, so the new site drops that claim.
