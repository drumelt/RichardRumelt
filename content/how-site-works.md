# How this site works

This is a **static** site: each public page is an **HTML file** with shared styling (`common.css`), optional page-specific CSS in the `<head>`, and **JavaScript** that loads **Markdown** (`.md`) and/or **CSV** data at runtime from the `content/` folder or the site root.

Because the browser loads `.md` and `.csv` with `fetch()`, you **cannot** rely on opening HTML as `file://` for full behavior. Use a **local HTTP server** from the project root (for example `python -m http.server` or VS Code / Cursor �Live Server�) so those requests succeed�the same requirement applies on the live host.

---

## Navigation (two levels)

1. **Top row** (`nav.nav-top`): **About** � **Services** � **Portfolio**
2. **Second row** (`nav.nav-sub`): depends on which top item is active.
   - **Services** subnav: Advisory (home), Strategy Foundry, Speaking, Contact.
   - **Portfolio** subnav: Books, Articles, Substack, **The Archive**.

**Portfolio** in the top row points to **`books.html`** (not a separate �portfolio landing� page).

Active link styling uses the `active` class on the relevant `<a>` elements in each HTML file.

---

## Markdown-driven pages

**Libraries**

- **`marked`** (from a CDN) turns Markdown into HTML.
- **`js/markdown-page.js`** defines **`RumeltMD`**: `RumeltMD.load({ mdPath, root, status?, heading? })`.
  - Optional **YAML front matter** at the top of the file, delimited by `---` lines:
    - Common keys: `title`, `tagline`, `html_title` (page `<title>` when set).
  - The Markdown **body** is rendered into the DOM node given by `root` (usually a hidden container that is shown after load).
  - `status` is typically a �Loading�� paragraph that is hidden on success.

**Typical pairing (HTML ? Markdown under `content/`)**

| HTML page | Markdown source |
|-----------|------------------|
| `advisory.html` | `content/advisory.md` |
| `about.html` | `content/about.md` |
| `speaking.html` | `content/speaking.md` |
| `strategy-foundry.html` | `content/strategy-foundry.md` |
| `contact.html` | `content/contact.md` |
| `books.html` | `content/books.md` |
| `portfolio.html` | `content/portfolio.md` |
| `good-strategy-bad-strategy.html` | `content/good-strategy-bad-strategy.md` |
| `the-crux.html` | `content/the-crux.md` |
| `strategy-structure.html` | `content/strategy-structure.md` |
| `fundamental-issues.html` | `content/fundamental-issues.md` |
| `gsbs-references.html` | `content/gsbs-references.md` |
| `crux-references.html` | `content/crux-references.md` |

Edit the **`.md`** file for prose changes; keep HTML structure and `RumeltMD.load({ ... })` paths in sync if you rename files.

---

## The Archive (`the-archive.html`)

The Archive combines **three** pieces:

### 1. Hub copy � `content/archive-hub.md`

Loaded by **`js/archive-hub.js`** (`RumeltArchiveHub.load({ mdPath: 'content/archive-hub.md' })`). It uses the same **`RumeltMD.parseFrontMatter`** helper as other pages (so optional front matter is supported), then splits the body into sections by **`## section`** headings.

**Rules** (also summarized in a comment at the top of `archive-hub.md`):

- **`## intro`** � Markdown for the short paragraph under �Browse by category�.
- **Each category** � heading must match the **slug** used in URLs and CSV, e.g. `## papers`, `## smr`, `## panel_of_experts`, `## tech_notes`, `## data`, `## bibliography`, etc.
- First line of each category block: **`**Exact title**`** (bold).
- Remaining lines: Markdown for the gray description.
- **`bibliography`** is rendered as plain text (no link), like a �coming soon� card.

### 2. Catalog data � `library-data.csv` (site root)

Fetched once on load. **Columns** (header row): `category`, `order`, `title`, `co_authors`, `year`, `journal`, `description`, `file`.

- **`category`** must match the archive slug (e.g. `papers`, `cases`, `tech_notes`) and the **`#hash`** when a category list is open.
- **`order`**: if the value is **`x`** or **`X`** (case-insensitive), that row is **omitted** from lists (useful for hiding draft rows without deleting them).
- **`file`**: path to a PDF (or other asset) relative to the site root; used to build links to **`view-pdf.html`** (see below). Rows without a file can still appear as list entries without a View link.

### 3. Page behavior

- Choosing a category sets the URL hash (e.g. `#papers`) and replaces the hub with the **item list** for that category. There is **no** duplicate category title block above the list.
- **Back to main archive menu** goes to **`the-archive.html`** (no hash).
- **`view-pdf.html`** opens documents; it expects query parameters (see that file), including a return context so the back control can send users to **`the-archive.html#category`** when appropriate.

**Layout note:** On this page only, `html` / `body` use a constrained height and an inner **`.archive-scroll-wrap`** so the **header + hero (card catalog)** stay fixed while **main + footer** scroll.

---

## Other CSV-driven lists

| Page | CSV file | Role |
|------|----------|------|
| `articles.html` | `articles-data.csv` | Article list (columns such as year, title, publication, description, file). |
| `substack.html` | `substack.csv` | Substack / post list (similar fetch + render pattern). |

Other `.csv` files may exist in the repo for reference or exports; **`library-data.csv`** is the one **The Archive** uses.

---

## PDF viewer (`view-pdf.html`)

Utility page (often **`noindex`** for search engines). It reads **`src`** (file path) and **`from`** (return page) from the URL and shows a toolbar with a back link. Archive list rows point here when a `file` is present in **`library-data.csv`**.

---

## Shared assets and SEO

- **`common.css`**: site-wide typography, colors, header/nav, `main`, footer.
- **`robots.txt`** and **`sitemap.xml`**: at site root; update **`lastmod`** in the sitemap when you meaningfully change pages.
- Many HTML pages declare a **canonical** URL for `https://www.richardrumelt.com/...`.

---

## Quick checklist when adding or changing content

1. **Prose page** � Edit the matching **`content/*.md`**; confirm the HTML page still points to the correct `mdPath`.
2. **Archive hub blurbs** � Edit **`content/archive-hub.md`** only; do not duplicate long copy in **`the-archive.html`**.
3. **Archive items** � Add or edit rows in **`library-data.csv`**; keep **`category`** aligned with hub section headings and `#` links.
4. **Articles / Substack** � Edit the corresponding **`.csv`** and verify column names match what the page�s script expects.
5. **Test locally over HTTP** after any change to loaded `.md` / `.csv` files.

For a machine-readable map of MD/CSV pairings, see comments in **`was_index.html`** (developer-oriented scratch file in the repo).
