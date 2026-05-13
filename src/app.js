const glyphs = {
  "effects": {
    "Harm": {
      "complexity": 1,
      "verb": "harmful",
      "symbol": "♄"
    },
    "Heal": {
      "complexity": 1,
      "verb": "healing",
      "symbol": "☉"
    },
    "Hex": {
      "complexity": 1,
      "verb": "hexing",
      "symbol": "☿"
    },
    "Bless": {
      "complexity": 1,
      "verb": "blessing",
      "symbol": "✧"
    },
    "Neutral": {
      "complexity": 1,
      "verb": "neutral",
      "symbol": "○",
      "notes": "Only effect that may use Summon or Conjure."
    }
  },
  "aspects": {
    "Fire": {
      "adjective": "fire",
      "creature": "Fire creature",
      "symbol": "△"
    },
    "Cold": {
      "adjective": "cold",
      "creature": "Cold creature",
      "symbol": "🜄"
    },
    "Lightning": {
      "adjective": "lightning",
      "creature": "Lightning creature",
      "symbol": "🜁"
    },
    "Thunder": {
      "adjective": "thunder",
      "creature": "Thunder creature",
      "symbol": "☳"
    },
    "Earth": {
      "adjective": "earth",
      "creature": "Earth creature",
      "symbol": "🜃"
    },
    "Darkness": {
      "adjective": "darkness",
      "creature": "Darkness creature",
      "symbol": "⛧"
    },
    "Light": {
      "adjective": "light",
      "creature": "Light creature",
      "symbol": "✶"
    },
    "Acid": {
      "adjective": "acid",
      "creature": "Acid creature",
      "symbol": "🝮"
    },
    "Poison": {
      "adjective": "poison",
      "creature": "Poison creature",
      "symbol": "🜍"
    },
    "Force": {
      "adjective": "force",
      "creature": "Force creature",
      "symbol": "⥊"
    }
  },
  "vectors": {
    "Self": {
  "complexity": 1,
  "category": "contact",
  "rangeModifiable": false,
  "localEmpower": true,
  "phrase": "self",
  "symbol": "⊙"
},
"Touch": {
  "complexity": 1,
  "category": "contact",
  "rangeModifiable": false,
  "localEmpower": true,
  "phrase": "touch",
  "symbol": "⊹"
},
"Target": {
  "complexity": 1,
  "category": "contact",
  "rangeModifiable": false,
  "phrase": "target",
  "symbol": "⊚"
},
    "Dart": {
      "complexity": 1,
      "category": "projected",
      "range": "6 hexes",
      "rangeModifiable": true,
      "phrase": "dart",
      "symbol": "➶"
    },
    "Sphere": {
      "complexity": 1,
      "category": "area",
      "radius": "1 hex",
      "rangeModifiable": true,
      "persistent": true,
      "phrase": "sphere",
      "symbol": "◉"
    },
    "Cube": {
      "complexity": 1,
      "category": "area",
      "side": "1 hex",
      "rangeModifiable": true,
      "persistent": true,
      "phrase": "cube",
      "symbol": "□"
    },
    "Cylinder": {
      "complexity": 1,
      "category": "area",
      "radius": "1 hex",
      "length": "2 hexes",
      "rangeModifiable": true,
      "persistent": true,
      "phrase": "cylinder",
      "symbol": "⌭"
    },
    "Cone": {
      "complexity": 1,
      "category": "area",
      "angle": "45 degrees",
      "length": "2 hexes",
      "rangeModifiable": true,
      "persistent": true,
      "phrase": "cone",
      "symbol": "∠"
    },
    "Line": {
      "complexity": 1,
      "category": "area",
      "width": "1 hex",
      "length": "3 hexes",
      "rangeModifiable": true,
      "persistent": true,
      "phrase": "line",
      "symbol": "╱"
    },
    "Circle": {
      "complexity": 1,
      "category": "area",
      "radius": "1 hex",
      "rangeModifiable": true,
      "persistent": true,
      "phrase": "circle",
      "symbol": "◎"
    },
    "Summon": {
      "complexity": 2,
      "category": "constructive",
      "duration": "8T",
      "rangeModifiable": false,
      "persistent": true,
      "phrase": "summon",
      "symbol": "⟐"
    },
    "Conjure": {
  "complexity": 1,
  "category": "constructive",
  "duration": "8T",
  "rangeModifiable": false,
  "persistent": true,
  "phrase": "conjure",
  "symbol": "⟡"
}
  },
  "modifiers": {
    "+": {
      "kind": "range",
      "multiplier": 2,
      "symbol": "˃"
    },
    "-": {
      "kind": "range",
      "multiplier": 0.5,
      "symbol": "˂"
    },
    "T": {
      "kind": "duration",
      "multiplier": 2,
      "symbol": "⧖"
    },
    "A": {
      "kind": "filter",
      "multiplier": 2,
      "phrase": "that affects allies only",
      "symbol": "⊕"
    },
    "E": {
      "kind": "filter",
      "multiplier": 2,
      "phrase": "that affects enemies only",
      "symbol": "⊖"
    }
  }
};

