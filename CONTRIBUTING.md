# Contributing

Thanks for considering a contribution to NoteForge.

## Before you start

- Keep the project dependency-light and usable as a single HTML file.
- Preserve local-first processing: note content must not be uploaded.
- Do not weaken the existing content-safety checks.
- Test changes in a current desktop browser.

## Development workflow

1. Fork the repository and create a focused branch.
2. Make your change in `note-forge.html`.
3. Test importing normal notes plus malformed or untrusted Markdown.
4. Open a pull request describing the user-facing result and any limitations.

## Security checks

Before opening a pull request, confirm that:

- Raw HTML in Markdown is shown as text.
- `javascript:` links do not remain clickable.
- Imported images, embeds, SVGs, and iframes do not load.
- The exported document still opens and its navigation works.

## Code style

Use clear vanilla HTML, CSS, and JavaScript. Avoid adding a build step unless there is a compelling maintenance or security benefit.
