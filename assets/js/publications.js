async function renderPublications(limit = null, containerId = "pub-list", forceExpand = false) {
  try {
    const response = await fetch("assets/data/publications.json");
    const data = await response.json();
    const pubContainer = document.getElementById(containerId);
    if (!pubContainer) return;

    const pubs = (limit && limit !== 'all') ? data.slice(0, parseInt(limit)) : data;

    pubContainer.innerHTML = ""; // Clear existing content

    pubs.forEach((pub, index) => {
      const item = document.createElement("div");
      item.classList.add("faq-item");
      if (forceExpand) item.classList.add("faq-active");
      item.innerHTML = `
        <h3>
            <span class="num">${index + 1}.</span>
            <span class="pub-title">${pub.title} <span class="pub-year">&nbsp (${pub.year})</span></span>
            <span class="pub-citation">
              <span class="citation-authors">${pub.authors}. </span>
              <span class="citation-title">"${pub.title}". </span>
              <span class="citation-journal">${pub.journal}</span>
            </span>
        </h3>
        <div class="faq-toggle"><i class="bi bi-chevron-right"></i></div>
        <div class="faq-content">
          <div class="pub-header-expanded">
            <div class="pub-info-main">
              <p class="pub-authors">${pub.authors}</p>
              <p class="pub-journal"><em>${pub.journal}</em></p>
            </div>
            <div class="pub-buttons">
              ${pub.doi ? `<a href="${pub.doi}" target="_blank" class="btn btn-outline-primary btn-sm">DOI</a>` : ""}
              ${pub.pdf ? `<a href="${pub.pdf}" target="_blank" class="btn btn-outline-success btn-sm">PDF</a>` : ""}
              ${pub.abstract ? `<a href="#" class="btn btn-outline-secondary btn-sm btn-abstract">Abstract</a>` : ""}
            </div>
          </div>
          <p class="pub-abstract">${pub.abstract || ""}</p>
        </div>
      `;
      pubContainer.appendChild(item);
    });

    // Add toggle functionality
    pubContainer.querySelectorAll('.faq-item h3, .faq-item .faq-toggle').forEach((el) => {
      el.addEventListener('click', (e) => {
        // Prevent doubling if both h3 and toggle are clicked
        e.stopPropagation();
        el.closest(".faq-item").classList.toggle('faq-active');
      });
    });

    // Abstract toggle
    pubContainer.querySelectorAll(".btn-abstract").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const item = btn.closest(".faq-item");
        const abstract = item.querySelector(".pub-abstract");
        const isVisible = abstract.style.display === "block";
        abstract.style.display = isVisible ? "none" : "block";
        btn.textContent = isVisible ? "Abstract" : "Hide Abstract";
      });
    });

  } catch (err) {
    console.error("Error loading publications:", err);
  }
}
