// config.js — single source of truth for the API base URL.
//
// While the Custom Domain (api.maale-amos.org.il) isn't wired yet, we use
// the workers.dev fallback. When Yosef finishes the domain migration, swap
// the value below OR override via <meta name="ma-api-base" content="..."> in
// the page head — the meta tag wins if present. All frontend scripts
// (admin.js, klita.js, future callers) MUST read window.API_BASE, never
// hardcode a URL themselves.
(function () {
  'use strict';
  var meta = document.querySelector('meta[name="ma-api-base"]');
  var override = meta && meta.getAttribute('content');
  window.API_BASE = (override || 'https://maale-amos-api.6742853.workers.dev').replace(/\/+$/, '');
})();
