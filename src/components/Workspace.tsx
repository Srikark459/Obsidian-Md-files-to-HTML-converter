import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowLeft,
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Search,
  FileText,
  ChevronsUpDown,
  Printer,
  Sparkles,
  Layers,
  Sun,
  Moon,
} from 'lucide-react';
import { NoteFile, TOCNode } from '../types';
import { downloadStandaloneFile } from '../utils/exporter';

interface WorkspaceProps {
  files: NoteFile[];
  tocNodes: TOCNode[];
  onBackToHome: () => void;
  onOpenSample: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({
  files,
  tocNodes,
  onBackToHome,
  onOpenSample,
  theme = 'light',
  onToggleTheme,
}) => {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTOCItems, setExpandedTOCItems] = useState<Record<string, boolean>>({});
  const [collapsedHeadings, setCollapsedHeadings] = useState<Record<string, boolean>>({});
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const contentRef = useRef<HTMLDivElement>(null);

  const totalWords = useMemo(() => {
    return files.reduce((acc, f) => {
      const textOnly = (f.rawContent || '').replace(/[#*`_\[\]()$]/g, ' ');
      const words = textOnly.trim().split(/\s+/).filter(Boolean).length;
      return acc + words;
    }, 0);
  }, [files]);

  // Initialize expanded state for TOC
  useEffect(() => {
    const initialExpanded: Record<string, boolean> = {};
    const traverse = (nodes: TOCNode[]) => {
      nodes.forEach((node) => {
        initialExpanded[node.id] = true;
        if (node.children) traverse(node.children);
      });
    };
    traverse(tocNodes);
    setExpandedTOCItems(initialExpanded);
  }, [tocNodes]);

  // Handle collapsible headings in document body
  const toggleHeadingCollapse = (headingId: string, level: number) => {
    setCollapsedHeadings((prev) => {
      const willCollapse = !prev[headingId];
      const nextState = { ...prev, [headingId]: willCollapse };

      // Update DOM visibility of subsequent siblings until equal or higher level
      if (contentRef.current) {
        const headingEl = contentRef.current.querySelector(`#${headingId}`);
        if (headingEl) {
          let nextEl = headingEl.nextElementSibling as HTMLElement | null;
          while (nextEl) {
            const tagMatch = nextEl.tagName.match(/^H([1-6])$/i);
            if (tagMatch) {
              const nextLevel = parseInt(tagMatch[1], 10);
              if (nextLevel <= level) break;
            }

            if (willCollapse) {
              nextEl.style.display = 'none';
            } else {
              nextEl.style.display = '';
              // If this element itself is a collapsed heading, skip its children
              const subId = nextEl.getAttribute('id');
              if (subId && nextState[subId]) {
                const subMatch = nextEl.tagName.match(/^H([1-6])$/i);
                const subLevel = subMatch ? parseInt(subMatch[1], 10) : 6;
                let skipEl = nextEl.nextElementSibling as HTMLElement | null;
                while (skipEl) {
                  const skipMatch = skipEl.tagName.match(/^H([1-6])$/i);
                  if (skipMatch && parseInt(skipMatch[1], 10) <= subLevel) break;
                  skipEl = skipEl.nextElementSibling as HTMLElement | null;
                }
                nextEl = skipEl;
                continue;
              }
            }
            nextEl = nextEl.nextElementSibling as HTMLElement | null;
          }
        }
      }

      return nextState;
    });
  };

  // Toggle all headings collapsed/expanded
  const handleToggleAllHeadings = () => {
    const allHeadings = files.flatMap((f) => f.headings);
    const hasAnyOpen = allHeadings.some((h) => !collapsedHeadings[h.id]);

    const newMap: Record<string, boolean> = {};
    allHeadings.forEach((h) => {
      newMap[h.id] = hasAnyOpen;
    });

    setCollapsedHeadings(newMap);

    // Apply directly to DOM
    if (contentRef.current) {
      allHeadings.forEach((h) => {
        const headingEl = contentRef.current?.querySelector(`#${h.id}`);
        if (headingEl) {
          let nextEl = headingEl.nextElementSibling as HTMLElement | null;
          while (nextEl) {
            const tagMatch = nextEl.tagName.match(/^H([1-6])$/i);
            if (tagMatch && parseInt(tagMatch[1], 10) <= h.level) break;
            nextEl.style.display = hasAnyOpen ? 'none' : '';
            nextEl = nextEl.nextElementSibling as HTMLElement | null;
          }
        }
      });
    }
  };

  // Attach event listeners for interactive document items (callouts, checkboxes, code copy, headings)
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    // 1. Heading Click Listener
    const headings = container.querySelectorAll('.doc-heading');
    const headingClickHandlers: { el: Element; handler: (e: Event) => void }[] = [];

    headings.forEach((h) => {
      const headingId = h.getAttribute('id');
      const level = parseInt(h.getAttribute('data-level') || '1', 10);
      if (headingId) {
        const handler = (e: Event) => {
          const target = e.target as HTMLElement;
          if (target.tagName === 'A' || target.closest('a')) return;
          toggleHeadingCollapse(headingId, level);
        };
        h.addEventListener('click', handler);
        headingClickHandlers.push({ el: h, handler });
      }
    });

    // 2. Callout Fold Toggle
    const calloutTitles = container.querySelectorAll('.obsidian-callout-title');
    const calloutHandlers: { el: Element; handler: () => void }[] = [];

    calloutTitles.forEach((titleEl) => {
      const handler = () => {
        const callout = titleEl.closest('.obsidian-callout');
        const content = callout?.querySelector('.obsidian-callout-content') as HTMLElement;
        if (content && callout) {
          const isFolded = content.style.display === 'none';
          content.style.display = isFolded ? '' : 'none';
          callout.classList.toggle('is-folded', !isFolded);
        }
      };
      titleEl.addEventListener('click', handler);
      calloutHandlers.push({ el: titleEl, handler });
    });

    // 3. Task List Interactive Checkboxes
    const checkboxes = container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
    checkboxes.forEach((cb) => {
      cb.removeAttribute('disabled');
      cb.addEventListener('change', () => {
        const parentLi = cb.closest('li');
        if (parentLi) {
          parentLi.style.textDecoration = cb.checked ? 'line-through' : 'none';
          parentLi.style.opacity = cb.checked ? '0.6' : '1';
        }
      });
    });

    // 4. Wikilinks Smooth Jump
    const wikilinks = container.querySelectorAll<HTMLAnchorElement>('.obsidian-wikilink');
    wikilinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
          e.preventDefault();
          const targetEl = container.querySelector(href);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            targetEl.classList.add('highlight-target');
            setTimeout(() => targetEl.classList.remove('highlight-target'), 1500);
          }
        }
      });
    });

    return () => {
      headingClickHandlers.forEach(({ el, handler }) =>
        el.removeEventListener('click', handler)
      );
      calloutHandlers.forEach(({ el, handler }) =>
        el.removeEventListener('click', handler)
      );
    };
  }, [files]);

  const toggleTOCNode = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTOCItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleJumpTo = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveHeadingId(id);

    const targetEl = contentRef.current?.querySelector(`#${id}`);
    if (targetEl) {
      // If it was collapsed, expand its parent
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      targetEl.classList.add('highlight-target');
      setTimeout(() => targetEl.classList.remove('highlight-target'), 1500);
    }
  };

  const handleCopyHTML = async () => {
    if (contentRef.current) {
      try {
        await navigator.clipboard.writeText(contentRef.current.innerHTML);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // fallback
      }
    }
  };

  const handleExport = () => {
    const exportName =
      files.length === 1
        ? `${files[0].name.toLowerCase().replace(/[^\w]/g, '_')}.html`
        : 'obsidian_vault_export.html';
    downloadStandaloneFile(files, tocNodes, exportName, theme);
  };

  // Filter TOC based on search query
  const filterTOCNode = (node: TOCNode, query: string): TOCNode | null => {
    const matchesSelf = node.title.toLowerCase().includes(query.toLowerCase());
    const filteredChildren = node.children
      .map((child) => filterTOCNode(child, query))
      .filter((c): c is TOCNode => c !== null);

    if (matchesSelf || filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren,
      };
    }
    return null;
  };

  const filteredTOC = useMemo(() => {
    if (!searchQuery.trim()) return tocNodes;
    return tocNodes
      .map((n) => filterTOCNode(n, searchQuery))
      .filter((n): n is TOCNode => n !== null);
  }, [tocNodes, searchQuery]);

  const totalHeadings = files.reduce((acc, f) => acc + f.headings.length, 0);

  const renderTOCItem = (node: TOCNode) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedTOCItems[node.id] !== false;
    const isFileRoot = node.level === 0;
    const isActive = activeHeadingId === node.id;

    return (
      <li key={node.id} className="text-xs my-0.5">
        <div
          className={`flex items-center gap-1 py-1 px-1.5 rounded transition-colors ${
            isActive
              ? 'bg-gray-200 dark:bg-zinc-800 text-gray-950 dark:text-zinc-100 font-semibold'
              : 'hover:bg-gray-100 dark:hover:bg-zinc-800/60 text-gray-700 dark:text-zinc-300'
          }`}
        >
          {hasChildren ? (
            <button
              onClick={(e) => toggleTOCNode(node.id, e)}
              className="w-4 h-4 flex items-center justify-center text-gray-400 dark:text-zinc-500 hover:text-gray-700 dark:hover:text-zinc-300 shrink-0 cursor-pointer"
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          ) : (
            <span className="w-4 h-4 shrink-0" />
          )}

          {isFileRoot && <FileText className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500 shrink-0" />}

          <a
            href={`#${node.id}`}
            onClick={(e) => handleJumpTo(node.id, e)}
            className={`truncate flex-1 hover:underline ${
              isFileRoot
                ? 'font-medium text-gray-900 dark:text-zinc-100'
                : 'text-gray-600 dark:text-zinc-400'
            }`}
            title={node.title}
          >
            {node.title}
          </a>
        </div>

        {hasChildren && isExpanded && (
          <ul className="pl-3 border-l border-gray-200 dark:border-zinc-800 ml-2 mt-0.5 space-y-0.5">
            {node.children.map((child) => renderTOCItem(child))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div id="app-workspace" className="h-screen flex flex-col bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 overflow-hidden">
      {/* Workspace Header */}
      <header className="h-14 border-b border-gray-200 dark:border-zinc-800 px-4 sm:px-6 flex items-center justify-between bg-white dark:bg-zinc-950 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            id="workspace-home-btn"
            onClick={onBackToHome}
            className="p-1.5 text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title="Back to converter home"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </button>

          <div className="h-4 w-px bg-gray-200 dark:bg-zinc-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-gray-900 dark:text-zinc-100 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2l10 6v8l-10 6-10-6V8z" />
            </svg>
            <span className="font-medium text-sm text-gray-900 dark:text-zinc-100 truncate">
              {files.length === 1 ? files[0].name : `${files.length} Notes Compiled`}
            </span>
            <span className="text-[11px] bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 px-2 py-0.5 rounded-full font-mono hidden md:inline">
              {totalHeadings} headings
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleAllHeadings}
            className="text-xs text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 px-2.5 py-1.5 rounded-md hidden md:inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            title="Collapse or Expand all document headings"
          >
            <ChevronsUpDown className="w-3.5 h-3.5" />
            <span>Fold All</span>
          </button>

          <button
            onClick={() => window.print()}
            className="text-xs text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 p-1.5 rounded-md hidden lg:inline-flex items-center gap-1 cursor-pointer transition-colors"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          {onToggleTheme && (
            <button
              id="workspace-theme-toggle"
              onClick={onToggleTheme}
              className="text-xs text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 p-1.5 sm:px-2.5 sm:py-1.5 rounded-md inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-gray-600 dark:text-zinc-400" />
              )}
              <span className="hidden sm:inline capitalize">{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          )}

          <button
            id="workspace-copy-html-btn"
            onClick={handleCopyHTML}
            className="text-xs text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 px-3 py-1.5 rounded-md inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copy rendered HTML to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-emerald-700 dark:text-emerald-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy HTML</span>
              </>
            )}
          </button>

          <button
            id="workspace-export-html-btn"
            onClick={handleExport}
            className="bg-gray-900 dark:bg-zinc-100 hover:bg-gray-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-medium px-3.5 py-1.5 rounded-md inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Download standalone HTML with styles and scripts"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export HTML</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Area: TOC Sidebar + Document Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* TOC Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-72 sm:w-80' : 'w-0'
          } border-r border-gray-200 dark:border-zinc-800 bg-gray-50/80 dark:bg-zinc-900/80 flex flex-col shrink-0 transition-all duration-200 overflow-hidden z-10`}
        >
          {/* TOC Header with Search */}
          <div className="p-3 border-b border-gray-200 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-700 dark:text-zinc-300 uppercase tracking-wider text-[10px]">
                Table of Contents
              </span>
              <span className="text-gray-400 dark:text-zinc-500 text-[11px]">
                {filteredTOC.length} {filteredTOC.length === 1 ? 'file' : 'files'}
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Filter headings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded pl-8 pr-2 py-1 text-xs text-gray-800 dark:text-zinc-200 placeholder-gray-400 dark:placeholder-zinc-500 focus:outline-none focus:border-gray-400 dark:focus:border-zinc-600"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* TOC Items List */}
          <div className="flex-1 overflow-y-auto p-3">
            {filteredTOC.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400 dark:text-zinc-500">
                No matching headings found.
              </div>
            ) : (
              <ul className="space-y-0.5">
                {filteredTOC.map((node) => renderTOCItem(node))}
              </ul>
            )}
          </div>
        </aside>

        {/* Sidebar Toggle Handle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-4 bg-gray-100 dark:bg-zinc-900 hover:bg-gray-200 dark:hover:bg-zinc-800 border-r border-gray-200 dark:border-zinc-800 flex items-center justify-center text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 text-xs shrink-0 cursor-pointer transition-colors"
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? '‹' : '›'}
        </button>

        {/* Main Document Scrollable View */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-12 lg:p-16 scroll-smooth bg-white dark:bg-zinc-950">
          <div className="max-w-3xl mx-auto pb-24" ref={contentRef}>
            {files.map((file, idx) => (
              <section key={file.id} id={file.id} className="doc-section mb-16">
                {/* Note Header Title */}
                <div className="mb-6 pb-2 border-b border-gray-200 dark:border-zinc-800">
                  <div className="text-xs uppercase tracking-wider text-gray-400 dark:text-zinc-500 font-mono mb-1">
                    Note {idx + 1} of {files.length}
                  </div>
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100" id={`${file.id}-title`}>
                    {file.name}
                  </h1>
                </div>

                {/* Parsed Note HTML Body */}
                <div
                  className="doc-body-wrapper prose dark:prose-invert prose-slate max-w-none text-gray-800 dark:text-zinc-200 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: file.processedHtml }}
                />

                {idx < files.length - 1 && (
                  <hr className="my-14 border-0 border-t border-gray-200 dark:border-zinc-800" />
                )}
              </section>
            ))}
          </div>
        </main>
      </div>

      {/* Workspace Bottom Status Bar / Footer */}
      <footer className="h-9 border-t border-gray-200 dark:border-zinc-800 px-4 sm:px-6 flex items-center justify-between bg-gray-50/95 dark:bg-zinc-900/95 text-[11px] text-gray-500 dark:text-zinc-400 shrink-0 select-none z-20">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-zinc-300">
            <FileText className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
            <span>{files.length} {files.length === 1 ? 'Note' : 'Notes'}</span>
          </span>
          <span className="text-gray-300 dark:text-zinc-700">|</span>
          <span>{totalHeadings} headings</span>
          <span className="text-gray-300 dark:text-zinc-700 hidden sm:inline">|</span>
          <span className="hidden sm:inline">~{totalWords.toLocaleString()} words ({Math.max(1, Math.round(totalWords / 220))} min read)</span>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden md:flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Pure Standalone Output</span>
          </div>
          <span className="text-gray-300 dark:text-zinc-700 hidden md:inline">|</span>
          <button
            onClick={handleToggleAllHeadings}
            className="hover:text-gray-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            title="Fold / Unfold all headings"
          >
            Toggle Headings
          </button>
          {onToggleTheme && (
            <>
              <span className="text-gray-300 dark:text-zinc-700">|</span>
              <button
                onClick={onToggleTheme}
                className="hover:text-gray-900 dark:hover:text-zinc-200 flex items-center gap-1 transition-colors cursor-pointer"
                title="Toggle Dark/Light Mode"
              >
                {theme === 'dark' ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-gray-500" />}
                <span className="capitalize">{theme}</span>
              </button>
            </>
          )}
        </div>
      </footer>
    </div>
  );
};
