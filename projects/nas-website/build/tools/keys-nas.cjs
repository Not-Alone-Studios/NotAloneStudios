// node keys-nas.cjs <base> <outdir>
// The studio site's keyboard walk (MLP/ARK-991): every page at 1280 and 390 px, Tab through every stop and check each
// one shows a visible focus (an outline or a ring that differs from the unfocused look); the phone menu with Enter and
// Escape; Contact's lanes (#maulya, #calvetra, #studio) and the Studio brief, which must open an email, not pretend.
const { chromium } = require(process.env.PW || process.env.HOME + "/V3/node_modules/playwright");
const fs = require("fs");
const PAGES = ["/", "/products/", "/products/maulya/", "/products/calvetra/", "/products/revalk/", "/method/", "/proof/", "/studio/", "/labs/", "/contact/", "/press/", "/privacy/", "/terms/"];

(async () => {
  const [base, out] = process.argv.slice(2);
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const lines = [];
  for (const w of [1280, 390]) {
    const ctx = await b.newContext({ viewport: { width: w, height: w < 800 ? 844 : 900 }, isMobile: w < 800, hasTouch: w < 800 });
    for (const p of PAGES) {
      const page = await ctx.newPage(); const errs = [];
      page.on("pageerror", (e) => errs.push(String(e).slice(0, 120)));
      await page.goto(base + p, { waitUntil: "networkidle" });
      const seen = []; const invisible = []; let first = "";
      for (let i = 0; i < 80; i++) {
        await page.keyboard.press("Tab");
        const f = await page.evaluate(() => {
          const e = document.activeElement; if (!e || e === document.body) return null;
          const s = getComputedStyle(e);
          const ring = (s.outlineStyle !== "none" && parseFloat(s.outlineWidth) > 0) || (s.boxShadow && s.boxShadow !== "none");
          const r = e.getBoundingClientRect();
          return { key: e.tagName + "|" + (e.getAttribute("href") || e.textContent.trim().slice(0, 24)) + "|" + Math.round(r.top + window.scrollY), label: (e.textContent || e.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 28), ring, onscreen: r.width > 0 && r.height > 0 };
        });
        if (!f) continue;
        if (seen.includes(f.key)) break;
        seen.push(f.key); if (!first) first = f.label;
        if (!f.ring || !f.onscreen) invisible.push(f.label + (f.onscreen ? "" : " (off-screen)"));
      }
      lines.push(`${w} ${p}: ${seen.length} stops, first "${first}"${invisible.length ? ", NO VISIBLE FOCUS: " + invisible.slice(0, 8).join(" | ") : ", every stop shows focus"}${errs.length ? " ERR " + errs.join(" | ") : ""}`);
      await page.close();
    }
    await ctx.close();
  }

  // the phone menu, by keyboard
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    await page.goto(base + "/products/calvetra/", { waitUntil: "networkidle" });
    const menu = page.locator(".nx-menu");
    await menu.focus(); await page.keyboard.press("Enter");
    const open = await menu.getAttribute("aria-expanded"); const navShown = await page.locator("#nx-nav").isVisible();
    await page.keyboard.press("Tab"); const firstLink = await page.evaluate(() => document.activeElement.textContent.trim());
    await page.screenshot({ path: `${out}/menu-open-390.png` });
    await page.keyboard.press("Escape");
    const closed = await menu.getAttribute("aria-expanded"); const back = await page.evaluate(() => document.activeElement.classList.contains("nx-menu"));
    const current = await page.locator('#nx-nav a[aria-current="page"]').allTextContents();
    lines.push(`menu 390: Enter → aria-expanded=${open}, nav visible=${navShown}, Tab → "${firstLink}"; Escape → aria-expanded=${closed}, focus back on Menu=${back}; current page link: ${current.join(",") || "none"}`);
    // without script the links must still be reachable
    const ctx2 = await b.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
    const p2 = await ctx2.newPage(); await p2.goto(base + "/", { waitUntil: "load" });
    const vis = await p2.locator("#nx-nav a").evaluateAll((as) => as.filter((a) => a.getBoundingClientRect().height > 0).length);
    const menuShown = await p2.locator(".nx-menu").isVisible();
    await p2.screenshot({ path: `${out}/noscript-390.png` });
    lines.push(`no script 390: ${vis} header links visible, Menu button shown=${menuShown}`);
    await ctx2.close(); await ctx.close();
  }

  // Contact: the lanes and the Studio brief
  {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    for (const lane of ["maulya", "calvetra", "studio"]) {
      const page = await ctx.newPage();
      await page.goto(base + "/contact/#" + lane, { waitUntil: "networkidle" });
      const panel = await page.locator(`[data-form-panel="${lane}"]`).isVisible();
      const heading = panel ? await page.locator(`[data-form-panel="${lane}"] h3`).textContent() : "";
      const links = panel ? await page.locator(`[data-form-panel="${lane}"] a`).evaluateAll((as) => as.map((a) => a.getAttribute("href"))) : [];
      lines.push(`contact #${lane}: panel shown=${panel} "${(heading || "").trim()}" links ${links.join(" , ")}`);
      if (lane === "studio") {
        let mail = "";
        page.on("request", (r) => { if (r.url().startsWith("mailto:")) mail = r.url(); });
        page.on("framenavigated", (f) => { if (f.url().startsWith("mailto:")) mail = f.url(); });
        await page.evaluate(() => { window.__mail = ""; });
        await page.locator('[data-testid="submit-studio"]').click();
        const invalid = await page.locator('[data-form-panel="studio"] [aria-invalid="true"]').count();
        await page.fill('[data-testid="field-name-studio"]', "Test Name");
        await page.fill('[data-testid="field-process-studio"]', "Three offices, one spreadsheet.");
        await page.fill('[data-testid="field-contact-studio"]', "test@example.com");
        await page.locator('[data-testid="submit-studio"]').click().catch(() => {});
        await page.waitForTimeout(800);
        const step3 = await page.locator('[data-wizard-step="3"]').getAttribute("data-active");
        const h = await page.locator('[data-wizard-step="3"] h3').textContent();
        lines.push(`contact studio: empty send → ${invalid} fields marked; filled send → step 3 active=${step3} "${h.trim()}", mailto seen=${mail ? decodeURIComponent(mail).slice(0, 120) : "(not visible to the headless browser)"}`);
        await page.screenshot({ path: `${out}/contact-studio-sent-1280.png` });
      }
      await page.close();
    }
    await ctx.close();
  }
  await b.close();
  fs.writeFileSync(out + "/keys.txt", lines.join("\n") + "\n");
  console.log(lines.join("\n"));
})();
