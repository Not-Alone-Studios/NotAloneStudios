// maulya.in (MLP/ARK-719; MLP/SRK-99 addenda 1 and 2): the early-access application page (/early-access/apply/). The words are in
// src/pages/early-access-apply.mjs and arrive as JSON in #apply-data: this file holds the behaviour only.
//  - an answer button is a real <button aria-pressed>; the reply to it appears under the question in a role="status" box
//  - "Send my application" stays off (aria-disabled, so a keyboard can still reach it and ask what is missing) until every
//    question marked * is answered and the consent box is ticked, and the page says which are still needed. Pressed
//    half-done it sends nothing and lists what is missing, each item a link to its question
//  - WHERE THE ANSWERS GO follows the site's earlyAccess.sendTo (window.MaulyaEA.sendTo(), from src/assets/visit.js):
//      "sheet"  (default): the Google Apps Script web app named in the form's data-endpoint (early-access-apps-script/code.gs):
//               one q1..q27 JSON body, text/plain. While that address is empty nothing is sent and the page says so.
//      "server": POST {apiBase}/api/v3/public/early-access/applications, the contract's keys and values:
//               {"visit","answers":{...},"consent":true,"website":""}. 201 -> the confirmation; 422 early_access.missing -> the
//               missing questions as links; 429 -> the server's message; a network error or 5xx -> "Not sent...".
//    Either way a failed send keeps every answer on the screen. No application is lost silently.
//  - counting (visit.js, fire and forget): apply_started on the first answer, survey_done when the seven Part 1 questions are answered
//  - "website" is a hidden trap field (aria-hidden, tabindex -1, off screen): a person never sees or reaches it
(function () {
  "use strict";
  var form = document.getElementById("apply");
  var dataEl = document.getElementById("apply-data");
  if (!form || !dataEl) return;
  var D = JSON.parse(dataEl.textContent);
  var EA = window.MaulyaEA || null; // visit.js; the form still works without it (sends to the Sheet, counts nothing)
  var mode = function () { return EA && EA.sendTo() === "server" ? "server" : "sheet"; }; // read at send time
  var endpointNow = function () { return form.getAttribute("data-endpoint") || ""; };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var btn = $("#apply-btn"), consent = $("#consent"), missingEl = $("#apply-missing"), stateEl = $("#apply-state"), trap = $("#website");
  var sendLabel = btn.textContent, sending = false, attempted = false, startedSent = false, part1Sent = false;

  // answers: n -> { picked: [option indexes], other: bool } for the button questions
  var answers = {};
  var qs = $$("[data-qwrap]").map(function (w) {
    var n = +w.getAttribute("data-qwrap");
    return { n: n, wrap: w, choice: !!D[n], field: $("input.field:not([data-other-text]), textarea.field", w) };
  });
  qs.forEach(function (q) { if (q.choice) answers[q.n] = { picked: [], other: false }; });

  function el(tag, text, cls) { var e = document.createElement(tag); if (text) e.textContent = text; if (cls) e.className = cls; return e; }
  function count(ev) { try { if (EA) EA.count(ev); } catch (e) {} }
  function started() { if (!startedSent) { startedSent = true; count("apply_started"); } }

  function showReply(q) {
    var d = D[q.n], a = answers[q.n], box = $(".reply", q.wrap);
    while (box.firstChild) box.removeChild(box.firstChild);
    if (d.kind === "one") {
      var o = a.picked.length ? d.options[a.picked[0]] : null;
      if (o && o.reply) {
        var p = el("p");
        p.appendChild(el("strong", o.reply.bold));
        if (o.reply.rest) p.appendChild(document.createTextNode(" " + o.reply.rest));
        box.appendChild(p);
      }
    } else {
      var lines = a.picked.slice().sort(function (x, y) { return x - y; })
        .map(function (i) { return d.options[i].reply && d.options[i].reply.line; }).filter(Boolean);
      if (lines.length) {
        var h = el("p"); h.appendChild(el("strong", d.head)); box.appendChild(h);
        var ul = el("ul");
        lines.forEach(function (t) { ul.appendChild(el("li", t)); });
        box.appendChild(ul);
      }
    }
    box.classList.toggle("on", box.childNodes.length > 0);
  }

  // the answer buttons
  qs.filter(function (q) { return q.choice; }).forEach(function (q) {
    var d = D[q.n], a = answers[q.n], btns = $$(".opt", q.wrap), otherBox = $(".other", q.wrap);
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        started();
        if (b.hasAttribute("data-other")) {
          a.other = !a.other;
          b.setAttribute("aria-pressed", String(a.other));
          otherBox.hidden = !a.other;
        } else {
          var i = +b.getAttribute("data-i");
          if (d.kind === "one") {
            a.picked = [i];
            btns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
          } else {
            var at = a.picked.indexOf(i);
            if (at === -1) a.picked.push(i); else a.picked.splice(at, 1);
            b.setAttribute("aria-pressed", String(at === -1));
          }
        }
        showReply(q);
        changed();
      });
    });
  });

  // a WhatsApp number as its 10 digits ("98765 43210", "+91 98765 43210" and "098765 43210" give the same ten); "" if it is not one
  function phone10(v) {
    var d = String(v || "").replace(/\D/g, "");
    if (d.length === 12 && d.indexOf("91") === 0) d = d.slice(2);
    else if (d.length === 11 && d.charAt(0) === "0") d = d.slice(1);
    return d.length === 10 ? d : "";
  }

  // the Sheet's value for a question: the words people read (a list for tick-all)
  function value(q) {
    if (q.choice) {
      var d = D[q.n], a = answers[q.n];
      var list = a.picked.slice().sort(function (x, y) { return x - y; }).map(function (i) { return d.options[i].label; });
      if (a.other) {
        var t = ($("[data-other-text]", q.wrap).value || "").trim();
        list.push(t ? "Other: " + t : "Other");
      }
      return d.kind === "one" ? (list[0] || "") : list;
    }
    return (q.field.value || "").trim();
  }

  function answered(q) {
    if (q.choice) { var a = answers[q.n]; return a.picked.length > 0 || a.other; }
    var t = D.text[q.n], v = (q.field.value || "").trim();
    if (t.optional) return true;
    if (!v) return false;
    if (t.input === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    if (t.input === "tel") return phone10(v) !== "";
    return true;
  }

  function missing() {
    var m = qs.filter(function (q) { return !answered(q); });
    return { qs: m, consent: !consent.checked };
  }

  // "1, 2, 3, 4, 8" -> "1–4, 8"
  function ranges(ns) {
    var out = [], i = 0;
    while (i < ns.length) {
      var j = i;
      while (j + 1 < ns.length && ns[j + 1] === ns[j] + 1) j++;
      out.push(j - i >= 2 ? ns[i] + "–" + ns[j] : ns.slice(i, j + 1).join(", "));
      i = j + 1;
    }
    return out.join(", ");
  }
  function needText(m) {
    var parts = [];
    if (m.qs.length) parts.push((m.qs.length === 1 ? "question " : "questions ") + ranges(m.qs.map(function (q) { return q.n; })));
    if (m.consent) parts.push("the box to agree");
    return D.says.needed + " " + parts.join(" and ") + ".";
  }

  // what is missing, as a list: each item is a link that takes the person to that question (or the consent box).
  // items: [{ n: question number | "consent", note: optional words after the link } | { text: words only, no link }]
  function missingList(items) {
    var wrap = document.createDocumentFragment();
    wrap.appendChild(el("p", D.says.needed, "apply-need-head"));
    var ul = el("ul", "", "apply-need");
    items.forEach(function (it) {
      var li = el("li");
      if (it.text !== undefined) li.textContent = it.text;
      else {
        var label = it.n === "consent" ? "The box to agree" : it.n + ". " + (D[it.n] ? D[it.n].text : D.text[it.n].text);
        var a = el("a", label);
        a.href = it.n === "consent" ? "#consent" : "#qw" + it.n;
        a.setAttribute("data-goto", String(it.n));
        li.appendChild(a);
        if (it.note) li.appendChild(document.createTextNode(" " + it.note));
      }
      ul.appendChild(li);
    });
    wrap.appendChild(ul);
    return wrap;
  }
  function itemsFor(m) {
    var items = m.qs.map(function (q) {
      var it = { n: q.n }, tv = !q.choice && D.text[q.n];
      if (tv && (tv.input === "email" || tv.input === "tel") && (q.field.value || "").trim()) it.note = "(please check it)";
      return it;
    });
    if (m.consent) items.push({ n: "consent" });
    return items;
  }
  function setState(node) {
    while (stateEl.firstChild) stateEl.removeChild(stateEl.firstChild);
    if (node) stateEl.appendChild(typeof node === "string" ? document.createTextNode(node) : node);
  }
  stateEl.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a[data-goto]") : null;
    if (!a) return;
    e.preventDefault();
    var g = a.getAttribute("data-goto"), target;
    if (g === "consent") target = consent;
    else {
      var q = qs.filter(function (x) { return String(x.n) === g; })[0];
      target = q ? (q.choice ? $(".opt", q.wrap) : q.field) : null;
    }
    if (target) { target.focus(); if (target.scrollIntoView) target.scrollIntoView({ block: "center" }); }
  });

  function changed() {
    var m = missing(), ok = !m.qs.length && !m.consent;
    btn.setAttribute("aria-disabled", String(!ok || sending));
    missingEl.textContent = ok ? "" : needText(m);
    if (attempted) qs.forEach(function (q) { q.wrap.classList.toggle("needs", m.qs.indexOf(q) !== -1); });
    // a message under the button belongs to the moment it was shown: any change to the form clears it
    if (stateEl.firstChild && !sending) setState(null);
    // the seven Part 1 questions are all answered: counted once
    if (!part1Sent && qs.filter(function (q) { return q.n <= 7; }).every(answered)) { part1Sent = true; count("survey_done"); }
  }

  form.addEventListener("input", function () { started(); changed(); });
  consent.addEventListener("change", changed);
  // Enter inside a text box must not send the form half-written
  form.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.tagName === "INPUT" && e.target.type !== "checkbox") e.preventDefault();
  });

  // ---- sending
  function begin() {
    sending = true;
    btn.textContent = D.says.sending;
    btn.setAttribute("aria-disabled", "true");
    form.setAttribute("aria-busy", "true");
    setState(null);
  }
  function finish() { // a send that did not succeed: the button is back, every answer is still there
    sending = false;
    btn.textContent = sendLabel;
    form.removeAttribute("aria-busy");
    changed();
  }
  function succeeded(text) {
    var done = document.getElementById("apply-done");
    done.querySelector("strong").textContent = text;
    form.hidden = true;
    done.hidden = false;
    done.focus();
    window.scrollTo(0, Math.max(0, done.getBoundingClientRect().top + window.pageYOffset - 100));
  }
  function withTimeout(ms) {
    var ctl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, ms);
    return { signal: ctl ? ctl.signal : undefined, clear: function () { clearTimeout(timer); } };
  }

  // sendTo "sheet": one q1..q27 body to the Apps Script. text/plain keeps this a "simple" request: Apps Script does not answer a
  // CORS preflight (the survey sends the same way)
  function sendSheet() {
    var payload = { timestamp_iso: new Date().toISOString(), form_version: "early-access-2026-11-10-27q", answers: {} };
    qs.forEach(function (q) { payload.answers["q" + q.n] = value(q); });
    begin();
    function fail() { finish(); setState(D.failed); }
    var t = withTimeout(25000);
    fetch(endpointNow(), { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(payload), signal: t.signal })
      .then(function (r) { return r.json(); })
      .then(function (r) { t.clear(); if (!r || r.ok !== true) return fail(); succeeded(D.says.confirm); })
      .catch(function () { t.clear(); fail(); });
  }

  // sendTo "server": the contract's body. bad: the questions the page itself still finds missing before sending.
  function serverBody() {
    var b = { visit: EA.visit(), answers: {}, consent: true, website: trap ? trap.value : "" };
    var bad = [];
    qs.forEach(function (q) {
      if (q.choice) {
        var d = D[q.n], a = answers[q.n];
        var vals = a.picked.slice().sort(function (x, y) { return x - y; }).map(function (i) { return d.options[i].v; });
        if (a.other) {
          vals.push("other");
          var t = ($("[data-other-text]", q.wrap).value || "").trim().slice(0, 300);
          if (t && d.keyOther) b.answers[d.keyOther] = t;
        }
        if (!vals.length) bad.push(q.n); else b.answers[d.key] = d.kind === "one" ? vals[0] : vals;
      } else {
        var m = D.text[q.n], v = (q.field.value || "").trim();
        if (m.input === "tel") v = phone10(v);
        if (m.max) v = v.slice(0, m.max);
        if (v) b.answers[m.key] = v; else if (!m.optional) bad.push(q.n);
      }
    });
    return { body: b, bad: bad, tooBig: typeof Blob !== "undefined" && new Blob([JSON.stringify(b)]).size > 32768 };
  }

  var keyToN = {};
  Object.keys(D).forEach(function (n) { if (/^\d+$/.test(n)) { keyToN[D[n].key] = +n; if (D[n].keyOther) keyToN[D[n].keyOther] = +n; } });
  Object.keys(D.text).forEach(function (n) { keyToN[D.text[n].key] = +n; });

  function sendServer() {
    var sb = serverBody();
    if (sb.bad.length || sb.tooBig) { // the page's own check should have caught this: say it, send nothing
      attempted = true; changed();
      setState(sb.bad.length ? missingList(sb.bad.map(function (n) { return { n: n }; })) : D.says.failedServer);
      return;
    }
    begin();
    var t = withTimeout(25000);
    function notSent() { t.clear(); finish(); setState(D.says.failedServer); }
    EA.post("/api/v3/public/early-access/applications", sb.body, { signal: t.signal })
      .then(function (r) {
        return r.text().then(function (txt) { var j = null; try { j = JSON.parse(txt); } catch (e) {} return { s: r.status, j: j }; });
      })
      .then(function (x) {
        t.clear();
        if (x.s === 201) return succeeded(D.says.confirmServer);
        if (x.s === 422 && x.j && x.j.error_code === "early_access.missing") {
          // the server names the missing questions by its keys: say each one plainly, with a link, and keep every answer
          finish(); attempted = true;
          var items = [], seen = {};
          (x.j.missing || []).forEach(function (k) {
            var n = k === "consent" ? "consent" : keyToN[k];
            if (n === undefined) { items.push({ text: String(k) }); return; }
            if (seen[n]) return; seen[n] = true; items.push({ n: n });
          });
          qs.forEach(function (q) { q.wrap.classList.toggle("needs", !!seen[q.n]); });
          setState(items.length ? missingList(items) : (x.j.message ? String(x.j.message) : D.says.failedServer));
          return;
        }
        if (x.s === 429) { finish(); setState((x.j && x.j.message) ? String(x.j.message) : D.says.failedServer); return; }
        notSent(); // any other answer, including a 5xx: not sent, and the answers are still here
      })
      .catch(notSent);
  }

  function submit(e) {
    if (e) e.preventDefault();
    if (sending) return;
    var m = missing();
    if (m.qs.length || m.consent) {
      attempted = true;
      changed();
      setState(missingList(itemsFor(m))); // changed() clears the old message first; the list then stands under the button, links in Tab order
      return;
    }
    var server = mode() === "server";
    if (trap && trap.value) { succeeded(server ? D.says.confirmServer : D.says.confirm); return; } // the trap field was filled: a robot. Nothing is sent.
    if (server) { if (!EA) { setState(D.says.failedServer); return; } sendServer(); return; }
    if (!endpointNow()) { setState(D.says.notOpen); return; }
    sendSheet();
  }
  form.addEventListener("submit", submit);
  btn.addEventListener("click", function (e) { e.preventDefault(); submit(); });

  changed();
})();
