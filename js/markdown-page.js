/**
 * Shared Markdown page loader (uses global `marked` from CDN).
 * RumeltMD.load({ mdPath, root, status?, heading? })
 */
(function (window) {
  'use strict';

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

    return fetch(opts.mdPath)
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
          status.textContent = 'Could not load ' + opts.mdPath + '. Use a local web server so content files can be fetched.';
        }
      });
  }

  window.RumeltMD = {
    parseFrontMatter: parseFrontMatter,
    applyHeadings: applyHeadings,
    load: load
  };
})(window);
