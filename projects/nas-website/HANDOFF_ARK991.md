# HANDOFF · MLP/ARK-991 · notalonestudios.com rebuilt around Maulya (Fri 20 Nov 2026, ~00:30 IST)

**Built, checked, not uploaded.** Branch `nas-site/2026-11-refresh` (from `origin/main` `caa765c`, the live version).
Upload folder `dist/live/` and zip `dist/notalonestudios.com_2026-11-20.zip` (made by `bash build/build.sh`, not in git),
copied to `~/Downloads/Maulya/3_DEPLOY/SITE_NAS_2026-11/` with its README. Lane LW, Opus 5.5, no helper agents.

## Task 0, in short
- `origin/main` is byte-identical to the live site (13 pages, CSS, JS, video; PNGs pixel-identical). `db78f03` on
  `maulya-site/2026-11-new` changed these pages in March but was never uploaded, so it is not the base.
- **`/products/calvetra/` is 404 live.** The page #36 described exists only in `~/Downloads/NotAloneStudios_hostinger_ready 2.zip`
  (10 Jul 2026). `/calvetra/` 302s to `calvetra.notalonestudios.com` (a host rule, not in the repo).
- **`calvetra.notalonestudios.com` opens** and shows Calvetra **v2** (Plan · Topics · Library, the UX-2 welcome words)
  under "Review mode: sample data, kept on this device."; "Look around first" opens Topics (Biochemistry, Microbiology).
- Before pictures and the fault list: `~/Downloads/Maulya/5_PLANS_AND_REFERENCE/SITES_REFRESH_2026-11-19/nas/before/`,
  `…/nas/FAULTS_BEFORE.md`. After pictures: `…/nas/after/`.

## How it is built now
- Still plain HTML, no build step to run the site. **`build/frame.py`** writes the shared `<head>` (title, description,
  canonical, social card, icons), header, footer and scripts into all 13 pages between `<!-- nx:… -->` markers;
  `python3 build/frame.py --check` says if a page drifted. **`build/build.sh`** copies only the files the pages name into
  `dist/live/` and zips it (it stops if a named file is missing).
- **`assets/studio.css` + `assets/studio.js`** (new): Part 1 the header/footer every page shares; Part 2 the rebuilt pages
  (`<body class="nx">`); Part 3 four small fixes on the older pages. The older pages still load `site.css` + `site.js`.
