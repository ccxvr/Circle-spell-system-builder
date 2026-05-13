export default {
  "effects": {
    "Harm": {
      "complexity": 1,
      "verb": "harmful"
    },
    "Heal": {
      "complexity": 1,
      "verb": "healing"
    },
    "Hex": {
      "complexity": 1,
      "verb": "hexing"
    },
    "Bless": {
      "complexity": 1,
      "verb": "blessing"
    },
    "Neutral": {
      "complexity": 1,
      "verb": "neutral",
      "notes": "Only effect that may use Summon."
    }
  },
  "aspects": {
    "Fire": {
      "adjective": "fire",
      "creature": "Fire creature"
    },
    "Poison": {
      "adjective": "poison",
      "creature": "Poison creature"
    },
    "Force": {
      "adjective": "force",
      "creature": "Force creature"
    },
    "Acid": {
      "adjective": "acid",
      "creature": "Acid creature"
    },
    "Darkness": {
      "adjective": "darkness",
      "creature": "Darkness creature"
    },
    "Light": {
      "adjective": "light",
      "creature": "Light creature"
    },
    "Thunder": {
      "adjective": "thunder",
      "creature": "Thunder creature"
    },
    "Lightning": {
      "adjective": "lightning",
      "creature": "Lightning creature"
    },
    "Cold": {
      "adjective": "cold",
      "creature": "Cold creature"
    },
    "Earth": {
      "adjective": "earth",
      "creature": "Earth creature"
    }
  },
  "vectors": {
    "Self": {
      "complexity": 0.25,
      "category": "contact",
      "rangeModifiable": false,
      "phrase": "on the caster"
    },
    "Touch": {
      "complexity": 0.5,
      "category": "contact",
      "rangeModifiable": false,
      "phrase": "by touch"
    },
    "Dart": {
      "complexity": 1,
      "category": "projected",
      "range": "6 hexes",
      "rangeModifiable": true,
      "phrase": "dart"
    },
    "Sphere": {
      "complexity": 1,
      "category": "area",
      "radius": "1 hex",
      "rangeModifiable": true,
      "persistent": true,
      "phrase": "sphere"
    },
    "Cube": {
      "complexity": 1,
      "category": "area",
      "side": "1 hex",
      "rangeModifiable": true,
      "persistent": true,
      "phrase": "cube"
    },
    "Cylinder": {
      "complexity": 1,
      "category": "area",
      "radius": "1 hex",
      "length": "2 hexes",
      "rangeModifiable": true,
      "persistent": true,
      "phrase": "cylinder"
    },
    "Cone": {
      "complexity": 1,
      "category": "area",
      "angle": "45 degrees",
      "length": "2 hexes",
      "rangeModifiable": true,
      "persistent": true,
      "phrase": "cone"
    },
    "Line": {
      "complexity": 1,
      "category": "area",
      "width": "1 hex",
      "length": "3 hexes",
      "rangeModifiable": true,
      "persistent": true,
      "phrase": "line"
    },
    "Circle": {
      "complexity": 1,
      "category": "area",
      "radius": "1 hex",
      "rangeModifiable": true,
      "persistent": true,
      "phrase": "circle"
    },
    "Summon": {
      "complexity": 2,
      "category": "constructive",
      "duration": "8T",
      "rangeModifiable": false,
      "persistent": true,
      "phrase": "summon"
    }
  },
  "modifiers": {
    "+": {
      "kind": "range",
      "multiplier": 2
    },
    "-": {
      "kind": "range",
      "multiplier": 0.5
    },
    "T": {
      "kind": "duration",
      "multiplier": 2
    },
    "A": {
      "kind": "filter",
      "multiplier": 2,
      "phrase": "that affects allies only"
    },
    "E": {
      "kind": "filter",
      "multiplier": 2,
      "phrase": "that affects enemies only"
    }
  }
};
