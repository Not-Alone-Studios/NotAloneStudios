// MLP/ARK-668: the blog, from content/blog/*.md. "More intuitive and informational", drawn only from what each post
// itself says: "In one minute" (the post's own practical summary, else its meta description), the contents, the
// reading time, checklists drawn as checklists, numbered steps drawn as a flow, a section's sub-headings drawn as a
// map, labelled lines as callouts, FAQs as questions you open, the category and related posts. Words are never changed.
import fs from "node:fs";
import path from "node:path";
import { parseFrontMatter, stripInternal, toBlocks, inline, esc, slugify, wordCount } from "./md.mjs";

const SUMMARY_H = /^(practical summary|in summary|summary|key takeaways)$/i;
const FAQ_H = /^(faqs?|frequently asked questions)$/i;
const MAULYA_H = /(where maulya fits|about maulya|soft maulya mention|note on where maulya fits|how maulya helps)/i;
const WARN_LABEL = /^(the delay|warning|caution|important|risk|the cost|what goes wrong)$/i;

export const ICON = {
  clock: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8" fill="none" stroke="#094030" stroke-width="1.8"/><path d="M10 5.5V10l3 2" fill="none" stroke="#094030" stroke-width="1.8" stroke-linecap="round"/></svg>',
  check: '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2.5" y="2.5" width="15" height="15" rx="2" fill="none" stroke="#2f6a3f" stroke-width="1.8"/><path d="M6 10.5l2.6 2.6L14.2 7" fill="none" stroke="#2f6a3f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  steps: '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="5" cy="4.5" r="2.3" fill="#094030"/><circle cx="5" cy="10" r="2.3" fill="#094030"/><circle cx="5" cy="15.5" r="2.3" fill="#da9f34"/><path d="M9.5 4.5h8M9.5 10h8M9.5 15.5h6" stroke="#55615b" stroke-width="1.8" stroke-linecap="round"/></svg>',
  faq: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 4.5h14v9H9l-4 3v-3H3z" fill="none" stroke="#1d5a86" stroke-width="1.8" stroke-linejoin="round"/><path d="M8.3 7.4a1.8 1.8 0 113 1.4c-.7.4-1.3.8-1.3 1.6" fill="none" stroke="#1d5a86" stroke-width="1.6" stroke-linecap="round"/></svg>',
  table: '<svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2.5" y="3.5" width="15" height="13" rx="1" fill="none" stroke="#094030" stroke-width="1.8"/><path d="M2.5 8h15M8 8v8.5" stroke="#094030" stroke-width="1.6"/></svg>',
};

export function loadPosts(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith(".md") && !/^readme/i.test(f)).map((f) => {
    const raw = fs.readFileSync(path.join(dir, f), "utf8");
    const { data, body } = parseFrontMatter(raw);
    const clean = stripInternal(body);
    const slug = data.slug || f.replace(/\.md$/, "");
    if (!data.title) throw new Error(`${f}: no title in the front matter`);
    const post = { ...data, slug, file: f, md: clean, number: Number(data.number) || 999, date: data.date || "" };
    post.render = renderPost(post);
    post.words = wordCount(clean);
    post.minutes = Math.max(1, Math.round(post.words / 200));
    return post;
  }).sort((a, b) => a.number - b.number || a.title.localeCompare(b.title));
}