document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("spellInput");
  const parseBtn = document.getElementById("parseBtn");
  const exportSvgBtn = document.getElementById("exportSvgBtn");
  const copyJsonBtn = document.getElementById("copyJsonBtn");
  const circleMount = document.getElementById("circleMount");
  const summary = document.getElementById("summary");
  const jsonOutput = document.getElementById("jsonOutput");
  const glyphReference = document.getElementById("glyphReference");
  const glyphPalette = document.getElementById("glyphPalette");
  const spellDescription = document.getElementById("spellDescription");

  let currentSpell = null;
  const VECTOR_AOE = new Set(["Sphere", "Cube", "Cylinder", "Cone", "Line", "Circle"]);
  const VECTOR_CONTACT = new Set(["Self", "Touch", "Target"]);
  const VECTOR_CONSTRUCTIVE = new Set(["Summon", "Conjure"]);

  function normalizeToken(raw) {
    return raw.trim().replace(/→/g, ">").replace(/\s+/g, "");
  }

  function splitGlyphChain(text) {
    return text.replace(/→/g, ">").split(">").map(t => t.trim()).filter(Boolean);
  }

  function parseGlyphToken(token) {
  const match = token.match(/^([A-Za-z]+)([+\-]*)(?:\(([A-Z]+)\))?$/);
  if (!match) return null;

  return {
    name: match[1],
    rangeMods: match[2] ? match[2].split("") : [],
    attachedMods: match[3] ? match[3].split("") : []
  };
}

  function parseSpell(text) {
    const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean);
    return {
      rings: lines.map((line, idx) => {
        const labelled = line.match(/^Ring\s*(\d+)\s*:\s*(.*)$/i);
        const level = labelled ? parseInt(labelled[1], 10) : idx + 1;
        const body = labelled ? labelled[2] : line;
        const tokens = splitGlyphChain(body);
        return analyzeRing(level, tokens);
      })
    };
  }

  function analyzeRing(level, tokens) {
    const analyzed = tokens.map(token => {
      const compact = normalizeToken(token);
      if (glyphs.effects[compact]) return { raw: token, name: compact, type: "effect", complexity: glyphs.effects[compact].complexity };
      if (glyphs.aspects[compact]) return { raw: token, name: compact, type: "aspect", complexity: 1 };

     const parsed = parseGlyphToken(compact);

if (
  parsed &&
  !glyphs.vectors[parsed.name] &&
  (
    parsed.rangeMods.length > 0 ||
    parsed.attachedMods.length > 0
  )
) {
  return {
    raw: token,
    name: parsed.name,
    type: "unknown",
    complexity: 1,
    legal: false,
    notes: [`${parsed.name} cannot take modifiers because it is not a vector.`]
  };
}

const vector = parsed;

if (vector && glyphs.vectors[vector.name]) {
        let base = glyphs.vectors[vector.name].complexity;
        let legal = true;
        const notes = [];

        for (const mod of vector.rangeMods) {
          if (!glyphs.vectors[vector.name].rangeModifiable) {
            legal = false;
            notes.push(`${vector.name} cannot take range modifiers.`);
          }
          base *= glyphs.modifiers[mod].multiplier;
        }

        let filterCount = 0;
        for (const mod of vector.attachedMods) {
          const data = glyphs.modifiers[mod];
          if (!data) {
            legal = false;
            notes.push(`Unknown modifier (${mod}).`);
            continue;
          }
          if (data.kind === "filter") filterCount += 1;
         if (data.kind === "duration") {
  // Final legality depends on the whole subspell.
  // Example: Self(T), Touch(T), and Target(T) are legal only for Bless/Hex.
}
          base *= data.multiplier;
        }

        if (filterCount > 1) {
          legal = false;
          notes.push("A vector may only have one filter.");
        }

        return {
          raw: token,
          name: vector.name,
          type: "vector",
          complexity: base,
          rangeMods: vector.rangeMods,
          attachedMods: vector.attachedMods,
          legal,
          notes
        };
      }

      return { raw: token, name: compact, type: "unknown", complexity: 1, legal: false, notes: ["Unknown glyph."] };
    });

    const ringLoad = analyzed.reduce((sum, g) => sum + g.complexity, 0) * level;

    return {
      level,
      tokens: analyzed,
      load: ringLoad,
      subspells: splitSubspells(analyzed)
    };
  }

  function splitSubspells(tokens) {
    const result = [];
    let current = [];
    for (const token of tokens) {
      current.push(token);
      if (token.type === "aspect") {
        result.push(current);
        current = [];
      }
    }
    if (current.length) result.push(current);
    return result;
  }

  function complexityFromLoad(load) {
    if (load <= 4) return 0;
    if (load <= 8) return 1;
    if (load <= 16) return 2;
    if (load <= 32) return 3;
    if (load <= 64) return 4;
    if (load <= 128) return 5;
    return Math.ceil(Math.log2(load / 4));
  }

  function rangeAdjective(vector) {
    const plus = (vector.rangeMods || []).filter(m => m === "+").length;
    const minus = (vector.rangeMods || []).filter(m => m === "-").length;
    if (plus <= 0 && minus <= 0) return "";

    if (plus > 0) {
      if (vector.name === "Dart") {
        if (plus === 1) return "long range ";
        if (plus === 2) return "very long range ";
        return "extremely long range ";
      }
      if (VECTOR_AOE.has(vector.name)) {
        if (plus === 1) return "large ";
        if (plus === 2) return "huge ";
        return "massive ";
      }
      return "extended ";
    }

    if (minus > 0) {
      if (vector.name === "Dart") return "short range ";
      if (VECTOR_AOE.has(vector.name)) return "small ";
      return "reduced ";
    }

    return "";
  }

 function durationPhrase(vector, effect) {
  const tCount = (vector.attachedMods || []).filter(m => m === "T").length;

  if (vector.name === "Summon") {
    const duration = 8 * Math.pow(2, tCount);
    return `that lasts for ${duration}T`;
  }

  if (vector.name === "Conjure") {
    const duration = 8 * Math.pow(2, tCount);
    return `that lasts for ${duration}T`;
  }

  if (VECTOR_AOE.has(vector.name)) {
    if (!tCount) return "";
    return `that persists for ${tCount * 3}T`;
  }

  if (
    VECTOR_CONTACT.has(vector.name) &&
    (effect === "Bless" || effect === "Hex")
  ) {
    return `that lasts for ${3 + (tCount * 3)}T`;
  }

  return "";
}
  function filterPhrase(vector) {
    const filter = (vector.attachedMods || []).find(m => glyphs.modifiers[m] && glyphs.modifiers[m].kind === "filter");
    return filter ? glyphs.modifiers[filter].phrase : "";
  }

