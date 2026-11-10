// maulya.in (MLP/SRK-99, addenda 1 and 2): the one shared visit-id and counting helper, written once. It is loaded by /early-access/,
// /early-access/apply/ and the Survey page (a <script id="ea-visit" data-api-base data-send-to data-event> tag, from build/layout.mjs).
//
//  - The visit id is a random uuid v4 kept in sessionStorage only. Never a cookie, never localStorage. If sessionStorage is not
//    available the id lives in memory for the page.
//  - Counting is "fire and forget": POST {apiBase}/api/v3/public/early-access/events, JSON {"visit","event","page"}, answered 204,
//    sent with fetch + keepalive, credentials omitted. A failed count never shows anything and never stops anyone.
//  - It sends events only once the server has answered: the first event is the probe. If it fails (no network, not a 2xx), nothing
//    more is sent for the rest of the visit (a flag in sessionStorage), so a server that is not live yet is not hit by every page.
//  - Each event is sent at most once per page load. No tracker of any other kind: no analytics, no pixel.
//  - window.MaulyaEA offers: visit(), apiBase(), sendTo() (read live from the tag, so a page can follow the setting), count(event),
//    post(path, body, options) for the pages' own sends to the server.
(function () {
  "use strict";
  var tag = document.getElementById("ea-visit");
  if (!tag || window.MaulyaEA) return;
  var KEY = "maulya_visit", DOWN = "maulya_count_down";
  var memVisit = null, memDown = false;

  function uuid() {
    var c = window.crypto;
    if (c && c.randomUUID) return c.randomUUID();
    var b = new Uint8Array(16);
    if (c && c.getRandomValues) c.getRandomValues(b); else for (var i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
    b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
    var h = Array.prototype.map.call(b, function (x) { return (x + 256).toString(16).slice(1); }).join("");
    return h.slice(0, 8) + "-" + h.slice(8, 12) + "-" + h.slice(12, 16) + "-" + h.slice(16, 20) + "-" + h.slice(20);
  }
  function visit() {
    try {
      var v = sessionStorage.getItem(KEY);
      if (v && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(v)) return v;
      v = uuid(); sessionStorage.setItem(KEY, v); return v;
    } catch (e) { if (!memVisit) memVisit = uuid(); return memVisit; }
  }
  function apiBase() { return (tag.getAttribute("data-api-base") || "").replace(/\/$/, ""); }
  function sendTo() { return tag.getAttribute("data-send-to") === "server" ? "server" : "sheet"; }
  function isDown() { try { return sessionStorage.getItem(DOWN) === "1"; } catch (e) { return memDown; } }
  function setDown() { memDown = true; try { sessionStorage.setItem(DOWN, "1"); } catch (e) {} }

  function post(path, body, options) {
    var o = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), credentials: "omit", mode: "cors" };
    if (options) for (var k in options) o[k] = options[k];
    return fetch(apiBase() + path, o);
  }

  var queue = [], busy = false, seen = {};
  function fail() { busy = false; queue = []; setDown(); }
  function pump() {
    if (busy || !queue.length) return;
    busy = true;
    var e = queue.shift(), p;
    try { p = post("/api/v3/public/early-access/events", e, { keepalive: true }); } catch (x) { fail(); return; }
    p.then(function (r) { busy = false; if (r && r.ok) pump(); else fail(); }).catch(fail);
  }
  function count(event) {
    try {
      if (!event || seen[event] || !apiBase() || !window.fetch || isDown()) return;
      seen[event] = true;
      queue.push({ visit: visit(), event: event, page: location.pathname });
      pump();
    } catch (e) { /* a count never shows anything and never stops anyone */ }
  }

  window.MaulyaEA = { visit: visit, apiBase: apiBase, sendTo: sendTo, count: count, post: post };
  var first = tag.getAttribute("data-event");
  // The Survey counts only when it sends to the server (addendum 2); the early-access pages count whichever sendTo is set.
  if (first && (first.indexOf("site_survey") !== 0 || sendTo() === "server")) count(first);
})();
