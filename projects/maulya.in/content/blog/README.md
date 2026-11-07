# The blog: how to add, approve or change a post

There is no server, no login and no CMS. A post is one Markdown file in this folder. The build turns every file into a page.

## Add a post (3 steps)

1. **Drop the `.md` file here**, named after its slug, e.g. `content/blog/site-visit-photos.md`. It starts with front matter like the others:

   ```yaml
   ---
   title: "How to Organize Site Visit Photos for Bank Valuation Reports"
   seo_title: "Organize Site Visit Photos for Valuation Reports | Maulya"
   meta_description: "One or two sentences. Shown on the card, under the title, in search results and as the 'In one minute' text when the post has no practical summary."
   slug: "organize-site-visit-photos-for-valuation"
   primary_keyword: "organize site visit photos"
   secondary_keywords:
     - "valuation site photos"
     - "bank valuation photo naming"
   category: "Site Visit & Evidence Collection"
   status: "Draft for Review"
   number: 33
   date: "2026-11-20"
   ---
   ```

   **Fields Shrinivas already writes:**
   - `title`, `seo_title`, `meta_description`, `slug`, `primary_keyword`, `secondary_keywords`, `category`, `status`. They are used as written.

   **Two fields the site adds:**
   - `number`: the post's place in the list. Shrinivas's own article numbers (1 to 32 so far). The next one is 33.
   - `date`: the day it goes on the site, `YYYY-MM-DD`. It is used by the feed.

2. **Build**, from `projects/maulya.in/`:

   ```
   node build/build.mjs
   ```

   You need Node 18 or newer and the `zip` command, both already on the Mac. Nothing to install.

3. **Upload** `Maulya_hostinger_ready.zip` the usual way (`~/Downloads/Maulya/3_DEPLOY/CARD_MAULYA_IN_SITE_2026-11.md`).

## Approve a post (make it live)

**A post is live only when its `status` is `"Published"`.** The setting is `blog.publishStatuses` in `site.config.mjs`.
- Approving a post means changing its line to `status: "Published"` and building.
- Every other status ("Draft for Review", "Content Bank Ready", "Ready to Publish") is left out of the live site, its feed and its sitemap.

**The build also writes `Maulya_preview_all_posts.zip`, which has every post.**
- Posts that aren't live carry their status on the card and a "Preview only" banner on the page.
- They are marked `noindex`, and the preview's `robots.txt` blocks everything.
- Use it to read the posts as they will look. **Never upload it.**

## What the build draws from a post (and what it never does)

It never changes the words. It only decides how they are drawn:

| In the Markdown | On the page |
|---|---|
| `## Practical summary` (or `Summary`) with a list | moved to the top as **"In one minute"**. Without one, the `meta_description` is shown there |
| every `##` heading | the **Contents** list beside the article |
| `- [ ] item` lines, or a plain list under a heading with "checklist" in it | a **checklist** the reader can tick (in their browser only), with "3 of 14 ticked" |
| `**Before leaving**` on its own line right above a checklist | the checklist's title |
| `1. 2. 3.` numbered lists | a **numbered flow** (circles joined by a line) |
| three or more `###` under one `##` | a **map of the section** at its top, linking to each part |
| `**The delay:** …` (or Warning, Important, Caution, Risk) | an amber **callout** |
| any other `**Label:** …` paragraph | a labelled note |
| `## FAQs` / `## Frequently Asked Questions` with `**Question?**` lines | **questions you open** one by one |
| `## Where Maulya fits` / `About Maulya` / `Soft Maulya mention` | a green note box |
| tables | a table that scrolls sideways on a phone |
| reading time, checklist points, steps, questions, tables | the small **at-a-glance** icons on the card and in "In one minute" |
| `category` | the category chips on the blog page (search and chips work on the page; no server) |
| related posts | same category first, then shared keywords |

**Never published:** everything from these markers to the end of the file.
- A `## Publisher Notes`, `## Repurposing Notes` or `## Internal Link Suggestions` heading.
- An `<!-- INTERNAL — DO NOT PUBLISH … -->` comment.
- Any `<!-- comment -->` anywhere.

So keep publisher notes at the bottom, under one of those headings.

**Pictures:** a post has no pictures today. One the post can't make from its own words is left out.

## Change a post

Edit its `.md` and build again. The page, the blog index, the feed and the sitemap all follow.

## Remove a post

Delete its `.md` (or set its status back to a draft) and build.