function getHarmDice(level) {

  const diceSteps = [4, 6, 8, 10, 12];

  const fullD12s = Math.floor((level - 1) / 5);
  const remainder = (level - 1) % 5;

  let parts = [];

  if (fullD12s > 0) {
    parts.push(`${fullD12s}d12`);
  }

  const stepDie = diceSteps[remainder];

  if (stepDie > 0) {
    parts.push(`1d${stepDie}`);
  }

  return parts.join("+");
}

const blessMap = {
  Fire: "Ballistic Skill",
  Poison: "Dex",
  Force: "Str",
  Acid: "Wit",
  Darkness: "Tg",
  Light: "Intelligence",
  Thunder: "Presence",
  Lightning: "Agi",
  Cold: "WP",
  Earth: "Melee Skill"
};

const hexMap = {
  Fire: {
    condition: "Blaze",
    resist: "Endurance"
  },

  Poison: {
    condition: "Poisoned",
    resist: "Endurance"
  },

  Force: {
    condition: "Push",
    resist: "Athletics"
  },

  Acid: {
    condition: "Armor DR reduction",
    resist: "Dodge"
  },

  Darkness: {
    condition: "Fear",
    resist: "Cool"
  },

  Light: {
    condition: "Blind",
    resist: "Endurance"
  },

  Thunder: {
    condition: "Deafened",
    resist: "Endurance"
  },

  Lightning: {
    condition: "Stunned",
    resist: "Endurance"
  },

  Cold: {
    condition: "Slow",
    resist: "Endurance"
  },

  Earth: {
    condition: "Bleed",
    resist: "Endurance"
  }
};

function getEmpowermentLevel(effect, aspect, previousRings) {
  let level = 1;

  for (const ring of previousRings) {
    for (const sub of ring.subspells) {

      const eff = sub.find(t => t.type === "effect");
      const asp = sub.find(t => t.type === "aspect");
      const vec = sub.find(t => t.type === "vector");

      if (
        eff &&
        asp &&
        !vec &&
        eff.name === effect &&
        asp.name === aspect
      ) {
        level += 1;
      }
    }
  }

  return level;
}