function renderPost(post) {
  let blocks = toBlocks(post.md);
  // the title is drawn in the page's head
  if (blocks[0] && blocks[0].type === "heading" && blocks[0].level === 1) blocks = blocks.slice(1);
  // horizontal rules between sections add nothing once each section has its own rule
  blocks = blocks.filter((b) => b.type !== "rule");

  // split into the intro and sections by H2
  const sections = [];
  let cur = { heading: null, blocks: [] };
  for (const b of blocks) {
    if (b.type === "heading" && b.level <= 2) { sections.push(cur); cur = { heading: b.text, blocks: [] }; }
    else cur.blocks.push(b);
  }
  sections.push(cur);

  const used = new Set();
  const uid = (t) => { let s = slugify(t) || "part"; let k = s, n = 2; while (used.has(k)) k = `${s}-${n++}`; used.add(k); return k; };

  const stats = { checklistItems: 0, faqs: 0, steps: 0, tables: 0 };
  let summaryItems = null;
  const toc = [];
  const html = [];

  for (const sec of sections) {
    const h = sec.heading;
    if (h && SUMMARY_H.test(h.trim())) {
      const list = sec.blocks.find((b) => b.type === "list" || b.type === "checklist");
      if (list && !summaryItems) { summaryItems = { heading: h, items: list.items, rest: sec.blocks.filter((b) => b !== list) }; if (!summaryItems.rest.length) continue; sec.blocks = summaryItems.rest; }
    }
    const id = h ? uid(h) : null;
    if (h) toc.push({ id, text: h });
    const isFaq = h && FAQ_H.test(h.trim());
    const isMaulya = h && MAULYA_H.test(h);
    const body = renderBlocks(sec.blocks, { uid, stats, isFaq, sectionId: id, isChecklist: !!h && /checklist/i.test(h) });
    if (!h) { html.push(body); continue; }
    const head = `<h2 id="${id}">${inline(h)}</h2>`;
    html.push(isMaulya ? `<section class="maulya-note" aria-labelledby="${id}">${head}${body}</section>` : `<section aria-labelledby="${id}">${head}${body}</section>`);
  }
  return { html: html.join("\n"), toc, stats, summaryItems };
}

