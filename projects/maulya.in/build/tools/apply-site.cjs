// MLP/ARK-719: drives the early-access application page in a browser and checks what it does.
//   node apply-site.cjs <outdir> [base, default http://127.0.0.1:8768]
// Run it through ~/Downloads/Maulya/6_TOOLS/mac_load/heavy.sh (a browser is heavy work), against a served build
// (python3 -m http.server 8768 --bind 127.0.0.1 inside dist/preview/Maulya_preview_all_posts).
// It checks, at 360, 768, 1280 and 1440 px: one h1, no sideways scroll, every answer button at least 44 px tall and a real
// <button> with aria-pressed, the reply under each answer (against the JSON the page ships, which build/tools/check-apply.mjs
// has already compared with the approved file), "Other" opening a text box, the send button staying off and saying what is
// missing, a send with no Apps Script address (nothing sent, said plainly), a send that works, and a send that fails (the
// answers stay). It never contacts a real server: every send goes to a fake address the script answers itself.
// It writes pictures to <outdir>/.
const { chromium } = require(process.env.PW || process.env.HOME + "/V3/node_modules/playwright");
const fs = require("fs");
const BASE = process.argv[3] || "http://127.0.0.1:8768";
const OUT = process.argv[2];
let bad = 0;
const ok = (what, cond, extra) => { if (!cond) bad++; console.log((cond ? "  ok   " : "  FAIL ") + what + (extra ? "  " + extra : "")); };

