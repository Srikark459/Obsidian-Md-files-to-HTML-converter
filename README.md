# Obsidian to HTML Converter

A local-first, privacy-focused tool that converts **Obsidian Markdown notes** and entire vault folders into a clean, standalone, collapsible **HTML document** that works completely offline.

---

## ✨ Features

- **Obsidian-Flavored Markdown Support**:
  - **Wikilinks**: Resolves `[[Note Name]]`, `[[Note Name|Custom Alias]]`, and `[[#Heading]]` anchors across multiple notes.
  - **Obsidian Callouts**: Formats `[!NOTE]`, `[!TIP]`, `[!WARNING]`, `[!DANGER]`, `[!QUESTION]`, `[!QUOTE]`, `[!EXAMPLE]`, `[!TODO]`, and `[!SUMMARY]`.
  - **$\LaTeX$ / Math Equations**: Fast rendering of inline (`$E = mc^2$`) and display block (`$$\int_0^\infty ...$$`) formulas via KaTeX with embedded styles.
  - **Extended Syntax**: Text highlights (`==highlight==`), strikethrough (`~~strike~~`), tags (`#tag`), interactive task checkboxes (`- [x]`, `- [ ]`), tables, and blockquotes.
- **Interactive Multi-Level Table of Contents**:
  - Automatically generates an organized sidebar navigation for multiple notes and nested headings (H1–H6).
  - Real-time search/filter input to quickly find sections.
  - Collapsible sub-headings for easy navigation.
- **Collapsible Headings**:
  - Click any heading in the workspace or exported HTML to fold/unfold that section.
  - One-click **"Toggle All Headings"** button to expand or collapse everything at once.
- **Standalone Single-File Export**:
  - Exported `.html` files contain all necessary CSS, JavaScript, and KaTeX styles self-contained in a single file.
  - **Zero external server dependencies**: Double-click to open in Chrome, Safari, Firefox, or Edge completely offline.
- **Theme Support**:
  - Clean light and dark modes with high-contrast typography.
  - Exported standalone documents include a built-in theme toggle (`☀️ Light` / `🌙 Dark`) with state saved in `localStorage`.
- **Privacy & Security**:
  - All processing happens **100% client-side** inside the browser.
  - Your notes are never uploaded to any remote server or third-party database.
- **Print & PDF Ready**:
  - Clean print stylesheet optimized for generating clean PDFs (`window.print()` / `Cmd+P`).

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18.0.0 or higher recommended)
- **npm** or **bun** / **pnpm** / **yarn**

### Installation

1. Clone or extract the project repository:
   ```bash
   git clone <repository-url>
   cd obsidian-to-html
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🛠️ Build for Production

To create an optimized production build:

```bash
npm run build
```

The output will be generated in the `dist/` directory, ready to deploy to any static hosting service (Cloud Run, Vercel, Netlify, GitHub Pages, Cloudflare Pages, etc.).

To preview the production build locally:
```bash
npm run preview
```

---

## 📖 How to Use

1. **Upload Notes**:
   - Drag and drop your `.md` files or an entire folder into the upload zone.
   - Or click **"Select Markdown Files"** / **"Select Entire Folder"**.
   - You can also click **"Load Demonstration Vault"** to test with pre-configured sample notes.
2. **Review in Workspace**:
   - Browse through your compiled notes in the center panel.
   - Use the **Table of Contents** on the left to jump between notes and headings.
   - Click any section heading or use **"Toggle Headings"** to fold/unfold content.
3. **Export Your HTML**:
   - Click **"Export Standalone HTML"** in the top right corner to download the compiled `.html` file.
   - Click **"Copy HTML"** if you want to paste the code directly into another tool or web page.
   - Click the **Printer** icon to save directly as a PDF.

---

## 📁 Project Structure

```
├── index.html                  # HTML entry point with meta tags & KaTeX CDN
├── metadata.json               # Applet metadata
├── package.json                # Project dependencies and npm scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite configuration with Tailwind CSS plugin
└── src/
    ├── main.tsx                # Application bootstrap
    ├── App.tsx                 # Root application state & view routing
    ├── types.ts                # TypeScript interfaces (NoteFile, TOCNode, etc.)
    ├── index.css               # Global styles & Tailwind v4 directives
    ├── components/
    │   ├── Landing.tsx         # File uploader, feature list, demo loader & footer
    │   └── Workspace.tsx       # Live preview workspace, TOC sidebar, status bar
    └── utils/
        ├── parser.ts           # Obsidian syntax parser (wikilinks, callouts, math)
        ├── exporter.ts         # Standalone HTML bundle generator
        └── sampleVault.ts      # Built-in demonstration notes
```

---

## 🧰 Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Markdown Parsing**: [Marked](https://marked.js.org/)
- **Math Rendering**: [KaTeX](https://katex.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
