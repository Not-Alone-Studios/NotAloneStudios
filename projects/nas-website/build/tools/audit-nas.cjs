// node audit-nas.cjs <base> <outdir> <widths,comma> [reduced=0|1] [paths,comma] [shots=1|0]
// The studio site's audit (MLP/ARK-991), adapted from projects/maulya.in/build/tools/audit-site.cjs.
// Every page at each width: one h1, console errors, failed requests, sideways scroll, small tap targets,
// low text contrast, heading order, images without width/height/alt, the head (title, description, canonical,
// social image), running animations and playing videos (for reduced motion), and a full-page picture.
// At the end it opens every link it saw once (internal and external) and reports any that fail.
// Playwright from the app repo's checkout (PW=<path> to use another one). Run it through heavy.sh.
const { chromium, request } = require(process.env.PW || process.env.HOME + "/V3/node_modules/playwright");
const fs = require("fs");

const PAGES = ["/", "/products/", "/products/maulya/", "/products/calvetra/", "/products/revalk/", "/method/", "/proof/", "/studio/", "/labs/", "/contact/", "/press/", "/privacy/", "/terms/"];

(async () => {
  const [base, out, widthsArg, reducedArg, pathsArg, shotsArg] = process.argv.slice(2);
  const widths = widthsArg.split(",").map(Number);
  const reduced = reducedArg === "1";
  const shots = shotsArg !== "0";
  const paths = pathsArg ? pathsArg.split(",") : PAGES;
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const report = [];
  const links = new Map(); // href -> first page seen on
  for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w < 800 ? 800 : 900 }, deviceScaleFactor: 1, isMobile: w < 800, hasTouch: w < 800, reducedMotion: reduced ? "reduce" : "no-preference" });
    await ctx.addInitScript(() => {
      window.__cls = 0;
      try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true }); } catch (e) {}
    });
    for (const p of paths) {
      const page = await ctx.newPage(); const errs = [];
      page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 160)); });
      page.on("pageerror", (e) => errs.push("pageerror " + String(e).slice(0, 160)));
      page.on("requestfailed", (r) => errs.push("FAILED " + r.url() + " " + (r.failure() ? r.failure().errorText : "")));
      page.on("response", (r) => { if (r.status() >= 400) errs.push(r.status() + " " + r.url()); });
      let bytes = 0; page.on("response", async (r) => { try { const b = await r.body(); bytes += b.length; } catch (e) {} });
      let status = 0;
      try { const resp = await page.goto(base + p, { waitUntil: "networkidle", timeout: 45000 }); status = resp ? resp.status() : 0; } catch (e) { errs.push("GOTO " + String(e).slice(0, 120)); }
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 70)); } window.scrollTo(0, 0); });
      await page.waitForTimeout(600);
      const m = await page.evaluate(() => {
        const vw = window.innerWidth;
        const lum = (c) => { const m = c.match(/[\d.]+/g); if (!m) return null; const [r, g, b] = m.slice(0, 3).map((v) => { v = v / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
        const alpha = (c) => { const m = c.match(/[\d.]+/g); return m && m.length > 3 ? +m[3] : 1; };
        const bgOf = (el) => { for (let e = el; e; e = e.parentElement) { const s = getComputedStyle(e); if (s.backgroundImage && s.backgroundImage !== "none" && !s.backgroundImage.includes("gradient")) return null; if (alpha(s.backgroundColor) > 0.5) return s.backgroundColor; } return getComputedStyle(document.body).backgroundColor || "rgb(255,255,255)"; };
        const desc = (e) => (e.tagName.toLowerCase() + (e.className && typeof e.className === "string" ? "." + e.className.trim().split(/\s+/).slice(0, 2).join(".") : "") + " \"" + (e.textContent || e.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 30) + "\"");
        const visible = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && +s.opacity !== 0; };
        const wide = [...document.querySelectorAll("body *")].filter((e) => visible(e) && e.getBoundingClientRect().right > vw + 1 && getComputedStyle(e).position !== "fixed").slice(0, 4).map(desc);
        const small = [...document.querySelectorAll("a[href],button,input,select,textarea,summary,[role=tab]")].filter(visible).filter((e) => {
          const inline = getComputedStyle(e).display === "inline" && e.closest("p,li,td,figcaption,cite,dd");
          if (inline) return false;
          const r = e.getBoundingClientRect(); return r.height < 44 || r.width < 44;
        }).map((e) => { const r = e.getBoundingClientRect(); return desc(e) + " " + Math.round(r.width) + "x" + Math.round(r.height); });
        const lowc = []; const seen = new Set();
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const t = walker.currentNode; if (!t.textContent.trim()) continue; const el = t.parentElement; if (!el || seen.has(el) || !visible(el)) continue; seen.add(el);
          if (el.closest(".sr-only,.visually-hidden,.skip-link,svg,[aria-hidden=true]")) continue;
          const s = getComputedStyle(el); const bg = bgOf(el); if (!bg) continue;
          const a = lum(s.color), b = lum(bg); if (a == null || b == null) continue;
          const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
          const size = parseFloat(s.fontSize), bold = +s.fontWeight >= 700; const large = size >= 24 || (bold && size >= 18.66);
          if (ratio < (large ? 3 : 4.5)) lowc.push(desc(el) + " " + ratio.toFixed(2));
        }
        const hs = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter(visible).map((h) => +h.tagName[1]);
        const skips = []; for (let i = 1; i < hs.length; i++) if (hs[i] > hs[i - 1] + 1) skips.push("h" + hs[i - 1] + "→h" + hs[i]);
        const imgs = [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt") || !i.getAttribute("width") || !i.getAttribute("height")).map((i) => (i.getAttribute("src") || "").split("/").pop() + (i.hasAttribute("alt") ? "" : "(no alt)") + (i.getAttribute("width") ? "" : "(no width)") + (i.getAttribute("height") ? "" : "(no height)"));
        const broken = [...document.querySelectorAll("img")].filter((i) => i.complete && i.naturalWidth === 0).map((i) => (i.getAttribute("src") || "").split("/").pop());
        const q = (s) => { const e = document.querySelector(s); return e ? (e.getAttribute("content") || e.getAttribute("href") || "") : ""; };
        const head = { title: document.title, desc: q('meta[name="description"]'), canonical: q('link[rel="canonical"]'), ogImage: q('meta[property="og:image"]'), ogTitle: q('meta[property="og:title"]'), twitter: q('meta[name="twitter:card"]'), lang: document.documentElement.lang };
        let anims = 0; try { anims = document.getAnimations().filter((a) => a.playState === "running" && (a.effect && a.effect.getTiming && a.effect.getTiming().iterations === Infinity)).length; } catch (e) {}
        const playing = [...document.querySelectorAll("video")].filter((v) => !v.paused).length;
        const hrefs = [...document.querySelectorAll("a[href]")].map((a) => a.href).filter((h) => /^https?:/.test(h));
        return { sw: document.documentElement.scrollWidth, vw, wide, small: [...new Set(small)].slice(0, 10), lowc: [...new Set(lowc)].slice(0, 10), skips, imgs, broken, h1: document.querySelectorAll("h1").length, cls: window.__cls, height: document.body.scrollHeight, head, anims, playing, hrefs };
      });
      for (const h of m.hrefs) { const k = h.split("#")[0]; if (!links.has(k)) links.set(k, p); }
      const name = (p === "/" ? "home" : p.replace(/^\/|\/$/g, "").replace(/\//g, "_").replace(".html", "")) + "__" + w + (reduced ? "__reduced" : "");
      if (shots) await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
      const hd = m.head; const missing = ["title", "desc", "canonical", "ogImage", "ogTitle"].filter((k) => !hd[k]);
      report.push([`== ${w}${reduced ? " reduced" : ""} ${p}  status=${status} h1=${m.h1} cls=${m.cls.toFixed(3)} weight=${(bytes / 1024).toFixed(0)}KB height=${m.height}`,
        w === widths[0] ? `  HEAD title="${hd.title}" | desc=${hd.desc ? hd.desc.length + "ch" : "NONE"} | canonical=${hd.canonical || "NONE"} | og:image=${hd.ogImage || "NONE"} | lang=${hd.lang}` : "",
        missing.length ? `  HEAD MISSING: ${missing.join(" ")}` : "",
        m.h1 !== 1 ? `  H1 COUNT ${m.h1}` : "",
        m.sw > m.vw ? `  SIDEWAYS ${m.sw}: ${m.wide.join(" | ")}` : "",
        m.small.length ? `  SMALL TAP: ${m.small.join(" | ")}` : "",
        m.lowc.length ? `  CONTRAST: ${m.lowc.join(" | ")}` : "",
        m.skips.length ? `  HEADINGS: ${m.skips.join(" ")}` : "",
        m.imgs.length ? `  IMG attrs: ${m.imgs.join(" ")}` : "",
        m.broken.length ? `  IMG BROKEN: ${m.broken.join(" ")}` : "",
        reduced && (m.anims || m.playing) ? `  MOTION under reduce: ${m.anims} endless animations, ${m.playing} videos playing` : "",
        !reduced && (m.anims || m.playing) ? `  motion: ${m.anims} endless animations, ${m.playing} videos playing` : "",
        errs.length ? `  ERR ${[...new Set(errs)].join(" | ")}` : ""].filter(Boolean).join("\n"));
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
  // every link once
  const api = await request.newContext({ ignoreHTTPSErrors: false, extraHTTPHeaders: { "User-Agent": "Mozilla/5.0 (link check)" } });
  const linkLines = [];
  for (const [href, from] of links) {
    let st = 0, note = "";
    try { const r = await api.get(href, { timeout: 20000, maxRedirects: 10 }); st = r.status(); note = r.url() !== href ? " → " + r.url() : ""; } catch (e) { note = " " + String(e).slice(0, 80); }
    linkLines.push(`${st >= 200 && st < 400 ? "ok " : "BAD"} ${st} ${href}${note}  (first on ${from})`);
  }
  await api.dispose();
  const txt = report.join("\n") + "\n\n== LINKS (" + links.size + ")\n" + linkLines.sort().join("\n");
  fs.writeFileSync(out + "/audit" + (reduced ? "-reduced" : "") + ".txt", txt + "\n");
  console.log(txt);
})();
