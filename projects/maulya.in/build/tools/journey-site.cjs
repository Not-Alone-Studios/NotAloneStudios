// node journey-site.cjs <base> <outdir> (MLP/ARK-693): Home's "How a file moves" part-way through, at 360 and 1440, with
// and without reduced motion, and with no script. Prints where the card is and how many steps are still hidden.
// Playwright from the app repo's checkout (PW=<path> to use another one; ~/V3-lanes/site-shots is gone, 8 Nov)
const { chromium } = require(process.env.PW || process.env.HOME + "/V3/node_modules/playwright");
(async () => { const [base, out] = process.argv.slice(2); const b = await chromium.launch();
  for (const reduced of [false, true]) for (const w of [360, 1440]) {
    const ctx = await b.newContext({ viewport: { width: w, height: w < 800 ? 760 : 900 }, isMobile: w < 800, hasTouch: w < 800, reducedMotion: reduced ? "reduce" : "no-preference" });
    const p = await ctx.newPage();
    await p.goto(base + "/", { waitUntil: "networkidle" });
    for (const i of [1, 4, 6]) {
      // scroll in small steps so the observers see the way down, then centre step i
      const y = await p.evaluate((i) => { const s = document.querySelectorAll(".journey-step")[i]; return s.getBoundingClientRect().top + scrollY - innerHeight * 0.42; }, i);
      const from = await p.evaluate(() => scrollY);
      for (let t = from; t < y; t += 250) { await p.evaluate((t) => scrollTo(0, t), t); await p.waitForTimeout(40); }
      await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(900);
      const st = await p.evaluate(() => ({ place: document.querySelector("[data-jc-place]").textContent, next: document.querySelector("[data-jc-next]").textContent, moving: document.querySelector(".journey").classList.contains("moving"), hidden: [...document.querySelectorAll(".journey-step")].filter(s => getComputedStyle(s).opacity !== "1").length }));
      console.log(w, reduced ? "reduced" : "motion", "step", i + 1, JSON.stringify(st));
      await p.screenshot({ path: `${out}/journey-step${i + 1}__${w}${reduced ? "__reduced" : ""}.png` });
    }
    await ctx.close();
  }
  // no script at all: the list must stand on its own
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false }); const p = await ctx.newPage();
  await p.goto(base + "/#how-a-file-moves", { waitUntil: "networkidle" });
  console.log("no script:", await p.evaluate(() => [...document.querySelectorAll(".journey-step")].filter(s => getComputedStyle(s).opacity === "1").length + " steps visible, rail " + getComputedStyle(document.querySelector(".journey-rail")).display));
  await p.screenshot({ path: `${out}/journey-no-script__1440.png` });
  await b.close(); })();
