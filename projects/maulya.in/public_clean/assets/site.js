// maulya.in (MLP/ARK-668): the menu on small screens, the file scale, the blog's search and categories, the article's
// contents. Everything works without this file; it only adds the moves. Motion only shows a change.
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // The menu
  var btn = $(".menu-btn"), panel = $("#site-nav");
  if (btn && panel) {
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      panel.classList.toggle("open", !open);
      btn.textContent = open ? "Menu" : "Close";
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") { btn.click(); btn.focus(); }
    });
  }

  // The scale: one file's seven places (tabs, arrow keys move between them)
  $$("[data-scale]").forEach(function (scale) {
    var tabs = $$("[role=tab]", scale), panels = $$("[role=tabpanel]", scale), rule = $(".scale-rule", scale);
    function pick(i, focus) {
      tabs.forEach(function (t, j) {
        var on = i === j;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        t.classList.toggle("past", j < i);
        panels[j].hidden = !on;
      });
      if (rule) rule.style.setProperty("--at", String(i));
      var eq = $("[data-equals]", panels[i]);
      if (eq) requestAnimationFrame(function () { eq.classList.add("level"); });
      if (focus) tabs[i].focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { pick(i, false); });
      t.addEventListener("keydown", function (e) {
        var k = e.key, n = tabs.length, to = null;
        if (k === "ArrowRight" || k === "ArrowDown") to = (i + 1) % n;
        if (k === "ArrowLeft" || k === "ArrowUp") to = (i - 1 + n) % n;
        if (k === "Home") to = 0;
        if (k === "End") to = n - 1;
        if (to !== null) { e.preventDefault(); pick(to, true); }
      });
    });
    pick(0, false);
  });

  // The equals mark: drawn tilted, it levels once when the finalising step is shown (the app's one bold moment)
  var style = document.createElement("style");
  style.textContent = "[data-equals] rect:first-child{transform:rotate(-8deg) translateY(-2px)}[data-equals] rect:last-child{transform:rotate(6deg) translateY(2px)}[data-equals].level rect{transform:none}";
  document.head.appendChild(style);
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("level"); io.unobserve(e.target); } });
    }, { threshold: 0.8 });
    $$("[data-equals]:not([role=tabpanel] [data-equals])").forEach(function (el) { io.observe(el); });
  } else $$("[data-equals]").forEach(function (el) { el.classList.add("level"); });

  // The blog's index: search on the page and categories (no server)
  var list = $("[data-posts]");
  if (list) {
    var q = $("#post-search"), chips = $$(".chip[data-cat]"), cards = $$(".post-card", list), none = $(".blog-empty-search"), live = $("#post-count");
    var cat = "all";
    var params = new URLSearchParams(location.search);
    if (params.get("q") && q) q.value = params.get("q");
    if (params.get("category")) cat = params.get("category");
    function apply() {
      var words = (q && q.value || "").toLowerCase().trim().split(/\s+/).filter(Boolean), shown = 0;
      cards.forEach(function (c) {
        var hay = c.getAttribute("data-search"), okCat = cat === "all" || c.getAttribute("data-cat") === cat;
        var okQ = words.every(function (w) { return hay.indexOf(w) !== -1; });
        c.hidden = !(okCat && okQ);
        if (!c.hidden) shown++;
      });
      chips.forEach(function (ch) { ch.setAttribute("aria-pressed", String(ch.getAttribute("data-cat") === cat)); });
      if (none) none.style.display = shown ? "none" : "block";
      if (live) live.textContent = shown + (shown === 1 ? " article" : " articles");
    }
    chips.forEach(function (ch) { ch.addEventListener("click", function () { cat = ch.getAttribute("data-cat"); apply(); }); });
    if (q) q.addEventListener("input", apply);
    apply();
  }

  // The article: where you are in the contents; checklists count what is ticked (kept on this page only)
  var toc = $$(".toc a");
  if (toc.length && "IntersectionObserver" in window) {
    var map = {};
    toc.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          toc.forEach(function (a) { a.classList.remove("here"); a.removeAttribute("aria-current"); });
          var a = map[e.target.id]; if (a) { a.classList.add("here"); a.setAttribute("aria-current", "location"); }
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    Object.keys(map).forEach(function (id) { var h = document.getElementById(id); if (h) obs.observe(h); });
  }
  $$(".checklist").forEach(function (cl) {
    var boxes = $$("input[type=checkbox]", cl), out = cl.previousElementSibling && $(".checklist-count", cl.previousElementSibling);
    function count() { if (out) out.textContent = boxes.filter(function (b) { return b.checked; }).length + " of " + boxes.length + " ticked"; }
    boxes.forEach(function (b) { b.addEventListener("change", count); });
    count();
  });
})();
