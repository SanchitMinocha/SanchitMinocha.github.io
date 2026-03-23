/**
* Template Name: Style
* Template URL: https://bootstrapmade.com/style-bootstrap-portfolio-template/
* Updated: Jul 02 2025 with Bootstrap v5.3.7
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function() {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
    if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
  }
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Initiate Pure Counter
   */
  new PureCounter();

  /**
   * Init typed.js
   */
  const selectTyped = document.querySelector('.typed');
  if (selectTyped) {
    let typed_strings = selectTyped.getAttribute('data-typed-items');
    typed_strings = typed_strings.split(',');
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

  /**
   * Animate the skills items on reveal
   */
  let skillsAnimation = document.querySelectorAll('.skills-animation');
  skillsAnimation.forEach((item) => {
    new Waypoint({
      element: item,
      offset: '80%',
      handler: function(direction) {
        let progress = item.querySelectorAll('.progress .progress-bar');
        progress.forEach(el => {
          el.style.width = el.getAttribute('aria-valuenow') + '%';
        });
      }
    });
  });

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function() {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
      filters.addEventListener('click', function() {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
    });

  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Frequently Asked Questions Toggle
   */
  document.querySelectorAll('.faq-item h3, .faq-item .faq-toggle, .faq-item .faq-header').forEach((faqItem) => {
    faqItem.addEventListener('click', () => {
      faqItem.parentNode.classList.toggle('faq-active');
    });
  });

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function(e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

})();

/**
 * Auto-number publications
 */
document.querySelectorAll('#publications .faq-item .num').forEach((num, i) => {
  num.textContent = `${i + 1}.`;
});

// Publications auto-filler
const pubListContainer = "pub-list"; // the ID of the container
const pubListPageContainer = "pub-list-page"; // the ID of the container of publications.html

// Initial render (top 5 by default)
if (document.getElementById(pubListContainer)) {
  renderPublications(5, pubListContainer);
}

// Handle change of dropdown
// Initial render for publications page
if (document.getElementById(pubListPageContainer)) {
  renderPublications(null, pubListPageContainer); // or pubData.length
}

// Handle dropdown change only if dropdown exists
const pubLimit = document.getElementById("pub-limit");

if (pubLimit) {
  pubLimit.addEventListener("change", function () {
    const value = this.value;

    if (value === "all") {
      window.location.href = "publications.html";
      return;
    }

    renderPublications(parseInt(value, 10), pubListContainer);
    renderPublications(parseInt(value, 10), pubListPageContainer);
  });
}

// Toggle all publications details
function setupToggleButton(buttonId, listId) {
  const btn = document.getElementById(buttonId);
  if (!btn) return;

  btn.addEventListener("click", function () {
    const items = document.querySelectorAll(`#${listId} .faq-item`);
    const isExpanding = this.innerText.includes("Show Details");

    items.forEach(item => {
      item.classList.toggle("faq-active", isExpanding);
    });

    this.innerHTML = isExpanding
      ? '<i class="bi bi-dash-circle me-1"></i> Hide Details'
      : '<i class="bi bi-plus-circle me-1"></i> Show Details';
  });
}

setupToggleButton("toggle-all-pubs", "pub-list");
setupToggleButton("toggle-all-pubs-page", "pub-list-page");

// Function to link media mentions
document.querySelectorAll('.critic-review').forEach((card) => {
  card.addEventListener('click', () => {
    window.open(card.dataset.url, '_blank'); // open in new tab
  });
});

// Function to link media mentions (swiper cards)
document.querySelectorAll('.testimonial-item').forEach((card) => {
  card.addEventListener('click', () => {
    window.open(card.dataset.url, '_blank'); // open in new tab
  });
});

// Function to equalize testimonial heights
function equalizeTestimonialHeights() {
  const items = document.querySelectorAll('.testimonials .testimonial-item');
  let maxHeight = 0;

  // Reset heights first
  items.forEach(item => item.style.height = 'auto');

  // Find max height
  items.forEach(item => {
    const h = item.offsetHeight;
    if (h > maxHeight) maxHeight = h;
  });

  // Apply max height
  items.forEach(item => item.style.height = maxHeight + 'px');
}
// Run on load
window.addEventListener('load', equalizeTestimonialHeights);
// Optional: rerun on window resize
window.addEventListener('resize', equalizeTestimonialHeights);

// Function to imitate php email form submission
document.querySelector('.php-email-form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const form = this;
  const loading = form.querySelector('.loading');
  const error = form.querySelector('.error-message');
  const success = form.querySelector('.sent-message');

  loading.style.display = "block";
  error.style.display = "none";
  success.style.display = "none";

  // Send the form
  let response = await fetch(form.action, {
    method: "POST",
    body: new FormData(form)
  });

  loading.style.display = "none";

  let result = await response.json();
  if (result.success) {
    success.style.display = "block";
    form.reset();
  } else {
    error.innerHTML = result.message;
    error.style.display = "block";
  }
});

// Remove the hash from the URL when the page loads
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    const target = document.querySelector(this.getAttribute("href"));
    target.scrollIntoView({ behavior: "smooth" });

    // Remove hash from URL
    history.replaceState(null, null, " ");
  });
});

// Handle hash when arriving from another page
window.addEventListener("load", function () {
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);

    if (target) {
      target.scrollIntoView({ behavior: "smooth" });

      // Remove hash from URL after scrolling
      history.replaceState(null, null, window.location.pathname + window.location.search);
    }
  }
});