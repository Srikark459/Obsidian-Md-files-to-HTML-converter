import React, { useRef, useState } from 'react';
import {
  FileText,
  FolderUp,
  Upload,
  Sparkles,
  ArrowRight,
  Calculator,
  ListTree,
  FileCode,
  Layers,
  CheckCircle2,
  Sun,
  Moon,
  ShieldCheck,
  ArrowUp,
  Lock,
} from 'lucide-react';

interface LandingPageProps {
  onFilesSelected: (files: { name: string; content: string }[]) => void;
  onLoadExample: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onFilesSelected,
  onLoadExample,
  theme,
  onToggleTheme,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFileList = async (fileList: FileList | File[]) => {
    const validFiles = Array.from(fileList).filter((f) => {
      const lower = f.name.toLowerCase();
      return (
        lower.endsWith('.md') ||
        lower.endsWith('.markdown') ||
        lower.endsWith('.txt') ||
        lower.endsWith('.text')
      );
    });

    if (validFiles.length === 0) {
      alert('Please select at least one markdown (.md) or text file.');
      return;
    }

    // Sort numerically/alphabetically
    validFiles.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true })
    );

    const readPromises = validFiles.map((file) => {
      return new Promise<{ name: string; content: string }>((resolve) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
          resolve({
            name: file.name.replace(/\.[^/.]+$/, ''),
            content: (evt.target?.result as string) || '',
          });
        };
        reader.readAsText(file);
      });
    });

    const results = await Promise.all(readPromises);
    onFilesSelected(results);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFileList(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFileList(e.dataTransfer.files);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      id="landing-page"
      className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 selection:bg-gray-100 dark:selection:bg-zinc-800 transition-colors duration-200"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        multiple
        accept=".md,.markdown,.text,.txt"
        className="hidden"
        id="fileInput"
      />
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFileInputChange}
        // @ts-expect-error webkitdirectory is standard in all modern browsers
        webkitdirectory=""
        directory=""
        multiple
        className="hidden"
        id="folderInput"
      />

      {/* Dragging Overlay */}
      {isDragging && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-white dark:bg-zinc-900 border-2 border-dashed border-gray-900 dark:border-zinc-100 p-8 rounded-lg shadow-2xl flex flex-col items-center gap-3 text-center">
            <Upload className="w-10 h-10 text-gray-900 dark:text-zinc-100 animate-bounce" />
            <p className="font-semibold text-lg text-gray-900 dark:text-zinc-100">Drop your Obsidian notes or folders here</p>
            <p className="text-sm text-gray-500 dark:text-zinc-400">Supports .md files and entire vaults</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="w-full border-b border-gray-200 dark:border-zinc-800 sticky top-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md z-40">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-semibold text-lg tracking-tight">
            <svg
              className="w-6 h-6 text-gray-900 dark:text-zinc-100"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2l10 6v8l-10 6-10-6V8z" />
            </svg>
            <span>Obsidian &rarr; HTML</span>
          </div>

          <nav className="flex items-center gap-4 sm:gap-6">
            <a
              href="#features"
              className="text-sm text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 transition-colors hidden sm:inline-block"
            >
              Features
            </a>
            <a
              href="#syntax"
              className="text-sm text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 transition-colors hidden sm:inline-block"
            >
              Syntax
            </a>

            {/* Theme Switcher Button */}
            <button
              id="theme-toggle-landing-btn"
              onClick={onToggleTheme}
              className="p-2 rounded-md text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-gray-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            <button
              id="view-example-nav-btn"
              onClick={onLoadExample}
              className="text-sm font-medium text-gray-700 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="hidden md:inline">Demo Vault</span>
            </button>
            <button
              id="header-start-btn"
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-800 dark:hover:bg-white transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>Convert Notes</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 sm:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 text-xs font-medium uppercase tracking-wider text-gray-600 dark:text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Your Notes. One Beautiful Document.
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-gray-950 dark:text-zinc-50 leading-[1.12]">
            From Obsidian to a Single, Stunning HTML
          </h1>

          <p className="text-lg text-gray-600 dark:text-zinc-400 max-w-xl leading-relaxed">
            Convert your Obsidian notes — with wikilinks, callouts, tables, fully collapsible TOC &amp; headings, LaTeX math, and task lists — into one clean, self-contained offline HTML document.
          </p>

          <div className="pt-2 flex flex-wrap gap-3.5 items-center">
            <button
              id="hero-select-files-btn"
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-3 rounded-md font-medium text-sm hover:bg-gray-800 dark:hover:bg-white transition-colors shadow-xs inline-flex items-center gap-2.5 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Select Markdown Files</span>
            </button>

            <button
              id="hero-select-folder-btn"
              onClick={() => folderInputRef.current?.click()}
              className="border border-gray-300 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 px-5 py-3 rounded-md font-medium text-sm hover:bg-gray-50 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white transition-colors inline-flex items-center gap-2 cursor-pointer"
              title="Upload entire Obsidian vault folder"
            >
              <FolderUp className="w-4 h-4 text-gray-500 dark:text-zinc-400" />
              <span>Upload Vault Folder</span>
            </button>

            <button
              id="hero-view-example-btn"
              onClick={onLoadExample}
              className="border border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-zinc-200 bg-gray-50 dark:bg-zinc-900/80 px-4 py-3 rounded-md font-medium text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>View Example</span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-zinc-500 pt-2">
            <span>Supports single files, multi-select, or complete folders</span>
            <span>•</span>
            <span>Drag &amp; drop anywhere</span>
          </div>
        </div>

        {/* Hero Interactive Graphic Preview */}
        <div className="lg:col-span-6 relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative items-stretch">
            {/* Left Panel: Raw Obsidian */}
            <div className="border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg p-5 flex flex-col justify-between shadow-xs min-h-[300px]">
              <div>
                <div className="text-[11px] font-mono text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3 pb-2 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                  <span>source.md</span>
                  <span className="text-[10px] bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-gray-600 dark:text-zinc-400 font-sans">Obsidian Markdown</span>
                </div>
                <div className="font-mono text-xs text-gray-600 dark:text-zinc-400 space-y-2.5 leading-relaxed">
                  <div className="text-gray-900 dark:text-zinc-100 font-semibold"># Quantum Principles</div>
                  <div className="text-indigo-600 dark:text-indigo-400">[[Hardware Roadmap|Transmons]]</div>
                  <div className="bg-blue-50/70 dark:bg-blue-950/40 border-l-2 border-blue-400 dark:border-blue-500 p-2 rounded-r text-blue-900 dark:text-blue-300 text-[11px]">
                    &gt; [!NOTE] Superposition<br />
                    &nbsp;&nbsp;State: |0&rang; + |1&rang;
                  </div>
                  <div className="text-emerald-700 dark:text-emerald-400 font-mono">{'$$\\mathcal{H} = \\hbar \\omega a^\\dagger a$$'}</div>
                  <div className="text-gray-400 dark:text-zinc-500">#physics #quantum</div>
                </div>
              </div>
              <div className="text-[11px] text-gray-400 dark:text-zinc-500 mt-4 pt-2 border-t border-gray-100 dark:border-zinc-800 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5" />
                <span>Raw vault syntax</span>
              </div>
            </div>

            {/* Right Panel: Rendered HTML */}
            <div className="border border-gray-300 dark:border-zinc-700 bg-gray-50/50 dark:bg-zinc-900/60 rounded-lg p-5 flex flex-col justify-between shadow-sm min-h-[300px]">
              <div>
                <div className="text-[11px] font-mono text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3 pb-2 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
                  <span>output.html</span>
                  <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded font-sans font-medium">Rendered HTML</span>
                </div>

                <div className="space-y-3">
                  <div className="text-base font-bold text-gray-900 dark:text-zinc-100 border-b border-gray-200 dark:border-zinc-800 pb-1 flex items-center gap-1.5">
                    <span className="text-gray-400 text-xs">▾</span>
                    <span>Quantum Principles</span>
                  </div>

                  <div>
                    <span className="text-xs bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-b border-dashed border-indigo-400 px-1.5 py-0.5 rounded font-medium">
                      Transmons ↗
                    </span>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/40 border-l-3 border-blue-500 p-2.5 rounded-r text-xs">
                    <div className="font-semibold text-blue-800 dark:text-blue-300 flex items-center gap-1 mb-1">
                      <span>ℹ️</span> Note
                    </div>
                    <div className="text-blue-900 dark:text-blue-200">
                      State: <span className="font-serif italic font-medium">|0⟩ + |1⟩</span>
                    </div>
                  </div>

                  <div className="text-center py-1 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded font-serif text-xs text-gray-800 dark:text-zinc-200 italic">
                    H = ℏω a†a
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-4 pt-2 border-t border-gray-200 dark:border-zinc-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Standalone &amp; Collapsible</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="border-t border-gray-200 dark:border-zinc-800 bg-gray-50/60 dark:bg-zinc-900/40 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-zinc-100">
              Preserves Every Obsidian Nuance
            </h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">
              All personal knowledge management elements compiled cleanly into web standards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-2xs space-y-3">
              <div className="w-9 h-9 rounded-md bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-900 dark:text-zinc-100">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-base text-gray-900 dark:text-zinc-100">Obsidian Syntax</h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                Seamlessly renders wikilinks <code className="text-xs bg-gray-100 dark:bg-zinc-800 px-1 py-0.5 rounded">[[target|title]]</code>, callout blocks, tags, highlights, and footnotes.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-2xs space-y-3">
              <div className="w-9 h-9 rounded-md bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-900 dark:text-zinc-100">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-base text-gray-900 dark:text-zinc-100">LaTeX Rendering</h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                KaTeX formulas pre-compiled directly into HTML strings for both inline <code className="text-xs bg-gray-100 dark:bg-zinc-800 px-1 py-0.5 rounded">$x$</code> and display blocks <code className="text-xs bg-gray-100 dark:bg-zinc-800 px-1 py-0.5 rounded">$$E=mc^2$$</code>.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-2xs space-y-3">
              <div className="w-9 h-9 rounded-md bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-900 dark:text-zinc-100">
                <ListTree className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-base text-gray-900 dark:text-zinc-100">Nested Collapsible TOC</h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                Deep hierarchical table of contents with toggleable subtrees, search filtering, and synchronized heading anchors.
              </p>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-2xs space-y-3">
              <div className="w-9 h-9 rounded-md bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-900 dark:text-zinc-100">
                <FileCode className="w-5 h-5" />
              </div>
              <h3 className="font-medium text-base text-gray-900 dark:text-zinc-100">Single Offline File</h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                Export one standalone <code className="text-xs bg-gray-100 dark:bg-zinc-800 px-1 py-0.5 rounded">.html</code> file with all styles and scripts baked in. Opens anywhere without an active internet connection.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Syntax Showcase Section */}
      <section id="syntax" className="py-16 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">Supported Callout Varieties</h3>
              <p className="text-sm text-gray-500 dark:text-zinc-400">Full compatibility with Obsidian's standard callout specification.</p>
            </div>
            <button
              onClick={onLoadExample}
              className="text-xs font-medium text-gray-900 dark:text-zinc-200 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <span>Explore live in workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="p-3 rounded border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-300">
              <span className="font-semibold block mb-0.5">ℹ️ [!note]</span>
              <span>General notes &amp; references</span>
            </div>
            <div className="p-3 rounded border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300">
              <span className="font-semibold block mb-0.5">💡 [!tip]</span>
              <span>Helpful hints &amp; shortcuts</span>
            </div>
            <div className="p-3 rounded border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300">
              <span className="font-semibold block mb-0.5">⚠️ [!warning]</span>
              <span>Crucial warnings &amp; limits</span>
            </div>
            <div className="p-3 rounded border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/30 text-red-900 dark:text-red-300">
              <span className="font-semibold block mb-0.5">🛑 [!danger]</span>
              <span>Critical error callouts</span>
            </div>
            <div className="p-3 rounded border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-300">
              <span className="font-semibold block mb-0.5">❓ [!question]</span>
              <span>FAQs &amp; inquiries</span>
            </div>
            <div className="p-3 rounded border border-teal-200 dark:border-teal-900/60 bg-teal-50/50 dark:bg-teal-950/30 text-teal-900 dark:text-teal-300">
              <span className="font-semibold block mb-0.5">☑️ [!todo]</span>
              <span>Action items &amp; checklists</span>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Proper Footer */}
      <footer className="border-t border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-900/50 pt-16 pb-12 transition-colors">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-200 dark:border-zinc-800">
            {/* Brand & Purpose Column (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5 font-semibold text-base text-gray-900 dark:text-zinc-100">
                <svg
                  className="w-5 h-5 text-gray-900 dark:text-zinc-100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2l10 6v8l-10 6-10-6V8z" />
                </svg>
                <span>Obsidian to HTML Converter</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed max-w-sm">
                Transform complex Obsidian vaults into standalone, beautiful offline HTML files. Includes collapsible headings, nested TOCs, wikilinks, and formula rendering with zero external server dependencies.
              </p>
              
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>100% Client-Side • Zero Network Telemetry</span>
              </div>
            </div>

            {/* Supported Obsidian Features */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-zinc-200">
                Supported Features
              </h4>
              <ul className="space-y-2 text-xs text-gray-600 dark:text-zinc-400">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Wikilinks &amp; Aliases</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>LaTeX Math (KaTeX v0.18.7)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>12+ Obsidian Callouts</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Interactive Headings Fold</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>GFM Task Lists &amp; Tables</span>
                </li>
              </ul>
            </div>

            {/* Privacy & Architecture */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-zinc-200">
                Privacy &amp; System
              </h4>
              <ul className="space-y-2 text-xs text-gray-600 dark:text-zinc-400">
                <li className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>No Cloud File Uploads</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Self-Contained HTML</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Print &amp; PDF Styling</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span>Instant Client Compilation</span>
                </li>
              </ul>
            </div>

            {/* Actions & Theme Controls */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-900 dark:text-zinc-200">
                Quick Actions
              </h4>
              <div className="flex flex-col gap-2 text-xs">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-left text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                >
                  Select Markdown Files
                </button>
                <button
                  onClick={() => folderInputRef.current?.click()}
                  className="text-left text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
                >
                  Upload Entire Vault
                </button>
                <button
                  onClick={onLoadExample}
                  className="text-left text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors cursor-pointer font-medium"
                >
                  Load 3-Note Demo Vault
                </button>
                <button
                  onClick={onToggleTheme}
                  className="text-left text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 flex items-center gap-1.5 pt-1 cursor-pointer"
                >
                  {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                  <span>Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode</span>
                </button>
                <button
                  onClick={scrollToTop}
                  className="text-left text-gray-400 hover:text-gray-700 dark:hover:text-zinc-300 flex items-center gap-1 pt-2 cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>Back to top</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Status Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-zinc-500">
            <div className="flex items-center gap-2">
              <span>© {new Date().getFullYear()} Obsidian to HTML Converter.</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Pure HTML with zero runtime dependencies.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Client Engine v1.2.0</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
