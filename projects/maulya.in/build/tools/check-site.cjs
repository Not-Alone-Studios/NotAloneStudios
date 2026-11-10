// node check.cjs <base> <outdir> <widths,comma> [paths,comma]
// Playwright from the app repo's checkout (PW=<path> to use another one; ~/V3-lanes/site-shots is gone, 8 Nov)
const { chromium } = require(process.env.PW || (process.env.HOME || process.env.USERPROFILE) + "/V3/node_modules/playwright");
const NO_REAL_SERVER = (r) => r.fulfill({ status: 204, headers: { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" } }); // MLP/SRK-99: the pages count visits to app.maulya.in; a test must never reach the real server
const fs = require("fs");
(async () => {
  const [base, out, widthsArg, pathsArg] = process.argv.slice(2);
  const widths = widthsArg.split(",").map(Number);
  const paths = pathsArg ? pathsArg.split(",") : ["/", "/product/", "/for-whom/", "/pricing/", "/about/", "/early-access/", "/early-access/apply/", "/blog/", "/blog/site-visit-mistakes-property-valuation/", "/blog/bank-valuation-assignment-workflow-india/", "/survey/", "/privacy/", "/terms/", "/404.html"];
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const allLinks = new Set(); const report = [];
  for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: w < 800 ? 844 : 900 }, deviceScaleFactor: 1, isMobile: w < 800, hasTouch: w < 800 });
    await ctx.route("https://app.maulya.in/**", NO_REAL_SERVER);
    for (const p of paths) {
      const page = await ctx.newPage(); const errs = [];
      page.on("console", m => { if (m.type() === "error") errs.push(m.text().slice(0, 160)); });
      page.on("pageerror", e => errs.push("pageerror " + String(e).slice(0, 160)));
      page.on("requestfailed", r => errs.push("failed " + r.url()));
      page.on("response", r => { if (r.status() >= 400 && !r.url().endsWith("404.html")) errs.push(r.status() + " " + r.url()); });
      await page.goto(base + p, { waitUntil: "networkidle" });
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); } window.scrollTo(0, 0); });
      await page.waitForTimeout(300);
      const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: window.innerWidth,
        wide: [...document.querySelectorAll("body *")].filter(e => e.getBoundingClientRect().right > window.innerWidth + 1 && getComputedStyle(e).position !== "fixed").slice(0, 3).map(e => e.tagName + "." + e.className),
        links: [...document.querySelectorAll("a[href]")].map(a => a.href), h1: document.querySelectorAll("h1").length,
        imgsNoAlt: [...document.querySelectorAll("img:not([alt])")].length }));
      m.links.forEach(l => allLinks.add(l));
      const name = (p === "/" ? "home" : p.replace(/^\/|\/$/g, "").replace(/\//g, "_").replace(".html", "")) + "__" + w;
      await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
      report.push(`${w} ${p} h1=${m.h1} ${m.sw > m.iw ? "SIDEWAYS " + m.sw + " " + m.wide.join(" ") : "ok"} ${m.imgsNoAlt ? "noalt=" + m.imgsNoAlt : ""} ${errs.length ? "ERR " + errs.join(" | ") : ""}`);
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
  console.log(report.join("\n"));
  fs.writeFileSync(out + "/links.txt", [...allLinks].sort().join("\n"));
})();