function renderBlocks(blocks, ctx) {
  const out = [];
  // a section's own sub-headings, drawn as a map at its top when there are three or more
  const subs = blocks.filter((b) => b.type === "heading" && b.level === 3);
  const subIds = [];
  if (subs.length >= 3) ctx.stats.steps = Math.max(ctx.stats.steps, subs.length);
  if (ctx.isFaq) return renderFaq(blocks, ctx);

  for (let i = 0; i < blocks.length; i++) {
    let b = blocks[i];
    if (b.type === "heading") {
      const id = ctx.uid(b.text);
      if (b.level === 3) subIds.push({ id, text: b.text });
      const lv = Math.min(6, Math.max(3, b.level));
      out.push(`<h${lv} id="${id}">${inline(b.text)}</h${lv}>`);
      continue;
    }
    if (b.type === "para") {
      const text = b.lines.join(" ");
      const only = text.match(/^\*\*([^*]+)\*\*\s*$/);
      const next = blocks[i + 1];
      if (only && next && (next.type === "checklist" || (ctx.isChecklist && next.type === "list" && !next.ordered))) {
        out.push(`<div class="checklist-head"><h4 style="margin:0">${inline(only[1])}</h4><span class="checklist-count" aria-live="polite"></span></div>`);
        continue;
      }
      const lab = text.match(/^\*\*([^*]{2,60}?):\*\*\s*(.*)$/);
      if (lab) {
        const warn = WARN_LABEL.test(lab[1].trim());
        out.push(`<div class="callout${warn ? "" : " label"}"><span class="callout-label">${inline(lab[1])}</span><p>${inline(lab[2])}</p></div>`);
        continue;
      }
      out.push(`<p>${b.lines.map(inline).join(" ")}</p>`);
      continue;
    }
    if (b.type === "list" && !b.ordered && ctx.isChecklist && b.items.every((it) => !it.depth)) b = { ...b, type: "checklist", items: b.items.map((it) => ({ ...it, task: false })) };
    if (b.type === "checklist") {
      ctx.stats.checklistItems += b.items.length;
      const prev = blocks[i - 1];
      const hasHead = prev && prev.type === "para" && /^\*\*[^*]+\*\*\s*$/.test(prev.lines.join(" "));
      if (!hasHead) out.push(`<div class="checklist-head"><span></span><span class="checklist-count" aria-live="polite"></span></div>`);
      out.push(`<ul class="checklist">${b.items.map((it) => `<li><label><input type="checkbox"${it.task ? " checked" : ""} /><span>${inline(it.text)}</span></label></li>`).join("")}</ul>`);
      continue;
    }
    if (b.type === "list") {
      if (b.ordered) {
        ctx.stats.steps = Math.max(ctx.stats.steps, b.items.length);
        out.push(`<ol class="flow">${b.items.map((it) => `<li>${inline(it.text)}</li>`).join("")}</ol>`);
      } else out.push(renderUl(b.items));
      continue;
    }
    if (b.type === "table") {
      ctx.stats.tables++;
      out.push(`<div class="table-wrap" role="region" aria-label="Table" tabindex="0"><table><thead><tr>${b.head.map((c) => `<th scope="col">${inline(c)}</th>`).join("")}</tr></thead><tbody>${b.body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
      continue;
    }
    if (b.type === "quote") { out.push(`<blockquote><p>${inline(b.text)}</p></blockquote>`); continue; }
  }
  if (subIds.length >= 3) {
    const map = `<nav class="section-map" aria-label="In this section"><p>${subIds.length} parts in this section</p><ol class="flow" style="margin:0">${subIds.map((s) => `<li><a href="#${s.id}">${inline(s.text.replace(/^(mistake|step|stage|part|habit|check|rule|point|tip)\s+\d+\s*[:.\-–—]\s*/i, ""))}</a></li>`).join("")}</ol></nav>`;
    const firstSub = out.findIndex((x) => x.startsWith("<h3"));
    out.splice(firstSub < 0 ? 0 : firstSub, 0, map);
  }
  return out.join("\n");
}

function renderUl(items) {
  let html = "<ul>", depth = 0;
  items.forEach((it, i) => {
    if (it.depth > depth) { html = html.replace(/<\/li>$/, "") + "<ul>"; depth = it.depth; }
    else if (it.depth < depth) { html += "</ul></li>"; depth = it.depth; }
    html += `<li>${inline(it.text)}</li>`;
  });
  if (depth) html += "</ul></li>";
  return html + "</ul>";
}

function renderFaq(blocks, ctx) {
  const qa = [];
  for (const b of blocks) {
    if (b.type === "para") {
      const first = b.lines[0].match(/^\*\*(.+?)\*\*\s*$/);
      if (first) { qa.push({ q: first[1], a: b.lines.slice(1).length ? [`<p>${b.lines.slice(1).map(inline).join(" ")}</p>`] : [] }); continue; }
      const one = b.lines.join(" ").match(/^\*\*(.+?\?)\*\*\s*(.+)$/);
      if (one) { qa.push({ q: one[1], a: [`<p>${inline(one[2])}</p>`] }); continue; }
    } else if (b.type === "heading" && b.level >= 3) { qa.push({ q: b.text, a: [] }); continue; }
    if (!qa.length) qa.push({ q: null, a: [] });
    const last = qa[qa.length - 1];
    if (b.type === "para") last.a.push(`<p>${b.lines.map(inline).join(" ")}</p>`);
    else if (b.type === "list") last.a.push(b.ordered ? `<ol>${b.items.map((i) => `<li>${inline(i.text)}</li>`).join("")}</ol>` : renderUl(b.items));
    else if (b.type === "checklist") last.a.push(`<ul>${b.items.map((i) => `<li>${inline(i.text)}</li>`).join("")}</ul>`);
  }
  ctx.stats.faqs += qa.filter((x) => x.q).length;
  return `<div class="faq">${qa.map((x) => x.q ? `<details><summary>${inline(x.q)}</summary><div>${x.a.join("")}</div></details>` : x.a.join("")).join("")}</div>`;
}

export function glyphs(post, max = 4) {
  const s = post.render.stats, g = [];
  g.push(`<span class="glyph">${ICON.clock}${post.minutes} min read</span>`);
  if (s.checklistItems) g.push(`<span class="glyph">${ICON.check}${s.checklistItems}-point checklist</span>`);
  if (s.steps >= 3) g.push(`<span class="glyph">${ICON.steps}${s.steps} steps or parts</span>`);
  if (s.faqs) g.push(`<span class="glyph">${ICON.faq}${s.faqs} questions answered</span>`);
  if (s.tables) g.push(`<span class="glyph">${ICON.table}${s.tables === 1 ? "A table" : s.tables + " tables"}</span>`);
  return g.slice(0, max).join("");
}

export function card(post, level = 2, opts = {}) {
  const search = [post.title, post.meta_description, post.category, post.primary_keyword, ...(post.secondary_keywords || [])].join(" ").toLowerCase();
  return `<article class="post-card" data-cat="${slugify(post.category || "")}" data-search="${esc(search)}">
      <div class="post-meta"><span class="post-cat">${esc(post.category || "")}</span>${opts.preview && !opts.isLive(post) ? `<span class="status-flag">${esc(post.status || "no status")}</span>` : ""}</div>
      <h${level}><a href="/blog/${post.slug}/">${esc(post.title)}</a></h${level}>
      <p>${esc(post.meta_description || "")}</p>
      <div class="glyphs">${glyphs(post, 3)}</div>
    </article>`;
}

export function related(post, all, n = 3) {
  const kw = new Set([post.primary_keyword, ...(post.secondary_keywords || [])].filter(Boolean).flatMap((k) => String(k).toLowerCase().split(/\s+/)).filter((w) => w.length > 4));
  return all.filter((p) => p.slug !== post.slug).map((p) => {
    let score = p.category === post.category ? 10 : 0;
    for (const k of [p.primary_keyword, ...(p.secondary_keywords || [])].filter(Boolean)) for (const w of String(k).toLowerCase().split(/\s+/)) if (kw.has(w)) score++;
    score -= Math.abs(p.number - post.number) * 0.05;
    return { p, score };
  }).sort((a, b) => b.score - a.score).slice(0, n).map((x) => x.p);
}

export function postBody(post, all, { L, preview, isLive }) {
  const r = post.render;
  const minute = r.summaryItems
    ? `<ul>${r.summaryItems.items.map((i) => `<li>${inline(i.text)}</li>`).join("")}</ul>${r.summaryItems.rest.length ? "" : ""}`
    : `<p style="margin:0">${esc(post.meta_description || "")}</p>`;
  const toc = r.toc.length ? `<nav class="toc" aria-label="Contents"><h2>Contents</h2><ol>${r.toc.map((t) => `<li><a href="#${t.id}">${inline(t.text)}</a></li>`).join("")}</ol></nav>` : "<div></div>";
  const rel = related(post, all);
  const live = isLive(post);
  return `
    ${!live ? `<div class="draft-banner"><div class="wrap">Preview only. This article's status is "${esc(post.status || "none")}": it is not published on maulya.in until it is approved.</div></div>` : ""}
    <header class="post-head on-body">
      <div class="wrap">
        <p class="crumbs"><a href="/blog/">Blog</a> <span aria-hidden="true">/</span> <a href="/blog/?category=${slugify(post.category || "")}">${esc(post.category || "")}</a></p>
        <h1>${esc(post.title)}</h1>
        <p class="lead">${esc(post.meta_description || "")}</p>
        <div class="post-meta" style="color:var(--on-body-quiet)"><span>By Shrinivas, registered valuer</span><span>${post.minutes} min read</span></div>
      </div>
    </header>
    <div class="wrap post-layout">
      ${toc}
      <article class="article">
        <aside class="minute" aria-labelledby="minute-h">
          <h2 id="minute-h">In one minute</h2>
          <ul class="at-glance" aria-label="This article at a glance">${glyphs(post, 5).replace(/<span class="glyph">/g, "<li>").replace(/<\/span>/g, "</li>")}</ul>
          ${minute}
        </aside>
        ${r.html}
        <div class="post-foot">
          <p class="small muted">Maulya organises the work around the valuer's judgment. It does not decide a property's value. Articles are informational and not legal, financial or regulatory advice.</p>
          ${rel.length ? `<h2 style="font-size:1.375rem;border:0;padding:0;margin-top:24px">Read next</h2><div class="related">${rel.map((p) => card(p, 3, { preview, isLive })).join("")}</div>` : ""}
          <div class="actions">${L.apply("btn btn-gold")}<a class="btn btn-line" href="/blog/">All articles</a></div>
        </div>
      </article>
    </div>`;
}

export function indexBody(posts, { preview, isLive }) {
  const cats = [];
  for (const p of posts) if (p.category && !cats.find((c) => c.name === p.category)) cats.push({ name: p.category, n: 0 });
  for (const p of posts) cats.find((c) => c.name === p.category).n++;
  const head = `
    <section class="page-head on-body">
      <div class="wrap">
        <span class="kicker">The blog</span>
        <h1>Practical notes for valuation offices.</h1>
        <p class="lead">Written by Shrinivas, a practising registered valuer, about the work itself: intake, site visits, evidence, reports, records and running a small office. Every article has a one-minute summary, its checklists you can tick, and its steps drawn out.</p>
      </div>
    </section>`;
  if (!posts.length) {
    return head + `
    <section class="section"><div class="wrap narrow"><div class="empty">
      <h2>The first articles are on their way.</h2>
      <p>They are with the author for a final read. Meanwhile, see <a href="/product/">how Maulya works</a>.</p>
    </div></div></section>`;
  }
  return head + `
    <section class="section">
      <div class="wrap">
        ${preview ? `<div class="note" style="margin-top:0"><p><strong>Preview build.</strong> All ${posts.length} articles are shown; ${posts.filter(isLive).length} are approved to publish. The others carry their status on the card and a banner on the page.</p></div>` : ""}
        <div class="blog-tools">
          <div class="search" role="search">
            <label for="post-search" class="sr-only">Search the articles</label>
            <input id="post-search" type="search" placeholder="Search the articles, for example: site photos" autocomplete="off" />
          </div>
          <div class="chips" role="group" aria-label="Categories">
            <button class="chip" type="button" data-cat="all" aria-pressed="true">All<span class="count">${posts.length}</span></button>
            ${cats.map((c) => `<button class="chip" type="button" data-cat="${slugify(c.name)}" aria-pressed="false">${esc(c.name)}<span class="count">${c.n}</span></button>`).join("")}
          </div>
          <p class="small muted" style="margin:0" aria-live="polite" id="post-count">${posts.length} articles</p>
        </div>
        <div class="posts" data-posts>${posts.map((p) => card(p, 2, { preview, isLive })).join("")}</div>
        <div class="empty blog-empty-search"><p style="margin:0">No article matches that. Try fewer words, or pick All.</p></div>
      </div>
    </section>`;
}

export function atomFeed(posts, cfg) {
  const o = cfg.site.origin;
  const updated = (posts.map((p) => p.date).sort().pop() || "2026-11-07") + "T00:00:00+05:30";
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Maulya blog</title>
  <subtitle>Practical notes for valuation offices</subtitle>
  <link href="${o}/blog/feed.xml" rel="self"/>
  <link href="${o}/blog/"/>
  <id>${o}/blog/</id>
  <updated>${updated}</updated>
  <author><name>Shrinivas</name></author>
${posts.slice(0, cfg.blog.perPageFeed).map((p) => `  <entry>
    <title>${esc(p.title)}</title>
    <link href="${o}/blog/${p.slug}/"/>
    <id>${o}/blog/${p.slug}/</id>
    <updated>${(p.date || "2026-11-07")}T00:00:00+05:30</updated>
    <category term="${esc(p.category || "")}"/>
    <summary>${esc(p.meta_description || "")}</summary>
  </entry>`).join("\n")}
</feed>
`;
}