async function fillAll(page, data, pick) {
  // every question: the first option (or the one named in pick), text fields with plain made-up values
  const n = await page.evaluate(() => document.querySelectorAll("[data-qwrap]").length);
  for (let i = 1; i <= n; i++) {
    const w = page.locator(`[data-qwrap="${i}"]`);
    const d = data[i];
    if (d) { const k = (pick && pick[i]) || 0; await w.locator(".opt").nth(k).click(); }
    else if (i === 8) await w.locator("input").fill("Test Person");
    else if (i === 9) await w.locator("input").fill("test@example.com");
    else if (i === 10) await w.locator("input").fill("9000000000");
    else if (i === 11) await w.locator("input").fill("Testville, Karnataka");
    else if (i === 13) await w.locator("input").fill("Test Valuers");
    else if (i === 26) await w.locator("textarea").fill("=1+1 test");
  }
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  for (const w of [360, 768, 1280, 1440]) {
    console.log(`\n== ${w} px`);
    const ctx = await browser.newContext({ viewport: { width: w, height: w < 800 ? 800 : 900 }, isMobile: w < 800, hasTouch: w < 800 });
    const page = await ctx.newPage();
    const errs = [];
    page.on("console", (m) => { if (m.type() === "error") errs.push(m.text().slice(0, 140)); });
    page.on("pageerror", (e) => errs.push("pageerror " + String(e).slice(0, 140)));
    await page.goto(BASE + "/early-access/apply/", { waitUntil: "networkidle" });
    const data = JSON.parse(await page.evaluate(() => document.getElementById("apply-data").textContent));

    ok("one h1", (await page.locator("h1").count()) === 1, await page.locator("h1").innerText());
    ok("26 questions", (await page.locator("[data-qwrap]").count()) === 26);
    ok("no sideways scroll", await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    const btns = await page.evaluate(() => [...document.querySelectorAll(".opt")].map((b) => ({ tag: b.tagName, h: Math.round(b.getBoundingClientRect().height), p: b.getAttribute("aria-pressed"), t: b.type })));
    ok(`${btns.length} answer buttons, all <button type=button> with aria-pressed`, btns.every((b) => b.tag === "BUTTON" && b.t === "button" && (b.p === "false" || b.p === "true")));
    ok("every answer button at least 44 px tall", btns.every((b) => b.h >= 44), "min " + Math.min(...btns.map((b) => b.h)));
    ok("replies are role=status", (await page.locator(".reply[role=status]").count()) === Object.keys(data).filter((k) => /^\d+$/.test(k)).length);
    const small = await page.evaluate(() => [...document.querySelectorAll("a, button, input:not([type=checkbox]), textarea, .consent")].filter((e) => e.offsetParent && !e.closest("p, li")).map((e) => ({ t: (e.textContent || e.id || "").trim().slice(0, 24), h: Math.round(e.getBoundingClientRect().height), w: Math.round(e.getBoundingClientRect().width) })).filter((e) => e.h < 44));
    ok("no other control under 44 px tall", small.length === 0, JSON.stringify(small.slice(0, 4)));
    await page.screenshot({ path: `${OUT}/apply-top__${w}.png`, fullPage: false });

    // the send button starts off and says what is missing
    ok("send is off at the start", (await page.locator("#apply-btn").getAttribute("aria-disabled")) === "true");
    const miss0 = await page.locator("#apply-missing").innerText();
    ok("says what is missing", /^Still needed before you can send: questions 1–25 and the box to agree\.$/.test(miss0), JSON.stringify(miss0));

    // a reply under each answer: click every option of every pick question, compare the words shown
    let replies = 0, wrong = [];
    for (const [k, d] of Object.entries(data)) {
      if (!/^\d+$/.test(k) || d.kind !== "one") continue;
      const q = page.locator(`[data-qwrap="${k}"]`);
      for (let i = 0; i < d.options.length; i++) {
        await q.locator(".opt").nth(i).click();
        const shown = (await q.locator(".reply").innerText()).replace(/\s+/g, " ").trim();
        const r = d.options[i].reply, want = r ? (r.bold + (r.rest ? " " + r.rest : "")) : "";
        if (r) replies++;
        if (shown !== want) wrong.push(`Q${k} ${d.options[i].label}`);
        const pressed = await q.locator(".opt").evaluateAll((bs) => bs.map((b) => b.getAttribute("aria-pressed")));
        if (pressed.filter((x) => x === "true").length !== 1 || pressed[i] !== "true") wrong.push(`Q${k} pressed state`);
      }
    }
    ok(`${replies} pick-one replies show exactly their words, one answer pressed at a time`, wrong.length === 0, wrong.join("; "));
    // tick all: one line per ticked option under a heading, "Other" opens a box and adds no line
    for (const k of ["21", "22"]) {
      const d = data[k], q = page.locator(`[data-qwrap="${k}"]`);
      for (let i = 0; i < d.options.length; i++) await q.locator(".opt").nth(i).click();
      const lines = await q.locator(".reply li").allInnerTexts();
      const head = await q.locator(".reply p").innerText();
      ok(`Q${k}: heading and ${d.options.length} lines`, head === d.head && lines.join("|") === d.options.map((o) => o.reply.line).join("|"));
      await q.locator(".opt[data-other]").click();
      ok(`Q${k}: Other opens a text box`, await q.locator(".other").isVisible());
      ok(`Q${k}: Other adds no line`, (await q.locator(".reply li").count()) === d.options.length);
      await q.locator(".opt").nth(0).click();
      ok(`Q${k}: unticking removes its line`, (await q.locator(".reply li").count()) === d.options.length - 1);
    }
    await page.locator('[data-qwrap="21"]').scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${OUT}/apply-replies__${w}.png`, fullPage: false });

    // keyboard: Tab to a question's buttons, Space and Enter press one; the focus ring shows
    await page.locator('[data-qwrap="1"] .opt').first().focus();
    await page.keyboard.press("Tab"); await page.keyboard.press("Space");
    ok("keyboard: Space presses the second button of Q1", (await page.locator('[data-qwrap="1"] .opt').nth(1).getAttribute("aria-pressed")) === "true");
    await page.keyboard.press("Tab"); await page.keyboard.press("Enter");
    ok("keyboard: Enter presses the third", (await page.locator('[data-qwrap="1"] .opt').nth(2).getAttribute("aria-pressed")) === "true");
    ok("keyboard: a ring shows on the focused button", await page.evaluate(() => { const s = getComputedStyle(document.activeElement).boxShadow; return !!s && s !== "none"; }));

    // incomplete: the button is off; pressing it names what is missing and moves to the first one
    await page.goto(BASE + "/early-access/apply/", { waitUntil: "networkidle" });
    await page.locator('[data-qwrap="1"] .opt').first().click();
    await page.locator("#apply-btn").click({ force: true }); // aria-disabled: Playwright would wait for it for ever
    const st = await page.locator("#apply-state").innerText();
    ok("pressing send half-done says what is missing, and sends nothing", /^Still needed before you can send: questions 2–25 and the box to agree\.$/.test(st), JSON.stringify(st));
    ok("focus moves to the first missing question", await page.evaluate(() => document.activeElement.closest("[data-qwrap]").getAttribute("data-qwrap") === "2"));
    await page.screenshot({ path: `${OUT}/apply-missing__${w}.png`, fullPage: false });

    // all answered: still off until the consent box is ticked
    await fillAll(page, data);
    // Q15, Q19 are tick-all (no reply): fillAll pressed one each; Q21, Q22 too
    ok("all answered but not agreed: still off, asks for the box", (await page.locator("#apply-btn").getAttribute("aria-disabled")) === "true" && /^Still needed before you can send: the box to agree\.$/.test(await page.locator("#apply-missing").innerText()), JSON.stringify(await page.locator("#apply-missing").innerText()));
    // a malformed email or a short number is not an answer
    await page.locator("#q9").fill("not-an-email");
    ok("an email without @ is still needed", /question 9 and the box/.test(await page.locator("#apply-missing").innerText()));
    await page.locator("#q9").fill("test@example.com");
    await page.locator("#q10").fill("12345");
    ok("a short number is still needed", /question 10 and the box/.test(await page.locator("#apply-missing").innerText()));
    await page.locator("#q10").fill("98765 43210");
    await page.locator("#consent").check();
    ok("everything done: send is on and the line is empty", (await page.locator("#apply-btn").getAttribute("aria-disabled")) === "false" && (await page.locator("#apply-missing").innerText()) === "");
    await page.screenshot({ path: `${OUT}/apply-ready__${w}.png`, fullPage: false });

    // no Apps Script address (the page as built today): nothing sent, said plainly, answers stay
    let posted = 0;
    await page.route("**/fake-script/**", (r) => { posted++; r.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }); });
    const endpoint = await page.locator("#apply").getAttribute("data-endpoint");
    if (!endpoint) {
      await page.locator("#apply-btn").click();
      const msg = await page.locator("#apply-state").innerText();
      ok("no address: says sending opens soon and nothing was sent", /Sending applications opens soon\. Nothing was sent/.test(msg), JSON.stringify(msg));
      ok("no address: answers stay on the screen", (await page.locator("#q8").inputValue()) === "Test Person" && (await page.locator('[data-qwrap="2"] .opt[aria-pressed=true]').count()) === 1);
      ok("no address: no request left the page", posted === 0);
      await page.screenshot({ path: `${OUT}/apply-not-open__${w}.png`, fullPage: false });
    }

    // a send that fails: says so, answers stay, the button is back
    await page.evaluate(() => document.getElementById("apply").setAttribute("data-endpoint", "https://fake-script.invalid/exec"));
    await page.unroute("**/fake-script/**");
    await page.route("https://fake-script.invalid/**", (r) => r.abort());
    await page.locator("#apply-btn").click();
    await page.waitForFunction(() => /not sent/.test(document.getElementById("apply-state").textContent), null, { timeout: 8000 });
    ok("a failed send says so", /^Your application was not sent\./.test(await page.locator("#apply-state").innerText()));
    ok("a failed send keeps every answer", (await page.locator("#q13").inputValue()) === "Test Valuers" && (await page.locator('[data-qwrap="21"] .opt[aria-pressed=true]').count()) > 0 && (await page.locator("#consent").isChecked()));
    ok("the button is back, with its words", (await page.locator("#apply-btn").innerText()) === "Send my application" && (await page.locator("#apply-btn").getAttribute("aria-disabled")) === "false");
    await page.screenshot({ path: `${OUT}/apply-failed__${w}.png`, fullPage: false });

    // a send that works: the confirmation, and the right row
    await page.unroute("https://fake-script.invalid/**");
    let body = null;
    await page.route("https://fake-script.invalid/**", (r) => { body = r.request().postData(); r.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }); });
    await page.locator("#apply-btn").click();
    await page.waitForSelector("#apply-done:not([hidden])", { timeout: 8000 });
    ok("the confirmation is the approved line", (await page.locator("#apply-done").innerText()).trim() === "We read every application and reply to everyone within a week, chosen or not.");
    ok("the form is gone and focus is on the confirmation", (await page.locator("#apply").isHidden()) && (await page.evaluate(() => document.activeElement.id)) === "apply-done");
    const p = JSON.parse(body);
    const keys = Object.keys(p.answers);
    ok("the payload has q1..q26 in order and a time", keys.length === 26 && keys.every((k, i) => k === "q" + (i + 1)) && /^\d{4}-\d\d-\d\dT/.test(p.timestamp_iso), p.form_version);
    ok("pick-one answers are the option's words; tick-all are lists", p.answers.q1 === "Yes, more than once" && Array.isArray(p.answers.q15) && Array.isArray(p.answers.q21));
    ok("text answers are the typed text", p.answers.q8 === "Test Person" && p.answers.q10 === "98765 43210" && p.answers.q26 === "=1+1 test");
    await page.screenshot({ path: `${OUT}/apply-sent__${w}.png`, fullPage: false });
    await page.screenshot({ path: `${OUT}/apply-full__${w}.png`, fullPage: true });
    ok("no console errors or failed requests of the page's own", errs.filter((e) => !/fake-script|ERR_FAILED|net::/.test(e)).length === 0, errs.join(" | ").slice(0, 200));
    await ctx.close();
  }

  // reduced motion: the reply appears with no animation
  const rctx = await browser.newContext({ viewport: { width: 360, height: 800 }, reducedMotion: "reduce" });
  const rp = await rctx.newPage();
  await rp.goto(BASE + "/early-access/apply/", { waitUntil: "networkidle" });
  await rp.locator('[data-qwrap="1"] .opt').first().click();
  ok("reduced motion: the reply has no animation", await rp.evaluate(() => { const a = getComputedStyle(document.querySelector('[data-qwrap="1"] .reply')); return a.animationName === "none" || parseFloat(a.animationDuration) === 0; }));
  await rp.screenshot({ path: `${OUT}/apply-reduced__360.png` });
  await rctx.close();

  // no script: the page says so and shows no dead form
  const nctx = await browser.newContext({ viewport: { width: 360, height: 800 }, javaScriptEnabled: false });
  const np = await nctx.newPage();
  await np.goto(BASE + "/early-access/apply/");
  ok("no script: the form is not shown", !(await np.locator("#apply").isVisible()));
  ok("no script: a line says the form needs JavaScript and gives the email", /needs JavaScript\. If it will not run for you, write to support@maulya\.in\./.test(await np.locator("noscript").first().innerText().catch(() => "") || await np.content()));
  await np.screenshot({ path: `${OUT}/apply-no-script__360.png` });
  await nctx.close();

  await browser.close();
  console.log(bad ? `\n${bad} FAILED` : "\nall passed");
  process.exit(bad ? 1 : 0);
})();
