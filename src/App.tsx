import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { Workspace } from './components/Workspace';
import { NoteFile, TOCNode } from './types';
import { parseNote, buildTOC } from './utils/markdownParser';
import { SAMPLE_VAULT_FILES } from './data/sampleVault';

export default function App() {
  const [view, setView] = useState<'landing' | 'workspace'>('landing');
  const [files, setFiles] = useState<NoteFile[]>([]);
  const [tocNodes, setTocNodes] = useState<TOCNode[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('obsidian_converter_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    localStorage.setItem('obsidian_converter_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleFilesLoaded = (rawFiles: { name: string; content: string }[]) => {
    if (rawFiles.length === 0) return;

    const parsedFiles = rawFiles.map((rf) => parseNote(rf.name, rf.content));
    const toc = buildTOC(parsedFiles);

    setFiles(parsedFiles);
    setTocNodes(toc);
    setView('workspace');
  };

  const handleLoadExample = () => {
    handleFilesLoaded(SAMPLE_VAULT_FILES);
  };

  const handleBackToHome = () => {
    setView('landing');
  };

  return (
    <div className="w-full min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 transition-colors duration-200">
      {view === 'landing' ? (
        <LandingPage
          onFilesSelected={handleFilesLoaded}
          onLoadExample={handleLoadExample}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      ) : (
        <Workspace
          files={files}
          tocNodes={tocNodes}
          onBackToHome={handleBackToHome}
          onOpenSample={handleLoadExample}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}
    </div>
  );
}