function conjureText(aspect, level) {
  const power = level;

  const map = {
    Fire: `conjures fire, causing Blaze ${1 + power}, resisted by a +0 Endurance check`,
    Poison: `conjures poison, causing Poisoned ${1 + power}, resisted by a +0 Endurance check`,
    Force: `conjures a barrier around the area with 0 DR and ${3 + (3 * power)} HP`,
    Acid: `conjures acid, reducing DR of creatures and objects in the area by ${1 + power} while they remain inside`,
    Darkness: `conjures magical darkness that blocks sight and removes light effects of lower spell power`,
    Light: `conjures magical light that removes darkness effects of lower spell power and counts as sunlight`,
    Thunder: `conjures a silencing area and immediately deals ${power}d4 thunder damage to creatures inside`,
    Lightning: `removes magical continuous effects in the area with spell power ${power} or lower`,
    Cold: `conjures ice and sleet; movement through it requires an Agi check or the creature falls prone`,
    Earth: `conjures a rock formation with ${power} DR and ${2 + (2 * power)} HP`
  };

  return map[aspect] || `conjures a ${aspect.toLowerCase()} environmental effect`;
}

function mechanicalText(effect, aspect, level) {

  if (effect === "Harm") {
    const dice = getHarmDice(level);
    return `deals ${dice} ${aspect.toLowerCase()} damage`;
  }

  if (effect === "Bless") {
    return `gives a +${level * 5} ${blessMap[aspect]} bonus`;
  }

  if (effect === "Hex") {

    const data = hexMap[aspect];

    return `forces the target to make a -${level * 5} ${data.resist} check or receive ${level} ${data.condition} condition`;
  }

  if (effect === "Heal") {

    const data = hexMap[aspect];

    return `heals for ${level * 2} HP and removes ${level} ${data.condition} condition`;
  }

  return "does nothing meaningful";
}
  function validateSubspell(subspell) {
  const effect = subspell.find(t => t.type === "effect");
  const aspect = [...subspell].reverse().find(t => t.type === "aspect");
  const vectors = subspell.filter(t => t.type === "vector");
  const unknown = subspell.find(t => t.type === "unknown");
  const illegalVector = vectors.find(v => v.legal === false);

  if (unknown) {
    return {
      valid: false,
      useless: false,
      reason: unknown.notes?.join(" ") || "contains an invalid glyph"
    };
  }

  if (illegalVector) {
    return {
      valid: false,
      useless: false,
      reason: illegalVector.notes?.join(" ") || "contains an illegal vector modifier"
    };
  }

  if (!aspect) {
    return {
      valid: false,
      useless: false,
      reason: "has no closing aspect"
    };
  }

  if (!effect) {
    return {
      valid: false,
      useless: false,
      reason: "has no opening effect"
    };
  }

  const hasSummon = vectors.some(v => v.name === "Summon");
  const hasConjure = vectors.some(v => v.name === "Conjure");

  if ((hasSummon || hasConjure) && effect.name !== "Neutral") {
    return {
      valid: false,
      useless: false,
      reason: "Summon and Conjure may only be used with Neutral"
    };
  }

  if (effect.name === "Neutral" && !hasSummon && !hasConjure) {
    return {
      valid: true,
      useless: true,
      reason: "Neutral does nothing without Summon or Conjure"
    };
  }

  if (hasConjure) {
    const conjureIndex = vectors.findIndex(v => v.name === "Conjure");
    const nextVector = vectors[conjureIndex + 1];

    if (!nextVector || !VECTOR_AOE.has(nextVector.name)) {
      return {
        valid: false,
        useless: false,
        reason: "Conjure must be followed by an area vector"
      };
    }
  }

    if (vectors.some(v => v.name === "Target")) {
  if (effect.name !== "Bless" && effect.name !== "Hex") {
    return {
      valid: false,
      useless: false,
      reason: "Target may only be used with Bless or Hex"
    };
  }

  const previousSubspell = subspell.previousSubspell;

  const previousWasDart =
    previousSubspell &&
    previousSubspell.some(t => t.type === "vector" && t.name === "Dart");

  if (!previousWasDart) {
    return {
      valid: false,
      useless: false,
      reason: "Target may only be used after a previous Dart subspell"
    };
  }
}

  for (const vector of vectors) {
    const tCount = (vector.attachedMods || []).filter(m => m === "T").length;
    if (!tCount) continue;

    const isSummon = vector.name === "Summon";
    const isPersistentArea = VECTOR_AOE.has(vector.name);
    const isBlessHexContact =
      VECTOR_CONTACT.has(vector.name) &&
      (effect.name === "Bless" || effect.name === "Hex");

    if (!isSummon && !isPersistentArea && !isBlessHexContact) {
      return {
        valid: false,
        useless: false,
        reason: `${vector.name} may only take (T) if it is Summon, a persistent area vector, or a Bless/Hex Self, Touch, or Target vector`
      };
    }
  }

  return {
    valid: true,
    useless: false,
    reason: ""
  };
}

