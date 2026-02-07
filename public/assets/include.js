// assets/include.js
(async function () {
  const includeTargets = document.querySelectorAll("[data-include]");
  if (!includeTargets.length) return;

  for (const el of includeTargets) {
    const url = el.getAttribute("data-include");
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load ${url}`);
      el.innerHTML = await res.text();
    } catch (err) {
      console.error(err);
      el.innerHTML = "<!-- include failed -->";
    }
  }

  // Mobile menu toggle (works after header is injected)
  const toggle = document.getElementById("navToggle");
  const mobileNav = document.getElementById("mobileNav");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      mobileNav.classList.toggle("hidden", isOpen);
    });
  }
})();

// Header spacer sync

(function () {
  function syncHeaderSpacer() {
    const header = document.getElementById("siteHeader");
    const spacer = document.getElementById("headerSpacer");
    if (!header || !spacer) return;
    spacer.style.height = header.offsetHeight + "px";
  }

  window.addEventListener("load", syncHeaderSpacer);
  window.addEventListener("resize", syncHeaderSpacer);

  // if header is injected via fetch include, run a bit after load too
  setTimeout(syncHeaderSpacer, 50);
  setTimeout(syncHeaderSpacer, 250);
})();
