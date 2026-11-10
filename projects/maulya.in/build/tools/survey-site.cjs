// MLP/SRK-99 addendum 2: drives the site's own Survey page (/survey/) against build/tools/stub-server.cjs, once with earlyAccess.sendTo =
// "sheet" (the default: the Survey sends to its Google Apps Script exactly as before and counts nothing) and once with "server".
//   node survey-site.cjs <outdir> [base, default http://127.0.0.1:8768]
// Playwright: PW=<path to playwright or playwright-core>; CHROME=<path to chrome.exe or msedge.exe> to use an installed browser.
// The settings are switched without a rebuild, as in server-site.cjs (an init script sets data-api-base / data-send-to on the
// <script id="ea-visit"> tag before visit.js runs). The Survey's real Apps Script address (script.google.com) is intercepted and answered
// by the test: nothing here reaches Google or the real server. Writes the recorded requests to <outdir>/requests-survey-*.json.
const { chromium } = require(process.env.PW || (process.env.HOME || process.env.USERPROFILE) + "/V3/node_modules/playwright");
const fs = require("fs");
const C = require("./contract.cjs");
const { start } = require("./stub-server.cjs");
const BASE = process.argv[3] || "http://127.0.0.1:8768";
const OUT = process.argv[2];
const STUB = "http://127.0.0.1:8770";
let bad = 0;
const ok = (what, cond, extra) => { if (!cond) bad++; console.log((cond ? "  ok   " : "  FAIL ") + what + (extra ? "  " + extra : "")); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const NOT_SENT = "Not sent. Your answers are still on this screen. Please try again.";

function pointAt(ctx, { base, sendTo }) {
  return ctx.addInitScript(({ base, sendTo }) => {
    const set = () => { const t = document.getElementById("ea-visit"); if (!t) return false; if (base) t.setAttribute("data-api-base", base); if (sendTo) t.setAttribute("data-send-to", sendTo); return true; };
    const mo = new MutationObserver(() => { if (set()) mo.disconnect(); });
    mo.observe(document, { childList: true, subtree: true });
  }, { base, sendTo });
}

// what screen is showing
const kindOf = (page) => page.evaluate(() => {
  if (document.querySelector("#sv-submit-status")) return "done";
  if (document.querySelector(".sv-review-list")) return "review";
  if (document.querySelector(".sv-textarea")) return "text";
  if (document.querySelector(".sv-option[data-qid]")) return "q";
  if (document.querySelector("#sv-start")) return "intro";
  return "chapter";
});
const sig = (page) => page.evaluate(() => (document.querySelector(".sv-card") ? document.querySelector(".sv-card").innerText.slice(0, 120) : "") + "|" + (document.getElementById("sv-q-lbl") || {}).textContent);
async function waitChange(page, before) { await page.waitForFunction((b) => { const c = document.querySelector(".sv-card"); const s = (c ? c.innerText.slice(0, 120) : "") + "|" + (document.getElementById("sv-q-lbl") || {}).textContent; return s !== b; }, before, { timeout: 8000 }); await sleep(120); }

// answer `count` questions (all of them if omitted) with option k, recording the contract value each should send; returns { expect, kind }
async function answer(page, k, count) {
  const expect = {};
  let n = 0, texts = 0;
  for (let guard = 0; guard < 120; guard++) {
    const kind = await kindOf(page);
    if (kind === "review" || kind === "done") return { expect, kind };
    if (count !== undefined && n >= count) return { expect, kind };
    const before = await sig(page);
    if (kind === "intro") await page.locator("#sv-start").click();
    else if (kind === "chapter") await page.keyboard.press("Enter");
    else if (kind === "text") {
      // the survey's two free-text questions come in the order c5, c6
      const qid = ["c5", "c6"][texts++];
      const typed = "Typed answer. =1+1 " + k;
      await page.locator(".sv-textarea").fill(typed);
      expect[qid] = typed;
      await page.locator("#sv-next").click();
      n++;
    } else {
      const opts = await page.evaluate(() => [...document.querySelectorAll(".sv-option[data-qid]")].map((o) => ({ qid: o.dataset.qid, val: o.dataset.val })));
      const idx = Math.min(k, opts.length - 1), rule = C.SURVEY[opts[0].qid];
      expect[opts[0].qid] = rule ? rule.one[idx] : "NOT IN CONTRACT";
      await page.keyboard.press(String(idx + 1));
      n++;
    }
    await waitChange(page, before);
  }
  throw new Error("survey did not reach review");
}
async function submit(page) { await page.locator("#sv-next").click(); await page.waitForSelector("#sv-submit-status", { timeout: 8000 }); }
const clean = (e) => ({ ...e });
const posts = (stub, tail) => stub.log.filter((e) => e.method === "POST" && e.path.endsWith(tail));
const evs = (stub) => stub.log.filter((e) => e.method === "POST" && e.path.endsWith("/events")).map((e) => e.body && e.body.event);

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const stub = await start(8770);
  const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const newCtx = async (opts) => { const c = await browser.newContext({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true }); if (opts) await pointAt(c, opts); return c; };
  const SHEET_OK = { status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: '{"ok":true}' };

  // =====================================================================================================
  console.log('\n== 1 · sendTo = "sheet" (the default): the Survey sends to its Apps Script exactly as before, and makes no request to app.maulya.in');
  {
    const ctx = await newCtx();
    const page = await ctx.newPage();
    const toApp = [], toSheet = [];
    await page.route("https://app.maulya.in/**", (r) => { toApp.push(r.request().method() + " " + r.request().url()); r.abort(); });
    await page.route("https://script.google.com/**", (r) => { toSheet.push(r.request().postData()); r.fulfill(SHEET_OK); });
    await page.goto(BASE + "/survey/", { waitUntil: "networkidle" });
    ok("the build's defaults: apiBase https://app.maulya.in, sendTo sheet", await page.evaluate(() => { const t = document.getElementById("ea-visit"); return t.dataset.apiBase === "https://app.maulya.in" && t.dataset.sendTo === "sheet" && t.dataset.event === "site_survey_view"; }));
    await answer(page, 0);
    await submit(page);
    await page.waitForFunction(() => /Submitted/.test(document.getElementById("sv-submit-status").textContent), null, { timeout: 8000 });
    ok("sheet: the thank-you shows at once and the status ends 'Submitted ✅'", (await page.locator(".sv-done__title").innerText()) === "Thanks — responses received." && (await page.locator("#sv-submit-status").innerText()).includes("Submitted"));
    const body = toSheet.length ? JSON.parse(toSheet[0]) : null;
    ok("sheet: one POST to the Apps Script, in its old shape (timestamp_iso, src, survey_version, answers as the words, page_url…)", toSheet.length === 1 && body && Object.keys(body).join() === "timestamp_iso,src,survey_version,answers,page_url,user_agent,referrer,lang" && body.survey_version === "v3-full-25q" && body.answers.a1 === "Independent practice", body && body.survey_version);
    ok("sheet: not one request to app.maulya.in (no counting either)", toApp.length === 0, toApp.join(" "));
    await page.screenshot({ path: OUT + "/survey-sheet-done__360.png" });
    // leaving part-way sends nothing extra in sheet mode
    const page2 = await ctx.newPage();
    await page2.route("https://app.maulya.in/**", (r) => { toApp.push(r.request().url()); r.abort(); });
    await page2.route("https://script.google.com/**", (r) => { toSheet.push(r.request().postData()); r.fulfill(SHEET_OK); });
    await page2.goto(BASE + "/survey/", { waitUntil: "networkidle" });
    await answer(page2, 1, 3);
    await page2.goto("about:blank"); await sleep(300);
    ok("sheet: leaving part-way sends nothing anywhere", toApp.length === 0 && toSheet.length === 1);
    fs.writeFileSync(OUT + "/requests-survey-sheet.json", JSON.stringify({ toApp, toSheetBodies: toSheet.map((x) => x && JSON.parse(x)) }, null, 1));
    await ctx.close();
  }

  // =====================================================================================================
  console.log('\n== 2 · sendTo = "server": the counting events and the answers go to Maulya\'s server, and not to the Sheet');
  {
    stub.reset();
    const ctx = await newCtx({ base: STUB, sendTo: "server" });
    const page = await ctx.newPage();
    await page.goto(BASE + "/survey/", { waitUntil: "networkidle" });
    await sleep(300);
    ok("opening the Survey counts site_survey_view (once the server has answered)", evs(stub).join() === "site_survey_view", evs(stub).join());
    ok("before the first answer: no started, no done", !evs(stub).includes("site_survey_started"));
    await ctx.close();
  }
  for (let k = 0; k < 4; k++) {
    stub.reset();
    const ctx = await newCtx({ base: STUB, sendTo: "server" });
    const page = await ctx.newPage();
    const toSheet = [];
    await page.route("https://script.google.com/**", (r) => { toSheet.push(1); r.abort(); });
    await page.goto(BASE + "/survey/", { waitUntil: "networkidle" });
    const { expect } = await answer(page, k);
    await sleep(300);
    ok(`run ${k}: site_survey_started was counted once, on the first answer, and site_survey_done not yet`, evs(stub).filter((e) => e === "site_survey_started").length === 1 && !evs(stub).includes("site_survey_done"), evs(stub).join());
    await submit(page);
    await page.waitForFunction(() => /Submitted/.test(document.getElementById("sv-submit-status").textContent), null, { timeout: 8000 });
    await sleep(300);
    ok(`run ${k}: the events are site_survey_view, site_survey_started, site_survey_done, each once`, evs(stub).join() === "site_survey_view,site_survey_started,site_survey_done", evs(stub).join());
    const posted = posts(stub, "/responses");
    ok(`run ${k}: one POST to /api/v3/public/site-survey/responses`, posted.length === 1, String(posted.length));
    const e = posted[0];
    ok(`run ${k}: the stub accepted it (version, keys, values per the contract)`, e && e.problems.length === 0, e ? e.problems.join("; ") : "none");
    ok(`run ${k}: completed is true, version is ${C.SURVEY_VERSION}, visit is the session's uuid`, e && e.body.completed === true && e.body.version === C.SURVEY_VERSION && C.UUID4.test(e.body.visit) && e.body.visit === stub.log.find((x) => x.body && x.body.event).body.visit);
    const exp = clean(expect);
    const wrong = Object.keys(exp).filter((q) => e && e.body.answers[q] !== exp[q]);
    ok(`run ${k}: ${Object.keys(exp).length} answers, each the contract's code for the option chosen (and the typed text for the two text questions)`, e && wrong.length === 0 && Object.keys(e.body.answers).length === Object.keys(exp).length, wrong.slice(0, 3).map((q) => `${q}: ${e.body.answers[q]} vs ${exp[q]}`).join("; "));
    ok(`run ${k}: the thank-you shows only now, with 'Submitted ✅'`, (await page.locator(".sv-done__title").innerText()) === "Thanks — responses received." && (await page.locator("#sv-submit-status").innerText()).includes("Submitted"));
    ok(`run ${k}: nothing went to the Sheet`, toSheet.length === 0);
    ok(`run ${k}: no cookie, localStorage cleared after a good send`, await page.evaluate(() => document.cookie === "" && !localStorage.getItem("maulya_survey_v3_full")));
    if (k === 0) { await page.screenshot({ path: OUT + "/survey-server-done__360.png" }); fs.writeFileSync(OUT + "/requests-survey-server.json", JSON.stringify(stub.log.filter((x) => !x.preflight), null, 1)); }
    // leaving after a good send sends no partial
    await page.goto("about:blank"); await sleep(300);
    ok(`run ${k}: leaving after a good send sends no partial`, posts(stub, "/responses").length === 1);
    await ctx.close();
  }
  {
    // a send that fails: 5xx, then a dropped connection; no answer lost; Try again works
    stub.reset(); stub.setMode("survey", "500");
    const ctx = await newCtx({ base: STUB, sendTo: "server" });
    const page = await ctx.newPage();
    await page.goto(BASE + "/survey/", { waitUntil: "networkidle" });
    await answer(page, 0);
    await submit(page);
    await page.waitForSelector("#sv-retry", { timeout: 8000 });
    const msg = (await page.locator("#sv-submit-status").innerText()).replace(/\s+/g, " ");
    ok(`5xx: "${NOT_SENT}"`, msg.startsWith(NOT_SENT), msg);
    ok("5xx: the thank-you is not shown (the title says it is not sent yet)", (await page.locator(".sv-done__title").innerText()) === "Your answers are not sent yet.");
    ok("5xx: every answer is still kept (saved on this device, and the page can go back to them)", await page.evaluate(() => { const s = JSON.parse(localStorage.getItem("maulya_survey_v3_full") || "null"); return !!s && Object.keys(s.answers).length === 25; }));
    ok("5xx: there is a Try again button and a Download JSON one", (await page.locator("#sv-retry").count()) === 1 && (await page.locator("#sv-dl-fallback").count()) === 1);
    await page.screenshot({ path: OUT + "/survey-server-5xx__360.png" });
    stub.setMode("survey", "drop");
    await page.locator("#sv-retry").click();
    await page.waitForFunction(() => document.querySelector("#sv-retry") && !/Submitting/.test(document.getElementById("sv-submit-status").textContent), null, { timeout: 8000 });
    await sleep(300);
    ok("a dropped connection: the same words, the Try again button is back", (await page.locator("#sv-submit-status").innerText()).replace(/\s+/g, " ").startsWith(NOT_SENT) && (await page.locator("#sv-retry").count()) === 1);
    stub.setMode("survey", "ok");
    await page.locator("#sv-retry").click();
    await page.waitForFunction(() => /Submitted/.test(document.getElementById("sv-submit-status").textContent), null, { timeout: 8000 });
    ok("Try again, once the server is back: the thank-you, 'Submitted ✅'", (await page.locator(".sv-done__title").innerText()) === "Thanks — responses received.");
    ok("every body the page posted was valid", posts(stub, "/responses").every((x) => x.problems.length === 0), `${posts(stub, "/responses").length} posts`);
    await ctx.close();
  }
  {
    // leaving part-way: the answers so far, once, completed:false
    stub.reset();
    const ctx = await newCtx({ base: STUB, sendTo: "server" });
    const page = await ctx.newPage();
    await page.goto(BASE + "/survey/", { waitUntil: "networkidle" });
    const { expect } = await answer(page, 2, 3);
    await sleep(300);
    ok("part-way: nothing is posted while the person is still answering", posts(stub, "/responses").length === 0);
    await page.goto("about:blank"); await sleep(500);
    let part = posts(stub, "/responses");
    ok("leaving part-way: one POST with completed:false and the three answers so far", part.length === 1 && part[0].body.completed === false && Object.keys(part[0].body.answers).length === 3 && part[0].problems.length === 0, part.length ? `${Object.keys(part[0].body.answers).join(",")}; ${part[0].problems.join(";")}` : "none");
    const exp = clean(expect);
    ok("the partial's answers are the contract's codes for the options chosen", part.length === 1 && Object.keys(exp).every((q) => part[0].body.answers[q] === exp[q]));
    await page.goto(BASE + "/survey/", { waitUntil: "networkidle" });
    await answer(page, 1, 2);
    await page.goto("about:blank"); await sleep(500);
    ok("never more than once per visit: a second part-way leave sends nothing more", posts(stub, "/responses").length === 1);
    ok("the partial reached the server while the page was being left (sent with keepalive)", part.length === 1);
    fs.writeFileSync(OUT + "/requests-survey-partial.json", JSON.stringify(stub.log.filter((x) => !x.preflight), null, 1));
    await ctx.close();
  }

  await browser.close();
  await stub.close();
  console.log(bad ? `\n${bad} FAILED` : "\nall passed");
  process.exit(bad ? 1 : 0);
})();
