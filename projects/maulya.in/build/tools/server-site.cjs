// MLP/SRK-99 addendum 1 and 2: drives /early-access/ and /early-access/apply/ against build/tools/stub-server.cjs (a local stand-in for
// Maulya's server) and records what the pages send, once with earlyAccess.sendTo = "sheet" and once with "server".
//   node server-site.cjs <outdir> [base, default http://127.0.0.1:8768]
// Playwright: PW=<path to playwright or playwright-core>; CHROME=<path to chrome.exe or msedge.exe> to use an installed browser.
// How the settings are switched without a rebuild: the shared visit.js reads data-api-base and data-send-to from its own <script id="ea-visit">
// tag at the moment it needs them, so an init script sets those two attributes before the script runs (the build writes the defaults,
// https://app.maulya.in and "sheet"). The stub is on http://127.0.0.1:8770, a different origin from the page, so the browser does a real
// CORS preflight. Nothing here reaches the real server or Google: the Apps Script address is a fake one the test answers itself.
// It writes the recorded requests to <outdir>/requests-*.json and prints one line per check.
const { chromium } = require(process.env.PW || (process.env.HOME || process.env.USERPROFILE) + "/V3/node_modules/playwright");
const fs = require("fs");
const C = require("./contract.cjs");
const { start } = require("./stub-server.cjs");
const BASE = process.argv[3] || "http://127.0.0.1:8768";
const OUT = process.argv[2];
const STUB = "http://127.0.0.1:8770";
const APPLY = "/early-access/apply/";
const FAKE_SHEET = "https://fake-script.invalid/exec";
let bad = 0;
const ok = (what, cond, extra) => { if (!cond) bad++; console.log((cond ? "  ok   " : "  FAIL ") + what + (extra ? "  " + extra : "")); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ADDENDUM_FAIL = "Not sent. Your answers are still on this screen. Please try again, or WhatsApp 99801 40777.";
const SERVER_THANKS = "Thank you. You're on the waiting list. We read every application and reply to everyone within a week, chosen or not.";
const SHEET_FAIL = "We couldn't send this just now. Your answers are still here; please try again, or WhatsApp 99801 40777.";

// point the page's visit.js at the stub (base) and/or switch sendTo, before it runs
function pointAt(ctx, { base, sendTo }) {
  return ctx.addInitScript(({ base, sendTo }) => {
    const set = () => { const t = document.getElementById("ea-visit"); if (!t) return false; if (base) t.setAttribute("data-api-base", base); if (sendTo) t.setAttribute("data-send-to", sendTo); return true; };
    const mo = new MutationObserver(() => { if (set()) mo.disconnect(); });
    mo.observe(document, { childList: true, subtree: true });
  }, { base, sendTo });
}

// fill the whole form; run r picks option r (or the last) of every pick-one question, and ticks one or all options of tick-all ones
async function fill(page, data, r) {
  for (let i = 1; i <= 27; i++) {
    const w = page.locator(`[data-qwrap="${i}"]`), d = data[i];
    if (d && d.kind === "one") await w.locator(".opt").nth(Math.min(r, d.options.length - 1)).click();
    else if (d) {
      if (r % 2) { for (let k = 0; k < d.options.length; k++) await w.locator(".opt").nth(k).click(); } else await w.locator(".opt").nth(r % d.options.length).click();
      if (d.keyOther && r % 3 === 1) { await w.locator(".opt[data-other]").click(); await w.locator("[data-other-text]").fill(`Other thing ${r}`); }
    } else if (i === 8) await w.locator("input").fill(`Test Person ${r}`);
    else if (i === 9) await w.locator("input").fill(`test${r}@example.com`);
    else if (i === 10) await w.locator("input").fill(r % 2 ? "+91 98765 43210" : "98765 43210");
    else if (i === 11) await w.locator("input").fill("Testville, Karnataka");
    else if (i === 13) await w.locator("input").fill("Test Valuers");
    else if (i === 27 && r % 2 === 0) await w.locator("textarea").fill("Nothing else. =1+1");
  }
  await page.locator("#consent").check();
}
const textOf = async (page) => (await page.locator("#apply-state").innerText()).replace(/\s+/g, " ").trim();
const apps = (stub) => stub.log.filter((e) => e.method === "POST" && e.path.endsWith("/applications"));
const evs = (stub) => stub.log.filter((e) => e.method === "POST" && e.path.endsWith("/events")).map((e) => e.body && e.body.event);

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const stub = await start(8770);
  const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const newCtx = async (opts) => { const c = await browser.newContext({ viewport: { width: 360, height: 800 }, isMobile: true, hasTouch: true }); if (opts) await pointAt(c, opts); return c; };

  // =========================================================================================================
  console.log('\n== A · sendTo = "sheet" (the default): the Sheet gets the application; app.maulya.in gets only the counting events');
  {
    // A1: the built defaults go to https://app.maulya.in. Record every request to it; answer only the events endpoint.
    const ctx = await newCtx();
    const page = await ctx.newPage();
    const toApp = [];
    await page.route("https://app.maulya.in/**", (route) => {
      const rq = route.request(); toApp.push({ method: rq.method(), path: new URL(rq.url()).pathname, body: rq.postData() });
      const cors = { "access-control-allow-origin": "*", "access-control-allow-headers": "content-type" };
      if (rq.method() === "OPTIONS" || new URL(rq.url()).pathname.endsWith("/events")) route.fulfill({ status: 204, headers: cors }); else route.abort();
    });
    const toSheet = [];
    await page.route("https://fake-script.invalid/**", (route) => { toSheet.push(route.request().postData()); route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: '{"ok":true}' }); });
    await page.goto(BASE + APPLY, { waitUntil: "networkidle" });
    ok("the build's defaults: apiBase https://app.maulya.in, sendTo sheet", await page.evaluate(() => { const t = document.getElementById("ea-visit"); return t.dataset.apiBase === "https://app.maulya.in" && t.dataset.sendTo === "sheet"; }));
    const data = JSON.parse(await page.evaluate(() => document.getElementById("apply-data").textContent));
    await page.evaluate((u) => document.getElementById("apply").setAttribute("data-endpoint", u), FAKE_SHEET);
    await fill(page, data, 0);
    await page.locator("#apply-btn").click();
    await page.waitForSelector("#apply-done:not([hidden])", { timeout: 8000 });
    await sleep(500);
    ok("sheet: the confirmation is the founder's own line", (await page.locator("#apply-done").innerText()).trim() === "We read every application and reply to everyone within a week, chosen or not.");
    ok("sheet: one body went to the Sheet, with q1..q27", toSheet.length === 1 && Object.keys(JSON.parse(toSheet[0]).answers).join() === Array.from({ length: 27 }, (_, i) => "q" + (i + 1)).join());
    ok("sheet: the answer is the words people read (not a code)", JSON.parse(toSheet[0]).answers.q1 === "Yes, more than once");
    const posts = toApp.filter((x) => x.method === "POST");
    ok("sheet: app.maulya.in got only /api/v3/public/early-access/events", posts.length > 0 && posts.every((x) => x.path === "/api/v3/public/early-access/events"), posts.map((x) => x.path).join(" ") ? "" : "no posts");
    ok("sheet: nothing was sent to .../applications or .../site-survey", !toApp.some((x) => /applications|site-survey/.test(x.path)));
    ok("sheet: the events are apply_view, apply_started, survey_done (once each)", posts.map((x) => JSON.parse(x.body).event).join() === "apply_view,apply_started,survey_done", posts.map((x) => JSON.parse(x.body).event).join());
    fs.writeFileSync(OUT + "/requests-sheet-app.maulya.in.json", JSON.stringify({ toApp, toSheetCount: toSheet.length }, null, 1));
    await ctx.close();
  }
  {
    // A2: the same, against the stub as apiBase: the browser does a real preflight; the stub validates every event
    stub.reset();
    const ctx = await newCtx({ base: STUB, sendTo: "sheet" });
    const page = await ctx.newPage();
    // no page.route yet: while Playwright intercepts requests Chromium skips the preflight, and this check wants the real one
    await page.goto(BASE + "/early-access/", { waitUntil: "networkidle" });
    await sleep(400);
    ok("/early-access/ counts ea_view (a 204, after a real CORS preflight)", evs(stub).join() === "ea_view" && stub.log.some((e) => e.preflight && e.path.endsWith("/events")), `log: ${JSON.stringify(stub.log.map((e) => e.method + " " + e.path.split("/").pop()))}`);
    await page.route("https://fake-script.invalid/**", (route) => route.fulfill({ status: 200, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: '{"ok":true}' }));
    await page.goto(BASE + APPLY, { waitUntil: "networkidle" });
    const data = JSON.parse(await page.evaluate(() => document.getElementById("apply-data").textContent));
    await page.evaluate((u) => document.getElementById("apply").setAttribute("data-endpoint", u), FAKE_SHEET);
    await page.locator('[data-qwrap="1"] .opt').first().click();
    await page.locator('[data-qwrap="1"] .opt').nth(1).click();
    for (let i = 2; i <= 7; i++) await page.locator(`[data-qwrap="${i}"] .opt`).first().click();
    await sleep(500);
    ok("apply: the events so far are ea_view, apply_view, apply_started, survey_done, each once", evs(stub).join() === "ea_view,apply_view,apply_started,survey_done", evs(stub).join());
    const visits = new Set(stub.log.filter((e) => e.body && e.body.visit).map((e) => e.body.visit));
    ok("one visit id (a uuid v4) across both pages", visits.size === 1 && C.UUID4.test([...visits][0]), [...visits].join());
    ok("the stub found nothing wrong in any event", stub.log.every((e) => e.problems.length === 0), JSON.stringify(stub.log.filter((e) => e.problems.length).map((e) => e.problems)));
    ok("no cookie was set or sent; the visit id is in sessionStorage only, localStorage is empty", await page.evaluate(() => document.cookie === "" && !!sessionStorage.getItem("maulya_visit") && localStorage.length === 0) && stub.log.every((e) => !e.cookie));
    ok("the visit id is sessionStorage's value", await page.evaluate((v) => sessionStorage.getItem("maulya_visit") === v, [...visits][0]));
    await fill(page, data, 0);
    const before = stub.log.length;
    await page.locator("#apply-btn").click();
    await page.waitForSelector("#apply-done:not([hidden])", { timeout: 8000 });
    await sleep(300);
    ok("sheet: pressing Send made no request to the server's /applications", apps(stub).length === 0, `${stub.log.length - before} new requests to the stub`);
    fs.writeFileSync(OUT + "/requests-sheet-stub.json", JSON.stringify(stub.log, null, 1));
    await ctx.close();
  }
  {
    // A3: the gate. A server that is not live answers the first event badly: nothing more is sent for the visit.
    stub.reset(); stub.setMode("events", "500");
    const ctx = await newCtx({ base: STUB, sendTo: "sheet" });
    const page = await ctx.newPage();
    await page.goto(BASE + "/early-access/", { waitUntil: "networkidle" });
    await page.goto(BASE + APPLY, { waitUntil: "networkidle" });
    for (let i = 1; i <= 7; i++) await page.locator(`[data-qwrap="${i}"] .opt`).first().click();
    await sleep(500);
    const posts = stub.log.filter((e) => e.method === "POST");
    ok("a server that is not up: only the first event is tried; no more are sent, nothing is shown", posts.length === 1 && posts[0].body.event === "ea_view" && (await page.locator("#apply-state").innerText()) === "", `${posts.length} events tried`);
    ok("the form still works for the visitor", (await page.locator('[data-qwrap="7"] .opt[aria-pressed=true]').count()) === 1);
    await ctx.close();
    stub.reset();
    // a server that does not exist at all: the same, and no error is shown
    const ctx2 = await newCtx({ base: "http://127.0.0.1:1", sendTo: "sheet" });
    const p2 = await ctx2.newPage();
    const errs = []; p2.on("pageerror", (e) => errs.push(String(e)));
    await p2.goto(BASE + APPLY, { waitUntil: "networkidle" });
    await p2.locator('[data-qwrap="1"] .opt').first().click(); await sleep(300);
    ok("no server at all: no page error, nothing shown", errs.length === 0 && (await p2.locator("#apply-state").innerText()) === "");
    await ctx2.close();
  }

  // =========================================================================================================
  console.log('\n== B · sendTo = "server": the contract');
  {
    stub.reset();
    const ctx = await newCtx({ base: STUB, sendTo: "server" });
    const page = await ctx.newPage();
    const sheetHits = []; await page.route("https://fake-script.invalid/**", (r) => { sheetHits.push(1); r.abort(); });
    await page.goto(BASE + APPLY, { waitUntil: "networkidle" });
    const data = JSON.parse(await page.evaluate(() => document.getElementById("apply-data").textContent));
    await page.evaluate((u) => document.getElementById("apply").setAttribute("data-endpoint", u), FAKE_SHEET);

    // the trap field is hidden from people and from screen readers
    const trap = await page.evaluate(() => { const i = document.getElementById("website"), w = i.parentElement, r = i.getBoundingClientRect(); return { tab: i.tabIndex, ariaHidden: w.getAttribute("aria-hidden"), off: r.right < 0 || r.left > innerWidth, labelled: !!document.querySelector('label[for="website"]'), value: i.value, placeholder: i.placeholder }; });
    ok("the trap field 'website': tabindex -1, aria-hidden, off screen, no label, empty", trap.tab === -1 && trap.ariaHidden === "true" && trap.off && !trap.labelled && trap.value === "" && !trap.placeholder, JSON.stringify(trap));
    let reached = false;
    await page.locator("h1").click(); // start from the top of the page
    for (let i = 0; i < 40; i++) { await page.keyboard.press("Tab"); if (await page.evaluate(() => document.activeElement && document.activeElement.id === "website")) reached = true; }
    ok("Tab never lands on the trap field", !reached);

    // incomplete: nothing is sent; the missing list
    await page.locator("#apply-btn").click({ force: true });
    ok("half-filled: nothing is sent to the server's /applications", apps(stub).length === 0);

    // every value, across six runs: run r picks option r of every pick-one question (the last if it has fewer), tick-all alternate
    const seenValues = {};
    for (let r = 0; r < 6; r++) {
      if (r > 0) { await page.goto(BASE + APPLY, { waitUntil: "networkidle" }); }
      await fill(page, data, r);
      await page.locator("#apply-btn").click();
      await page.waitForSelector("#apply-done:not([hidden])", { timeout: 8000 });
      const last = apps(stub)[apps(stub).length - 1];
      ok(`run ${r}: the stub accepted the body (keys, values and limits per the contract)`, last && last.problems.length === 0, last ? last.problems.join("; ") : "no request");
      if (last && last.body) {
        const b = last.body;
        // each answer is the contract's value at the chosen option's position
        let wrong = [];
        for (let n = 1; n <= 26; n++) {
          const d = data[n]; if (!d) continue;
          const rule = C.APPLICATION[d.key], vals = (rule.one || rule.many).filter((v) => v !== "other");
          const picks = d.kind === "one" ? [Math.min(r, d.options.length - 1)] : (r % 2 ? d.options.map((_, k) => k) : [r % d.options.length]);
          const want = picks.map((k) => vals[k]);
          if (d.keyOther && r % 3 === 1) want.push("other");
          const got = b.answers[d.key];
          if (JSON.stringify(d.kind === "one" ? [got] : got) !== JSON.stringify(want)) wrong.push(`${d.key}: sent ${JSON.stringify(got)}, wanted ${JSON.stringify(want)}`);
          for (const v of [].concat(got)) (seenValues[d.key] = seenValues[d.key] || new Set()).add(v);
        }
        ok(`run ${r}: every pick sent the contract's code for the option chosen`, wrong.length === 0, wrong.slice(0, 2).join(" | "));
        ok(`run ${r}: visit is the session's uuid, consent true, website ""`, C.UUID4.test(b.visit) && b.consent === true && b.website === "");
        ok(`run ${r}: WhatsApp is ten digits (+91 and spaces removed)`, b.answers.whatsapp === "9876543210", b.answers.whatsapp);
        if (r % 3 === 1) ok(`run ${r}: Other sends "other" and its text under the *_other keys`, b.answers.time_sinks.includes("other") && b.answers.time_sinks_other === `Other thing ${r}` && b.answers.worth_paying_other === `Other thing ${r}`);
        if (r % 2 === 1) ok(`run ${r}: the optional anything_else is left out when empty`, !("anything_else" in b.answers));
        else ok(`run ${r}: the optional anything_else is sent when written`, b.answers.anything_else === "Nothing else. =1+1");
      }
      ok(`run ${r}: the confirmation is the addendum's words`, (await page.locator("#apply-done").innerText()).trim() === SERVER_THANKS);
    }
    const allValues = Object.entries(C.APPLICATION).filter(([, rule]) => rule.one || rule.many);
    const missed = allValues.flatMap(([k, rule]) => (rule.one || rule.many).filter((v) => !(seenValues[k] && seenValues[k].has(v))).map((v) => `${k}=${v}`));
    ok("across the six runs every value of every pick question in the contract was sent at least once and accepted", missed.length === 0, missed.slice(0, 8).join(", "));
    ok("sheet: nothing was sent to the Sheet while sendTo is server", sheetHits.length === 0);
    await page.screenshot({ path: OUT + "/server-sent__360.png" });
    fs.writeFileSync(OUT + "/requests-server-applications.json", JSON.stringify(stub.log.filter((e) => !e.preflight), null, 1));
    await ctx.close();
  }
  {
    // the server's answers
    stub.reset();
    const ctx = await newCtx({ base: STUB, sendTo: "server" });
    const page = await ctx.newPage();
    await page.goto(BASE + APPLY, { waitUntil: "networkidle" });
    const data = JSON.parse(await page.evaluate(() => document.getElementById("apply-data").textContent));
    await fill(page, data, 0);
    const kept = async () => (await page.locator("#q8").inputValue()) === "Test Person 0" && (await page.locator('[data-qwrap="2"] .opt[aria-pressed=true]').count()) === 1 && (await page.locator("#consent").isChecked());
    const buttonBack = async () => (await page.locator("#apply-btn").innerText()) === "Send my application" && (await page.locator("#apply-btn").getAttribute("aria-disabled")) === "false";

    stub.setMode("applications", "missing"); stub.setMissing(["whatsapp", "consent", "districts", "time_sinks_other"]);
    await page.locator("#apply-btn").click();
    await page.waitForSelector("#apply-state a[data-goto]", { timeout: 8000 });
    const links = await page.locator("#apply-state a[data-goto]").allInnerTexts();
    ok("422 early_access.missing: each missing question named, with a link (10, the box, 17, 22)", links.length === 4 && links[0].startsWith("10. WhatsApp number") && links[1] === "The box to agree" && links[2].startsWith("17. How many districts") && links[3].startsWith("22. What takes the most time"), JSON.stringify(links.map((t) => t.slice(0, 28))));
    ok("422: the head says what is still needed", (await page.locator("#apply-state .apply-need-head").innerText()) === "Still needed before you can send:");
    ok("422: every answer is still on the screen, the button is back", (await kept()) && (await buttonBack()));
    await page.locator('#apply-state a[data-goto="10"]').click();
    ok("422: the link goes to that question", await page.evaluate(() => document.activeElement.id === "q10"));
    await page.screenshot({ path: OUT + "/server-422__360.png" });

    stub.setMode("applications", "429");
    await page.locator("#apply-btn").click();
    await page.waitForFunction(() => /Too many applications/.test(document.getElementById("apply-state").textContent), null, { timeout: 8000 });
    ok("429: the server's own message is shown", (await textOf(page)) === "Too many applications from this connection. Please try again in an hour.", await textOf(page));
    ok("429: every answer is still on the screen, the button is back", (await kept()) && (await buttonBack()));

    stub.setMode("applications", "500");
    await page.locator("#apply-btn").click();
    await page.waitForFunction((m) => document.getElementById("apply-state").textContent === m, ADDENDUM_FAIL, { timeout: 8000 });
    ok('5xx: "Not sent. Your answers are still on this screen. Please try again, or WhatsApp 99801 40777."', (await textOf(page)) === ADDENDUM_FAIL);
    ok("5xx: every answer is still on the screen, the button is back", (await kept()) && (await buttonBack()));
    await page.screenshot({ path: OUT + "/server-5xx__360.png" });

    stub.setMode("applications", "drop");
    await page.locator("#apply-btn").click();
    await page.waitForFunction((m) => document.getElementById("apply-state").textContent === m, ADDENDUM_FAIL, { timeout: 8000 });
    ok("a dropped connection (network error): the same words, answers kept", (await textOf(page)) === ADDENDUM_FAIL && (await kept()) && (await buttonBack()));

    stub.setMode("applications", "ok");
    await page.locator("#apply-btn").click();
    await page.waitForSelector("#apply-done:not([hidden])", { timeout: 8000 });
    ok("then a good send: the confirmation, and the form is gone", (await page.locator("#apply-done").innerText()).trim() === SERVER_THANKS && (await page.locator("#apply").isHidden()));
    const sent = apps(stub);
    ok(`the application was posted ${sent.length} times (422, 429, 5xx, a dropped connection, then the good one; Chromium itself repeats a POST whose connection was reset), every body valid`, sent.length >= 5 && sent.length <= 6 && sent.every((e) => e.problems.length === 0));
    await ctx.close();
  }
  {
    // the trap: a robot fills "website": it is told "thanks" and nothing reaches the server
    stub.reset();
    const ctx = await newCtx({ base: STUB, sendTo: "server" });
    const page = await ctx.newPage();
    await page.goto(BASE + APPLY, { waitUntil: "networkidle" });
    const data = JSON.parse(await page.evaluate(() => document.getElementById("apply-data").textContent));
    await fill(page, data, 0);
    await page.evaluate(() => { document.getElementById("website").value = "http://spam.example"; });
    await page.locator("#apply-btn").click();
    await page.waitForSelector("#apply-done:not([hidden])", { timeout: 8000 });
    ok("a filled trap field: a robot is thanked and no application is posted", apps(stub).length === 0);
    await ctx.close();
  }

  await browser.close();
  await stub.close();
  console.log(bad ? `\n${bad} FAILED` : "\nall passed");
  process.exit(bad ? 1 : 0);
})();