function describeSubspell(subspell, previous, previousRings) {
  const effect = subspell.find(t => t.type === "effect");
  const aspect = [...subspell].reverse().find(t => t.type === "aspect");
  const vectors = subspell.filter(t => t.type === "vector");

  const validation = validateSubspell(subspell);

  if (!validation.valid) {
    return {
      text: `a broken dangerous spell that should not work (${validation.reason})`,
      terminalLocation: "its endpoint"
    };
  }

  if (!effect || !aspect) {
    return {
      text: "a broken dangerous spell that should not work",
      terminalLocation: "its endpoint"
    };
  }

  const aspectAdj =
    glyphs.aspects[aspect.name]?.adjective ||
    aspect.name.toLowerCase();

  const mainVector = vectors[vectors.length - 1];
  const firstVector = vectors[0];

  if (validation.useless) {
    return {
      text: `a useless ${aspectAdj} spell that does nothing meaningful`,
      terminalLocation: "its endpoint"
    };
  }

  let level = getEmpowermentLevel(
    effect.name,
    aspect.name,
    previousRings
  );

  if (vectors.some(v => glyphs.vectors[v.name]?.localEmpower)) {
    level += 1;
  }

  let phrase = "";

  if (!mainVector) {
    phrase =
      `empowers later ${aspectAdj} ` +
      `${effect.name.toLowerCase()} manifestations`;

    return {
      text: phrase,
      terminalLocation: previous?.terminalLocation || "its endpoint"
    };
  }

  if (vectors.some(v => v.name === "Conjure")) {
    const conjureIndex = vectors.findIndex(v => v.name === "Conjure");
    const areaVector = vectors.find((v, idx) =>
      idx > conjureIndex && VECTOR_AOE.has(v.name)
    );

    const conjureVector = vectors.find(v => v.name === "Conjure");
    const conjureDuration = durationPhrase(conjureVector, effect.name);
    const areaDuration = areaVector ? durationPhrase(areaVector, effect.name) : "";
    const duration = areaDuration || conjureDuration;
    phrase = conjureText(aspect.name, level);

    if (areaVector) {
      phrase += ` in a ${areaVector.name.toLowerCase()} area`;
    }

    if (duration) {
      phrase += ` ${duration}`;
    }

    return {
      text: phrase,
      terminalLocation: areaVector ? `the ${areaVector.name.toLowerCase()} area` : "its endpoint"
    };
  }

  const mechanics = mechanicalText(effect.name, aspect.name, level);

  if (mainVector.name === "Summon") {
    const duration = durationPhrase(mainVector, effect.name);

    phrase =
      `summons a TL ${level} ${aspectAdj} creature ` +
      `${duration}`;

    return {
      text: phrase,
      terminalLocation: "the summoned creature"
    };
  }

  if (mainVector.name === "Dart") {
    phrase =
      `a ${effect.name.toLowerCase()} ` +
      `${rangeAdjective(mainVector)}` +
      `${aspectAdj} dart that ${mechanics}`;
  }

  else if (mainVector.name === "Touch") {
    const duration = durationPhrase(mainVector, effect.name);

    phrase =
      `a ${effect.name.toLowerCase()} ` +
      `${aspectAdj} touch`;

    if (duration) {
      phrase += ` ${duration}`;
    }

    phrase += ` that ${mechanics}`;
  }

  else if (mainVector.name === "Self") {
    const duration = durationPhrase(mainVector, effect.name);

    phrase =
      `a ${effect.name.toLowerCase()} ` +
      `${aspectAdj} effect on the caster`;

    if (duration) {
      phrase += ` ${duration}`;
    }

    phrase += ` that ${mechanics}`;
  }

  else if (mainVector.name === "Target") {
    const duration = durationPhrase(mainVector, effect.name);

    phrase =
      `a ${effect.name.toLowerCase()} ` +
      `${aspectAdj} effect on the target`;

    if (duration) {
      phrase += ` ${duration}`;
    }

    phrase += ` that ${mechanics}`;
  }

  else {
    const shape =
      glyphs.vectors[mainVector.name]?.phrase ||
      mainVector.name.toLowerCase();

    const duration = durationPhrase(mainVector, effect.name);

    phrase =
      `a ${effect.name.toLowerCase()} ` +
      `${aspectAdj} ${shape}`;

    if (duration) {
      phrase += ` ${duration}`;
    }

    phrase += ` that ${mechanics}`;
  }

  if (
    vectors.length > 1 &&
    firstVector &&
    firstVector.name === "Dart" &&
    mainVector.name !== "Dart"
  ) {
    phrase += ` carried by a dart`;
  }

  const filter =
    vectors
      .map(filterPhrase)
      .find(Boolean);

  if (filter) {
    phrase += ` ${filter}`;
  }

  let terminalLocation = "its endpoint";

  if (mainVector.name === "Dart") {
    terminalLocation = "the impact location";
  }

  else if (VECTOR_AOE.has(mainVector.name)) {
    terminalLocation = `the ${mainVector.name.toLowerCase()} area`;
  }

  else if (mainVector.name === "Touch") {
    terminalLocation = "the touched target";
  }

  else if (mainVector.name === "Self") {
    terminalLocation = "the caster";
  }

  else if (mainVector.name === "Target") {
    terminalLocation = "the target";
  }

  return {
    text: phrase,
    terminalLocation
  };
}

