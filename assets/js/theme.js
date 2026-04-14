/**
 * Theme Switcher
 *
 * The button on the page toggles between one light theme and one dark theme.
 * Change the constants below to pick which pair the button cycles through.
 *
 * Light themes : 'ocean'    — blue/teal (default)
 *                'amber'    — warm orange/gold
 *                'forest'   — nature green
 *                'rose'     — soft pink / rose-gold
 *
 * Dark  themes : 'midnight' — GitHub-style deep blue (default)
 *                'aurora'   — deep teal / space
 */
const LIGHT_THEME = 'ocean';     // ← swap to any light theme name above
const DARK_THEME  = 'midnight';  // ← swap to any dark theme name above

// ─── Internal: which theme names count as "dark" ──────────────────────────────
const DARK_THEMES = new Set(['midnight', 'aurora']);

(function () {
  'use strict';

  const STORAGE_KEY = 'sm-theme';
  const root = document.documentElement;

  /** Apply a theme by name and persist it. */
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    updateButton(DARK_THEMES.has(theme));
  }

  /** Update the toggle button icon + accessible label. */
  function updateButton(isDark) {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    if (isDark) {
      btn.innerHTML = '<i class="bi bi-sun-fill"></i>';
      btn.title       = 'Switch to Light Theme';
      btn.setAttribute('aria-label', 'Switch to Light Theme');
    } else {
      btn.innerHTML = '<i class="bi bi-moon-stars-fill"></i>';
      btn.title       = 'Switch to Dark Theme';
      btn.setAttribute('aria-label', 'Switch to Dark Theme');
    }
  }

  /** Toggle between the configured light and dark theme. */
  function toggleTheme() {
    const current = root.getAttribute('data-theme') || LIGHT_THEME;
    applyTheme(DARK_THEMES.has(current) ? LIGHT_THEME : DARK_THEME);
  }

  // ── On load: restore explicit preference, else follow OS setting ──────────
  const saved       = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (prefersDark ? DARK_THEME : LIGHT_THEME));

  // ── Wire up the button once DOM is ready ─────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.addEventListener('click', toggleTheme);
      // Sync icon in case DOMContentLoaded fires after applyTheme
      updateButton(DARK_THEMES.has(root.getAttribute('data-theme') || LIGHT_THEME));
    }
  });
})();
