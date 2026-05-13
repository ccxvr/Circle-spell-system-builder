# Rules Notes

This prototype is based on the WILDER spellcasting syntax currently in development.

Current app assumptions:

- Spells are read from inner ring to outer ring.
- Rings are read clockwise.
- Complete subspell syntax is: Effect → Vector(s)/Modifier(s) → Aspect.
- Effects: Harm, Heal, Hex, Bless, Neutral.
- Neutral is used for Summon.
- Vectors carry base complexity.
- Range modifiers alter vector complexity multiplicatively.
- Filters double attached vector complexity.
- Duration modifier `(T)` doubles attached vector complexity.
- Total ring load = ring glyph complexity × ring level.
- Total spell load maps to spell complexity.
- Descriptions are generated heuristically from subspell sequence and previous terminal location.

This is a technical prototype, not a final rules authority.
