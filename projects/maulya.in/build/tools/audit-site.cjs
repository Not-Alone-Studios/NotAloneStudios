// node audit.cjs <base> <outdir> <widths,comma> [reduced=0|1] [paths,comma]
// Screenshots every page at each width, and measures what a picture can't: sideways scroll, small tap targets,
// long lines, low contrast, heading order, images without size or alt, layout shift.
// Playwright from the app repo's checkout (PW=<path> to use another one; ~/V3-lanes/site-shots is gone, 8 Nov)
const { chromium } = require(process.env.PW || (process.env.HOME || process.env.USERPROFILE) + "/V3/node_modules/playwright");
const NO_REAL_SERVER = (r) => r.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" } }); // MLP/SRK-99: the pages count visits to app.maulya.in; a test must never reach the real server
const fs = require("fs");
(async () => {
  const [base, out, widthsArg, reducedArg, pathsArg] = process.argv.slice(2);
  const widths = widthsArg.split(",").map(Number);
  const reduced = reducedArg === "1";
  const paths = pathsArg ? pathsArg.split(",") : ["/", "/product/", "/for-whom/", "/pricing/", "/about/", "/early-access/", "/early-access/apply/", "/blog/", "/blog/site-visit-mistakes-property-valuation/", "/blog/bank-valuation-assignment-workflow-india/", "/survey/", "/privacy/", "/terms/", "/404.html"];
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const report = [];
  for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w < 800 ? 800 : 900 }, deviceScaleFactor: 1, isMobile: w < 800, hasTouch: w < 800, reducedMotion: reduced ? "reduce" : "no-preference" });
    await ctx.route("https://app.maulya.in/**", NO_REAL_SERVER);
    await ctx.addInitScript(() => {
      window.__cls = 0;
      try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true }); } catch (e) {}
    });
    for (const p of paths) {
      const page = await ctx.newPage(); const errs = [];
      page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 140)); });
      page.on("pageerror", (e) => errs.push("pageerror " + String(e).slice(0, 140)));
      page.on("response", (r) => { if (r.status() >= 400 && !r.url().endsWith("404.html")) errs.push(r.status() + " " + r.url()); });
      let bytes = 0; page.on("response", async (r) => { try { const b = await r.body(); bytes += b.length; } catch (e) {} });
      await page.goto(base + p, { waitUntil: "networkidle" });
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); });
      await page.waitForTimeout(500);
      const m = await page.evaluate(() => {
        const vw = window.innerWidth;
        const lum = (c) => { const m = c.match(/[\d.]+/g); if (!m) return null; const [r, g, b] = m.slice(0, 3).map((v) => { v = v / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
        const alpha = (c) => { const m = c.match(/[\d.]+/g); return m && m.length > 3 ? +m[3] : 1; };
        const bgOf = (el) => { for (let e = el; e; e = e.parentElement) { const s = getComputedStyle(e); if (s.backgroundImage && s.backgroundImage !== "none" && !s.backgroundImage.includes("gradient")) return null; if (alpha(s.backgroundColor) > 0.5) return s.backgroundColor; } return "rgb(255,255,255)"; };
        const desc = (e) => (e.tagName.toLowerCase() + (e.className && typeof e.className === "string" ? "." + e.className.trim().split(/\s+/).join(".") : "") + " \"" + (e.textContent || e.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 32) + "\"");
        const visible = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none"; };
        const wide = [...document.querySelectorAll("body *")].filter((e) => visible(e) && e.getBoundingClientRect().right > vw + 1 && getComputedStyle(e).position !== "fixed" && !e.closest(".table-wrap,.toc")).slice(0, 4).map(desc);
        // tap targets: buttons and links that are not inline in running text
        const small = [...document.querySelectorAll("a[href],button,input,summary,[role=tab]")].filter(visible).filter((e) => {
          const inline = getComputedStyle(e).display === "inline" && e.closest("p,li,td,figcaption,cite,.crumbs,.said,.small");
          if (inline) return false;
          const r = e.getBoundingClientRect(); return r.height < 44 || r.width < 44;
        }).map((e) => { const r = e.getBoundingClientRect(); return desc(e) + " " + Math.round(r.width) + "x" + Math.round(r.height); });
        // long lines: paragraphs wider than about 80 characters of their own font
        const long = [...document.querySelectorAll("main p, main li")].filter(visible).filter((e) => { const fs = parseFloat(getComputedStyle(e).fontSize); return e.getBoundingClientRect().width / (fs * 0.5) > 88 && (e.textContent || "").length > 120; }).slice(0, 5).map((e) => desc(e) + " " + Math.round(e.getBoundingClientRect().width) + "px");
        // contrast on text
        const lowc = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const seen = new Set();
        while (walker.nextNode()) {
          const t = walker.currentNode; if (!t.textContent.trim()) continue; const el = t.parentElement; if (!el || seen.has(el) || !visible(el)) continue; seen.add(el);
          if (el.closest(".sr-only,.skip,svg")) continue;
          const s = getComputedStyle(el); const bg = bgOf(el); if (!bg) continue;
          const a = lum(s.color), b = lum(bg); if (a == null || b == null) continue;
          const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
          const size = parseFloat(s.fontSize), bold = +s.fontWeight >= 700; const large = size >= 24 || (bold && size >= 18.66);
          const need = large ? 3 : 4.5; const op = +s.opacity;
          if (ratio < need || op < 1) lowc.push(desc(el) + " " + ratio.toFixed(2) + (op < 1 ? " opacity" + op : ""));
        }
        const hs = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].filter(visible).map((h) => +h.tagName[1]);
        const skips = []; for (let i = 1; i < hs.length; i++) if (hs[i] > hs[i - 1] + 1) skips.push("h" + hs[i - 1] + "→h" + hs[i]);
        const imgs = [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt") || !i.getAttribute("width")).map((i) => i.src.split("/").pop());
        return { sw: document.documentElement.scrollWidth, vw, wide, small: [...new Set(small)].slice(0, 12), long, lowc: [...new Set(lowc)].slice(0, 10), skips, imgs, h1: document.querySelectorAll("h1").length, cls: window.__cls, height: document.body.scrollHeight };
      });
      const name = (p === "/" ? "home" : p.replace(/^\/|\/$/g, "").replace(/\//g, "_").replace(".html", "")) + "__" + w + (reduced ? "__reduced" : "");
      await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
      report.push([`== ${w}${reduced ? " reduced" : ""} ${p}  h1=${m.h1} cls=${m.cls.toFixed(3)} weight=${(bytes / 1024).toFixed(0)}KB height=${m.height}`,
        m.sw > m.vw ? `  SIDEWAYS ${m.sw}: ${m.wide.join(" | ")}` : "",
        m.small.length ? `  SMALL TAP: ${m.small.join(" | ")}` : "",
        m.long.length ? `  LONG LINES: ${m.long.join(" | ")}` : "",
        m.lowc.length ? `  CONTRAST: ${m.lowc.join(" | ")}` : "",
        m.skips.length ? `  HEADINGS: ${m.skips.join(" ")}` : "",
        m.imgs.length ? `  IMG no alt/size: ${m.imgs.join(" ")}` : "",
        errs.length ? `  ERR ${errs.join(" | ")}` : ""].filter(Boolean).join("\n"));
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
  const txt = report.join("\n");
  fs.writeFileSync(out + "/audit" + (reduced ? "-reduced" : "") + ".txt", txt + "\n");
  console.log(txt);
})();
