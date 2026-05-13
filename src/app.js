import glyphs from "../data/glyphs.js";

const input = document.querySelector("#spellInput");
const parseBtn = document.querySelector("#parseBtn");
const exportSvgBtn = document.querySelector("#exportSvgBtn");
const copyJsonBtn = document.querySelector("#copyJsonBtn");
const circleMount = document.querySelector("#circleMount");
const summary = document.querySelector("#summary");
const jsonOutput = document.querySelector("#jsonOutput");
const glyphReference = document.querySelector("#glyphReference");

let currentSpell = null;

function normalizeToken(raw) {
  return raw.trim()
    .replace(/→/g, ">")
    .replace(/\s+/g, "");
}

function splitGlyphChain(text) {
  return text
    .replace(/→/g, ">")
    .split(">")
    .map(t => t.trim())
    .filter(Boolean);
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
    load: ringLoad
  };
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

function summarize(spell) {
  const totalLoadRaw = spell.rings.reduce((sum, r) => sum + r.load, 0);
  const totalLoad = Math.ceil(totalLoadRaw);
  const complexity = complexityFromLoad(totalLoad);

  spell.totalLoadRaw = totalLoadRaw;
  spell.totalLoad = totalLoad;
  spell.complexity = complexity;

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

  summary.innerHTML = `
    <p><strong>Total Load:</strong> ${totalLoad} <span class="muted">(raw ${totalLoadRaw.toFixed(2)})</span></p>
    <p><strong>Spell Complexity:</strong> ${complexity}</p>
    <table>
      <thead><tr><th>Ring</th><th>Glyphs</th><th>Load</th></tr></thead>
      <tbody>${ringRows}</tbody>
    </table>
    ${warnings.length ? `<h3>Warnings</h3><ul>${warnings.map(w => `<li>${w}</li>`).join("")}</ul>` : ""}
  `;
  jsonOutput.textContent = JSON.stringify(spell, null, 2);
}

function glyphShape(g, x, y, size = 22) {
  const common = `stroke="#d7b36a" stroke-width="2" fill="none"`;
  const label = `<text x="${x}" y="${y + size + 14}" text-anchor="middle" font-size="10" fill="#cbd5e1">${escapeXml(g.name)}</text>`;
  let shape = "";

  if (g.type === "effect") {
    shape = `<path d="M ${x} ${y-size} L ${x+size} ${y} L ${x} ${y+size} L ${x-size} ${y} Z" ${common}/>`;
  } else if (g.type === "aspect") {
    shape = `<circle cx="${x}" cy="${y}" r="${size * 0.85}" ${common}/><path d="M ${x-size*.6} ${y+size*.6} L ${x+size*.6} ${y-size*.6}" ${common}/>`;
  } else if (g.type === "vector") {
    if (g.name === "Dart") shape = `<path d="M ${x-size} ${y} L ${x+size} ${y} M ${x+size} ${y} L ${x+size*.45} ${y-size*.45} M ${x+size} ${y} L ${x+size*.45} ${y+size*.45}" ${common}/>`;
    else if (g.name === "Sphere" || g.name === "Circle") shape = `<circle cx="${x}" cy="${y}" r="${size}" ${common}/>`;
    else if (g.name === "Self") shape = `<circle cx="${x}" cy="${y}" r="${size*.45}" fill="#d7b36a"/><circle cx="${x}" cy="${y}" r="${size}" ${common}/>`;
    else if (g.name === "Touch") shape = `<path d="M ${x-size} ${y} Q ${x} ${y-size} ${x+size} ${y}" ${common}/><circle cx="${x+size}" cy="${y}" r="4" fill="#d7b36a"/>`;
    else if (g.name === "Cone") shape = `<path d="M ${x-size} ${y+size} L ${x} ${y-size} L ${x+size} ${y+size}" ${common}/>`;
    else if (g.name === "Line") shape = `<path d="M ${x-size} ${y-size} L ${x+size} ${y+size}" ${common}/><path d="M ${x-size*.5} ${y-size} L ${x+size} ${y+size*.5}" ${common}/>`;
    else if (g.name === "Cube") shape = `<rect x="${x-size}" y="${y-size}" width="${size*2}" height="${size*2}" ${common}/>`;
    else if (g.name === "Cylinder") shape = `<ellipse cx="${x}" cy="${y-size*.7}" rx="${size}" ry="${size*.35}" ${common}/><path d="M ${x-size} ${y-size*.7} L ${x-size} ${y+size*.7} M ${x+size} ${y-size*.7} L ${x+size} ${y+size*.7}" ${common}/><ellipse cx="${x}" cy="${y+size*.7}" rx="${size}" ry="${size*.35}" ${common}/>`;
    else if (g.name === "Summon") shape = `<path d="M ${x} ${y-size} C ${x+size} ${y-size} ${x+size} ${y+size} ${x} ${y+size} C ${x-size} ${y+size} ${x-size} ${y-size} ${x} ${y-size}" ${common}/><path d="M ${x-size*.55} ${y} L ${x+size*.55} ${y}" ${common}/>`;
    else shape = `<rect x="${x-size}" y="${y-size}" width="${size*2}" height="${size*2}" ${common}/>`;
  } else {
    shape = `<text x="${x}" y="${y}" text-anchor="middle" font-size="18" fill="#ff7070">?</text>`;
  }

  const mods = (g.rangeMods || []).concat(g.attachedMods || []).join("");
  const modText = mods ? `<text x="${x}" y="${y - size - 7}" text-anchor="middle" font-size="12" fill="#88d8ff">${escapeXml(mods)}</text>` : "";
  return `<g>${shape}${modText}${label}</g>`;
}

function renderCircle(spell) {
  const size = 760;
  const cx = size / 2;
  const cy = size / 2;
  const ringGap = 78;
  const baseRadius = 80;
  const maxRadius = baseRadius + (spell.rings.length - 1) * ringGap + 65;

  let svg = `<svg id="spellSvg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="Spell circle">
    <rect width="100%" height="100%" fill="#101116"/>
    <circle cx="${cx}" cy="${cy}" r="${maxRadius}" fill="none" stroke="#232632" stroke-width="2"/>
  `;

  for (const ring of spell.rings) {
    const radius = baseRadius + (ring.level - 1) * ringGap;
    svg += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="#343846" stroke-width="2"/>`;
    svg += `<text x="${cx}" y="${cy-radius-8}" text-anchor="middle" font-size="12" fill="#7f8494">Ring ${ring.level}</text>`;

    const n = Math.max(ring.tokens.length, 1);
    ring.tokens.forEach((token, i) => {
      // Start at 12 o'clock, read clockwise.
      const angle = -Math.PI / 2 + (2 * Math.PI * i / n);
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      svg += glyphShape(token, x, y, 20);
    });
  }

  svg += `</svg>`;
  circleMount.innerHTML = svg;
}

function escapeXml(str) {
  return String(str).replace(/[<>&'"]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
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

buildReference();
build();
