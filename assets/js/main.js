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
   * SM Animated Preloader
   * Waits for both the page to load AND a minimum display time so the full
   * animation plays before fading out. Re-initialises PureCounter after
   * removal so hero stats animate from 0 when they become visible.
   */
  // ─── Hero Title Animation ──────────────────────────────────────────────────
  // Pick one of these 5 modes for the hero title animation:
  //
  //   'dual-typewriter'  — both rows type in sequence with a single moving cursor
  //   'typewriter-slide' — row 1 types with cursor; row 2 slides/fades in
  //   'stagger-chars'    — each character fades in with a stagger delay
  //   'word-by-word'     — words slide up one-by-one, row 1 then row 2
  //   'scramble-resolve' — characters scramble through random glyphs before resolving
  //
  const HERO_TITLE_MODE = 'typewriter-slide';

  // Title pairs: [row-1 green text, row-2 blue text]
  const HERO_TITLE_PAIRS = [
    ['Machine Learning', 'Engineer'  ],
    ['Data & ML',        'Scientist' ],
    ['Geospatial AI',    'Engineer' ],
    ['Remote Sensing',   'Scientist' ]
  ];

  // Timing (ms) — adjust to taste
  const HERO_TITLE_OPTS = {
    holdMs:     3000,  // how long each pair is displayed
    transMs:     420,  // exit/enter fade duration
    typeMs:       70,  // ms per character (typewriter modes)
    staggerMs:    42,  // ms between chars/words (stagger & word-by-word modes)
    scrambleMs:   28,  // ms per scramble frame (scramble-resolve mode)
  };

  class HeroTitleAnimator {
    constructor(el1, el2, pairs, opts, mode) {
      this.el1   = el1;
      this.el2   = el2;
      this.pairs = pairs;
      this.opts  = Object.assign({ holdMs:3000, transMs:420, typeMs:70, staggerMs:42, scrambleMs:28 }, opts);
      this.mode  = mode || 'dual-typewriter';
      this.idx   = 0;

      const cursorModes = ['dual-typewriter', 'typewriter-slide', 'stagger-chars', 'scramble-resolve'];
      this._cursor = cursorModes.includes(this.mode) ? this._makeCursor() : null;

      this._startPair(0);
    }

    _makeCursor() {
      const c = document.createElement('span');
      c.className = 'dt-cursor';
      return c;
    }

    _startPair(i) {
      const [t1, t2] = this.pairs[i];
      this.el1.textContent = '';
      this.el2.textContent = '';
      const dispatch = {
        'dual-typewriter':  () => this._modeDualTypewriter(t1, t2),
        'typewriter-slide': () => this._modeTypewriterSlide(t1, t2),
        'stagger-chars':    () => this._modeStaggerChars(t1, t2),
        'word-by-word':     () => this._modeWordByWord(t1, t2),
        'scramble-resolve': () => this._modeScrambleResolve(t1, t2),
      };
      (dispatch[this.mode] || dispatch['dual-typewriter'])();
    }

    // ── Mode 1: dual-typewriter ──────────────────────────────────────────────
    // Row 1 types char-by-char with cursor; cursor then jumps to row 2 and it types.
    _modeDualTypewriter(t1, t2) {
      const cur = this._cursor;
      this.el1.appendChild(cur);
      this._typeInto(this.el1, t1, cur, () => {
        this.el2.appendChild(cur);          // cursor jumps to row 2
        this._typeInto(this.el2, t2, cur, () => {
          this._holdAndCycle(cur);
        });
      });
    }

    // ── Mode 2: typewriter-slide ─────────────────────────────────────────────
    // Row 1 types with cursor; row 2 slides/fades in; cursor stays on row 1.
    _modeTypewriterSlide(t1, t2) {
      const cur = this._cursor;
      this.el1.appendChild(cur);
      this._typeInto(this.el1, t1, cur, () => {
        this.el2.textContent = t2;
        this.el2.classList.add('dt-in');
        setTimeout(() => this.el2.classList.remove('dt-in'), this.opts.transMs);
        this._holdAndCycle(cur);
      });
    }

    // ── Mode 3: stagger-chars ────────────────────────────────────────────────
    // Each character fades in with a stagger delay, row 1 then row 2; cursor blinks at end.
    _modeStaggerChars(t1, t2) {
      const cur = this._cursor;
      this._staggerFade(this.el1, t1, () => {
        this._staggerFade(this.el2, t2, () => {
          this.el2.appendChild(cur);
          this._holdAndCycle(cur);
        });
      });
    }

    // ── Mode 4: word-by-word ─────────────────────────────────────────────────
    // Words from row 1 then row 2 slide up and fade in, one word at a time.
    _modeWordByWord(t1, t2) {
      this._revealWords(this.el1, t1.split(' '), () => {
        this._revealWords(this.el2, t2.split(' '), () => {
          this._holdAndCycle(null);
        });
      });
    }

    // ── Mode 5: scramble-resolve ─────────────────────────────────────────────
    // Characters scramble through random glyphs before resolving to the real char.
    _modeScrambleResolve(t1, t2) {
      const cur = this._cursor;
      this._scrambleTo(this.el1, t1, () => {
        this._scrambleTo(this.el2, t2, () => {
          this.el2.appendChild(cur);
          this._holdAndCycle(cur);
        });
      });
    }

    // ── Shared helpers ────────────────────────────────────────────────────────

    // Type `text` into `el` keeping `cursor` node at the end.
    _typeInto(el, text, cursor, done) {
      const node = document.createTextNode('');
      el.insertBefore(node, cursor);
      let i = 0;
      const step = () => {
        if (i < text.length) {
          node.textContent += text[i++];
          this._typeTimer = setTimeout(step, this.opts.typeMs);
        } else if (done) done();
      };
      step();
    }

    // Fade each character in with a stagger delay.
    _staggerFade(el, text, done) {
      el.textContent = '';
      const chars = [...text];
      chars.forEach((ch, i) => {
        const s = document.createElement('span');
        s.textContent   = ch === ' ' ? '\u00A0' : ch;
        s.style.cssText = `opacity:0;display:inline-block;transition:opacity ${Math.round(this.opts.transMs * 0.6)}ms ease`;
        el.appendChild(s);
        setTimeout(() => { s.style.opacity = '1'; }, i * this.opts.staggerMs + 60);
      });
      setTimeout(done, chars.length * this.opts.staggerMs + this.opts.transMs + 80);
    }

    // Reveal words one-by-one with a slide-up effect.
    _revealWords(el, words, done) {
      el.textContent = '';
      words.forEach((word, i) => {
        const s = document.createElement('span');
        s.textContent   = (i > 0 ? '\u00A0' : '') + word;
        s.style.cssText = `opacity:0;display:inline-block;transform:translateY(16px);transition:opacity ${this.opts.transMs}ms ease,transform ${this.opts.transMs}ms ease`;
        el.appendChild(s);
        setTimeout(() => {
          s.style.opacity   = '1';
          s.style.transform = 'translateY(0)';
        }, i * this.opts.staggerMs * 3 + 60);
      });
      setTimeout(done, words.length * this.opts.staggerMs * 3 + this.opts.transMs + 80);
    }

    // Scramble each character through random glyphs before resolving.
    _scrambleTo(el, text, done) {
      const CHARS    = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789#@$%';
      const result   = Array.from(text).map(c => (c === ' ' ? ' ' : '·'));
      const resolved = result.map(c => c === ' ');
      let resolvedCount = resolved.filter(Boolean).length;

      const render = () => {
        el.textContent = '';
        result.forEach((ch, i) => {
          const s = document.createElement('span');
          s.textContent = ch;
          if (!resolved[i]) s.style.cssText = 'opacity:0.35;color:var(--accent-color)';
          el.appendChild(s);
        });
      };

      const resolveChar = (i) => {
        if (text[i] === ' ') return;
        let frames = 0;
        const max  = 4 + Math.floor(Math.random() * 5);
        const tick = () => {
          if (frames++ < max) {
            result[i] = CHARS[Math.floor(Math.random() * CHARS.length)];
            render();
            setTimeout(tick, this.opts.scrambleMs);
          } else {
            result[i]   = text[i];
            resolved[i] = true;
            resolvedCount++;
            render();
            if (resolvedCount === text.length && done) done();
          }
        };
        tick();
      };

      render();
      Array.from(text).forEach((_, i) => {
        setTimeout(() => resolveChar(i), i * this.opts.staggerMs * 2);
      });
    }

    // Hold current pair for holdMs, then fade out and advance to the next pair.
    _holdAndCycle(cursor) {
      this._timer = setTimeout(() => {
        if (cursor && cursor.parentNode) cursor.parentNode.removeChild(cursor);
        this.el1.classList.add('dt-out');
        this.el2.classList.add('dt-out');
        setTimeout(() => {
          this.el1.classList.remove('dt-out');
          this.el2.classList.remove('dt-out');
          this.idx = (this.idx + 1) % this.pairs.length;
          this._startPair(this.idx);
        }, this.opts.transMs);
      }, this.opts.holdMs);
    }
  }

  function initDualTyper() {
    const el1 = document.querySelector('.dt-text-1');
    const el2 = document.querySelector('.dt-text-2');
    if (!el1 || !el2) return;
    new HeroTitleAnimator(el1, el2, HERO_TITLE_PAIRS, HERO_TITLE_OPTS, HERO_TITLE_MODE);
  }

  // ─── SM Animated Preloader ─────────────────────────────────────────────────
  const preloader = document.getElementById('preloader');
  if (preloader) {
    const MIN_DISPLAY_MS = 3000;
    let pageReady = false;
    let minTimePassed = false;

    function tryHidePreloader() {
      if (!pageReady || !minTimePassed) return;
      preloader.classList.add('pl-loaded');
      setTimeout(() => {
        if (preloader.parentNode) preloader.remove();
        // Show static zeros immediately so counters don't flash old values
        document.querySelectorAll('.purecounter').forEach(el => { el.textContent = '0'; });
        // Start dual typewriter now that the hero is fully revealed
        initDualTyper();
        // Delay counter animation — lets the user read the badge + title first
        setTimeout(() => { new PureCounter(); }, 1);
      }, 900); // matches CSS fade-out transition duration
    }

    window.addEventListener('load', () => { pageReady = true; tryHidePreloader(); });
    setTimeout(() => { minTimePassed = true; tryHidePreloader(); }, MIN_DISPLAY_MS);
  } else {
    // No preloader (e.g. direct section link) — start typer immediately
    window.addEventListener('load', initDualTyper);
  }

  // Logo IntersectionObserver is handled by experience.js after logos are rendered.

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
   * Skipped here — started with a delay inside the preloader callback
   * so the counters animate after the hero is fully revealed.
   */

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
      typeSpeed: 65,
      backSpeed: 35,
      backDelay: 2200
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