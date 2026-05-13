# WILDER Spell Circle Builder v7 — Mechanical Description Edition

A plain static GitHub Pages-compatible spell builder for the WILDER Concentric Arcana syntax.

## What changed in v7

- Adds mechanical spell descriptions: damage dice, damage type, Hex resistance, condition levels, Bless bonuses, Heal HP/condition removal, and Summon TL/duration.
- Adds clearer descriptions for useless Neutral spells and broken/illegal spell clauses.
- Keeps the Unicode occult/alchemical-style glyph set from v6.

## Deploy to GitHub Pages

1. Create a GitHub repository.
2. Upload the contents of this folder, not the folder itself.
3. Go to Settings → Pages.
4. Source: Deploy from a branch.
5. Branch: main, folder: /root.
6. Open the generated Pages URL.

No build step is required.

## Example

```txt
Ring 1: Harm > Dart > Fire
Ring 2: Neutral > Summon(T) > Fire
```

## Glyph Set

Effects:
- Harm ⚚
- Heal ☉
- Hex ☿
- Bless ✧
- Neutral ○

Vectors:
- Dart ➶
- Sphere ◉
- Cone ∠
- Cube □
- Cylinder ⌭
- Line ╱
- Circle ◎
- Summon ⟐
- Self ⊙
- Touch ⊹

Aspects:
- Fire △
- Cold 🜄
- Lightning 🜁
- Thunder ☳
- Earth 🜃
- Darkness ⛧
- Light ✶
- Acid 🝮
- Poison 🜍
- Force ⥊

Modifiers:
- Range + ˃
- Range - ˂
- Duration ⧖
- Allies ⊕
- Enemies ⊖


## v7 Mechanical Description Examples

```txt
Harm > Dart > Fire
```

Produces a harmful fire dart that deals 1d4 fire damage.

```txt
Hex > Dart > Lightning
```

Produces a hexing lightning dart that forces the target to make a -5 Endurance check or receive 1 Stunned condition.

```txt
Neutral > Summon(T) > Fire
```

Produces a TL 1 Fire creature that lasts for 16 seconds.
