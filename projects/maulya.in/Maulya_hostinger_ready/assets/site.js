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
  let returnFocusNode = null;
  const closeMobileNav = () => {
    const wasOpen = body.classList.contains("nav-open");
    body.classList.remove("nav-open");
    if (navButton) navButton.setAttribute("aria-expanded", "false");
    if (wasOpen && returnFocusNode instanceof HTMLElement) {
      returnFocusNode.focus({ preventScroll: true });
    }
  };
  const openMobileNav = () => {
    returnFocusNode = document.activeElement;
    body.classList.add("nav-open");
    if (navButton) navButton.setAttribute("aria-expanded", "true");
    const firstLink = mobileDrawer?.querySelector("a");
    if (firstLink instanceof HTMLElement) {
      window.requestAnimationFrame(() => {
        firstLink.focus({ preventScroll: true });
      });
    }
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

    window.addEventListener("resize", () => {
      if (window.innerWidth > 920) closeMobileNav();
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
