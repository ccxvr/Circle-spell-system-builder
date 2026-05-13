# WILDER Spell Circle Builder

Static web app for building WILDER / Concentric Arcana spell circles.

## Features

- Write spells using ring syntax.
- Parse Effects, Vectors, Modifiers, and Aspects.
- Calculate ring load and spell complexity.
- Render a symbolic spell circle as SVG.
- Export SVG.
- Copy parsed spell JSON.

## Example Syntax

```txt
Ring 1: Harm > Fire
Ring 2: Harm > Dart > Sphere > Fire
```

```txt
Neutral > Summon(T) > Fire
```

```txt
Ring 1: Bless > Light
Ring 2: Bless > Circle(A) > Light
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

- Add draggable glyph placement.
- Add custom rune art per glyph.
- Add save/load spell library.
- Add validation for empowerment rules.
- Add multi-subspell parsing inside a single ring.
- Add PNG export.
- Add hex-grid preview for vector areas.
- Add print-friendly spell card export.
