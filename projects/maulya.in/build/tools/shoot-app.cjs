// Usage: node shoot.cjs <outdir> <listfile.json>
// list: [{name, path, w, h, mobile, fullPage, waitMs}]
// Playwright from the app repo's checkout (PW=<path> to use another one; ~/V3-lanes/site-shots is gone, 8 Nov)
const { chromium } = require(process.env.PW || process.env.HOME + "/V3/node_modules/playwright");
const fs = require("fs");
const BASE = process.env.BASE || "http://127.0.0.1:5189";
(async () => {
  const [out, listFile] = process.argv.slice(2);
  const list = JSON.parse(fs.readFileSync(listFile, "utf8"));
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  for (const s of list) {
    const ctx = await browser.newContext({
      viewport: { width: s.w || 1440, height: s.h || 900 },
      deviceScaleFactor: s.scale || 2, isMobile: !!s.mobile, hasTouch: !!s.mobile,
      timezoneId: "Asia/Kolkata", locale: "en-IN", reducedMotion: "reduce",
    });
    const page = await ctx.newPage();
    const errs = [];
    page.on("pageerror", e => errs.push(String(e).slice(0, 200)));
    try {
      await page.goto(BASE + s.path, { waitUntil: "networkidle", timeout: 45000 });
      await page.waitForTimeout(s.waitMs || 1200);
      for (let i = 0; i < 3; i++) {
        const later = page.getByRole("button", { name: /^Later$/ });
        if (await later.count() && await later.first().isVisible()) { await later.first().click(); await page.waitForTimeout(400); } else break;
      }
      if (s.click) { await page.locator(s.click).first().click(); await page.waitForLoadState("networkidle"); await page.waitForTimeout(s.waitMs || 1200);
        const later = page.getByRole("button", { name: /^Later$/ }); if (await later.count() && await later.first().isVisible()) { await later.first().click(); await page.waitForTimeout(400); } }
      if (s.scrollY) { await page.evaluate(y => window.scrollTo(0, y), s.scrollY); await page.waitForTimeout(400); }
      // Privacy scrub: any phone number that is not the obvious placeholder becomes "+91 90000 00000".
      const scrubbed = await page.evaluate(() => { let n = 0; const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const re = /\+91[\s-]?(?!90000)\d{5}[\s-]?\d{5}/g; let t; while ((t = w.nextNode())) { if (re.test(t.nodeValue)) { t.nodeValue = t.nodeValue.replace(re, "+91 90000 00000"); n++; } re.lastIndex = 0; } return n; });
      const text = await page.evaluate(() => document.body.innerText);
      fs.writeFileSync(`${out}/${s.name}.txt`, text);
      const buf = await page.screenshot({ fullPage: !!s.fullPage });
      if (s.webp) {
        const enc = await browser.newPage();
        for (const wdt of s.webp) {
          const data = await enc.evaluate(async ({ b64, wdt }) => { const img = new Image(); img.src = "data:image/png;base64," + b64; await img.decode();
            const c = document.createElement("canvas"); c.width = wdt; c.height = Math.round(img.height * wdt / img.width);
            const g = c.getContext("2d"); g.imageSmoothingQuality = "high"; g.drawImage(img, 0, 0, c.width, c.height); return c.toDataURL("image/webp", 0.82).split(",")[1]; }, { b64: buf.toString("base64"), wdt });
          fs.writeFileSync(`${out}/${s.name}-${wdt}.webp`, Buffer.from(data, "base64"));
        }
        await enc.close();
      } else fs.writeFileSync(`${out}/${s.name}.png`, buf);
      if (scrubbed) console.log("  scrubbed phone numbers:", scrubbed);
      console.log("ok", s.name, page.url().replace(BASE, ""), errs.length ? "ERR " + errs.join(" | ") : "");
    } catch (e) { console.log("FAIL", s.name, String(e).slice(0, 200)); }
    await ctx.close();
  }
  await browser.close();
})();
