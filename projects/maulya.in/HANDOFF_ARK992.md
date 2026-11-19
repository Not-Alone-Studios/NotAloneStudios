# Handoff · MLP/ARK-992 · maulya.in: a careful design pass, Shrinivas's words and early-access page untouched

Lane LW, Fri 20 Nov 2026 (night), main chat #36. Ran on Opus 5.5, no helper agents.

- **Branch:** `maulya-site/2026-11-polish`, from **`origin/srk/site-logo-1110` @ `21d7840`** (Shrinivas's logo branch, which holds his early-access branch `a0decc0` whole). The commit is named in `7_STATUS/LW.md`.
- **Live today is `551b66f`** (`maulya-site/2026-11-new`'s build; every live file byte-identical to it once the `?v=` cache-buster is set aside). None of his branch work is live yet.
- **Nothing is uploaded, deployed or published.** The zip is in `~/Downloads/Maulya/3_DEPLOY/SITE_MAULYA_IN_2026-11-20/` with a README.

**BUILT, NOT PROVEN by a person.** Checked by script in a browser at 360, 390, 768, 1280 and 1440 px, and by eye in the pictures. Nobody has used it on a real phone.

## The files I kept away from

Every file his two open branches change (157; the full list is in `7_STATUS/LW.md`, ARK-992 Task 0): `site.config.mjs`, `build/build.mjs`, `build/layout.mjs`, `build/blog.mjs`, the `build/tools/` checks he changed, `src/assets/site.css`, `apply.js`, `visit.js`, the brand files, `src/pages/home.mjs`, `early-access.mjs`, `early-access-apply.mjs`, `legal.mjs`, `src/survey/index.html`, the content files, and the build outputs (`Maulya_hostinger_ready/`, `public_clean/`, `public_hostinger/`, the two zips).

**The build outputs are not committed on this branch:** they are his branch's files. `node build/build.mjs` remakes them from the sources (the zip in `3_DEPLOY` was made that way).

**So the polish lives in four files he doesn't touch:** `src/assets/journey.css` (Home already linked it; Product, Who it's for and Pricing now link it too, through the page's own `extraHead`), `src/assets/site.js` (every page loads it), and `src/pages/product.mjs`, `for-whom.mjs`, `pricing.mjs`. It adds rules after `site.css`; it edits none of his.

## What changed, page by page

**No visitor-facing word changed.** A script compared every page's text, base build against this build: the only difference is the existing label "Apply for early access" appearing once more, in the heroes of Who it's for and Pricing.

**Every page except the application form (`site.js`): "Apply for early access" within reach on a phone or tablet.**
- At 980 px and below, the header's gold button is inside the closed menu. Now a bar along the bottom carries the same link (cloned from the header: same words, same address, and "Join the waiting list" or nothing at all if the phase or `open` setting changes).
- It shows only after the first 320 px of scrolling, and only while no other gold button and no footer is on screen, so a page never shows two gold buttons at once. It goes while the menu is open.
- It slides in once, in 200 ms; with reduced motion it just appears (site.css's rule). While away it is `visibility: hidden`, so no key or screen reader reaches it.
- Not on `/early-access/apply/` (the form's own send button is the next step there). Never on a computer (≥ 981 px) or in print.

**Home** (`journey.css`; `home.mjs` untouched):
- **"Today, one file lives in five places":** on a phone the five places read one per row (before: two narrow columns, 6-line cells and "The valuer's memory" alone beside an empty half). On a tablet three then two, each row filling the width (before: four, then one alone).
- **"How a file moves", the motion:** each change now takes 200 to 250 ms (before 300 to 900 ms): a step comes in with a 12 px rise in 250 ms (was 24 px in 600 ms), the line fills to it in 250 ms, the dots and the card's seven bars change in 200 ms, and the card's new place and next step fade in over 250 ms (was a 900 ms gold flash). The equals mark levels in 250 ms (was 600). Nothing loops; reduced motion turns all of it off; no script still shows the plain list.

**Product** (`product.mjs`, `journey.css`):
- **The seven places:** a press moves the green line to the place in 250 ms (was 400), and the new panel comes in from the side in 200 ms (before it swapped with no sign of change), so each press visibly moves the file one place on.
- The equals mark in "With the valuer" levels in 250 ms.

**Who it's for** (`for-whom.mjs`): the hero now carries the gold "Apply for early access" (before, the first one on the page was after all six jobs, about 4,900 px down at 1440).

**Pricing** (`pricing.mjs`): the hero now carries the gold "Apply for early access" right under the offer (before, only the small link "About early access"; the first button was below the questions).

**About, Early access, the application page, Blog, Privacy, Terms, 404, the survey:** unchanged apart from the phone bar (not on the application page; the survey has its own page and doesn't load `site.js`).

## Checked

All against the built upload (`dist/live`, served on 127.0.0.1), every page at 360, 390, 768, 1280 and 1440 px, through `heavy.sh`. Pictures and lists: `~/Downloads/Maulya/5_PLANS_AND_REFERENCE/SITES_REFRESH_2026-11-19/maulya-in/after/` (before: `…/before/`, faults: `…/FAULTS_BEFORE.md`).
- **`audit-site.cjs`** (12 pages × 5 widths, and reduced motion at 360 and 1440): one `h1` on all 60; layout shift ≤ 0.001; no sideways scroll; no console error or failed request; every image sized with alt; contrast AA. Long lines: 7 flags before, 1 after (Product's "On the screen" line at one width, 702 px of small type). What is left is on his files: the survey's gradient button (reads 1.00 to the script, fine by eye), its 40 px close button, the form's 24 px tick (48 px row).
- **The phone bar, the five places, the motion (`bar.cjs`, 442 checks, all passed):** 11 pages × 360/390/768/1280 × motion and reduced. Same words and address as the header; off at the top; on mid-page; never beside another gold button or the footer; hidden from keys while away; off while the menu is open and back after Escape; never on a computer; none on the form; 200 ms, and 0 s with reduced motion. Five places: every row fills the width at 360, 390 and 768 (at 1280 and 1440 the five sit in one row, as before). Home's timings 200 to 250 ms each; Product's scale 200/250 ms. Pictures: `apply-bar__home__{360,390,768}.png`, `five-places__{360,390,768}.png`, `product-scale-step4__1440.png`.
- **Words:** a script compared every page's text with the base build: only "+Apply for early access" on Who it's for and Pricing. `check-apply.mjs`: 843 things compared with his `EARLY_ACCESS_FORM_CONTENT.md`, **no differences**; his name and photo only on About.
- **The early-access page and the form work exactly as before:** `apply-site.cjs` all passed (4 widths: buttons, every reply's words, Other, keyboard, missing list, "opens shortly" with no address, a failed send keeps answers, a good send shows his line with the 27 keys, reduced motion, no script); `server-site.cjs` all passed (the local stub only: counting events once each, 201/422/429/5xx/dropped connection, the trap field). Every send went to the tools' own fake address or the 127.0.0.1 stub; nothing reached the live server or Google.
- **Keyboard (`keys-site.cjs`):** every Tab stop on Home shows its ring; the scale's arrow keys; Enter on the gold button lands on `/early-access/apply/`; the phone menu opens and closes with Enter and Escape.
- **Journey (`journey-site.cjs`):** the card reaches "Delivered / ✓ Complete"; with reduced motion no step is ever hidden; with no script all 7 steps show and no card.
- **Links:** every internal `href`/`src` resolves (script over the build); `app.maulya.in/auth/sign-in` answers 200.
- **Head tags:** every page has a title, description, canonical, Open Graph image (file present) and Twitter card, except the survey (his file: no social image).

## What's left

1. **Shrinivas's words:** `~/Downloads/Maulya/5_PLANS_AND_REFERENCE/SITES_REFRESH_2026-11-19/maulya-in/WORDS_FOR_SHRINIVAS.md` (11 items, the strongest first: the application page's passed "16 November" start date; "six weeks" against "until 31 March 2027" on six pages; the tier prices against the app's).
2. **His standing lines against the live site** (in `FAULTS_BEFORE.md` §4 and atop `LW_ACTIONS.md`): prices (the app and the site say ₹2,000 / ₹3,500, his line says ₹2,799 / ₹4,199 / ₹6,999), "free until 31 Mar 2027" (the site says six weeks), his photo and name on the live Home and blog index (gone on his branch), the old logo live (his branch has the serif-M). "28 December" is nowhere; nothing says IBBI only.
3. **On his files, not changed (for him):** the survey page has no social image or Twitter card tags; Home's description is 203 characters (search engines show about 160); the application form's consent tick is 24 px (its 48 px row is the target).
4. **Pictures** stay as they are; ARK-993 retakes them from Deploy 15.
5. **Upload** (ARK, not me): after Deploy 15 and with his early-access settings decided (`sendTo`, `appsScriptUrl`: the build still warns that `appsScriptUrl` is empty, so the form collects nothing with `sendTo: "sheet"`). Merge order: his `srk/site-logo-1110` first (or this branch, which already holds it), then this branch.
