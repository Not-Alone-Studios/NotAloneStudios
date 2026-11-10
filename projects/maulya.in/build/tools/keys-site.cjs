// Playwright from the app repo's checkout (PW=<path> to use another one; ~/V3-lanes/site-shots is gone, 8 Nov)
// node keys-site.cjs <outdir> [base, default http://127.0.0.1:8768]
const BASE = process.argv[3] || "http://127.0.0.1:8768";
const { chromium } = require(process.env.PW || process.env.HOME + "/V3/node_modules/playwright");
(async () => { const b = await chromium.launch(); const out = process.argv[2];
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  const seen = [];
  for (let i = 0; i < 12; i++) { await p.keyboard.press("Tab"); seen.push(await p.evaluate(() => { const e = document.activeElement; const r = getComputedStyle(e).boxShadow; return (e.textContent || e.getAttribute("aria-label") || "").trim().slice(0, 30) + (r && r !== "none" ? " [ring]" : " [NO RING]"); })); }
  console.log("Home tabs:", seen.join(" | "));
  // The scale: focus the first tab, arrow right twice (on Product since ARK-693; Home has the journey)
  await p.goto(BASE + "/product/", { waitUntil: "networkidle" });
  await p.focus("#st-0"); await p.keyboard.press("ArrowRight"); await p.keyboard.press("ArrowRight");
  console.log("Scale after 2x ArrowRight:", await p.evaluate(() => document.activeElement.id + " selected=" + document.activeElement.getAttribute("aria-selected") + " panelVisible=" + !document.getElementById("sp-2").hidden + " otherHidden=" + document.getElementById("sp-0").hidden));
  await p.screenshot({ path: out + "/keys-scale.png" });
  // Apply for early access by keyboard: from the header
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  for (let i = 0; i < 9; i++) await p.keyboard.press("Tab");
  console.log("Focused:", await p.evaluate(() => document.activeElement.textContent.trim()));
  await p.keyboard.press("Enter"); await p.waitForURL(/early-access\/apply/); await p.waitForLoadState("networkidle"); console.log("Now at:", p.url());
  const s = []; for (let i = 0; i < 22; i++) { await p.keyboard.press("Tab"); s.push(await p.evaluate(() => (document.activeElement.textContent || "").trim().slice(0, 25) + " -> " + (document.activeElement.getAttribute("href") || "").slice(0, 45))); }
  console.log("Apply-page tabs:", s.join(" | "));
  await p.screenshot({ path: out + "/keys-apply.png" });
  // Mobile menu by keyboard
  const m = await b.newPage({ viewport: { width: 390, height: 844 } });
  await m.goto(BASE + "/", { waitUntil: "networkidle" });
  await m.keyboard.press("Tab"); await m.keyboard.press("Tab"); await m.keyboard.press("Tab");
  console.log("Mobile focus:", await m.evaluate(() => document.activeElement.textContent.trim()));
  await m.keyboard.press("Enter"); await m.waitForTimeout(200);
  console.log("Menu open:", await m.evaluate(() => document.querySelector(".menu-btn").getAttribute("aria-expanded") + " visible=" + (getComputedStyle(document.getElementById("site-nav")).display !== "none")));
  await m.screenshot({ path: out + "/keys-menu-390.png" });
  await m.keyboard.press("Escape"); console.log("After Escape:", await m.evaluate(() => document.querySelector(".menu-btn").getAttribute("aria-expanded")));
  await b.close(); })();
