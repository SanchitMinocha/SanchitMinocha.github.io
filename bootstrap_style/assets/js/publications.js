async function renderPublications(limit = null, containerId = "pub-list") {
  try {
    const response = await fetch("assets/data/publications.json");
    const data = await response.json();
    const pubContainer = document.getElementById(containerId);
    if (!pubContainer) return;

    const pubs = limit ? data.slice(0, limit) : data;

    pubs.forEach((pub, index) => {
      const item = document.createElement("div");
      item.classList.add("faq-item");
      item.innerHTML = `
        <h3>
            <span class="num">${index + 1}.</span>
            <span class="pub-title">${pub.title} <span class="pub-year">&nbsp (${pub.year})</span></span>
        </h3>
        <div class="faq-toggle"><i class="bi bi-chevron-right"></i></div>
        <div class="faq-content">
          <p class="pub-authors">${pub.authors}</p>
          <p class="pub-journal"><em>${pub.journal}</em></p>
          <div class="pub-buttons">
            ${pub.doi ? `<a href="${pub.doi}" target="_blank" class="btn btn-outline-primary btn-sm">DOI</a>` : ""}
            ${pub.pdf ? `<a href="${pub.pdf}" target="_blank" class="btn btn-outline-success btn-sm">PDF</a>` : ""}
            ${pub.abstract ? `<a href="#" class="btn btn-outline-secondary btn-sm btn-abstract">Abstract</a>` : ""}
          </div>
          <p class="pub-abstract">${pub.abstract || ""}</p>
        </div>
      `;
      pubContainer.appendChild(item);
    });

    // Add the FAQ toggle functionality (same as your current one)
    document.querySelectorAll('.faq-item h3, .faq-item .faq-toggle').forEach((faqItem) => {
      faqItem.addEventListener('click', () => {
        faqItem.parentNode.classList.toggle('faq-active');
      });
    });

    // Handle abstract toggle
    document.querySelectorAll(".btn-abstract").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const abstract = btn.closest(".faq-content").querySelector(".pub-abstract");
        abstract.style.display = abstract.style.display === "block" ? "none" : "block";
        btn.textContent = abstract.style.display === "block" ? "Hide Abstract" : "Abstract";
      });
    });

  } catch (err) {
    console.error("Error loading publications:", err);
  }
}
