# Handoff · MLP/ARK-693 · maulya.in: alignment, the workflow in motion, an honest pull to apply

Lane LW, Sun 8 → Mon 9 Nov 2026 (night), main chat #30.

- **Branch:** `maulya-site/2026-11-new`, from `bf0b39e`. Parts 1–3 are at `da25cda`; the last commit is in `7_STATUS/LW.md`.
- **Nothing is deployed or uploaded.** The live maulya.in is untouched.

**BUILT, NOT PROVEN by a person.** I checked it in a browser, by script and by eye (below). Nobody has read it on a real phone.

## Pictures and lists

All in `~/Downloads/Maulya/5_PLANS_AND_REFERENCE/SITE_2026-11-09/`:
- **`FAULTS_BEFORE.md`:** the 25 faults found (page, element, width, what was off).
- **`before/`** and **`after/`:** every page at 360, 768, 1280 and 1440 px (`<page>__<width>.png`), plus:
  - 360 and 1440 with reduced motion (`__reduced`);
  - the open phone menu (`menu-open__360/768`).
- **`after/` only:**
  - the journey part-way through: steps 2, 5 and 7, at 360 and 1440, with and without reduced motion (`journey-step*`), and with no script (`journey-no-script__1440`);
  - the keyboard walk (`keys-*.png`).
- **`audit.txt` / `audit-reduced.txt`** in each folder: the measurements (tap targets, line length, contrast, heading order, layout shift, page weight).

## What changed

**Part 2: the faults, fixed in the site's own look.** No colour, font or component is new.
- **White sections:** a white band after a plain one keeps its top space. Before, "How a file moves", "Who uses it", "Questions" and "Reports and fees" sat on the band's edge.
- **About:** the founders' photos crop from the top, so faces stay in the frame. Shrinivas's face was cut off before.
- **Pricing:**
  - The two fact lists no longer draw a tick over each row's first letter.
  - A hidden "The plans" heading keeps the heading order.
- **Tap targets of 44 px or more:** footer links, the logo, the seven-step scale on a phone, and the article contents on a phone.
- **Footer:**
  - "Maulya" at its intended size, lined up with the column headings.
  - A hairline between the green closing band and the green footer.
- **Phone menu:** opens the full width, with a shadow, and scrolls if it is taller than the screen.
- **Home hero (≥1000 px):**
  - The heading and the words beside it start on the same line; the kicker no longer floats above an empty gap.
  - The gap below the pictures drops from 180 px to at most 112 px.
- **Bordered grids:** no double right edge (the five places, "What Maulya is not", the plans).
- **Six jobs:** rows of three (two on a tablet, one on a phone), instead of four then two.
- **Line lengths:** the "one file" box and the notes are capped. On a phone the equals mark stacks above the words instead of squeezing them.
- **Blog:** the at-a-glance chips no longer take the article's list margins, and the category counts lose an opacity they didn't need.

**Part 3: "How a file moves" (Home), told in motion.** In `src/pages/journey.mjs`, `src/assets/journey.css` and about 40 lines in `site.js`.
- **Seven steps, on the app's seven places,** in Shrinivas's train's words (mlp/srk/srk-train-2026-11-08 @ `347e8e21a`; SRK-84 to SRK-90). Each step has who does it and "On the screen:" quotes.
  1. **A new file, made once.** Documents this bank will need; give it to someone.
  2. **The site visit, on the phone.** "Done at the site", "Who should check this visit?" (SRK-84). The measured floors become the actual built-up area (SRK-90).
  3. **The visit is checked** by the owner or an assistant valuer: accept, or send back to the site engineer (SRK-84, SRK-88).
  4. **Make the report.** The form in groups (SRK-87). Office staff fill the whole form, and the two rates stay with the valuer (SRK-86 R2). "Next: they read it and approve it." (R4)
  5. **Approve the report, in one press.** It also asks "Who prints, signs and hands it over?" (R5, R6). Nobody approves their own report.
  6. **Print, sign and hand over.** "Mark it printed / signed / handed over"; "Record a payment" at hand-over (R8, SRK-89).
  7. **Handed over, paid, and kept.** "✓ Complete": the file closes itself when paid (SRK-89).
- **The motion:**
  - A file card (the review mode's made-up "Borrower K") rides beside the line on a computer, or at the top of the steps on a phone. It shows the place with the app's seven-bar mark, the last history line and the next step, for the step being read.
  - The line fills to that step, and each step comes in once as it is reached.
  - **Reduced motion:** the same list stands still, and the card still follows.
  - **No script:** the list alone, with no card.
  - The card is `aria-hidden`; the ordered list carries every word for a screen reader or a keyboard.
  - No library. Layout shift is 0.000 (`audit.txt`).
- **The word "seal":** the brief's example said "print, sign and seal". The web app never says "seal", so neither does the site. (The phone app's "sign and seal" screens are ARK's Deploy 15 work, not his train.)
- **Product's tabbed seven places** (with the app's screens) and **Who it's for** (office staff, assistant valuer) now use the same words. Their old lines contradicted SRK-86: "office staff never enter figures".

