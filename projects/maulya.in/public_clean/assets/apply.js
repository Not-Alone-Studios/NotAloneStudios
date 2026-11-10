// maulya.in (MLP/ARK-719): the early-access application page (/early-access/apply/). The words are in
// src/pages/early-access-apply.mjs and arrive as JSON in #apply-data: this file holds the behaviour only.
//  - an answer button is a real <button aria-pressed>; the reply to it appears under the question in a role="status" box
//  - "Send my application" stays off (aria-disabled, so a keyboard can still reach it and ask what is missing) until every
//    question marked * is answered and the consent box is ticked, and the page says which are still needed
//  - the answers go to the Google Apps Script web app named in the form's data-endpoint (early-access-apps-script/code.gs).
//    While that address is empty nothing is sent and the page says so. A failed send keeps every answer on the screen.
(function () {
  "use strict";
  var form = document.getElementById("apply");
  var dataEl = document.getElementById("apply-data");
  if (!form || !dataEl) return;
  var D = JSON.parse(dataEl.textContent);
  var endpointNow = function () { return form.getAttribute("data-endpoint") || ""; }; // read at send time
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var btn = $("#apply-btn"), consent = $("#consent"), missingEl = $("#apply-missing"), stateEl = $("#apply-state");
  var sendLabel = btn.textContent, sending = false, attempted = false;

  // answers: n -> { picked: [option indexes], other: bool } for the button questions
  var answers = {};
  var qs = $$("[data-qwrap]").map(function (w) {
    var n = +w.getAttribute("data-qwrap");
    return { n: n, wrap: w, choice: !!D[n], field: $("input.field:not([data-other-text]), textarea.field", w) };
  });
  qs.forEach(function (q) { if (q.choice) answers[q.n] = { picked: [], other: false }; });

  function el(tag, text, cls) { var e = document.createElement(tag); if (text) e.textContent = text; if (cls) e.className = cls; return e; }

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
    if (t.input === "tel") return v.replace(/\D/g, "").length >= 10;
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

  function changed() {
    var m = missing(), ok = !m.qs.length && !m.consent;
    btn.setAttribute("aria-disabled", String(!ok || sending));
    missingEl.textContent = ok ? "" : needText(m);
    if (attempted) qs.forEach(function (q) { q.wrap.classList.toggle("needs", m.qs.indexOf(q) !== -1); });
    if (stateEl.textContent && !sending) stateEl.textContent = "";
  }

  form.addEventListener("input", changed);
  consent.addEventListener("change", changed);
  // Enter inside a text box must not send the form half-written
  form.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target.tagName === "INPUT" && e.target.type !== "checkbox") e.preventDefault();
  });

  function focusFirst(m) {
    var first = m.qs[0];
    if (first) {
      var target = first.choice ? $(".opt", first.wrap) : first.field;
      target.focus();
    } else consent.focus();
  }

  function send() {
    var payload = { timestamp_iso: new Date().toISOString(), form_version: "early-access-2026-11-10", answers: {} };
    qs.forEach(function (q) { payload.answers["q" + q.n] = value(q); });
    sending = true;
    btn.textContent = D.says.sending;
    btn.setAttribute("aria-disabled", "true");
    form.setAttribute("aria-busy", "true");
    stateEl.textContent = "";
    function fail() {
      sending = false;
      btn.textContent = sendLabel;
      form.removeAttribute("aria-busy");
      changed();
      stateEl.textContent = D.failed;
    }
    var ctl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctl) ctl.abort(); }, 25000);
    // text/plain keeps this a "simple" request: Apps Script does not answer a CORS preflight (the survey sends the same way)
    fetch(endpointNow(), { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(payload), signal: ctl ? ctl.signal : undefined })
      .then(function (r) { return r.json(); })
      .then(function (r) {
        clearTimeout(timer);
        if (!r || r.ok !== true) return fail();
        var done = document.getElementById("apply-done");
        form.hidden = true;
        done.hidden = false;
        done.focus();
        window.scrollTo(0, Math.max(0, done.getBoundingClientRect().top + window.pageYOffset - 100));
      })
      .catch(function () { clearTimeout(timer); fail(); });
  }

  function submit(e) {
    if (e) e.preventDefault();
    if (sending) return;
    var m = missing();
    if (m.qs.length || m.consent) {
      attempted = true;
      changed();
      stateEl.textContent = needText(m);
      focusFirst(m);
      return;
    }
    if (!endpointNow()) { stateEl.textContent = D.says.notOpen; return; }
    send();
  }
  form.addEventListener("submit", submit);
  btn.addEventListener("click", function (e) { e.preventDefault(); submit(); });

  changed();
})();
