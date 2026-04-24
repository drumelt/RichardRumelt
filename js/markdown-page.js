/**
 * Shared Markdown page loader (uses global `marked` from CDN).
 * RumeltMD.load({ mdPath, root, status?, heading? })
 */
(function (window) {
  'use strict';

  /**
   * Site root path (trailing slash), from this script’s URL. Captured as soon
   * as markdown-page.js runs (only then is `document.currentScript` reliable).
   * e.g. …/RichardRumelt/js/… → /RichardRumelt/ — correct even if the current
   * page URL is missing a trailing slash. Falls back to location.pathname
   * logic for edge cases.
   */
  var SITE_BASE_FROM_SCRIPT = (function () {
    var cs = document.currentScript;
    if (!cs || !cs.src) return null;
    try {
      var u = new URL('..', cs.src);
      if (u.origin !== window.location.origin) return null;
      var d = u.pathname;
      return d.charAt(d.length - 1) === '/' ? d : d + '/';
    } catch (e) {
      return null;
    }
  })();

  function siteBasePath() {
    if (SITE_BASE_FROM_SCRIPT) return SITE_BASE_FROM_SCRIPT;
    var p = window.location.pathname;
    if (p.endsWith('/')) return p;
    var segs = p.split('/');
    var last = segs[segs.length - 1] || '';
    if (last && last.indexOf('.') !== -1) {
      return p.slice(0, p.lastIndexOf('/') + 1) || '/';
    }
    return p + '/';
  }

  /** Resolves a site-relative path to an absolute URL for fetch(). */
  function assetUrl(relative) {
    var r = String(relative || '');
    if (/^https?:\/\//i.test(r) || r.indexOf('//') === 0) return r;
    r = r.replace(/^\//, '');
    if (!r) return window.location.origin + siteBasePath();
    return new URL(r, window.location.origin + siteBasePath()).href;
  }

  function stripBOM(t) {
    return String(t).replace(/^\uFEFF/, '');
  }

  function parseFrontMatter(text) {
    text = stripBOM(text);
    if (!text.startsWith('---')) return { data: {}, body: text.trim() };
    var m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!m) return { data: {}, body: text.trim() };
    var data = {};
    m[1].split(/\r?\n/).forEach(function (line) {
      var idx = line.indexOf(':');
      if (idx === -1) return;
      var key = line.slice(0, idx).trim();
      var val = line.slice(idx + 1).trim();
      if ((val.charAt(0) === '"' && val.charAt(val.length - 1) === '"') ||
          (val.charAt(0) === "'" && val.charAt(val.length - 1) === "'")) {
        val = val.slice(1, -1);
      }
      data[key] = val;
    });
    return { data: data, body: m[2].trim() };
  }

  function applyHeadings(data, cfg) {
    if (!cfg) return;
    var el;
    if (data.title && cfg.title) {
      el = document.querySelector(cfg.title);
      if (el) el.textContent = data.title;
    }
    if (data.tagline && cfg.tagline) {
      el = document.querySelector(cfg.tagline);
      if (el) el.textContent = data.tagline;
    }
  }

  function load(opts) {
    if (typeof marked === 'undefined') {
      console.error('RumeltMD: marked is not loaded');
      return Promise.reject(new Error('marked missing'));
    }
    var root = document.querySelector(opts.root);
    if (!root) return Promise.reject(new Error('root not found: ' + opts.root));
    var status = opts.status ? document.querySelector(opts.status) : null;

    return fetch(assetUrl(opts.mdPath))
      .then(function (r) {
        if (!r.ok) throw new Error(r.status + ' ' + r.statusText);
        return r.text();
      })
      .then(function (text) {
        var p = parseFrontMatter(text);
        applyHeadings(p.data, opts.heading);
        if (p.data.html_title) document.title = p.data.html_title;
        root.innerHTML = marked.parse(p.body, { mangle: false, headerIds: false });
        if (opts.rootHidden !== false) root.hidden = false;
        if (status) status.style.display = 'none';
      })
      .catch(function (err) {
        console.warn(err);
        if (status) {
          var hint = window.location && window.location.protocol === 'file:'
            ? 'Open this site via a local web server (e.g. python -m http.server), not as a file:// page.'
            : 'Check the page URL, your connection, or the live deployment.';
          status.textContent = 'Could not load ' + opts.mdPath + '. ' + hint;
        }
      });
  }

  window.RumeltMD = {
    parseFrontMatter: parseFrontMatter,
    applyHeadings: applyHeadings,
    siteBasePath: siteBasePath,
    assetUrl: assetUrl,
    load: load
  };
})(window);
