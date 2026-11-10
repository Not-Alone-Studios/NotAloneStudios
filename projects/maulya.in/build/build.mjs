#!/usr/bin/env node
// MLP/ARK-668: builds maulya.in from src/ and content/blog/ in one command, with Node only (no packages):
//
//   node build/build.mjs
//
// It writes:
//   public_clean/, public_hostinger/, Maulya_hostinger_ready/   the live site (only approved posts), as before
//   Maulya_hostinger_ready.zip                                  what ARK uploads to Hostinger (MIGRATION.md)
//   Maulya_preview_all_posts.zip                                the same site with every post, marked with its status
//   rollback/Maulya_hostinger_ready_before_2026-11.zip          the zip that was live before this rebuild (kept once)
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import cfg from "../site.config.mjs";
import { page, links, shot } from "./layout.mjs";
import { loadPosts, postBody, indexBody, atomFeed, card } from "./blog.mjs";
import home from "../src/pages/home.mjs";
import product from "../src/pages/product.mjs";
import forWhom from "../src/pages/for-whom.mjs";
import pricing from "../src/pages/pricing.mjs";
import about from "../src/pages/about.mjs";
import earlyAccess from "../src/pages/early-access.mjs";
import earlyAccessApply from "../src/pages/early-access-apply.mjs";
import { privacy, terms, notFound } from "../src/pages/legal.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src");
const DIST = path.join(ROOT, "dist");
cfg.__buildId = Date.now().toString(36);

// Old addresses (before Nov 2026) and where they live now: a 301 in .htaccess and a small page for hosts without it.
const MOVED = {
  "/solutions/": "/for-whom/",
  "/associates/": "/for-whom/",
  "/pilot/": "/early-access/",
  "/start/": "/early-access/", // the Nov 2026 "Start your firm" page: ARK-683 folded it into /early-access/
  "/demo/": "/product/",
  "/updates/": "/blog/",
};

const STATIC_PAGES = [home, product, forWhom, pricing, about, earlyAccess, earlyAccessApply, privacy, terms, notFound];

function rm(p) { fs.rmSync(p, { recursive: true, force: true }); }
function write(file, text) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text); }
function copyDir(from, to, skip = () => false) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    if (e.name.startsWith(".") || skip(path.join(from, e.name))) continue;
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.isDirectory()) copyDir(a, b, skip); else fs.copyFileSync(a, b);
  }
}
function outFile(dir, p) { return p.endsWith(".html") ? path.join(dir, p) : path.join(dir, p, "index.html"); }

