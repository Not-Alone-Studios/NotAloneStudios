# HANDOFF · MLP/ARK-1192 · notalonestudios.com, the final build, with Calvetra's demo (Sat 28 Nov 2026)

**BUILT, NOT UPLOADED.** Branch `nas-site/2026-11-refresh` (on top of ARK-991's `5da3a6cfe`). Upload zip
`~/Downloads/Maulya/3_DEPLOY/SITE_NAS_2026-11/notalonestudios.com_2026-11-28.zip` (sha256 in the file beside it), and
its upload card `README.md` there. Lane LW, Opus 5.5, no helper agents. Nothing on any host or server.

## What changed since ARK-991
| Page | Change |
| --- | --- |
| **Home** | Maulya stays first, shorter: what it is in two lines, "In use with our founding firms. Not yet open to new firms.", **"About Maulya" → `/products/maulya/`**, a sign-in line for existing firms. The app pictures, the four-card "How it's built" section and the seven-state track are gone (the state names on `main` changed since 12 Nov, so the old ones were wrong). A green panel lists three principles in words. Calvetra: "See how it works" → the demo, then "Read about Calvetra". |
| **`/products/maulya/`** | Rewritten short: what it is; who it is for (valuers in India, the office, the site engineers); **three** principles (firms kept apart, the server owns every file, the audit trail); "Not open to new firms yet." with the studio's email. **No early access, no sign-up, no prices, no app pictures, no maulya.in link.** Title "Maulya · Not Alone Studios". |
| **Projects** | Maulya: "In use with our founding firms", "Not yet open to new firms.", the three principles instead of app pictures, "About Maulya" only. Calvetra: "See how it works" added. |
| **`/products/calvetra/`** | Hero says what it does in plain words, then **"See how it works"** (the demo) and **"Ask for early access"** (email to `hello@notalonestudios.com`). New "See how it works" block with the label. "Where it stands" brought up to date. The review-build link is off (see below). Captions say "From Calvetra's clickable demo, with sample data." "Trademark pending" stays off. |
| **`/products/calvetra/demo/`** | **New: the demo, shipped.** |
| **Contact** | Maulya lane: "In use with our founding firms. Not yet open to new firms." Its panel: "Maulya isn't open to new firms yet", the studio's email, "Email the studio", "Sign in". Calvetra lane's second link → the demo. |
| **Proof** | The March Maulya app screens (control tower, invoice ledger, the retired associate-access page) and the Maulya survey band ("Get a tailored demo path" → maulya.in) are off. Three Calvetra demo pictures take their place. Revalk is marked "earlier work". "Public demo available" and "the full sales narrative … on the dedicated Maulya page" are corrected. |
| **Method** | Revalk in the past tense ("earlier work"). The three "In Maulya" examples replaced with traced ones (below); "Billing-gated release" was wrong (a file can be handed over unpaid). "See it in Maulya" / "About Maulya" → `/products/maulya/`. |
| **Footer (all pages)** | "Maulya's own site: maulya.in" → `hello@notalonestudios.com`. |
| `/products/zenops/` | Redirect now to `/products/maulya/` (was maulya.in). |
| `assets/site.js` | Two leftover maulya.in targets → `/products/maulya/`. |

**Why no maulya.in link anywhere (my call, ARK may overrule):** live maulya.in leads with "Apply for early access"
(checked 28 Nov). A link there is an early-access call to action by one step. Only `app.maulya.in` ("Sign in") stays:
ARK-991's link check proved it opens (200 again today), and the line asks only existing firms.

## Calvetra's demo: what I found, and what shipped
- **Found:** (1) the clickable design prototype `design/ux2/prototype/index.html` (84 screens, one file); (2) the app's
  review mode (`apps/client`, `--mode review`: a fake server in the browser, sample sign-in as "Sample Student",
  "Look around first"), which is what `calvetra.notalonestudios.com` serves.
- **Shipped: the prototype**, from `~/Calvetra-lanes/lane2-content-a` (branch `cal/ark/70-used-plan-and-agenda-sheets`,
  commit `bf667c1`, source sha256 `20d1b3ad2f74…`). It is `main`'s copy plus CAL/ARK-70's word fix ("overdue" and
  "missed" → "waiting" and "didn't happen"). It is the trial demo that "only showed how things work": it walks every
  screen of the design, while review mode has 48 of 84 and pretends to sign you in with Google or Apple.
- **Safe:** one self-contained 314 KB file; no network request (checked at capture: no outside request, no console
  error), no fonts, no `localStorage`, no tracking, no keys; every name invented ("Dr Sample", `example.com`); prices
  shown as "₹—".
- **Changed, by `build/calvetra_demo.py`** (re-run it on a newer prototype; it stops if the file changed shape):
  - title, description, canonical, `noindex`, social tags, and an `h1`;
  - a bar on top: **"A clickable demo of how Calvetra works, with sample data. It is not the app."** + "Back to Calvetra";
  - internal codes out of the title, the comments and three menu headings ("(DEC-6)" etc.);
  - the payment toast's vendor names out;
  - the "Prototype" menu button at 44 px.
  Nothing else changed.
- **The review build link is off the Calvetra page** (my call): one demo, clearly labelled, instead of a second one
  that looks like signing in. `calvetra.notalonestudios.com` still opens; the host's `/calvetra/` rule still points there.
- **Known:** on the four first-run question screens, the demo shows its own `h1` as well as the bar's.

## Pictures (fresh, from the shipped demo)
8 screens, from `/products/calvetra/demo/?screen=<id>&theme=light&shot=1` (the demo's own screenshot mode hides the
menu button and the bar; its purple "Sample" line stays):
- **Phone** (390×844 at 2×, → 390 and 780 wide): `10-today`, `30-short`, `31-drop-list`, `41-week-dragged`,
  `71-adopt-preview`, `101-board`, `104-topic`, `110-library`.
- **Desk** (1280×800, → 1280 and 800 wide): `10-today`, `30-short`, `101-board`, and the new `110-library`.

They have the same file names as before in `assets/screens/calvetra/`. Maulya's app pictures are used by no page now.

## Claims table: every sentence I added or changed
Maulya's code read at `origin/main` **`025c3ba78`** (27 Nov, Deploy 16, on production since 27 Nov 12:3x per INBOX
`MC37 D16 ON PRODUCTION`). Calvetra at `~/Calvetra` `origin/main` `c09ae80`.

