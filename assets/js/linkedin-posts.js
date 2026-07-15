document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("assets/data/linkedin-posts.json");
    const posts = (await response.json())
      .filter(item => item.show !== false)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const container = document.getElementById("linkedin-posts");
    const modalBody = document.getElementById("linkedinPostModalBody");

    if (!container || posts.length === 0) return;

    container.innerHTML = posts.map(item => `
      <div class="col-md-4">
        <div class="linkedin-post-card" data-embed-url="${item.embedUrlFull}">
          <div class="linkedin-post-card-preview">
            <iframe src="${item.embedUrlPreview}" width="100%" height="180"
              frameborder="0" tabindex="-1" title="LinkedIn post preview"></iframe>
            <div class="linkedin-post-card-overlay"></div>
          </div>
          <div class="linkedin-post-card-date">${new Date(item.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</div>
        </div>
      </div>
    `).join("");

    container.querySelectorAll(".linkedin-post-card").forEach(card => {
      card.addEventListener("click", () => {
        modalBody.innerHTML = `
          <iframe src="${card.getAttribute("data-embed-url")}"
            height="700" width="100%" frameborder="0" allowfullscreen=""
            title="Embedded LinkedIn post"></iframe>
        `;
        const modal = new bootstrap.Modal(document.getElementById("linkedinPostModal"));
        modal.show();
      });
    });

    document.getElementById("linkedinPostModal").addEventListener("hidden.bs.modal", () => {
      modalBody.innerHTML = "";
    });

  } catch (error) {
    console.error("Failed to load linkedin-posts.json:", error);
  }
});
