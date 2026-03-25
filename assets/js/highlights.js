document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("assets/data/highlights.json");
    const highlights = await response.json();

    const featuredContainer = document.getElementById("featured-highlights");
    const recentContainer = document.getElementById("recent-highlights");

    if (!featuredContainer || !recentContainer) return;

    const sortedHighlights = [...highlights].sort((a, b) => {
      const priorityA = a.priority ?? 999;
      const priorityB = b.priority ?? 999;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      return new Date(b.date) - new Date(a.date);
    });

    const featured = sortedHighlights
      .filter(item => item.featured)
      .slice(0, 3);

    const recent = sortedHighlights
      .filter(item => !item.featured && item.show === true)
      .slice(0, 8);

    featuredContainer.innerHTML = featured.map(item => `
      <div class="col-md-4">
        <div class="critic-review highlight-link" data-url="${item.url || ""}">
          <div class="review-top">
            <div class="review-quote">"</div>
            <div class="media-header">
              <img src="${item.image}" class="img-fluid" alt="${item.source}">
              <span class="critic-name">${item.source}</span>
            </div>
          </div>

          <p>${item.title}</p>

          ${item.note ? `
            <div class="highlight-note-row">
              <span class="highlight-note">${item.note}</span>
            </div>
          ` : ""}
        </div>
      </div>
    `).join("");

    recentContainer.innerHTML = recent.map(item => `
      <div class="swiper-slide">
        <div class="testimonial-item highlight-link" data-url="${item.url || ""}">
          <p>${item.title}</p>
          <div class="testimonial-profile">
            <img src="${item.image}" class="img-fluid rounded-circle" alt="${item.source}">
            <div>
              <h3>${item.source}</h3>
              <h4>${item.category}</h4>
            </div>
          </div>
        </div>
      </div>
    `).join("");

    document.querySelectorAll(".highlight-link").forEach(el => {
      const url = el.getAttribute("data-url");

      if (url) {
        el.style.cursor = "pointer";
        el.addEventListener("click", () => {
          window.open(url, "_blank");
        });
      } else {
        el.style.cursor = "default";
      }
    });

    if (typeof initSwiper === "function") {
      initSwiper();
    }

  } catch (error) {
    console.error("Failed to load highlights.json:", error);
  }
});