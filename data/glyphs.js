export default {
  "effects": {
    "Harm": {
      "complexity": 1
    },
    "Heal": {
      "complexity": 1
    },
    "Hex": {
      "complexity": 1
    },
    "Bless": {
      "complexity": 1
    },
    "Neutral": {
      "complexity": 1,
      "notes": "Only effect that may use Summon."
    }
  },
  "aspects": {
    "Fire": {},
    "Poison": {},
    "Force": {},
    "Acid": {},
    "Darkness": {},
    "Light": {},
    "Thunder": {},
    "Lightning": {},
    "Cold": {},
    "Earth": {}
  },
  "vectors": {
    "Self": {
      "complexity": 0.25,
      "category": "contact",
      "rangeModifiable": false
    },
    "Touch": {
      "complexity": 0.5,
      "category": "contact",
      "rangeModifiable": false
    },
    "Dart": {
      "complexity": 1,
      "category": "projected",
      "range": "6 hexes",
      "rangeModifiable": true
    },
    "Sphere": {
      "complexity": 1,
      "category": "area",
      "radius": "1 hex",
      "rangeModifiable": true,
      "persistent": true
    },
    "Cube": {
      "complexity": 1,
      "category": "area",
      "side": "1 hex",
      "rangeModifiable": true,
      "persistent": true
    },
    "Cylinder": {
      "complexity": 1,
      "category": "area",
      "radius": "1 hex",
      "length": "2 hexes",
      "rangeModifiable": true,
      "persistent": true
    },
    "Cone": {
      "complexity": 1,
      "category": "area",
      "angle": "45 degrees",
      "length": "2 hexes",
      "rangeModifiable": true,
      "persistent": true
    },
    "Line": {
      "complexity": 1,
      "category": "area",
      "width": "1 hex",
      "length": "3 hexes",
      "rangeModifiable": true,
      "persistent": true
    },
    "Circle": {
      "complexity": 1,
      "category": "area",
      "radius": "1 hex",
      "rangeModifiable": true,
      "persistent": true
    },
    "Summon": {
      "complexity": 2,
      "category": "constructive",
      "duration": "8T",
      "rangeModifiable": false,
      "persistent": true
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
      "multiplier": 2
    },
    "E": {
      "kind": "filter",
      "multiplier": 2
    }
  }
};