function describeSpell(spell) {
  const pieces = [];
  let previous = null;
  let previousSubspell = null;

  for (let i = 0; i < spell.rings.length; i++) {
    const ring = spell.rings[i];
    const previousRings = spell.rings.slice(0, i);

    for (const sub of ring.subspells) {
      sub.previousSubspell = previousSubspell;

      const desc = describeSubspell(
        sub,
        previous,
        previousRings
      );

      pieces.push(desc.text);

      previous = desc;
      previousSubspell = sub;
    }
  }

  if (!pieces.length) {
    return "No complete spell clauses detected.";
  }

  let sentence = pieces[0];

  for (let i = 1; i < pieces.length; i++) {
    sentence += `, then creates ${pieces[i]}`;
  }

  sentence =
    sentence.charAt(0).toUpperCase() +
    sentence.slice(1);

  return sentence + ".";
}

  function summarize(spell) {
    const totalLoadRaw = spell.rings.reduce((sum, r) => sum + r.load, 0);
    const totalLoad = Math.ceil(totalLoadRaw);
    const complexity = complexityFromLoad(totalLoad);

    spell.totalLoadRaw = totalLoadRaw;
    spell.totalLoad = totalLoad;
    spell.complexity = complexity;
    spell.description = describeSpell(spell);

    const ringRows = spell.rings.map(r => `
      <tr>
        <td>Ring ${r.level}</td>
        <td>${r.tokens.map(t => escapeHtml(t.raw)).join(" → ")}</td>
        <td>${r.load.toFixed(2)}</td>
      </tr>
    `).join("");

    const warnings = spell.rings.flatMap(r =>
      r.tokens.flatMap(t => t.legal === false ? [`Ring ${r.level}: ${t.raw} — ${(t.notes || ["Illegal glyph"]).join(" ")}`] : [])
    );

    spellDescription.innerHTML = `
      <div>${escapeHtml(spell.description)}</div>
      <div class="subtitle">Generated from chained subspell readings. Review edge cases manually.</div>
    `;

    summary.innerHTML = `
      <p><strong>Total Load:</strong> ${totalLoad} <span class="muted">(raw ${totalLoadRaw.toFixed(2)})</span></p>
      <p><strong>Spell Complexity:</strong> ${complexity}</p>
      <table>
        <thead><tr><th>Ring</th><th>Glyphs</th><th>Load</th></tr></thead>
        <tbody>${ringRows}</tbody>
      </table>
      ${warnings.length ? `<h3>Warnings</h3><ul>${warnings.map(w => `<li>${escapeHtml(w)}</li>`).join("")}</ul>` : ""}
    `;
    jsonOutput.textContent = JSON.stringify(spell, null, 2);
  }

  function glyphSymbol(g) {
    if (glyphs.effects[g.name]) return glyphs.effects[g.name].symbol;
    if (glyphs.vectors[g.name]) return glyphs.vectors[g.name].symbol;
    if (glyphs.aspects[g.name]) return glyphs.aspects[g.name].symbol;
    return "?";
  }

  function glyphShape(g, x, y) {
    const symbol = glyphSymbol(g);
    const mods = [];

    if (g.rangeMods) {
      for (const mod of g.rangeMods) mods.push(glyphs.modifiers[mod].symbol);
    }

    if (g.attachedMods) {
      for (const mod of g.attachedMods) mods.push(glyphs.modifiers[mod].symbol);
    }

    const modText = mods.length
      ? `<text x="${x}" y="${y - 31}" text-anchor="middle" dominant-baseline="middle" class="modifier-rune">${escapeXml(mods.join(""))}</text>`
      : "";

    return `
      <g class="glyph-group">
        <text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" class="arcane-rune">${escapeXml(symbol)}</text>
        ${modText}
        <text x="${x}" y="${y + 35}" text-anchor="middle" dominant-baseline="middle" class="glyph-label">${escapeXml(g.name)}</text>
      </g>
    `;
  }

