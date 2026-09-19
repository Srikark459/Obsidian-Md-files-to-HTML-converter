import { marked } from 'marked';
import katex from 'katex';
import { NoteFile, HeadingItem, TOCNode } from '../types';

marked.setOptions({
  gfm: true,
  breaks: true,
});

export const CALLOUT_CONFIGS: Record<
  string,
  { label: string; colorClass: string; icon: string }
> = {
  note: {
    label: 'Note',
    colorClass: 'callout-note',
    icon: 'ℹ️',
  },
  info: {
    label: 'Info',
    colorClass: 'callout-note',
    icon: 'ℹ️',
  },
  tip: {
    label: 'Tip',
    colorClass: 'callout-tip',
    icon: '💡',
  },
  hint: {
    label: 'Hint',
    colorClass: 'callout-tip',
    icon: '💡',
  },
  important: {
    label: 'Important',
    colorClass: 'callout-warning',
    icon: '⚠️',
  },
  warning: {
    label: 'Warning',
    colorClass: 'callout-warning',
    icon: '⚠️',
  },
  caution: {
    label: 'Caution',
    colorClass: 'callout-warning',
    icon: '⚠️',
  },
  danger: {
    label: 'Danger',
    colorClass: 'callout-danger',
    icon: '🛑',
  },
  error: {
    label: 'Error',
    colorClass: 'callout-danger',
    icon: '🛑',
  },
  bug: {
    label: 'Bug',
    colorClass: 'callout-danger',
    icon: '🐛',
  },
  success: {
    label: 'Success',
    colorClass: 'callout-success',
    icon: '✅',
  },
  check: {
    label: 'Check',
    colorClass: 'callout-success',
    icon: '✅',
  },
  done: {
    label: 'Done',
    colorClass: 'callout-success',
    icon: '✅',
  },
  question: {
    label: 'Question',
    colorClass: 'callout-question',
    icon: '❓',
  },
  help: {
    label: 'Help',
    colorClass: 'callout-question',
    icon: '❓',
  },
  faq: {
    label: 'FAQ',
    colorClass: 'callout-question',
    icon: '❓',
  },
  quote: {
    label: 'Quote',
    colorClass: 'callout-quote',
    icon: '💬',
  },
  cite: {
    label: 'Cite',
    colorClass: 'callout-quote',
    icon: '💬',
  },
  example: {
    label: 'Example',
    colorClass: 'callout-example',
    icon: '🧪',
  },
  summary: {
    label: 'Summary',
    colorClass: 'callout-summary',
    icon: '📋',
  },
  abstract: {
    label: 'Abstract',
    colorClass: 'callout-summary',
    icon: '📋',
  },
  todo: {
    label: 'Todo',
    colorClass: 'callout-todo',
    icon: '☑️',
  },
};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function preprocessMarkdown(
  mdText: string,
  mathStash: { type: 'inline' | 'display'; latex: string }[]
): string {
  // 0. Strip YAML Frontmatter
  let text = mdText.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '');

  // 1. Remove Backlinks section
  text = text.replace(/(?:\n|^)#+\s+Backlinks\s*(?:\n|$)[\s\S]*$/i, '');

  // 2. Protect LaTeX Equations
  // Display math ($$...$$)
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_match, equation) => {
    mathStash.push({ type: 'display', latex: equation.trim() });
    return `KATEXMATHDISPTOKEN${mathStash.length - 1}END`;
  });

  // Inline math ($...$) - negative lookahead/lookbehind for digits/currencies or line breaks
  text = text.replace(/\$((?:\\.|[^$\n])*?)\$/g, (_match, equation) => {
    if (!equation.trim()) return '$';
    mathStash.push({ type: 'inline', latex: equation.trim() });
    return `KATEXMATHINLINETOKEN${mathStash.length - 1}END`;
  });

  // 3. Wikilinks with support for:
  // [[Note]] -> [Note](#file-slug)
  // [[Note|Alias]] -> [Alias](#file-slug)
  // [[Note#Section]] -> [Note > Section](#file-slug-h-section)
  // [[Note#Section|Alias]] -> [Alias](#file-slug-h-section)
  text = text.replace(
    /\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g,
    (_match, target, heading, alias) => {
      const cleanTarget = target.trim();
      const targetSlug = slugify(cleanTarget);
      let href = `#file-${targetSlug}`;
      let defaultLabel = cleanTarget;

      if (heading) {
        const cleanHeading = heading.trim();
        href += `-h-${slugify(cleanHeading)}`;
        defaultLabel += ` > ${cleanHeading}`;
      }

      const display = alias ? alias.trim() : defaultLabel;
      return `<a href="${href}" class="obsidian-wikilink" data-target="${targetSlug}">${display}</a>`;
    }
  );

  // 4. Strikethrough ~~text~~
  text = text.replace(/~~(.*?)~~/g, '<del>$1</del>');

  // 5. Highlights ==text==
  text = text.replace(/==(.*?)==/g, '<mark>$1</mark>');

  // 6. Obsidian Tags #tag (avoiding headings by checking start of line or space before)
  text = text.replace(/(^|\s)#([a-zA-Z0-9_\-\/]+)(?=\s|$|[.,;:?!])/g, '$1<span class="obsidian-tag">#$2</span>');

  return text;
}