| Sentence (short) | Source |
| --- | --- |
| "In use with our founding firms. Not yet open to new firms." | ARK, 28 Nov 11:12 ("we arnt opeing maulya early access yet"); the brief's words |
| "keeps each bank valuation in one file, from the day it comes in to the day it is paid" | maulya.in (ARK-991 table) |
| "The server decides where every file stands and what happens next, and every screen shows that one answer" | `services/file_states.py:1-9` ("pages read the answer and never derive their own"), `assignment_next_step.py` |
| "The office works at a desk in the browser; site engineers work on the phone. Both see the same file." | maulya.in; `apps/web` (ARK-991 table) |
| Who it's for: "Valuers in India who value property for banks and other lenders" / the office / the site engineers | the brief ("valuers in India"); maulya.in (bank valuations, site visits on the phone) |
| 01 "Every request carries its firm, and the database draws the same line itself, with row-level rules…" | `db_context.py`; RLS migrations; `database_role.py:3-4` (refuses a superuser or `bypassrls` login once `APP_DATABASE_URL` is set); **true since the switch, Fri 20 Nov 23:07** |
| 02 "Where a file stands, who has it and what happens next are worked out on the server…" | `file_states.py`, `assignment_next_step.py` |
| 03 "Actions on a file are written to an audit trail: who, when, before and after" | `services/audit.py:282` (`before_state` / `after_state`) |
| "Already using Maulya with your firm? Sign in." | ARK-991's proved link `app.maulya.in` (200 on 28 Nov); my words for "existing firms only" |
| Method: "A site visit's photos and the file's documents stay linked to that file" / "A file moves on only when the server agrees it can" / "A final report is issued once and frozen, with the audit trail attached" | ARK-991 table: `siteUploads.ts`; `approval_guards.py`, `finalise_approves.py`; `repogen_pipeline.py` ("a final is issued once and frozen"), `audit.py` |
| Calvetra: "a study planner for NEET PG and INI-CET aspirants. It fits a plan to the months you have, tells you honestly whether it fits, and shows what rankers, faculty and students each say…" | `design/ux2/README.md` ideas 1–3 (ARK-991 table) |
| "The design is finished: 84 screens, all of them in the demo below." | `design/ux2/README.md` ("84 prepared screens"); the prototype's screen list |
| "The app itself is being built, with its planning engine, its database and its first screens." | Calvetra `main`: merged #35 (V2-10 engine), #39 (V2-12 real server), #31 (import and catalogue), #33 (Library); `apps/client/README.md` (48 of 84 screens). Calvetra's README still says "Nothing is built yet" (old) |
| "Calvetra isn't open to students yet." | unchanged; no public launch on `main` |
| "It opens in your browser, needs no account, and keeps nothing." | the demo file: no network, no storage (checked) |
| Demo label / captions "From Calvetra's clickable demo, with sample data. Names and numbers are invented." | the brief's words; the demo's own "Every name and number here is invented" |
| Proof's three Calvetra captions | the Calvetra page's own lines (ARK-991 table) |
| Proof / Method Revalk "earlier work", past tense | ARK-991's Revalk row (shelved, 2026) |

