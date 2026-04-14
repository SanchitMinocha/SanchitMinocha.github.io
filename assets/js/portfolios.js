// Portfolio JS Items From JSON
async function loadPortfolioItems() {
const container = document.getElementById("portfolio-container");
if (!container) return;

try {
    const response = await fetch("assets/data/portfolios.json");
    const projects = await response.json();

    container.innerHTML = projects.map(project => {
    const filterClasses = (project.filters || [])
        .map(filter => {
        // Normalize: 'AI / ML' -> 'ai-ml', 'Software' -> 'software', 'datasets' -> 'datasets'
        let clean = filter.toLowerCase().replace(/\s*\/\s*/g, '-').replace(/[^a-z0-9-]+/g, '').replace(/^-|-$/g, '');
        if (clean === 'aiml') clean = 'ai-ml';
        return `filter-${clean}`;
        })
        .join(" ");

    return `
        <div class="col-xl-3 col-lg-4 col-md-6 portfolio-item isotope-item ${filterClasses}">
        <article class="portfolio-entry" style="cursor:pointer" onclick="window.open('${project.detailPage}', '_blank')">
            <figure class="entry-image">
            <img
                src="${project.coverImage}"
                class="img-fluid"
                alt="${project.title}"
                loading="lazy"
            >
            <div class="entry-overlay">
                <div class="overlay-content">
                <div class="entry-meta">${project.meta}</div>
                <h3 class="entry-title">${project.title}</h3>
                <div class="entry-links">
                    <a
                    href="${project.coverImage}"
                    class="glightbox"
                    data-gallery="${project.gallery || 'portfolio-gallery'}"
                    data-glightbox="title: ${project.title}; description: ${project.description}"
                    onclick="event.stopPropagation()"
                    >
                    <i class="bi bi-arrows-angle-expand"></i>
                    </a>
                    <a href="${project.detailPage}" target="_blank" onclick="event.stopPropagation()">
                    <i class="bi bi-arrow-right"></i>
                    </a>
                </div>
                </div>
            </div>
            </figure>
        </article>
        </div>
    `;
    }).join("");

    // Re-initialize GLightbox
    if (typeof GLightbox === "function") {
    GLightbox({ selector: ".glightbox" });
    }

    // Initialize Isotope with imagesLoaded, then wire up filter buttons
    const isotopeItem = document.querySelector('.isotope-layout');
    const isoContainer = isotopeItem ? isotopeItem.querySelector('.isotope-container') : null;
    if (isoContainer && window.Isotope && window.imagesLoaded) {
    imagesLoaded(isoContainer, function() {
        const iso = new Isotope(isoContainer, {
        itemSelector: '.isotope-item',
        layoutMode: isotopeItem.getAttribute('data-layout') || 'masonry',
        filter: isotopeItem.getAttribute('data-default-filter') || '*',
        sortBy: isotopeItem.getAttribute('data-sort') || 'original-order'
        });

        // Wire up filter buttons
        isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(btn) {
        btn.addEventListener('click', function() {
            isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
            this.classList.add('filter-active');
            iso.arrange({ filter: this.getAttribute('data-filter') });
        }, false);
        });
    });
    }
} catch (error) {
    console.error("Failed to load portfolio items:", error);
    container.innerHTML = "<p>Unable to load portfolio items right now.</p>";
}
}

document.addEventListener("DOMContentLoaded", loadPortfolioItems);
