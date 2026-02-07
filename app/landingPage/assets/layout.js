// assets/layout.js
(function () {
  function ensureSpacer(header) {
    let spacer = document.getElementById("headerSpacer");
    if (!spacer) {
      spacer = document.createElement("div");
      spacer.id = "headerSpacer";
      header.insertAdjacentElement("afterend", spacer);
    }
    return spacer;
  }

  function initStickyHeader() {
    const header = document.getElementById("siteHeader");
    if (!header) return false;

    const navShell = document.getElementById("navShell");
    const signinRow = document.getElementById("signinRow");
    const mainRow = document.getElementById("mainRow");
    const brandLogo = document.getElementById("brandLogo");

    const spacer = ensureSpacer(header);

    const syncSpacer = () => {
      spacer.style.height = header.offsetHeight + "px";
    };

    const applyState = (scrolled) => {
      // match your screenshots:
      // - initial: show signinRow + larger padding
      // - scrolled: hide signinRow + compress nav padding
      if (signinRow) signinRow.classList.toggle("hidden", scrolled);

      if (mainRow) {
        mainRow.classList.toggle("py-6", !scrolled);
        mainRow.classList.toggle("py-4", scrolled);
      }

      if (brandLogo) {
        brandLogo.classList.toggle("h-9", !scrolled);
        brandLogo.classList.toggle("h-8", scrolled);
      }

      if (navShell) {
        navShell.classList.toggle("border-transparent", !scrolled);
        navShell.classList.toggle("shadow-none", !scrolled);

        navShell.classList.toggle("border-black/10", scrolled);
        navShell.classList.toggle("shadow-sm", scrolled);
      }

      syncSpacer();
    };

    const onScroll = () => {
      // small threshold so it changes right after scroll starts (like your UI)
      applyState(window.scrollY > 8);
    };

    // Initial
    applyState(window.scrollY > 8);
    syncSpacer();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", syncSpacer);

    return true;
  }

  // If header is injected via include(), wait for it using a MutationObserver
  function boot() {
    if (initStickyHeader()) return;

    const obs = new MutationObserver(() => {
      if (initStickyHeader()) obs.disconnect();
    });

    obs.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

// --- Promo Countdown (dynamic Days/Hours/Minutes/Seconds) ---
(function promoCountdown() {
  const pad2 = (n) => String(n).padStart(2, "0");

  function startCountdown(targetISO) {
    const elDays = document.getElementById("cdDays");
    const elHours = document.getElementById("cdHours");
    const elMinutes = document.getElementById("cdMinutes");
    const elSeconds = document.getElementById("cdSeconds");

    if (!elDays || !elHours || !elMinutes || !elSeconds) return false;

    // Set your promo end time here (example):
    // Use ISO string with timezone "Z" (UTC) or "+01:00" (Nigeria is +01:00)
    const target = new Date(targetISO).getTime();
    if (Number.isNaN(target)) return false;

    const tick = () => {
      const now = Date.now();
      let diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      diff -= days * (1000 * 60 * 60 * 24);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      diff -= hours * (1000 * 60 * 60);

      const minutes = Math.floor(diff / (1000 * 60));
      diff -= minutes * (1000 * 60);

      const seconds = Math.floor(diff / 1000);

      elDays.textContent = days; // days can be > 2 digits
      elHours.textContent = pad2(hours);
      elMinutes.textContent = pad2(minutes);
      elSeconds.textContent = pad2(seconds);
    };

    tick();
    const timer = setInterval(() => {
      tick();
      // stop when it hits zero
      if (
        elDays.textContent === "0" &&
        elHours.textContent === "00" &&
        elMinutes.textContent === "00" &&
        elSeconds.textContent === "00"
      ) {
        clearInterval(timer);
      }
    }, 1000);

    return true;
  }

  function bootCountdown() {
    // CHANGE THIS DATE to your real promo end date/time
    // Example: 2026-01-31 23:59:59 Nigeria time (+01:00)
    const PROMO_END = "2026-01-31T23:59:59+01:00";

    if (startCountdown(PROMO_END)) return;

    // If header is injected, wait for countdown nodes
    const obs = new MutationObserver(() => {
      if (startCountdown(PROMO_END)) obs.disconnect();
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootCountdown);
  } else {
    bootCountdown();
  }
})();
