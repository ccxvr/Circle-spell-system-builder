# WILDER Spell Circle Builder

Static web app for building WILDER / Concentric Arcana spell circles.

## Features

- Write spells using ring syntax.
- Parse Effects, Vectors, Modifiers, and Aspects.
- Calculate ring load and spell complexity.
- Generate a plain-language spell description by chaining subspell readings, including range, filters, and duration modifiers.
- Render an arcane rune-based spell circle as SVG.
- Export SVG.
- Copy parsed spell JSON.

## Example Syntax

```txt
Ring 1: Harm > Dart > Fire
Ring 2: Neutral > Summon > Fire
```

Output description:

```txt
A harmful fire dart that summons a Fire creature at the impact location.
```

## GitHub Pages Hosting

1. Create a new GitHub repository.
2. Upload the contents of this folder.
3. In GitHub, go to **Settings → Pages**.
4. Set **Source** to `Deploy from a branch`.
5. Select the `main` branch and `/root`.
6. Visit the provided GitHub Pages URL.

No build step is required.

## File Structure

```txt
index.html
src/
  app.js
  styles.css
data/
  glyphs.js
docs/
  rules-notes.md
```

## Next Development Tasks

- Improve drag-and-drop with true visual ring editing.
- Add custom image import for rune art.
- Add save/load spell library.
- Add stronger validation for empowerment rules.
- Add better multi-subspell grammar for trailing empowerments.
- Add PNG export.
- Add hex-grid preview for vector areas.
- Add print-friendly spell card export.


## v3 Notes

This version adds:

- Modifier-aware spell descriptions.
- Range description for Dart and AoE vectors.
- Duration descriptions in seconds for Summon and persistent AoE vectors.
- A glyph palette with click and drag insertion.
- Automatic `>` separator insertion when adding non-modifier glyphs after an existing glyph.


## v4 GitHub Pages Compatibility

This version removes ES module imports and embeds the glyph data directly into `src/app.js`.

That means GitHub Pages can serve the app as plain static files without a build step and without browser import-path issues.

### Deployment

1. Upload these files to a GitHub repository.
2. Go to **Settings → Pages**.
3. Choose **Deploy from a branch**.
4. Select `main` and `/root`.
5. Open the GitHub Pages URL.

If the glyph palette does not appear, open the browser console and check for JavaScript errors.