export function parseNote(name: string, rawContent: string): NoteFile {
  const fileSlug = slugify(name);
  const fileId = `file-${fileSlug}`;
  const mathStash: { type: 'inline' | 'display'; latex: string }[] = [];

  const preprocessed = preprocessMarkdown(rawContent, mathStash);
  let parsedHtml = marked.parse(preprocessed) as string;

  // Restore Math via KaTeX renderToString
  parsedHtml = parsedHtml.replace(
    /KATEXMATHDISPTOKEN(\d+)END/g,
    (_match, idxStr) => {
      const index = parseInt(idxStr, 10);
      const item = mathStash[index];
      if (!item) return '';
      try {
        return `<div class="katex-display-block">${katex.renderToString(item.latex, {
          displayMode: true,
          throwOnError: false,
          output: 'html',
          minRuleThickness: 0.05,
          strict: false,
        })}</div>`;
      } catch {
        return `<div class="katex-error">$$${item.latex}$$</div>`;
      }
    }
  );

  parsedHtml = parsedHtml.replace(
    /KATEXMATHINLINETOKEN(\d+)END/g,
    (_match, idxStr) => {
      const index = parseInt(idxStr, 10);
      const item = mathStash[index];
      if (!item) return '';
      try {
        return `<span class="katex-inline">${katex.renderToString(item.latex, {
          displayMode: false,
          throwOnError: false,
          output: 'html',
          minRuleThickness: 0.05,
          strict: false,
        })}</span>`;
      } catch {
        return `<code>$${item.latex}$</code>`;
      }
    }
  );

  // Post-process DOM for headings, callouts, and task lists
  const container = document.createElement('div');
  container.innerHTML = parsedHtml;

  const headings: HeadingItem[] = [];

  // Identify Headings & assign IDs
  const headingElements = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headingElements.forEach((h, index) => {
    const level = parseInt(h.tagName.charAt(1), 10);
    const text = (h.textContent || '').trim();
    const headingSlug = slugify(text) || `h-${index}`;
    const headingId = `${fileId}-h-${headingSlug}`;

    h.setAttribute('id', headingId);
    h.setAttribute('data-level', String(level));
    h.classList.add('doc-heading', `doc-heading-${level}`);

    headings.push({
      id: headingId,
      level,
      text,
      fileId,
    });
  });

  // Transform Obsidian Callouts in blockquotes
  const blockquotes = container.querySelectorAll('blockquote');
  blockquotes.forEach((bq) => {
    const firstP = bq.firstElementChild;
    if (firstP && firstP.tagName === 'P') {
      const rawText = firstP.innerHTML.trim();
      const calloutMatch = rawText.match(/^\[!([a-zA-Z0-9_-]+)\]([+-]?)(.*)$/);

      if (calloutMatch) {
        const type = calloutMatch[1].toLowerCase().trim();
        const foldChar = calloutMatch[2]; // '+' or '-' fold
        const customTitle = calloutMatch[3].trim();

        const config = CALLOUT_CONFIGS[type] || {
          label: type.charAt(0).toUpperCase() + type.slice(1),
          colorClass: 'callout-note',
          icon: '📌',
        };

        const titleText = customTitle || config.label;

        const calloutDiv = document.createElement('div');
        calloutDiv.className = `obsidian-callout ${config.colorClass}`;
        calloutDiv.setAttribute('data-callout-type', type);

        const titleDiv = document.createElement('div');
        titleDiv.className = 'obsidian-callout-title';
        titleDiv.innerHTML = `
          <span class="callout-icon">${config.icon}</span>
          <span class="callout-title-text">${titleText}</span>
          ${
            foldChar
              ? '<span class="callout-fold-toggle" aria-label="Toggle fold">▾</span>'
              : ''
          }
        `;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'obsidian-callout-content';

        // Remove the [!callout] line from firstP
        const childNodes = Array.from(bq.childNodes);
        // Remove firstP's callout token or replace
        firstP.remove();

        while (bq.firstChild) {
          contentDiv.appendChild(bq.firstChild);
        }

        calloutDiv.appendChild(titleDiv);
        calloutDiv.appendChild(contentDiv);

        if (foldChar === '-') {
          calloutDiv.classList.add('is-folded');
          contentDiv.style.display = 'none';
        }

        bq.parentNode?.replaceChild(calloutDiv, bq);
      }
    }
  });

  // Fix Task List Checkboxes
  const listItems = container.querySelectorAll('li');
  listItems.forEach((li) => {
    const checkbox = li.querySelector('input[type="checkbox"]');
    if (checkbox) {
      li.classList.add('task-list-item');
    }
  });

  return {
    id: fileId,
    name,
    rawContent,
    processedHtml: container.innerHTML,
    headings,
  };
}

export function buildTOC(files: NoteFile[]): TOCNode[] {
  return files.map((file) => {
    const rootNode: TOCNode = {
      id: file.id,
      fileId: file.id,
      title: file.name,
      level: 0,
      children: [],
      isExpanded: true,
    };

    const stack: TOCNode[] = [rootNode];

    file.headings.forEach((h) => {
      const node: TOCNode = {
        id: h.id,
        fileId: file.id,
        title: h.text,
        level: h.level,
        children: [],
        isExpanded: true,
      };

      while (stack.length > 1 && stack[stack.length - 1].level >= h.level) {
        stack.pop();
      }

      stack[stack.length - 1].children.push(node);
      stack.push(node);
    });

    return rootNode;
  });
}