**Part 4: an honest pull to apply.**
- **The working day:** Home's "five places" now uses Shrinivas's own lines from his posts:
  - the measurement "somewhere between a payment screenshot and another file's photo";
  - the report "half-finished in a Word template";
  - "Final, Final1 and Final_new";
  - "repeated phone calls".

  The three posts are cited. Their links become plain titles in the live build, because the posts are unpublished.
- **Trust, Ruling 20 in its words (25 Sep), on Home and `/early-access/`:** "Nothing from one firm's reports ever reaches another firm. That includes market and guideline rates, values, comparables and suggestions." It links to the privacy notice.
- **Real authority, on Home:** "Built by a practising registered valuer", with Shrinivas's photo (a 9 KB crop) and the About page's own sentence about him. It links to About. No new credential.
- **Lower effort:**
  - Home's closing band adds three plain steps: you apply → we choose 10 to 15 firms and write to the ones we choose → six weeks free on your real work.
  - `/early-access/` now has "What happens after you apply" with the same steps, under a real `h2`.
- **Scarcity and price:** nothing new. "10 to 15 valuation firms, chosen from the applications" and "free for six weeks" are Shrinivas's words, already on the site. No countdown, no "spots left", no testimonial, no count, no logo.
- **One gold button per page** stays "Apply for early access".

**Part 5: reach and speed.**
- **Accessibility:**
  - AA contrast on every page and width (the survey's gradient button reads as a script artefact; it is fine by eye).
  - Visible focus rings.
  - Tap targets of 44 px or more.
  - Headings in order (the posts' own `h2 → h4` jumps are in his Markdown: left as he wrote them).
  - Alt text on every image.
- **Page weight:** Home is about 320 KB at 1440 px.
- **`/early-access/`:** works and is reached from every gold button (the keyboard walk). The app's sign-in pages link there from Deploy 14 (PR #491).

**Checked after (`after/audit.txt`, the keyboard walk, the journey run):**
- **Clean on all 13 pages × 4 widths:** one `h1`, no sideways scroll, no console errors or failed requests, layout shift ≤ 0.001.
- **The keyboard walk:**
  - every Tab stop on Home shows its ring;
  - the scale's arrow keys work (now on Product);
  - Enter on the header's gold button opens `/early-access/`;
  - the phone menu opens with Enter and closes with Escape.
- **The journey:** the card reaches "Delivered / ✓ Complete" at step 7; with reduced motion no step is ever hidden; with no script all 7 steps show and the card isn't drawn.
- **Left as they are:**
  - The blog's checkbox is 24 px, but its whole 48 px row is the target.
  - The survey's 40 px close button: the survey is kept as it was.
  - The `h2 → h4` jumps in his post's Markdown.

**Tools:** the old Playwright checkout `~/V3-lanes/site-shots` is gone. Every tool now uses `~/V3/node_modules/playwright`, or `PW=<path>`. New: `build/tools/audit-site.cjs` and `build/tools/journey-site.cjs` (README beside them).

## Before uploading (ARK)

1. **Upload after Deploy 14 is live, not before.** Home and Product now describe Deploy 14's app: approve in one press, who checks the visit, payment at hand-over, a paid file closing itself. Production (Deploy 13) doesn't do all of that yet.
2. The form link (`earlyAccess.formUrl`) is still empty, as on Saturday (deploy card step 0b).
3. Run `node build/build.mjs`, then upload `Maulya_hostinger_ready.zip` with `3_DEPLOY/CARD_MAULYA_IN_SITE_2026-11.md`.

## For the founders to answer (also atop `7_STATUS/LW_ACTIONS.md`)

1. **Shrinivas: may Home quote your draft posts' lines?** The "five places" lines come from three posts still in "Draft for Review". If not, I put back the old five lines (the site's own).
2. **Shrinivas: may Ruling 20 be published in these words?** It isn't in `docs/FOUNDER_RULINGS.md` yet (SRK-22 open). If the words should differ, give me the sentence.
3. **#30's / my calls, ARK may overrule:**
   - Home's tabbed scale became the scrolling journey; the tabs with the screens stay on Product, linked from Home.
   - The card's sample file is the review mode's "Borrower K".
   - "Who built it" sits just above the closing band.