function buildSite(dir, { preview }) {
  rm(dir);
  const L = links(cfg);
  const all = loadPosts(path.join(ROOT, "content", "blog"));
  const isLive = (p) => cfg.blog.publishStatuses.includes(String(p.status || "").trim());
  const posts = preview ? all : all.filter(isLive);
  const sitemap = [];

  // assets (pages, fonts, pictures, brand)
  // MLP/SRK-109: the old scales logo files stay in src/assets/brand (nothing is deleted by hand) but nothing points at them any more, so they are not built.
  const OLD_LOGO = new Set(["maulya-logo.png", "maulya-logo-sm.png", "maulya-icon.png"]);
  copyDir(path.join(SRC, "assets"), path.join(dir, "assets"), (f) => OLD_LOGO.has(path.basename(f)));

  const ctx = { cfg, L, shot, latest: posts.filter(isLive), card: (p, lv) => card(p, lv, { preview, isLive }) };
  // a page may cite a post: a link while it is built, its title in plain text until then
  const built = new Set(posts.map((p) => p.slug));
  const unlinkDrafts = (html) => html.replace(/<a href="\/blog\/([a-z0-9-]+)\/">([^<]*)<\/a>/g, (m, slug, text) => (built.has(slug) ? m : `<cite>${text}</cite>`));
  for (const make of STATIC_PAGES) {
    const pg = make(ctx);
    pg.body = unlinkDrafts(pg.body);
    write(outFile(dir, pg.path), page(cfg, pg));
    if (!pg.noindex) sitemap.push(pg.path);
  }

  // the blog
  write(path.join(dir, "blog", "index.html"), page(cfg, {
    path: "/blog/", title: "Blog: practical notes for valuation offices",
    description: "Articles for property valuers and their offices in India: assignment intake, site visits and photos, evidence, report review, records and running a small valuation office.",
    body: indexBody(posts, { preview, isLive }),
    noindex: preview,
  }));
  sitemap.push("/blog/");
  for (const p of posts) {
    write(path.join(dir, "blog", p.slug, "index.html"), page(cfg, {
      path: `/blog/${p.slug}/`, current: "/blog/", type: "article",
      title: p.seo_title || p.title, description: p.meta_description || "",
      noindex: !isLive(p),
      extraHead: `<meta name="keywords" content="${[p.primary_keyword, ...(p.secondary_keywords || [])].filter(Boolean).join(", ").replace(/"/g, "&quot;")}" />`,
      jsonLd: [{
        "@context": "https://schema.org", "@type": "Article", headline: p.title, description: p.meta_description,
        author: { "@type": "Organization", name: "Maulya" }, publisher: { "@type": "Organization", name: "Maulya" },
        datePublished: p.date || undefined, articleSection: p.category, keywords: [p.primary_keyword, ...(p.secondary_keywords || [])].filter(Boolean).join(", "),
        mainEntityOfPage: `${cfg.site.origin}/blog/${p.slug}/`,
      }],
      body: postBody(p, posts, { L, preview, isLive }),
    }));
    if (isLive(p)) sitemap.push(`/blog/${p.slug}/`);
  }
  write(path.join(dir, "blog", "feed.xml"), atomFeed(posts.filter(isLive), cfg));

  // the survey: kept as it is (its own full-screen page); only its addresses come from the config
  let survey = fs.readFileSync(path.join(SRC, "survey", "index.html"), "utf8");
  survey = survey.replace(/const APPS_SCRIPT_URL = '[^']*';/, `const APPS_SCRIPT_URL = '${cfg.survey.appsScriptUrl}';`)
    .replace(/<a href="\/pilot\/\?src=maulya-survey-done" class="sv-btn sv-btn--primary">\s*Apply for early access →\s*<\/a>/,
      cfg.earlyAccess.open ? L.apply("sv-btn sv-btn--primary", "Apply for early access →") : `<span class="sv-btn sv-btn--secondary">Applications are closed</span>`)
    .replace('<a href="/updates/" class="sv-btn sv-btn--secondary">Read product notes</a>', '<a href="/blog/" class="sv-btn sv-btn--secondary">Read the blog</a>')
    // MLP/SRK-99 addendum 2: the shared visit helper (counts site_survey_view only while earlyAccess.sendTo is "server")
    .replace("</body>", `  ${L.visit("site_survey_view")}\n</body>`);
  write(path.join(dir, "survey", "index.html"), survey);
  sitemap.push("/survey/");

  // the old addresses
  let htaccess = "# maulya.in (MLP/ARK-668): old addresses, and the 404 page\nErrorDocument 404 /404.html\n";
  for (const [from, to] of Object.entries(MOVED)) {
    htaccess += `Redirect 301 ${from} ${cfg.site.origin}${to}\n`;
    write(outFile(dir, from), `<!doctype html><html lang="en-IN"><head><meta charset="utf-8"><title>Moved</title><meta name="robots" content="noindex"><link rel="canonical" href="${cfg.site.origin}${to}"><meta http-equiv="refresh" content="0; url=${to}"></head><body><p>This page has moved to <a href="${to}">${cfg.site.origin}${to}</a>.</p></body></html>\n`);
  }
  write(path.join(dir, ".htaccess"), htaccess);
  // MLP/SRK-109: browsers and crawlers ask for /favicon.ico first; it is the founder's own file (the pages link the SVG and PNG too).
  fs.copyFileSync(path.join(SRC, "assets", "brand", "favicon.ico"), path.join(dir, "favicon.ico"));

  write(path.join(dir, "robots.txt"), `User-agent: *\n${preview ? "Disallow: /\n" : "Allow: /\n"}\nSitemap: ${cfg.site.origin}/sitemap.xml\n`);
  write(path.join(dir, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap.map((u) => `  <url><loc>${cfg.site.origin}${u}</loc></url>`).join("\n")}\n</urlset>\n`);
  return { posts: posts.length, live: all.filter(isLive).length, all: all.length, pages: sitemap.length };
}

function zip(folder, zipPath) {
  rm(zipPath);
  // the zip holds the folder itself, as the March zip did (MIGRATION.md)
  execFileSync("zip", ["-rqX", zipPath, path.basename(folder)], { cwd: path.dirname(folder) });
}

// keep the zip that was live before this rebuild, once
const ROLLBACK = path.join(ROOT, "rollback", "Maulya_hostinger_ready_before_2026-11.zip");
if (!fs.existsSync(ROLLBACK) && fs.existsSync(path.join(ROOT, "Maulya_hostinger_ready.zip"))) {
  fs.mkdirSync(path.dirname(ROLLBACK), { recursive: true });
  fs.copyFileSync(path.join(ROOT, "Maulya_hostinger_ready.zip"), ROLLBACK);
}

const live = buildSite(path.join(DIST, "live"), { preview: false });
const prev = buildSite(path.join(DIST, "preview", "Maulya_preview_all_posts"), { preview: true });

for (const mirror of ["public_clean", "public_hostinger", "Maulya_hostinger_ready"]) {
  rm(path.join(ROOT, mirror));
  copyDir(path.join(DIST, "live"), path.join(ROOT, mirror));
  fs.copyFileSync(path.join(DIST, "live", ".htaccess"), path.join(ROOT, mirror, ".htaccess"));
}
zip(path.join(ROOT, "Maulya_hostinger_ready"), path.join(ROOT, "Maulya_hostinger_ready.zip"));
fs.copyFileSync(path.join(DIST, "preview", "Maulya_preview_all_posts", ".htaccess"), path.join(DIST, "preview", "Maulya_preview_all_posts", ".htaccess"));
zip(path.join(DIST, "preview", "Maulya_preview_all_posts"), path.join(ROOT, "Maulya_preview_all_posts.zip"));

const size = (f) => (fs.statSync(f).size / 1024 / 1024).toFixed(2) + " MB";
console.log(`Built maulya.in: ${live.pages} pages in the sitemap; blog: ${live.posts} of ${live.all} posts live (status in ${JSON.stringify(cfg.blog.publishStatuses)}).`);
console.log(`  Maulya_hostinger_ready.zip   ${size(path.join(ROOT, "Maulya_hostinger_ready.zip"))}`);
console.log(`  Maulya_preview_all_posts.zip ${size(path.join(ROOT, "Maulya_preview_all_posts.zip"))} (all ${prev.posts} posts, not for upload)`);
const ea = cfg.earlyAccess;
console.log(`  App sign-in: ${links(cfg).signIn}`);
console.log(`  "Apply for early access": ${!ea.open ? "CLOSED (open: false): the buttons say \"Applications are closed\"" : (String(ea.formUrl || "").trim() || "/early-access/apply/") + " (the site's own application page, same tab)"}`);
const server = ea.sendTo === "server";
console.log(`  Phase: ${ea.phase === "waitlist" ? 'WAITLIST (the buttons read "Join the waiting list")' : "open"}`);
console.log(`  Applications and the Survey are sent to: ${server ? `MAULYA'S SERVER, ${String(ea.apiBase || "").replace(/[/]$/, "")} (sendTo "server")` : `the Google Sheet: ${String(ea.appsScriptUrl || "").trim() || "NOWHERE YET (earlyAccess.appsScriptUrl is empty)"} (sendTo "sheet")`}`);
console.log(`  Visit counting on the early-access pages: ${String(ea.apiBase || "").trim() ? `to ${String(ea.apiBase).replace(/[/]$/, "")}, only once that server answers` : "OFF (earlyAccess.apiBase is empty)"}`);
if (ea.open && !server && !String(ea.appsScriptUrl || "").trim()) {
  const bar = "!".repeat(78);
  console.warn(`\n${bar}\n!! WARNING: earlyAccess.appsScriptUrl in site.config.mjs is EMPTY.\n!! /early-access/apply/ shows the form, but "Send my application" says applications open shortly and\n!! nothing is sent: NO APPLICATION IS COLLECTED. Deploy early-access-apps-script/code.gs in Google\n!! (as a web app, "Anyone"), paste its /exec address into site.config.mjs, run \`node build/build.mjs\`\n!! again, and only then upload the zip.\n${bar}\n`);
}
