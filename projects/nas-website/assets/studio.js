/* notalonestudios.com · the 2026-11 frame: the phone menu, the year, one gentle reveal. */
(function () {
  "use strict";

  // The phone menu: a real button, aria-expanded, Escape closes it and gives focus back.
  var button = document.querySelector(".nx-menu");
  var nav = document.getElementById("nx-nav");
  if (button && nav) {
    var setOpen = function (open) {
      button.setAttribute("aria-expanded", open ? "true" : "false");
      nav.classList.toggle("is-open", open);
    };
    button.addEventListener("click", function () {
      setOpen(button.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        button.focus();
      }
    });
    document.addEventListener("click", function (e) {
      if (button.getAttribute("aria-expanded") === "true" && !nav.contains(e.target) && !button.contains(e.target)) setOpen(false);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 820) setOpen(false);
    });
  }

  // The year in the footer.
  var years = document.querySelectorAll("[data-nx-year]");
  for (var i = 0; i < years.length; i++) years[i].textContent = String(new Date().getFullYear());

  // One reveal: only for what starts below the fold, never under reduced motion, never without IntersectionObserver.
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;
  var items = document.querySelectorAll(".nx-reveal");
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      entry.target.classList.remove("is-pending");
      io.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  for (var j = 0; j < items.length; j++) {
    var el = items[j];
    if (el.getBoundingClientRect().top > window.innerHeight) {
      el.classList.add("is-pending");
      io.observe(el);
    }
  }
})();
