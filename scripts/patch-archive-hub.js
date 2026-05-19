const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'the-archive.html');
let html = fs.readFileSync(file, 'utf8');

const lede =
  '<p class="archive-hub-lede" id="archive-hub-lede">Click an <strong>underlined category title</strong> below to see its materials. Use <strong>Back to main archive menu</strong> at the top of the list, or <strong>The Archive</strong> in the site menu, to return to this page.</p>';

const d = 'div';
const categories = `          <${d} id="archive-hub-categories">
            <article class="archive-cat-card" data-category="papers">
              <h3 class="archive-cat-heading"><a class="archive-cat-title-link" href="#papers">Academic Papers</a></h3>
              <${d} class="archive-cat-md"><p>Scholarly publications and presented papers on strategy, organization, and competitive advantage. Download items where a PDF is available.</p></${d}>
            </article>
            <article class="archive-cat-card" data-category="smr">
              <h3 class="archive-cat-heading"><a class="archive-cat-title-link" href="#smr">Special Issue SMR</a></h3>
              <${d} class="archive-cat-md"><p>&ldquo;Special Issue of the Strategic Management Review Honoring Richard Rumelt&rdquo; Papers on his contributions to the field.</p></${d}>
            </article>
            <article class="archive-cat-card" data-category="interviews">
              <h3 class="archive-cat-heading"><a class="archive-cat-title-link" href="#interviews">Interviews</a></h3>
              <${d} class="archive-cat-md"><p>Conversations and podcast interviews with Richard Rumelt about strategy, leadership, and the ideas behind his books and papers.</p></${d}>
            </article>
            <article class="archive-cat-card" data-category="cases">
              <h3 class="archive-cat-heading"><a class="archive-cat-title-link" href="#cases">Cases</a></h3>
              <${d} class="archive-cat-md"><p>Teaching cases and companion notes for classroom discussion. Listings include co-authors, year, and source details so you can pick the right case for your syllabus.</p></${d}>
            </article>
            <article class="archive-cat-card" data-category="books">
              <h3 class="archive-cat-heading"><a class="archive-cat-title-link" href="#books">Books</a></h3>
              <${d} class="archive-cat-md"><p>Excerpts, chapters, and supplementary material drawn from published volumes. Open an item to read it in the site&rsquo;s PDF viewer and return here when you are done.</p></${d}>
            </article>
            <article class="archive-cat-card" data-category="blogs">
              <h3 class="archive-cat-heading"><a class="archive-cat-title-link" href="#blogs">StrategyLand Blog</a></h3>
              <${d} class="archive-cat-md"><p>Posts originally published on the StrategyLand blog. (That series was later superseded by &ldquo;The Rumelt Perspectives&rdquo; on Substack.) Archived pieces as PDFs.</p></${d}>
            </article>
            <article class="archive-cat-card" data-category="panel_of_experts">
              <h3 class="archive-cat-heading"><a class="archive-cat-title-link" href="#panel_of_experts">Panel of Experts</a></h3>
              <${d} class="archive-cat-md"><p>The Panel of Experts series. Learn to think like these leaders and thinkers to gain the ability to see problems and solutions from a variety of perspectives.</p></${d}>
            </article>
            <article class="archive-cat-card" data-category="tech_notes">
              <h3 class="archive-cat-heading"><a class="archive-cat-title-link" href="#tech_notes">Technical Notes</a></h3>
              <${d} class="archive-cat-md"><p>Short, practical notes on basic MBA financial and data analysis skills. Written for students and practitioners who want crisp explanations without extra fluff.</p></${d}>
            </article>
            <article class="archive-cat-card" data-category="data">
              <h3 class="archive-cat-heading"><a class="archive-cat-title-link" href="#data">Data Notes</a></h3>
              <${d} class="archive-cat-md"><p>Descriptions of datasets and downloadable exports, including work related to the Strategy-Structure database. Formats (PDF or CSV) are noted on each row.</p></${d}>
            </article>
            <article class="archive-cat-card" data-category="notes">
              <h3 class="archive-cat-heading"><a class="archive-cat-title-link" href="#notes">Unpublished Notes</a></h3>
              <${d} class="archive-cat-md"><p>Unpublished notes, memos, and think-pieces.</p></${d}>
            </article>
            <article class="archive-cat-card" data-category="bibliography">
              <h3 class="archive-cat-heading"><a class="archive-cat-title-link" href="#bibliography">Bibliography</a></h3>
              <${d} class="archive-cat-md"><p>Compiled references for materials in the archive. Choose an item to open its source file.</p></${d}>
            </article>
          </${d}>`;

const emptyHub = '          <' + d + ' id="archive-hub-categories"></' + d + '>';
html = html.replace('<p class="archive-hub-lede" id="archive-hub-lede"></p>', lede);
html = html.replace(emptyHub, categories);

fs.writeFileSync(file, html);
console.log('patched', file);
