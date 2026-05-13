# WILDER Spell Circle Builder v5

A plain static GitHub Pages-compatible spell builder for the WILDER Concentric Arcana syntax.

## Important

This version has no ES module imports and no build step. It should work on GitHub Pages by uploading the files and enabling Pages.

## Deploy to GitHub Pages

1. Create a GitHub repository.
2. Upload the contents of this folder, not the folder itself.
3. Go to Settings → Pages.
4. Source: Deploy from a branch.
5. Branch: main, folder: /root.
6. Open the generated Pages URL.

## Features

- Manual spell syntax editor.
- Clickable glyph palette.
- Drag glyph chips into the text editor where supported.
- Automatic `>` insertion for non-modifier glyphs.
- Modifier-aware spell descriptions.
- Arcane SVG spell circle rendering.
- SVG export.
- JSON export.

## Example

```txt
Ring 1: Harm > Dart > Fire
Ring 2: Neutral > Summon(T) > Fire
```

Expected description:

```txt
A harmful fire dart that summons a Fire creature at the impact location that lasts for 16 seconds.
```
