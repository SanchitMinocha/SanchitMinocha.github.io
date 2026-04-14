/**
 * experience.js
 * Loads affiliation logos from experience.json and renders them into
 * the three grid cells (research / industry / collaborators).
 *
 * Each logo gets its own max-width and max-height from the JSON so that
 * logos of wildly different original dimensions all appear at a consistent,
 * intentional visual size — no clipping, no distortion.
 */

// ── Logo Color Mode ─────────────────────────────────────────────────────────
// true  → logos render at full colour
// false → logos render muted/grayscale (default — less distracting in hero)
const AFFIL_LOGO_COLORED = true;
// ────────────────────────────────────────────────────────────────────────────

(function () {
  "use strict";

  async function loadAffiliations() {
    try {
      const res  = await fetch("assets/data/experience.json");
      const data = await res.json();
      renderGroup(".affil-research-logos",  data.research);
      renderGroup(".affil-industry-logos",   data.industry);
      renderGroup(".affil-collab-logos",     data.collaborators);
      // Apply color mode class if requested
      if (AFFIL_LOGO_COLORED) {
        const section = document.querySelector(".affiliation-section");
        if (section) section.classList.add("affil-logos-colored");
      }
      initLogoObserver();
    } catch (e) {
      console.warn("[experience.js] Could not load experience.json:", e);
    }
  }

  /**
   * Renders logo links into a container element.
   * Each <img> carries inline max-width / max-height from JSON so the
   * natural aspect ratio is preserved but the image is capped to the
   * designer-chosen dimensions regardless of original file size.
   */
  function renderGroup(selector, items) {
    const container = document.querySelector(selector);
    if (!container || !Array.isArray(items)) return;

    container.innerHTML = items
      .map(
        (item, i) => `
      <a href="${item.url}"
         target="_blank"
         rel="noopener noreferrer"
         class="affil-logo-link"
         title="${item.name}"
         style="animation-delay:${(i * 0.5).toFixed(1)}s">
        <img src="${item.logo}"
             alt="${item.name}"
             class="affil-logo"
             loading="lazy"
             style="max-width:${item.maxW}px; max-height:${item.maxH}px;"
             onerror="this.closest('.affil-logo-link').style.display='none'">
      </a>`
      )
      .join("");
  }

  /**
   * IntersectionObserver: adds/removes .in-view on each affil cell as it
   * enters/leaves the viewport → CSS transitions logos to full colour.
   * rootMargin gives a small early-trigger so colour appears just before
   * the strip fully enters view — feels snappier when scrolling.
   */
  function initLogoObserver() {
    if (!("IntersectionObserver" in window)) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) =>
          e.target.classList.toggle("in-view", e.isIntersecting)
        );
      },
      { threshold: 0.15, rootMargin: "0px 0px -30px 0px" }
    );

    document.querySelectorAll("[data-affil-strip]").forEach((el) =>
      obs.observe(el)
    );
  }

  // Run after DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadAffiliations);
  } else {
    loadAffiliations();
  }
})();
