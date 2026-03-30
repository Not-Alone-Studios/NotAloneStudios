(() => {
  const prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const yearNodes = document.querySelectorAll("[data-year]");
  const nowYear = new Date().getFullYear();
  yearNodes.forEach((n) => {
    n.textContent = String(nowYear);
  });

  if (prefersReducedMotion) {
    document.querySelectorAll("video[data-decorative-video]").forEach((video) => {
      try {
        video.pause();
        video.removeAttribute("autoplay");
        video.currentTime = 0;
      } catch {
        // no-op
      }
    });
  }

  const heroSection = document.querySelector(".hero");
  const heroLiving = document.querySelector("[data-hero-living]");
  const heroLivingVideo = heroLiving
    ? heroLiving.querySelector("video[data-hero-living-video]")
    : null;

  const setHeroLivingVars = (open, visible) => {
    if (!heroLiving) return;
    heroLiving.style.setProperty(
      "--hero-video-open",
      String(Math.min(Math.max(open, 0), 1).toFixed(4))
    );
    heroLiving.style.setProperty(
      "--hero-video-visible",
      String(Math.min(Math.max(visible, 0), 1).toFixed(4))
    );
  };

  const syncHeroLivingVisual = (globalProgress = 0) => {
    if (!heroLiving || !heroSection || prefersReducedMotion) return;
    const rect = heroSection.getBoundingClientRect();
    const viewportH = Math.max(window.innerHeight || 0, 1);
    const visiblePx = Math.min(rect.bottom, viewportH) - Math.max(rect.top, 0);
    const visible = Math.min(Math.max(visiblePx / Math.max(Math.min(rect.height, viewportH), 1), 0), 1);
    const unlockWindow = Math.max(Math.min(viewportH * 0.28, rect.height * 0.36), 1);
    const localBoot = Math.min(
      Math.max((-rect.top + viewportH * 0.06) / unlockWindow, 0),
      1
    );
    const bridgeBoot = Math.min(Math.max(globalProgress / 0.28, 0), 1);
    const open = Math.min(Math.max(localBoot * 0.72 + bridgeBoot * 0.28, 0), 1);
    setHeroLivingVars(open, visible);
  };

  const syncHeroLivingPlayback = () => {
    if (!heroLiving || !heroLivingVideo || prefersReducedMotion) return;
    const visible = heroLiving.getAttribute("data-hero-visible") === "true";
    const shouldPlay = visible && document.visibilityState !== "hidden";
    heroLiving.setAttribute("data-video-playing", String(shouldPlay));
    try {
      if (shouldPlay) {
        const maybePromise = heroLivingVideo.play();
        if (maybePromise && typeof maybePromise.catch === "function") {
          maybePromise.catch(() => { });
        }
      } else {
        heroLivingVideo.pause();
      }
    } catch {
      // no-op
    }
  };

  if (heroLiving) {
    heroLiving.setAttribute("data-video-playing", "false");
    heroLiving.setAttribute("data-hero-visible", "false");
    if (prefersReducedMotion) {
      setHeroLivingVars(0.18, 0.9);
    }
  }

  if (heroSection && heroLiving && heroLivingVideo && !prefersReducedMotion) {
    if ("IntersectionObserver" in window) {
      const heroObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            heroLiving.setAttribute(
              "data-hero-visible",
              String(entry.isIntersecting && entry.intersectionRatio > 0.08)
            );
          });
          syncHeroLivingPlayback();
        },
        { threshold: [0, 0.08, 0.2, 0.4] }
      );
      heroObserver.observe(heroSection);
    } else {
      heroLiving.setAttribute("data-hero-visible", "true");
      syncHeroLivingPlayback();
    }

    document.addEventListener("visibilitychange", syncHeroLivingPlayback);
    window.addEventListener("pagehide", () => {
      try {
        heroLivingVideo.pause();
      } catch {
        // no-op
      }
    });
  }

  const reveals = Array.from(document.querySelectorAll(".reveal"));
  const revealStaggerGroups = new Map();
  reveals.forEach((el) => {
    // Stagger reveals locally within their container to avoid page-wide delays.
    const group =
      el.closest("[data-stagger-root]") || el.parentElement || document.body;
    const groupIndex = revealStaggerGroups.get(group) || 0;
    const delay = el.classList.contains("is-visible")
      ? 0
      : Math.min(groupIndex * 70, 280);
    revealStaggerGroups.set(group, groupIndex + 1);
    el.style.setProperty("--reveal-delay", `${delay}ms`);
  });
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach((el) => io.observe(el));
    // Safety fallback: force-show reveals that haven't triggered after 1.8s
    setTimeout(() => {
      reveals.forEach((el) => {
        if (!el.classList.contains("is-visible")) {
          el.classList.add("is-visible");
          io.unobserve(el);
        }
      });
    }, 1800);
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  if (!prefersReducedMotion) {
    const progress = document.createElement("div");
    progress.className = "na-scroll-bridge";
    progress.setAttribute("aria-hidden", "true");
    document.body.appendChild(progress);

    const river = document.querySelector(".noise-glow");
    const anchorSections = Array.from(
      document.querySelectorAll("[data-river-anchor]")
    );

    const anchorConfigs = {
      home: {
        aX: -0.8,
        aY: 0.4,
        bX: 0.6,
        bY: -0.3,
        cX: -0.4,
        cY: -0.8,
        sat: 1.03,
      },
      maulya: {
        aX: -1.6,
        aY: 0.6,
        bX: 1.2,
        bY: -0.4,
        cX: 0.4,
        cY: -1.2,
        sat: 1.07,
      },
      revalk: {
        aX: 0.5,
        aY: -0.2,
        bX: -0.8,
        bY: 0.5,
        cX: 0.9,
        cY: -0.4,
        sat: 1.02,
      },
      studio: {
        aX: -0.4,
        aY: 0.3,
        bX: 0.4,
        bY: -0.2,
        cX: -0.2,
        cY: -0.5,
        sat: 1.01,
      },
      footer: {
        aX: -1.0,
        aY: 0.7,
        bX: 0.8,
        bY: 0.3,
        cX: 0.1,
        cY: -0.9,
        sat: 1.0,
      },
    };

    const setRiverVars = (cfg, scrollRatio) => {
      if (!river || !cfg) return;
      const drift = (scrollRatio - 0.5) * 2; // -1..1
      river.style.setProperty("--river-a-x", `${(cfg.aX + drift * 0.45).toFixed(2)}%`);
      river.style.setProperty("--river-a-y", `${(cfg.aY + drift * -0.25).toFixed(2)}%`);
      river.style.setProperty("--river-b-x", `${(cfg.bX + drift * -0.35).toFixed(2)}%`);
      river.style.setProperty("--river-b-y", `${(cfg.bY + drift * 0.2).toFixed(2)}%`);
      river.style.setProperty("--river-c-x", `${(cfg.cX + drift * 0.3).toFixed(2)}%`);
      river.style.setProperty("--river-c-y", `${(cfg.cY + drift * -0.18).toFixed(2)}%`);
      river.style.setProperty("--river-sat", String(cfg.sat));
    };

    const pickAnchor = () => {
      if (!anchorSections.length) return "home";
      const viewportCenter = window.innerHeight * 0.42;
      let winner = null;
      let bestDistance = Infinity;
      for (const section of anchorSections) {
        const rect = section.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const distance = Math.abs(center - viewportCenter);
        if (distance < bestDistance) {
          bestDistance = distance;
          winner = section.getAttribute("data-river-anchor") || "home";
        }
      }
      return winner || "home";
    };

    const syncProgress = () => {
      const root = document.documentElement;
      const max = Math.max(root.scrollHeight - root.clientHeight, 1);
      const value = Math.min(Math.max(window.scrollY / max, 0), 1);
      progress.style.setProperty("--progress", value.toFixed(4));

      const anchor = pickAnchor();
      setRiverVars(anchorConfigs[anchor] || anchorConfigs.home, value);
      syncHeroLivingVisual(value);
    };

    syncProgress();
    window.addEventListener("scroll", syncProgress, { passive: true });
    window.addEventListener("resize", syncProgress);
  }

  if (!prefersReducedMotion) {
    syncHeroLivingVisual(0);
    syncHeroLivingPlayback();
  }

  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  document.querySelectorAll(".nav a[data-match]").forEach((link) => {
    const match = link.getAttribute("data-match");
    if (!match) return;
    const isMatch = match === "/" ? path === "/" : path.startsWith(match);
    if (isMatch) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll("[data-carousel-slide]"));
    if (!slides.length) return;

    const dotButtons = Array.from(carousel.querySelectorAll("[data-carousel-dot]"));
    const prevButton = carousel.querySelector("[data-carousel-prev]");
    const nextButton = carousel.querySelector("[data-carousel-next]");
    const autoplayMs = Number(carousel.getAttribute("data-autoplay-ms")) || 7000;
    let current = Math.max(
      0,
      slides.findIndex((slide) => slide.getAttribute("data-active") === "true")
    );
    if (current < 0) current = 0;
    let timer = null;
    let resumeTimer = null;
    let isVisible = true;
    let isTransitioning = false;
    let isHovering = false;
    let isFocusInside = false;
    let touchPauseUntil = 0;

    // Expose autoplay duration as CSS custom property for progress bar
    carousel.style.setProperty("--carousel-autoplay-ms", `${autoplayMs}ms`);

    const syncSlideMedia = () => {
      slides.forEach((slide, index) => {
        const video = slide.querySelector("[data-carousel-slide-video]");
        if (!(video instanceof HTMLVideoElement)) return;
        const shouldPlay =
          !prefersReducedMotion && isVisible && index === current && slide.getAttribute("data-active") === "true";
        try {
          if (shouldPlay) {
            const p = video.play();
            if (p && typeof p.catch === "function") p.catch(() => { });
          } else {
            video.pause();
          }
        } catch {
          // no-op
        }
      });
    };

    const setActive = (nextIndex, direction) => {
      const resolved = (nextIndex + slides.length) % slides.length;
      if (resolved === current && slides.length > 1) return;
      if (isTransitioning) return;

      // Determine direction if not explicitly provided
      const dir = direction || (resolved > current ? "next" : "prev");

      // Mark the outgoing slide
      const outgoing = slides[current];
      outgoing.setAttribute("data-leaving", dir);
      outgoing.setAttribute("data-active", "false");
      outgoing.setAttribute("aria-hidden", "true");

      // Set carousel direction so CSS can position the incoming slide
      carousel.setAttribute("data-direction", dir);

      // Force a reflow so the incoming slide starts from the correct side
      void carousel.offsetHeight;

      // Remove direction immediately so the incoming slide transitions to center
      carousel.removeAttribute("data-direction");

      // Activate the new slide
      current = resolved;
      const incoming = slides[current];
      incoming.setAttribute("data-active", "true");
      incoming.setAttribute("aria-hidden", "false");

      // Update dots
      dotButtons.forEach((btn, index) => {
        btn.setAttribute("aria-pressed", String(index === current));
      });

      carousel.style.setProperty("--carousel-index", String(current));
      syncSlideMedia();

      // Clean up the leaving slide after transition
      isTransitioning = true;
      setTimeout(() => {
        outgoing.removeAttribute("data-leaving");
        isTransitioning = false;
      }, 540); // Matches CSS transition duration
    };

    const setPaused = (paused) => {
      carousel.setAttribute("data-paused", String(paused));
    };

    const clearResumeTimer = () => {
      if (!resumeTimer) return;
      window.clearTimeout(resumeTimer);
      resumeTimer = null;
    };

    const canAutoplay = () =>
      !prefersReducedMotion &&
      slides.length >= 2 &&
      isVisible &&
      !timer &&
      !isHovering &&
      !isFocusInside &&
      Date.now() >= touchPauseUntil;

    const stop = () => {
      clearResumeTimer();
      setPaused(true);
      if (!timer) return;
      window.clearInterval(timer);
      timer = null;
    };

    const start = () => {
      if (!canAutoplay()) return;
      setPaused(false);
      timer = window.setInterval(() => {
        setActive(current + 1, "next");
      }, autoplayMs);
    };

    const pauseForInteraction = (delayMs = Math.max(autoplayMs * 2, 12000)) => {
      touchPauseUntil = Date.now() + delayMs;
      stop();
      resumeTimer = window.setTimeout(() => {
        resumeTimer = null;
        start();
      }, delayMs);
    };

    prevButton?.addEventListener("click", () => {
      setActive(current - 1, "prev");
      pauseForInteraction();
    });

    nextButton?.addEventListener("click", () => {
      setActive(current + 1, "next");
      pauseForInteraction();
    });

    dotButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const raw = Number(btn.getAttribute("data-carousel-dot"));
        if (Number.isNaN(raw)) return;
        const dir = raw > current ? "next" : "prev";
        setActive(raw, dir);
        pauseForInteraction();
      });
    });

    // Pause on hover / focus
    carousel.addEventListener("mouseenter", () => {
      isHovering = true;
      stop();
    });
    carousel.addEventListener("mouseleave", () => {
      isHovering = false;
      start();
    });
    carousel.addEventListener("focusin", () => {
      isFocusInside = true;
      stop();
    });
    carousel.addEventListener("focusout", () => {
      isFocusInside = carousel.contains(document.activeElement);
      if (!isFocusInside) start();
    });

    // Keyboard arrow navigation
    carousel.setAttribute("tabindex", "0");
    carousel.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setActive(current + 1, "next");
        pauseForInteraction();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActive(current - 1, "prev");
        pauseForInteraction();
      }
    });

    // Touch / swipe support
    let touchStartX = 0;
    let touchStartY = 0;
    let isSwiping = false;

    carousel.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      isSwiping = true;
      pauseForInteraction();
    }, { passive: true });

    carousel.addEventListener("touchend", (e) => {
      if (!isSwiping || !e.changedTouches.length) return;
      isSwiping = false;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      // Only trigger if horizontal swipe > 40px and more horizontal than vertical
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        if (dx < 0) {
          setActive(current + 1, "next");
        } else {
          setActive(current - 1, "prev");
        }
      }
    }, { passive: true });

    carousel.addEventListener("touchcancel", () => {
      isSwiping = false;
      pauseForInteraction();
    }, { passive: true });

    // Visibility observer
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            isVisible = entry.isIntersecting && entry.intersectionRatio > 0.2;
          });
          syncSlideMedia();
          if (isVisible) start();
          else stop();
        },
        { threshold: [0, 0.2, 0.5] }
      );
      io.observe(carousel);
    }

    // Initialize
    slides.forEach((slide, index) => {
      const active = index === current;
      slide.setAttribute("data-active", String(active));
      slide.setAttribute("aria-hidden", String(!active));
    });
    dotButtons.forEach((btn, index) => {
      btn.setAttribute("aria-pressed", String(index === current));
    });
    carousel.style.setProperty("--carousel-index", String(current));
    syncSlideMedia();
    start();
  });

  document.querySelectorAll("[data-chip-rail]").forEach((rail) => {
    const chips = Array.from(rail.querySelectorAll(".chip"));
    if (!chips.length) return;

    let current = 0;
    const cycleMs = Number(rail.getAttribute("data-cycle-ms")) || 1800;
    const setActive = (next) => {
      chips.forEach((chip, index) => {
        if (index === next) {
          chip.setAttribute("data-active", "true");
        } else {
          chip.removeAttribute("data-active");
        }
      });
    };

    setActive(current);

    if (prefersReducedMotion || chips.length < 2) return;

    window.setInterval(() => {
      current = (current + 1) % chips.length;
      setActive(current);
    }, cycleMs);
  });

  document.querySelectorAll(".workflow-strip").forEach((strip) => {
    const steps = Array.from(strip.querySelectorAll(".workflow-step"));
    if (!steps.length) return;

    strip.style.setProperty("--workflow-step-count", String(steps.length));

    const setActiveStep = (index) => {
      const travel =
        steps.length <= 1 ? 0 : Math.min(Math.max(index / (steps.length - 1), 0), 1);
      const progress = Math.min(Math.max((index + 1) / steps.length, 0.2), 1);
      strip.style.setProperty("--workflow-travel", travel.toFixed(4));
      strip.style.setProperty("--workflow-progress", progress.toFixed(4));

      steps.forEach((step, i) => {
        if (i === index) {
          step.setAttribute("data-active", "true");
        } else {
          step.removeAttribute("data-active");
        }
      });
    };

    setActiveStep(0);
    if (prefersReducedMotion || steps.length < 2) return;

    let timer = null;
    let current = 0;

    const start = () => {
      if (timer) return;
      timer = window.setInterval(() => {
        current = (current + 1) % steps.length;
        setActiveStep(current);
      }, 1350);
    };

    const stop = () => {
      if (!timer) return;
      window.clearInterval(timer);
      timer = null;
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              start();
            } else {
              stop();
            }
          });
        },
        { threshold: 0.45 }
      );
      observer.observe(strip);
    } else {
      start();
    }
  });

  const syncFaqPanelState = (root) => {
    if (!root) return null;
    const panel = root.querySelector(".faq-panel");
    if (!panel) return null;
    root.style.setProperty("--faq-panel-max", `${panel.scrollHeight}px`);
    panel.setAttribute("aria-hidden", String(root.getAttribute("data-open") !== "true"));
    return panel;
  };

  document.querySelectorAll("[data-faq-button]").forEach((button) => {
    const root = button.closest(".faq");
    syncFaqPanelState(root);

    button.addEventListener("click", () => {
      const root = button.closest(".faq");
      if (!root) return;
      const open = root.getAttribute("data-open") === "true";
      const panel = root.querySelector(".faq-panel");
      if (panel) panel.setAttribute("aria-hidden", String(open));
      root.setAttribute("data-open", String(!open));
      button.setAttribute("aria-expanded", String(!open));
      syncFaqPanelState(root);
    });
  });

  window.addEventListener("resize", () => {
    document.querySelectorAll(".faq").forEach((root) => {
      syncFaqPanelState(root);
    });
  });

  function track(name, detail = {}) {
    const payload = {
      event: name,
      source: "not-alone-studios-site",
      path: window.location.pathname,
      ...detail,
    };
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push(payload);
    }
    window.dispatchEvent(new CustomEvent("na-track", { detail: payload }));
    if (window.console && console.debug) {
      console.debug("[track]", payload);
    }
  }

  window.naTrack = track;

  document.querySelectorAll("[data-track]").forEach((el) => {
    el.addEventListener("click", () => {
      const name = el.getAttribute("data-track");
      if (name) track(name, { kind: "click" });
    });
  });

  document.querySelectorAll("form[data-demo-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      const action = form.getAttribute("action");
      if (!action || action === "#") {
        event.preventDefault();
        const output = form.querySelector("[data-form-output]");
        if (output) {
          output.textContent =
            "Form is in demo mode. Connect this to your Hostinger/PHP or external form endpoint when ready.";
        }
      }

      const eventName = form.getAttribute("data-track-submit");
      if (eventName) {
        track(eventName, { kind: "submit" });
      }
    });
  });

  // ─── Nav scroll shadow (Phase 2D) ────────────────────────────────────────
  const siteHeader = document.querySelector(".site-header");
  if (siteHeader) {
    const updateHeaderScroll = () => {
      if (window.scrollY > 24) {
        siteHeader.classList.add("site-header--scrolled");
      } else {
        siteHeader.classList.remove("site-header--scrolled");
      }
    };
    window.addEventListener("scroll", updateHeaderScroll, { passive: true });
    updateHeaderScroll();
  }

  // ─── Hamburger navigation (Phase 4A) ─────────────────────────────────────
  const hamburger = document.querySelector(".nav-hamburger");
  const primaryNav = document.querySelector(".nav");
  const navOverlay = document.querySelector(".nav-overlay");

  if (hamburger && primaryNav) {
    const openNav = () => {
      hamburger.setAttribute("aria-expanded", "true");
      primaryNav.classList.add("is-open");
      if (navOverlay) navOverlay.classList.add("is-active");
      document.body.style.overflow = "hidden";
      // Focus first nav link
      const firstLink = primaryNav.querySelector("a");
      if (firstLink) firstLink.focus();
    };

    const closeNav = () => {
      hamburger.setAttribute("aria-expanded", "false");
      primaryNav.classList.remove("is-open");
      if (navOverlay) navOverlay.classList.remove("is-active");
      document.body.style.overflow = "";
      hamburger.focus();
    };

    hamburger.addEventListener("click", () => {
      const isOpen = hamburger.getAttribute("aria-expanded") === "true";
      if (isOpen) closeNav(); else openNav();
    });

    if (navOverlay) {
      navOverlay.addEventListener("click", closeNav);
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && hamburger.getAttribute("aria-expanded") === "true") {
        closeNav();
      }
    });

    // Focus trap within open nav
    primaryNav.addEventListener("keydown", (e) => {
      if (hamburger.getAttribute("aria-expanded") !== "true") return;
      if (e.key !== "Tab") return;
      const focusable = [...primaryNav.querySelectorAll("a, button")].filter(
        (el) => !el.hidden && el.offsetParent !== null
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    // Close nav when a link is clicked (mobile)
    primaryNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (hamburger.getAttribute("aria-expanded") === "true") closeNav();
      });
    });

    // Sync on resize
    const mq = window.matchMedia("(min-width: 821px)");
    mq.addEventListener("change", (e) => {
      if (e.matches) closeNav();
    });
  }

  // ─── Stagger animation for grids (Phase 3B) ───────────────────────────────
  const staggerCap = window.innerWidth <= 820 ? 3 : Infinity;
  document.querySelectorAll("[data-stagger]").forEach((parent) => {
    const children = parent.querySelectorAll(
      ".reveal, .shipped-fact, .proof-card, .card"
    );
    children.forEach((child, i) => {
      child.style.setProperty("--stagger-i", String(Math.min(i, staggerCap - 1)));
      child.classList.add("reveal");
    });
  });

  // ─── Counter animation (Phase 3D) ─────────────────────────────────────────
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

    const counters = document.querySelectorAll("[data-count-to]");
    if (counters.length) {
      const counterObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            counterObserver.unobserve(entry.target);
            const el = entry.target;
            const target = parseFloat(el.getAttribute("data-count-to")) || 0;
            const duration = 1200;
            const start = performance.now();
            const suffix = el.getAttribute("data-count-suffix") || "";
            const decimals = String(target).includes(".") ? 1 : 0;

            const tick = (now) => {
              const elapsed = now - start;
              const progress = Math.min(elapsed / duration, 1);
              const current = target * easeOutQuart(progress);
              el.textContent = current.toFixed(decimals) + suffix;
              if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          });
        },
        { threshold: 0.5 }
      );
      counters.forEach((el) => counterObserver.observe(el));
    }
  }

  // ─── Parallax depth on noise-glow (Phase 3E) ──────────────────────────────
  if (!prefersReducedMotion && window.innerWidth > 820) {
    const noiseGlow = document.querySelector(".noise-glow");
    if (noiseGlow) {
      let ticking = false;
      const onScroll = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            noiseGlow.style.transform = `translateY(${window.scrollY * 0.18}px)`;
            ticking = false;
          });
          ticking = true;
        }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
    }
  }

  // ─── Textarea character counter (Phase 5C) ────────────────────────────────
  document.querySelectorAll("textarea[maxlength]").forEach((ta) => {
    const max = parseInt(ta.getAttribute("maxlength"), 10);
    if (!max) return;
    const counter = document.createElement("div");
    counter.className = "char-counter";
    counter.setAttribute("aria-live", "polite");
    counter.textContent = `0 / ${max}`;
    ta.insertAdjacentElement("afterend", counter);
    ta.addEventListener("input", () => {
      counter.textContent = `${ta.value.length} / ${max}`;
    });
  });

  // ═══ PHASE 5: Hero self-segmentation switch ═══════════════════════════════
  const segSwitch = document.querySelector(".segment-switch");
  if (segSwitch) {
    const tabs = Array.from(segSwitch.querySelectorAll("[data-segment]"));
    const panels = Array.from(document.querySelectorAll("[data-segment-panel]"));
    const STORAGE_KEY = "nas-segment";

    const activate = (seg) => {
      tabs.forEach((t) => t.setAttribute("aria-selected", String(t.getAttribute("data-segment") === seg)));
      panels.forEach((p) => p.setAttribute("data-active", String(p.getAttribute("data-segment-panel") === seg)));
      try { localStorage.setItem(STORAGE_KEY, seg); } catch {}
    };

    tabs.forEach((t) => t.addEventListener("click", () => activate(t.getAttribute("data-segment"))));

    // Restore from URL or localStorage
    const params = new URLSearchParams(window.location.search);
    const urlSeg = params.get("segment");
    const storedSeg = (() => { try { return localStorage.getItem(STORAGE_KEY); } catch { return null; } })();
    const initial = urlSeg || storedSeg;
    if (initial && tabs.some((t) => t.getAttribute("data-segment") === initial)) {
      activate(initial);
    }

    // Keyboard nav: ArrowLeft / ArrowRight cycle tabs
    segSwitch.addEventListener("keydown", (e) => {
      if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
      e.preventDefault();
      const currentIdx = tabs.findIndex((t) => t.getAttribute("aria-selected") === "true");
      const dir = e.key === "ArrowRight" ? 1 : -1;
      const nextIdx = (currentIdx + dir + tabs.length) % tabs.length;
      activate(tabs[nextIdx].getAttribute("data-segment"));
      tabs[nextIdx].focus();
    });
  }

  // ═══ PHASE 6: Hook engine (radio → CTA link update) ═══════════════════════
  const hookEngine = document.querySelector(".hook-engine");
  if (hookEngine) {
    const hookCTA = hookEngine.querySelector("[data-hook-cta]");
    const hookRadios = hookEngine.querySelectorAll('input[name="hook"]');
    const hookMap = {
      ops: "/products/maulya/",
      study: "/products/revalk/",
      custom: "/contact/#studio",
    };
    hookRadios.forEach((r) => {
      r.addEventListener("change", () => {
        if (hookCTA) hookCTA.href = hookMap[r.value] || "/contact/";
      });
    });
  }

  // ═══ PHASE 6: System map micro-simulator ══════════════════════════════════
  document.querySelectorAll(".system-map").forEach((map) => {
    const steps = Array.from(map.querySelectorAll(".system-map__step"));
    const detail = map.querySelector(".system-map__detail");
    const progressFill = map.querySelector(".system-map__progress-fill");
    let details = [];
    try { details = JSON.parse(map.getAttribute("data-step-details") || "[]"); } catch {}

    const activate = (index) => {
      steps.forEach((s, i) => s.setAttribute("data-active", String(i === index)));
      if (detail && details[index]) detail.textContent = details[index];
      if (progressFill) {
        const pct = 30 + ((index + 1) / steps.length) * 70;
        progressFill.style.width = `${pct}%`;
      }
      // Store progress for Zeigarnik pill
      try {
        const page = document.body.className;
        localStorage.setItem("nas-map-progress", JSON.stringify({ page, step: index, total: steps.length }));
      } catch {}
    };

    steps.forEach((s, i) => s.addEventListener("click", () => activate(i)));
  });

  // ═══ PHASE 7: Pain-chip gate → system card download ═══════════════════════
  const painChips = document.querySelectorAll('input[name="pain_card"]');
  const cardBtn = document.getElementById("card-download-btn");
  if (painChips.length && cardBtn) {
    painChips.forEach((chip) => {
      chip.addEventListener("change", () => {
        cardBtn.style.opacity = "1";
        cardBtn.style.pointerEvents = "auto";
      });
    });

    cardBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const selected = document.querySelector('input[name="pain_card"]:checked');
      if (!selected) return;

      const pain = selected.value;
      const painLabels = { evidence: "Missing evidence", billing: "Billing delays", rework: "Rework loops" };
      const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Not Alone Studios — System Card</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Manrope,system-ui,sans-serif;background:#0f1812;color:#e8ebe6;padding:40px;max-width:680px;margin:0 auto}
h1{font-size:1.8rem;margin-bottom:8px}h2{font-size:1.1rem;color:#4dd4ac;margin:24px 0 8px;font-family:'IBM Plex Mono',monospace;text-transform:uppercase;letter-spacing:0.08em;font-size:0.82rem}
p{line-height:1.6;margin-bottom:12px;color:#b8bcb4}.card{background:#1a2420;border:1px solid #2a3630;border-radius:16px;padding:24px;margin:16px 0}
.pain{display:inline-block;padding:6px 14px;border-radius:999px;background:rgba(15,118,110,0.15);border:1px solid rgba(15,118,110,0.3);color:#4dd4ac;font-weight:700;font-size:0.88rem;margin:8px 0 16px}
.progress{height:6px;background:#2a3630;border-radius:999px;margin:16px 0;overflow:hidden}.progress-fill{height:100%;width:30%;background:linear-gradient(90deg,#0f766e,#4dd4ac);border-radius:999px}
.footer{margin-top:32px;border-top:1px solid #2a3630;padding-top:16px;font-size:0.82rem;color:#5c6a60}
</style></head><body>
<h1>Your Not Alone Studios System Card</h1>
<p>Generated for your specific workflow challenge.</p>
<h2>Your biggest pain</h2>
<span class="pain">${painLabels[pain] || pain}</span>
<div class="card">
<h2>Recommended path</h2>
<p>${pain === "evidence" ? "Maulya evidence-first capture ensures docs, photos, and assignment fields stay linked. Missing evidence becomes visible immediately — before delivery, not after." : pain === "billing" ? "Maulya billing-gated release means payment state (paid, credits, override-with-reason) is explicit before work leaves the system. No more invoice chase." : "Maulya readiness gating blocks incomplete delivery. Rules, derived values, and release checks prevent quiet slippage and rework loops."}</p>
</div>
<h2>Your system map</h2>
<div class="progress"><div class="progress-fill"></div></div>
<p style="font-size:0.82rem;color:#5c6a60;">You've started exploring. Complete a 14-day pilot to reach 100%.</p>
<div class="card">
<p><strong>Evidence → Rules → Readiness → Release</strong></p>
<p>Each gate must clear before the next step. Nothing ships incomplete.</p>
</div>
<div class="footer">
<p>Not Alone Studios · Systems Product Studio · notalonestudios.com</p>
<p>Schedule a walkthrough: contact page → Maulya lane</p>
</div></body></html>`;

      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "not-alone-studios-system-card.html";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 200);
    });
  }

  // ═══ BEHAVIORAL: Zeigarnik "Continue" pill ════════════════════════════════
  const zeigPill = document.getElementById("zeigarnik-pill");
  if (zeigPill) {
    const zeigLabel = document.getElementById("zeigarnik-label");
    const zeigContinue = document.getElementById("zeigarnik-continue");
    const zeigDismiss = document.getElementById("zeigarnik-dismiss");
    const ZEIG_KEY = "nas-zeig-dismissed";
    const MAP_KEY = "nas-map-progress";

    const show = () => {
      try {
        if (localStorage.getItem(ZEIG_KEY) === "true") return;
        const raw = localStorage.getItem(MAP_KEY);
        if (!raw) return;
        const { page, step, total } = JSON.parse(raw);
        if (!page || typeof step !== "number") return;

        const pct = Math.round(30 + ((step + 1) / total) * 70);
        const label = page.includes("maulya") ? "Maulya" : page.includes("revalk") ? "Revalk" : "System Map";
        zeigLabel.textContent = `${label}: ${pct}% — `;
        const dest = page.includes("maulya") ? "/products/maulya/" : page.includes("revalk") ? "/products/revalk/" : "/";
        zeigContinue.href = dest;
        zeigContinue.textContent = "Continue";

        // Show after slight delay
        setTimeout(() => zeigPill.classList.add("is-visible"), 2400);
      } catch {}
    };

    if (zeigDismiss) {
      zeigDismiss.addEventListener("click", () => {
        zeigPill.classList.remove("is-visible");
        try { localStorage.setItem(ZEIG_KEY, "true"); } catch {}
      });
    }

    show();
  }

  // ═══ FAQ accordion (new-style for .faq-item) ═════════════════════════════
  document.querySelectorAll(".faq-item button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      if (!item) return;
      const isOpen = item.getAttribute("data-open") === "true";
      item.setAttribute("data-open", String(!isOpen));
      btn.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  // ═══ PHASE 4: Contact micro-wizard ════════════════════════════════════════
  const wizard = document.querySelector(".contact-wizard");
  if (wizard) {
    const wSteps = Array.from(wizard.querySelectorAll("[data-wizard-step]"));
    const laneTiles = Array.from(wizard.querySelectorAll(".lane-tile"));
    const nextBtn = wizard.querySelector("[data-wizard-next]");
    const backBtn = wizard.querySelector("[data-wizard-back]");
    const formPanels = Array.from(wizard.querySelectorAll("[data-form-panel]"));
    let selectedLane = null;

    const showWizardStep = (num) => {
      wSteps.forEach((s) => s.setAttribute("data-active", String(s.getAttribute("data-wizard-step") === String(num))));
      wizard.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const showFormPanel = (lane) => {
      formPanels.forEach((p) => {
        p.style.display = p.getAttribute("data-form-panel") === lane ? "block" : "none";
      });
    };

    // Lane tile selection
    laneTiles.forEach((tile) => {
      const handler = () => {
        const lane = tile.getAttribute("data-lane");
        const radio = tile.querySelector("input[type='radio']");
        if (radio) radio.checked = true;
        laneTiles.forEach((t) => t.removeAttribute("data-selected"));
        tile.setAttribute("data-selected", "true");
        selectedLane = lane;
        if (nextBtn) nextBtn.disabled = false;
      };
      tile.addEventListener("click", handler);
      const radio = tile.querySelector("input[type='radio']");
      if (radio) radio.addEventListener("change", handler);
    });

    // Next → step 2
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (!selectedLane) return;
        showFormPanel(selectedLane);
        showWizardStep(2);
      });
    }

    // Back → step 1
    if (backBtn) {
      backBtn.addEventListener("click", () => showWizardStep(1));
    }

    // Form submit → success (or Maulya handoff redirect)
    wizard.querySelectorAll("form[data-demo-form]").forEach((form) => {
      form.addEventListener("submit", (e) => {
        // Inline validation
        let valid = true;
        form.querySelectorAll("[required]").forEach((field) => {
          const empty = field.tagName === "SELECT" ? !field.value : !field.value.trim();
          field.setAttribute("aria-invalid", String(empty));
          if (empty) valid = false;
        });
        if (!valid) {
          e.preventDefault();
          return;
        }

        // Maulya handoff: keep native POST + server redirect so prefills survive
        const action = form.getAttribute("action");
        if (action && action.includes("app.maulya.in/api/partner/request-access/handoff")) {
          return;
        }
        e.preventDefault();
        showWizardStep(3);
      });
    });

    // Inline blur validation
    wizard.querySelectorAll("input[required], textarea[required], select[required]").forEach((field) => {
      field.addEventListener("blur", () => {
        const empty = field.tagName === "SELECT" ? !field.value : !field.value.trim();
        if (empty) field.setAttribute("aria-invalid", "true");
      });
      field.addEventListener("input", () => field.removeAttribute("aria-invalid"));
      if (field.tagName === "SELECT") field.addEventListener("change", () => field.removeAttribute("aria-invalid"));
    });

    // Hash auto-selection: /contact/#maulya, /contact/#revalk, /contact/#studio
    const wizardHash = window.location.hash.replace("#", "");
    if (wizardHash && ["maulya", "revalk", "studio"].includes(wizardHash)) {
      const matchTile = wizard.querySelector('.lane-tile[data-lane="' + wizardHash + '"]');
      if (matchTile) {
        matchTile.click();
        showFormPanel(wizardHash);
        showWizardStep(2);
      }
    }
  }
})();
