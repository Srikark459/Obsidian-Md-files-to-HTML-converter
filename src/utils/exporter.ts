import { NoteFile, TOCNode } from '../types';

export function renderTOCNodeToHtml(node: TOCNode): string {
  const hasChildren = node.children && node.children.length > 0;
  const isFileRoot = node.level === 0;

  let html = `<li class="toc-item level-${node.level}">
    <div class="toc-item-row">
      <span class="toc-toggle ${!hasChildren ? 'empty' : ''}" onclick="toggleTocItem(this)">▾</span>
      <a class="toc-link ${isFileRoot ? 'is-file-root' : ''}" href="#${node.id}">${node.title}</a>
    </div>`;

  if (hasChildren) {
    html += `<ul class="toc-nested">`;
    node.children.forEach((child) => {
      html += renderTOCNodeToHtml(child);
    });
    html += `</ul>`;
  }
  html += `</li>`;
  return html;
}

export function generateStandaloneHTML(
  files: NoteFile[],
  tocNodes: TOCNode[],
  title: string = 'Obsidian Export',
  initialTheme: 'light' | 'dark' = 'light'
): string {
  const tocHtml = `<ul class="toc-root">${tocNodes
    .map((node) => renderTOCNodeToHtml(node))
    .join('')}</ul>`;

  const bodyContent = files
    .map(
      (file) => `
    <section id="${file.id}" class="doc-file-section">
      <header class="doc-file-header">
        <h1 class="doc-file-title" id="${file.id}-title">${file.name}</h1>
      </header>
      <div class="doc-file-content">
        ${file.processedHtml}
      </div>
    </section>
    <hr class="doc-file-divider" />
  `
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.18.7/dist/katex.min.css">
  <style>
    :root {
      --bg-color: #FFFFFF;
      --surface: #F9FAFB;
      --surface-hover: #F3F4F6;
      --border-color: #E5E7EB;
      --text-main: #111827;
      --text-muted: #4B5563;
      --text-meta: #9CA3AF;
      --accent: #111827;
      --accent-hover: #374151;
      --callout-bg: #EFF6FF;
      --callout-border: #3B82F6;
      --callout-text: #1D4ED8;
    }

    body.dark-mode {
      --bg-color: #121316;
      --surface: #18191E;
      --surface-hover: #22242B;
      --border-color: #2D3039;
      --text-main: #F3F4F6;
      --text-muted: #9CA3AF;
      --text-meta: #6B7280;
      --accent: #F9FAFB;
      --accent-hover: #E5E7EB;
      --callout-bg: rgba(30, 58, 138, 0.22);
      --callout-border: #60A5FA;
      --callout-text: #93C5FD;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg-color);
      color: var(--text-main);
      line-height: 1.65;
      -webkit-font-smoothing: antialiased;
      height: 100vh;
      overflow: hidden;
      transition: background-color 0.15s ease, color 0.15s ease;
    }

    .standalone-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .top-header {
      height: 56px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      background: var(--bg-color);
      z-index: 50;
      flex-shrink: 0;
    }

    .top-title {
      font-weight: 600;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .top-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .btn-action {
      background: transparent;
      border: 1px solid var(--border-color);
      padding: 0.35rem 0.75rem;
      font-size: 0.8rem;
      border-radius: 4px;
      cursor: pointer;
      color: var(--text-main);
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.15s ease;
    }

    .btn-action:hover {
      background: var(--surface-hover);
    }

    .workspace-area {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .toc-sidebar {
      width: 290px;
      border-right: 1px solid var(--border-color);
      background: var(--surface);
      overflow-y: auto;
      padding: 1.5rem 1rem;
      flex-shrink: 0;
    }

    .toc-sidebar-header {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-meta);
      margin-bottom: 1rem;
      font-weight: 600;
      padding: 0 0.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .toc-root, .toc-nested {
      list-style: none;
      padding-left: 0;
      margin: 0;
    }

    .toc-nested {
      padding-left: 1rem;
      border-left: 1px dashed var(--border-color);
      margin-left: 0.5rem;
    }

    .toc-nested.hidden {
      display: none;
    }

    .toc-item-row {
      display: flex;
      align-items: flex-start;
      margin: 4px 0;
      padding: 2px 4px;
      border-radius: 4px;
      transition: background 0.1s ease;
    }

    .toc-item-row:hover {
      background: var(--surface-hover);
    }

    .toc-toggle {
      width: 18px;
      flex-shrink: 0;
      cursor: pointer;
      user-select: none;
      color: var(--text-meta);
      display: inline-block;
      transition: transform 0.15s ease;
      font-size: 0.8rem;
      text-align: center;
    }

    .toc-toggle.collapsed {
      transform: rotate(-90deg);
    }

    .toc-toggle.empty {
      visibility: hidden;
    }

    .toc-link {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.8125rem;
      flex: 1;
      line-height: 1.4;
      word-break: break-word;
    }

    .toc-link:hover {
      color: var(--text-main);
    }

    .toc-link.is-file-root {
      font-weight: 600;
      color: var(--text-main);
      font-size: 0.85rem;
    }

    .content-area {
      flex: 1;
      overflow-y: auto;
      padding: 3rem 4rem;
      scroll-behavior: smooth;
    }

    .document-body {
      max-width: 780px;
      margin: 0 auto;
      padding-bottom: 8rem;
    }

    .doc-file-section {
      margin-bottom: 2rem;
    }

    .doc-file-title {
      font-size: 2rem;
      font-weight: 700;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.75rem;
      margin-bottom: 2rem;
      letter-spacing: -0.02em;
    }

    .doc-file-divider {
      margin: 4rem 0;
      border: 0;
      border-top: 1px solid var(--border-color);
    }

    /* Collapsible Headings in Document */
    .document-body h1, .document-body h2, .document-body h3, .document-body h4 {
      cursor: pointer;
      user-select: none;
      position: relative;
      letter-spacing: -0.015em;
    }

    .document-body h1::before, .document-body h2::before, .document-body h3::before, .document-body h4::before {
      content: '▾';
      display: inline-block;
      margin-right: 0.5rem;
      font-size: 0.8em;
      color: var(--text-meta);
      transition: transform 0.15s ease;
    }

    .document-body .heading-collapsed::before {
      transform: rotate(-90deg);
    }

    .document-body h1 {
      font-size: 1.75rem;
      font-weight: 650;
      margin-top: 2.5rem;
      margin-bottom: 1.25rem;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.5rem;
    }

    .document-body h2 {
      font-size: 1.35rem;
      font-weight: 600;
      margin-top: 2rem;
      margin-bottom: 0.75rem;
    }

    .document-body h3 {
      font-size: 1.125rem;
      font-weight: 600;
      margin-top: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .document-body h4 {
      font-size: 1rem;
      font-weight: 600;
      margin-top: 1.25rem;
      margin-bottom: 0.5rem;
    }

    .document-body p {
      margin-bottom: 1.25rem;
      color: var(--text-main);
      font-size: 0.95rem;
    }

    .document-body strong {
      font-weight: 600;
    }

    .document-body a {
      color: #2563EB;
      text-decoration: underline;
      text-underline-offset: 2px;
    }

    .document-body a.obsidian-wikilink {
      color: #4F46E5;
      text-decoration: none;
      background: rgba(79, 70, 229, 0.07);
      padding: 0.1rem 0.35rem;
      border-radius: 3px;
      border-bottom: 1px dashed #4F46E5;
    }

    .document-body a.obsidian-wikilink:hover {
      background: rgba(79, 70, 229, 0.15);
    }

    .document-body mark {
      background: #FEF08A;
      padding: 0.1rem 0.3rem;
      border-radius: 2px;
    }

    .document-body del {
      color: var(--text-meta);
    }

    .obsidian-tag {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 500;
      background: var(--surface);
      border: 1px solid var(--border-color);
      color: var(--text-muted);
      padding: 0.1rem 0.5rem;
      border-radius: 12px;
      margin-right: 0.35rem;
      margin-bottom: 0.35rem;
    }

    .document-body pre {
      background: var(--surface);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 1rem;
      overflow-x: auto;
      margin: 1.5rem 0;
    }

    .document-body code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.85em;
      background: var(--surface);
      border: 1px solid var(--border-color);
      padding: 0.15rem 0.35rem;
      border-radius: 4px;
    }

    .document-body pre code {
      background: transparent;
      border: none;
      padding: 0;
      font-size: 0.8125rem;
      line-height: 1.5;
    }

    .document-body table {
      width: 100%;
      border-collapse: collapse;
      margin: 2rem 0;
      font-size: 0.875rem;
    }

    .document-body th, .document-body td {
      border: 1px solid var(--border-color);
      padding: 0.75rem 1rem;
      text-align: left;
    }

    .document-body th {
      background: var(--surface);
      font-weight: 600;
    }

    .document-body tr:nth-child(even) {
      background: #FAFAFA;
    }

    .document-body ul, .document-body ol {
      margin-bottom: 1.25rem;
      padding-left: 1.75rem;
    }

    .document-body li {
      margin-bottom: 0.4rem;
    }

    .document-body li.task-list-item {
      list-style: none;
      margin-left: -1.75rem;
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .document-body li.task-list-item input[type="checkbox"] {
      margin-top: 0.3rem;
      accent-color: #111827;
      cursor: pointer;
    }

    .document-body blockquote {
      border-left: 3px solid var(--border-color);
      padding-left: 1.25rem;
      margin: 1.5rem 0;
      color: var(--text-muted);
      font-style: italic;
    }

    /* Obsidian Callouts */
    .obsidian-callout {
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 1rem 1.25rem;
      margin: 1.5rem 0;
    }

    .obsidian-callout-title {
      font-weight: 600;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      cursor: pointer;
      user-select: none;
    }

    .obsidian-callout-content p:last-child {
      margin-bottom: 0;
    }

    .callout-note {
      background: #EFF6FF;
      border-left: 4px solid #3B82F6;
    }
    .callout-note .obsidian-callout-title { color: #1D4ED8; }

    .callout-tip {
      background: #F0FDF4;
      border-left: 4px solid #10B981;
    }
    .callout-tip .obsidian-callout-title { color: #047857; }

    .callout-warning {
      background: #FFFBEB;
      border-left: 4px solid #F59E0B;
    }
    .callout-warning .obsidian-callout-title { color: #B45309; }

    .callout-danger {
      background: #FEF2F2;
      border-left: 4px solid #EF4444;
    }
    .callout-danger .obsidian-callout-title { color: #B91C1C; }

    .callout-question {
      background: #FAF5FF;
      border-left: 4px solid #A855F7;
    }
    .callout-question .obsidian-callout-title { color: #7E22CE; }

    .callout-quote {
      background: #F9FAFB;
      border-left: 4px solid #6B7280;
    }
    .callout-quote .obsidian-callout-title { color: #374151; }

    .callout-example {
      background: #F5F3FF;
      border-left: 4px solid #8B5CF6;
    }
    .callout-example .obsidian-callout-title { color: #6D28D9; }

    .callout-summary, .callout-todo {
      background: #F0FDFA;
      border-left: 4px solid #14B8A6;
    }
    .callout-summary .obsidian-callout-title, .callout-todo .obsidian-callout-title { color: #0F766E; }

    /* Dark Mode Overrides */
    body.dark-mode .callout-note { background: rgba(30, 58, 138, 0.22); border-left-color: #60A5FA; }
    body.dark-mode .callout-note .obsidian-callout-title { color: #93C5FD; }
    body.dark-mode .callout-tip { background: rgba(6, 78, 59, 0.22); border-left-color: #34D399; }
    body.dark-mode .callout-tip .obsidian-callout-title { color: #6EE7B7; }
    body.dark-mode .callout-warning { background: rgba(120, 53, 15, 0.22); border-left-color: #FBBF24; }
    body.dark-mode .callout-warning .obsidian-callout-title { color: #FDE68A; }
    body.dark-mode .callout-danger { background: rgba(127, 29, 29, 0.22); border-left-color: #F87171; }
    body.dark-mode .callout-danger .obsidian-callout-title { color: #FCA5A5; }
    body.dark-mode .callout-question { background: rgba(88, 28, 135, 0.22); border-left-color: #C084FC; }
    body.dark-mode .callout-question .obsidian-callout-title { color: #DDD6FE; }
    body.dark-mode .callout-quote { background: rgba(39, 39, 42, 0.4); border-left-color: #9CA3AF; }
    body.dark-mode .callout-quote .obsidian-callout-title { color: #E5E7EB; }
    body.dark-mode .callout-example { background: rgba(109, 40, 217, 0.22); border-left-color: #A78BFA; }
    body.dark-mode .callout-example .obsidian-callout-title { color: #DDD6FE; }
    body.dark-mode .callout-summary, body.dark-mode .callout-todo { background: rgba(19, 78, 74, 0.22); border-left-color: #2DD4BF; }
    body.dark-mode .callout-summary .obsidian-callout-title, body.dark-mode .callout-todo .obsidian-callout-title { color: #99F6E4; }
    body.dark-mode .obsidian-wikilink { color: #A5B4FC !important; background: rgba(99, 102, 241, 0.16); border-bottom-color: #818CF8; }
    body.dark-mode .obsidian-tag { background: #27272A; border-color: #3F3F46; color: #D4D4D8; }
    body.dark-mode mark { background: #854D0E; color: #FEF08A; }
    body.dark-mode del { color: #6B7280; }
    body.dark-mode blockquote { border-left-color: #3F3F46; color: #9CA3AF; }
    body.dark-mode pre { background: #18191E; border-color: #2D3039; }
    body.dark-mode code { background: #22242B; border-color: #2D3039; color: #E5E7EB; }
    body.dark-mode pre code { background: transparent; border: none; }
    body.dark-mode table th { background: #18191E; color: #F3F4F6; }
    body.dark-mode table tr:nth-child(even) { background: #16171B; }

    /* KaTeX Blocks & Alignment Fixes */
    .katex-display-block {
      overflow-x: auto;
      padding: 0.75rem 0;
      margin: 1rem 0;
      text-align: center;
      line-height: 1.2;
    }

    .katex-inline {
      display: inline-block;
      padding: 0 0.15rem;
      line-height: 1;
    }

    .katex-mathml {
      display: none !important;
    }

    .katex {
      font-size: 1.05em;
      text-rendering: auto;
      color: inherit;
    }

    .katex * {
      border-color: currentColor;
    }

    .katex .mfrac .frac-line {
      border-bottom-style: solid !important;
      min-height: 1.2px;
    }

    .katex .mfrac .vlist-t {
      border-collapse: separate !important;
    }

    /* Standalone Document Footer */
    .doc-footer-bar {
      margin-top: 4rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color);
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
      color: var(--text-meta);
      gap: 1rem;
    }

    .footer-meta-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    @media print {
      body { height: auto; overflow: visible; background: #FFF !important; color: #000 !important; }
      .top-header, .toc-sidebar { display: none; }
      .workspace-area { display: block; }
      .content-area { padding: 0; overflow: visible; }
      .document-body { max-width: 100%; }
      .doc-file-section { page-break-after: always; }
      .btn-action { display: none; }
    }
  </style>
</head>
<body class="${initialTheme === 'dark' ? 'dark-mode' : ''}">
  <div class="standalone-container">
    <header class="top-header">
      <div class="top-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l10 6v8l-10 6-10-6V8z"/></svg>
        <span>${title}</span>
      </div>
      <div class="top-actions">
        <button class="btn-action" id="themeToggleBtn" onclick="toggleStandaloneTheme()" title="Toggle Dark/Light Mode">
          ${initialTheme === 'dark' ? '☀️ Light' : '🌙 Dark'}
        </button>
        <button class="btn-action" onclick="toggleAllHeadings()">Toggle All Headings</button>
        <button class="btn-action" onclick="window.print()">Print / PDF</button>
      </div>
    </header>

    <div class="workspace-area">
      <aside class="toc-sidebar">
        <div class="toc-sidebar-header">
          <span>Table of Contents</span>
          <span style="font-size: 0.7rem; font-weight: normal; color: var(--text-meta);">(${files.length} Notes)</span>
        </div>
        ${tocHtml}
      </aside>

      <main class="content-area">
        <article class="document-body" id="exportedDoc">
          ${bodyContent}

          <!-- Exported Document Footer -->
          <footer class="doc-footer-bar">
            <div class="footer-meta-left">
              <span>Compiled with <strong>Obsidian to HTML</strong></span>
              <span>•</span>
              <span>${files.length} ${files.length === 1 ? 'Note' : 'Notes'}</span>
              <span>•</span>
              <span>Pure Standalone Document</span>
            </div>
            <div class="footer-meta-right">
              <span>Zero external runtime dependencies • Offline-ready</span>
            </div>
          </footer>
        </article>
      </main>
    </div>
  </div>

  <script>
    // Theme Toggle Handler
    function toggleStandaloneTheme() {
      const isDark = document.body.classList.toggle('dark-mode');
      const btn = document.getElementById('themeToggleBtn');
      if (btn) btn.textContent = isDark ? '☀️ Light' : '🌙 Dark';
      try { localStorage.setItem('obsidian_standalone_theme', isDark ? 'dark' : 'light'); } catch(e){}
    }

    // Initialize theme from storage
    (function() {
      try {
        const saved = localStorage.getItem('obsidian_standalone_theme');
        if (saved) {
          if (saved === 'dark') {
            document.body.classList.add('dark-mode');
            const btn = document.getElementById('themeToggleBtn');
            if (btn) btn.textContent = '☀️ Light';
          } else {
            document.body.classList.remove('dark-mode');
            const btn = document.getElementById('themeToggleBtn');
            if (btn) btn.textContent = '🌙 Dark';
          }
        }
      } catch(e){}
    })();

    function toggleTocItem(toggleSpan) {
      const nestedUl = toggleSpan.parentElement.nextElementSibling;
      if (nestedUl && nestedUl.classList.contains('toc-nested')) {
        nestedUl.classList.toggle('hidden');
        toggleSpan.classList.toggle('collapsed');
      }
    }

    // Interactive Collapsible Headings Logic
    function setupCollapsibleHeadings(container) {
      const headings = container.querySelectorAll('h1, h2, h3, h4');
      headings.forEach(heading => {
        heading.addEventListener('click', function(e) {
          if (e.target.tagName === 'A' || e.target.classList.contains('obsidian-wikilink')) return;

          const level = parseInt(this.tagName.replace('H', ''), 10);
          this.classList.toggle('heading-collapsed');
          const isCollapsed = this.classList.contains('heading-collapsed');

          let nextEl = this.nextElementSibling;
          while (nextEl) {
            if (/^H[1-4]$/.test(nextEl.tagName)) {
              const nextLevel = parseInt(nextEl.tagName.replace('H', ''), 10);
              if (nextLevel <= level) break;
            }
            
            if (isCollapsed) {
              nextEl.style.display = 'none';
            } else {
              nextEl.style.display = '';
              if (nextEl.classList.contains('heading-collapsed')) {
                const subLevel = parseInt(nextEl.tagName.replace('H', ''), 10);
                let skipEl = nextEl.nextElementSibling;
                while (skipEl) {
                  if (/^H[1-4]$/.test(skipEl.tagName)) {
                    const l = parseInt(skipEl.tagName.replace('H', ''), 10);
                    if (l <= subLevel) break;
                  }
                  skipEl = skipEl.nextElementSibling;
                }
                nextEl = skipEl;
                continue;
              }
            }
            nextEl = nextEl.nextElementSibling;
          }
        });
      });
    }

    let allCollapsed = false;
    function toggleAllHeadings() {
      allCollapsed = !allCollapsed;
      const headings = document.querySelectorAll('#exportedDoc h1, #exportedDoc h2, #exportedDoc h3, #exportedDoc h4');
      headings.forEach(h => {
        const isCurrentCollapsed = h.classList.contains('heading-collapsed');
        if (allCollapsed && !isCurrentCollapsed) {
          h.click();
        } else if (!allCollapsed && isCurrentCollapsed) {
          h.click();
        }
      });
    }

    // Setup Callout toggles
    function setupCallouts(container) {
      const calloutTitles = container.querySelectorAll('.obsidian-callout-title');
      calloutTitles.forEach(t => {
        t.addEventListener('click', () => {
          const callout = t.closest('.obsidian-callout');
          const content = callout.querySelector('.obsidian-callout-content');
          if (content) {
            const isHidden = content.style.display === 'none';
            content.style.display = isHidden ? '' : 'none';
            callout.classList.toggle('is-folded', !isHidden);
          }
        });
      });
    }

    document.addEventListener('DOMContentLoaded', () => {
      const doc = document.getElementById('exportedDoc');
      if (doc) {
        setupCollapsibleHeadings(doc);
        setupCallouts(doc);
      }
    });
  </script>
</body>
</html>`;
}

export function downloadStandaloneFile(
  files: NoteFile[],
  tocNodes: TOCNode[],
  filename: string = 'obsidian_export.html',
  theme: 'light' | 'dark' = 'light'
) {
  const fullHtml = generateStandaloneHTML(files, tocNodes, 'Obsidian Export', theme);
  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