## Press, Privacy and Terms: links only (ARK, "do what you recommend"); claims that are now old
- **Press:**
  - "Over 2,400 assignments processed in production" (no source);
  - Maulya as "a workflow operating system … external associates … controlled release", with the old logo;
  - Revalk as a "Study OS product mark" and "**Currently in early access**" (it is shelved);
  - "Both flagship products (Maulya and Revalk)" (Calvetra is missing; Revalk is earlier work).
- **Privacy:** still the "Replace this placeholder with your legal policy before launch" page.
- **Terms:** still the placeholder, and it names "early-access product participation".
- **Studio** (words unchanged):
  - the prices "mid-5 figures", "mid-6 figures" and "low-5 figures";
  - "a few builds per quarter";
  - "Pilots and partnerships … with creators, cohort owners, and platform partners" (Revalk-era wording).

## Checks (on the built `dist/live/`, served locally, through `heavy.sh`)
`~/Downloads/Maulya/5_PLANS_AND_REFERENCE/SITES_REFRESH_2026-11-19/nas/after2/`:
- **`audit.txt`, with 70 pictures:** 14 pages × 360, 390, 768, 1280, 1440.
  - Every page: one `h1`, no console error, no failed request, no sideways scroll, every image with width, height and
    alt, and all 16 links open.
- **`recheck.txt` + `recheck/`:** the five changed pages after the last fixes. No contrast, tap, scroll, head or `h1`
  fault.
  - The fix: the Projects card's "How it's built" kicker was dark on green (`.pj-card p` won). Raised to
    `.mx-stage .mx-stage__kicker`.
- **`keys.txt`:** a visible focus on every stop of every page. The one exception is Contact's lane radio, which is 0×0
  by design; its tile shows the ring, as in ARK-991.
  - The phone menu opens on Enter, Escape returns focus to it, and the links show without script.
  - Contact's Maulya panel now offers only the studio's email and "Sign in".
- **Older pages:** the script reads 1.25–3.8 contrast on some kickers and headings on Method, Proof, Studio, Contact
  and Press. These are the same layered backgrounds ARK-991 recorded; the pictures show dark text on light cards.
- **Grep:** no internal codes, host names, IPs or vendors in any served file; no "early access" for Maulya; no
  "Trademark".

## Left
- Upload (ARK's): the card in `3_DEPLOY/SITE_NAS_2026-11/README.md`.
- `public_hostinger/` and the 22 MB `NotAloneStudios_hostinger_ready.zip` in the repo are the stale March copy; left as
  they were.
