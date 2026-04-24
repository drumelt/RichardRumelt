/**
 * Loads content/archive-hub.md and fills the archive hub (lede + category cards).
 * Depends: global marked, window.RumeltMD.parseFrontMatter (from markdown-page.js).
 *
 * Section headers must match slugs in ORDER (e.g., ## intro, ## papers, ## notes).
 * Each category block (except intro): first line **Title** for the card heading;
 * remaining lines are Markdown body (paragraphs, emphasis, links).
 */
(function (window) {
  'use strict';

  var ORDER = [
    'intro',
    'papers',
    'smr',
    'cases',
    'books',
    'blogs',
    'panel_of_experts',
    'tech_notes',
    'notes',
    'data',
    'bibliography'
  ];

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function parseSections(body) {
    var parts = body.split(/^##[ \t]+([^\r\n]+)\s*$/m);
    var map = {};
    for (var i = 1; i < parts.length; i += 2) {
      var key = parts[i].trim().toLowerCase();
      map[key] = (parts[i + 1] || '').trim();
    }
    return map;
  }

  function splitTitleAndBody(sectionMd) {
    var lines = sectionMd.split(/\r?\n/);
    var first = (lines[0] || '').trim();
    var m = /^\*\*(.+)\*\*\s*$/.exec(first);
    var title = m ? m[1].trim() : first;
    var rest = lines.slice(m ? 1 : 0).join('\n').replace(/^\s+/, '');
    return { title: title, body: rest.trim() };
  }

  function markedOpts() {
    return { mangle: false, headerIds: false };
  }

  function buildCategoryHtml(slug, sectionMd) {
    var tb = splitTitleAndBody(sectionMd);
    var bodyHtml = tb.body ? marked.parse(tb.body, markedOpts()) : '';
    if (slug === 'bibliography') {
      return (
        '<article class="archive-cat-card archive-cat-card--muted" aria-label="Bibliography (coming)">' +
        '<h3 class="archive-cat-heading">' + escapeHtml(tb.title) + '</h3>' +
        (bodyHtml ? '<div class="archive-cat-md">' + bodyHtml + '</div>' : '') +
        '</article>'
      );
    }
    return (
      '<article class="archive-cat-card" data-category="' + escapeHtml(slug) + '">' +
      '<h3 class="archive-cat-heading"><a class="archive-cat-title-link" href="#' + escapeHtml(slug) + '">' +
      escapeHtml(tb.title) +
      '</a></h3>' +
      (bodyHtml ? '<div class="archive-cat-md">' + bodyHtml + '</div>' : '') +
      '</article>'
    );
  }

  function load(opts) {
    opts = opts || {};
    if (typeof marked === 'undefined') {
      return Promise.reject(new Error('marked missing'));
    }
    if (!window.RumeltMD || typeof window.RumeltMD.parseFrontMatter !== 'function') {
      return Promise.reject(new Error('RumeltMD.parseFrontMatter missing (load markdown-page.js first)'));
    }
    var mdPath = opts.mdPath || 'content/archive-hub.md';
    var ledeSel = opts.lede || '#archive-hub-lede';
    var rootSel = opts.categoriesRoot || '#archive-hub-categories';
    var errSel = opts.error || '#archive-load-error';
    var ledeEl = document.querySelector(ledeSel);
    var root = document.querySelector(rootSel);
    var errEl = document.querySelector(errSel);

    return fetch(mdPath)
      .then(function (r) {
        if (!r.ok) throw new Error(r.status + ' ' + r.statusText);
        return r.text();
      })
      .then(function (text) {
        var p = window.RumeltMD.parseFrontMatter(text);
        var map = parseSections(p.body.trim());
        if (errEl) {
          errEl.hidden = true;
          errEl.textContent = '';
        }
        if (ledeEl) {
          var intro = map.intro || '';
          ledeEl.innerHTML = marked.parse(intro.trim(), markedOpts());
        }
        if (!root) return;
        var chunks = [];
        for (var j = 0; j < ORDER.length; j++) {
          var slug = ORDER[j];
          if (slug === 'intro') continue;
          var raw = map[slug];
          if (raw == null || raw === '') continue;
          chunks.push(buildCategoryHtml(slug, raw));
        }
        root.innerHTML = chunks.join('');
      })
      .catch(function (err) {
        console.warn('Archive hub markdown:', err);
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent =
            'Could not load ' + mdPath + '. Use a local web server so content files can be fetched. You can still edit the Markdown file locally and reload after fixing the server.';
        }
        if (ledeEl && !ledeEl.innerHTML.trim()) {
          ledeEl.textContent =
            'Choose a category below to browse materials. (Intro text could not be loaded from the Markdown file.)';
        }
      });
  }

  window.RumeltArchiveHub = { load: load };
})(window);
