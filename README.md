# NoteForge — Obsidian Markdown to HTML

NoteForge is a browser-based converter for turning one or more Obsidian-flavoured Markdown notes into a clean, navigable HTML document.

It is intentionally simple: download one HTML file, open it in a modern browser, select notes, and export the rendered document.

## Features

- Combine multiple `.md`, `.markdown`, or `.txt` files into one document.
- Automatic nested table of contents.
- Collapsible document headings and navigation sections.
- Obsidian-style wikilinks, including aliases: `[[Note name|Shown label]]`.
- Obsidian callouts such as `> [!NOTE]`, `WARNING`, `TIP`, `SUCCESS`, and `DANGER`.
- GitHub-flavoured Markdown basics: headings, lists, task lists, tables, blockquotes, code blocks, links, strikethrough, and highlights.
- LaTeX-style inline and display math rendered with KaTeX.
- One-click export of the rendered document as HTML.
- Drag-and-drop import and a built-in example.

## Quick start

1. Download or clone this repository.
2. Open `obsidian-markdown-to-html.html` in a current desktop browser.
3. Choose one or more Markdown files, or click **View Example** first.
4. Review the rendered document.
5. Click **Export Standalone HTML** to download the result.

No build step, web server, account, or installation is required.

## Supported Markdown examples

### Wikilinks

```md
[[Project overview]]
[[Project overview|Read the overview]]
```

The linked note must be included in the same import. Matching is based on the note filename without its extension.

### Callouts

```md
> [!NOTE] Useful information
> This is displayed as a blue callout.

> [!WARNING] Check this first
> This becomes a yellow warning callout.
```

### Math

```md
Inline: $E = mc^2$

Display:
$$
\int_a^b f(x)\,dx
$$
```

### Highlight and task list

```md
==This is highlighted==

- [x] Completed task
- [ ] Remaining task
```

## Security and privacy

Markdown is processed in the browser. Note files are not uploaded or sent to an application server.

The converter applies several safeguards when opening untrusted notes:

- Raw HTML in Markdown is rendered as text instead of executing.
- Unsafe link protocols, including `javascript:`, are removed.
- Imported images, iframes, embeds, SVGs, and objects are removed to avoid active content and tracking requests.
- A Content Security Policy restricts scripts, network connections, forms, plugins, and embedded content.
- Markdown and KaTeX dependencies are version-pinned and protected with Subresource Integrity hashes.
- Imports are limited to 50 files and 10 MB per file.

The converter itself loads its Markdown and math libraries from jsDelivr, so an internet connection is required when using the converter. Exported documents retain the KaTeX stylesheet URL for correctly styled mathematics.

## Limitations

- This is a client-side converter, not a full Obsidian renderer.
- Obsidian embeds, Dataview, Canvas, plugins, attachments, and custom HTML are not supported.
- Images are deliberately omitted for privacy and security.
- The export is portable, but it is not fully offline when it contains KaTeX output because its stylesheet is loaded from jsDelivr.
- Browsers that do not support folder selection will still allow normal multi-file selection.

## Project structure

```text
.
├── obsidian-markdown-to-html.html  # The complete application
└── README.md                       # This guide
```

## Development

The application is intentionally a single HTML file containing its styles and JavaScript. To make a change, edit `obsidian-markdown-to-html.html` and test it by opening it in a browser.

Before submitting a change, verify at least the following:

1. A normal Markdown file renders correctly.
2. An imported note containing `<script>alert(1)</script>` displays that text and does not execute it.
3. A Markdown link using `javascript:` does not remain clickable.
4. Exported HTML still opens and its table of contents works.

## License

Add your preferred license before publishing this project. The MIT License is a common choice for a small open-source browser tool.

