(() => {
  const yearNodes = document.querySelectorAll("[data-year]");
  const nowYear = String(new Date().getFullYear());
  yearNodes.forEach((node) => {
    node.textContent = nowYear;
  });

  const header = document.querySelector(".site-header");
  const syncHeader = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  const body = document.body;
  const navButton = document.querySelector(".nav-hamburger");
  const mobileDrawer = document.querySelector(".mobile-drawer");
  const closeMobileNav = () => {
    body.classList.remove("nav-open");
    if (navButton) navButton.setAttribute("aria-expanded", "false");
  };
  const openMobileNav = () => {
    body.classList.add("nav-open");
    if (navButton) navButton.setAttribute("aria-expanded", "true");
  };

  if (navButton && mobileDrawer) {
    navButton.addEventListener("click", () => {
      if (body.classList.contains("nav-open")) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    mobileDrawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMobileNav);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMobileNav();
    });

    document.addEventListener("click", (event) => {
      if (!body.classList.contains("nav-open")) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (mobileDrawer.contains(target) || navButton.contains(target)) return;
      closeMobileNav();
    });
  }

})();