- Tools (through `heavy.sh`): `build/tools/audit-nas.cjs` (h1, console, failed requests, sideways scroll, tap size,
  contrast, headings, image attributes, head tags, motion, every link) and `build/tools/keys-nas.cjs` (Tab through every
  page with a visible-focus check, the phone menu, Contact's lanes).

## What changed, page by page
| Page | Change |
| --- | --- |
| **Home `/`** | Rebuilt. Maulya first and largest (its green-tile mark, "Live · early access for firms", the system angle, "Explore Maulya" → `https://maulya.in/`, "How it's built" → `/products/maulya/`, "Sign in" → `https://app.maulya.in/`); four principles and the seven-state track; Calvetra next (its welcome line, three ideas, prototype pictures, → `/products/calvetra/`); the studio's three offers and the method; a closing band to `/contact/#studio`. Revalk, the tabs, the carousel, the video, count-ups, unsupported numbers, pilots and the dead "system card" are gone. |
| **Projects `/products/`** | Rebuilt, titled "Projects". Maulya (live), Calvetra (in development), Revalk (earlier work, 3 screens, closing line), and a band for systems builds. |
| **`/products/maulya/`** | Was a redirect to `maulya.in/product/`; now the systems page: seven principles, the seven states, the shape of the system, links to maulya.in and its early access. |
| **`/products/calvetra/`** | New (was 404): v2 from Calvetra's own documents; status; four ideas with 8 prototype screens; the three places; what it won't do; early access by email; the review build linked. |
| **`/products/revalk/`** | Rebuilt as an archive entry: "Earlier work · 2026 · no longer in development", what it was (past tense, its own page's words), 3 screens, "The studio's study work continues in Calvetra." No calls to action. |
| `/products/zenops/` | Redirect now to `https://maulya.in/` (was `maulya.in/product/`), with a canonical and `noindex`. |
| Method | Frame; "See it in Maulya"/"Explore Maulya" → `https://maulya.in/`; the two Revalk buttons and "Two live products" off; an invalid SVG `orient` fixed (console error). Words unchanged (ask 5). |
| Proof | Frame; "Open Maulya Page"/"Explore Maulya" → `https://maulya.in/`; "Browse products" → "Browse projects"; width/height on its 5 pictures. Words and pictures unchanged (ask 5). |
| Studio | Frame; "See Maulya (reference system)" → `/products/maulya/`. Words unchanged (ask 5). |
| Labs | Frame; breadcrumb "Home / Products / Labs" → "Home / Labs"; "Back to products" → "All projects". |
| **Contact** | Frame; the placeholder WhatsApp (`wa.me/0000000000`) off; Revalk's lane → **Calvetra** (email us); **Maulya's lane** no longer posts to the retired `app.maulya.in/api/partner/request-access/handoff`: it points to `maulya.in/early-access/` and sign-in; **the Studio form now opens the visitor's email app with the brief filled in** (it used to say "Brief received… within 24-48 hours" and send nothing); its confirmation says so plainly. `site.js`: the new submit, `#calvetra` in the lane list, `maulya.in/product/` → `maulya.in/`. |
| Press, Privacy, Terms | Frame (and width/height on Press's logos). Words unchanged (ask 5). |
| Site-wide | Header "Projects · Method · Proof · Studio · Contact"; footer lists all three projects; skip link; canonical, description, Open Graph and Twitter card on every page; `robots.txt`, `sitemap.xml`, icons; WebP logo (5–11 KB, was a 435 KB PNG). |

## Claims table: every sentence a visitor reads on the rebuilt pages
Maulya's code is read at `~/V3-lanes/laneI-inspect` `origin/main` = `6884772c2` (12 Nov, Deploy 14b); paths are under
`services/api/app/` unless they start otherwise. "maulya.in" = the live site on 19 Nov. "Calvetra docs" = `~/Calvetra`
`main` `6ed840e`. "my call" = my words, listed for ARK.

### Maulya (Home's Maulya part, Projects, `/products/maulya/`)
| Sentence (short form) | Source |
| --- | --- |
| "Office software for property valuers" | maulya.in `<title>` ("Maulya: office software for property valuers") |
| "Live · early access for firms" | maulya.in "Apply for early access" + `app.maulya.in` in production; my call on the label |
| "keeps each bank valuation in one file, from the day it comes in to the day it is paid" | maulya.in ("keeps a bank valuation file in one place, from the day it comes in…"; "From the day it comes in to the day it is paid.") |
| "the server decides where every file stands and what happens next, and every screen … shows that one answer" | `services/assignment_next_step.py` ("So the page and the Queue cannot say different things"), `services/file_states.py` ("pages read the answer and never derive their own"), `services/abilities.py` ("the screens never work it out") |
| "Already invited by your firm? Sign in." | maulya.in's own line; → `https://app.maulya.in/` |
| "The system under a valuer's office." / "How Maulya is built." / "Built so a firm can trust it." / "Why a firm can trust it." | my call (headings) |
| 01 "Every request carries its firm" | `db_context.py` (`tenant_id_var` set per request) |
| 01 "the database draws the same line itself, with row-level rules … one firm's files never show up in another's" | `services/migrations/versions/20260305_0002_identity_rls.py` and the RLS migrations after it; **true from the switch of 20 Nov** (the API logs in as the restricted role only once `APP_DATABASE_URL` is set). **ARK-993 checks it before any upload.** |
| 01 "The server won't start on a database login that could step past them" | `database_role.py` (refuses a superuser, `bypassrls` or owner-member login when `APP_DATABASE_URL` is set) · **from the 20 Nov switch** |
| 01 "work that spans firms runs one firm at a time" | `firm_by_firm.py` |
| 02 "A file is always in one of seven states, with one next step … the file's page and the queue ask the same code" | `services/file_states.py` ("one of seven states"), `services/assignment_next_step.py`, route `GET /api/v3/workspace/file-states/counts` (`api/routes/file_states.py`) |
| The seven names (Not started … Delivered) and their one-line notes | `services/file_states.py` docstring (names, exact); notes shortened from maulya.in's "How a file moves" steps 1–7 |
| "the file moves on only when the server agrees it can" | `services/approval_guards.py`, `services/finalise_approves.py` ("a file the approval guard refuses (… the wrong step)"), `services/assignment_gates.py` |
| "Each step names who acts next" | maulya.in ("Each step names who does it"); the file page's "That's for <person>" |
| 03 "Actions on a file are written to an audit trail: who, when, and what it was before and after" | `services/audit.py` (actor, request fingerprint, `before_state`/`after_state`) |
| 03 "Records about money and access are kept longer than routine ones" | `services/audit.py` (governance, billing and sensitive reads `extended` 1 y; the rest `standard` 90 d) |
| 04 "each site photo is kept the moment it's taken, then sent by itself when there's signal, trying again after a failure. However often it's sent, it arrives as one photo." | `apps/web/src/nativeApp/siteUploads.ts` (kept "the moment it is taken"; "when the signal returns, after a failure (30 s, doubling)"; "a photo is one document however often … it is sent"), `apps/android/…/SiteUploadWorker.java`; maulya.in ("kept on the phone first, then goes to the office by itself") |
| 05 "Reports are filled into the lender's own template" | `services/repogen_policy.py` (template families by lender: cooperative, SBI, other banks) — I did not write "each bank's own format": three families, not one per bank |
| 05 "A draft carries a DRAFT mark and can be remade as the figures change; a final is issued once and frozen" | `services/repogen/docx_render/render.py:101-106` (watermark only on a preview), `services/repogen_pipeline.py:1611-1613` ("a preview may be regenerated many times …; a final is issued once and frozen") |
| 06 "who may change the figures, who may see money, who may finalise. The server checks each switch on every request" | `services/person_switches.py` (`change_figures`, `see_money`, `finalise`; "the server's checks on them"), `services/abilities.py` |
| 07 "Every change runs the automated checks before it's merged" | `.github/workflows/ci.yml` (`pull_request` and `push: main`) — branch protection itself is not in the repo |
| 07 "A release goes out only after they pass, takes a fresh backup first, and rolls itself back if the health check fails" | `infra/deploy/maulya-deploy` header ("refuses … unless CI for it on main concluded success"; "backup … goes back by itself if health fails within 5 minutes"), `infra/deploy/lib/steps.sh:12-27` |
| 07 "Database changes follow a written runbook" | `infra/deploy/maulya-deploy` ("Migrations, seeds, settings and infra keep their cards"); the deploy cards in `3_DEPLOY/` |
| "The office works at a desk in the browser; site engineers work on the phone." | maulya.in ("The site visit, on the phone"); `apps/web` |
| "Written in Python" / "PostgreSQL, with row-level rules" | `services/api` (Python), the migrations (PostgreSQL RLS, `pg_roles`) — general names only, no versions |
| "one release command, with a backup before and an automatic way back" | `infra/deploy/maulya-deploy` ("production's one deploy command") |
| "Keeping the rules in one place is what lets the desk, the phone and the reports agree." / "A valuation office hands Maulya its files, its photos and its reports. These are the rules the code keeps so that trust is earned." | my call |
| "maulya.in tells the product story …" / "Who it's for, how a file moves …, pricing, and early access for firms." | maulya.in's menu (Product, Who it's for, Pricing, early access) |
| "From Maulya's app, with review data." (captions) | the pictures are maulya.in's, taken in review mode ("Review Demo Firm") |

### Calvetra (Home's Calvetra part, Projects, `/products/calvetra/`)
| Sentence | Source |
| --- | --- |
| "Plan your preparation from what rankers, faculty and students say matters." | `design/ux2/WORDS.md` (the welcome's one line) |
| "Calvetra v2 is the Library, the Planner and the Topic Board, for NEET PG and INI-CET aspirants, on a model that works for any exam." | `README.md` line 3 (word for word) |
| "In development" | `README.md` ("Nothing is built yet"), git history (CAL/ARK-06 database foundation, 11 Oct) |
| "In development, built slowly, by choice." | `REBUILD_V2_PLAN.md` §0 ("The pace: slowly, by choice"; Shrinivas: "we'll build this slowly") |
| "The design is finished as a clickable prototype of 84 screens." | `design/ux2/README.md` ("84 prepared screens") |
| "The building has started with the database's foundation and the syllabus's topic tree." | git log `main`: `635fd64` CAL/ARK-06 "the database's foundation: access, exams and the topic tree"; `2cfcc8e` CAL/ARK-08 topic tree for Biochemistry and Microbiology |
| "Calvetra isn't open to students yet." | `README.md`; `PROGRESS.md` (closed beta not reached) |
| The verdict paragraph ("one sentence, always 'about', always marked as an estimate", the two examples, "See what to drop", "lowest-rated topics … with its voices, which you can untick", "Adding time comes second", "The last 10 days are always revision") | `design/ux2/README.md` idea 1 (near word for word) |
| Anyone's plan paragraph (ranker's 10-month plan, intern 24 h a week, what had to give, "self-reported"/"tracked in Calvetra", never "verified"; "a resource you use, like a book") | `design/ux2/README.md` idea 2 and "The map" |
| Voices paragraph (fixed order Rankers · Faculty · Students · Past exams; "7 of 9"; "61% of 512"; "a formula printed on the page") | `design/ux2/README.md` idea 3; "Past exams, once cleared" = `WORDS.md` "coming once cleared" |
| Freeform paragraph (routine slots, "07:00–09:00 · New study", pins, Undo, "eight fixed rules … not AI", Not now / Never for this / why?) | `design/ux2/README.md` idea 4; `WORDS.md` ("Fixed rules with published thresholds, not AI.") |
| Plan / Topics / Library cards | `design/ux2/README.md` "The map", `WORDS.md` "The places" ("Plan opens on Today, because the daily list is the reason to open the app"; "Facts first, then voices, then counts, on every page") |
| "Nothing is sold by fear." / "Short sentences a tired intern can read at 2 a.m." / the five "won't" lines | `WORDS.md` voice rules 3, 4, 6, 7; "Words retired" (rank prediction, leaderboard, streak); Library ("Platforms can't rate anything, and can't pay for position.") |
| "Blunt about the data, warm about the person." | `WORDS.md` voice rule 1 |
| "An honest verdict." / "Anyone's plan, fitted to your months, with the honest list of what had to give." / "Voices side by side, never blended" (Home) | `design/ux2/README.md` ideas 1–3 |
| "Every plan gets an honest verdict, and when it's short, Calvetra asks what to drop before it squeezes more into each day." (Projects) | `WORDS.md` Whole plan line ("When a plan is short, Calvetra asks what to drop before it squeezes more into each day.") |
| "Ask for early access" (email) / "Want to hear when it opens? Write to us and we'll tell you when Calvetra is ready for students." | **my call** (the `contact/#calvetra` part did not exist; see ask 2b) |
| "Look around the review build" / "The review build runs on sample data, kept on your own device." | Task 0: the build's own bar says "Review mode: sample data, kept on this device." · **ask 2** |
| Captions "From Calvetra's design prototype. Names and numbers are invented." | #36's call (brief); the prototype's own line "Every name and number here is invented for the prototype." |
| "Next from the studio" / "A study planner for NEET PG and INI-CET." | my call (headings) |

### Revalk (Projects, `/products/revalk/`)
| Sentence | Source |
| --- | --- |
| "Earlier work · 2026 · no longer in development" | Revalk's repo (`~/NEETPG2026`, first commit 21 Feb 2026, last 7 Mar 2026; 58 commits) and this site's history (page from 24 Feb 2026); ARK: shelved |
| "A calm study lab for NEET PG and INI-CET aspirants." | its page: "Premium study OS for NEET/INI", "Calm, tablet-first study lab" |
| "Revalk was a study product the studio built in early 2026. It is kept here as part of the studio's record of work." | repo dates; second sentence my call |
| "turned confusion into something you could revise … topic spaces … private Vault … Walk Pack: a few flashcards, a trap note and a short audio recap" | its page ("converts doubts into recall packs"; "Explore, collect, master"; "1 concept unit, 3 flashcards, 60-sec audio, 1 trap note") |
| "recall under a little pressure, a retest before the memory dropped, and a view of what was sticking and what was not" | its page ("Train: Practice under time and pressure"; "Retest: Come back before the memory drops"; "Track: See what is sticking and what is not") |
| "tiered from Iron to Platinum by how close they sat to past exam topics: a relevance rank, not a quality rank" | its page ("This is not a quality rank. It is a relevance rank.") |
| "built for long, quiet sessions on a tablet, with no feed and no chat" | its page ("Calm, tablet-first study lab with no feed, no scrolling UI, and no chat clutter") |
| "The studio's study work continues in Calvetra." | the brief's default · **ask 1** |
| "Revalk's screens, as they were." | my call. 3 screens (Topic Space, Explore, Walk Session); **Vault left out: it shows an "audio play failed" error toast** |

### Studio (Home, Projects)
| Sentence | Source |
| --- | --- |
| "Not Alone Studios is a systems product studio." / footer line | live header "Systems Product Studio"; footer "We build Maulya and Calvetra, and take on selected systems builds" my call from the live words |
| "Selective systems builds with product-grade finish." + "We design and build workflow-heavy software …premium execution." | live Home (studio slide), word for word |
| Blueprint / MVP build / Ops hardening and "7 days · scoped", "4–6 weeks", "2 weeks" | live Studio page offers (prices left off Home; they stay on Studio, ask 5) |
| Capture / Enforce / Release lines | live Method page, shortened |
| "Have a workflow that needs a system?" + "Send the process mess, the outcome you want …" | live Studio page ("Send the process mess, desired outcome, timeline, and budget range. If it fits, we'll suggest the right engagement.") |
| "And selected systems builds. Beside its own products, the studio takes on a few builds for operations-heavy workflows where evidence, gating and traceability matter." | live Studio page ("a few builds per quarter for operations-heavy workflows where evidence, gating, billing discipline, and traceability matter") |
| "What the studio has built: one product live, one in development, and one earlier project kept on the record." | the three statuses above; my call on wording |

### Contact (behaviour, not content)
| Text | Source |
| --- | --- |
| "Maulya lives on maulya.in" / "Firms apply for early access on Maulya's own site. Already invited by your firm? Sign in to the app." | maulya.in; my call on wording |
| "Hear when Calvetra opens" / "Calvetra is in development. Write to us and we'll tell you when it's ready for students." | my call (ask 2b) |
| "This opens your email app with your brief filled in. It is sent when you press Send there." / "Your email is ready to send …" | my call: what the form now actually does (it sent nothing before) |

## Pictures
**To swap (ARK-993 retakes from Deploy 15; same file names):** `assets/screens/maulya/app/phone-home-owner-{390,780}.webp`,
`phone-visit-photos-{390,780}.webp`, `phone-visits-list-{390,780}.webp` (copied from `maulya-site/2026-11-new:projects/maulya.in/src/assets/media/app/`).
I left out maulya.in's desk pictures: they show the signed-in person's name ("R. S. Kulkarni", "Kavya Joshi"); the brief says no
person's name. If the retake has a desk picture with no name in it, Home's and the Maulya page's stage can take one.

**Maulya's mark:** `assets/brand/maulya/maulya-app-icon-rounded.svg` (+ `maulya-mark.svg`, `maulya-lockup-no-tagline.svg`) from
**`origin/srk/site-logo-1110`** (Shrinivas's logo branch, "founder's own SVGs"; not yet merged into `maulya-site/2026-11-new`, and
maulya.in live still shows the old scales logo). The social card uses that branch's `maulya-icon-512.png`.

**Calvetra (new):** 8 screens from `~/Calvetra/design/ux2/prototype/index.html?screen=<id>&theme=light` (the dashed "Prototype"
button hidden; its own purple "Sample" line kept): `10-today`, `30-short`, `31-drop-list`, `41-week-dragged`, `71-adopt-preview`,
`101-board`, `104-topic`, `110-library`, phone at 390 px ×2 and desk at 1280 px. Files `assets/screens/calvetra/`. No company name
appears in any shot's text (checked). Dark shots were taken (`30-short`, `101-board`, `10-today`) but not used.

**Revalk:** existing `assets/screens/revalk/` files only.

## Checks (after, on the built upload)
Run through `heavy.sh` on the built `dist/live/` (served locally). Files: `…/nas/after/audit.txt`, `audit-reduced.txt`,
`keys.txt`, `recheck/` (Method, Studio, Contact after the last CSS fix) and 94 pictures (`<page>__<width>[__reduced].png`).
- **13 pages × 360, 390, 768, 1280, 1440 px (65):** one `h1` each; no console error; no failed request; no sideways
  scroll; every image has width, height and alt; title, description, canonical, `og:image`, `og:title` on every page;
  no heading skips. **All 18 links open** (internal and external: maulya.in, its early access, app.maulya.in, the
  Calvetra review build).
- **Reduced motion (390 and 1440, 26):** no running animation, no playing video. (The new pages have no autoplay at all;
  the one reveal is skipped under reduced motion and never hides content without the script.)
- **Keyboard (1280 and 390, every page):** the first stop is "Skip to the content"; every stop shows a visible focus,
  except Contact's lane radio, which is 0×0 by design: its tile now shows the ring (`.lane-tile:focus-within`). Phone menu:
  Enter opens it (`aria-expanded=true`), Tab reaches "Projects", Escape closes it and returns focus to "Menu"; the current
  page is marked `aria-current`. Without script all 5 header links show. Contact: `#maulya`, `#calvetra`, `#studio` open
  their panels; a filled Studio brief opens `mailto:hello@notalonestudios.com?subject=Studio build application&body=…`
  and the confirmation says "Your email is ready to send".
- **Tap targets:** none under 44 px on the new pages; the older pages' small buttons and breadcrumbs raised to 44 px.
- **Contrast:** the new pages pass (AA). On the older pages the script reports 1.25–3.8 on some kickers and headings; the
  pictures show dark text on light cards (the script can't read their layered translucent backgrounds). Their muted text
  colour is a little darker now.
- **Weight:** new pages 167–513 KB (Home 305 KB, was 760 KB); the logo 5–11 KB (was 435 KB).

## Left, and known
- **Not uploaded.** ARK-993 writes the upload card. Upload `dist/live/` as the site root; the old files on the host that are no
  longer named (old Maulya PNGs, the hero video) can stay or go.
- The older pages' words (Method, Proof, Studio, Labs, Press, Privacy, Terms) still carry claims listed in `FAULTS_BEFORE.md` §2
  (ask 5). Privacy and Terms are still the placeholders. Press still says "Over 2,400 assignments processed in production",
  shows the old Maulya logo and Revalk as a flagship.
- The audit script reads 1.25–3.7 contrast on some older-page headings and kickers; the pictures show dark text on light cards
  (the script can't see through their layered translucent backgrounds). I darkened `--muted` slightly anyway.
- `public_hostinger/` (the March upload copy) and the 22 MB `NotAloneStudios_hostinger_ready.zip` in the repo are stale; I left
  them. The new upload is `dist/` (ignored by git).
- Calvetra's page has no logo file of its own (the name is set in Fraunces); I did not invent one.
