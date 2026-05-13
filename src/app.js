import glyphs from "../data/glyphs.js";

const input = document.querySelector("#spellInput");
const parseBtn = document.querySelector("#parseBtn");
const exportSvgBtn = document.querySelector("#exportSvgBtn");
const copyJsonBtn = document.querySelector("#copyJsonBtn");
const circleMount = document.querySelector("#circleMount");
const summary = document.querySelector("#summary");
const jsonOutput = document.querySelector("#jsonOutput");
const glyphReference = document.querySelector("#glyphReference");
const glyphPalette = document.querySelector("#glyphPalette");
const spellDescription = document.querySelector("#spellDescription");

let currentSpell = null;

const VECTOR_AOE = new Set(["Sphere", "Cube", "Cylinder", "Cone", "Line", "Circle"]);

function normalizeToken(raw) {
  return raw.trim().replace(/→/g, ">").replace(/\s+/g, "");
}

function splitGlyphChain(text) {
  return text.replace(/→/g, ">").split(">").map(t => t.trim()).filter(Boolean);
}

function parseVectorToken(token) {
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

    const vector = parseVectorToken(compact);
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
          const vdata = glyphs.vectors[vector.name];
          if (!vdata.persistent) {
            legal = false;
            notes.push(`${vector.name} cannot take duration modifier (T).`);
          }
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

function durationPhrase(vector) {
  const tCount = (vector.attachedMods || []).filter(m => m === "T").length;
  if (!tCount) {
    if (vector.name === "Summon") return "that lasts for 8 seconds";
    return "";
  }

  if (vector.name === "Summon") {
    const seconds = 8 * Math.pow(2, tCount);
    return `that lasts for ${seconds} seconds`;
  }

  if (VECTOR_AOE.has(vector.name)) {
    const seconds = 3 * tCount;
    return `that lasts for ${seconds} seconds`;
  }

  return "that lasts longer than normal";
}

function filterPhrase(vector) {
  const filter = (vector.attachedMods || []).find(m => glyphs.modifiers[m]?.kind === "filter");
  return filter ? glyphs.modifiers[filter].phrase : "";
}

function describeSubspell(subspell, previous) {
  const effect = subspell.find(t => t.type === "effect");
  const aspect = [...subspell].reverse().find(t => t.type === "aspect");
  const vectors = subspell.filter(t => t.type === "vector");

  if (!effect || !aspect) return "an incomplete arcane clause";

  const aspectData = glyphs.aspects[aspect.name] || {};
  const aspectAdj = aspectData.adjective || aspect.name.toLowerCase();
  const mainVector = vectors[vectors.length - 1];
  const firstVector = vectors[0];

  let phrase = "";

  if (mainVector?.name === "Summon") {
    const creature = aspectData.creature || `${aspect.name} creature`;
    const loc = previous?.terminalLocation ? ` at ${previous.terminalLocation}` : "";
    const dur = durationPhrase(mainVector);
    phrase = `summons an ${articleSafe(creature)}${loc} ${dur}`.replace(/\s+/g, " ").trim();
    return { text: phrase, terminalLocation: "the summoned creature", terminalKind: "summon" };
  }

  if (effect.name === "Neutral") {
    phrase = `creates a neutral ${aspectAdj} manifestation`;
  } else {
    const effectWord = glyphs.effects[effect.name]?.verb || effect.name.toLowerCase();
    if (!mainVector) {
      phrase = `empowers later ${aspectAdj} ${effectWord} manifestations`;
    } else if (mainVector.name === "Dart") {
      phrase = `a ${effectWord} ${rangeAdjective(mainVector)}${aspectAdj} dart`;
    } else if (mainVector.name === "Touch") {
      phrase = `a ${effectWord} ${aspectAdj} touch`;
    } else if (mainVector.name === "Self") {
      phrase = `a ${effectWord} ${aspectAdj} effect on the caster`;
    } else {
      const shape = glyphs.vectors[mainVector.name]?.phrase || mainVector.name.toLowerCase();
      const loc = previous?.terminalLocation ? ` at ${previous.terminalLocation}` : "";
      const dur = durationPhrase(mainVector);
      phrase = `a ${effectWord} ${rangeAdjective(mainVector)}${aspectAdj} ${shape}${loc}`;
      if (dur) phrase += ` ${dur}`;
    }
  }

  if (vectors.length > 1 && firstVector?.name === "Dart" && mainVector?.name !== "Dart") {
    phrase += ` carried by a ${rangeAdjective(firstVector)}dart`;
  }

  const fPhrase = vectors.map(filterPhrase).find(Boolean);
  if (fPhrase) phrase += ` ${fPhrase}`;

  let terminalLocation = "its endpoint";
  if (mainVector?.name === "Dart") terminalLocation = "the impact location";
  else if (VECTOR_AOE.has(mainVector?.name)) terminalLocation = `the ${mainVector.name.toLowerCase()}'s area`;
  else if (mainVector?.name === "Touch") terminalLocation = "the touched target";
  else if (mainVector?.name === "Self") terminalLocation = "the caster";

  return { text: phrase.replace(/\s+/g, " ").trim(), terminalLocation, terminalKind: mainVector?.name || "empowerment" };
}

function articleSafe(nounPhrase) {
  const cleaned = nounPhrase.trim();
  const article = /^[aeiou]/i.test(cleaned) ? "an" : "a";
  return `${article} ${cleaned}`;
}

function describeSpell(spell) {
  const pieces = [];
  let previous = null;

  for (const ring of spell.rings) {
    for (const sub of ring.subspells) {
      const desc = describeSubspell(sub, previous);
      pieces.push(desc.text);
      previous = desc;
    }
  }

  if (!pieces.length) return "No complete spell clauses detected.";

  let sentence = pieces[0];
  for (let i = 1; i < pieces.length; i++) {
    const p = pieces[i];
    if (/^summons\b/.test(p)) sentence += ` that ${p}`;
    else if (/^empowers\b/.test(p)) sentence += `, then ${p}`;
    else sentence += `, then creates ${p}`;
  }

  sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
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
      <td>${r.tokens.map(t => t.raw).join(" → ")}</td>
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

const runePaths = {
  Harm: `M0,-25 L9,-6 L24,-6 L12,4 L18,24 L0,11 L-18,24 L-12,4 L-24,-6 L-9,-6 Z`,
  Heal: `M0,-24 C12,-12 12,12 0,24 C-12,12 -12,-12 0,-24 M-16,0 L16,0 M0,-16 L0,16`,
  Hex: `M-22,-18 L22,18 M22,-18 L-22,18 M0,-26 L0,26 M-18,0 L18,0`,
  Bless: `M0,-26 L7,-7 L26,0 L7,7 L0,26 L-7,7 L-26,0 L-7,-7 Z M0,-14 L0,14 M-14,0 L14,0`,
  Neutral: `M0,-24 L21,-12 L21,12 L0,24 L-21,12 L-21,-12 Z M-10,-8 L10,8 M10,-8 L-10,8`,
  Fire: `M0,-28 C16,-12 3,-4 14,9 C21,18 8,28 0,28 C-13,28 -20,17 -13,6 C-7,-3 -4,-8 0,-28`,
  Poison: `M0,-22 C12,-22 22,-12 22,0 C22,12 12,22 0,22 C-12,22 -22,12 -22,0 C-22,-12 -12,-22 0,-22 M-9,-4 L-2,3 L10,-10 M-8,10 L8,10`,
  Force: `M-26,0 L22,0 M9,-13 L25,0 L9,13 M-16,-14 L-4,0 L-16,14`,
  Acid: `M0,-26 L20,-4 L8,24 L-16,20 L-24,-5 Z M-8,2 L8,2 M-3,10 L12,10`,
  Darkness: `M12,-23 C-8,-20 -18,-4 -12,12 C-5,29 15,24 23,10 C13,17 0,12 -3,0 C-6,-12 2,-20 12,-23`,
  Light: `M0,-26 L5,-8 L22,-16 L10,0 L26,5 L8,8 L16,24 L0,12 L-16,24 L-8,8 L-26,5 L-10,0 L-22,-16 L-5,-8 Z`,
  Thunder: `M-18,-23 L10,-23 L-2,-3 L18,-3 L-11,26 L0,5 L-18,5 Z`,
  Lightning: `M-6,-27 L18,-3 L5,-3 L12,27 L-18,0 L-4,0 Z`,
  Cold: `M0,-27 L0,27 M-23,-14 L23,14 M23,-14 L-23,14 M-8,-19 L0,-12 L8,-19 M-8,19 L0,12 L8,19`,
  Earth: `M0,-26 L24,-8 L15,22 L-15,22 L-24,-8 Z M-12,-2 L12,-2 M-6,9 L6,9`,
  Dart: `M-25,4 L14,4 L14,14 L27,0 L14,-14 L14,-4 L-25,-4 Z`,
  Self: `M0,-25 C14,-25 24,-14 24,0 C24,14 14,25 0,25 C-14,25 -24,14 -24,0 C-24,-14 -14,-25 0,-25 M0,-12 C7,-12 12,-7 12,0 C12,7 7,12 0,12 C-7,12 -12,7 -12,0 C-12,-7 -7,-12 0,-12`,
  Touch: `M-22,8 C-10,-16 10,-16 22,8 M-10,8 C-5,17 5,17 10,8 M-22,8 L-26,19 M22,8 L26,19`,
  Sphere: `M0,-25 C14,-25 25,-14 25,0 C25,14 14,25 0,25 C-14,25 -25,14 -25,0 C-25,-14 -14,-25 0,-25 M-25,0 C-10,-9 10,-9 25,0 M-25,0 C-10,9 10,9 25,0`,
  Circle: `M0,-26 C14,-26 26,-14 26,0 C26,14 14,26 0,26 C-14,26 -26,14 -26,0 C-26,-14 -14,-26 0,-26 M0,-16 C9,-16 16,-9 16,0 C16,9 9,16 0,16 C-9,16 -16,9 -16,0 C-16,-9 -9,-16 0,-16`,
  Cube: `M-18,-12 L0,-24 L18,-12 L18,12 L0,24 L-18,12 Z M-18,-12 L0,0 L18,-12 M0,0 L0,24`,
  Cylinder: `M-20,-14 C-20,-24 20,-24 20,-14 L20,14 C20,24 -20,24 -20,14 Z M-20,-14 C-20,-4 20,-4 20,-14 M-20,14 C-20,4 20,4 20,14`,
  Cone: `M0,-26 L25,22 L-25,22 Z M-13,22 C-6,14 6,14 13,22`,
  Line: `M-24,-24 L24,24 M-13,-24 L24,13 M-24,-13 L13,24`,
  Summon: `M0,-28 C17,-24 27,-12 24,5 C21,20 8,28 -8,23 C-23,17 -27,0 -19,-14 C-13,-25 -2,-27 0,-28 M-11,-4 L11,-4 L0,13 Z`
};

function glyphShape(g, x, y, size = 22) {
  const path = runePaths[g.name] || `M-18,-18 L18,-18 L18,18 L-18,18 Z`;
  const stroke = g.type === "unknown" ? "#e78888" : "#d8b66a";
  const glow = g.type === "aspect" ? "#9ad7d3" : "#d8b66a";
  const label = `<text x="${x}" y="${y + size + 18}" text-anchor="middle" font-size="10" fill="#d8c99d" font-family="Georgia, serif">${escapeXml(g.name)}</text>`;
  const mods = (g.rangeMods || []).concat(g.attachedMods || []).join("");
  const modText = mods ? `<text x="${x}" y="${y - size - 9}" text-anchor="middle" font-size="13" fill="#9ad7d3" font-family="Georgia, serif">${escapeXml(mods)}</text>` : "";
  return `
    <g transform="translate(${x}, ${y}) scale(${size / 28})">
      <path d="${path}" fill="none" stroke="${stroke}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${path}" fill="none" stroke="${glow}" stroke-opacity="0.16" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
    ${modText}
    ${label}
  `;
}

function renderCircle(spell) {
  const size = 820;
  const cx = size / 2;
  const cy = size / 2;
  const ringGap = 84;
  const baseRadius = 90;
  const maxRadius = baseRadius + (spell.rings.length - 1) * ringGap + 78;

  let svg = `<svg id="spellSvg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="Spell circle">
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

  const markCount = 60;
  for (let i = 0; i < markCount; i++) {
    const a = -Math.PI / 2 + (Math.PI * 2 * i / markCount);
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
    const radius = 90 + (ring.level - 1) * 84;
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
      svg += glyphShape(token, x, y, 23);
    });
  }

  svg += `
    <g filter="url(#softGlow)">
      <circle cx="${cx}" cy="${cy}" r="34" fill="none" stroke="#d8b66a" stroke-width="1.4"/>
      <path d="M ${cx} ${cy-26} L ${cx+22} ${cy+13} L ${cx-22} ${cy+13} Z" fill="none" stroke="#d8b66a" stroke-width="1.2"/>
      <circle cx="${cx}" cy="${cy}" r="5" fill="#d8b66a" opacity="0.75"/>
    </g>
  `;

  svg += `</svg>`;
  circleMount.innerHTML = svg;
}

function insertGlyph(glyph, kind) {
  const start = input.selectionStart;
  const end = input.selectionEnd;
  const before = input.value.slice(0, start);
  const after = input.value.slice(end);

  let insert = glyph;

  if (kind === "modifier") {
    insert = glyph;
  } else {
    const left = before.trimEnd();
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
        ${items.map(([label, kind]) => `<span class="glyph-chip" draggable="true" data-kind="${kind}" data-glyph="${label}">${label}</span>`).join("")}
      </div>
    </div>
  `).join("");

  glyphPalette.querySelectorAll(".glyph-chip").forEach(chip => {
    chip.addEventListener("click", () => insertGlyph(chip.dataset.glyph, chip.dataset.kind));
    chip.addEventListener("dragstart", event => {
      event.dataTransfer.setData("text/plain", JSON.stringify({
        glyph: chip.dataset.glyph,
        kind: chip.dataset.kind
      }));
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
      const caret = getCaretFromDrop(input, event);
      input.setSelectionRange(caret, caret);
      insertGlyph(data.glyph, data.kind);
    } catch {
      const text = event.dataTransfer.getData("text/plain");
      insertGlyph(text, "glyph");
    }
  });
}

function getCaretFromDrop(textarea, event) {
  if (document.caretPositionFromPoint) {
    const pos = document.caretPositionFromPoint(event.clientX, event.clientY);
    return pos?.offset ?? textarea.selectionStart;
  }
  if (document.caretRangeFromPoint) {
    const range = document.caretRangeFromPoint(event.clientX, event.clientY);
    return range?.startOffset ?? textarea.selectionStart;
  }
  return textarea.selectionStart;
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
      <p>${Object.keys(data).join(", ")}</p>
    </div>
  `).join("");
}

parseBtn.addEventListener("click", build);
input.addEventListener("input", build);

copyJsonBtn.addEventListener("click", async () => {
  if (!currentSpell) build();
  await navigator.clipboard.writeText(JSON.stringify(currentSpell, null, 2));
  copyJsonBtn.textContent = "Copied";
  setTimeout(() => copyJsonBtn.textContent = "Copy JSON", 900);
});

exportSvgBtn.addEventListener("click", () => {
  if (!currentSpell) build();
  const svg = document.querySelector("#spellSvg").outerHTML;
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