function renderCircle(spell) {
  const displaySize = 650;

  const ringGap = 84;
  const baseRadius = 90;
  const padding = 90;

  const maxRadius = baseRadius + (spell.rings.length - 1) * ringGap + 78;

  const size = maxRadius * 2 + padding * 2;
  const cx = size / 2;
  const cy = size / 2;

  let svg = `<svg id="spellSvg" xmlns="http://www.w3.org/2000/svg" width="${displaySize}" height="${displaySize}" viewBox="0 0 ${size} ${size}" role="img" aria-label="Spell circle">
      <defs>
        <radialGradient id="bg" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stop-color="#1a1622"/>
          <stop offset="65%" stop-color="#0d0b11"/>
          <stop offset="100%" stop-color="#07060a"/>
        </radialGradient>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="2.8" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>
      <circle cx="${cx}" cy="${cy}" r="${maxRadius}" fill="none" stroke="#2d2530" stroke-width="14" opacity="0.65"/>
      <circle cx="${cx}" cy="${cy}" r="${maxRadius}" fill="none" stroke="#d8b66a" stroke-width="1.4" opacity="0.85"/>
      <circle cx="${cx}" cy="${cy}" r="${maxRadius-18}" fill="none" stroke="#9ad7d3" stroke-width="0.75" opacity="0.24"/>
    `;

    for (let i = 0; i < 60; i++) {
      const a = -Math.PI / 2 + (Math.PI * 2 * i / 60);
      const long = i % 5 === 0;
      const r1 = maxRadius - (long ? 22 : 12);
      const r2 = maxRadius - 3;
      const x1 = cx + Math.cos(a) * r1;
      const y1 = cy + Math.sin(a) * r1;
      const x2 = cx + Math.cos(a) * r2;
      const y2 = cy + Math.sin(a) * r2;
      svg += `<path d="M${x1.toFixed(2)} ${y1.toFixed(2)} L${x2.toFixed(2)} ${y2.toFixed(2)}" stroke="#d8b66a" stroke-width="${long ? 1.4 : 0.7}" opacity="${long ? 0.72 : 0.35}"/>`;
    }

    for (const ring of spell.rings) {
      const radius = baseRadius + (ring.level - 1) * ringGap;
      svg += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="#d8b66a" stroke-opacity="0.56" stroke-width="1.6" filter="url(#softGlow)"/>`;
      svg += `<circle cx="${cx}" cy="${cy}" r="${radius-9}" fill="none" stroke="#9ad7d3" stroke-opacity="0.13" stroke-width="1"/>`;
      svg += `<circle cx="${cx}" cy="${cy}" r="${radius+9}" fill="none" stroke="#9ad7d3" stroke-opacity="0.13" stroke-width="1"/>`;

      const segmentCount = Math.max(6 * ring.level, ring.tokens.length);
      for (let i = 0; i < segmentCount; i++) {
        const a = -Math.PI / 2 + (Math.PI * 2 * i / segmentCount);
        const r1 = radius - 5;
        const r2 = radius + 5;
        const x1 = cx + Math.cos(a) * r1;
        const y1 = cy + Math.sin(a) * r1;
        const x2 = cx + Math.cos(a) * r2;
        const y2 = cy + Math.sin(a) * r2;
        svg += `<path d="M${x1.toFixed(2)} ${y1.toFixed(2)} L${x2.toFixed(2)} ${y2.toFixed(2)}" stroke="#d8b66a" stroke-width="0.55" opacity="0.26"/>`;
      }

      svg += `<text x="${cx}" y="${cy-radius-15}" text-anchor="middle" font-size="11" fill="#7f735a" font-family="Georgia, serif">Ring ${ring.level}</text>`;

      const n = Math.max(ring.tokens.length, 1);
      ring.tokens.forEach((token, i) => {
        const angle = -Math.PI / 2 + (2 * Math.PI * i / n);
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        svg += glyphShape(token, x, y);
      });
    }

    svg += `
      <g filter="url(#softGlow)">
        <circle cx="${cx}" cy="${cy}" r="34" fill="none" stroke="#d8b66a" stroke-width="1.4"/>
        <path d="M ${cx} ${cy-26} L ${cx+22} ${cy+13} L ${cx-22} ${cy+13} Z" fill="none" stroke="#d8b66a" stroke-width="1.2"/>
        <circle cx="${cx}" cy="${cy}" r="5" fill="#d8b66a" opacity="0.75"/>
      </g>
    </svg>`;

    circleMount.innerHTML = svg;
  }

  function insertGlyph(glyph, kind) {
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const before = input.value.slice(0, start);
    const after = input.value.slice(end);
    let insert = glyph;

    if (kind !== "modifier") {
      const currentLine = before.slice(before.lastIndexOf("\n") + 1);
      const hasGlyphBefore = /[A-Za-z\)]\s*$/.test(currentLine);
      insert = hasGlyphBefore ? ` > ${glyph}` : glyph;
    }

    input.value = before + insert + after;
    const pos = start + insert.length;
    input.focus();
    input.setSelectionRange(pos, pos);
    build();
  }

  function getTokenSymbol(token, kind) {
    if (kind === "modifier") {
      const key = token.replace(/[()]/g, "");
      return glyphs.modifiers[key] ? glyphs.modifiers[key].symbol : token;
    }
    return (glyphs.effects[token] && glyphs.effects[token].symbol)
      || (glyphs.vectors[token] && glyphs.vectors[token].symbol)
      || (glyphs.aspects[token] && glyphs.aspects[token].symbol)
      || token;
  }

  function buildPalette() {
    const groups = [
      ["Effects", Object.keys(glyphs.effects).map(x => [x, "glyph"])],
      ["Vectors", Object.keys(glyphs.vectors).map(x => [x, "glyph"])],
      ["Aspects", Object.keys(glyphs.aspects).map(x => [x, "glyph"])],
      ["Modifiers", ["+", "-", "(T)", "(A)", "(E)"].map(x => [x, "modifier"])]
    ];

    glyphPalette.innerHTML = groups.map(([group, items]) => `
      <div class="palette-group">
        <div class="palette-group-title">${group}</div>
        <div class="chip-row">
          ${items.map(([label, kind]) => `<span class="glyph-chip" draggable="true" data-kind="${kind}" data-glyph="${label}"><span class="chip-symbol">${escapeHtml(getTokenSymbol(label, kind))}</span>${label}</span>`).join("")}
        </div>
      </div>
    `).join("");

    glyphPalette.querySelectorAll(".glyph-chip").forEach(chip => {
      chip.addEventListener("click", () => insertGlyph(chip.dataset.glyph, chip.dataset.kind));
      chip.addEventListener("dragstart", event => {
        event.dataTransfer.setData("text/plain", JSON.stringify({ glyph: chip.dataset.glyph, kind: chip.dataset.kind }));
      });
    });
  }

  function setupDrop() {
    input.addEventListener("dragover", event => {
      event.preventDefault();
      input.classList.add("drop-active");
    });
    input.addEventListener("dragleave", () => input.classList.remove("drop-active"));
    input.addEventListener("drop", event => {
      event.preventDefault();
      input.classList.remove("drop-active");
      try {
        const data = JSON.parse(event.dataTransfer.getData("text/plain"));
        input.focus();
        insertGlyph(data.glyph, data.kind);
      } catch {
        const text = event.dataTransfer.getData("text/plain");
        insertGlyph(text, "glyph");
      }
    });
  }

  function escapeXml(str) {
    return String(str).replace(/[<>&'"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
  }

  function escapeHtml(str) {
    return String(str).replace(/[<>&'"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&#39;", '"': "&quot;" }[c]));
  }

  function build() {
    currentSpell = parseSpell(input.value);
    summarize(currentSpell);
    renderCircle(currentSpell);
  }

  function buildReference() {
    const groups = [
      ["Effects", glyphs.effects],
      ["Vectors", glyphs.vectors],
      ["Aspects", glyphs.aspects],
      ["Modifiers", glyphs.modifiers]
    ];
    glyphReference.innerHTML = groups.map(([name, data]) => `
      <div class="ref-card">
        <strong>${name}</strong>
        <p>${Object.entries(data).map(([k, v]) => `${v.symbol || ""} ${k}`).join(", ")}</p>
      </div>
    `).join("");
  }

  parseBtn.addEventListener("click", build);
  input.addEventListener("input", build);

  copyJsonBtn.addEventListener("click", async () => {
    if (!currentSpell) build();
    try {
      await navigator.clipboard.writeText(JSON.stringify(currentSpell, null, 2));
      copyJsonBtn.textContent = "Copied";
      setTimeout(() => copyJsonBtn.textContent = "Copy JSON", 900);
    } catch {
      alert("Clipboard unavailable. Copy from the JSON panel manually.");
    }
  });

  exportSvgBtn.addEventListener("click", () => {
    if (!currentSpell) build();
    const svgEl = document.getElementById("spellSvg");
    if (!svgEl) return;
    const svg = svgEl.outerHTML;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "spell-circle.svg";
    a.click();
    URL.revokeObjectURL(url);
  });

  buildPalette();
  setupDrop();
  buildReference();
  build();
});
