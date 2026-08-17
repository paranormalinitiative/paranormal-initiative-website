const effectGroups = [
  {
    "id": "",
    "label": "ALL",
    "name": "All"
  },
  {
    "id": "General",
    "label": "GEN",
    "name": "General"
  },
  {
    "id": "Water",
    "label": "WATER",
    "name": "Water"
  },
  {
    "id": "Smoke",
    "label": "SMOKE",
    "name": "Smoke"
  },
  {
    "id": "Fire",
    "label": "FIRE",
    "name": "Fire"
  },
  {
    "id": "Ink",
    "label": "INK",
    "name": "Ink"
  },
  {
    "id": "Steam",
    "label": "STEAM",
    "name": "Steam"
  },
  {
    "id": "Reflection",
    "label": "REF",
    "name": "Reflection"
  }
];

const effects = [
  {
    "id": "general-normal",
    "label": "Normal",
    "group": "General",
    "description": "Clean original source - no effects applied.",
    "layers": []
  },
  {
    "id": "general-monochrome",
    "label": "Monochrome",
    "group": "General",
    "description": "Standard grayscale conversion.",
    "layers": [
      {
        "type": "Monochrome",
        "strength": 1,
        "extra": 0
      }
    ]
  },
  {
    "id": "general-high-contrast",
    "label": "High Contrast",
    "group": "General",
    "description": "Increased contrast for detail visibility.",
    "layers": [
      {
        "type": "Contrast",
        "strength": 0.75,
        "extra": 0
      }
    ]
  },
  {
    "id": "general-negative",
    "label": "Negative",
    "group": "General",
    "description": "Inverted luminance.",
    "layers": [
      {
        "type": "Negative",
        "strength": 1,
        "extra": 0
      }
    ]
  },
  {
    "id": "general-edge",
    "label": "Edge",
    "group": "General",
    "description": "Sobel edge detection overlay.",
    "layers": [
      {
        "type": "EdgeEnhancement",
        "strength": 0.6,
        "extra": 0
      }
    ]
  },
  {
    "id": "general-high-gain",
    "label": "High Gain",
    "group": "General",
    "description": "Shadow enhancement with gamma lift and grain.",
    "layers": [
      {
        "type": "HighGain",
        "strength": 0.7,
        "extra": 0
      }
    ]
  },
  {
    "id": "general-soft-vignette",
    "label": "Soft Vignette",
    "group": "General",
    "description": "Vintage edge darkening for center-focused review.",
    "layers": [
      {
        "type": "Vignette",
        "strength": 0.42,
        "extra": 0
      }
    ]
  },
  {
    "id": "general-vintage-contrast",
    "label": "Vintage Contrast",
    "group": "General",
    "description": "Retro contrast, lift, and vignette balance for review images.",
    "layers": [
      {
        "type": "Contrast",
        "strength": 0.35,
        "extra": 0
      },
      {
        "type": "Gamma",
        "strength": 0.2,
        "extra": 0
      },
      {
        "type": "SoftGlow",
        "strength": 0.2,
        "extra": 0
      },
      {
        "type": "Vignette",
        "strength": 0.35,
        "extra": 0
      }
    ]
  },
  {
    "id": "general-screen-glow",
    "label": "Screen Glow",
    "group": "General",
    "description": "Soft screen-style lift for dim source frames.",
    "layers": [
      {
        "type": "Gamma",
        "strength": 0.35,
        "extra": 0
      },
      {
        "type": "SoftGlow",
        "strength": 0.35,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.2,
        "extra": 0
      }
    ]
  },
  {
    "id": "general-thermal-style",
    "label": "Thermal Style",
    "group": "General",
    "description": "False-color thermal visualization effect.",
    "layers": [
      {
        "type": "Monochrome",
        "strength": 1,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.5,
        "extra": 0
      },
      {
        "type": "Gamma",
        "strength": 0.5,
        "extra": 0
      },
      {
        "type": "HighGain",
        "strength": 0.3,
        "extra": 0
      }
    ]
  },
  {
    "id": "general-night-vision",
    "label": "Night Vision",
    "group": "General",
    "description": "Green-tinted night vision style.",
    "layers": [
      {
        "type": "Monochrome",
        "strength": 1,
        "extra": 1
      },
      {
        "type": "Contrast",
        "strength": 0.4,
        "extra": 0
      },
      {
        "type": "Gamma",
        "strength": 0.3,
        "extra": 0
      },
      {
        "type": "SoftGlow",
        "strength": 0.3,
        "extra": 0
      }
    ]
  },
  {
    "id": "general-x-ray-style",
    "label": "X-Ray Style",
    "group": "General",
    "description": "Inverted high-contrast visualization.",
    "layers": [
      {
        "type": "Monochrome",
        "strength": 1,
        "extra": 3
      },
      {
        "type": "Negative",
        "strength": 0.7,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.6,
        "extra": 0
      }
    ]
  },
  {
    "id": "water-natural",
    "label": "Natural",
    "group": "Water",
    "description": "Clean water source.",
    "layers": []
  },
  {
    "id": "water-reflection-boost",
    "label": "Reflection Boost",
    "group": "Water",
    "description": "Enhanced surface reflections.",
    "layers": [
      {
        "type": "Contrast",
        "strength": 0.5,
        "extra": 0
      },
      {
        "type": "Gamma",
        "strength": 0.3,
        "extra": 0
      }
    ]
  },
  {
    "id": "water-deep-contrast",
    "label": "Deep Contrast",
    "group": "Water",
    "description": "Deeper contrast for water structures.",
    "layers": [
      {
        "type": "Contrast",
        "strength": 0.9,
        "extra": 0
      },
      {
        "type": "HighGain",
        "strength": 0.4,
        "extra": 0
      }
    ]
  },
  {
    "id": "water-blue-luma",
    "label": "Blue Luma",
    "group": "Water",
    "description": "Blue-channel emphasis.",
    "layers": [
      {
        "type": "Monochrome",
        "strength": 1,
        "extra": 3
      },
      {
        "type": "Contrast",
        "strength": 0.4,
        "extra": 0
      }
    ]
  },
  {
    "id": "water-cyan-detail",
    "label": "Cyan Detail",
    "group": "Water",
    "description": "Cyan-weighted detail enhancement.",
    "layers": [
      {
        "type": "Monochrome",
        "strength": 1,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.5,
        "extra": 0
      }
    ]
  },
  {
    "id": "water-surface-edge",
    "label": "Surface Edge",
    "group": "Water",
    "description": "Edge-enhanced surface structure.",
    "layers": [
      {
        "type": "EdgeEnhancement",
        "strength": 0.7,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.3,
        "extra": 0
      }
    ]
  },
  {
    "id": "water-ripple-detail",
    "label": "Ripple Detail",
    "group": "Water",
    "description": "Subtle ripple and wave detection.",
    "layers": [
      {
        "type": "EdgeEnhancement",
        "strength": 0.5,
        "extra": 0
      },
      {
        "type": "Gamma",
        "strength": 0.3,
        "extra": 0
      },
      {
        "type": "HighGain",
        "strength": 0.3,
        "extra": 0
      }
    ]
  },
  {
    "id": "water-high-gain-water",
    "label": "High Gain Water",
    "group": "Water",
    "description": "Enhanced shadow detail for dark water.",
    "layers": [
      {
        "type": "HighGain",
        "strength": 0.8,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.3,
        "extra": 0
      }
    ]
  },
  {
    "id": "water-monochrome-water",
    "label": "Monochrome Water",
    "group": "Water",
    "description": "Grayscale water visualization.",
    "layers": [
      {
        "type": "Monochrome",
        "strength": 1,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.4,
        "extra": 0
      }
    ]
  },
  {
    "id": "water-negative-water",
    "label": "Negative Water",
    "group": "Water",
    "description": "Inverted water structures.",
    "layers": [
      {
        "type": "Negative",
        "strength": 1,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.4,
        "extra": 0
      }
    ]
  },
  {
    "id": "water-false-color",
    "label": "False Color",
    "group": "Water",
    "description": "Thermal-style visualization for water.",
    "layers": [
      {
        "type": "Monochrome",
        "strength": 1,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.5,
        "extra": 0
      },
      {
        "type": "Gamma",
        "strength": 0.4,
        "extra": 0
      },
      {
        "type": "HighGain",
        "strength": 0.3,
        "extra": 0
      }
    ]
  },
  {
    "id": "water-vintage-blue-water",
    "label": "Vintage Blue Water",
    "group": "Water",
    "description": "Blue-weighted vintage contrast for reflective water detail.",
    "layers": [
      {
        "type": "Monochrome",
        "strength": 1,
        "extra": 3
      },
      {
        "type": "Contrast",
        "strength": 0.45,
        "extra": 0
      },
      {
        "type": "Gamma",
        "strength": 0.25,
        "extra": 0
      },
      {
        "type": "Vignette",
        "strength": 0.25,
        "extra": 0
      }
    ]
  },
  {
    "id": "water-soft-screen-water",
    "label": "Soft Screen Water",
    "group": "Water",
    "description": "Gentle lifted glow for dim water-scrying frames.",
    "layers": [
      {
        "type": "Gamma",
        "strength": 0.25,
        "extra": 0
      },
      {
        "type": "SoftGlow",
        "strength": 0.35,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.25,
        "extra": 0
      },
      {
        "type": "Vignette",
        "strength": 0.2,
        "extra": 0
      }
    ]
  },
  {
    "id": "water-deep-vignette-water",
    "label": "Deep Vignette Water",
    "group": "Water",
    "description": "Darkened edges with stronger center contrast for vessel work.",
    "layers": [
      {
        "type": "Contrast",
        "strength": 0.55,
        "extra": 0
      },
      {
        "type": "Vignette",
        "strength": 0.45,
        "extra": 0
      },
      {
        "type": "HighGain",
        "strength": 0.25,
        "extra": 0
      }
    ]
  },
  {
    "id": "water-lut-kodak-2383-print",
    "label": "LUT - Kodak 2383 Print",
    "group": "Water",
    "description": "Film print contrast LUT for reflective water detail.",
    "layers": [],
    "lut": "LUTs/water_scrying/kodak_2383_constlclip.cube"
  },
  {
    "id": "water-lut-fuji-3513-print",
    "label": "LUT - Fuji 3513 Print",
    "group": "Water",
    "description": "Fuji print LUT with slightly different highlight behavior.",
    "layers": [],
    "lut": "LUTs/water_scrying/fuji_3513_constlclip.cube"
  },
  {
    "id": "water-lut-ilford-hp5-mono",
    "label": "LUT - Ilford HP5 Mono",
    "group": "Water",
    "description": "Black-and-white film LUT for tonal water structure.",
    "layers": [],
    "lut": "LUTs/water_scrying/ilford_hp_5.cube"
  },
  {
    "id": "water-lut-fuji-reala-100",
    "label": "LUT - Fuji Reala 100",
    "group": "Water",
    "description": "Natural color negative LUT for subtle water color separation.",
    "layers": [],
    "lut": "LUTs/water_scrying/fuji_superia_reala_100.cube"
  },
  {
    "id": "water-lut-kodak-ektar-100",
    "label": "LUT - Kodak Ektar 100",
    "group": "Water",
    "description": "Saturated color negative LUT for stronger color contrast.",
    "layers": [],
    "lut": "LUTs/water_scrying/kodak_ektar_100.cube"
  },
  {
    "id": "smoke-natural",
    "label": "Natural",
    "group": "Smoke",
    "description": "Clean smoke source.",
    "layers": []
  },
  {
    "id": "smoke-density-boost",
    "label": "Density Boost",
    "group": "Smoke",
    "description": "Enhanced smoke density visualization.",
    "layers": [
      {
        "type": "Contrast",
        "strength": 0.7,
        "extra": 0
      },
      {
        "type": "Gamma",
        "strength": 0.3,
        "extra": 0
      },
      {
        "type": "HighGain",
        "strength": 0.4,
        "extra": 0
      }
    ]
  },
  {
    "id": "smoke-edge",
    "label": "Edge",
    "group": "Smoke",
    "description": "Edge-detected smoke structures.",
    "layers": [
      {
        "type": "EdgeEnhancement",
        "strength": 0.6,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.5,
        "extra": 0
      }
    ]
  },
  {
    "id": "smoke-fine-structure",
    "label": "Fine Structure",
    "group": "Smoke",
    "description": "Detailed smoke micro-structure.",
    "layers": [
      {
        "type": "EdgeEnhancement",
        "strength": 0.8,
        "extra": 0
      },
      {
        "type": "HighGain",
        "strength": 0.5,
        "extra": 0
      }
    ]
  },
  {
    "id": "smoke-blue-contrast",
    "label": "Blue Contrast",
    "group": "Smoke",
    "description": "Blue-weighted smoke detail.",
    "layers": [
      {
        "type": "Monochrome",
        "strength": 1,
        "extra": 3
      },
      {
        "type": "Contrast",
        "strength": 0.6,
        "extra": 0
      }
    ]
  },
  {
    "id": "smoke-green-contrast",
    "label": "Green Contrast",
    "group": "Smoke",
    "description": "Green-weighted smoke detail.",
    "layers": [
      {
        "type": "Monochrome",
        "strength": 1,
        "extra": 1
      },
      {
        "type": "Contrast",
        "strength": 0.6,
        "extra": 0
      }
    ]
  },
  {
    "id": "smoke-monochrome",
    "label": "Monochrome",
    "group": "Smoke",
    "description": "Grayscale smoke visualization.",
    "layers": [
      {
        "type": "Monochrome",
        "strength": 1,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.5,
        "extra": 0
      }
    ]
  },
  {
    "id": "smoke-negative",
    "label": "Negative",
    "group": "Smoke",
    "description": "Inverted smoke structures.",
    "layers": [
      {
        "type": "Negative",
        "strength": 1,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.5,
        "extra": 0
      }
    ]
  },
  {
    "id": "smoke-high-gain",
    "label": "High Gain",
    "group": "Smoke",
    "description": "Maximum shadow detail recovery.",
    "layers": [
      {
        "type": "HighGain",
        "strength": 0.9,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.4,
        "extra": 0
      }
    ]
  },
  {
    "id": "smoke-false-color",
    "label": "False Color",
    "group": "Smoke",
    "description": "Thermal-style smoke visualization.",
    "layers": [
      {
        "type": "Monochrome",
        "strength": 1,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.5,
        "extra": 0
      },
      {
        "type": "Gamma",
        "strength": 0.4,
        "extra": 0
      },
      {
        "type": "HighGain",
        "strength": 0.4,
        "extra": 0
      }
    ]
  },
  {
    "id": "smoke-vintage-gray",
    "label": "Vintage Gray",
    "group": "Smoke",
    "description": "Grayscale vintage contrast for smoke and mist structure.",
    "layers": [
      {
        "type": "Monochrome",
        "strength": 1,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.45,
        "extra": 0
      },
      {
        "type": "Vignette",
        "strength": 0.35,
        "extra": 0
      }
    ]
  },
  {
    "id": "smoke-screen-lift",
    "label": "Screen Lift",
    "group": "Smoke",
    "description": "Lifted midtones with soft glow for pale smoke sources.",
    "layers": [
      {
        "type": "Gamma",
        "strength": 0.45,
        "extra": 0
      },
      {
        "type": "SoftGlow",
        "strength": 0.25,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.25,
        "extra": 0
      }
    ]
  },
  {
    "id": "smoke-blue-screen-smoke",
    "label": "Blue Screen Smoke",
    "group": "Smoke",
    "description": "Cool channel isolation with soft lifted contrast.",
    "layers": [
      {
        "type": "Monochrome",
        "strength": 1,
        "extra": 3
      },
      {
        "type": "Gamma",
        "strength": 0.3,
        "extra": 0
      },
      {
        "type": "SoftGlow",
        "strength": 0.2,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.35,
        "extra": 0
      }
    ]
  },
  {
    "id": "fire-natural",
    "label": "Natural",
    "group": "Fire",
    "description": "Clean fire source.",
    "layers": []
  },
  {
    "id": "fire-flame-detail",
    "label": "Flame Detail",
    "group": "Fire",
    "description": "Enhanced flame structure.",
    "layers": [
      {
        "type": "EdgeEnhancement",
        "strength": 0.5,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.5,
        "extra": 0
      }
    ]
  },
  {
    "id": "fire-high-contrast",
    "label": "High Contrast",
    "group": "Fire",
    "description": "Maximum flame contrast.",
    "layers": [
      {
        "type": "Contrast",
        "strength": 0.9,
        "extra": 0
      },
      {
        "type": "Gamma",
        "strength": 0.4,
        "extra": 0
      }
    ]
  },
  {
    "id": "fire-ember-detail",
    "label": "Ember Detail",
    "group": "Fire",
    "description": "Enhanced ember and spark visibility.",
    "layers": [
      {
        "type": "HighGain",
        "strength": 0.7,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.4,
        "extra": 0
      }
    ]
  },
  {
    "id": "fire-monochrome",
    "label": "Monochrome",
    "group": "Fire",
    "description": "Grayscale fire visualization.",
    "layers": [
      {
        "type": "Monochrome",
        "strength": 1,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.4,
        "extra": 0
      }
    ]
  },
  {
    "id": "fire-negative",
    "label": "Negative",
    "group": "Fire",
    "description": "Inverted flame structures.",
    "layers": [
      {
        "type": "Negative",
        "strength": 1,
        "extra": 0
      }
    ]
  },
  {
    "id": "fire-edge",
    "label": "Edge",
    "group": "Fire",
    "description": "Edge-detected flame boundaries.",
    "layers": [
      {
        "type": "EdgeEnhancement",
        "strength": 0.7,
        "extra": 0
      }
    ]
  },
  {
    "id": "fire-heat-false-color",
    "label": "Heat False Color",
    "group": "Fire",
    "description": "Thermal-style heat visualization.",
    "layers": [
      {
        "type": "Monochrome",
        "strength": 1,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.6,
        "extra": 0
      },
      {
        "type": "Gamma",
        "strength": 0.5,
        "extra": 0
      },
      {
        "type": "HighGain",
        "strength": 0.3,
        "extra": 0
      }
    ]
  },
  {
    "id": "fire-shadow-recovery",
    "label": "Shadow Recovery",
    "group": "Fire",
    "description": "Recover shadow detail in bright flames.",
    "layers": [
      {
        "type": "HighGain",
        "strength": 0.9,
        "extra": 0
      },
      {
        "type": "Gamma",
        "strength": 0.3,
        "extra": 0
      }
    ]
  },
  {
    "id": "fire-amber-vintage",
    "label": "Amber Vintage",
    "group": "Fire",
    "description": "Warm monochrome contrast with vintage edge falloff.",
    "layers": [
      {
        "type": "Monochrome",
        "strength": 1,
        "extra": 4
      },
      {
        "type": "Contrast",
        "strength": 0.45,
        "extra": 0
      },
      {
        "type": "Gamma",
        "strength": 0.2,
        "extra": 0
      },
      {
        "type": "Vignette",
        "strength": 0.3,
        "extra": 0
      }
    ]
  },
  {
    "id": "fire-flame-screen-glow",
    "label": "Flame Screen Glow",
    "group": "Fire",
    "description": "Softened glow pass for bright fire and candle sources.",
    "layers": [
      {
        "type": "SoftGlow",
        "strength": 0.35,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.35,
        "extra": 0
      },
      {
        "type": "Gamma",
        "strength": 0.2,
        "extra": 0
      }
    ]
  },
  {
    "id": "ink-natural",
    "label": "Natural",
    "group": "Ink",
    "description": "Clean ink source.",
    "layers": []
  },
  {
    "id": "ink-flow-detail",
    "label": "Flow Detail",
    "group": "Ink",
    "description": "Enhanced flow pattern visibility.",
    "layers": [
      {
        "type": "EdgeEnhancement",
        "strength": 0.6,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.4,
        "extra": 0
      }
    ]
  },
  {
    "id": "ink-edge",
    "label": "Edge",
    "group": "Ink",
    "description": "Edge-detected pigment boundaries.",
    "layers": [
      {
        "type": "EdgeEnhancement",
        "strength": 0.8,
        "extra": 0
      }
    ]
  },
  {
    "id": "ink-high-contrast",
    "label": "High Contrast",
    "group": "Ink",
    "description": "Maximum pigment contrast.",
    "layers": [
      {
        "type": "Contrast",
        "strength": 0.9,
        "extra": 0
      },
      {
        "type": "Gamma",
        "strength": 0.3,
        "extra": 0
      }
    ]
  },
  {
    "id": "ink-monochrome",
    "label": "Monochrome",
    "group": "Ink",
    "description": "Grayscale ink visualization.",
    "layers": [
      {
        "type": "Monochrome",
        "strength": 1,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.5,
        "extra": 0
      }
    ]
  },
  {
    "id": "ink-negative",
    "label": "Negative",
    "group": "Ink",
    "description": "Inverted pigment structures.",
    "layers": [
      {
        "type": "Negative",
        "strength": 1,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.4,
        "extra": 0
      }
    ]
  },
  {
    "id": "ink-high-gain",
    "label": "High Gain",
    "group": "Ink",
    "description": "Enhanced shadow and dispersion detail.",
    "layers": [
      {
        "type": "HighGain",
        "strength": 0.8,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.3,
        "extra": 0
      }
    ]
  },
  {
    "id": "ink-false-color",
    "label": "False Color",
    "group": "Ink",
    "description": "Thermal-style ink visualization.",
    "layers": [
      {
        "type": "Monochrome",
        "strength": 1,
        "extra": 4
      },
      {
        "type": "Contrast",
        "strength": 0.5,
        "extra": 0
      },
      {
        "type": "Gamma",
        "strength": 0.3,
        "extra": 0
      }
    ]
  },
  {
    "id": "ink-plate-contrast",
    "label": "Plate Contrast",
    "group": "Ink",
    "description": "High-contrast plate look for pigment boundaries.",
    "layers": [
      {
        "type": "Contrast",
        "strength": 0.65,
        "extra": 0
      },
      {
        "type": "Vignette",
        "strength": 0.25,
        "extra": 0
      },
      {
        "type": "EdgeEnhancement",
        "strength": 0.35,
        "extra": 0
      }
    ]
  },
  {
    "id": "ink-ink-screen-lift",
    "label": "Ink Screen Lift",
    "group": "Ink",
    "description": "Lifted midtones with softer contrast for translucent ink.",
    "layers": [
      {
        "type": "Gamma",
        "strength": 0.35,
        "extra": 0
      },
      {
        "type": "SoftGlow",
        "strength": 0.25,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.35,
        "extra": 0
      }
    ]
  },
  {
    "id": "steam-natural",
    "label": "Natural",
    "group": "Steam",
    "description": "Clean steam source.",
    "layers": []
  },
  {
    "id": "steam-density",
    "label": "Density",
    "group": "Steam",
    "description": "Enhanced vapor density.",
    "layers": [
      {
        "type": "Contrast",
        "strength": 0.7,
        "extra": 0
      },
      {
        "type": "Gamma",
        "strength": 0.3,
        "extra": 0
      }
    ]
  },
  {
    "id": "steam-edge",
    "label": "Edge",
    "group": "Steam",
    "description": "Edge-detected vapor boundaries.",
    "layers": [
      {
        "type": "EdgeEnhancement",
        "strength": 0.6,
        "extra": 0
      },
      {
        "type": "SoftGlow",
        "strength": 0.3,
        "extra": 0
      }
    ]
  },
  {
    "id": "steam-high-gain",
    "label": "High Gain",
    "group": "Steam",
    "description": "Maximum vapor structure visibility.",
    "layers": [
      {
        "type": "HighGain",
        "strength": 0.8,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.5,
        "extra": 0
      }
    ]
  },
  {
    "id": "steam-cool-contrast",
    "label": "Cool Contrast",
    "group": "Steam",
    "description": "Blue-weighted vapor detail.",
    "layers": [
      {
        "type": "Monochrome",
        "strength": 1,
        "extra": 3
      },
      {
        "type": "Contrast",
        "strength": 0.6,
        "extra": 0
      }
    ]
  },
  {
    "id": "steam-monochrome",
    "label": "Monochrome",
    "group": "Steam",
    "description": "Grayscale steam visualization.",
    "layers": [
      {
        "type": "Monochrome",
        "strength": 1,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.5,
        "extra": 0
      }
    ]
  },
  {
    "id": "steam-negative",
    "label": "Negative",
    "group": "Steam",
    "description": "Inverted vapor structures.",
    "layers": [
      {
        "type": "Negative",
        "strength": 1,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.3,
        "extra": 0
      }
    ]
  },
  {
    "id": "steam-fine-detail",
    "label": "Fine Detail",
    "group": "Steam",
    "description": "Subtle condensation structure.",
    "layers": [
      {
        "type": "EdgeEnhancement",
        "strength": 0.5,
        "extra": 0
      },
      {
        "type": "HighGain",
        "strength": 0.4,
        "extra": 0
      }
    ]
  },
  {
    "id": "steam-false-color",
    "label": "False Color",
    "group": "Steam",
    "description": "Thermal-style vapor visualization.",
    "layers": [
      {
        "type": "Monochrome",
        "strength": 1,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.5,
        "extra": 0
      },
      {
        "type": "Gamma",
        "strength": 0.4,
        "extra": 0
      },
      {
        "type": "HighGain",
        "strength": 0.3,
        "extra": 0
      }
    ]
  },
  {
    "id": "steam-steam-screen-lift",
    "label": "Steam Screen Lift",
    "group": "Steam",
    "description": "Soft lifted vapor pass for pale steam detail.",
    "layers": [
      {
        "type": "Gamma",
        "strength": 0.45,
        "extra": 0
      },
      {
        "type": "SoftGlow",
        "strength": 0.3,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.2,
        "extra": 0
      }
    ]
  },
  {
    "id": "steam-vintage-vapor",
    "label": "Vintage Vapor",
    "group": "Steam",
    "description": "Monochrome vapor contrast with gentle vignette.",
    "layers": [
      {
        "type": "Monochrome",
        "strength": 1,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.4,
        "extra": 0
      },
      {
        "type": "Vignette",
        "strength": 0.3,
        "extra": 0
      }
    ]
  },
  {
    "id": "reflection-natural",
    "label": "Natural",
    "group": "Reflection",
    "description": "Clean reflection source.",
    "layers": []
  },
  {
    "id": "reflection-contrast",
    "label": "Contrast",
    "group": "Reflection",
    "description": "Enhanced reflection boundaries.",
    "layers": [
      {
        "type": "Contrast",
        "strength": 0.8,
        "extra": 0
      },
      {
        "type": "Gamma",
        "strength": 0.3,
        "extra": 0
      }
    ]
  },
  {
    "id": "reflection-shadow-detail",
    "label": "Shadow Detail",
    "group": "Reflection",
    "description": "Recover shadow detail in dark reflections.",
    "layers": [
      {
        "type": "HighGain",
        "strength": 0.7,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.4,
        "extra": 0
      }
    ]
  },
  {
    "id": "reflection-highlight-detail",
    "label": "Highlight Detail",
    "group": "Reflection",
    "description": "Emphasize bright reflection highlights.",
    "layers": [
      {
        "type": "EdgeEnhancement",
        "strength": 0.5,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.6,
        "extra": 0
      }
    ]
  },
  {
    "id": "reflection-monochrome",
    "label": "Monochrome",
    "group": "Reflection",
    "description": "Grayscale reflection visualization.",
    "layers": [
      {
        "type": "Monochrome",
        "strength": 1,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.4,
        "extra": 0
      }
    ]
  },
  {
    "id": "reflection-edge",
    "label": "Edge",
    "group": "Reflection",
    "description": "Edge-detected reflection boundaries.",
    "layers": [
      {
        "type": "EdgeEnhancement",
        "strength": 0.7,
        "extra": 0
      }
    ]
  },
  {
    "id": "reflection-negative",
    "label": "Negative",
    "group": "Reflection",
    "description": "Inverted reflections.",
    "layers": [
      {
        "type": "Negative",
        "strength": 1,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.4,
        "extra": 0
      }
    ]
  },
  {
    "id": "reflection-color-isolation",
    "label": "Color Isolation",
    "group": "Reflection",
    "description": "Emphasize color separation in reflections.",
    "layers": [
      {
        "type": "Contrast",
        "strength": 0.6,
        "extra": 0
      },
      {
        "type": "Gamma",
        "strength": 0.3,
        "extra": 0
      },
      {
        "type": "HighGain",
        "strength": 0.3,
        "extra": 0
      }
    ]
  },
  {
    "id": "reflection-high-gain",
    "label": "High Gain",
    "group": "Reflection",
    "description": "Maximum reflection detail recovery.",
    "layers": [
      {
        "type": "HighGain",
        "strength": 0.9,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.5,
        "extra": 0
      }
    ]
  },
  {
    "id": "reflection-mirror-vignette",
    "label": "Mirror Vignette",
    "group": "Reflection",
    "description": "Vintage edge falloff for mirror and glass reflections.",
    "layers": [
      {
        "type": "Contrast",
        "strength": 0.45,
        "extra": 0
      },
      {
        "type": "Vignette",
        "strength": 0.4,
        "extra": 0
      },
      {
        "type": "Gamma",
        "strength": 0.2,
        "extra": 0
      }
    ]
  },
  {
    "id": "reflection-reflective-screen-glow",
    "label": "Reflective Screen Glow",
    "group": "Reflection",
    "description": "Screen-style glow for dim reflection frames.",
    "layers": [
      {
        "type": "Gamma",
        "strength": 0.35,
        "extra": 0
      },
      {
        "type": "SoftGlow",
        "strength": 0.3,
        "extra": 0
      },
      {
        "type": "Contrast",
        "strength": 0.25,
        "extra": 0
      }
    ]
  },
];

// JPEG quality for browser-native PNG-to-JPEG conversion.
// This architecture exists because FFmpeg WASM's MJPEG/JPEG encoder crashes with
// "RuntimeError: memory access out of bounds" for both H.264 and VP9 input.
// FFmpeg extracts temporary PNG frames, then the browser converts to JPEG.
// See BROWSER_BUILD_STATUS.md for full diagnostic history.
const JPEG_QUALITY = 0.93;
const FRAMES_PAGE_SIZE = 240;
let framesPage = 1;
let framesObserver = null;

async function pngBlobToJpegBlob(pngBlob) {
  const bitmap = await createImageBitmap(pngBlob);
  try {
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0);
    return await canvas.convertToBlob({ type: "image/jpeg", quality: JPEG_QUALITY });
  } finally {
    bitmap.close();
  }
}

function formatError(error) {
  if (error == null) return `Unknown error (${error})`;
  if (typeof error === "string") return error;
  if (error instanceof DOMException) return `${error.name}: ${error.message}`;
  if (error instanceof Error) return `${error.name}: ${error.message}`;
  if (typeof error === "object") {
    if (error.message) return String(error.message);
    try { return JSON.stringify(error); } catch { return String(error); }
  }
  return String(error);
}

const lastFfmpegLogs = [];
const MAX_FFMPEG_LOGS = 50;
let lastFfmpegError = null;
let lastFfmpegExitCode = null;
let lastDetectedCodec = null;
let lastRecordingMime = null;

// IndexedDB persistence
const DB_NAME = 'VisualITCLab';
const DB_VERSION = 3;
let db = null;

async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('sessions')) {
        const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
        sessionStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
      if (!db.objectStoreNames.contains('frames')) {
        const frameStore = db.createObjectStore('frames', { keyPath: 'id' });
        frameStore.createIndex('sessionId', 'sessionId', { unique: false });
      }
      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('sourceVideos')) {
        db.createObjectStore('sourceVideos', { keyPath: 'sessionId' });
      }
      if (!db.objectStoreNames.contains('slideshows')) {
        const ssStore = db.createObjectStore('slideshows', { keyPath: 'id' });
        ssStore.createIndex('sessionId', 'sessionId', { unique: false });
      }
      if (!db.objectStoreNames.contains('slideshowProjects')) {
        const projStore = db.createObjectStore('slideshowProjects', { keyPath: 'id' });
        projStore.createIndex('sessionId', 'sessionId', { unique: false });
      }
    };
    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };
    request.onerror = (event) => {
      console.error('IndexedDB open failed:', event.target.error);
      reject(event.target.error);
    };
  });
}

async function persistSessionToDB(session, frames, evidence) {
  if (!db) return;
  try {
    // First, get existing frame IDs to delete (outside write transaction)
    const existingFrames = await getFrameRecordsForSession(session.id);
    const existingIds = existingFrames.map(f => f.id);

    const tx = db.transaction(['sessions', 'frames'], 'readwrite');
    const sessionStore = tx.objectStore('sessions');
    const frameStore = tx.objectStore('frames');

    const sessionRecord = {
      id: session.id,
      name: session.name,
      type: session.type,
      createdAt: session.createdAt,
      sourceArchive: session.sourceArchive || '',
      sourceVideo: session.sourceVideo || '',
      recordingMimeType: session.recordingMimeType || lastRecordingMime || '',
      recordingLimitSeconds: session.recordingLimitSeconds || 60,
      _userCreated: session._userCreated || false,
      captureWidth: state.camera.captureWidth || 0,
      captureHeight: state.camera.captureHeight || 0,
      captureFps: state.camera.captureFps || 0,
      evidence: evidence || [],
      currentIndex: state.currentIndex,
      currentEffect: state.currentEffect,
      frameCount: frames.length,
      modifiedAt: new Date().toISOString(),
    };
    sessionStore.put(sessionRecord);

    // Delete old frames
    for (const id of existingIds) {
      frameStore.delete(id);
    }

    // Store new frame records
    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      const frameRecord = {
        id: frame.id,
        sessionId: session.id,
        name: frame.name,
        type: frame.type,
        width: frame.width,
        height: frame.height,
        checked: frame.checked,
        junk: frame.junk,
        savedEvidence: frame.savedEvidence,
        edit: frame.edit,
        native: frame.native || null,
        order: i,
      };
      // Store blob if available
      const blobToStore = frame._blob || frame.blob;
      if (blobToStore instanceof Blob) {
        frameRecord.blob = blobToStore;
      }
      frameStore.put(frameRecord);
    }

    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });

    // Persist source video separately (large blob)
    if (state.sourceVideo.blob && state.sourceVideo.blob.size > 0) {
      try {
        const svTx = db.transaction('sourceVideos', 'readwrite');
        const svStore = svTx.objectStore('sourceVideos');
        svStore.put({
          sessionId: session.id,
          blob: state.sourceVideo.blob,
          fileName: state.sourceVideo.fileName,
          mimeType: state.sourceVideo.mimeType,
          size: state.sourceVideo.size,
          type: state.sourceVideo.type,
        });
        await new Promise((resolve, reject) => {
          svTx.oncomplete = resolve;
          svTx.onerror = () => reject(svTx.error);
        });
      } catch (svErr) {
        console.warn('Failed to persist source video:', svErr);
      }
    }
  } catch (error) {
    console.error('Failed to persist session:', error);
  }
}

async function getFrameRecordsForSession(sessionId) {
  if (!db) return [];
  return new Promise((resolve, reject) => {
    const tx = db.transaction('frames', 'readonly');
    const store = tx.objectStore('frames');
    const index = store.index('sessionId');
    const request = index.getAll(sessionId);
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function loadAllSessionsFromDB() {
  if (!db) return [];
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sessions', 'readonly');
    const store = tx.objectStore('sessions');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function loadSessionFromDB(sessionId) {
  if (!db) return null;
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sessions', 'readonly');
    const store = tx.objectStore('sessions');
    const request = store.get(sessionId);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

async function deleteSessionFromDB(sessionId) {
  if (!db) return;
  try {
    const tx = db.transaction(['sessions', 'frames', 'sourceVideos'], 'readwrite');
    const sessionStore = tx.objectStore('sessions');
    const frameStore = tx.objectStore('frames');
    const svStore = tx.objectStore('sourceVideos');

    sessionStore.delete(sessionId);
    svStore.delete(sessionId);

    const index = frameStore.index('sessionId');
    const request = index.openCursor(sessionId);
    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };

    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('Failed to delete session from DB:', error);
  }
}

async function loadSourceVideoFromDB(sessionId) {
  if (!db) return null;
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sourceVideos', 'readonly');
    const store = tx.objectStore('sourceVideos');
    const request = store.get(sessionId);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

async function persistSlideshowToDB(slideshow) {
  if (!db) return;
  try {
    const tx = db.transaction('slideshows', 'readwrite');
    const store = tx.objectStore('slideshows');
    store.put(slideshow);
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    console.log(`SLIDESHOW PERSISTED: ${slideshow.title} (${slideshow.blob?.size || 0} bytes)`);
  } catch (error) {
    console.error('Failed to persist slideshow:', error);
  }
}

async function loadSlideshowsFromDB(sessionId) {
  if (!db) return [];
  return new Promise((resolve, reject) => {
    const tx = db.transaction('slideshows', 'readonly');
    const store = tx.objectStore('slideshows');
    const index = store.index('sessionId');
    const request = index.getAll(sessionId);
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function deleteSlideshowsForSession(sessionId) {
  if (!db) return;
  try {
    const records = await loadSlideshowsFromDB(sessionId);
    const tx = db.transaction('slideshows', 'readwrite');
    const store = tx.objectStore('slideshows');
    for (const rec of records) {
      store.delete(rec.id);
    }
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('Failed to delete slideshows:', error);
  }
}

// Slideshow Project CRUD

async function persistSlideshowProjectToDB(project) {
  if (!db) return;
  try {
    const tx = db.transaction('slideshowProjects', 'readwrite');
    const store = tx.objectStore('slideshowProjects');
    store.put(project);
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    console.log(`SLIDESHOW PROJECT SAVED: ${project.title} (${project.id})`);
  } catch (error) {
    console.error('Failed to persist slideshow project:', error);
  }
}

async function loadSlideshowProjectsFromDB(sessionId) {
  if (!db) return [];
  return new Promise((resolve, reject) => {
    const tx = db.transaction('slideshowProjects', 'readonly');
    const store = tx.objectStore('slideshowProjects');
    const index = store.index('sessionId');
    const request = index.getAll(sessionId);
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function deleteSlideshowProjectFromDB(projectId) {
  if (!db) return;
  try {
    const tx = db.transaction('slideshowProjects', 'readwrite');
    const store = tx.objectStore('slideshowProjects');
    store.delete(projectId);
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('Failed to delete slideshow project:', error);
  }
}

async function deleteSlideshowProjectsForSession(sessionId) {
  if (!db) return;
  try {
    const records = await loadSlideshowProjectsFromDB(sessionId);
    const tx = db.transaction('slideshowProjects', 'readwrite');
    const store = tx.objectStore('slideshowProjects');
    for (const rec of records) {
      store.delete(rec.id);
    }
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('Failed to delete slideshow projects:', error);
  }
}

async function loadSessionFramesFromDB(sessionId) {
  console.log(`FRAME REHYDRATE - Loading frames for session: ${sessionId}`);
  const records = await getFrameRecordsForSession(sessionId);
  console.log(`FRAME REHYDRATE - Found ${records.length} frame records in IndexedDB`);

  const frames = [];
  let missingBlobCount = 0;
  for (const rec of records.sort((a, b) => (a.order || 0) - (b.order || 0))) {
    let url = '';
    if (rec.blob instanceof Blob && rec.blob.size > 0) {
      url = URL.createObjectURL(rec.blob);
    } else {
      missingBlobCount++;
      if (missingBlobCount <= 3) {
        console.warn(`FRAME REHYDRATE - Frame "${rec.name}" has no valid blob (blob=${typeof rec.blob}, size=${rec.blob?.size})`);
      }
    }
    frames.push({
      id: rec.id,
      name: rec.name,
      type: rec.type || "image/jpeg",
      url,
      width: rec.width || 0,
      height: rec.height || 0,
      checked: rec.checked || false,
      junk: rec.junk || false,
      savedEvidence: rec.savedEvidence || false,
      edit: rec.edit || defaultEdit(),
      native: rec.native || null,
      _blob: rec.blob || null,
    });
  }

  if (missingBlobCount > 0) {
    console.warn(`FRAME REHYDRATE - ${missingBlobCount}/${records.length} frames missing valid blobs`);
  }
  console.log(`FRAME REHYDRATE - Successfully rehydrated ${frames.length} frames`);
  return frames;
}

function persistCurrentSession() {
  if (!state.session) return;
  // Store blob references for frames - prefer _blob (new recordings), fall back to existing blob (from IndexedDB)
  const framesToSave = state.frames.map(f => ({
    ...f,
    blob: f._blob || f.blob || null,
  }));
  persistSessionToDB(state.session, framesToSave, state.evidence);
}

const state = {
  session: null,
  sessions: [],
  activeSessionId: null,
  frames: [],
  currentIndex: 0,
  currentEffect: "general-normal",
  activeEffectGroup: "",
  viewMode: 0,
  zoom: 1,
  panX: 0,
  panY: 0,
  playing: false,
  playTimer: null,
  slideshowPlaying: false,
  slideshowTimer: null,
  slideshowRafId: null,
  slideshowIndex: 0,
  slideshowSelected: new Set(),
  exportSelected: new Set(),
  slideshowExportUrl: null,
  dragging: false,
  dragStart: null,
  evidence: [],
  camera: {
    videoStream: null,
    audioStream: null,
    permissionProbeDone: false,
    permissionProbeRunning: false,
    audioContext: null,
    audioAnalyser: null,
    audioMeterData: null,
    audioMeterTimer: null,
    recorder: null,
    chunks: [],
    recordingStartedAt: 0,
    timer: null,
    maxRecordMs: 120000,
    activeRecordDurationMs: 60000,
    captureWidth: 0,
    captureHeight: 0,
    captureFps: 0,
    lastError: null,
    finalizing: false,
    autoStopTriggered: false,
  },
  sourceVideo: {
    blob: null,
    url: null,
    fileName: '',
    mimeType: '',
    size: 0,
    type: '', // 'recorded' | 'imported' | 'restored'
  },
  watermarkImage: {
    blob: null,
    url: null,
    fileName: '',
    image: null, // HTMLImageElement
  },
  currentSlideshowProjectId: null,
  slideshowProjectDirty: false,
  slideshowProjectSaving: false,
  capsuleImportBusy: false,
  capsuleExportBusy: false,
};

const el = {};
const textDecoder = new TextDecoder("utf-8");
let ffmpegInstance = null;
let ffmpegReady = false;
let ffmpegLoading = false;
let ffmpegLoadingPromise = null;
let effectPreviewRevision = 0;
const lutCache = new Map();

document.addEventListener("DOMContentLoaded", async () => {
  bindElements();
  buildEffects();
  bindEvents();
  updateUI();
  render();
  showPanel("camera");

  // Load persisted sessions from IndexedDB
  try {
    await openDB();
    const persistedSessions = await loadAllSessionsFromDB();
    state.sessions = persistedSessions.map(s => ({
      id: s.id,
      name: s.name,
      type: s.type,
      createdAt: s.createdAt,
      sourceArchive: s.sourceArchive || '',
      sourceVideo: s.sourceVideo || '',
      recordingMimeType: s.recordingMimeType || '',
      _userCreated: s._userCreated || false,
      captureWidth: s.captureWidth || 0,
      captureHeight: s.captureHeight || 0,
      captureFps: s.captureFps || 0,
      frames: [], // frames loaded on-demand when session opened
      evidence: s.evidence || [],
      frameCount: s.frameCount || 0,
    }));
    // Update capture metadata from last session if available
    const lastSession = persistedSessions[persistedSessions.length - 1];
    if (lastSession) {
      state.camera.captureWidth = lastSession.captureWidth || 0;
      state.camera.captureHeight = lastSession.captureHeight || 0;
      state.camera.captureFps = lastSession.captureFps || 0;
    }
    renderSessionSurfaces();
    await estimateStorage();
  } catch (error) {
    console.warn('IndexedDB not available, sessions will not persist:', error.message);
  }
});

// Persist session before page unload (refresh/close)
window.addEventListener("beforeunload", () => {
  if (state.session && state.frames.length > 0) {
    // Fire-and-forget; IndexedDB transaction may not complete before unload
    // but we try our best
    try {
      persistCurrentSession();
    } catch (e) {
      console.warn("beforeunload persist failed:", e);
    }
  }
});

function bindElements() {
  [
    "sessionName", "sessionType", "openSessionZipBtn", "zipInput", "newSessionBtn",
    "importVideoBtn", "videoInput", "archiveImportVideoBtn", "ffmpegStatus",
    "importImagesBtn", "imageInput",
    "openSessionZipBtn2", "zipInput2", "importVideoBtn2", "videoInput2",
    "frameCount", "currentFrame", "checkedCount", "junkCount", "markThisBtn",
    "markBeforeBtn", "deleteMarkedBtn", "analysisCanvas", "emptyState", "viewerStage",
    "viewFramesBtn", "viewSessionVideoBtn", "sessionVideoPlayer", "sessionVideoControls",
    "videoPlayPauseBtn", "videoScrubber", "videoTimeDisplay", "noVideoState",
    "fitBtn", "focusBtn", "analysisManualBtn", "firstBtn", "prevBtn", "playBtn", "nextBtn", "lastBtn",
    "skimSpeed", "skimSpeedValue", "frameSlider", "filmstrip", "effectGroupFilters", "effectGrid",
    "selectedEvidenceCount", "checkFrameBtn", "saveEvidenceBtn", "exportImageBtn",
    "openSlideshowBtn", "evidenceGrid", "evidenceExportBtn", "evidenceSlideshowBtn",
    "archiveRestoreBtn",
    "exportSessionCapsuleBtn", "evidenceBatchExportPanel", "evidenceBatchCloseBtn",
    "cameraRestoreBtn", "cameraRestoreBtn2", "libraryRestoreBtn",
    "cameraDeviceSelect", "cameraFormatSelect", "cameraFpsSelect", "recordingDurationSelect",
    "refreshCameraBtn", "retryCameraBtn", "cameraStatus", "cameraPreviewVideo", "cameraStartup", "cameraViewport",
    "cameraRecordTimer", "recordCameraBtn", "audioDeviceSelect", "audioChannelSelect",
    "audioSampleRateSelect", "refreshAudioBtn", "audioRmsStatus", "audioPeakStatus", "audioStatus",
    "cameraDeviceStatus", "audioDeviceStatus", "countdownOverlay", "countdownNumber",
    "recordingProcessOverlay", "recordingProcessStage", "recordingProcessDetail", "recordingProcessBar", "recordingProcessInfo",
    "cameraSessionName", "cameraSessionMeta", "libraryGrid", "framesGrid", "framesCountLabel", "loadMoreFramesBtn",
    "autoStopDiagnostic",
    "cameraCreateSessionBtn", "cameraNewSessionBtn",
    "cameraImportVideoBtn",
    "sessionEntrySection", "activeSessionSection",
    "leftPanelNoSession", "leftPanelActiveSession",
    "exportGrid", "exportPreviewCanvas", "exportSelectAllBtn", "exportClearBtn",
    "exportWatermarkEnabled", "exportWatermarkText", "exportWatermarkOpacity", "exportWatermarkSize",
    "exportEvidenceNowBtn", "exportToSlideshowBtn", "slideshowCanvas", "slideshowFrameGrid",
    "playSlideshowBtn", "previewTransitionBtn", "stopSlideshowBtn", "slideshowStatus",
    "slideshowProgressFill", "slideshowProgressWrap",
    "slideshowSelectAllBtn", "slideshowClearBtn", "slideshowChronoBtn", "newSlideshowBtn",
    "saveSlideshowBtn", "slideshowProjectSelect", "slideshowProjectStatus",
    "slideshowName", "slideDurationSelect", "transitionSelect", "transitionDurationSelect",
    "motionSelect", "kenStart", "kenEnd", "slideshowDuration",     "watermarkEnabled",
    "watermarkType", "watermarkColor", "watermarkText", "watermarkPosition",
    "watermarkOpacity", "watermarkSize", "watermarkTextSection", "watermarkImageSection",
    "watermarkImageInput", "watermarkImagePreview", "chooseWatermarkImageBtn", "removeWatermarkImageBtn",
    "exportSlideshowBtn", "showSlideshowFolderBtn",
    "slideshowResSelect", "slideshowFpsSelect",
    "settingsCameraPerm", "settingsMicPerm", "settingsRefreshPerms",
    "settingsCameraCount", "settingsMicCount",
    "settingsSelectedCamera", "settingsSelectedMic", "settingsCurrentRes", "settingsCurrentFps",
    "settingsDefaultRes", "settingsDefaultFps", "settingsSecureContext", "settingsCameraApi", "settingsLastError", "settingsStorageInfo",
    "settingsRecordingMime", "settingsRecordingContainer", "settingsLastFfmpegError", "settingsLastFfmpegExitCode", "settingsDetectedCodec",
    "sessionDialog", "dialogSessionName", "dialogSessionType", "dialogNameValidation",
    "dialogCancelBtn", "dialogCreateBtn", "sessionDialogTitle",
    "slideshowProjectDialog", "dialogSlideshowProjectName", "slideshowProjectDialogTitle",
    "dialogSlideshowNameValidation", "dialogSlideshowDuplicateValidation",
    "dialogSlideshowCancelBtn", "dialogSlideshowCreateBtn",
    "capsuleOverlay", "capsuleOverlayPrimary", "capsuleOverlaySecondary", "capsuleOverlayDetail", "capsuleOverlayFill",
  ].forEach((id) => {
    el[id] = document.getElementById(id);
  });
}

function bindEvents() {
  // Left panel - no session state
  el.newSessionBtn.addEventListener("click", () => openSessionDialog("create"));
  el.openSessionZipBtn.addEventListener("click", () => el.zipInput.click());
  el.zipInput.addEventListener("change", importSessionZip);
  el.importVideoBtn.addEventListener("click", handleImportVideoFromAnalysis);
  if (el.importImagesBtn) el.importImagesBtn.addEventListener("click", () => el.imageInput.click());
  if (el.imageInput) el.imageInput.addEventListener("change", importImages);

  // Left panel - active session state
  if (el.openSessionZipBtn2) el.openSessionZipBtn2.addEventListener("click", () => el.zipInput2.click());
  if (el.zipInput2) el.zipInput2.addEventListener("change", importSessionZip);
  if (el.importVideoBtn2) el.importVideoBtn2.addEventListener("click", () => el.videoInput2.click());
  if (el.videoInput2) el.videoInput2.addEventListener("change", importVideoFrames);

  el.archiveImportVideoBtn.addEventListener("click", () => el.videoInput.click());
  el.videoInput.addEventListener("change", importVideoFrames);

  // Session dialog
  el.dialogCreateBtn.addEventListener("click", handleDialogCreate);
  el.dialogCancelBtn.addEventListener("click", closeSessionDialog);
  el.sessionDialog.addEventListener("click", (e) => {
    if (e.target === el.sessionDialog) closeSessionDialog();
  });
  el.sessionDialog.addEventListener("cancel", () => {});
  el.dialogSessionName.addEventListener("input", () => {
    if (el.dialogNameValidation) el.dialogNameValidation.hidden = true;
  });
  el.dialogSessionName.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleDialogCreate();
  });

  // Slideshow project naming dialog
  if (el.dialogSlideshowCreateBtn) {
    el.dialogSlideshowCreateBtn.addEventListener("click", handleSlideshowProjectDialogCreate);
  }
  if (el.dialogSlideshowCancelBtn) {
    el.dialogSlideshowCancelBtn.addEventListener("click", closeSlideshowProjectDialog);
  }
  if (el.slideshowProjectDialog) {
    el.slideshowProjectDialog.addEventListener("click", (e) => {
      if (e.target === el.slideshowProjectDialog) closeSlideshowProjectDialog();
    });
    el.slideshowProjectDialog.addEventListener("cancel", () => {});
  }
  if (el.dialogSlideshowProjectName) {
    el.dialogSlideshowProjectName.addEventListener("input", () => {
      if (el.dialogSlideshowNameValidation) el.dialogSlideshowNameValidation.hidden = true;
      if (el.dialogSlideshowDuplicateValidation) el.dialogSlideshowDuplicateValidation.hidden = true;
    });
    el.dialogSlideshowProjectName.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleSlideshowProjectDialogCreate();
    });
  }

  // Camera page - no session
  el.cameraCreateSessionBtn.addEventListener("click", () => openSessionDialog("create"));
  el.cameraNewSessionBtn.addEventListener("click", () => openSessionDialog("new"));
  el.cameraImportVideoBtn.addEventListener("click", handleImportVideoFromCamera);
  el.cameraRestoreBtn.addEventListener("click", () => el.zipInput.click());
  el.cameraRestoreBtn2.addEventListener("click", () => el.zipInput.click());

  // Session name/type editing (when active session)
  if (el.sessionName) el.sessionName.addEventListener("input", updateSessionFromUI);
  if (el.sessionType) el.sessionType.addEventListener("change", updateSessionFromUI);

  el.fitBtn.addEventListener("click", fitView);
  el.focusBtn.addEventListener("click", setFocusMode);
  el.analysisManualBtn.addEventListener("click", setManualMode);

  // Analysis view selector (FRAMES / SESSION VIDEO)
  el.viewFramesBtn?.addEventListener("click", () => switchAnalysisView("frames"));
  el.viewSessionVideoBtn?.addEventListener("click", () => switchAnalysisView("session-video"));

  // Session video player controls
  el.videoPlayPauseBtn?.addEventListener("click", toggleSessionVideoPlayback);
  el.videoScrubber?.addEventListener("input", () => {
    if (el.sessionVideoPlayer && !isNaN(el.sessionVideoPlayer.duration)) {
      el.sessionVideoPlayer.currentTime = Number(el.videoScrubber.value);
    }
  });
  el.sessionVideoPlayer?.addEventListener("timeupdate", updateVideoTimeDisplay);
  el.sessionVideoPlayer?.addEventListener("loadedmetadata", updateVideoTimeDisplay);
  el.sessionVideoPlayer?.addEventListener("ended", () => {
    if (el.videoPlayPauseBtn) el.videoPlayPauseBtn.textContent = "Play";
  });
  el.firstBtn.addEventListener("click", () => selectFrame(0));
  el.prevBtn.addEventListener("click", () => selectFrame(state.currentIndex - 1));
  el.nextBtn.addEventListener("click", () => selectFrame(state.currentIndex + 1));
  el.lastBtn.addEventListener("click", () => selectFrame(state.frames.length - 1));
  el.playBtn.addEventListener("click", togglePlay);
  el.skimSpeed.addEventListener("input", () => {
    el.skimSpeedValue.textContent = `${el.skimSpeed.value} fps`;
    if (state.playing) {
      stopPlay();
      startPlay();
    }
  });
  el.frameSlider.addEventListener("input", () => selectFrame(Number(el.frameSlider.value)));

  el.markThisBtn.addEventListener("click", markThisJunk);
  el.markBeforeBtn.addEventListener("click", markBefore);
  el.deleteMarkedBtn.addEventListener("click", deleteMarked);
  // Load More button replaced by IntersectionObserver continuous scroll
  el.loadMoreFramesBtn?.addEventListener("click", () => {});
  el.checkFrameBtn.addEventListener("click", toggleCheckFrame);
  el.saveEvidenceBtn.addEventListener("click", saveSelectedAsEvidence);
  el.exportImageBtn.addEventListener("click", exportCurrentImage);
  el.openSlideshowBtn.addEventListener("click", () => showPanel("slideshow"));
  el.evidenceExportBtn.addEventListener("click", toggleEvidenceBatchExport);
  el.evidenceSlideshowBtn.addEventListener("click", () => showPanel("slideshow"));
  el.exportSessionCapsuleBtn.addEventListener("click", exportCapsuleZip);
  el.evidenceBatchCloseBtn.addEventListener("click", () => {
    const panel = document.getElementById("evidenceBatchExportPanel");
    if (panel) panel.hidden = true;
  });
  el.archiveRestoreBtn.addEventListener("click", () => el.zipInput.click());
  el.cameraRestoreBtn.addEventListener("click", () => el.zipInput.click());
  el.cameraRestoreBtn2.addEventListener("click", () => el.zipInput.click());
  el.refreshCameraBtn.addEventListener("click", () => refreshMediaDevices());
  el.refreshAudioBtn.addEventListener("click", () => refreshMediaDevices());
  el.retryCameraBtn.addEventListener("click", retryCamera);
  el.recordCameraBtn.addEventListener("click", toggleCameraRecording);
  el.libraryRestoreBtn.addEventListener("click", () => el.zipInput.click());
  el.exportSelectAllBtn.addEventListener("click", selectAllExportEvidence);
  el.exportClearBtn.addEventListener("click", clearExportEvidence);
  el.exportEvidenceNowBtn.addEventListener("click", exportEvidenceBatch);
  el.exportToSlideshowBtn.addEventListener("click", () => showPanel("slideshow"));

  el.slideshowSelectAllBtn.addEventListener("click", selectAllSlideshowFrames);
  el.slideshowClearBtn.addEventListener("click", clearSlideshowFrames);
  el.slideshowChronoBtn.addEventListener("click", chronologicalSlideshowFrames);
  el.newSlideshowBtn.addEventListener("click", handleNewSlideshowProject);
  el.saveSlideshowBtn.addEventListener("click", handleSaveSlideshowProject);
  if (el.slideshowProjectSelect) {
    el.slideshowProjectSelect.addEventListener("change", handleLoadSlideshowProject);
  }
  el.playSlideshowBtn.addEventListener("click", playSlideshow);
  el.previewTransitionBtn.addEventListener("click", previewTransition);
  el.stopSlideshowBtn.addEventListener("click", stopSlideshow);
  el.exportSlideshowBtn.addEventListener("click", exportSlideshowVideo);
  [
    "slideDurationSelect", "transitionSelect", "transitionDurationSelect", "motionSelect",
    "kenStart", "kenEnd", "watermarkEnabled", "watermarkType",
    "watermarkText", "watermarkColor", "watermarkPosition",
    "watermarkOpacity", "watermarkSize", "slideshowResSelect", "slideshowFpsSelect",
  ].forEach((id) => {
    if (el[id]) {
      el[id].addEventListener("input", () => { markSlideshowDirty(); renderSlideshowPreview(); });
      el[id].addEventListener("change", () => { markSlideshowDirty(); renderSlideshowPreview(); });
    }
  });
  if (el.slideshowName) {
    el.slideshowName.addEventListener("input", markSlideshowDirty);
  }

  // Watermark type toggle
  if (el.watermarkType) {
    el.watermarkType.addEventListener("change", () => {
      const isImage = el.watermarkType.value === "image";
      if (el.watermarkTextSection) el.watermarkTextSection.hidden = isImage;
      if (el.watermarkImageSection) el.watermarkImageSection.hidden = !isImage;
      markSlideshowDirty();
      renderSlideshowPreview();
    });
  }

  // Color preset buttons
  document.querySelectorAll(".color-preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (el.watermarkColor) {
        el.watermarkColor.value = btn.dataset.color;
        el.watermarkColor.dispatchEvent(new Event("input"));
      }
    });
  });

  // Image watermark file input
  if (el.chooseWatermarkImageBtn) {
    el.chooseWatermarkImageBtn.addEventListener("click", () => el.watermarkImageInput?.click());
  }
  if (el.watermarkImageInput) {
    el.watermarkImageInput.addEventListener("change", handleWatermarkImageSelect);
  }
  if (el.removeWatermarkImageBtn) {
    el.removeWatermarkImageBtn.addEventListener("click", removeWatermarkImage);
  }

  if (el.settingsRefreshPerms) {
    el.settingsRefreshPerms.addEventListener("click", updateSettingsDiagnostics);
  }

  el.cameraFormatSelect.addEventListener("change", onCameraFormatChange);
  el.cameraFpsSelect.addEventListener("change", onCameraFormatChange);
  el.cameraDeviceSelect.addEventListener("change", onCameraDeviceChange);

  document.querySelectorAll(".nav-button").forEach((button) => {
    button.addEventListener("click", () => showPanel(button.dataset.panel));
  });
  document.querySelectorAll(".close-drawer").forEach((button) => {
    button.addEventListener("click", () => showPanel("analysis"));
  });

  el.analysisCanvas.addEventListener("wheel", onCanvasWheel, { passive: false });
  el.analysisCanvas.addEventListener("pointerdown", onCanvasPointerDown);
  window.addEventListener("pointermove", onCanvasPointerMove);
  window.addEventListener("pointerup", onCanvasPointerUp);
  navigator.mediaDevices?.addEventListener?.("devicechange", () => refreshMediaDevices());
}

function updateSessionFromUI() {
  if (state.session) {
    state.session.name = el.sessionName.value.trim() || "Untitled Session";
    state.session.type = el.sessionType.value;
  }
}

function normalizeExperimentType(type) {
  if (!type) return "General Visual ITC";
  const t = type.trim();
  const map = {
    "Water ITC": "Water",
    "Water": "Water",
    "Fire / Flame": "Fire / Flame",
    "Fire": "Fire / Flame",
    "Smoke": "Smoke",
    "Ink": "Ink",
    "Steam / Vapor": "Steam / Vapor",
    "Steam": "Steam / Vapor",
    "Mirror / Reflection": "Mirror / Reflection",
    "Reflection ITC": "Mirror / Reflection",
    "Reflection": "Mirror / Reflection",
    "General Visual ITC": "General Visual ITC",
    "Visual ITC": "General Visual ITC",
    "Custom": "Custom",
  };
  return map[t] || "General Visual ITC";
}

// Session Dialog
let pendingImportVideoAfterDialog = false;

function openSessionDialog(mode) {
  if (!el.sessionDialog) return;
  pendingImportVideoAfterDialog = false;
  el.dialogSessionName.value = "";
  el.dialogSessionType.value = "General Visual ITC";
  if (el.dialogNameValidation) el.dialogNameValidation.hidden = true;
  el.sessionDialogTitle.textContent = mode === "new" ? "New Session" : "Create Session";
  el.dialogCreateBtn.textContent = mode === "new" ? "Create Session" : "Create Session";
  el.sessionDialog.showModal();
  setTimeout(() => el.dialogSessionName.focus(), 50);
}

function openSessionDialogForImport() {
  if (!el.sessionDialog) return;
  pendingImportVideoAfterDialog = true;
  el.dialogSessionName.value = "";
  el.dialogSessionType.value = "General Visual ITC";
  if (el.dialogNameValidation) el.dialogNameValidation.hidden = true;
  el.sessionDialogTitle.textContent = "Create Session for Import";
  el.dialogCreateBtn.textContent = "Create & Import";
  el.sessionDialog.showModal();
  setTimeout(() => el.dialogSessionName.focus(), 50);
}

function closeSessionDialog() {
  if (!el.sessionDialog) return;
  el.sessionDialog.close();
  pendingImportVideoAfterDialog = false;
}

function handleDialogCreate() {
  const name = (el.dialogSessionName.value || "").trim();
  if (!name) {
    if (el.dialogNameValidation) el.dialogNameValidation.hidden = false;
    el.dialogSessionName.focus();
    return;
  }
  if (el.dialogNameValidation) el.dialogNameValidation.hidden = true;

  const type = normalizeExperimentType(el.dialogSessionType.value);

  // If new session while active, save current first
  if (state.session) {
    saveCurrentSessionToLibrary();
    stopCameraStream();
    stopAudioStream();
  }

  const newId = crypto.randomUUID();
  const newSession = {
    id: newId,
    name: name,
    type: type,
    createdAt: new Date().toISOString(),
    _userCreated: true,
  };

  // Insert into sessions array IMMEDIATELY before camera startup
  state.sessions.push({
    id: newId,
    name: name,
    type: type,
    createdAt: newSession.createdAt,
    sourceArchive: "",
    sourceVideo: "",
    _userCreated: true,
    frames: [],
    evidence: [],
    currentIndex: 0,
    currentEffect: "general-normal",
  });

  state.session = newSession;
  state.activeSessionId = newId;
  state.frames = [];
  framesPage = 1;
  state.currentIndex = 0;
  state.currentEffect = "general-normal";
  state.activeEffectGroup = "";
  state.evidence = [];
  state.slideshowSelected = new Set();
  state.exportSelected = new Set();
  state.viewMode = 0;
  state.zoom = 1;
  state.panX = 0;
  state.panY = 0;

  // Sync session name/type to left panel if it exists
  if (el.sessionName) el.sessionName.value = name;
  if (el.sessionType) el.sessionType.value = type;

  closeSessionDialog();
  fitView();
  updateUI();
  render();
  showPanel("camera");

  // Camera startup happens AFTER session is in Library
  autoStartCamera();

  // Persist session to IndexedDB
  persistCurrentSession();

  // If this was triggered by Import Video, open the video picker
  if (pendingImportVideoAfterDialog) {
    pendingImportVideoAfterDialog = false;
    setTimeout(() => el.videoInput.click(), 150);
  }
}

function createSessionFromCamera() {
  openSessionDialog("create");
}

function startNewSessionFlow() {
  openSessionDialog("new");
}

function handleImportVideoFromCamera() {
  if (!hasActiveSession()) {
    openSessionDialogForImport();
    return;
  }
  el.videoInput.click();
}

function handleImportVideoFromAnalysis() {
  if (!hasActiveSession()) {
    openSessionDialogForImport();
    return;
  }
  el.videoInput.click();
}

async function importSessionZip(event) {
  const file = event.target.files?.[0];
  if (!file)
    return;

  if (state.capsuleImportBusy) {
    window.alert("A capsule restore operation is already in progress.");
    event.target.value = "";
    return;
  }

  state.capsuleImportBusy = true;
  disableCapsuleButtons(true);
  stopPlay();
  showCapsuleOverlay("import", "INSTALLING CAPSULE SESSION...", "Please Wait");
  setOperationStatus("Reading Capsule...");

  // Save current session to library before restoring
  if (state.session) {
    saveCurrentSessionToLibrary();
  }
  stopCameraStream();
  stopAudioStream();

  let restoredSlideshowCount = 0;
  let restoredProjectCount = 0;
  let slideshowWarnings = [];

  try {
    const entries = await readZipEntries(await file.arrayBuffer());
    const files = entries.filter((entry) => !entry.directory && !entry.name.includes("__MACOSX/"));
    const sessionEntry = files.find((entry) => normalizePath(entry.name).endsWith("Metadata/session.json"));
    if (!sessionEntry)
      throw new Error("This ZIP does not contain Metadata/session.json.");

    const root = normalizePath(sessionEntry.name).replace(/Metadata\/session\.json$/, "");
    const entryByRelative = new Map();
    files.forEach((entry) => {
      const normalized = stripRoot(normalizePath(entry.name), root);
      entryByRelative.set(normalized, entry);
    });

    setOperationStatus("Restoring Session Metadata...");
    setCapsuleOverlayDetail("Restoring Session Metadata...");
    const sessionJson = await readJson(entryByRelative, "Metadata/session.json");
    const framesJson = await readJson(entryByRelative, "Metadata/frames.json", null);
    setOperationStatus("Reading Evidence Metadata...");
    setCapsuleOverlayDetail("Reading Evidence Metadata...");
    const evidenceJson = await readJson(entryByRelative, "Metadata/evidence_candidates.json", null);
    const evidenceCount = evidenceJson?.candidates?.length || 0;
    console.log(`CAPSULE RESTORE - Evidence metadata found: ${evidenceCount} candidates`);

    revokeFrameUrls();
    setOperationStatus("Restoring Frames...");
    setCapsuleOverlayDetail("Restoring Frames...");
    state.frames = await buildFramesFromSessionZip(entryByRelative, framesJson, sessionJson);
    if (state.frames.length === 0)
      throw new Error("No JPEG or PNG frame images were found in the session ZIP.");

    state.session = {
      id: sessionJson.sessionId || crypto.randomUUID(),
      name: sessionJson.sessionName || sessionJson.safeName || file.name.replace(/\.vitc\.zip$|\.zip$/i, ""),
      type: normalizeExperimentType(sessionJson.experimentType || "General Visual ITC"),
      createdAt: sessionJson.createdTimestamp || new Date().toISOString(),
      sourceArchive: file.name,
    };
    state.activeSessionId = state.session.id;
    el.sessionName.value = state.session.name;
    el.sessionType.value = state.session.type;

    setOperationStatus("Restoring Evidence...");
    setCapsuleOverlayDetail("Restoring Evidence...");
    state.evidence = await buildEvidenceFromSessionZip(entryByRelative, evidenceJson);
    console.log(`CAPSULE RESTORE - Evidence state assigned: ${state.evidence.length} candidates`);
    state.slideshowSelected = new Set(state.evidence.map((item) => item.id));
    state.exportSelected = new Set(state.evidence.map((item) => item.id));
    setOperationStatus("Matching Evidence to Frames...");
    setCapsuleOverlayDetail("Matching Evidence to Frames...");
    markEvidenceFrames(evidenceJson);
    const linkedCount = state.evidence.filter(e => e.frameId).length;
    console.log(`CAPSULE RESTORE - Evidence linked to frames: ${linkedCount} of ${state.evidence.length}`);

    // Restore source video from ZIP (prefer playable MP4/WebM over MKV)
    setOperationStatus("Restoring Source Video...");
    setCapsuleOverlayDetail("Restoring Source Video...");
    try {
      const videoEntry = findCapsuleVideoEntry(entryByRelative);
      if (videoEntry) {
        const videoBlob = await videoEntry.entry.blob(videoEntry.mime);
        if (videoBlob && videoBlob.size > 0) {
          if (state.sourceVideo.url) URL.revokeObjectURL(state.sourceVideo.url);
          state.sourceVideo.blob = videoBlob;
          state.sourceVideo.url = URL.createObjectURL(videoBlob);
          state.sourceVideo.fileName = videoEntry.name;
          state.sourceVideo.mimeType = videoEntry.mime;
          state.sourceVideo.size = videoBlob.size;
          state.sourceVideo.type = 'restored';
          state.session.sourceVideo = videoEntry.name;
          console.log(`CAPSULE RESTORE - Source video restored: ${videoEntry.path} (${videoBlob.size} bytes)`);
        }
      }
    } catch (svErr) {
      console.warn('Capsule restore: source video restore failed (non-fatal):', svErr);
    }

    // Restore slideshow projects from ZIP if present
    setOperationStatus("Reading Slideshow Projects...");
    setCapsuleOverlayDetail("Restoring Slideshow Projects...");
    let projectsJson = null;
    try {
      projectsJson = await readJson(entryByRelative, "Metadata/slideshow_projects.json", null);
      const projectCount = projectsJson?.projects?.length || 0;
      console.log(`CAPSULE RESTORE - Slideshow projects found: ${projectCount}`);
      if (projectsJson && Array.isArray(projectsJson.projects) && projectsJson.projects.length > 0) {
        const capsuleSessionId = projectsJson.sessionId || state.session.id;
        const existingProjects = await loadSlideshowProjectsFromDB(state.session.id);
        const existingIds = new Set(existingProjects.map(p => p.id));

        for (const proj of projectsJson.projects) {
          try {
            setOperationStatus(`Restoring Project: ${proj.title || "Untitled"}...`);
            // Remap sessionId to the active restored session
            const restoredProject = {
              ...proj,
              sessionId: state.session.id,
            };

            // Rewrite selectedIds to reference restored evidence IDs
            // Evidence IDs are preserved during capsule restore, so selectedIds should match
            if (restoredProject.selectedIds && restoredProject.selectedIds.length > 0) {
              const matchedIds = restoredProject.selectedIds.filter(id => state.evidence.some(e => e.id === id));
              console.log(`CAPSULE RESTORE - Project "${proj.title}" selectedIds: ${restoredProject.selectedIds.length} total, ${matchedIds.length} matched to evidence`);
            }

            // Handle project ID collision
            if (existingIds.has(proj.id)) {
              // Project with same ID already exists in this session — upsert
              console.log(`CAPSULE RESTORE - Upserting existing project: ${proj.title} (${proj.id})`);
            } else {
              // Check if this ID belongs to a different session
              const allExisting = await loadSlideshowProjectsFromDB(capsuleSessionId);
              const collision = allExisting.find(p => p.id === proj.id && p.sessionId !== state.session.id);
              if (collision) {
                // ID collision with different session — generate new ID
                restoredProject.id = crypto.randomUUID();
                console.log(`CAPSULE RESTORE - Project ID collision, new ID: ${restoredProject.id}`);
              }
            }

            // Restore watermark image blob if present
            if (proj.watermarkImageZipPath) {
              const wmEntry = entryByRelative.get(proj.watermarkImageZipPath);
              if (wmEntry) {
                const wmBlob = await wmEntry.blob("image/png");
                if (wmBlob && wmBlob.size > 0) {
                  restoredProject.watermarkImageBlob = wmBlob;
                  console.log(`CAPSULE RESTORE - Watermark image restored for project: ${proj.title} (${wmBlob.size} bytes)`);
                }
              }
              // Remove the ZIP path reference — it's not a stored field
              delete restoredProject.watermarkImageZipPath;
            }

            await persistSlideshowProjectToDB(restoredProject);
            restoredProjectCount++;
          } catch (projErr) {
            console.warn(`CAPSULE RESTORE - Failed to restore project "${proj.title}":`, projErr);
            slideshowWarnings.push(`Project "${proj.title}": ${projErr.message}`);
          }
        }
        console.log(`CAPSULE RESTORE - ${restoredProjectCount} slideshow projects restored`);
      }
    } catch (projErr) {
      console.warn('Capsule restore: slideshow project restore failed (non-fatal):', projErr);
      slideshowWarnings.push(`Slideshow projects: ${projErr.message}`);
    }

    // Restore rendered slideshow outputs from ZIP if present
    setOperationStatus("Restoring Slideshow Exports...");
    setCapsuleOverlayDetail("Restoring Slideshow Exports...");
    try {
      const slideshowEntries = files.filter((entry) => {
        const normalized = normalizePath(entry.name);
        return normalized.includes("Exports/Slideshows/") && !normalized.endsWith("/");
      });

      for (const entry of slideshowEntries) {
        try {
          const normalized = normalizePath(entry.name);
          const filename = normalized.split("/").pop();
          const ext = filename.split(".").pop()?.toLowerCase() || "mp4";
          const mimeMap = { mp4: "video/mp4", webm: "video/webm", mkv: "video/x-matroska" };
          const mimeType = mimeMap[ext] || "video/mp4";

          const blob = await entry.blob(mimeType);
          if (!blob || blob.size === 0) continue;

          // Find matching project by filename if possible
          const matchingProject = projectsJson?.projects?.find(p => {
            const pFilename = (p.title || "").replace(/[^a-z0-9]+/gi, "_").toLowerCase();
            return pFilename && filename.toLowerCase().includes(pFilename);
          });

          const slideshow = {
            id: crypto.randomUUID(),
            sessionId: state.session.id,
            projectId: matchingProject?.id || "",
            title: filename.replace(/\.[^.]+$/, ""),
            fileName: filename,
            mimeType,
            size: blob.size,
            createdAt: new Date().toISOString(),
            slideCount: 0,
            resolution: "",
            fps: 0,
            transition: "",
            motionMode: "",
            duration: 0,
            blob,
          };

          await persistSlideshowToDB(slideshow);
          restoredSlideshowCount++;
          console.log(`CAPSULE RESTORE - Rendered slideshow restored: ${filename} (${blob.size} bytes)`);
        } catch (ssErr) {
          console.warn(`CAPSULE RESTORE - Failed to restore slideshow entry:`, ssErr);
          slideshowWarnings.push(`Slideshow "${entry.name?.split("/").pop()}": ${ssErr.message}`);
        }
      }
      if (restoredSlideshowCount > 0) {
        console.log(`CAPSULE RESTORE - ${restoredSlideshowCount} rendered slideshows restored`);
      }
    } catch (ssErr) {
      console.warn('Capsule restore: rendered slideshow restore failed (non-fatal):', ssErr);
      slideshowWarnings.push(`Rendered slideshows: ${ssErr.message}`);
    }

    // Update library slideshow count
    try {
      const slideshows = await loadSlideshowsFromDB(state.session.id);
      const sessionIdx = state.sessions.findIndex(s => s.id === state.session.id);
      if (sessionIdx >= 0) {
        state.sessions[sessionIdx].slideshowCount = slideshows.length;
      }
    } catch (_) {}

    setOperationStatus("Saving Session...");
    setCapsuleOverlayDetail("Saving Session...");
    state.currentIndex = 0;
    state.currentEffect = "general-normal";
    state.activeEffectGroup = "";
    selectFrame(0, false);
    showPanel("analysis");
    autoStartCamera();
    persistCurrentSession();

    // Refresh Saved Projects dropdown if projects were restored
    if (restoredProjectCount > 0) {
      populateSlideshowProjectDropdown();
    }

    // Round-trip count summary
    console.log(`CAPSULE RESTORE SUMMARY:`);
    console.log(`  Frames restored: ${state.frames.length}`);
    console.log(`  Evidence restored: ${state.evidence.length}`);
    console.log(`  Evidence with dataUrl: ${state.evidence.filter(e => e.dataUrl).length}`);
    console.log(`  Evidence linked to frames: ${state.evidence.filter(e => e.frameId).length}`);
    console.log(`  Slideshow projects restored: ${restoredProjectCount}`);
    console.log(`  Rendered slideshows restored: ${restoredSlideshowCount}`);
    console.log(`  Source video: ${state.sourceVideo.blob ? "Available" : "Not saved"}`);

    // Show success on overlay
    const successDetail = [
      `${state.frames.length.toLocaleString()} Frames`,
      state.evidence.length > 0 ? `${state.evidence.length} Evidence` : "",
      restoredProjectCount > 0 ? `${restoredProjectCount} Slideshow Project${restoredProjectCount > 1 ? "s" : ""}` : "",
    ].filter(Boolean).join(" / ");
    setCapsuleOverlaySuccess("CAPSULE SESSION INSTALLED", successDetail);
    hideCapsuleOverlay(3000);

    // Show partial failure warning if any slideshow issues
    if (slideshowWarnings.length > 0) {
      const warningText = slideshowWarnings.join("\n");
      console.warn(`CAPSULE RESTORE - Slideshow warnings:\n${warningText}`);
      window.alert(`Session restored with slideshow warning:\n${warningText}`);
    }
  } catch (error) {
    console.error(error);
    clearOperationStatus();
    setCapsuleOverlayFailure("CAPSULE SESSION INSTALL FAILED", error.message);
    hideCapsuleOverlay(4000);
  } finally {
    event.target.value = "";
    clearOperationStatus();
    state.capsuleImportBusy = false;
    disableCapsuleButtons(false);
    updateUI();
    render();
  }
}

async function importImages(event) {
  if (!hasActiveSession()) {
    window.alert("Create or restore a session before importing images.");
    event.target.value = "";
    return;
  }
  const files = Array.from(event.target.files || [])
    .filter((file) => file.type === "image/jpeg" || file.type === "image/png")
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  for (const file of files) {
    const url = URL.createObjectURL(file);
    const image = await loadImage(url);
    state.frames.push({
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type,
      url,
      width: image.naturalWidth,
      height: image.naturalHeight,
      checked: false,
      junk: false,
      savedEvidence: false,
      edit: defaultEdit(),
      _blob: file,
    });
  }

  if (state.frames.length > 0)
    selectFrame(Math.min(state.currentIndex, state.frames.length - 1), false);

  event.target.value = "";
  updateUI();
  render();
  persistCurrentSession();
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDurationHMS(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

async function getVideoMetadata(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration = video.duration || 0;
      const width = video.videoWidth || 0;
      const height = video.videoHeight || 0;
      URL.revokeObjectURL(url);
      // Frame rate cannot be reliably obtained from basic HTML video metadata
      resolve({ duration, width, height, fps: 0 });
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ duration: 0, width: 0, height: 0, fps: 0 });
    };
    video.src = url;
  });
}

async function preflightVideoImport(file) {
  const meta = await getVideoMetadata(file);
  const estimatedFrames = meta.duration > 0 && meta.fps > 0 ? Math.round(meta.duration * meta.fps) : 0;

  const WARNING_DURATION = 120;   // 2 minutes
  const WARNING_FRAMES = 4000;
  const WARNING_SIZE = 250 * 1024 * 1024; // 250 MB
  const VERY_LARGE_FRAMES = 20000;

  const exceedsThreshold =
    meta.duration > WARNING_DURATION ||
    estimatedFrames > WARNING_FRAMES ||
    file.size > WARNING_SIZE;

  const isVeryLarge = estimatedFrames > VERY_LARGE_FRAMES;

  if (!exceedsThreshold) {
    return { proceed: true, meta, estimatedFrames };
  }

  const lines = [
    `File: ${file.name}`,
    `Duration: ${formatDurationHMS(meta.duration)}`,
    meta.width && meta.height ? `Resolution: ${meta.width} \u00d7 ${meta.height}` : null,
    meta.fps > 0 ? `Frame Rate: ${meta.fps} FPS` : "Frame Rate: Unknown",
    `Estimated Analysis Frames: ~${estimatedFrames.toLocaleString()}`,
    `File Size: ${formatBytes(file.size)}`,
  ].filter(Boolean);

  const title = isVeryLarge ? "Very Large Analysis Session" : "Large Video Import";
  const body = isVeryLarge
    ? `This video is estimated to generate more than 20,000 frames. Processing may be slow and may consume substantial browser storage.`
    : `This video will generate approximately ${estimatedFrames.toLocaleString()} analysis frames and may require substantial processing time and browser storage.`;

  const message = `${title}\n\n${lines.join("\n")}\n\n${body}\n\nAre you sure you want to import this video?`;

  const proceed = window.confirm(message);
  return { proceed, meta, estimatedFrames };
}

async function importVideoFrames(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const { proceed } = await preflightVideoImport(file);
  if (!proceed) {
    event.target.value = "";
    return;
  }

  await importVideoFile(file);
  event.target.value = "";
}

async function importVideoFile(file, options = {}) {
  if (!hasActiveSession()) {
    window.alert("Create or restore a session before importing video.");
    return;
  }
  const isRecordingHandoff = !!options.throwOnError;
  if (isRecordingHandoff) setPipelineStage("IMPORTVIDEOFILE ENTERED");
  stopPlay();
  stopSlideshow();
  setOperationStatus("Loading FFmpeg...");
  if (isRecordingHandoff) setRecordingProcessStage("PREPARING FRAME EXTRACTION", "Loading FFmpeg engine...", null);

  console.log("FFMPEG DIAG 1 - IMPORTVIDEOFILE ENTRY");
  console.log("  file name:", file?.name);
  console.log("  file size:", file?.size);
  console.log("  file type:", file?.type);
  console.log("  preserveSession:", options.preserveSession);
  console.log("  active session:", state.session?.name, state.session?.id);

  try {
    if (isRecordingHandoff) setPipelineStage("ENSURE FFMPEG ENTERED");
    const ffmpeg = await ensureFFmpeg();
    if (isRecordingHandoff) setPipelineStage("FFMPEG READY");

    const fetchFile = window.FFmpegUtil?.fetchFile;
    if (typeof fetchFile !== "function")
      throw new Error("FFmpeg fetchFile helper did not load. Ensure assets/ffmpeg/util.js is accessible.");

    revokeFrameUrls();
    state.frames = [];
    state.evidence = [];
    state.currentIndex = 0;
    state.currentEffect = "general-normal";
    state.viewMode = 0;
    state.zoom = 1;
    state.panX = 0;
    state.panY = 0;
    state.slideshowSelected = new Set();
    state.exportSelected = new Set();

    if (options.preserveSession) {
      state.session.sourceVideo = file.name;
    } else {
      state.session.sourceVideo = file.name;
    }

    // Preserve source video blob for session (only for non-recording imports)
    if (!options.preserveSession) {
      if (state.sourceVideo.url) URL.revokeObjectURL(state.sourceVideo.url);
      state.sourceVideo.blob = file;
      state.sourceVideo.url = URL.createObjectURL(file);
      state.sourceVideo.fileName = file.name;
      state.sourceVideo.mimeType = file.type || 'video/mp4';
      state.sourceVideo.size = file.size;
      state.sourceVideo.type = 'imported';
    }

    const mime = file.type || "";
    const isWebM = mime.includes("webm") || file.name.endsWith(".webm");
    const inputName = isWebM ? "input.webm" : "input.mp4";

    if (isRecordingHandoff) setPipelineStage("FETCHING RECORDED FILE");
    console.log("FFMPEG DIAG 5 - FETCHFILE");
    console.log("  inputName:", inputName, "  fileName:", file.name, "  fileSize:", file.size, "  fileType:", file.type);
    const fileBytes = await fetchFile(file);
    const byteLen = fileBytes?.length ?? fileBytes?.byteLength ?? 0;
    console.log("  fetchFile result type:", typeof fileBytes, "length:", byteLen);
    if (byteLen === 0) {
      throw new Error("Recorded file converted to zero bytes before FFmpeg write.");
    }
    if (isRecordingHandoff) setPipelineStage(`RECORDED FILE READY | bytes=${byteLen}`);

    if (isRecordingHandoff) setPipelineStage("WRITING INPUT TO FFMPEG");
    for (const stale of ["input.mp4", "input.webm", "source.mp4", "source.webm"]) {
      await ffmpeg.deleteFile(stale).catch(() => {});
    }
    await ffmpeg.writeFile(inputName, fileBytes);
    let inputCheck;
    try { inputCheck = await ffmpeg.readFile(inputName); } catch { inputCheck = null; }
    const storedLen = inputCheck?.length ?? inputCheck?.byteLength ?? 0;
    console.log("  writeFile verify: storedLen=", storedLen);
    if (storedLen === 0) throw new Error(`FFmpeg virtual file ${inputName} is missing or zero bytes after write.`);
    if (isRecordingHandoff) setPipelineStage(`INPUT WRITE COMPLETE | bytes=${storedLen}`);

    lastFfmpegLogs.length = 0;
    lastFfmpegError = null;
    lastFfmpegExitCode = null;
    lastDetectedCodec = null;
    const logHandler = ({ message }) => {
      if (message) {
        lastFfmpegLogs.push(message);
        if (lastFfmpegLogs.length > MAX_FFMPEG_LOGS) lastFfmpegLogs.shift();
        setFfmpegStatus(`FFmpeg: ${message}`);
        const codecMatch = message.match(/Video:\s*(\S+)/);
        if (codecMatch) lastDetectedCodec = codecMatch[1].replace(/,/g, " ");
      }
    };
    ffmpeg.on("log", logHandler);

    if (isRecordingHandoff) setPipelineStage("TESTING PNG DECODER PATH");
    setOperationStatus("Testing PNG decoder path...");
    await ffmpeg.createDir("probe").catch(() => {});
    const probeArgs = ["-i", inputName, "-an", "-frames:v", "1", "probe/test.png"];
    console.log("FFMPEG DIAG PROBE - EXEC", JSON.stringify(probeArgs));
    let probeOk = false;
    let probeError = null;
    try {
      const probeResult = await ffmpeg.exec(probeArgs);
      const probeCode = typeof probeResult === "number" ? probeResult : 0;
      if (probeCode === 0) {
        const probeData = await ffmpeg.readFile("probe/test.png").catch(() => null);
        const probeLen = probeData?.length ?? probeData?.byteLength ?? 0;
        probeOk = probeLen > 0;
      }
    } catch (probeErr) {
      probeError = probeErr;
    }
    await ffmpeg.deleteFile("probe/test.png").catch(() => {});
    await ffmpeg.deleteDir("probe").catch(() => {});

    if (!probeOk) {
      const probeMsg = formatError(probeError || new Error("Single frame extraction failed"));
      const isMemoryCrash = probeMsg.includes("memory access out of bounds") || probeMsg.includes("RuntimeError");
      const codecInfo = lastDetectedCodec || "unknown";
      lastFfmpegError = probeMsg;
      lastFfmpegExitCode = -1;
      updateSettingsDiagnostics();

      const tail = lastFfmpegLogs.slice(-10).join("\n");
      const userMsg = `Frame extraction failed while decoding ${codecInfo} video. See Advanced Diagnostics for details.`;
      if (isRecordingHandoff) setPipelineStage(`ERROR: PNG DECODER TEST FAILED: ${probeMsg}`);
      window.alert(userMsg);
      console.error("FFMPEG PNG PROBE FAIL:", probeMsg);
      console.error("FFmpeg logs:", tail);
      if (options.throwOnError) throw new Error(userMsg);
      return;
    }

    if (isRecordingHandoff) setPipelineStage("PNG DECODER TEST PASSED");

    if (isRecordingHandoff) setPipelineStage("CREATING FRAME DIRECTORY");
    await cleanFfmpegPath(ffmpeg, "frames");
    await ffmpeg.createDir("frames");
    if (isRecordingHandoff) setPipelineStage("FRAME DIRECTORY READY");

    if (isRecordingHandoff) setPipelineStage("STARTING FFMPEG EXEC");
    setOperationStatus("Extracting frames...");
    if (isRecordingHandoff) setRecordingProcessStage("EXTRACTING FRAMES", "Decoding video...", null, "This may take a while for longer recordings.");
    const execArgs = ["-i", inputName, "-an", "frames/Frame_%09d.png"];
    console.log("FFMPEG DIAG 6 - EXEC", JSON.stringify(execArgs));
    let execResult;
    let fullExtractFailed = false;
    try {
      execResult = await ffmpeg.exec(execArgs);
    } catch (execErr) {
      fullExtractFailed = true;
      execResult = execErr;
    }
    const execCode = typeof execResult === "number" ? execResult : 0;
    lastFfmpegExitCode = execCode;
    console.log("  exec returned:", execResult);

    let batchedMode = false;
    if (fullExtractFailed || execCode !== 0) {
      const errMsg = formatError(execResult);
      const isMemoryIssue = errMsg.includes("memory access out of bounds") || errMsg.includes("RuntimeError") || errMsg.includes("out of memory");
      lastFfmpegError = errMsg;

      if (isMemoryIssue) {
        console.warn("Full extraction failed with memory error, switching to batched mode");
        batchedMode = true;
      } else {
        const tail = lastFfmpegLogs.slice(-10).join("\n");
        lastFfmpegError = errMsg;
        updateSettingsDiagnostics();
        throw new Error(`FFmpeg extraction failed: ${errMsg}`);
      }
    }

    if (!batchedMode) {
      if (isRecordingHandoff) setPipelineStage("FFMPEG EXEC COMPLETE");
    }

    ffmpeg.off("log", logHandler);

    if (batchedMode) {
      await cleanFfmpegPath(ffmpeg, "frames");
      await ffmpeg.createDir("frames");

      let totalDuration = 0;
      try {
        const probe2Args = ["-i", inputName];
        const durLogs = [];
        const durHandler = ({ message }) => { if (message) durLogs.push(message); };
        ffmpeg.on("log", durHandler);
        await ffmpeg.exec(probe2Args).catch(() => {});
        ffmpeg.off("log", durHandler);
        for (const line of durLogs) {
          const dm = line.match(/Duration:\s*(\d+):(\d+):(\d+)\.(\d+)/);
          if (dm) {
            totalDuration = parseInt(dm[1]) * 3600 + parseInt(dm[2]) * 60 + parseInt(dm[3]) + parseInt(dm[4]) / 100;
            break;
          }
        }
      } catch {}
      if (totalDuration <= 0) totalDuration = 30;

      const BATCH_SECONDS = 5;
      const totalBatches = Math.ceil(totalDuration / BATCH_SECONDS);
      console.log(`BATCHED MODE: duration=${totalDuration}s, batches=${totalBatches}`);

      let globalFrameIndex = 0;
      for (let batch = 0; batch < totalBatches; batch++) {
        const start = batch * BATCH_SECONDS;
        if (isRecordingHandoff) setPipelineStage(`EXTRACTING BATCH ${batch + 1}/${totalBatches}`);
        setOperationStatus(`Extracting batch ${batch + 1} of ${totalBatches}...`);
        if (isRecordingHandoff) {
          const batchPct = Math.round(((batch) / totalBatches) * 100);
          setRecordingProcessStage("EXTRACTING FRAMES", `Batch ${batch + 1} of ${totalBatches}`, batchPct, `Video segment ${formatDurationHMS(start)}-${formatDurationHMS(start + BATCH_SECONDS)}`);
        }

        await cleanFfmpegPath(ffmpeg, "frames");
        await ffmpeg.createDir("frames").catch(() => {});

        lastFfmpegLogs.length = 0;
        ffmpeg.on("log", logHandler);
        const batchArgs = ["-ss", String(start), "-t", String(BATCH_SECONDS), "-i", inputName, "-an", "frames/Frame_%09d.png"];
        console.log(`  BATCH ${batch + 1} EXEC:`, JSON.stringify(batchArgs));
        let batchResult;
        let batchFailed = false;
        try {
          batchResult = await ffmpeg.exec(batchArgs);
        } catch (bErr) {
          batchFailed = true;
          batchResult = bErr;
        }
        ffmpeg.off("log", logHandler);

        const batchCode = typeof batchResult === "number" ? batchResult : 0;
        if (batchFailed || batchCode !== 0) {
          console.warn(`  Batch ${batch + 1} failed, skipping:`, formatError(batchResult));
          continue;
        }

        if (isRecordingHandoff) setPipelineStage(`CONVERTING BATCH ${batch + 1}/${totalBatches} TO JPEG`);
        setOperationStatus(`Converting batch ${batch + 1} to JPEG...`);
        if (isRecordingHandoff) {
          setRecordingProcessStage("CONVERTING FRAMES TO JPEG", `Batch ${batch + 1} of ${totalBatches}`, Math.round(((batch) / totalBatches) * 100));
        }

        let batchEntries;
        try {
          batchEntries = (await ffmpeg.listDir("frames"))
            .filter((e) => !e.isDir && /\.png$/i.test(e.name))
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
        } catch {
          batchEntries = [];
        }

        if (isRecordingHandoff) setPipelineStage(`SAVING BATCH ${batch + 1}/${totalBatches}`);
        for (const entry of batchEntries) {
          const data = await ffmpeg.readFile(`frames/${entry.name}`);
          const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
          if (bytes.length === 0) continue;
          const pngBlob = new Blob([bytes], { type: "image/png" });
          const jpegBlob = await pngBlobToJpegBlob(pngBlob);
          const url = URL.createObjectURL(jpegBlob);
          const image = await loadImage(url);
          const timestampSeconds = globalFrameIndex / 30;
          const jpegName = entry.name.replace(/\.png$/i, ".jpg");
          state.frames.push({
            id: crypto.randomUUID(),
            name: jpegName,
            type: "image/jpeg",
            url,
            width: image.naturalWidth,
            height: image.naturalHeight,
            checked: false,
            junk: false,
            savedEvidence: false,
            edit: defaultEdit(),
            _blob: jpegBlob,
            native: {
              relativePath: `Images/JPEG/Recording_001/${jpegName}`,
              frameIndex: globalFrameIndex,
              frameNumber: globalFrameIndex + 1,
              timestampSeconds,
              timecode: timecodeFromSeconds(timestampSeconds),
              recordingId: "Browser_FFmpeg_001",
            },
          });
          globalFrameIndex++;
        }

        await cleanFfmpegPath(ffmpeg, "frames");
      }

      if (isRecordingHandoff) setPipelineStage(`FRAMES READ | count=${state.frames.length}`);
    } else {
      if (isRecordingHandoff) setPipelineStage("LISTING FRAME DIRECTORY");
      let entries;
      try {
        entries = (await ffmpeg.listDir("frames"))
          .filter((entry) => !entry.isDir && /\.png$/i.test(entry.name))
          .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      } catch (listErr) {
        throw new Error(`Failed to list frames directory: ${formatError(listErr)}`);
      }
      console.log("  frame entries found:", entries.length);
      if (entries.length > 0) {
        console.log("  first frame:", entries[0].name);
        console.log("  last frame:", entries[entries.length - 1].name);
      }
      if (isRecordingHandoff) setPipelineStage(`FRAME DIRECTORY LISTED | count=${entries.length}`);
      if (entries.length === 0) {
        throw new Error("FFmpeg completed but produced zero PNG frames.");
      }

      if (isRecordingHandoff) setPipelineStage("CONVERTING FRAMES TO JPEG");
      setOperationStatus("Converting frames to JPEG...");
      if (isRecordingHandoff) setRecordingProcessStage("CONVERTING FRAMES TO JPEG", `Total: ${entries.length} frames`, 0);
      const firstEntry = entries[0];
      let firstData;
      try {
        firstData = await ffmpeg.readFile(`frames/${firstEntry.name}`);
      } catch (readErr) {
        throw new Error(`Failed to read first frame ${firstEntry.name}: ${formatError(readErr)}`);
      }
      const firstBytes = firstData instanceof Uint8Array ? firstData : new Uint8Array(firstData);
      if (firstBytes.length === 0) throw new Error(`First frame ${firstEntry.name} read as zero bytes.`);
      const firstPngBlob = new Blob([firstBytes], { type: "image/png" });
      const firstJpegBlob = await pngBlobToJpegBlob(firstPngBlob);
      const firstUrl = URL.createObjectURL(firstJpegBlob);
      const firstImage = await loadImage(firstUrl);
      const firstJpegName = firstEntry.name.replace(/\.png$/i, ".jpg");
      console.log("  first frame ok:", firstEntry.name, "bytes:", firstBytes.length, "dim:", firstImage.naturalWidth, "x", firstImage.naturalHeight);

      for (let index = 0; index < entries.length; index += 1) {
        const entry = entries[index];
        let data;
        if (index === 0) {
          data = firstData;
        } else {
          data = await ffmpeg.readFile(`frames/${entry.name}`);
        }
        const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
        const pngBlob = new Blob([bytes], { type: "image/png" });
        const jpegBlob = index === 0 ? firstJpegBlob : await pngBlobToJpegBlob(pngBlob);
        const url = index === 0 ? firstUrl : URL.createObjectURL(jpegBlob);
        let image;
        let width;
        let height;
        if (index === 0) {
          image = firstImage;
          width = firstImage.naturalWidth;
          height = firstImage.naturalHeight;
        } else {
          image = await loadImage(url);
          width = image.naturalWidth;
          height = image.naturalHeight;
        }
        const timestampSeconds = index / 30;
        const jpegName = entry.name.replace(/\.png$/i, ".jpg");
        state.frames.push({
          id: crypto.randomUUID(),
          name: jpegName,
          type: "image/jpeg",
          url,
          width,
          height,
          checked: false,
          junk: false,
          savedEvidence: false,
          edit: defaultEdit(),
          _blob: jpegBlob,
          native: {
            relativePath: `Images/JPEG/Recording_001/${jpegName}`,
            frameIndex: index,
            frameNumber: index + 1,
            timestampSeconds,
            timecode: timecodeFromSeconds(timestampSeconds),
            recordingId: "Browser_FFmpeg_001",
          },
        });
        // Update progress every 10 frames or on last frame
        if (isRecordingHandoff && (index % 10 === 0 || index === entries.length - 1)) {
          const pct = Math.round(((index + 1) / entries.length) * 100);
          setRecordingProcessStage("CONVERTING FRAMES TO JPEG", `${index + 1} / ${entries.length}`, pct);
        }
      }
      if (isRecordingHandoff) setPipelineStage(`FRAMES READ | count=${state.frames.length}`);
    }

    await ffmpeg.deleteFile(inputName).catch(() => {});
    if (state.frames.length === 0)
      throw new Error("FFmpeg finished, but no frames were created.");

    if (isRecordingHandoff) setPipelineStage("PERSISTING FRAMES");
    if (isRecordingHandoff) setRecordingProcessStage("SAVING SESSION", `Frames: ${state.frames.length}`, null);
    try {
      persistCurrentSession();
    } catch (persistErr) {
      console.error("Frame persistence error:", persistErr);
      if (isRecordingHandoff) setPipelineStage(`ERROR: Frame persistence failed: ${formatError(persistErr)}`);
    }
    if (isRecordingHandoff) setPipelineStage("FRAMES PERSISTED");

    if (isRecordingHandoff) setPipelineStage("OPENING ANALYSIS");
    if (isRecordingHandoff) setRecordingProcessStage("OPENING ANALYSIS", null, null);
    selectFrame(0, false);
    showPanel("analysis");
    clearOperationStatus();
    if (isRecordingHandoff) setPipelineStage("COMPLETE");

    updateSettingsDiagnostics();
    console.log("FFMPEG DIAG 9 - EXTRACTION COMPLETE  frames:", state.frames.length);
  } catch (error) {
    const msg = formatError(error);
    lastFfmpegError = msg;
    console.error("FFMPEG DIAG FAIL:", error);
    clearOperationStatus();
    if (isRecordingHandoff) setPipelineStage(`ERROR: ${msg}`);
    if (isRecordingHandoff) setRecordingProcessError("Frame Extraction", msg.split("\n")[0]);
    window.alert(`Frame extraction failed: ${msg.split("\n")[0]}`);
    if (options.throwOnError) throw error;
  } finally {
    updateUI();
    render();
  }
}

async function ensureFFmpeg() {
  if (ffmpegReady && ffmpegInstance)
    return ffmpegInstance;

  if (ffmpegLoading)
    return ffmpegLoadingPromise;

  ffmpegLoading = true;
  ffmpegLoadingPromise = loadFFmpegCore();
  return ffmpegLoadingPromise;
}

async function loadFFmpegCore() {
  setPipelineStage("FFMPEG CHECK WRAPPER");
  console.log("FFMPEG LOAD 1 - START");
  const FFmpegClass = window.FFmpegWASM?.FFmpeg;
  console.log("  window.FFmpegWASM:", typeof window.FFmpegWASM);
  console.log("  FFmpegClass:", typeof FFmpegClass);

  if (typeof FFmpegClass !== "function") {
    const msg = "FFmpeg wrapper global unavailable. Ensure assets/ffmpeg/ffmpeg.js is accessible.";
    console.error("FFMPEG LOAD FAIL:", msg);
    setFfmpegStatus(`FFmpeg: ${msg}`);
    setPipelineStage(`ERROR: ${msg}`);
    ffmpegLoading = false;
    ffmpegLoadingPromise = null;
    throw new Error(msg);
  }
  setPipelineStage("FFMPEG WRAPPER READY");

  setPipelineStage("FFMPEG CHECK UTILITY");
  const toBlobURL = window.FFmpegUtil?.toBlobURL;
  console.log("  window.FFmpegUtil:", typeof window.FFmpegUtil);
  console.log("  toBlobURL:", typeof toBlobURL);

  if (typeof toBlobURL !== "function") {
    const msg = "FFmpeg utility global unavailable. Ensure assets/ffmpeg/util.js is accessible.";
    console.error("FFMPEG LOAD FAIL:", msg);
    setFfmpegStatus(`FFmpeg: ${msg}`);
    setPipelineStage(`ERROR: ${msg}`);
    ffmpegLoading = false;
    ffmpegLoadingPromise = null;
    throw new Error(msg);
  }
  setPipelineStage("FFMPEG UTILITY READY");

  setPipelineStage("FFMPEG CREATE INSTANCE");
  const ffmpeg = new FFmpegClass();
  ffmpeg.on("log", ({ message }) => {
    if (message)
      setFfmpegStatus(`FFmpeg: ${message}`);
  });
  ffmpeg.on("progress", ({ progress }) => {
    if (Number.isFinite(progress))
      setFfmpegStatus(`FFmpeg: extracting frames ${Math.max(0, Math.min(100, Math.round(progress * 100)))}%`);
  });
  setPipelineStage("FFMPEG INSTANCE READY");

  const coreBase = resolveAssetUrl("assets/ffmpeg");
  const coreJsUrl = `${coreBase}/ffmpeg-core.js`;
  const coreWasmUrl = "/app-assets/itc-visual-studio/ffmpeg-core.wasm";
  console.log("FFMPEG LOAD 2 - CORE BASE:", coreBase);
  setFfmpegStatus("FFmpeg: loading browser video engine...");

  let coreURL;
  let wasmURL;
  try {
    setPipelineStage("FFMPEG BUILD CORE URL");
    console.log("FFMPEG LOAD 3 - fetching core.js:", coreJsUrl);
    coreURL = await toBlobURL(coreJsUrl, "text/javascript");
    console.log("FFMPEG LOAD 3a - core.js blob URL created");
    setPipelineStage("FFMPEG CORE URL READY");

    setPipelineStage("FFMPEG BUILD WASM URL");
    console.log("FFMPEG LOAD 4 - fetching core.wasm:", coreWasmUrl);
    wasmURL = await toBlobURL(coreWasmUrl, "application/wasm");
    console.log("FFMPEG LOAD 4a - core.wasm blob URL created");
    setPipelineStage("FFMPEG WASM URL READY");
  } catch (fetchError) {
    const msg = `FFmpeg core asset fetch failed: ${fetchError.message}`;
    console.error("FFMPEG LOAD FAIL:", msg, fetchError);
    setFfmpegStatus(`FFmpeg: ${msg}`);
    setPipelineStage(`ERROR: ${msg}`);
    ffmpegLoading = false;
    ffmpegLoadingPromise = null;
    throw new Error(msg);
  }

  setPipelineStage("FFMPEG CALL LOAD");
  console.log("FFMPEG LOAD 5 - calling ffmpeg.load()");
  try {
    await Promise.race([
      ffmpeg.load({ coreURL, wasmURL }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("FFmpeg initialization timed out after 30 seconds")), 30000)
      ),
    ]);
    console.log("FFMPEG LOAD 6 - ffmpeg.load() success");
  } catch (loadError) {
    const msg = `FFmpeg WASM load failed: ${loadError.message}`;
    console.error("FFMPEG LOAD FAIL:", msg, loadError);
    setFfmpegStatus(`FFmpeg: ${msg}`);
    setPipelineStage(`ERROR: ${msg}`);
    ffmpegLoading = false;
    ffmpegLoadingPromise = null;
    ffmpegInstance = null;
    ffmpegReady = false;
    throw new Error(msg);
  }

  setPipelineStage("FFMPEG LOAD RESOLVED");
  ffmpegInstance = ffmpeg;
  ffmpegReady = true;
  ffmpegLoading = false;
  setFfmpegStatus("FFmpeg: ready.");
  setPipelineStage("FFMPEG READY");
  console.log("FFMPEG LOAD 7 - READY");
  return ffmpeg;
}

async function testFFmpegOnly() {
  setPipelineStage("TEST FFMPEG CLICKED");
  try {
    await ensureFFmpeg();
    setPipelineStage("FFMPEG READY - TEST PASSED");
    setFfmpegStatus("FFmpeg: ready (test passed).");
  } catch (err) {
    const msg = formatError(err);
    setPipelineStage(`ERROR: ${msg}`);
    setFfmpegStatus(`FFmpeg test failed: ${msg}`);
  }
}

function resolveAssetUrl(relativePath) {
  const base = window.location.href;
  return new URL(relativePath, base).href;
}

async function cleanFfmpegPath(ffmpeg, path) {
  try {
    const entries = await ffmpeg.listDir(path);
    for (const entry of entries) {
      if (entry.name === "." || entry.name === "..")
        continue;
      const childPath = `${path}/${entry.name}`;
      if (entry.isDir)
        await cleanFfmpegPath(ffmpeg, childPath);
      else
        await ffmpeg.deleteFile(childPath).catch(() => {});
    }
    await ffmpeg.deleteDir(path).catch(() => {});
  } catch {
    // The path does not exist yet, which is fine for a fresh import.
  }
}

function setFfmpegStatus(message) {
  if (el.ffmpegStatus)
    el.ffmpegStatus.textContent = message;
}

function setPipelineStage(stage) {
  console.log("PIPELINE STAGE:", stage);
  if (el.recordingPipelineProbe)
    el.recordingPipelineProbe.textContent = `Recording Pipeline: ${stage}`;
}

async function refreshMediaDevices(options = {}) {
  if (!navigator.mediaDevices?.enumerateDevices) {
    setCameraStatus("Camera: browser media devices are unavailable. Use HTTPS or localhost.");
    setAudioStatus("Mic: browser media devices are unavailable. Use HTTPS or localhost.");
    return;
  }

  try {
    let devices = await navigator.mediaDevices.enumerateDevices();
    if (options.afterPermission)
      devices = await navigator.mediaDevices.enumerateDevices();

    const videoInputs = devices.filter((device) => device.kind === "videoinput");
    const audioInputs = devices.filter((device) => device.kind === "audioinput");
    populateDeviceSelect(el.cameraDeviceSelect, videoInputs, "camera");
    populateDeviceSelect(el.audioDeviceSelect, audioInputs, "microphone");
    updateDeviceDiagnostics(videoInputs, audioInputs);
    setCameraStatus(state.camera.videoStream ? "CAMERA: ARMED" : videoInputs.length ? "Camera: Ready" : "Camera: no camera found");
    setAudioStatus(state.camera.audioStream ? activeAudioStatusText() : audioInputs.length ? "MIC: OFF" : "Mic: no microphone found");
  } catch (error) {
    setCameraStatus(`Camera: ${error.message}`);
    setAudioStatus(`Mic: ${error.message}`);
  }
}

async function unlockMediaDeviceLabels() {
  state.camera.permissionProbeRunning = true;
  const temporaryStreams = [];
  try {
    setCameraStatus("Camera: requesting browser permission...");
    setAudioStatus("Mic: requesting browser permission...");
    try {
      temporaryStreams.push(await navigator.mediaDevices.getUserMedia({ video: true, audio: true }));
    } catch {
      temporaryStreams.push(await navigator.mediaDevices.getUserMedia({ video: true }).catch(() => null));
      temporaryStreams.push(await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null));
    }
    state.camera.permissionProbeDone = true;
  } finally {
    temporaryStreams.filter(Boolean).forEach((stream) => {
      stream.getTracks().forEach((track) => track.stop());
    });
    state.camera.permissionProbeRunning = false;
  }
}

function populateDeviceSelect(select, devices, label) {
  if (!select)
    return;

  const previous = select.value;
  select.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = label === "camera" ? "System Default Camera" : "System Default Microphone";
  select.appendChild(defaultOption);

  if (devices.length === 0) {
    const option = document.createElement("option");
    option.value = "__none";
    option.disabled = true;
    option.textContent = `No named ${label}s found yet`;
    select.appendChild(option);
    select.value = "";
    return;
  }

  devices.forEach((device, index) => {
    const option = document.createElement("option");
    option.value = device.deviceId;
    option.textContent = device.label || `${label[0].toUpperCase()}${label.slice(1)} ${index + 1}`;
    select.appendChild(option);
  });
  if ([...select.options].some((option) => option.value === previous))
    select.value = previous;
}

function updateDeviceDiagnostics(videoInputs, audioInputs) {
  if (el.cameraDeviceStatus) {
    const names = videoInputs.map((device, index) => device.label || `Camera ${index + 1}`).join(", ");
    el.cameraDeviceStatus.textContent = videoInputs.length
      ? `Detected cameras: ${videoInputs.length} - ${names}`
      : "Detected cameras: 0 - use System Default Camera, then check browser and macOS camera permissions.";
  }
  if (el.audioDeviceStatus) {
    const names = audioInputs.map((device, index) => device.label || `Microphone ${index + 1}`).join(", ");
    el.audioDeviceStatus.textContent = audioInputs.length
      ? `Detected microphones: ${audioInputs.length} - ${names}`
      : "Detected microphones: 0 - use System Default Microphone, then check browser and macOS microphone permissions.";
  }
}

async function connectDevices() {
  if (!navigator.mediaDevices?.getUserMedia) {
    setCameraStatus("Camera: this browser does not support media capture.");
    setAudioStatus("Mic: this browser does not support media capture.");
    return;
  }

  try {
    setCameraStatus("Camera: connecting devices...");
    setAudioStatus("Mic: connecting devices...");
    stopCameraStream();
    stopAudioStream();

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: buildCameraConstraints(),
        audio: buildAudioConstraints(),
      });
    } catch (primaryError) {
      const isDeviceBusy = primaryError?.name === "NotReadableError" || primaryError?.name === "AbortError";
      const isOverconstrained = primaryError?.name === "OverconstrainedError";

      if (isDeviceBusy) {
        console.warn("Device busy during connect, retrying...");
        await new Promise(r => setTimeout(r, 300));
        const devId = selectedDeviceId(el.cameraDeviceSelect);
        const minimal = devId
          ? { video: { deviceId: { exact: devId } }, audio: buildAudioConstraints() }
          : { video: true, audio: buildAudioConstraints() };
        stream = await navigator.mediaDevices.getUserMedia(minimal);
      } else if (isOverconstrained) {
        const devId = selectedDeviceId(el.cameraDeviceSelect);
        const fallback = devId
          ? { video: { deviceId: { exact: devId } }, audio: buildAudioConstraints() }
          : { video: true, audio: buildAudioConstraints() };
        setCameraStatus("Camera: selected format unavailable, trying device default...");
        stream = await navigator.mediaDevices.getUserMedia(fallback);
      } else {
        throw primaryError;
      }
    }

    attachConnectedStream(stream);
    state.camera.permissionProbeDone = true;
    await refreshMediaDevices({ afterPermission: true });
  } catch (combinedError) {
    console.error(combinedError);
    await connectDevicesSeparately(combinedError);
  } finally {
    updateRecordButtonState();
  }
}

async function connectDevicesSeparately(originalError) {
  let videoStream = null;
  let audioStream = null;
  let videoError = null;
  let audioError = null;

  // Try video with full constraints first
  try {
    videoStream = await navigator.mediaDevices.getUserMedia({ video: buildCameraConstraints(), audio: false });
  } catch (error) {
    videoError = error;
    // If overconstrained or busy, retry with just deviceId
    const devId = selectedDeviceId(el.cameraDeviceSelect);
    if (devId && (error?.name === "OverconstrainedError" || error?.name === "NotReadableError" || error?.name === "AbortError")) {
      try {
        if (error?.name === "NotReadableError" || error?.name === "AbortError") {
          await new Promise(r => setTimeout(r, 300));
        }
        videoStream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: devId } }, audio: false });
        videoError = null;
      } catch (retryErr) {
        videoError = retryErr;
      }
    }
  }

  try {
    audioStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: buildAudioConstraints() });
  } catch (error) {
    audioError = error;
  }

  if (!videoStream && !audioStream) {
    const message = friendlyMediaError(videoError || audioError || originalError);
    const devId = selectedDeviceId(el.cameraDeviceSelect);
    const deviceName = devId ? (el.cameraDeviceSelect?.selectedOptions?.[0]?.textContent || "External camera") : "Camera";
    setCameraStatus(`${deviceName} unavailable: ${message}`);
    setAudioStatus(`Mic: ${message}`);
    window.alert(`Camera and microphone could not be connected: ${message}`);
    return;
  }

  const tracks = [
    ...(videoStream ? videoStream.getVideoTracks() : []),
    ...(audioStream ? audioStream.getAudioTracks() : []),
  ];
  attachConnectedStream(new MediaStream(tracks));
  state.camera.permissionProbeDone = true;
  await refreshMediaDevices({ afterPermission: true });

  if (videoError) {
    const devId = selectedDeviceId(el.cameraDeviceSelect);
    const deviceName = devId ? (el.cameraDeviceSelect?.selectedOptions?.[0]?.textContent || "External camera") : "Camera";
    setCameraStatus(`${deviceName} unavailable: ${friendlyMediaError(videoError)}`);
  }
  if (audioError)
    setAudioStatus(`Mic: ${friendlyMediaError(audioError)}`);
}

function attachConnectedStream(stream) {
  const videoTracks = stream.getVideoTracks();
  const audioTracks = stream.getAudioTracks();

  if (videoTracks.length) {
    state.camera.videoStream = new MediaStream(videoTracks);
    el.cameraPreviewVideo.srcObject = state.camera.videoStream;
    el.cameraPreviewVideo.hidden = false;
    setCameraStatus("Camera: Armed");
    updateCameraCaptureMetadata();
  } else {
    state.camera.videoStream = null;
    el.cameraPreviewVideo.srcObject = null;
    el.cameraPreviewVideo.hidden = true;
    setCameraStatus("Camera: no video track connected");
  }

  // Update startup overlay and record button based on session + camera state
  updateCameraStartupOverlay();
  updateRecordButtonState();

  if (audioTracks.length) {
    state.camera.audioStream = new MediaStream(audioTracks);
    setupAudioMeter();
    setAudioStatus(activeAudioStatusText());
  } else {
    state.camera.audioStream = null;
    stopAudioMeter();
    setAudioStatus("MIC: OFF");
  }
}

function buildCameraConstraints() {
  const [width, height] = (el.cameraFormatSelect.value || "1280x720").split("x").map(Number);
  const frameRate = Number(el.cameraFpsSelect.value || 30);
  const devId = selectedDeviceId(el.cameraDeviceSelect);
  const constraints = {
    width: { ideal: width },
    height: { ideal: height },
    frameRate: { ideal: frameRate },
  };
  if (devId) {
    constraints.deviceId = { exact: devId };
  }
  return constraints;
}

function buildAudioConstraints() {
  const constraints = {
    channelCount: Number(el.audioChannelSelect.value || 1),
    sampleRate: Number(el.audioSampleRateSelect.value || 48000),
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
  };
  if (selectedDeviceId(el.audioDeviceSelect))
    constraints.deviceId = { exact: selectedDeviceId(el.audioDeviceSelect) };
  return constraints;
}

async function toggleCameraArm() {
  if (state.camera.videoStream) {
    stopCameraStream();
    updateCameraControls();
    return;
  }

  try {
    const constraints = {
      video: buildCameraConstraints(),
      audio: false,
    };

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (primaryError) {
      const isDeviceBusy = primaryError?.name === "NotReadableError" || primaryError?.name === "AbortError";
      const isOverconstrained = primaryError?.name === "OverconstrainedError";

      if (isDeviceBusy) {
        stopCameraStream();
        await new Promise(r => setTimeout(r, 300));
        const devId = selectedDeviceId(el.cameraDeviceSelect);
        const minimal = devId
          ? { video: { deviceId: { exact: devId } }, audio: false }
          : { video: true, audio: false };
        stream = await navigator.mediaDevices.getUserMedia(minimal);
      } else if (isOverconstrained) {
        const devId = selectedDeviceId(el.cameraDeviceSelect);
        const fallback = devId
          ? { video: { deviceId: { exact: devId } }, audio: false }
          : { video: true, audio: false };
        setCameraStatus("Camera: selected format unavailable, trying device default...");
        stream = await navigator.mediaDevices.getUserMedia(fallback);
      } else {
        throw primaryError;
      }
    }

    state.camera.videoStream = stream;
    el.cameraPreviewVideo.srcObject = stream;
    el.cameraPreviewVideo.hidden = false;

    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      const settings = videoTrack.getSettings();
      const w = settings.width || 0;
      const h = settings.height || 0;
      const fps = settings.frameRate ? Math.round(settings.frameRate) : 0;
      const deviceLabel = videoTrack.label || "Camera";
      setCameraStatus(`${deviceLabel} connected - ${w}x${h} @ ${fps} FPS`);
    } else {
      setCameraStatus("Camera: Armed");
    }

    updateCameraStartupOverlay();
    updateCameraCaptureMetadata();
    await refreshMediaDevices({ afterPermission: true });
  } catch (error) {
    console.error(error);
    const devId = selectedDeviceId(el.cameraDeviceSelect);
    const deviceName = devId ? (el.cameraDeviceSelect?.selectedOptions?.[0]?.textContent || "External camera") : "Camera";
    setCameraStatus(`${deviceName} unavailable: ${friendlyMediaError(error)}`);
    window.alert(`Camera could not be armed: ${friendlyMediaError(error)}`);
  } finally {
    updateRecordButtonState();
  }
}

async function getCameraStreamWithFallback(primaryConstraints) {
  try {
    return await navigator.mediaDevices.getUserMedia(primaryConstraints);
  } catch (error) {
    if (error?.name !== "OverconstrainedError")
      throw error;

    const fallback = {
      video: {},
      audio: false,
    };
    if (selectedDeviceId(el.cameraDeviceSelect))
      fallback.video.deviceId = { exact: el.cameraDeviceSelect.value };
    setCameraStatus("Camera: selected format unavailable, trying device default...");
    return navigator.mediaDevices.getUserMedia(fallback);
  }
}

async function toggleAudioArm() {
  if (state.camera.audioStream) {
    stopAudioStream();
    updateCameraControls();
    return;
  }

  try {
    const constraints = {
      audio: buildAudioConstraints(),
      video: false,
    };

    state.camera.audioStream = await navigator.mediaDevices.getUserMedia(constraints);
    setupAudioMeter();
    await refreshMediaDevices({ afterPermission: true });
  } catch (error) {
    console.error(error);
    setAudioStatus(`Mic: ${friendlyMediaError(error)}`);
    window.alert(`Microphone could not be armed: ${friendlyMediaError(error)}`);
  } finally {
    updateRecordButtonState();
  }
}

function selectedDeviceId(select) {
  const value = select?.value || "";
  return value && value !== "__none" ? value : "";
}

function toggleCameraRecording() {
  if (state.camera.finalizing) {
    console.log("TOGGLE IGNORED - finalizing");
    return;
  }
  if (state.camera.recorder?.state === "recording") {
    // Manual stop - prevent auto-stop from also firing
    state.camera.autoStopTriggered = true;
    stopCameraRecording();
    return;
  }
  startCameraRecording();
}

function startCameraRecording() {
  if (!hasActiveSession()) {
    window.alert("Create or restore a session before recording.");
    return;
  }
  if (!state.camera.videoStream) {
    window.alert("Camera is not connected. Please wait for the camera to start or check permissions.");
    return;
  }
  if (typeof MediaRecorder !== "function") {
    window.alert("This browser does not support MediaRecorder camera recording.");
    return;
  }

  // DIAGNOSTIC: Recording start
  const videoTracks = state.camera.videoStream.getVideoTracks();
  const audioTracks = state.camera.audioStream ? state.camera.audioStream.getAudioTracks() : [];
  console.log("RECORD DIAG 1 - RECORD START");
  console.log("  session ID:", state.session?.id);
  console.log("  camera stream exists:", Boolean(state.camera.videoStream));
  console.log("  video tracks:", videoTracks.length);
  if (videoTracks.length > 0) {
    const vt = videoTracks[0];
    console.log("  video track readyState:", vt.readyState);
    const vs = vt.getSettings();
    console.log("  video track settings:", JSON.stringify({ width: vs.width, height: vs.height, frameRate: vs.frameRate }));
  }
  console.log("  audio tracks:", audioTracks.length);

  const tracks = [...videoTracks, ...audioTracks];
  const stream = new MediaStream(tracks);
  const mimeType = bestCameraRecordingMimeType();
  console.log("  selected MIME type:", mimeType || "(none - will use browser default)");

  state.camera.chunks = [];
  // Capture selected recording duration for this recording
  const selectedDurationMs = Number(el.recordingDurationSelect?.value || 60000);
  state.camera.activeRecordDurationMs = Math.min(selectedDurationMs, state.camera.maxRecordMs);
  console.log("  activeRecordDurationMs:", state.camera.activeRecordDurationMs);
  // Ensure countdown overlay is hidden at start of new recording
  if (el.countdownOverlay) el.countdownOverlay.hidden = true;
  if (el.countdownOverlay) el.countdownOverlay.classList.remove("critical");
  clearAutoStopDiagnostic();
  try {
    state.camera.recorder = new MediaRecorder(stream, mimeType ? { mimeType, videoBitsPerSecond: 8000000 } : { videoBitsPerSecond: 8000000 });
    lastRecordingMime = state.camera.recorder.mimeType;
    console.log("  MediaRecorder created, mimeType:", state.camera.recorder.mimeType);
    updateSettingsDiagnostics();
  } catch (e) {
    console.error("RECORD DIAG 1 FAIL - MediaRecorder constructor error:", e);
    window.alert("Failed to create recorder: " + e.message);
    return;
  }

  state.camera.recorder.ondataavailable = (event) => {
    const size = event.data?.size || 0;
    if (size > 0)
      state.camera.chunks.push(event.data);
    // DIAGNOSTIC: Log every dataavailable event
    console.log("RECORD DIAG 2 - DATAAVAILABLE", {
      eventCount: state.camera.chunks.length,
      chunkSize: size,
      chunkType: event.data?.type,
      cumulativeBytes: state.camera.chunks.reduce((s, c) => s + c.size, 0),
    });
  };
  state.camera.recordingStartedAt = Date.now();
  state.camera.autoStopTriggered = false;
  state.camera.timer = window.setInterval(updateCameraRecordTimer, 250);
  state.camera.recorder.start(1000);
  console.log("  MediaRecorder state after start:", state.camera.recorder.state);
  console.log("  start() called with timeslice: 1000ms");
  setCameraStatus("CAMERA: RECORDING");
  setAudioStatus(state.camera.audioStream ? activeAudioStatusText("MIC: RECORDING") : "MIC: OFF");
  updateCameraRecordTimer();
  updateRecordButtonState();

  window.setTimeout(() => {
    if (state.camera.recorder?.state === "recording" && !state.camera.autoStopTriggered) {
      state.camera.autoStopTriggered = true;
      console.log("AUTO STOP - limit reached, stopping immediately");
      // Countdown overlay will be hidden by stopCameraRecording; processing overlay takes over
      stopCameraRecording();
    }
  }, state.camera.activeRecordDurationMs);
}

function stopCameraRecording() {
  setPipelineStage("STOP ENTERED");
  console.log("RECORD DIAG 4 - STOP ENTERED");
  console.log("  recorder state:", state.camera.recorder?.state);
  console.log("  finalizing:", state.camera.finalizing);
  console.log("  autoStopTriggered:", state.camera.autoStopTriggered);

  // Hide countdown overlay immediately on stop
  if (el.countdownOverlay) el.countdownOverlay.hidden = true;
  if (el.countdownOverlay) el.countdownOverlay.classList.remove("critical");

  // Show recording process overlay
  setRecordingProcessStage("STOPPING RECORDING", null, null);

  // Clear the record timer immediately to prevent repeated stop conditions
  if (state.camera.timer) {
    window.clearInterval(state.camera.timer);
    state.camera.timer = null;
    console.log("  record timer cleared");
  }

  if (state.camera.finalizing) {
    console.log("  STOP IGNORED - already finalizing");
    setPipelineStage("STOP IGNORED - already finalizing");
    return;
  }

  if (state.camera.recorder?.state === "recording") {
    state.camera.finalizing = true;
    console.log("  finalizing set to true");
    setAutoStopDiagnostic("STOP: finalizing=true, calling finalizeCameraRecording...");

    // Disable controls during finalization
    updateRecordButtonState();

    // Preserve stable references before async work
    const recorder = state.camera.recorder;
    const chunks = state.camera.chunks;
    const mimeType = recorder.mimeType || "video/mp4";
    const sessionId = state.session?.id;

    setPipelineStage("RECORDER CAPTURED");
    console.log("RECORD DIAG 4a - PRESERVED STATE");
    console.log("  mimeType:", mimeType);
    console.log("  sessionId:", sessionId);
    console.log("  chunks count:", chunks.length);

    setFfmpegStatus("Finalizing recording...");
    setRecordingProcessStage("FINALIZING VIDEO", "Preparing video data...", null);

    // Use Promise-based finalization
    finalizeCameraRecording(recorder, chunks, mimeType, sessionId)
      .then((result) => {
        console.log("RECORD DIAG FINALIZE - SUCCESS", result);
        setPipelineStage("COMPLETE");
        setAutoStopDiagnostic("");
        setRecordingProcessComplete(`${result.frameCount || state.frames.length} frames extracted`);
      })
      .catch((err) => {
        const msg = formatError(err);
        console.error("RECORD DIAG FINALIZE - ERROR:", err);
        setPipelineStage(`ERROR: ${msg}`);
        setFfmpegStatus(`Recording failed: ${msg}`);
        setAutoStopDiagnostic(`STOP FAILED: ${msg}`);
        setRecordingProcessError("Finalization", msg.split("\n")[0]);
      })
      .finally(() => {
        state.camera.finalizing = false;
        console.log("  finalizing set to false");
        updateRecordButtonState();
      });
  }
}

function finalizeCameraRecording(recorder, chunks, mimeType, sessionId) {
  return new Promise((resolve, reject) => {
    console.log("FINALIZE 1 - START PROMISE FINALIZATION");
    console.log("  recorder state:", recorder.state);
    console.log("  mimeType:", mimeType);
    console.log("  sessionId:", sessionId);
    console.log("  chunks before stop:", chunks.length);
    console.log("  bytes before stop:", chunks.reduce((s, c) => s + c.size, 0));
    setAutoStopDiagnostic("FINALIZE: entered, recorder.state=" + recorder.state);

    let settled = false;
    let timeoutId = null;
    let processingStarted = false;

    const cleanup = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      recorder.removeEventListener("stop", onStop);
      recorder.removeEventListener("error", onError);
    };

    const settleSuccess = (result) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };

    const settleError = (err) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(err);
    };

    const processRecording = async () => {
      setPipelineStage("PROCESS RECORDING ENTERED");
      setAutoStopDiagnostic("FINALIZE: processRecording entered");
      if (processingStarted) {
        setPipelineStage("ERROR: processRecording blocked by processingStarted");
        return;
      }
      processingStarted = true;
      const chunkCount = chunks.length;
      const byteCount = chunks.reduce((s, c) => s + c.size, 0);
      setPipelineStage(`PROCESS RECORDING ENTERED | chunks=${chunkCount} | bytes=${byteCount}`);
      console.log("FINALIZE 3 - PROCESS RECORDING");
      console.log("  chunks after stop:", chunkCount);
      console.log("  bytes after stop:", byteCount);

      if (chunkCount === 0) {
        setPipelineStage("ERROR: no recording chunks available");
        settleError(new Error("No recording chunks available"));
        return;
      }

      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      try {
        window.clearInterval(state.camera.timer);
        state.camera.timer = null;
        updateCameraRecordTimer(0);

        const blob = new Blob(chunks, { type: mimeType });
        setPipelineStage(`BLOB CREATED | size=${blob.size} | type=${mimeType}`);
        setAutoStopDiagnostic(`FINALIZE: blob created, size=${blob.size}, importing...`);
        console.log("FINALIZE 4 - BLOB CREATED");
        console.log("  blob size:", blob.size);

        // Preserve source video blob for session
        if (state.sourceVideo.url) URL.revokeObjectURL(state.sourceVideo.url);
        state.sourceVideo.blob = blob;
        state.sourceVideo.url = URL.createObjectURL(blob);
        state.sourceVideo.fileName = `${safeName(state.session?.name || "Browser_Recording")}_${timestampName()}.${mimeType.includes("mp4") ? "mp4" : "webm"}`;
        state.sourceVideo.mimeType = mimeType;
        state.sourceVideo.size = blob.size;
        state.sourceVideo.type = 'recorded';

        state.camera.recorder = null;
        state.camera.chunks = [];
        updateCameraCaptureMetadata();
        if (state.camera.videoStream)
          setCameraStatus("Camera: Armed");
        if (state.camera.audioStream)
          setAudioStatus(activeAudioStatusText());

        if (!blob.size) {
          setPipelineStage("ERROR: no video data was produced (blob size=0)");
          throw new Error("Recording failed: no video data was produced.");
        }

        const ext = mimeType.includes("mp4") ? "mp4" : mimeType.includes("quicktime") ? "mov" : "webm";
        const safeSession = safeName(state.session?.name || "Browser_Recording");
        const file = new File([blob], `${safeSession}_${timestampName()}.${ext}`, { type: mimeType });

        if (state.session) {
          state.session.recordingMimeType = mimeType;
          state.session.recordingLimitSeconds = Math.round(state.camera.activeRecordDurationMs / 1000);
        }

        setPipelineStage("FILE CREATED");
        console.log("FINALIZE 5 - FILE CREATED");
        console.log("  file name:", file.name);
        console.log("  file size:", file.size);
        console.log("  file type:", file.type);

        setFfmpegStatus("Preparing video for extraction...");
        setPipelineStage("CALLING IMPORTVIDEOFILE");
        setRecordingProcessStage("PREPARING FRAME EXTRACTION", `Video: ${file.name}`, null, `Size: ${formatBytes(file.size)}`);
        await importVideoFile(file, { preserveSession: true, throwOnError: true });

        setPipelineStage("IMPORTVIDEOFILE RETURNED");
        console.log("FINALIZE 6 - EXTRACTION COMPLETE");
        if (state.frames.length > 0) {
          setPipelineStage(`FRAMES AVAILABLE | count=${state.frames.length}`);
          setFfmpegStatus("Saving session...");
          setRecordingProcessStage("SAVING SESSION", `Frames: ${state.frames.length}`, null);
          persistCurrentSession();
          setPipelineStage("OPENING ANALYSIS");
          setFfmpegStatus("Opening Analysis...");
          setRecordingProcessStage("OPENING ANALYSIS", null, null);
          settleSuccess({ success: true, frameCount: state.frames.length });
        } else {
          setPipelineStage("ERROR: no frames were extracted");
          throw new Error("Recording completed, but no frames were extracted.");
        }
      } catch (error) {
        console.error("FINALIZE 6 - PROCESSING FAILED:", error);
        setPipelineStage(`ERROR: ${formatError(error)}`);
        settleError(error);
      }
    };

    const onStop = () => {
      setPipelineStage("STOP EVENT RECEIVED");
      console.log("FINALIZE 2 - ONSTOP FIRED via addEventListener");
      setAutoStopDiagnostic("FINALIZE: stop event received, calling processRecording...");
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      setTimeout(processRecording, 50);
    };

    const onError = (event) => {
      console.error("FINALIZE ERROR - MediaRecorder error:", event.error);
      setPipelineStage(`ERROR: MediaRecorder - ${event.error?.message || "unknown"}`);
      setAutoStopDiagnostic(`FINALIZE: MediaRecorder error: ${event.error?.message || "unknown"}`);
      settleError(event.error || new Error("MediaRecorder error"));
    };

    recorder.addEventListener("stop", onStop, { once: true });
    recorder.addEventListener("error", onError, { once: true });

    timeoutId = setTimeout(() => {
      setPipelineStage("FALLBACK TIMER FIRED");
      console.warn("FINALIZE TIMEOUT - stop event did not fire in time");
      setAutoStopDiagnostic("FINALIZE: fallback timer fired (8s), calling processRecording...");
      timeoutId = null;
      if (!processingStarted)
        processRecording();
    }, 8000);

    try {
      if (typeof recorder.requestData === "function" && recorder.state === "recording") {
        setPipelineStage("REQUEST DATA CALLED");
        console.log("FINALIZE 1a - CALLING requestData()");
        setAutoStopDiagnostic("FINALIZE: calling requestData...");
        recorder.requestData();
      }
    } catch (e) {
      console.warn("requestData() failed (non-fatal):", e);
    }

    setPipelineStage("RECORDER STOP CALLED");
    console.log("FINALIZE 1b - CALLING RECORDER.STOP()");
    setAutoStopDiagnostic("FINALIZE: calling recorder.stop(), state=" + recorder.state);
    if (recorder.state === "recording" || recorder.state === "paused") {
      recorder.stop();
    } else {
      console.warn("FINALIZE 1c - recorder already inactive, finalizing from existing chunks");
      setAutoStopDiagnostic("FINALIZE: recorder already inactive, using fallback");
      recorder.removeEventListener("stop", onStop);
      recorder.removeEventListener("error", onError);
      setTimeout(processRecording, 0);
    }
    console.log("FINALIZE 1d - RECORDER.STATE AFTER STOP:", recorder.state);
  });
}

function stopCameraStream() {
  if (state.camera.videoStream)
    state.camera.videoStream.getTracks().forEach((track) => track.stop());
  state.camera.videoStream = null;
  if (el.cameraPreviewVideo) {
    el.cameraPreviewVideo.srcObject = null;
    el.cameraPreviewVideo.hidden = true;
  }
  setCameraStatus("Camera: Ready");
  // Update startup overlay and record button based on session + camera state
  updateCameraStartupOverlay();
  updateRecordButtonState();
}

function stopAudioStream() {
  if (state.camera.audioStream)
    state.camera.audioStream.getTracks().forEach((track) => track.stop());
  state.camera.audioStream = null;
  stopAudioMeter();
  setAudioStatus("MIC: OFF");
}

function updateCameraControls() {
  updateRecordButtonState();
}

function canStartRecording() {
  return hasActiveSession() && Boolean(state.camera.videoStream) && state.camera.recorder?.state !== "recording" && !state.camera.finalizing;
}

function updateRecordButtonState() {
  if (!el.recordCameraBtn) return;
  const recording = state.camera.recorder?.state === "recording";
  const finalizing = state.camera.finalizing;
  // Disable duration selector during recording and finalization
  if (el.recordingDurationSelect) {
    el.recordingDurationSelect.disabled = recording || finalizing;
  }
  if (finalizing) {
    el.recordCameraBtn.textContent = "Finalizing...";
    el.recordCameraBtn.disabled = true;
  } else if (recording) {
    el.recordCameraBtn.textContent = "Stop Recording";
    el.recordCameraBtn.disabled = false;
  } else {
    // Clear countdown styling when not recording
    if (el.cameraRecordTimer) {
      el.cameraRecordTimer.classList.remove("countdown-warning", "countdown-critical");
    }
    if (canStartRecording()) {
      el.recordCameraBtn.textContent = "Record";
      el.recordCameraBtn.disabled = false;
    } else {
      el.recordCameraBtn.textContent = "Record";
      el.recordCameraBtn.disabled = true;
    }
  }
}

function updateCameraRecordTimer(forcedSeconds) {
  const elapsed = Number.isFinite(forcedSeconds) ? forcedSeconds : Math.floor((Date.now() - state.camera.recordingStartedAt) / 1000);
  if (el.cameraRecordTimer) {
    el.cameraRecordTimer.textContent = `${String(Math.floor(elapsed / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;

    // Red countdown styling in final 10 seconds
    const remaining = Math.max(0, Math.floor(state.camera.activeRecordDurationMs / 1000) - elapsed);
    el.cameraRecordTimer.classList.remove("countdown-warning", "countdown-critical");
    if (remaining <= 5 && remaining > 0 && state.camera.recorder?.state === "recording" && !state.camera.autoStopTriggered) {
      el.cameraRecordTimer.classList.add("countdown-critical");
    } else if (remaining <= 10 && remaining > 0 && state.camera.recorder?.state === "recording" && !state.camera.autoStopTriggered) {
      el.cameraRecordTimer.classList.add("countdown-warning");
    }
  }

  // Large countdown overlay
  if (el.countdownOverlay && el.countdownNumber) {
    const remaining = Math.max(0, Math.floor(state.camera.activeRecordDurationMs / 1000) - elapsed);
    const isRecording = state.camera.recorder?.state === "recording";
    const isStopping = state.camera.autoStopTriggered || state.camera.finalizing;

    if (isStopping) {
      // Hide countdown; processing overlay is now authoritative
      el.countdownOverlay.hidden = true;
      el.countdownOverlay.classList.remove("critical");
    } else if (isRecording && remaining > 0 && remaining <= 10) {
      el.countdownOverlay.hidden = false;
      el.countdownNumber.textContent = String(remaining);
      const label = el.countdownOverlay.querySelector(".countdown-label");
      if (label) label.textContent = "SECONDS LEFT";
      if (remaining <= 5) {
        el.countdownOverlay.classList.add("critical");
      } else {
        el.countdownOverlay.classList.remove("critical");
      }
    } else {
      el.countdownOverlay.hidden = true;
      el.countdownOverlay.classList.remove("critical");
    }
  }
}

function bestCameraRecordingMimeType() {
  const candidates = [
    { mime: "video/webm;codecs=vp8,opus", label: "VP8 WebM" },
    { mime: "video/webm;codecs=vp9,opus", label: "VP9 WebM" },
    { mime: "video/webm", label: "WebM (browser default)" },
    { mime: 'video/mp4;codecs="avc1.42E01E,mp4a.40.2"', label: "H.264 MP4" },
    { mime: "video/mp4;codecs=h264,aac", label: "H.264 MP4 (alt)" },
    { mime: "video/mp4", label: "MP4 (browser default)" },
  ];
  for (const c of candidates) {
    const supported = MediaRecorder.isTypeSupported(c.mime);
    console.log(`MIME CHECK: ${c.mime} => ${supported}`);
    if (supported) return c.mime;
  }
  return "";
}

function setCameraStatus(message) {
  if (el.cameraStatus)
    el.cameraStatus.textContent = message;
}

function setAudioStatus(message) {
  if (el.audioStatus)
    el.audioStatus.textContent = message;
}

function setAutoStopDiagnostic(message) {
  if (el.autoStopDiagnostic)
    el.autoStopDiagnostic.textContent = message;
}

function clearAutoStopDiagnostic() {
  if (el.autoStopDiagnostic)
    el.autoStopDiagnostic.textContent = "";
}

// Recording Process Overlay API
// stage: user-facing stage name (e.g., "FINALIZING VIDEO")
// detail: optional text (e.g., "Batch 4 of 24")
// progress: null for indeterminate, 0-100 for determinate
// info: optional small detail text (e.g., "Frames processed: 287")
function setRecordingProcessStage(stage, detail, progress, info) {
  if (el.recordingProcessOverlay) {
    el.recordingProcessOverlay.hidden = false;
    el.recordingProcessOverlay.className = "recording-process-overlay";
  }
  if (el.recordingProcessStage) el.recordingProcessStage.textContent = stage;
  if (el.recordingProcessDetail) el.recordingProcessDetail.textContent = detail || "";
  if (el.recordingProcessInfo) el.recordingProcessInfo.textContent = info || "";
  if (el.recordingProcessBar) {
    if (progress === null || progress === undefined) {
      el.recordingProcessBar.className = "recording-process-bar indeterminate";
      el.recordingProcessBar.style.width = "";
    } else {
      el.recordingProcessBar.className = "recording-process-bar";
      el.recordingProcessBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }
  }
}

function setRecordingProcessComplete(detail) {
  if (el.recordingProcessOverlay) {
    el.recordingProcessOverlay.className = "recording-process-overlay process-complete";
  }
  if (el.recordingProcessStage) el.recordingProcessStage.textContent = "COMPLETE";
  if (el.recordingProcessDetail) el.recordingProcessDetail.textContent = detail || "";
  if (el.recordingProcessBar) {
    el.recordingProcessBar.className = "recording-process-bar";
    el.recordingProcessBar.style.width = "100%";
  }
  // Auto-dismiss after a short delay
  setTimeout(hideRecordingProcessOverlay, 1500);
}

function setRecordingProcessError(stage, reason) {
  if (el.recordingProcessOverlay) {
    el.recordingProcessOverlay.className = "recording-process-overlay process-failed";
  }
  if (el.recordingProcessStage) el.recordingProcessStage.textContent = "PROCESSING FAILED";
  if (el.recordingProcessDetail) el.recordingProcessDetail.textContent = stage ? `Stage: ${stage}` : "";
  if (el.recordingProcessInfo) el.recordingProcessInfo.textContent = reason ? `Reason: ${reason}` : "";
  if (el.recordingProcessBar) {
    el.recordingProcessBar.className = "recording-process-bar";
    el.recordingProcessBar.style.width = "0%";
  }
}

function hideRecordingProcessOverlay() {
  if (el.recordingProcessOverlay) el.recordingProcessOverlay.hidden = true;
  if (el.recordingProcessStage) el.recordingProcessStage.textContent = "";
  if (el.recordingProcessDetail) el.recordingProcessDetail.textContent = "";
  if (el.recordingProcessInfo) el.recordingProcessInfo.textContent = "";
  if (el.recordingProcessBar) {
    el.recordingProcessBar.className = "recording-process-bar";
    el.recordingProcessBar.style.width = "0%";
  }
}

function activeAudioStatusText(prefix = "MIC: ARMED") {
  const sampleRate = Number(el.audioSampleRateSelect?.value || 48000);
  const channels = Number(el.audioChannelSelect?.value || 1) > 1 ? "Stereo" : "Mono";
  const deviceName = el.audioDeviceSelect?.selectedOptions?.[0]?.textContent || "Selected Mic";
  return `${prefix} - ${deviceName} ${sampleRate} Hz ${channels}`;
}

function setupAudioMeter() {
  stopAudioMeter({ keepStream: true });
  if (!state.camera.audioStream)
    return;

  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor)
    return;

  const context = new AudioContextCtor();
  const source = context.createMediaStreamSource(state.camera.audioStream);
  const analyser = context.createAnalyser();
  analyser.fftSize = 1024;
  source.connect(analyser);

  state.camera.audioContext = context;
  state.camera.audioAnalyser = analyser;
  state.camera.audioMeterData = new Float32Array(analyser.fftSize);
  state.camera.audioMeterTimer = window.setInterval(updateAudioMeter, 125);
  updateAudioMeter();
}

function updateAudioMeter() {
  const analyser = state.camera.audioAnalyser;
  const data = state.camera.audioMeterData;
  if (!analyser || !data)
    return;

  analyser.getFloatTimeDomainData(data);
  let sum = 0;
  let peak = 0;
  for (const sample of data) {
    sum += sample * sample;
    peak = Math.max(peak, Math.abs(sample));
  }

  const rms = Math.sqrt(sum / data.length);
  if (el.audioRmsStatus)
    el.audioRmsStatus.textContent = `RMS: ${rms.toFixed(3)}`;
  if (el.audioPeakStatus)
    el.audioPeakStatus.textContent = `Peak: ${peak.toFixed(3)}`;
}

function stopAudioMeter() {
  if (state.camera.audioMeterTimer)
    window.clearInterval(state.camera.audioMeterTimer);
  state.camera.audioMeterTimer = null;
  state.camera.audioAnalyser = null;
  state.camera.audioMeterData = null;
  if (state.camera.audioContext)
    state.camera.audioContext.close().catch(() => {});
  state.camera.audioContext = null;
  if (el.audioRmsStatus)
    el.audioRmsStatus.textContent = "RMS: 0.00";
  if (el.audioPeakStatus)
    el.audioPeakStatus.textContent = "Peak: 0.00";
}

function friendlyMediaError(error) {
  if (error?.name === "NotAllowedError")
    return "permission denied (check browser site settings AND macOS System Settings > Privacy & Security > Camera)";
  if (error?.name === "NotFoundError")
    return "no camera/mic found (check macOS Privacy & Security permissions)";
  if (error?.name === "NotReadableError")
    return "device in use by another app or hardware error";
  if (error?.name === "OverconstrainedError")
    return `format not supported (${error.constraint || "unknown constraint"})`;
  if (error?.name === "AbortError")
    return "camera access aborted";
  if (error?.name === "SecurityError")
    return "security error (HTTPS or localhost required)";
  if (error?.name === "TypeError")
    return "invalid constraints";
  return error?.message || "unknown media error";
}

async function autoStartCamera() {
  if (!hasActiveSession()) return;
  if (!navigator.mediaDevices?.getUserMedia) {
    setCameraStatus("Camera: browser does not support media capture.");
    return;
  }

  try {
    // Step 1: Enumerate devices first (before permission) to populate dropdown
    let devices = [];
    try {
      devices = await navigator.mediaDevices.enumerateDevices();
    } catch {}
    const videoInputs = devices.filter(d => d.kind === "videoinput");
    const audioInputs = devices.filter(d => d.kind === "audioinput");
    populateDeviceSelect(el.cameraDeviceSelect, videoInputs, "camera");
    populateDeviceSelect(el.audioDeviceSelect, audioInputs, "microphone");

    // Step 2: Request permission with selected device
    const constraints = {
      video: buildCameraConstraints(),
      audio: buildAudioConstraints(),
    };

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (primaryError) {
      const isDeviceBusy = primaryError?.name === "NotReadableError" || primaryError?.name === "AbortError";
      const isOverconstrained = primaryError?.name === "OverconstrainedError";

      if (isDeviceBusy) {
        // Device busy: stop old tracks, wait, retry once
        console.warn("Camera device busy, stopping old tracks and retrying...");
        stopCameraStream();
        await new Promise(r => setTimeout(r, 300));
        try {
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch (retryErr) {
          // Retry also failed, try with minimal constraints
          const devId = selectedDeviceId(el.cameraDeviceSelect);
          const minimal = devId
            ? { video: { deviceId: { exact: devId } }, audio: buildAudioConstraints() }
            : { video: true, audio: buildAudioConstraints() };
          stream = await navigator.mediaDevices.getUserMedia(minimal);
        }
      } else if (isOverconstrained) {
        // Format not available: retry with just deviceId
        const devId = selectedDeviceId(el.cameraDeviceSelect);
        const fallback = devId
          ? { video: { deviceId: { exact: devId } }, audio: buildAudioConstraints() }
          : { video: true, audio: buildAudioConstraints() };
        setCameraStatus("Camera: selected format unavailable, trying device default...");
        stream = await navigator.mediaDevices.getUserMedia(fallback);
      } else {
        throw primaryError;
      }
    }

    // Step 3: Attach stream and re-enumerate to get labels
    attachConnectedStream(stream);
    state.camera.permissionProbeDone = true;
    state.camera.lastError = null;

    // Show actual resolution/FPS from connected stream
    const videoTrack = stream.getVideoTracks()[0];
    if (videoTrack) {
      const settings = videoTrack.getSettings();
      const w = settings.width || 0;
      const h = settings.height || 0;
      const fps = settings.frameRate ? Math.round(settings.frameRate) : 0;
      const deviceLabel = videoTrack.label || "Camera";
      setCameraStatus(`${deviceLabel} connected - ${w}x${h} @ ${fps} FPS`);
    }

    // Re-enumerate after permission to get device labels
    try {
      const devicesAfter = await navigator.mediaDevices.enumerateDevices();
      const videoAfter = devicesAfter.filter(d => d.kind === "videoinput");
      const audioAfter = devicesAfter.filter(d => d.kind === "audioinput");
      populateDeviceSelect(el.cameraDeviceSelect, videoAfter, "camera");
      populateDeviceSelect(el.audioDeviceSelect, audioAfter, "microphone");
      updateDeviceDiagnostics(videoAfter, audioAfter);
    } catch {}

    updateCameraCaptureMetadata();
    await updateSettingsDiagnostics();
  } catch (error) {
    state.camera.lastError = `${error.name}: ${error.message}`;
    const devId = selectedDeviceId(el.cameraDeviceSelect);
    const deviceName = devId ? (el.cameraDeviceSelect?.selectedOptions?.[0]?.textContent || "External camera") : "Camera";
    setCameraStatus(`${deviceName} unavailable: ${friendlyMediaError(error)}`);

    // Still try to enumerate devices so user can see what's available
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter(d => d.kind === "videoinput");
      const audioInputs = devices.filter(d => d.kind === "audioinput");
      populateDeviceSelect(el.cameraDeviceSelect, videoInputs, "camera");
      populateDeviceSelect(el.audioDeviceSelect, audioInputs, "microphone");
      updateDeviceDiagnostics(videoInputs, audioInputs);
    } catch {}
    await updateSettingsDiagnostics();
  }
}

async function retryCamera() {
  console.log("CAMERA RETRY - manual retry triggered");
  stopCameraStream();
  stopAudioStream();
  await autoStartCamera();
}

function onCameraFormatChange() {
  if (state.camera.recorder?.state === "recording" || state.camera.finalizing)
    return;
  if (state.camera.videoStream) {
    stopCameraStream();
    stopAudioStream();
    autoStartCamera();
  }
}

function onCameraDeviceChange() {
  if (state.camera.recorder?.state === "recording" || state.camera.finalizing)
    return;
  if (state.camera.videoStream) {
    stopCameraStream();
    stopAudioStream();
    autoStartCamera();
  }
}

function updateCameraCaptureMetadata() {
  if (!state.camera.videoStream)
    return;
  const videoTrack = state.camera.videoStream.getVideoTracks()[0];
  if (!videoTrack)
    return;
  const settings = videoTrack.getSettings();
  state.camera.captureWidth = settings.width || 0;
  state.camera.captureHeight = settings.height || 0;
  state.camera.captureFps = settings.frameRate || 0;

  // Update camera viewport aspect ratio
  if (el.cameraViewport && settings.width && settings.height) {
    el.cameraViewport.style.aspectRatio = `${settings.width} / ${settings.height}`;
  }
}

async function updateSettingsDiagnostics() {
  if (!el.settingsCameraPerm)
    return;

  // Secure context
  if (el.settingsSecureContext) {
    el.settingsSecureContext.textContent = window.isSecureContext ? "Yes" : "No";
  }

  // Camera API
  if (el.settingsCameraApi) {
    const hasGUM = !!(navigator.mediaDevices?.getUserMedia);
    const hasEnum = !!(navigator.mediaDevices?.enumerateDevices);
    el.settingsCameraApi.textContent = hasGUM && hasEnum ? "getUserMedia + enumerateDevices" : hasGUM ? "getUserMedia only" : "Not available";
  }

  let cameraPerm = "Unavailable";
  let micPerm = "Unavailable";
  try {
    if (navigator.permissions?.query) {
      const cam = await navigator.permissions.query({ name: "camera" });
      cameraPerm = cam.state.charAt(0).toUpperCase() + cam.state.slice(1);
      cam.onchange = () => {
        if (el.settingsCameraPerm)
          el.settingsCameraPerm.textContent = cam.state.charAt(0).toUpperCase() + cam.state.slice(1);
      };
      const mic = await navigator.permissions.query({ name: "microphone" });
      micPerm = mic.state.charAt(0).toUpperCase() + mic.state.slice(1);
      mic.onchange = () => {
        if (el.settingsMicPerm)
          el.settingsMicPerm.textContent = mic.state.charAt(0).toUpperCase() + mic.state.slice(1);
      };
    }
  } catch {}

  el.settingsCameraPerm.textContent = cameraPerm;
  el.settingsMicPerm.textContent = micPerm;

  let cameras = 0;
  let mics = 0;
  let selectedCameraName = "None";
  let selectedMicName = "None";
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = devices.filter((d) => d.kind === "videoinput");
    const audioInputs = devices.filter((d) => d.kind === "audioinput");
    cameras = videoInputs.length;
    mics = audioInputs.length;
    const selCamId = el.cameraDeviceSelect?.value;
    const selMicId = el.audioDeviceSelect?.value;
    const camDevice = videoInputs.find((d) => d.deviceId === selCamId);
    const micDevice = audioInputs.find((d) => d.deviceId === selMicId);
    selectedCameraName = camDevice?.label || (selCamId ? "Selected camera" : "System Default");
    selectedMicName = micDevice?.label || (selMicId ? "Selected mic" : "System Default");
  } catch {}

  el.settingsCameraCount.textContent = String(cameras);
  el.settingsMicCount.textContent = String(mics);
  el.settingsSelectedCamera.textContent = selectedCameraName;
  el.settingsSelectedMic.textContent = selectedMicName;

  if (state.camera.captureWidth && state.camera.captureHeight) {
    el.settingsCurrentRes.textContent = `${state.camera.captureWidth} x ${state.camera.captureHeight}`;
  } else {
    el.settingsCurrentRes.textContent = "-";
  }
  el.settingsCurrentFps.textContent = state.camera.captureFps
    ? `${Math.round(state.camera.captureFps)} FPS`
    : "-";

  // Last error
  if (el.settingsLastError) {
    el.settingsLastError.textContent = state.camera.lastError || "None";
  }

  // Recording format diagnostics
  if (el.settingsRecordingMime) {
    el.settingsRecordingMime.textContent = lastRecordingMime || "-";
  }
  if (el.settingsRecordingContainer) {
    const mime = lastRecordingMime || "";
    el.settingsRecordingContainer.textContent = mime.includes("mp4") ? "MP4" : mime.includes("webm") ? "WebM" : mime ? mime.split(";")[0] : "-";
  }
  if (el.settingsLastFfmpegError) {
    el.settingsLastFfmpegError.textContent = lastFfmpegError || "None";
  }
  if (el.settingsLastFfmpegExitCode) {
    el.settingsLastFfmpegExitCode.textContent = lastFfmpegExitCode != null ? String(lastFfmpegExitCode) : "-";
  }
  if (el.settingsDetectedCodec) {
    el.settingsDetectedCodec.textContent = lastDetectedCodec || "-";
  }

  // Storage estimate
  try {
    if (navigator.storage?.estimate) {
      const estimate = await navigator.storage.estimate();
      const usageMB = ((estimate.usage || 0) / (1024 * 1024)).toFixed(1);
      const quotaMB = ((estimate.quota || 0) / (1024 * 1024)).toFixed(0);
      if (el.settingsStorageInfo) {
        el.settingsStorageInfo.textContent = `${usageMB} MB used of ${quotaMB} MB`;
      }
    }
  } catch {}
}

function timestampName() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/T/, "_").replace(/\..+$/, "");
}

async function readJson(entryByRelative, relativePath, fallback) {
  const entry = entryByRelative.get(relativePath);
  if (!entry) {
    if (arguments.length >= 3)
      return fallback;
    throw new Error(`Missing ${relativePath}`);
  }
  return JSON.parse(await entry.text());
}

function findCapsuleVideoEntry(entryByRelative) {
  // Priority: browser-compatible MP4/WebM first, then MKV as last resort
  const candidates = [
    { pattern: /^Video\/Remux\/.*\.mp4$/i, mime: "video/mp4" },
    { pattern: /^Video\/Imported\/.*\.mp4$/i, mime: "video/mp4" },
    { pattern: /^Video\/Master\/.*\.mp4$/i, mime: "video/mp4" },
    { pattern: /^Video\/Remux\/.*\.webm$/i, mime: "video/webm" },
    { pattern: /^Video\/Imported\/.*\.webm$/i, mime: "video/webm" },
    { pattern: /^Video\/Remux\/.*\.mkv$/i, mime: "video/x-matroska" },
    { pattern: /^Video\/Master\/.*\.mkv$/i, mime: "video/x-matroska" },
    { pattern: /^Video\/Imported\/.*\.mkv$/i, mime: "video/x-matroska" },
  ];
  for (const cand of candidates) {
    for (const [relativePath, entry] of entryByRelative) {
      if (cand.pattern.test(relativePath) && !entry.directory) {
        return { path: relativePath, entry, name: basename(relativePath), mime: cand.mime };
      }
    }
  }
  return null;
}

async function buildFramesFromSessionZip(entryByRelative, framesJson, sessionJson) {
  const frames = [];
  const recordingSizes = new Map((sessionJson.recordings || []).map((recording) => [
    recording.recordingId,
    {
      width: Number(recording.width) || 0,
      height: Number(recording.height) || 0,
    },
  ]));

  if (framesJson?.recordings?.length) {
    for (const recording of framesJson.recordings) {
      const size = recordingSizes.get(recording.recordingId) || recordingSizes.get(recording.sourceVideo) || {};
      for (const frameInfo of recording.frames || []) {
        const relativePath = normalizePath(frameInfo.relativePath || "");
        const entry = entryByRelative.get(relativePath);
        if (!entry || !isImagePath(relativePath))
          continue;
        const blob = await entry.blob(mimeForPath(relativePath));
        const url = URL.createObjectURL(blob);
        frames.push({
          id: crypto.randomUUID(),
          name: frameInfo.filename || basename(relativePath),
          type: mimeForPath(relativePath),
          url,
          width: size.width || 0,
          height: size.height || 0,
          checked: false,
          junk: false,
          savedEvidence: false,
          edit: defaultEdit(),
          _blob: blob,
          native: {
            relativePath,
            frameNumber: frameInfo.frameNumber,
            frameIndex: frameInfo.frameIndex,
            timecode: frameInfo.timecode,
            timestampSeconds: frameInfo.timestampSeconds,
            recordingId: recording.recordingId,
          },
        });
      }
    }
  }

  if (frames.length > 0)
    return hydrateMissingFrameSizes(frames);

  const imageEntries = [...entryByRelative.entries()]
    .filter(([relativePath]) => /^Images\/(JPEG|PNG)\//i.test(relativePath) && isImagePath(relativePath))
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }));

  for (const [relativePath, entry] of imageEntries) {
    const blob = await entry.blob(mimeForPath(relativePath));
    const url = URL.createObjectURL(blob);
    frames.push({
      id: crypto.randomUUID(),
      name: basename(relativePath),
      type: mimeForPath(relativePath),
      url,
      width: 0,
      height: 0,
      checked: false,
      junk: false,
      savedEvidence: false,
      edit: defaultEdit(),
      _blob: blob,
      native: { relativePath },
    });
  }

  return hydrateMissingFrameSizes(frames);
}

async function hydrateMissingFrameSizes(frames) {
  for (const frame of frames) {
    if (!frame.width || !frame.height) {
      const image = await loadImage(frame.url);
      frame.width = image.naturalWidth;
      frame.height = image.naturalHeight;
    }
  }
  return frames;
}

async function buildEvidenceFromSessionZip(entryByRelative, evidenceJson) {
  const candidates = [];
  for (const candidate of evidenceJson?.candidates || []) {
    const relativePath = normalizePath(candidate.candidateImage || "");
    const entry = entryByRelative.get(relativePath);
    if (!entry)
      continue;
    const blob = await entry.blob(mimeForPath(relativePath));
    const imageUrl = URL.createObjectURL(blob);

    // Convert blob to dataUrl for IndexedDB persistence (blob URLs become stale after refresh)
    let dataUrl = "";
    try {
      const image = await loadImage(imageUrl);
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth || 1280;
      canvas.height = image.naturalHeight || 720;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      dataUrl = canvas.toDataURL("image/png");
    } catch (decodeErr) {
      console.warn(`CAPSULE RESTORE - Failed to decode evidence image as dataUrl:`, decodeErr);
    }

    candidates.push({
      id: candidate.candidateId || crypto.randomUUID(),
      frameId: null,
      frameName: basename(candidate.sourceImage || relativePath),
      frameNumber: candidate.frameNumber,
      sourceWidth: candidate.sourceWidth || 0,
      sourceHeight: candidate.sourceHeight || 0,
      effect: candidate.effect || "normal",
      zoom: candidate.zoom || 1,
      panX: candidate.panX || 0,
      panY: candidate.panY || 0,
      edited: candidate.sourceType === "edited",
      dataUrl,
      imageUrl,
      native: candidate,
      createdAt: candidate.createdAt || new Date().toISOString(),
    });
  }
  return candidates;
}

function markEvidenceFrames(evidenceJson) {
  for (const candidate of evidenceJson?.candidates || []) {
    const sourceImage = normalizePath(candidate.sourceImage || "");
    const frame = state.frames.find((item) =>
      (sourceImage && item.native?.relativePath === sourceImage) ||
      (candidate.frameNumber && item.native?.frameNumber === candidate.frameNumber) ||
      (candidate.frameId && item.id === candidate.frameId)
    );
    if (!frame)
      continue;
    frame.checked = true;
    frame.savedEvidence = true;
    const evidence = state.evidence.find((item) => item.native?.candidateId === candidate.candidateId);
    if (evidence)
      evidence.frameId = frame.id;
  }
}

function revokeFrameUrls() {
  state.frames.forEach((frame) => {
    if (frame.url?.startsWith("blob:"))
      URL.revokeObjectURL(frame.url);
  });
  state.evidence.forEach((item) => {
    if (item.imageUrl?.startsWith("blob:"))
      URL.revokeObjectURL(item.imageUrl);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function ensurePresetLut(preset) {
  if (!preset?.lut)
    return null;

  const key = preset.lut;
  const cached = lutCache.get(key);
  if (cached?.status === "ready")
    return cached.value;
  if (cached?.status === "loading")
    return cached.promise;
  if (cached?.status === "failed")
    return null;

  const promise = fetch(`./assets/${key}`)
    .then((response) => {
      if (!response.ok)
        throw new Error(`Could not load LUT: ${key}`);
      return response.text();
    })
    .then(parseCubeLut)
    .then((lut) => {
      lutCache.set(key, { status: "ready", value: lut });
      return lut;
    })
    .catch((error) => {
      console.warn(error);
      lutCache.set(key, { status: "failed", value: null });
      return null;
    });

  lutCache.set(key, { status: "loading", promise });
  return promise;
}

function parseCubeLut(text) {
  let size = 0;
  const rgb = [];
  text.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line || line.startsWith("#"))
      return;

    const parts = line.split(/\s+/);
    const key = parts[0].toUpperCase();
    if (key === "TITLE" || key === "DOMAIN_MIN" || key === "DOMAIN_MAX")
      return;
    if (key === "LUT_3D_SIZE") {
      size = Number(parts[1] || 0);
      return;
    }

    if (parts.length >= 3) {
      const values = parts.slice(0, 3).map(Number);
      if (values.every(Number.isFinite))
        rgb.push(...values.map(clamp01));
    }
  });

  const expected = size * size * size * 3;
  if (size < 2 || rgb.length < expected)
    throw new Error("Invalid or incomplete .cube LUT.");

  return { size, rgb: rgb.slice(0, expected) };
}

function getCachedLut(key) {
  const cached = lutCache.get(key);
  return cached?.status === "ready" ? cached.value : null;
}

function sampleCubeLut(lut, r, g, b) {
  const maxIndex = lut.size - 1;
  const pr = clamp01(r) * maxIndex;
  const pg = clamp01(g) * maxIndex;
  const pb = clamp01(b) * maxIndex;
  const r0 = Math.floor(pr);
  const g0 = Math.floor(pg);
  const b0 = Math.floor(pb);
  const r1 = Math.min(maxIndex, r0 + 1);
  const g1 = Math.min(maxIndex, g0 + 1);
  const b1 = Math.min(maxIndex, b0 + 1);
  const fr = pr - r0;
  const fg = pg - g0;
  const fb = pb - b0;

  const c000 = cubeLutValue(lut, r0, g0, b0);
  const c100 = cubeLutValue(lut, r1, g0, b0);
  const c010 = cubeLutValue(lut, r0, g1, b0);
  const c110 = cubeLutValue(lut, r1, g1, b0);
  const c001 = cubeLutValue(lut, r0, g0, b1);
  const c101 = cubeLutValue(lut, r1, g0, b1);
  const c011 = cubeLutValue(lut, r0, g1, b1);
  const c111 = cubeLutValue(lut, r1, g1, b1);

  return [0, 1, 2].map((channel) => {
    const c00 = mix(c000[channel], c100[channel], fr);
    const c10 = mix(c010[channel], c110[channel], fr);
    const c01 = mix(c001[channel], c101[channel], fr);
    const c11 = mix(c011[channel], c111[channel], fr);
    const c0 = mix(c00, c10, fg);
    const c1 = mix(c01, c11, fg);
    return mix(c0, c1, fb);
  });
}

function cubeLutValue(lut, r, g, b) {
  const index = ((b * lut.size + g) * lut.size + r) * 3;
  return [
    lut.rgb[index],
    lut.rgb[index + 1],
    lut.rgb[index + 2],
  ];
}

async function readZipEntries(buffer) {
  const view = new DataView(buffer);
  const eocdOffset = findEndOfCentralDirectory(view);
  if (eocdOffset < 0)
    throw new Error("Could not find the ZIP central directory.");

  const entryCount = view.getUint16(eocdOffset + 10, true);
  const centralDirectoryOffset = view.getUint32(eocdOffset + 16, true);
  const entries = [];
  let offset = centralDirectoryOffset;

  for (let i = 0; i < entryCount; i += 1) {
    if (view.getUint32(offset, true) !== 0x02014b50)
      throw new Error("Invalid ZIP central directory entry.");

    const method = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const uncompressedSize = view.getUint32(offset + 24, true);
    const nameLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const localHeaderOffset = view.getUint32(offset + 42, true);
    const name = textDecoder.decode(new Uint8Array(buffer, offset + 46, nameLength));

    entries.push(makeZipEntry(buffer, view, name, method, compressedSize, uncompressedSize, localHeaderOffset));
    offset += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

function findEndOfCentralDirectory(view) {
  const minOffset = Math.max(0, view.byteLength - 22 - 0xffff);
  for (let offset = view.byteLength - 22; offset >= minOffset; offset -= 1) {
    if (view.getUint32(offset, true) === 0x06054b50)
      return offset;
  }
  return -1;
}

function makeZipEntry(buffer, view, name, method, compressedSize, uncompressedSize, localHeaderOffset) {
  return {
    name,
    method,
    compressedSize,
    uncompressedSize,
    directory: name.endsWith("/"),
    async arrayBuffer() {
      if (view.getUint32(localHeaderOffset, true) !== 0x04034b50)
        throw new Error(`Invalid local ZIP header for ${name}.`);

      const nameLength = view.getUint16(localHeaderOffset + 26, true);
      const extraLength = view.getUint16(localHeaderOffset + 28, true);
      const dataOffset = localHeaderOffset + 30 + nameLength + extraLength;
      const compressed = buffer.slice(dataOffset, dataOffset + compressedSize);

      if (method === 0)
        return compressed;
      if (method === 8)
        return inflateRaw(compressed);

      throw new Error(`Unsupported ZIP compression method ${method} for ${name}.`);
    },
    async blob(type = "application/octet-stream") {
      return new Blob([await this.arrayBuffer()], { type });
    },
    async text() {
      return textDecoder.decode(await this.arrayBuffer());
    },
  };
}

async function inflateRaw(buffer) {
  if (typeof DecompressionStream !== "function")
    throw new Error("This browser cannot decompress zipped sessions yet. Use Chrome, Edge, or another browser with DecompressionStream support.");

  const stream = new Blob([buffer]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Response(stream).arrayBuffer();
}

function normalizePath(path) {
  return String(path || "").replace(/\\/g, "/").replace(/^\/+/, "");
}

function stripRoot(path, root) {
  return root && path.startsWith(root) ? path.slice(root.length) : path;
}

function basename(path) {
  return normalizePath(path).split("/").filter(Boolean).pop() || "frame";
}

function isImagePath(path) {
  return /\.(jpe?g|png)$/i.test(path);
}

function mimeForPath(path) {
  return /\.png$/i.test(path) ? "image/png" : "image/jpeg";
}

function setEmptyState() {
  el.emptyState.hidden = false;
}

function setOperationStatus(message) {
  setFfmpegStatus(message);
}

function clearOperationStatus() {
  setFfmpegStatus("FFmpeg: Ready to load when needed.");
}

function setRestoreStage(stage) {
  console.log(`RESTORE PROBE: ${stage}`);
  if (el.sessionRestoreProbe)
    el.sessionRestoreProbe.textContent = `Session Restore: ${stage}`;
}

function defaultEdit() {
  return {
    effect: "general-normal",
    viewMode: 0,
    zoom: 1,
    panX: 0,
    panY: 0,
  };
}

async function estimateStorage() {
  try {
    if (navigator.storage?.estimate) {
      const estimate = await navigator.storage.estimate();
      const usageMB = (estimate.usage || 0) / (1024 * 1024);
      const quotaMB = (estimate.quota || 0) / (1024 * 1024);
      console.log(`Storage: ${usageMB.toFixed(1)} MB used of ${quotaMB.toFixed(0)} MB quota`);
    }
  } catch {}
  try {
    if (navigator.storage?.persist) {
      const persisted = await navigator.storage.persist();
      console.log('Persistent storage:', persisted ? 'granted' : 'denied');
    }
  } catch {}
}

function buildEffects() {
  buildEffectGroupButtons();
  el.effectGrid.innerHTML = "";
  const visibleEffects = state.activeEffectGroup
    ? effects.filter((effect) => effect.group === state.activeEffectGroup)
    : effects;

  let currentHeading = "";
  visibleEffects.forEach((effect) => {
    if (!state.activeEffectGroup && effect.group !== currentHeading) {
      currentHeading = effect.group;
      const heading = document.createElement("div");
      heading.className = "effect-group-heading";
      heading.textContent = currentHeading;
      el.effectGrid.appendChild(heading);
    }

    const button = document.createElement("button");
    button.className = "effect-card";
    button.dataset.effect = effect.id;
    button.title = `${effect.group}: ${effect.description}`;
    button.innerHTML = `<canvas class="effect-preview" width="160" height="90" data-preview-effect="${effect.id}"></canvas><span>${effect.label}</span>`;
    button.addEventListener("click", () => {
      state.currentEffect = effect.id;
      const frame = getCurrentFrame();
      if (frame) {
        frame.edit.effect = effect.id;
      }
      ensurePresetLut(effect).then(() => {
        render();
        renderEffectPreviews();
      }).catch(console.error);
      updateUI();
      render();
    });
    el.effectGrid.appendChild(button);
  });
  renderEffectPreviews();
}

function buildEffectGroupButtons() {
  if (!el.effectGroupFilters)
    return;

  el.effectGroupFilters.innerHTML = "";
  effectGroups.forEach((group) => {
    const button = document.createElement("button");
    button.className = "effect-filter-button";
    button.classList.toggle("active", state.activeEffectGroup === group.id);
    button.dataset.group = group.id;
    button.textContent = group.label;
    button.title = group.name;
    button.addEventListener("click", () => {
      state.activeEffectGroup = group.id;
      buildEffects();
      updateEffectSelection();
    });
    el.effectGroupFilters.appendChild(button);
  });
}

async function renderEffectPreviews() {
  const canvases = [...document.querySelectorAll("canvas[data-preview-effect]")];
  if (canvases.length === 0)
    return;

  const revision = ++effectPreviewRevision;
  const frame = getCurrentFrame() || state.frames[0];
  if (!frame) {
    canvases.forEach((canvas) => {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.fillStyle = "#202531";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#4c5566";
      ctx.fillRect(0, canvas.height * 0.55, canvas.width, canvas.height * 0.45);
      ctx.fillStyle = "#8d93a3";
      ctx.beginPath();
      ctx.ellipse(canvas.width * 0.52, canvas.height * 0.48, canvas.width * 0.18, canvas.height * 0.24, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    return;
  }

  const image = await loadImage(frame.url);
  await Promise.all(canvases.map((canvas) => ensurePresetLut(findEffectPreset(canvas.dataset.previewEffect))));
  if (revision !== effectPreviewRevision)
    return;

  canvases.forEach((canvas) => {
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawImageContain(ctx, canvas.width, canvas.height, image, 1);
    applyEffect(ctx, canvas.width, canvas.height, canvas.dataset.previewEffect || "general-normal");
  });
}

function getCurrentFrame() {
  return state.frames[state.currentIndex] || null;
}

function selectFrame(index, resetUncheckedView = true) {
  if (state.frames.length === 0)
    return;

  state.currentIndex = Math.max(0, Math.min(index, state.frames.length - 1));
  const frame = getCurrentFrame();

  if (frame) {
    if (!frame.checked && resetUncheckedView) {
      frame.edit = defaultEdit();
    }
    frame.edit.effect = normalizeEffectId(frame.edit.effect);
    state.currentEffect = frame.edit.effect;
    state.viewMode = frame.edit.viewMode ?? 0;
    state.zoom = frame.edit.zoom;
    state.panX = frame.edit.panX;
    state.panY = frame.edit.panY;
  }

  if (state.playing) {
    updateFilmstripSelection();
    ensureCurrentFrameVisible();
    el.currentFrame.textContent = frame ? `${state.currentIndex + 1} / ${state.frames.length}` : "-";
    el.frameSlider.value = String(state.currentIndex);
    render();
  } else {
    updateUI();
    updateViewerModeButtons();
    render();
  }
}

function updateFilmstripSelection() {
  const thumbs = el.filmstrip.querySelectorAll(".thumb");
  thumbs.forEach((thumb, index) => {
    thumb.classList.toggle("current", index === state.currentIndex);
  });
}

function ensureCurrentFrameVisible() {
  const current = el.filmstrip.querySelector(".thumb.current");
  if (!current) return;

  const container = el.filmstrip;
  const thumbLeft = current.offsetLeft;
  const thumbRight = thumbLeft + current.offsetWidth;
  const scrollLeft = container.scrollLeft;
  const visibleLeft = scrollLeft;
  const visibleRight = scrollLeft + container.clientWidth;

  if (thumbRight > visibleRight - 20) {
    container.scrollLeft = thumbRight - container.clientWidth + 20;
  } else if (thumbLeft < visibleLeft + 20) {
    container.scrollLeft = thumbLeft - 20;
  }
}

function fitView() {
  state.viewMode = 0;
  state.zoom = 1;
  state.panX = 0;
  state.panY = 0;
  const frame = getCurrentFrame();
  if (frame) {
    frame.edit.viewMode = 0;
    frame.edit.zoom = 1;
    frame.edit.panX = 0;
    frame.edit.panY = 0;
  }
  updateViewerModeButtons();
  render();
}

function setFocusMode() {
  state.viewMode = 1;
  state.zoom = 1;
  state.panX = 0;
  state.panY = 0;
  const frame = getCurrentFrame();
  if (frame) {
    frame.edit.viewMode = 1;
    frame.edit.zoom = 1;
    frame.edit.panX = 0;
    frame.edit.panY = 0;
  }
  updateViewerModeButtons();
  render();
}

function setManualMode() {
  state.viewMode = 2;
  const frame = getCurrentFrame();
  if (frame) {
    frame.edit.viewMode = 2;
  }
  updateViewerModeButtons();
  render();
}

function updateViewerModeButtons() {
  el.fitBtn.classList.toggle("active", state.viewMode === 0);
  el.focusBtn.classList.toggle("active", state.viewMode === 1);
  el.analysisManualBtn.classList.toggle("active", state.viewMode === 2);
}

// Analysis view selector: FRAMES or SESSION VIDEO
function switchAnalysisView(view) {
  const isFrames = view === "frames";
  el.viewFramesBtn?.classList.toggle("active", isFrames);
  el.viewSessionVideoBtn?.classList.toggle("active", !isFrames);

  // Stop frame playback when switching away from frames
  if (!isFrames && state.playing) {
    stopPlay();
  }

  // Show/hide frames view
  el.analysisCanvas.hidden = !isFrames;
  el.emptyState.hidden = !isFrames || state.frames.length > 0;
  el.viewerStage?.querySelector('.transport')?.style && (document.querySelector('.transport').style.display = isFrames ? '' : 'none');
  document.querySelector('.frame-position')?.style && (document.querySelector('.frame-position').style.display = isFrames ? '' : 'none');
  el.filmstrip?.style && (el.filmstrip.style.display = isFrames ? '' : 'none');

  // Show/hide session video view
  const hasVideo = state.sourceVideo.blob && state.sourceVideo.blob.size > 0;
  el.sessionVideoPlayer.hidden = isFrames;
  el.sessionVideoControls.hidden = isFrames;
  el.noVideoState.hidden = isFrames || hasVideo;

  if (!isFrames && hasVideo) {
    // Load source video if not already loaded
    if (!el.sessionVideoPlayer.src && state.sourceVideo.url) {
      el.sessionVideoPlayer.src = state.sourceVideo.url;
    }
    // Ensure native playback rate
    el.sessionVideoPlayer.playbackRate = 1.0;
  } else if (isFrames) {
    // Pause video when switching to frames
    if (el.sessionVideoPlayer) {
      el.sessionVideoPlayer.pause();
      if (el.videoPlayPauseBtn) el.videoPlayPauseBtn.textContent = "Play";
    }
  }
}

function toggleSessionVideoPlayback() {
  if (!el.sessionVideoPlayer) return;
  el.sessionVideoPlayer.playbackRate = 1.0;
  if (el.sessionVideoPlayer.paused) {
    el.sessionVideoPlayer.play();
    el.videoPlayPauseBtn.textContent = "Pause";
  } else {
    el.sessionVideoPlayer.pause();
    el.videoPlayPauseBtn.textContent = "Play";
  }
}

function updateVideoTimeDisplay() {
  if (!el.sessionVideoPlayer || !el.videoTimeDisplay) return;
  const cur = el.sessionVideoPlayer.currentTime || 0;
  const dur = el.sessionVideoPlayer.duration || 0;
  el.videoTimeDisplay.textContent = `${formatTime(cur)} / ${formatTime(dur)}`;
  if (el.videoScrubber && !isNaN(dur)) {
    el.videoScrubber.max = String(dur);
    el.videoScrubber.value = String(cur);
  }
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function togglePlay() {
  if (state.playing)
    stopPlay();
  else
    startPlay();
}

function startPlay() {
  if (state.frames.length < 2)
    return;

  state.playing = true;
  el.playBtn.textContent = "Pause";
  const delay = 1000 / Number(el.skimSpeed.value || 1);
  state.playTimer = setInterval(() => {
    if (state.currentIndex >= state.frames.length - 1) {
      stopPlay();
      return;
    }
    selectFrame(state.currentIndex + 1);
  }, delay);
}

function stopPlay() {
  state.playing = false;
  el.playBtn.textContent = "Play";
  if (state.playTimer) {
    clearInterval(state.playTimer);
    state.playTimer = null;
  }
}

function markThisJunk() {
  const frame = getCurrentFrame();
  if (!frame || frame.checked)
    return;
  frame.junk = !frame.junk;
  updateUI();
  persistCurrentSession();
}

function markBefore() {
  for (let i = 0; i < state.currentIndex; i += 1) {
    if (!state.frames[i].checked)
      state.frames[i].junk = true;
  }
  updateUI();
  persistCurrentSession();
}

function deleteMarked() {
  stopPlay();
  framesPage = 1;
  const removable = state.frames.filter((frame) => frame.junk && !frame.checked);
  if (removable.length === 0)
    return;

  const ok = window.confirm(`Delete ${removable.length} marked junk frame(s)? Checked evidence frames are protected.`);
  if (!ok)
    return;

  removable.forEach((frame) => URL.revokeObjectURL(frame.url));
  state.frames = state.frames.filter((frame) => !frame.junk || frame.checked);
  state.currentIndex = Math.min(state.currentIndex, state.frames.length - 1);
  if (state.currentIndex < 0)
    state.currentIndex = 0;
  updateUI();
  render();
  persistCurrentSession();
}

function toggleCheckFrame() {
  const frame = getCurrentFrame();
  if (!frame)
    return;

  frame.checked = !frame.checked;
  if (frame.checked) {
    frame.junk = false;
    frame.edit.effect = state.currentEffect;
    frame.edit.viewMode = state.viewMode;
    frame.edit.zoom = state.zoom;
    frame.edit.panX = state.panX;
    frame.edit.panY = state.panY;
  }
  updateUI();
  persistCurrentSession();
}

async function saveSelectedAsEvidence() {
  const checked = state.frames.filter((frame) => frame.checked);
  for (const frame of checked) {
    const existing = state.evidence.find((item) => item.frameId === frame.id);
    const dataUrl = await renderFrameToDataUrl(frame, frame.edit);
    if (existing) {
      existing.dataUrl = dataUrl;
      existing.effect = frame.edit.effect;
      existing.zoom = frame.edit.zoom;
      existing.panX = frame.edit.panX;
      existing.panY = frame.edit.panY;
    } else {
      state.evidence.push({
        id: crypto.randomUUID(),
        frameId: frame.id,
        frameName: frame.name,
        frameNumber: state.frames.indexOf(frame) + 1,
        sourceWidth: frame.width,
        sourceHeight: frame.height,
        effect: frame.edit.effect,
        zoom: frame.edit.zoom,
        panX: frame.edit.panX,
        panY: frame.edit.panY,
        edited: isEdited(frame.edit),
        dataUrl,
        createdAt: new Date().toISOString(),
      });
    }
    frame.savedEvidence = true;
  }
  if (state.slideshowSelected.size === 0)
    state.slideshowSelected = new Set(state.evidence.map((item) => item.id));
  if (state.exportSelected.size === 0)
    state.exportSelected = new Set(state.evidence.map((item) => item.id));
  updateUI();
  renderEvidenceGrid();
  persistCurrentSession();
}

function isEdited(edit) {
  return effectBase(edit.effect) !== "normal" || edit.zoom > 1.01 || Math.abs(edit.panX) > 0.5 || Math.abs(edit.panY) > 0.5;
}

async function exportCurrentImage() {
  const frame = getCurrentFrame();
  if (!frame)
    return;
  const dataUrl = await renderFrameToDataUrl(frame, frame.edit);
  downloadDataUrl(dataUrl, makeExportName(frame));
}

function makeExportName(frame) {
  const base = frame.name.replace(/\.[^.]+$/, "");
  return `${base}${isEdited(frame.edit) ? "_Edited" : ""}.png`;
}

async function renderFrameToDataUrl(frame, edit) {
  const image = await loadImage(frame.url);
  await ensurePresetLut(findEffectPreset(edit.effect));
  const canvas = document.createElement("canvas");
  canvas.width = frame.width || image.naturalWidth || 1280;
  canvas.height = frame.height || image.naturalHeight || 720;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  drawImageWithEdit(ctx, canvas.width, canvas.height, image, edit);
  return canvas.toDataURL("image/png");
}

function setCapsuleStatus(text, progress) {
  const statusEl = document.getElementById("capsuleExportStatus");
  const textEl = document.getElementById("capsuleStatusText");
  const fillEl = document.getElementById("capsuleProgressFill");
  if (statusEl) statusEl.hidden = false;
  if (textEl) textEl.textContent = text;
  if (fillEl && typeof progress === "number") fillEl.style.width = `${Math.min(100, Math.max(0, progress))}%`;
}

function clearCapsuleStatus() {
  const statusEl = document.getElementById("capsuleExportStatus");
  const fillEl = document.getElementById("capsuleProgressFill");
  if (statusEl) statusEl.hidden = true;
  if (fillEl) fillEl.style.width = "0%";
}

function showCapsuleOverlay(mode, primary, secondary) {
  const overlay = document.getElementById("capsuleOverlay");
  if (!overlay) return;
  overlay.hidden = false;
  overlay.className = "capsule-overlay";
  const primaryEl = document.getElementById("capsuleOverlayPrimary");
  const secondaryEl = document.getElementById("capsuleOverlaySecondary");
  const detailEl = document.getElementById("capsuleOverlayDetail");
  const fillEl = document.getElementById("capsuleOverlayFill");
  if (primaryEl) primaryEl.textContent = primary;
  if (secondaryEl) secondaryEl.textContent = secondary || "Please Wait";
  if (detailEl) detailEl.textContent = "";
  if (fillEl) fillEl.style.width = "0%";
}

function setCapsuleOverlayDetail(text) {
  const detailEl = document.getElementById("capsuleOverlayDetail");
  if (detailEl) detailEl.textContent = text;
}

function setCapsuleOverlayProgress(progress) {
  const fillEl = document.getElementById("capsuleOverlayFill");
  if (fillEl) fillEl.style.width = `${Math.min(100, Math.max(0, progress))}%`;
}

function setCapsuleOverlaySuccess(primary, detail) {
  const overlay = document.getElementById("capsuleOverlay");
  if (overlay) overlay.className = "capsule-overlay capsule-overlay-success";
  const primaryEl = document.getElementById("capsuleOverlayPrimary");
  const secondaryEl = document.getElementById("capsuleOverlaySecondary");
  const detailEl = document.getElementById("capsuleOverlayDetail");
  const fillEl = document.getElementById("capsuleOverlayFill");
  if (primaryEl) primaryEl.textContent = primary;
  if (secondaryEl) secondaryEl.textContent = "";
  if (detailEl) detailEl.textContent = detail || "";
  if (fillEl) fillEl.style.width = "100%";
}

function setCapsuleOverlayFailure(primary, reason) {
  const overlay = document.getElementById("capsuleOverlay");
  if (overlay) overlay.className = "capsule-overlay capsule-overlay-failure";
  const primaryEl = document.getElementById("capsuleOverlayPrimary");
  const secondaryEl = document.getElementById("capsuleOverlaySecondary");
  const detailEl = document.getElementById("capsuleOverlayDetail");
  if (primaryEl) primaryEl.textContent = primary;
  if (secondaryEl) secondaryEl.textContent = "";
  if (detailEl) detailEl.textContent = reason || "";
}

function hideCapsuleOverlay(delay) {
  if (delay) {
    setTimeout(() => {
      const overlay = document.getElementById("capsuleOverlay");
      if (overlay) overlay.hidden = true;
    }, delay);
  } else {
    const overlay = document.getElementById("capsuleOverlay");
    if (overlay) overlay.hidden = true;
  }
}

function disableCapsuleButtons(disabled) {
  const ids = [
    "openSessionZipBtn", "openSessionZipBtn2", "archiveRestoreBtn",
    "cameraRestoreBtn", "cameraRestoreBtn2", "libraryRestoreBtn",
    "exportSessionCapsuleBtn",
  ];
  for (const id of ids) {
    const btn = document.getElementById(id);
    if (btn) btn.disabled = disabled;
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(2)} GB`;
}

async function estimateCapsuleSize() {
  if (!hasActiveSession()) return 0;
  let total = 0;
  for (const frame of state.frames) {
    if (frame.url) {
      try { total += (await arrayBufferFromUrl(frame.url)).byteLength; } catch (_) {}
    }
  }
  for (const item of state.evidence) {
    const src = getEvidenceImageSource(item);
    if (src) {
      try { total += (await arrayBufferFromUrl(src)).byteLength; } catch (_) {}
    }
  }
  if (state.sourceVideo.blob && state.sourceVideo.blob.size > 0) {
    total += state.sourceVideo.blob.size;
  }
  try {
    const slideshows = await loadSlideshowsFromDB(state.session.id);
    for (const ss of slideshows) {
      if (ss.blob && ss.blob.size > 0) total += ss.blob.size;
    }
  } catch (_) {}
  try {
    const projects = await loadSlideshowProjectsFromDB(state.session.id);
    for (const p of projects) {
      if (p.watermarkImageBlob && p.watermarkImageBlob.size) total += p.watermarkImageBlob.size;
    }
  } catch (_) {}
  return total;
}

function renderExportPageSummary() {
  if (!hasActiveSession()) return;
  const s = state.session;
  const elName = document.getElementById("exportSessionName");
  const elType = document.getElementById("exportExpType");
  const elCreated = document.getElementById("exportCreated");
  const elSV = document.getElementById("exportSourceVideo");
  const elFrames = document.getElementById("exportFrameCount");
  const elEvidence = document.getElementById("exportEvidenceCount");
  const elProjects = document.getElementById("exportProjectCount");
  const elSlideshow = document.getElementById("exportSlideshowCount");
  if (elName) elName.textContent = s.name || "Untitled Session";
  if (elType) elType.textContent = s.type || "General Visual ITC";
  if (elCreated) elCreated.textContent = s.createdAt ? new Date(s.createdAt).toLocaleString() : "-";
  const hasVideo = state.sourceVideo.blob && state.sourceVideo.blob.size > 0;
  if (elSV) elSV.textContent = hasVideo ? "Available" : "Not Saved";
  if (elSV) elSV.className = hasVideo ? "capsule-status-ok" : "capsule-status-warn";
  if (elFrames) elFrames.textContent = String(state.frames.length);
  if (elEvidence) elEvidence.textContent = String(state.evidence.length);
  loadSlideshowProjectsFromDB(s.id).then((projects) => {
    if (elProjects) elProjects.textContent = String(projects.length);
  }).catch(() => { if (elProjects) elProjects.textContent = "0"; });
  loadSlideshowsFromDB(s.id).then((slideshows) => {
    if (elSlideshow) elSlideshow.textContent = String(slideshows.length);
  }).catch(() => { if (elSlideshow) elSlideshow.textContent = "0"; });
  estimateCapsuleSize().then((size) => {
    const sizeEl = document.getElementById("capsuleSizeEstimate");
    const sizeVal = document.getElementById("capsuleSizeValue");
    if (sizeEl) sizeEl.hidden = size === 0;
    if (sizeVal) sizeVal.textContent = formatBytes(size);
  }).catch(() => {
    const sizeEl = document.getElementById("capsuleSizeEstimate");
    if (sizeEl) sizeEl.hidden = true;
  });
}

async function exportCapsuleZip() {
  if (!hasActiveSession()) {
    window.alert("Create or restore a session before exporting.");
    return;
  }
  if (state.frames.length === 0 && state.evidence.length === 0) {
    window.alert("Nothing to archive yet. Restore a capsule or import frames first.");
    return;
  }
  if (state.capsuleExportBusy) {
    window.alert("A capsule export operation is already in progress.");
    return;
  }

  state.capsuleExportBusy = true;
  disableCapsuleButtons(true);
  showCapsuleOverlay("export", "CREATING SESSION CAPSULE", "Please Wait");

  try {

  const root = safeName(state.session.name || "ITC_Visual_Studio_Session");

  setCapsuleStatus("Estimating capsule size...", 0);
  let estimatedSize = 0;
  try { estimatedSize = await estimateCapsuleSize(); } catch (_) {}
  const SIZE_THRESHOLD = 200 * 1024 * 1024;
  if (estimatedSize > SIZE_THRESHOLD) {
    const hasVideo = state.sourceVideo.blob && state.sourceVideo.blob.size > 0;
    const confirmed = window.confirm(
      `Large Session Capsule\n\n` +
      `Estimated session data: ${formatBytes(estimatedSize)}\n\n` +
      `This Capsule contains:\n` +
      `${state.frames.length} frames\n` +
      (hasVideo ? `1 source video\n` : ``) +
      `${state.evidence.length} evidence candidate(s)\n\n` +
      `Creating the archive may take some time.\n\nContinue?`
    );
    if (!confirmed) {
      clearCapsuleStatus();
      hideCapsuleOverlay();
      state.capsuleExportBusy = false;
      disableCapsuleButtons(false);
      return;
    }
  }

  const zipEntries = [];
  const now = new Date().toISOString();
  const totalSteps = state.frames.length + state.evidence.length + 5;
  let step = 0;

  setCapsuleStatus("Adding Metadata...", 2);
  setCapsuleOverlayDetail("Adding Metadata...");

  const sessionJson = {
    sessionId: state.session.id,
    sessionName: state.session.name,
    safeName: root,
    experimentType: normalizeExperimentType(state.session.type),
    createdTimestamp: state.session.createdAt,
    exportedTimestamp: now,
    sourceArchive: state.session.sourceArchive || "",
    source: "ITC Visual Studio Browser Version",
  };
  const framesMeta = {
    sessionId: state.session.id,
    recordings: [
      {
        recordingId: "Browser_Restored_001",
        recordingSequence: 1,
        sourceVideo: state.session.sourceVideo || "",
        format: "IMAGE_SEQUENCE",
        frameCount: state.frames.length,
        frames: [],
      },
    ],
  };
  const evidenceMeta = {
    sessionId: state.session.id,
    candidateCount: state.evidence.length,
    candidates: [],
  };

  addZipText(zipEntries, `${root}/Metadata/session.json`, JSON.stringify(sessionJson, null, 2));

  setCapsuleStatus(`Adding ${state.frames.length.toLocaleString()} Frames...`, 5);
  setCapsuleOverlayDetail(`Adding ${state.frames.length.toLocaleString()} Frames...`);
  for (let index = 0; index < state.frames.length; index += 1) {
    const frame = state.frames[index];
    const ext = frame.type === "image/png" ? "png" : "jpg";
    const filename = frame.native?.relativePath ? basename(frame.native.relativePath) : `Frame_${String(index + 1).padStart(9, "0")}.${ext}`;
    const relativePath = `Images/${ext === "png" ? "PNG" : "JPEG"}/Recording_001/${filename}`;
    const data = await arrayBufferFromUrl(frame.url);
    addZipBytes(zipEntries, `${root}/${relativePath}`, data);
    framesMeta.recordings[0].frames.push({
      frameIndex: frame.native?.frameIndex ?? index,
      frameNumber: frame.native?.frameNumber ?? index + 1,
      filename,
      relativePath,
      timestampSeconds: frame.native?.timestampSeconds ?? 0,
      timecode: frame.native?.timecode ?? "00:00:00.000",
      checked: frame.checked,
      junk: frame.junk && !frame.checked,
      savedEvidence: frame.savedEvidence,
      edit: frame.edit,
    });
    step++;
    if (step % 50 === 0 || index === state.frames.length - 1) {
      setCapsuleStatus(`Adding ${state.frames.length.toLocaleString()} Frames... (${index + 1}/${state.frames.length})`, 5 + ((step / totalSteps) * 50));
      setCapsuleOverlayDetail(`Adding Frames... ${index + 1} / ${state.frames.length}`);
    }
  }

  setCapsuleStatus("Adding Evidence...", 55);
  setCapsuleOverlayDetail("Adding Evidence...");
  for (let index = 0; index < state.evidence.length; index += 1) {
    const item = state.evidence[index];
    const source = getEvidenceImageSource(item);
    if (!source)
      continue;
    const filename = `Evidence_${String(index + 1).padStart(3, "0")}_${safeName(item.frameName || "Frame")}.png`;
    const relativePath = `Evidence/Candidates/${filename}`;
    addZipBytes(zipEntries, `${root}/${relativePath}`, await arrayBufferFromUrl(source));
    evidenceMeta.candidates.push({
      candidateId: item.id,
      frameId: item.frameId,
      frameNumber: item.frameNumber,
      sourceImage: item.native?.sourceImage || "",
      candidateImage: relativePath,
      imageFormat: "PNG",
      sourceType: item.edited ? "edited" : "original",
      sourceWidth: item.sourceWidth || 0,
      sourceHeight: item.sourceHeight || 0,
      effect: item.effect || "normal",
      zoom: item.zoom || 1,
      panX: item.panX || 0,
      panY: item.panY || 0,
      createdAt: item.createdAt || now,
    });
    step++;
  }

  addZipText(zipEntries, `${root}/Metadata/frames.json`, JSON.stringify(framesMeta, null, 2));
  addZipText(zipEntries, `${root}/Metadata/evidence_candidates.json`, JSON.stringify(evidenceMeta, null, 2));
  addZipText(zipEntries, `${root}/Notes/session_notes.txt`, "Browser capsule exported by ITC Visual Studio.\n");
  addZipText(zipEntries, `${root}/Markers/markers.json`, JSON.stringify({ sessionId: state.session.id, markers: [] }, null, 2));

  if (state.sourceVideo.blob && state.sourceVideo.blob.size > 0) {
    setCapsuleStatus("Adding Source Video...", 70);
    setCapsuleOverlayDetail("Adding Source Video...");
    const svExt = state.sourceVideo.mimeType?.includes("mp4") ? "mp4" :
                  state.sourceVideo.mimeType?.includes("webm") ? "webm" : "mp4";
    const svPath = state.sourceVideo.type === 'recorded'
      ? `Video/Master/Recording_001.${svExt}`
      : `Video/Imported/${safeName(state.sourceVideo.fileName || "source")}.${svExt}`;
    addZipBytes(zipEntries, `${root}/${svPath}`, await state.sourceVideo.blob.arrayBuffer());
    console.log(`CAPSULE EXPORT - Source video included: ${svPath} (${state.sourceVideo.blob.size} bytes)`);
  }

  setCapsuleStatus("Adding Slideshows...", 75);
  setCapsuleOverlayDetail("Adding Slideshows...");
  let slideshowCount = 0;
  try {
    const slideshows = await loadSlideshowsFromDB(state.session.id);
    for (let si = 0; si < slideshows.length; si++) {
      const ss = slideshows[si];
      if (ss.blob && ss.blob.size > 0) {
        const ssFilename = ss.fileName || `Slideshow_${String(si + 1).padStart(3, "0")}.mp4`;
        addZipBytes(zipEntries, `${root}/Exports/Slideshows/${ssFilename}`, await ss.blob.arrayBuffer());
        console.log(`CAPSULE EXPORT - Slideshow included: ${ssFilename} (${ss.blob.size} bytes)`);
        slideshowCount++;
      }
    }
  } catch (ssErr) {
    console.warn('Capsule export: failed to include slideshows:', ssErr);
  }

  setCapsuleStatus("Adding Slideshow Projects...", 80);
  setCapsuleOverlayDetail("Adding Slideshow Projects...");
  let projectCount = 0;
  try {
    const projects = await loadSlideshowProjectsFromDB(state.session.id);
    const projectsMeta = {
      sessionId: state.session.id,
      projectCount: projects.length,
      projects: [],
    };
    for (const proj of projects) {
      const projData = {
        id: proj.id,
        title: proj.title,
        createdAt: proj.createdAt,
        modifiedAt: proj.modifiedAt,
        selectedIds: proj.selectedIds || [],
        slideDuration: proj.slideDuration,
        transition: proj.transition,
        transitionDuration: proj.transitionDuration,
        motion: proj.motion,
        kenStart: proj.kenStart,
        kenEnd: proj.kenEnd,
        resolution: proj.resolution,
        fps: proj.fps,
        watermarkEnabled: proj.watermarkEnabled,
        watermarkType: proj.watermarkType,
        watermarkText: proj.watermarkText,
        watermarkColor: proj.watermarkColor,
        watermarkPosition: proj.watermarkPosition,
        watermarkOpacity: proj.watermarkOpacity,
        watermarkSize: proj.watermarkSize,
        watermarkImageFileName: proj.watermarkImageFileName || "",
        kbMotion: proj.kbMotion,
      };
      projectsMeta.projects.push(projData);
      if (proj.watermarkImageBlob && proj.watermarkImageBlob.size > 0) {
        const wmPath = `Slideshow/Projects/wm_${proj.id}.bin`;
        addZipBytes(zipEntries, `${root}/${wmPath}`, await proj.watermarkImageBlob.arrayBuffer());
        projData.watermarkImageZipPath = wmPath;
      }
      projectCount++;
    }
    addZipText(zipEntries, `${root}/Metadata/slideshow_projects.json`, JSON.stringify(projectsMeta, null, 2));
  } catch (projErr) {
    console.warn('Capsule export: failed to include slideshow projects:', projErr);
  }

  setCapsuleStatus("Creating .VITC.zip...", 90);
  setCapsuleOverlayDetail("Creating ZIP archive...");
  const blob = buildStoredZip(zipEntries);
  const url = URL.createObjectURL(blob);

  const defaultFilename = `${root}.vitc.zip`;
  setCapsuleStatus("Session Capsule Ready.", 100);
  setCapsuleOverlaySuccess("SESSION CAPSULE CREATED", defaultFilename);
  downloadDataUrl(url, defaultFilename, true);

  setTimeout(() => {
    clearCapsuleStatus();
    hideCapsuleOverlay();
    state.capsuleExportBusy = false;
    disableCapsuleButtons(false);
  }, 3000);

  } catch (error) {
    console.error("Capsule export failed:", error);
    clearCapsuleStatus();
    setCapsuleOverlayFailure("SESSION CAPSULE CREATION FAILED", error.message);
    hideCapsuleOverlay(4000);
    state.capsuleExportBusy = false;
    disableCapsuleButtons(false);
  }
}

async function importCapsule(event) {
  const file = event.target.files?.[0];
  if (!file)
    return;
  const text = await file.text();
  const capsule = JSON.parse(text);
  state.session = capsule.session || state.session;
  state.session.type = normalizeExperimentType(state.session.type);
  el.sessionName.value = state.session.name || "Imported Session";
  el.sessionType.value = state.session.type;
  state.evidence = Array.isArray(capsule.evidence) ? capsule.evidence : [];
  state.slideshowSelected = new Set(state.evidence.map((item) => item.id));
  state.exportSelected = new Set(state.evidence.map((item) => item.id));
  renderEvidenceGrid();
  updateUI();
  window.alert("Capsule metadata imported. Original frame images must be re-imported in this milestone build.");
}

function downloadDataUrl(dataUrl, filename, revoke = false) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  if (revoke)
    URL.revokeObjectURL(dataUrl);
}

function addZipText(entries, path, text) {
  addZipBytes(entries, path, new TextEncoder().encode(text));
}

function addZipBytes(entries, path, bytes) {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  entries.push({
    path: normalizePath(path),
    data,
    crc: crc32(data),
  });
}

function buildStoredZip(entries) {
  const parts = [];
  const central = [];
  let offset = 0;
  for (const entry of entries) {
    const nameBytes = new TextEncoder().encode(entry.path);
    const local = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0x0800, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, 0, true);
    localView.setUint16(12, 0, true);
    localView.setUint32(14, entry.crc, true);
    localView.setUint32(18, entry.data.length, true);
    localView.setUint32(22, entry.data.length, true);
    localView.setUint16(26, nameBytes.length, true);
    local.set(nameBytes, 30);
    parts.push(local, entry.data);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0x0800, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, 0, true);
    centralView.setUint16(14, 0, true);
    centralView.setUint32(16, entry.crc, true);
    centralView.setUint32(20, entry.data.length, true);
    centralView.setUint32(24, entry.data.length, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);
    central.push(centralHeader);
    offset += local.length + entry.data.length;
  }

  const centralOffset = offset;
  const centralSize = central.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, entries.length, true);
  endView.setUint16(10, entries.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, centralOffset, true);
  return new Blob([...parts, ...central, end], { type: "application/zip" });
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc ^= bytes[i];
    for (let j = 0; j < 8; j += 1)
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

async function arrayBufferFromUrl(url) {
  if (url.startsWith("data:")) {
    const response = await fetch(url);
    return response.arrayBuffer();
  }
  const response = await fetch(url);
  return response.arrayBuffer();
}

function safeName(name) {
  return (name || "session").replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "") || "session";
}

function dateStamp() {
  const d = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function timecodeFromSeconds(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const wholeSeconds = Math.floor(safeSeconds % 60);
  const milliseconds = Math.round((safeSeconds - Math.floor(safeSeconds)) * 1000);
  const pad = (value, length = 2) => String(value).padStart(length, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(wholeSeconds)}.${pad(milliseconds, 3)}`;
}

function onCanvasWheel(event) {
  const frame = getCurrentFrame();
  if (!frame)
    return;

  event.preventDefault();
  const delta = event.deltaY < 0 ? 1.12 : 1 / 1.12;
  const newZoom = Math.max(0.25, Math.min(8, state.zoom * delta));
  state.zoom = newZoom;
  frame.edit.zoom = state.zoom;

  if (state.viewMode !== 2) {
    state.viewMode = 2;
    frame.edit.viewMode = 2;
    updateViewerModeButtons();
  }

  render();
}

function onCanvasPointerDown(event) {
  const frame = getCurrentFrame();
  if (!frame)
    return;

  state.dragging = true;
  state.dragStart = {
    x: event.clientX,
    y: event.clientY,
    panX: state.panX,
    panY: state.panY,
  };
  el.analysisCanvas.classList.add("dragging");
  el.analysisCanvas.setPointerCapture?.(event.pointerId);
}

function onCanvasPointerMove(event) {
  if (!state.dragging || !state.dragStart)
    return;

  const frame = getCurrentFrame();
  if (!frame)
    return;

  state.panX = state.dragStart.panX + (event.clientX - state.dragStart.x);
  state.panY = state.dragStart.panY + (event.clientY - state.dragStart.y);
  frame.edit.panX = state.panX;
  frame.edit.panY = state.panY;
  render();
}

function onCanvasPointerUp() {
  state.dragging = false;
  state.dragStart = null;
  el.analysisCanvas.classList.remove("dragging");
}

async function render() {
  const canvas = el.analysisCanvas;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const frame = getCurrentFrame();
  const hasFrames = Boolean(frame);
  const hasSession = hasActiveSession();

  // Update empty state based on session and frame state
  if (!hasSession) {
    el.emptyState.hidden = false;
    const instruction = el.emptyState.querySelector(".empty-instruction");
    if (instruction) instruction.textContent = "Create a session, restore a .VITC.zip session capsule, or import video to begin.";
  } else if (!hasFrames) {
    el.emptyState.hidden = false;
    const instruction = el.emptyState.querySelector(".empty-instruction");
    if (instruction) instruction.textContent = "Session ready. Record video or import video to begin analysis.";
  } else {
    el.emptyState.hidden = true;
  }

  if (!frame) {
    // No frame: reset canvas to default 16:9
    canvas.width = 1280;
    canvas.height = 720;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return;
  }

  const image = await loadImage(frame.url);

  // Adapt canvas to source frame aspect ratio
  const imgW = image.naturalWidth;
  const imgH = image.naturalHeight;
  if (imgW > 0 && imgH > 0) {
    // Use the source image dimensions as the canvas size
    // This ensures the canvas matches the source aspect ratio
    canvas.width = imgW;
    canvas.height = imgH;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await ensurePresetLut(findEffectPreset(state.currentEffect));
  drawImageWithEdit(ctx, canvas.width, canvas.height, image, {
    effect: state.currentEffect,
    viewMode: state.viewMode,
    zoom: state.zoom,
    panX: state.panX,
    panY: state.panY,
  });
}

function drawImageWithEdit(ctx, canvasW, canvasH, image, edit) {
  ctx.save();
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvasW, canvasH);

  const imgW = image.naturalWidth;
  const imgH = image.naturalHeight;
  const viewMode = edit.viewMode ?? 0;
  let baseScale;

  if (viewMode === 1) {
    baseScale = Math.max(canvasW / imgW, canvasH / imgH);
  } else if (viewMode === 2) {
    baseScale = 1;
  } else {
    baseScale = Math.min(canvasW / imgW, canvasH / imgH);
  }

  const scale = baseScale * (edit.zoom || 1);
  const drawW = imgW * scale;
  const drawH = imgH * scale;
  const x = (canvasW - drawW) / 2 + (edit.panX || 0);
  const y = (canvasH - drawH) / 2 + (edit.panY || 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, x, y, drawW, drawH);
  ctx.restore();

  applyEffect(ctx, canvasW, canvasH, edit.effect || "normal");
}

function applyEffect(ctx, width, height, effectId) {
  const preset = findEffectPreset(effectId);
  const layers = preset?.layers || [];
  if (!preset || (layers.length === 0 && !preset.lut))
    return;

  const img = ctx.getImageData(0, 0, width, height);
  const srcData = img.data;
  const pixelCount = width * height;

  const rF = new Float32Array(pixelCount);
  const gF = new Float32Array(pixelCount);
  const bF = new Float32Array(pixelCount);

  for (let i = 0; i < pixelCount; i += 1) {
    const si = i * 4;
    rF[i] = srcData[si] / 255;
    gF[i] = srcData[si + 1] / 255;
    bF[i] = srcData[si + 2] / 255;
  }

  const lut = preset.lut ? getCachedLut(preset.lut) : null;
  if (lut) {
    for (let i = 0; i < pixelCount; i += 1) {
      const mapped = sampleCubeLut(lut, rF[i], gF[i], bF[i]);
      rF[i] = mapped[0];
      gF[i] = mapped[1];
      bF[i] = mapped[2];
    }
  }

  for (const layer of layers)
    applyViewingLayerFloat(rF, gF, bF, width, height, layer);

  for (let i = 0; i < pixelCount; i += 1) {
    const si = i * 4;
    srcData[si] = toByte(rF[i]);
    srcData[si + 1] = toByte(gF[i]);
    srcData[si + 2] = toByte(bF[i]);
  }

  ctx.putImageData(img, 0, 0);
}

function applyViewingLayerFloat(rF, gF, bF, width, height, layer) {
  if (!layer?.type)
    return;

  const strength = clamp01(Number(layer.strength ?? 1));
  if (strength <= 0)
    return;

  const pixelCount = width * height;
  const edgeSourceR = new Float32Array(rF);
  const edgeSourceG = new Float32Array(gF);
  const edgeSourceB = new Float32Array(bF);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = y * width + x;
      let r = rF[i];
      let g = gF[i];
      let b = bF[i];

      if (layer.type === "Monochrome") {
        const l = lumaUnit(r, g, b);
        const tint = monochromeTint(layer.extra);
        r = mix(r, l * tint[0], strength);
        g = mix(g, l * tint[1], strength);
        b = mix(b, l * tint[2], strength);
      } else if (layer.type === "Contrast") {
        const amount = 1 + strength * 2;
        r = 0.5 + (r - 0.5) * amount;
        g = 0.5 + (g - 0.5) * amount;
        b = 0.5 + (b - 0.5) * amount;
      } else if (layer.type === "Gamma") {
        const gamma = Math.max(0.01, 1 - strength * 0.5);
        r = Math.pow(Math.max(0, r), gamma);
        g = Math.pow(Math.max(0, g), gamma);
        b = Math.pow(Math.max(0, b), gamma);
      } else if (layer.type === "SoftGlow") {
        const glow = r * 0.3 + g * 0.6 + b * 0.1;
        const softGlow = glow * strength * 2.0;
        r = Math.min(1, r + softGlow * 0.15);
        g = Math.min(1, g + softGlow * 0.15);
        b = Math.min(1, b + softGlow * 0.15);
      } else if (layer.type === "Vignette") {
        const nx = width > 1 ? (x / (width - 1)) * 2 - 1 : 0;
        const ny = height > 1 ? (y / (height - 1)) * 2 - 1 : 0;
        const dist = nx * nx + ny * ny;
        const vignette = clamp01(1 - dist * strength);
        r *= vignette;
        g *= vignette;
        b *= vignette;
      } else if (layer.type === "Negative") {
        r = mix(r, 1 - r, strength);
        g = mix(g, 1 - g, strength);
        b = mix(b, 1 - b, strength);
      } else if (layer.type === "EdgeEnhancement") {
        const gx = -sampleFloatRed(edgeSourceR, edgeSourceG, edgeSourceB, width, height, x - 1, y - 1)
          - 2 * sampleFloatRed(edgeSourceR, edgeSourceG, edgeSourceB, width, height, x - 1, y)
          - sampleFloatRed(edgeSourceR, edgeSourceG, edgeSourceB, width, height, x - 1, y + 1)
          + sampleFloatRed(edgeSourceR, edgeSourceG, edgeSourceB, width, height, x + 1, y - 1)
          + 2 * sampleFloatRed(edgeSourceR, edgeSourceG, edgeSourceB, width, height, x + 1, y)
          + sampleFloatRed(edgeSourceR, edgeSourceG, edgeSourceB, width, height, x + 1, y + 1);
        const gy = -sampleFloatRed(edgeSourceR, edgeSourceG, edgeSourceB, width, height, x - 1, y - 1)
          - 2 * sampleFloatRed(edgeSourceR, edgeSourceG, edgeSourceB, width, height, x, y - 1)
          - sampleFloatRed(edgeSourceR, edgeSourceG, edgeSourceB, width, height, x + 1, y - 1)
          + sampleFloatRed(edgeSourceR, edgeSourceG, edgeSourceB, width, height, x - 1, y + 1)
          + 2 * sampleFloatRed(edgeSourceR, edgeSourceG, edgeSourceB, width, height, x, y + 1)
          + sampleFloatRed(edgeSourceR, edgeSourceG, edgeSourceB, width, height, x + 1, y + 1);
        const edge = Math.sqrt(gx * gx + gy * gy);
        r = mix(r, r * (1 + edge * strength * 3.0), 0.5);
        g = mix(g, g * (1 + edge * strength * 3.0), 0.5);
        b = mix(b, b * (1 + edge * strength * 3.0), 0.5);
      } else if (layer.type === "HighGain") {
        const origR = r;
        const origG = g;
        const gamma = Math.max(0.2, 1 - strength * 0.4);
        r = Math.pow(Math.max(0.001, r), gamma);
        g = Math.pow(Math.max(0.001, g), gamma);
        b = Math.pow(Math.max(0.001, b), gamma);
        const l = lumaUnit(r, g, b);
        const desat = strength * 0.25;
        r = mix(r, l, desat);
        g = mix(g, l, desat);
        b = mix(b, l, desat);
        const shadowBoost = smoothstep(0, 0.5, l) * strength;
        r = mix(r * 0.9, r * 1.3, shadowBoost);
        g = mix(g * 0.9, g * 1.3, shadowBoost);
        b = mix(b * 0.9, b * 1.3, shadowBoost);
        const grain = deterministicGrain(origR, origG) * strength * 0.04;
        r += grain;
        g += grain;
        b += grain;
      } else if (layer.type === "Posterization") {
        if (strength < 0.01)
          continue;
        const levels = Math.max(2, Math.round(Number(layer.extra || 8)));
        r = Math.floor(clamp01(r) * levels) / (levels - 1);
        g = Math.floor(clamp01(g) * levels) / (levels - 1);
        b = Math.floor(clamp01(b) * levels) / (levels - 1);
      }

      rF[i] = r;
      gF[i] = g;
      bF[i] = b;
    }
  }
}

function sampleFloatRed(rF, gF, bF, width, height, x, y) {
  const sx = Math.max(0, Math.min(width - 1, x));
  const sy = Math.max(0, Math.min(height - 1, y));
  return rF[sy * width + sx];
}

function lumaUnit(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function monochromeTint(value) {
  const tint = Number(value || 0);
  if (tint === 1)
    return [0.3, 1.0, 0.3];
  if (tint === 2)
    return [1.0, 0.35, 0.35];
  if (tint === 3)
    return [0.35, 0.4, 1.0];
  if (tint === 4)
    return [1.0, 0.75, 0.3];
  return [1.0, 1.0, 1.0];
}

function mix(a, b, amount) {
  return a + (b - a) * amount;
}

function smoothstep(edge0, edge1, value) {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function deterministicGrain(r, g) {
  const n = Math.sin(r * 12.9898 + g * 78.233) * 43758.5453;
  return (n - Math.floor(n)) - 0.5;
}

function clamp01(value) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function toByte(value) {
  return Math.round(clamp01(value) * 255);
}

function updateUI() {
  const frame = getCurrentFrame();
  const hasSession = hasActiveSession();
  el.frameCount.textContent = String(state.frames.length);
  el.currentFrame.textContent = frame ? `${state.currentIndex + 1} / ${state.frames.length}` : "-";
  el.checkedCount.textContent = String(state.frames.filter((item) => item.checked).length);
  el.junkCount.textContent = String(state.frames.filter((item) => item.junk && !item.checked).length);
  el.selectedEvidenceCount.textContent = el.checkedCount.textContent;
  el.frameSlider.max = String(Math.max(0, state.frames.length - 1));
  el.frameSlider.value = String(state.currentIndex);
  el.checkFrameBtn.textContent = frame?.checked ? "Uncheck Frame" : "Check Frame";
  el.deleteMarkedBtn.textContent = `Delete Marked (${el.junkCount.textContent})`;

  // Gate camera controls based on session state
  updateCameraSessionGating(hasSession);

  updateEffectSelection();
  updateCameraControls();
  updateViewerModeButtons();

  buildFilmstrip();
  renderEffectPreviews();
  renderEvidenceGrid();
  renderSessionSurfaces();
  renderFramesGrid();
  renderExportGrid();
  renderSlideshowFrameGrid();
  renderSlideshowPreview();
}

function updateCameraSessionGating(hasSession) {
  const sessionEntry = document.getElementById("sessionEntrySection");
  const activeSession = document.getElementById("activeSessionSection");
  const cameraSection = document.getElementById("cameraControlsSection");
  const micSection = document.getElementById("micControlsSection");

  // Left panel: show/hide no-session vs active-session sections
  const leftNoSession = document.getElementById("leftPanelNoSession");
  const leftActiveSession = document.getElementById("leftPanelActiveSession");
  if (leftNoSession) leftNoSession.hidden = hasSession;
  if (leftActiveSession) leftActiveSession.hidden = !hasSession;

  // Camera page: show/hide session entry vs active session
  if (sessionEntry) sessionEntry.hidden = hasSession;
  if (activeSession) activeSession.hidden = !hasSession;
  if (cameraSection) cameraSection.style.opacity = hasSession ? "" : "0.4";
  if (micSection) micSection.style.opacity = hasSession ? "" : "0.4";

  // Disable camera/mic controls when no session
  const controlsToGate = [
    el.cameraDeviceSelect, el.cameraFormatSelect, el.cameraFpsSelect, el.recordingDurationSelect,
    el.refreshCameraBtn, el.retryCameraBtn,
    el.audioDeviceSelect, el.audioChannelSelect, el.audioSampleRateSelect,
    el.refreshAudioBtn,
  ];
  controlsToGate.forEach(ctrl => {
    if (ctrl) ctrl.disabled = !hasSession;
  });

  // Update camera startup overlay
  updateCameraStartupOverlay();

  // Record button gating
  updateRecordButtonState();
}

/**
 * Manages the camera startup overlay visibility and content.
 * Session state and camera state are separate concerns:
 * - No session: show "No active session" message
 * - Session active: hide overlay entirely (camera preview handles its own visibility)
 */
function updateCameraStartupOverlay() {
  if (!el.cameraStartup) return;
  const hasSession = hasActiveSession();

  if (!hasSession) {
    // STATE A: No session — show no-session message
    el.cameraStartup.hidden = false;
    el.cameraStartup.querySelector(".empty-instruction").textContent =
      "No active session. Create a session or restore a capsule to begin.";
  } else {
    // STATE B/C/D: Session active — hide the overlay entirely
    // Camera preview visibility is managed by attachConnectedStream/stopCameraStream
    el.cameraStartup.hidden = true;
  }
}

function updateEffectSelection() {
  document.querySelectorAll(".effect-card").forEach((button) => {
    button.classList.toggle("active", button.dataset.effect === state.currentEffect);
  });
  document.querySelectorAll(".effect-filter-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.group === state.activeEffectGroup);
  });
}

function buildFilmstrip() {
  el.filmstrip.innerHTML = "";
  state.frames.forEach((frame, index) => {
    const button = document.createElement("button");
    button.className = "thumb";
    button.classList.toggle("current", index === state.currentIndex);
    button.classList.toggle("checked", frame.checked);
    button.classList.toggle("junk", frame.junk && !frame.checked);
    button.innerHTML = `<img src="${frame.url}" alt="${frame.name}"><span>${index + 1}</span>`;
    button.addEventListener("click", () => selectFrame(index));
    el.filmstrip.appendChild(button);
  });
  ensureCurrentFrameVisible();
}

function renderEvidenceGrid() {
  el.evidenceGrid.innerHTML = "";
  const batchPanel = document.getElementById("evidenceBatchExportPanel");
  if (batchPanel) batchPanel.hidden = true;
  if (state.evidence.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No saved evidence yet.";
    empty.style.color = "#8d93a3";
    el.evidenceGrid.appendChild(empty);
    return;
  }

  state.evidence.forEach((item) => {
    const card = document.createElement("article");
    card.className = "evidence-card";
    const imageSource = item.dataUrl || item.imageUrl || "";
    card.innerHTML = `
      <img src="${imageSource}" alt="${item.frameName}">
      <div>
        <strong>${item.edited ? "EDITED " : ""}${item.frameName}</strong><br>
        Frame ${item.frameNumber} | Effect: ${effectLabel(item.effect)}
      </div>
    `;
    el.evidenceGrid.appendChild(card);
  });
}

function getEvidenceImageSource(item) {
  return item?.dataUrl || item?.imageUrl || "";
}

function getSlideshowItems() {
  const selected = state.evidence.filter((item) => state.slideshowSelected.has(item.id));
  return selected.length > 0 ? selected : state.evidence;
}

function renderSessionSurfaces() {
  const hasSession = hasActiveSession();
  const summary = hasSession
    ? `${state.session.name} | ${state.session.type || "Visual ITC"} | ${state.frames.length} frame(s) | ${state.evidence.length} evidence candidate(s)`
    : "No active session";
  el.cameraSessionName.textContent = hasSession ? state.session.name : "No active session";
  el.cameraSessionMeta.textContent = summary;
  el.libraryGrid.innerHTML = "";

  // Sync active session data into sessions array before rendering
  if (state.session) {
    const existingIndex = state.sessions.findIndex(s => s.id === state.session.id);
    if (existingIndex >= 0) {
      state.sessions[existingIndex].frames = state.frames;
      state.sessions[existingIndex].evidence = state.evidence;
      state.sessions[existingIndex].currentIndex = state.currentIndex;
      state.sessions[existingIndex].currentEffect = state.currentEffect;
      state.sessions[existingIndex].name = state.session.name;
      state.sessions[existingIndex].type = state.session.type;
    }
  }

  const allSessions = [...state.sessions];

  if (allSessions.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML = "<strong>No sessions yet.</strong><span>Create a new session or restore a capsule from Camera.</span>";
    el.libraryGrid.appendChild(empty);
    return;
  }

  allSessions.forEach((sessionData) => {
    const isActive = state.session && state.session.id === sessionData.id;
    const card = document.createElement("article");
    card.className = "session-card";
    if (isActive) card.classList.add("active-session");
    const frameCount = isActive ? state.frames.length : (sessionData.frameCount || sessionData.frames?.length || 0);
    const evidenceCount = isActive ? state.evidence.length : (sessionData.evidence?.length || 0);
    const hasSourceVideo = isActive
      ? (state.sourceVideo.blob && state.sourceVideo.blob.size > 0)
      : (sessionData.sourceVideo || sessionData.recordingMimeType);
    const sourceVideoLabel = hasSourceVideo ? "Source Video: Available" : "Source Video: Not Saved";
    const slideshowCount = sessionData.slideshowCount || 0;
    const slideshowLabel = slideshowCount > 0 ? `Slideshows: ${slideshowCount}` : "";
    card.innerHTML = `
      <strong>${sessionData.name}${isActive ? " <span class='active-badge'>ACTIVE</span>" : ""}</strong>
      <span>${sessionData.type || "Visual ITC"}</span>
      <span>${new Date(sessionData.createdAt || Date.now()).toLocaleString()}</span>
      <span>${frameCount} frame(s) | ${evidenceCount} evidence${slideshowLabel ? " | " + slideshowLabel : ""}</span>
      <span class="source-video-status">${sourceVideoLabel}</span>
      <div class="toolbar-row">
        ${isActive ? "" : "<button class=\"primary-button inline-button\" data-open-session>Open</button>"}
        ${isActive ? "" : ""}
        <button class="danger-button inline-button" data-delete-session>Delete</button>
      </div>
    `;
    if (!isActive) {
      card.querySelector("[data-open-session]")?.addEventListener("click", async () => {
        await activateSession(sessionData);
      });
    }
    card.querySelector("[data-delete-session]")?.addEventListener("click", () => deleteSessionFromLibrary(sessionData.id));
    el.libraryGrid.appendChild(card);
  });
}

function hasActiveSession() {
  return state.session !== null;
}

function saveCurrentSessionToLibrary() {
  if (!state.session) return;
  const existingIndex = state.sessions.findIndex(s => s.id === state.session.id);
  const snapshot = {
    id: state.session.id,
    name: state.session.name,
    type: state.session.type,
    createdAt: state.session.createdAt,
    sourceArchive: state.session.sourceArchive || "",
    sourceVideo: state.session.sourceVideo || "",
    recordingMimeType: state.session.recordingMimeType || "",
    recordingLimitSeconds: state.session.recordingLimitSeconds || 60,
    _userCreated: state.session._userCreated || false,
    frames: state.frames,
    evidence: state.evidence,
    currentIndex: state.currentIndex,
    currentEffect: state.currentEffect,
    slideshowCount: state.sessions[existingIndex]?.slideshowCount || 0,
  };
  if (existingIndex >= 0) {
    state.sessions[existingIndex] = snapshot;
  } else {
    state.sessions.push(snapshot);
  }
}

async function activateSession(sessionData) {
  setRestoreStage("LOADING SESSION");
  framesPage = 1;
  stopPlay();
  stopSlideshow();
  slideshowImageCache.clear();
  revokeFrameUrls();
  stopCameraStream();
  stopAudioStream();

  state.session = {
    id: sessionData.id,
    name: sessionData.name,
    type: sessionData.type,
    createdAt: sessionData.createdAt,
    sourceArchive: sessionData.sourceArchive || "",
    sourceVideo: sessionData.sourceVideo || "",
    recordingMimeType: sessionData.recordingMimeType || "",
    recordingLimitSeconds: sessionData.recordingLimitSeconds || 60,
    _userCreated: sessionData._userCreated || false,
  };
  state.activeSessionId = sessionData.id;
  if (sessionData.recordingMimeType) lastRecordingMime = sessionData.recordingMimeType;
  state.evidence = sessionData.evidence || [];
  state.currentIndex = sessionData.currentIndex || 0;
  state.currentEffect = sessionData.currentEffect || "general-normal";
  state.activeEffectGroup = "";
  state.slideshowSelected = new Set(state.evidence.map((item) => item.id));
  state.exportSelected = new Set(state.evidence.map((item) => item.id));
  state.viewMode = 0;
  state.zoom = 1;
  state.panX = 0;
  state.panY = 0;

  // Set default slideshow name for this session
  if (el.slideshowName) el.slideshowName.value = (sessionData.name || "ITC Visual Studio") + " - Slideshow";

  // Restore capture metadata if available
  if (sessionData.captureWidth) state.camera.captureWidth = sessionData.captureWidth;
  if (sessionData.captureHeight) state.camera.captureHeight = sessionData.captureHeight;
  if (sessionData.captureFps) state.camera.captureFps = sessionData.captureFps;

  // Restore recording duration selector
  if (el.recordingDurationSelect) {
    const savedDurationMs = (sessionData.recordingLimitSeconds || 60) * 1000;
    el.recordingDurationSelect.value = String(savedDurationMs);
  }

  if (el.sessionName) el.sessionName.value = state.session.name;
  if (el.sessionType) el.sessionType.value = state.session.type;

  const metadataFrameCount = sessionData.frameCount || 0;
  setRestoreStage("SESSION RECORD FOUND");

  // Query actual frame records from IndexedDB
  setRestoreStage("QUERYING FRAME STORE");
  let frames = [];
  try {
    frames = await loadSessionFramesFromDB(sessionData.id);
  } catch (err) {
    console.error("Frame load failed:", err);
    setRestoreStage(`ERROR: Frame load failed: ${err.message}`);
    state.frames = [];
    updateUI();
    render();
    showPanel("camera");
    autoStartCamera();
    return;
  }

  const dbRecordCount = frames.length;
  setRestoreStage(`FRAME RECORDS FOUND | count=${dbRecordCount}`);

  // Count valid blobs
  const validBlobCount = frames.filter(f => f._blob instanceof Blob && f._blob.size > 0).length;
  setRestoreStage(`VALID BLOBS FOUND | count=${validBlobCount}`);

  if (dbRecordCount > 0 && validBlobCount === 0) {
    setRestoreStage(`ERROR: ${dbRecordCount} frame records exist but none have valid blobs`);
    state.frames = [];
    updateUI();
    render();
    showPanel("camera");
    autoStartCamera();
    return;
  }

  // Recreate object URLs (already done in loadSessionFramesFromDB)
  setRestoreStage("RECREATING OBJECT URLS");

  // Verify first frame URL decodes
  if (frames.length > 0 && frames[0].url) {
    try {
      const testImg = await loadImage(frames[0].url);
      if (testImg.naturalWidth > 0 && testImg.naturalHeight > 0) {
        console.log(`RESTORE PROBE - First frame decoded: ${testImg.naturalWidth}x${testImg.naturalHeight}`);
      } else {
        setRestoreStage("ERROR: Restored frame blob could not be decoded (0x0)");
        state.frames = [];
        updateUI();
        render();
        showPanel("camera");
        autoStartCamera();
        return;
      }
    } catch (imgErr) {
      setRestoreStage(`ERROR: Restored frame blob could not be decoded: ${imgErr.message}`);
      state.frames = [];
      updateUI();
      render();
      showPanel("camera");
      autoStartCamera();
      return;
    }
  }

  // Assign frames to state
  state.frames = frames;
  setRestoreStage(`STATE FRAMES ASSIGNED | count=${state.frames.length}`);

  // Restore source video blob from IndexedDB
  try {
    const svRecord = await loadSourceVideoFromDB(sessionData.id);
    if (svRecord && svRecord.blob && svRecord.blob.size > 0) {
      if (state.sourceVideo.url) URL.revokeObjectURL(state.sourceVideo.url);
      state.sourceVideo.blob = svRecord.blob;
      state.sourceVideo.url = URL.createObjectURL(svRecord.blob);
      state.sourceVideo.fileName = svRecord.fileName || '';
      state.sourceVideo.mimeType = svRecord.mimeType || '';
      state.sourceVideo.size = svRecord.size || svRecord.blob.size;
      state.sourceVideo.type = svRecord.type || 'restored';
      console.log(`SOURCE VIDEO RESTORED: ${svRecord.fileName} (${svRecord.type}, ${svRecord.blob.size} bytes)`);
    } else {
      // Clear source video state for sessions without saved video
      if (state.sourceVideo.url) URL.revokeObjectURL(state.sourceVideo.url);
      state.sourceVideo = { blob: null, url: null, fileName: '', mimeType: '', size: 0, type: '' };
    }
  } catch (svErr) {
    console.warn('Source video restore failed (non-fatal):', svErr);
    if (state.sourceVideo.url) URL.revokeObjectURL(state.sourceVideo.url);
    state.sourceVideo = { blob: null, url: null, fileName: '', mimeType: '', size: 0, type: '' };
  }

  // Load slideshow count from IndexedDB
  try {
    const slideshows = await loadSlideshowsFromDB(sessionData.id);
    const sessionIdx = state.sessions.findIndex(s => s.id === sessionData.id);
    if (sessionIdx >= 0) {
      state.sessions[sessionIdx].slideshowCount = slideshows.length;
    }
    console.log(`SLIDESHOW RESTORE - Found ${slideshows.length} saved slideshows`);
  } catch (ssErr) {
    console.warn('Slideshow count load failed (non-fatal):', ssErr);
  }

  // Reset slideshow project state for new session
  state.currentSlideshowProjectId = null;
  state.slideshowProjectDirty = false;
  updateSlideshowProjectStatus("");
  populateSlideshowProjectDropdown();

  // Consistency check
  if (metadataFrameCount !== dbRecordCount || dbRecordCount !== validBlobCount || validBlobCount !== state.frames.length) {
    console.warn(`RESTORE CONSISTENCY - Metadata: ${metadataFrameCount} / DB records: ${dbRecordCount} / Valid blobs: ${validBlobCount} / state.frames: ${state.frames.length}`);
  }

  // Select first frame
  setRestoreStage("SELECTING FIRST FRAME");
  if (state.frames.length > 0) {
    state.currentIndex = Math.max(0, Math.min(state.currentIndex, state.frames.length - 1));
    selectFrame(state.currentIndex, false);
  }

  // Render analysis
  setRestoreStage("RENDERING ANALYSIS");
  updateUI();
  render();

  setRestoreStage("COMPLETE");
  showPanel("camera");
  autoStartCamera();
  console.log(`Session "${state.session.name}" opened with ${state.frames.length} frames (metadata: ${metadataFrameCount}, DB: ${dbRecordCount}, blobs: ${validBlobCount})`);
}

function deleteCurrentSession() {
  closeActiveSession();
}

function closeActiveSession() {
  if (!state.session) return;

  // Save to library before closing
  saveCurrentSessionToLibrary();
  persistCurrentSession();

  stopPlay();
  stopSlideshow();
  slideshowImageCache.clear();
  stopCameraStream();
  stopAudioStream();
  revokeFrameUrls();

  if (state.slideshowExportUrl) {
    URL.revokeObjectURL(state.slideshowExportUrl);
    state.slideshowExportUrl = null;
  }

  if (state.sourceVideo.url) {
    URL.revokeObjectURL(state.sourceVideo.url);
  }
  state.sourceVideo = { blob: null, url: null, fileName: '', mimeType: '', size: 0, type: '' };

  state.session = null;
  state.activeSessionId = null;
  state.frames = [];
  state.evidence = [];
  state.slideshowSelected = new Set();
  state.exportSelected = new Set();
  state.currentIndex = 0;
  state.currentEffect = "general-normal";
  state.activeEffectGroup = "";
  state.viewMode = 0;
  state.zoom = 1;
  state.panX = 0;
  state.panY = 0;
  state.slideshowIndex = 0;
  state.currentSlideshowProjectId = null;
  state.slideshowProjectDirty = false;

  if (el.sessionName) el.sessionName.value = "";
  if (el.slideshowProjectSelect) el.slideshowProjectSelect.innerHTML = '<option value="">No Saved Projects</option>';
  updateSlideshowProjectStatus("");

  updateUI();
  render();
  showPanel("camera");
}

function deleteSessionFromLibrary(sessionId) {
  const sessionName = state.sessions.find(s => s.id === sessionId)?.name || state.session?.name || "this session";
  const confirmed = window.confirm(
    `Delete "${sessionName}"?\n\n` +
    "This will remove the session from the browser Library, including its loaded frames, evidence selections, edits, and session state.\n\n" +
    "The original capsule, video, JPG, PNG, or other source files on your computer will NOT be deleted.\n\n" +
    "This cannot be undone inside the current browser session."
  );
  if (!confirmed) return;

  // If deleting active session, close it first
  if (state.session && state.session.id === sessionId) {
    stopPlay();
    stopSlideshow();
    stopCameraStream();
    stopAudioStream();
    revokeFrameUrls();
    if (state.slideshowExportUrl) {
      URL.revokeObjectURL(state.slideshowExportUrl);
      state.slideshowExportUrl = null;
    }
    state.session = null;
    state.activeSessionId = null;
    state.frames = [];
    state.evidence = [];
    state.slideshowSelected = new Set();
    state.exportSelected = new Set();
    state.currentIndex = 0;
    state.currentEffect = "general-normal";
    state.activeEffectGroup = "";
    state.viewMode = 0;
    state.zoom = 1;
    state.panX = 0;
    state.panY = 0;
    if (el.sessionName) el.sessionName.value = "";
  }

  // Remove from sessions array
  state.sessions = state.sessions.filter(s => s.id !== sessionId);

  // Remove from IndexedDB (including slideshows)
  deleteSessionFromDB(sessionId).catch(err => console.error('Failed to delete from DB:', err));
  deleteSlideshowsForSession(sessionId).catch(err => console.error('Failed to delete slideshows:', err));
  deleteSlideshowProjectsForSession(sessionId).catch(err => console.error('Failed to delete slideshow projects:', err));

  updateUI();
  render();
}

function renderFramesGrid() {
  el.framesGrid.innerHTML = "";
  if (framesObserver) {
    framesObserver.disconnect();
    framesObserver = null;
  }
  framesPage = 1;
  const total = state.frames.length;

  // Hide Load More button — continuous scroll replaces it
  if (el.loadMoreFramesBtn) {
    el.loadMoreFramesBtn.hidden = true;
  }

  // Update count label to show authoritative total
  if (el.framesCountLabel) {
    el.framesCountLabel.textContent = `${total} frame(s)`;
  }

  if (total === 0) return;

  // Render initial batch
  const initialCount = Math.min(FRAMES_PAGE_SIZE, total);
  appendFramesBatch(0, initialCount);

  // If more frames exist, set up sentinel for continuous scroll
  if (total > FRAMES_PAGE_SIZE) {
    const sentinel = document.createElement("div");
    sentinel.id = "framesScrollSentinel";
    sentinel.style.height = "1px";
    el.framesGrid.appendChild(sentinel);

    framesObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        const nextStart = framesPage * FRAMES_PAGE_SIZE;
        if (nextStart >= total) {
          framesObserver.disconnect();
          framesObserver = null;
          return;
        }
        const nextEnd = Math.min(nextStart + FRAMES_PAGE_SIZE, total);
        // Remove sentinel before appending, re-add after
        if (sentinel.parentNode) sentinel.parentNode.removeChild(sentinel);
        appendFramesBatch(nextStart, nextEnd);
        framesPage++;
        if (nextEnd < total) {
          el.framesGrid.appendChild(sentinel);
        } else {
          framesObserver.disconnect();
          framesObserver = null;
        }
      }
    }, { root: el.framesGrid.parentElement, threshold: 0.1 });
    framesObserver.observe(sentinel);
  }
}

function appendFramesBatch(startIndex, endIndex) {
  const fragment = document.createDocumentFragment();
  for (let index = startIndex; index < endIndex; index++) {
    const frame = state.frames[index];
    const card = document.createElement("button");
    card.className = "frame-card";
    card.classList.toggle("checked", frame.checked);
    card.classList.toggle("junk", frame.junk && !frame.checked);
    card.innerHTML = `<img src="${frame.url}" alt="${frame.name}"><span>F${index + 1}</span>`;
    card.addEventListener("click", () => {
      selectFrame(index);
      showPanel("analysis");
    });
    fragment.appendChild(card);
  }
  // Insert before sentinel if it exists
  const sentinel = document.getElementById("framesScrollSentinel");
  if (sentinel) {
    el.framesGrid.insertBefore(fragment, sentinel);
  } else {
    el.framesGrid.appendChild(fragment);
  }
}

function toggleEvidenceBatchExport() {
  if (!hasActiveSession()) {
    window.alert("Create or restore a session before exporting evidence.");
    return;
  }
  const panel = document.getElementById("evidenceBatchExportPanel");
  if (!panel) return;
  const isVisible = !panel.hidden;
  panel.hidden = isVisible;
  if (!isVisible) {
    renderExportGrid();
  }
}

function renderExportGrid() {
  el.exportGrid.innerHTML = "";
  state.evidence.forEach((item) => {
    const card = document.createElement("button");
    card.className = "export-card";
    card.classList.toggle("selected", state.exportSelected.has(item.id));
    card.innerHTML = `
      <img src="${getEvidenceImageSource(item)}" alt="${item.frameName}">
      <span>${item.edited ? "Edited" : "Original"} | F${item.frameNumber || "-"}</span>
    `;
    card.addEventListener("click", () => {
      if (state.exportSelected.has(item.id))
        state.exportSelected.delete(item.id);
      else
        state.exportSelected.add(item.id);
      renderExportGrid();
    });
    el.exportGrid.appendChild(card);
  });
  renderExportPreview();
}

function selectAllExportEvidence() {
  state.exportSelected = new Set(state.evidence.map((item) => item.id));
  renderExportGrid();
}

function clearExportEvidence() {
  state.exportSelected.clear();
  renderExportGrid();
}

async function renderExportPreview() {
  const canvas = el.exportPreviewCanvas;
  if (!canvas)
    return;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#111318";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const item = state.evidence[0];
  if (!item)
    return;
  const image = await loadImage(getEvidenceImageSource(item));
  drawImageContain(ctx, canvas.width, canvas.height, image, 1);
  if (el.exportWatermarkEnabled.checked) {
    drawWatermark(ctx, canvas.width, canvas.height, {
      type: "text",
      text: el.exportWatermarkText.value,
      color: "#ffffff",
      opacity: Number(el.exportWatermarkOpacity.value || 0.5),
      size: Number(el.exportWatermarkSize.value || 1),
      position: "Bottom Right",
    });
  }
}

async function exportEvidenceBatch() {
  const items = state.evidence.filter((item) => state.exportSelected.has(item.id));
  if (items.length === 0) {
    window.alert("No evidence images selected for export.");
    return;
  }
  for (const item of items) {
    const dataUrl = await renderEvidenceExportDataUrl(item);
    if (!dataUrl)
      continue;
    downloadDataUrl(dataUrl, `${safeName(item.frameName || "evidence")}${item.edited ? "_Edited" : ""}_Export.png`);
    await delay(120);
  }
}

async function renderEvidenceExportDataUrl(item) {
  const source = getEvidenceImageSource(item);
  if (!source)
    return "";
  const image = await loadImage(source);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || 1280;
  canvas.height = image.naturalHeight || 720;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  if (el.exportWatermarkEnabled.checked) {
    drawWatermark(ctx, canvas.width, canvas.height, {
      type: "text",
      text: el.exportWatermarkText.value,
      color: "#ffffff",
      opacity: Number(el.exportWatermarkOpacity.value || 0.5),
      size: Number(el.exportWatermarkSize.value || 1),
      position: "Bottom Right",
    });
  }
  return canvas.toDataURL("image/png");
}

function renderSlideshowFrameGrid() {
  el.slideshowFrameGrid.innerHTML = "";
  if (state.evidence.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No saved evidence frames yet.";
    empty.style.color = "#8d93a3";
    el.slideshowFrameGrid.appendChild(empty);
    return;
  }
  state.evidence.forEach((item, index) => {
    const card = document.createElement("button");
    card.className = "slideshow-frame-card";
    card.classList.toggle("selected", state.slideshowSelected.has(item.id));
    card.innerHTML = `
      <span>${index + 1}</span>
      <img src="${getEvidenceImageSource(item)}" alt="${item.frameName}">
      <strong>F${item.frameNumber || index + 1}</strong>
    `;
    card.addEventListener("click", () => {
      if (state.slideshowSelected.has(item.id))
        state.slideshowSelected.delete(item.id);
      else
        state.slideshowSelected.add(item.id);
      markSlideshowDirty();
      renderSlideshowFrameGrid();
      renderSlideshowPreview();
    });
    el.slideshowFrameGrid.appendChild(card);
  });
  updateSlideshowDuration();
}

function selectAllSlideshowFrames() {
  state.slideshowSelected = new Set(state.evidence.map((item) => item.id));
  markSlideshowDirty();
  renderSlideshowFrameGrid();
  renderSlideshowPreview();
}

function handleWatermarkImageSelect(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  if (state.watermarkImage.url) URL.revokeObjectURL(state.watermarkImage.url);
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    state.watermarkImage.blob = file;
    state.watermarkImage.url = url;
    state.watermarkImage.fileName = file.name;
    state.watermarkImage.image = img;
    if (el.watermarkImagePreview) {
      el.watermarkImagePreview.innerHTML = "";
      const previewImg = document.createElement("img");
      previewImg.src = url;
      el.watermarkImagePreview.appendChild(previewImg);
    }
    if (el.removeWatermarkImageBtn) el.removeWatermarkImageBtn.hidden = false;
    if (el.chooseWatermarkImageBtn) el.chooseWatermarkImageBtn.textContent = "Replace Image";
    markSlideshowDirty();
    renderSlideshowPreview();
  };
  img.onerror = () => URL.revokeObjectURL(url);
  img.src = url;
}

function removeWatermarkImage() {
  if (state.watermarkImage.url) URL.revokeObjectURL(state.watermarkImage.url);
  state.watermarkImage.blob = null;
  state.watermarkImage.url = null;
  state.watermarkImage.fileName = "";
  state.watermarkImage.image = null;
  if (el.watermarkImagePreview) {
    el.watermarkImagePreview.innerHTML = '<span class="watermark-image-placeholder">No image selected</span>';
  }
  if (el.watermarkImageInput) el.watermarkImageInput.value = "";
  if (el.removeWatermarkImageBtn) el.removeWatermarkImageBtn.hidden = true;
  if (el.chooseWatermarkImageBtn) el.chooseWatermarkImageBtn.textContent = "Choose Image";
  markSlideshowDirty();
  renderSlideshowPreview();
}

function clearSlideshowFrames() {
  state.slideshowSelected.clear();
  markSlideshowDirty();
  renderSlideshowFrameGrid();
  renderSlideshowPreview();
}

function chronologicalSlideshowFrames() {
  state.evidence.sort((a, b) => (a.frameNumber || 0) - (b.frameNumber || 0));
  selectAllSlideshowFrames();
}

function resetSlideshow() {
  state.slideshowIndex = 0;
  state.currentSlideshowProjectId = null;
  state.slideshowProjectDirty = false;
  el.slideshowName.value = generateSlideshowProjectTitle();
  applySlideshowDefaultsFromSession();
  resetWatermarkDefaults();
  slideshowImageCache.clear();
  selectAllSlideshowFrames();
  stopSlideshow();
  updateSlideshowProjectStatus("");
  populateSlideshowProjectDropdown();
}

function generateSlideshowProjectTitle() {
  const base = (state.session?.name || "ITC Visual Studio") + " - Slideshow";
  return base;
}

function generateUniqueSlideshowProjectTitle() {
  const base = generateSlideshowProjectTitle();
  const sessionId = state.session?.id;
  if (!sessionId) return base;
  return loadSlideshowProjectsFromDB(sessionId).then((projects) => {
    const titles = new Set(projects.map(p => p.title));
    if (!titles.has(base)) return base;
    let n = 2;
    while (titles.has(`${base} ${n}`)) n++;
    return `${base} ${n}`;
  });
}

function resetWatermarkDefaults() {
  if (el.watermarkEnabled) el.watermarkEnabled.checked = false;
  if (el.watermarkType) el.watermarkType.value = "text";
  if (el.watermarkTextSection) el.watermarkTextSection.hidden = false;
  if (el.watermarkImageSection) el.watermarkImageSection.hidden = true;
  if (el.watermarkText) el.watermarkText.value = "";
  if (el.watermarkColor) el.watermarkColor.value = "#ffffff";
  if (el.watermarkPosition) el.watermarkPosition.value = "Bottom Right";
  if (el.watermarkOpacity) el.watermarkOpacity.value = "0.5";
  if (el.watermarkSize) el.watermarkSize.value = "1";
  if (state.watermarkImage.url) URL.revokeObjectURL(state.watermarkImage.url);
  state.watermarkImage = { blob: null, url: null, fileName: '', image: null };
  if (el.watermarkImagePreview) {
    el.watermarkImagePreview.innerHTML = '<span class="watermark-image-placeholder">No image selected</span>';
  }
  if (el.watermarkImageInput) el.watermarkImageInput.value = "";
  if (el.removeWatermarkImageBtn) el.removeWatermarkImageBtn.hidden = true;
  if (el.chooseWatermarkImageBtn) el.chooseWatermarkImageBtn.textContent = "Choose Image";
}

function collectSlideshowProjectData() {
  const selectedIds = Array.from(state.slideshowSelected);
  // Serialize Ken Burns motion map
  const kbMotion = {};
  kbMotionMap.forEach((val, key) => { kbMotion[key] = val; });

  return {
    title: el.slideshowName.value || generateSlideshowProjectTitle(),
    selectedIds,
    slideDuration: Number(el.slideDurationSelect.value || 5),
    transition: el.transitionSelect.value,
    transitionDuration: Number(el.transitionDurationSelect.value || 0.75),
    motion: el.motionSelect.value,
    kenStart: Number(el.kenStart.value || 1),
    kenEnd: Number(el.kenEnd.value || 1.22),
    resolution: el.slideshowResSelect.value,
    fps: Number(el.slideshowFpsSelect.value || 30),
    watermarkEnabled: el.watermarkEnabled.checked,
    watermarkType: el.watermarkType.value,
    watermarkText: el.watermarkText.value,
    watermarkColor: el.watermarkColor.value,
    watermarkPosition: el.watermarkPosition.value,
    watermarkOpacity: Number(el.watermarkOpacity.value || 0.5),
    watermarkSize: Number(el.watermarkSize.value || 1),
    watermarkImageFileName: state.watermarkImage.fileName || '',
    watermarkImageBlob: state.watermarkImage.blob || null,
    kbMotion,
  };
}

function applySlideshowProjectData(data) {
  // Title
  if (el.slideshowName) el.slideshowName.value = data.title || generateSlideshowProjectTitle();

  // Selected images
  if (data.selectedIds && data.selectedIds.length > 0) {
    state.slideshowSelected = new Set(data.selectedIds);
  } else {
    state.slideshowSelected = new Set(state.evidence.map(item => item.id));
  }

  // Timing
  if (el.slideDurationSelect) el.slideDurationSelect.value = String(data.slideDuration || 5);
  if (el.transitionSelect) el.transitionSelect.value = data.transition || "Cross Fade";
  if (el.transitionDurationSelect) el.transitionDurationSelect.value = String(data.transitionDuration || 0.75);

  // Motion
  if (el.motionSelect) el.motionSelect.value = data.motion || "Still";
  if (el.kenStart) el.kenStart.value = String(data.kenStart || 1);
  if (el.kenEnd) el.kenEnd.value = String(data.kenEnd || 1.22);

  // Resolution / FPS
  if (el.slideshowResSelect) el.slideshowResSelect.value = data.resolution || "1280x720";
  if (el.slideshowFpsSelect) el.slideshowFpsSelect.value = String(data.fps || 30);
  updateSlideshowCanvasSize();

  // Watermark
  if (el.watermarkEnabled) el.watermarkEnabled.checked = !!data.watermarkEnabled;
  if (el.watermarkType) el.watermarkType.value = data.watermarkType || "text";
  if (el.watermarkTextSection) el.watermarkTextSection.hidden = (data.watermarkType === "image");
  if (el.watermarkImageSection) el.watermarkImageSection.hidden = (data.watermarkType !== "image");
  if (el.watermarkText) el.watermarkText.value = data.watermarkText || "";
  if (el.watermarkColor) el.watermarkColor.value = data.watermarkColor || "#ffffff";
  if (el.watermarkPosition) el.watermarkPosition.value = data.watermarkPosition || "Bottom Right";
  if (el.watermarkOpacity) el.watermarkOpacity.value = String(data.watermarkOpacity ?? 0.5);
  if (el.watermarkSize) el.watermarkSize.value = String(data.watermarkSize ?? 1);

  // Watermark image restoration
  if (data.watermarkImageBlob instanceof Blob && data.watermarkImageBlob.size > 0) {
    if (state.watermarkImage.url) URL.revokeObjectURL(state.watermarkImage.url);
    const url = URL.createObjectURL(data.watermarkImageBlob);
    const img = new Image();
    img.onload = () => {
      state.watermarkImage.blob = data.watermarkImageBlob;
      state.watermarkImage.url = url;
      state.watermarkImage.fileName = data.watermarkImageFileName || '';
      state.watermarkImage.image = img;
      if (el.watermarkImagePreview) {
        el.watermarkImagePreview.innerHTML = "";
        const previewImg = document.createElement("img");
        previewImg.src = url;
        el.watermarkImagePreview.appendChild(previewImg);
      }
      if (el.removeWatermarkImageBtn) el.removeWatermarkImageBtn.hidden = false;
      if (el.chooseWatermarkImageBtn) el.chooseWatermarkImageBtn.textContent = "Replace Image";
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  } else {
    if (state.watermarkImage.url) URL.revokeObjectURL(state.watermarkImage.url);
    state.watermarkImage = { blob: null, url: null, fileName: '', image: null };
    if (el.watermarkImagePreview) {
      el.watermarkImagePreview.innerHTML = '<span class="watermark-image-placeholder">No image selected</span>';
    }
    if (el.watermarkImageInput) el.watermarkImageInput.value = "";
    if (el.removeWatermarkImageBtn) el.removeWatermarkImageBtn.hidden = true;
    if (el.chooseWatermarkImageBtn) el.chooseWatermarkImageBtn.textContent = "Choose Image";
  }

  // Ken Burns motion restoration
  kbMotionMap.clear();
  if (data.kbMotion) {
    Object.entries(data.kbMotion).forEach(([key, val]) => {
      kbMotionMap.set(Number(key), val);
    });
  }

  // Refresh frame grid and preview
  renderSlideshowFrameGrid();
  renderSlideshowPreview();
  updateSlideshowDuration();
}

function markSlideshowDirty() {
  state.slideshowProjectDirty = true;
  updateSlideshowProjectStatus("Unsaved Changes");
}

function updateSlideshowProjectStatus(text) {
  if (el.slideshowProjectStatus) {
    el.slideshowProjectStatus.textContent = text;
    el.slideshowProjectStatus.className = "slideshow-project-status" + (text ? " visible" : "");
    if (text === "Saved") {
      el.slideshowProjectStatus.classList.add("saved");
    } else if (text === "Unsaved Changes") {
      el.slideshowProjectStatus.classList.add("dirty");
    }
  }
}

async function handleNewSlideshowProject() {
  if (state.slideshowProjectDirty) {
    const choice = window.confirm(
      "This slideshow has unsaved changes.\nSave before creating a new project?\n\nOK = Save, Cancel = Discard"
    );
    if (choice) {
      await handleSaveSlideshowProject();
    }
  }
  openSlideshowProjectDialog();
}

// Slideshow Project Naming Dialog
let pendingNewSlideshowProject = false;

async function openSlideshowProjectDialog() {
  if (!el.slideshowProjectDialog) return;
  pendingNewSlideshowProject = true;
  const suggestedName = await generateUniqueSlideshowProjectTitle();
  el.dialogSlideshowProjectName.value = suggestedName;
  if (el.dialogSlideshowNameValidation) el.dialogSlideshowNameValidation.hidden = true;
  if (el.dialogSlideshowDuplicateValidation) el.dialogSlideshowDuplicateValidation.hidden = true;
  el.slideshowProjectDialogTitle.textContent = "New Slideshow Project";
  el.dialogSlideshowCreateBtn.textContent = "Create Project";
  el.slideshowProjectDialog.showModal();
  setTimeout(() => {
    el.dialogSlideshowProjectName.focus();
    el.dialogSlideshowProjectName.select();
  }, 50);
}

function closeSlideshowProjectDialog() {
  if (!el.slideshowProjectDialog) return;
  el.slideshowProjectDialog.close();
  pendingNewSlideshowProject = false;
}

async function handleSlideshowProjectDialogCreate() {
  const name = (el.dialogSlideshowProjectName.value || "").trim();
  if (!name) {
    if (el.dialogSlideshowNameValidation) el.dialogSlideshowNameValidation.hidden = false;
    if (el.dialogSlideshowDuplicateValidation) el.dialogSlideshowDuplicateValidation.hidden = true;
    el.dialogSlideshowProjectName.focus();
    return;
  }

  // Check for duplicate names within this session
  const sessionId = state.session?.id;
  if (sessionId) {
    const existingProjects = await loadSlideshowProjectsFromDB(sessionId);
    const duplicate = existingProjects.find(p => p.title === name && p.id !== state.currentSlideshowProjectId);
    if (duplicate) {
      if (el.dialogSlideshowDuplicateValidation) el.dialogSlideshowDuplicateValidation.hidden = false;
      if (el.dialogSlideshowNameValidation) el.dialogSlideshowNameValidation.hidden = true;
      el.dialogSlideshowProjectName.focus();
      return;
    }
  }

  if (el.dialogSlideshowNameValidation) el.dialogSlideshowNameValidation.hidden = true;
  if (el.dialogSlideshowDuplicateValidation) el.dialogSlideshowDuplicateValidation.hidden = true;

  // Create the new project
  resetSlideshow();
  if (el.slideshowName) el.slideshowName.value = name;

  // Save immediately to persist
  await handleSaveSlideshowProject();

  closeSlideshowProjectDialog();
}

async function handleSaveSlideshowProject() {
  const sessionId = state.session?.id;
  if (!sessionId) {
    window.alert("No active session. Cannot save slideshow project.");
    return;
  }

  updateSlideshowProjectStatus("Saving...");
  state.slideshowProjectSaving = true;

  const data = collectSlideshowProjectData();
  const now = new Date().toISOString();

  let projectId = state.currentSlideshowProjectId;

  if (!projectId) {
    // New project — generate unique title
    const existingProjects = await loadSlideshowProjectsFromDB(sessionId);
    const titles = new Set(existingProjects.map(p => p.title));
    let title = data.title;
    if (titles.has(title)) {
      let n = 2;
      while (titles.has(`${data.title} ${n}`)) n++;
      title = `${data.title} ${n}`;
      data.title = title;
      if (el.slideshowName) el.slideshowName.value = title;
    }
    projectId = crypto.randomUUID();
    state.currentSlideshowProjectId = projectId;
  }

  const project = {
    id: projectId,
    sessionId,
    title: data.title,
    createdAt: state.currentSlideshowProjectId ? undefined : now, // preserve on update
    modifiedAt: now,
    selectedIds: data.selectedIds,
    slideDuration: data.slideDuration,
    transition: data.transition,
    transitionDuration: data.transitionDuration,
    motion: data.motion,
    kenStart: data.kenStart,
    kenEnd: data.kenEnd,
    resolution: data.resolution,
    fps: data.fps,
    watermarkEnabled: data.watermarkEnabled,
    watermarkType: data.watermarkType,
    watermarkText: data.watermarkText,
    watermarkColor: data.watermarkColor,
    watermarkPosition: data.watermarkPosition,
    watermarkOpacity: data.watermarkOpacity,
    watermarkSize: data.watermarkSize,
    watermarkImageFileName: data.watermarkImageFileName,
    watermarkImageBlob: data.watermarkImageBlob,
    kbMotion: data.kbMotion,
  };

  // If updating, preserve createdAt
  if (state.currentSlideshowProjectId) {
    const existing = await loadSlideshowProjectsFromDB(sessionId);
    const prev = existing.find(p => p.id === projectId);
    if (prev) project.createdAt = prev.createdAt;
  }

  await persistSlideshowProjectToDB(project);

  state.slideshowProjectDirty = false;
  state.slideshowProjectSaving = false;
  updateSlideshowProjectStatus("Saved");
  populateSlideshowProjectDropdown();

  // Briefly show "Saved" then clear
  setTimeout(() => {
    if (!state.slideshowProjectDirty) {
      updateSlideshowProjectStatus("");
    }
  }, 2000);
}

async function handleLoadSlideshowProject() {
  const projectId = el.slideshowProjectSelect?.value;
  if (!projectId) return;

  if (state.slideshowProjectDirty) {
    const choice = window.confirm(
      "This slideshow has unsaved changes.\nSave before switching project?\n\nOK = Save, Cancel = Discard"
    );
    if (choice) {
      await handleSaveSlideshowProject();
    }
  }

  const sessionId = state.session?.id;
  if (!sessionId) return;

  const projects = await loadSlideshowProjectsFromDB(sessionId);
  const project = projects.find(p => p.id === projectId);
  if (!project) {
    window.alert("Project not found.");
    return;
  }

  state.currentSlideshowProjectId = project.id;
  state.slideshowProjectDirty = false;
  applySlideshowProjectData(project);
  updateSlideshowProjectStatus("");
}

async function populateSlideshowProjectDropdown() {
  const sessionId = state.session?.id;
  if (!el.slideshowProjectSelect) return;

  el.slideshowProjectSelect.innerHTML = "";

  if (!sessionId) {
    el.slideshowProjectSelect.innerHTML = '<option value="">No Saved Projects</option>';
    return;
  }

  const projects = await loadSlideshowProjectsFromDB(sessionId);

  if (projects.length === 0) {
    el.slideshowProjectSelect.innerHTML = '<option value="">No Saved Projects</option>';
    return;
  }

  // Sort by modifiedAt descending (most recent first)
  projects.sort((a, b) => (b.modifiedAt || "").localeCompare(a.modifiedAt || ""));

  for (const proj of projects) {
    const opt = document.createElement("option");
    opt.value = proj.id;
    opt.textContent = proj.title;
    if (proj.id === state.currentSlideshowProjectId) opt.selected = true;
    el.slideshowProjectSelect.appendChild(opt);
  }
}

function applySlideshowDefaultsFromSession() {
  const w = state.camera.captureWidth || 0;
  const h = state.camera.captureHeight || 0;
  const fps = state.camera.captureFps || 0;

  if (w >= 1920 && h >= 1080) {
    el.slideshowResSelect.value = "1920x1080";
  } else if (w >= 1280 && h >= 720) {
    el.slideshowResSelect.value = "1280x720";
  }

  const roundedFps = Math.round(fps);
  if (roundedFps === 24 || roundedFps === 30 || roundedFps === 60) {
    el.slideshowFpsSelect.value = String(roundedFps);
  }

  updateSlideshowCanvasSize();
}

function getSlideshowResolution() {
  const val = el.slideshowResSelect?.value || "1280x720";
  const [w, h] = val.split("x").map(Number);
  return { width: w || 1280, height: h || 720 };
}

function getSlideshowFps() {
  return Number(el.slideshowFpsSelect?.value || 30);
}

function updateSlideshowCanvasSize() {
  const { width, height } = getSlideshowResolution();
  if (el.slideshowCanvas) {
    el.slideshowCanvas.width = width;
    el.slideshowCanvas.height = height;
    // Set CSS aspect-ratio so the preview container sizes correctly
    el.slideshowCanvas.style.aspectRatio = `${width} / ${height}`;
  }
}

function updateSlideshowDuration() {
  const duration = getSlideshowItems().length * Number(el.slideDurationSelect.value || 5);
  el.slideshowDuration.textContent = `Est. Duration: ${formatDuration(duration)}`;
}

// Slideshow image cache: source URL -> decoded HTMLImageElement
const slideshowImageCache = new Map();
const SLIDESHOW_CACHE_MAX = 6;

function evictSlideshowCache() {
  while (slideshowImageCache.size > SLIDESHOW_CACHE_MAX) {
    const firstKey = slideshowImageCache.keys().next().value;
    slideshowImageCache.delete(firstKey);
  }
}

async function getSlideshowCachedImage(src) {
  if (!src) return null;
  const cached = slideshowImageCache.get(src);
  if (cached && cached.complete && cached.naturalWidth > 0)
    return cached;
  const image = await loadImage(src);
  slideshowImageCache.set(src, image);
  evictSlideshowCache();
  return image;
}

function getSlideshowCachedImageSync(src) {
  if (!src) return null;
  const cached = slideshowImageCache.get(src);
  if (cached && cached.complete && cached.naturalWidth > 0)
    return cached;
  return null;
}

async function renderSlideshowPreview(progress = 0) {
  updateSlideshowCanvasSize();
  const canvas = el.slideshowCanvas;
  if (!canvas)
    return;
  const ctx = canvas.getContext("2d");
  const items = getSlideshowItems();
  const item = items[state.slideshowIndex % Math.max(1, items.length)];
  if (!item) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#8d93a3";
    ctx.font = "24px Helvetica";
    ctx.textAlign = "center";
    ctx.fillText("No evidence frames selected", canvas.width / 2, canvas.height / 2);
    el.slideshowStatus.textContent = "Preview stopped";
    updateSlideshowDuration();
    return;
  }
  const image = await getSlideshowCachedImage(getEvidenceImageSource(item));
  if (!image)
    return;
  // Draw image first, then overlay — never clear to black before image is ready
  const kenStart = Number(el.kenStart.value || 1);
  const kenEnd = Number(el.kenEnd.value || kenStart);
  const useKenBurns = el.motionSelect.value.includes("Ken");
  const transitionType = el.transitionSelect.value;
  const slideDurationSec = Number(el.slideDurationSelect.value || 5);
  const transitionDurationSec = Number(el.transitionDurationSelect.value || 0.75);
  const transitionPortion = Math.min(0.5, transitionDurationSec / slideDurationSec);
  const transitionStart = 1 - transitionPortion;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw current slide
  if (useKenBurns) {
    drawKenBurnsImage(ctx, canvas.width, canvas.height, image, state.slideshowIndex, progress);
  } else {
    drawImageContain(ctx, canvas.width, canvas.height, image, 1);
  }

  // Transition overlay
  if (transitionPortion > 0 && progress > transitionStart) {
    const t = Math.min(1, (progress - transitionStart) / transitionPortion);
    const nextIndex = (state.slideshowIndex + 1) % items.length;
    const nextItem = items[nextIndex];
    if (nextItem) {
      const nextImage = await getSlideshowCachedImage(getEvidenceImageSource(nextItem));
      if (nextImage) {
        ctx.save();
        const outgoingKen = useKenBurns ? { image, slideIndex: state.slideshowIndex, progress } : null;
        const incomingKen = useKenBurns ? { image: nextImage, slideIndex: nextIndex, progress: 0 } : null;
        // Redraw outgoing at current state, then apply transition to incoming
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        renderTransition(ctx, canvas.width, canvas.height, image, nextImage, transitionType, t, outgoingKen, incomingKen);
        ctx.restore();
      }
    }
  }
  if (el.watermarkEnabled.checked) {
    drawWatermark(ctx, canvas.width, canvas.height, {
      type: el.watermarkType ? el.watermarkType.value : "text",
      text: el.watermarkText.value,
      color: el.watermarkColor ? el.watermarkColor.value : "#ffffff",
      image: (el.watermarkType && el.watermarkType.value === "image") ? state.watermarkImage.image : null,
      opacity: Number(el.watermarkOpacity.value || 0.5),
      size: Number(el.watermarkSize.value || 1),
      position: el.watermarkPosition.value,
    });
  }
  el.slideshowStatus.textContent = state.slideshowPlaying
    ? `Playing slide ${state.slideshowIndex + 1} / ${items.length}`
    : "Preview stopped";
  updateSlideshowDuration();
}

function playSlideshow() {
  const items = getSlideshowItems();
  if (items.length === 0)
    return;
  stopSlideshow();
  state.slideshowPlaying = true;
  const slideMs = Number(el.slideDurationSelect.value || 5) * 1000;
  let lastAdvanceTime = performance.now();

  // Assign random Ken Burns motions for this playback session
  const kenStart = Number(el.kenStart.value || 1);
  const kenEnd = Number(el.kenEnd.value || kenStart);
  if (el.motionSelect.value.includes("Ken")) {
    assignKenBurnsMotions(items.length, kenStart, kenEnd);
  }

  // Pre-cache first slide image
  const firstSrc = getEvidenceImageSource(items[state.slideshowIndex % items.length]);
  getSlideshowCachedImage(firstSrc);

  function tick() {
    if (!state.slideshowPlaying) return;
    const now = performance.now();
    const elapsed = now - lastAdvanceTime;
    if (elapsed >= slideMs) {
      state.slideshowIndex = (state.slideshowIndex + 1) % items.length;
      lastAdvanceTime = now;
      // Pre-cache next slide
      const nextIndex = (state.slideshowIndex + 1) % items.length;
      const nextSrc = getEvidenceImageSource(items[nextIndex]);
      getSlideshowCachedImage(nextSrc);
    }
    const progress = Math.min(1, (now - lastAdvanceTime) / slideMs);
    renderSlideshowPreview(progress);
    state.slideshowRafId = requestAnimationFrame(tick);
  }
  state.slideshowRafId = requestAnimationFrame(tick);
}

function stopSlideshow() {
  state.slideshowPlaying = false;
  if (state.slideshowRafId) {
    cancelAnimationFrame(state.slideshowRafId);
    state.slideshowRafId = null;
  }
  if (state.slideshowTimer) {
    clearInterval(state.slideshowTimer);
    state.slideshowTimer = null;
  }
  renderSlideshowPreview();
}

function previewTransition() {
  const items = getSlideshowItems();
  state.slideshowIndex = Math.min(state.slideshowIndex + 1, Math.max(0, items.length - 1));
  // Pre-cache current and next for smooth preview
  const currentSrc = getEvidenceImageSource(items[state.slideshowIndex]);
  const nextIdx = Math.min(state.slideshowIndex + 1, items.length - 1);
  const nextSrc = getEvidenceImageSource(items[nextIdx]);
  Promise.all([getSlideshowCachedImage(currentSrc), getSlideshowCachedImage(nextSrc)]).then(() => {
    renderSlideshowPreview(0.85);
  });
}

let slideshowExporting = false;

async function exportSlideshowVideo() {
  if (slideshowExporting) {
    window.alert("A slideshow export is already in progress.");
    return;
  }

  const items = getSlideshowItems();
  if (items.length === 0) {
    window.alert("No evidence frames selected for the slideshow.");
    return;
  }
  if (typeof MediaRecorder !== "function" || !el.slideshowCanvas.captureStream) {
    window.alert("This browser cannot record the slideshow canvas. Try Chrome, Edge, or Safari.");
    return;
  }

  // Auto-save project before export
  if (state.session?.id) {
    await handleSaveSlideshowProject();
  }

  stopSlideshow();
  const mimeType = chooseVideoMimeType();
  if (!mimeType) {
    window.alert("This browser does not expose a supported slideshow video encoder.");
    return;
  }

  // Assign random Ken Burns motions for this export
  const kenStart = Number(el.kenStart.value || 1);
  const kenEnd = Number(el.kenEnd.value || kenStart);
  if (el.motionSelect.value.includes("Ken")) {
    assignKenBurnsMotions(items.length, kenStart, kenEnd);
  }

  slideshowExporting = true;
  const extension = mimeType.includes("mp4") ? "mp4" : "webm";
  const chunks = [];
  const fps = getSlideshowFps();
  const slideSeconds = Number(el.slideDurationSelect.value || 5);
  const totalFrames = Math.max(1, Math.round(items.length * slideSeconds * fps));

  const stream = el.slideshowCanvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 8_000_000 });
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0)
      chunks.push(event.data);
  };

  const done = new Promise((resolve) => {
    recorder.onstop = resolve;
  });

  el.exportSlideshowBtn.disabled = true;
  el.exportSlideshowBtn.textContent = "EXPORTING...";
  el.slideshowStatus.textContent = "Creating Slideshow...";

  try {
    recorder.start(250);

    await renderSlideshowTimeline(items, fps, (frameNumber, slideIndex) => {
      const pct = Math.round((frameNumber / totalFrames) * 100);
      el.slideshowStatus.textContent = `Rendering slide ${slideIndex + 1} of ${items.length} (${pct}%)`;
      if (el.slideshowProgressFill) {
        el.slideshowProgressFill.style.width = `${pct}%`;
      }
    });

    el.slideshowStatus.textContent = "Encoding MP4...";
    if (el.slideshowProgressFill) el.slideshowProgressFill.style.width = "100%";

    recorder.stop();
    await done;

    stream.getTracks().forEach((track) => track.stop());
    const blob = new Blob(chunks, { type: mimeType });

    if (blob.size === 0) {
      throw new Error("Slideshow export produced a zero-byte file.");
    }

    // Download user copy
    if (state.slideshowExportUrl)
      URL.revokeObjectURL(state.slideshowExportUrl);
    state.slideshowExportUrl = URL.createObjectURL(blob);
    downloadDataUrl(state.slideshowExportUrl, `${safeName(el.slideshowName.value || state.session.name || "slideshow")}.${extension}`);

    // Persist to session
    el.slideshowStatus.textContent = "Saving slideshow to session...";
    const slideshowRecord = {
      id: crypto.randomUUID(),
      sessionId: state.session?.id || '',
      projectId: state.currentSlideshowProjectId || '',
      title: el.slideshowName.value || state.session?.name || "Slideshow",
      fileName: `${safeName(el.slideshowName.value || state.session?.name || "slideshow")}.${extension}`,
      mimeType,
      size: blob.size,
      createdAt: new Date().toISOString(),
      slideCount: items.length,
      resolution: el.slideshowResSelect?.value || "1280x720",
      fps,
      transition: el.transitionSelect?.value || "Cross Fade",
      motionMode: el.motionSelect?.value || "Still",
      duration: items.length * slideSeconds,
      blob,
    };
    await persistSlideshowToDB(slideshowRecord);

    // Update slideshow count in sessions array
    const sessionIdx = state.sessions.findIndex(s => s.id === state.session?.id);
    if (sessionIdx >= 0) {
      state.sessions[sessionIdx].slideshowCount = (state.sessions[sessionIdx].slideshowCount || 0) + 1;
    }

    el.slideshowStatus.textContent = "Slideshow saved. MP4 slideshow exported.";
    el.exportSlideshowBtn.disabled = false;
    el.exportSlideshowBtn.textContent = "Export MP4";
    el.showSlideshowFolderBtn.disabled = false;

    // Refresh library if visible
    renderSessionSurfaces();

  } catch (error) {
    console.error("Slideshow export failed:", error);
    el.slideshowStatus.textContent = `Slideshow export failed: ${error.message}`;
    el.exportSlideshowBtn.disabled = false;
    el.exportSlideshowBtn.textContent = "Export MP4";
    stream.getTracks().forEach((track) => track.stop());
  } finally {
    slideshowExporting = false;
    if (el.slideshowProgressFill) {
      el.slideshowProgressFill.style.width = "0%";
    }
  }
}

function chooseVideoMimeType() {
  const types = [
    'video/mp4;codecs="avc1.42E01E"',
    "video/mp4",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  return types.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

async function renderSlideshowTimeline(items, fps, onProgress) {
  const slideSeconds = Number(el.slideDurationSelect.value || 5);
  const transitionSeconds = Number(el.transitionDurationSelect.value || 0.75);
  const totalFrames = Math.max(1, Math.round(items.length * slideSeconds * fps));
  for (let frameNumber = 0; frameNumber < totalFrames; frameNumber += 1) {
    const seconds = frameNumber / fps;
    const slideIndex = Math.min(items.length - 1, Math.floor(seconds / slideSeconds));
    const slideProgress = (seconds % slideSeconds) / slideSeconds;
    state.slideshowIndex = slideIndex;
    await drawSlideshowFrame(items, slideIndex, slideProgress, transitionSeconds / slideSeconds);
    if (onProgress) onProgress(frameNumber, slideIndex);
    await delay(1000 / fps);
  }
}

async function drawSlideshowFrame(items, slideIndex, progress, transitionPortion) {
  const canvas = el.slideshowCanvas;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const current = items[slideIndex];
  if (!current)
    return;
  const currentImage = await getSlideshowCachedImage(getEvidenceImageSource(current));
  if (!currentImage) return;
  const kenStart = Number(el.kenStart.value || 1);
  const kenEnd = Number(el.kenEnd.value || kenStart);
  const useKenBurns = el.motionSelect.value.includes("Ken");
  if (useKenBurns) {
    drawKenBurnsImage(ctx, canvas.width, canvas.height, currentImage, slideIndex, progress);
  } else {
    drawImageContain(ctx, canvas.width, canvas.height, currentImage, 1);
  }

  const transition = el.transitionSelect.value;
  const next = items[Math.min(items.length - 1, slideIndex + 1)];
  if (next && transitionPortion > 0 && progress > 1 - transitionPortion) {
    const transitionProgress = (progress - (1 - transitionPortion)) / transitionPortion;
    await drawTransitionOverlay(ctx, canvas.width, canvas.height, next, transition, transitionProgress, currentImage, slideIndex, useKenBurns);
  }

  if (el.watermarkEnabled.checked) {
    drawWatermark(ctx, canvas.width, canvas.height, {
      type: el.watermarkType ? el.watermarkType.value : "text",
      text: el.watermarkText.value,
      color: el.watermarkColor ? el.watermarkColor.value : "#ffffff",
      image: (el.watermarkType && el.watermarkType.value === "image") ? state.watermarkImage.image : null,
      opacity: Number(el.watermarkOpacity.value || 0.5),
      size: Number(el.watermarkSize.value || 1),
      position: el.watermarkPosition.value,
    });
  }
}

async function drawTransitionOverlay(ctx, canvasW, canvasH, nextItem, transition, progress, currentImage, slideIndex, useKenBurns) {
  const nextImage = await getSlideshowCachedImage(getEvidenceImageSource(nextItem));
  if (!nextImage) return;
  ctx.save();
  const outgoingKen = useKenBurns && currentImage ? { image: currentImage, slideIndex, progress: 1 } : null;
  const nextIndex = getSlideshowItems().indexOf(nextItem);
  const incomingKen = useKenBurns ? { image: nextImage, slideIndex: nextIndex >= 0 ? nextIndex : 0, progress: 0 } : null;
  // Redraw outgoing, then apply transition
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvasW, canvasH);
  renderTransition(ctx, canvasW, canvasH, currentImage, nextImage, transition, progress, outgoingKen, incomingKen);
  ctx.restore();
}

function drawImageContain(ctx, canvasW, canvasH, image, scaleBoost = 1) {
  const baseScale = Math.min(canvasW / image.naturalWidth, canvasH / image.naturalHeight) * scaleBoost;
  const drawW = image.naturalWidth * baseScale;
  const drawH = image.naturalHeight * baseScale;
  const x = (canvasW - drawW) / 2;
  const y = (canvasH - drawH) / 2;
  ctx.drawImage(image, x, y, drawW, drawH);
}

// --- Stable dissolve hash (matches Mac reference: deterministic per pixel, per transition) ---
function dissolveHash(x, y, frameSalt) {
  let v = (x * 374761393 + y * 668265263 + frameSalt * 2246822519) | 0;
  v = ((v ^ (v >>> 13)) * 1274126177) | 0;
  return ((v ^ (v >>> 16)) >>> 0) & 0xffff;
}

/**
 * Unified transition renderer — shared by preview and export.
 * Draws the transition between outgoing (already on canvas) and incoming image.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} canvasW
 * @param {number} canvasH
 * @param {Image} outgoingImage - current slide image (already drawn or to be drawn)
 * @param {Image} incomingImage - next slide image
 * @param {string} transitionType - transition name from UI
 * @param {number} t - transition progress 0..1
 * @param {object} [outgoingKen] - { image, slideIndex, progress } for outgoing Ken Burns (optional)
 * @param {object} [incomingKen] - { image, slideIndex, progress } for incoming Ken Burns (optional)
 */
function renderTransition(ctx, canvasW, canvasH, outgoingImage, incomingImage, transitionType, t, outgoingKen, incomingKen) {
  t = Math.max(0, Math.min(1, t));

  const drawOutgoing = () => {
    if (outgoingKen) {
      drawKenBurnsImage(ctx, canvasW, canvasH, outgoingKen.image, outgoingKen.slideIndex, outgoingKen.progress);
    } else {
      drawImageContain(ctx, canvasW, canvasH, outgoingImage, 1);
    }
  };

  const drawIncoming = () => {
    if (incomingKen) {
      drawKenBurnsImage(ctx, canvasW, canvasH, incomingKen.image, incomingKen.slideIndex, incomingKen.progress);
    } else {
      drawImageContain(ctx, canvasW, canvasH, incomingImage, 1);
    }
  };

  if (transitionType === "Cross Fade" || transitionType === "Crossfade") {
    // Crossfade: true overlapping blend, both images visible simultaneously
    drawOutgoing();
    ctx.globalAlpha = t;
    drawIncoming();
    ctx.globalAlpha = 1;
  }
  else if (transitionType === "Fade In / Out" || transitionType === "Fade Through Black") {
    // Fade In / Out: outgoing fades out, then incoming fades in
    // First half: outgoing visible, fading out
    // Second half: incoming fades in
    // Canvas background (black) is naturally visible at midpoint
    if (t < 0.5) {
      const fadeOut = 1 - t * 2; // 1 → 0
      ctx.globalAlpha = fadeOut;
      drawOutgoing();
      ctx.globalAlpha = 1;
    } else {
      const fadeIn = (t - 0.5) * 2; // 0 → 1
      ctx.globalAlpha = fadeIn;
      drawIncoming();
      ctx.globalAlpha = 1;
    }
  }
  else if (transitionType === "Dissolve") {
    // Dissolve: stable per-pixel noise threshold — pixels transition at different times
    drawOutgoing();

    // Use OffscreenCanvas for pixel manipulation
    const offscreen = new OffscreenCanvas(canvasW, canvasH);
    const offCtx = offscreen.getContext("2d");
    offCtx.drawImage(ctx.canvas, 0, 0);
    const imageData = offCtx.getImageData(0, 0, canvasW, canvasH);
    const pixels = imageData.data;

    // Draw incoming to a temp canvas to get its pixel data
    const incomingCanvas = new OffscreenCanvas(canvasW, canvasH);
    const incCtx = incomingCanvas.getContext("2d");
    drawIncoming.call({ canvas: { getContext: () => incCtx } });
    // Actually we need to draw incoming on a real canvas context
    // Simpler approach: draw incoming to offscreen, then composite
    offCtx.clearRect(0, 0, canvasW, canvasH);
    drawOutgoing.call({ canvas: { getContext: () => offCtx } });
    // This approach is getting complex. Let's use the simpler canvas compositing approach.

    // Simpler approach: use two canvases and composite with pixel data
    // Actually, for canvas API, we can use a different approach:
    // Create a temp canvas with the incoming image, then composite pixel-by-pixel
    const tempCanvas = new OffscreenCanvas(canvasW, canvasH);
    const tempCtx = tempCanvas.getContext("2d");
    // Draw outgoing to main canvas (already done above)
    // Draw incoming to temp canvas
    if (incomingKen) {
      drawKenBurnsImage(tempCtx, canvasW, canvasH, incomingKen.image, incomingKen.slideIndex, incomingKen.progress);
    } else {
      drawImageContain(tempCtx, canvasW, canvasH, incomingImage, 1);
    }

    // Get pixel data from both
    const outgoingData = ctx.getImageData(0, 0, canvasW, canvasH);
    const incomingData = tempCtx.getImageData(0, 0, canvasW, canvasH);
    const out = outgoingData.data;
    const inc = incomingData.data;
    const result = ctx.createImageData(canvasW, canvasH);
    const dst = result.data;

    // Stable dissolve: use deterministic hash, threshold progresses with t
    for (let y = 0; y < canvasH; y++) {
      for (let x = 0; x < canvasW; x++) {
        const i = (y * canvasW + x) * 4;
        const threshold = dissolveHash(x, y, 17) / 65535;
        const useIncoming = threshold < t;
        const src = useIncoming ? inc : out;
        dst[i] = src[i];
        dst[i + 1] = src[i + 1];
        dst[i + 2] = src[i + 2];
        dst[i + 3] = src[i + 3];
      }
    }
    ctx.putImageData(result, 0, 0);
  }
  else if (transitionType === "Horizontal Wipe") {
    // Wipe: reveal incoming image from left to right using clip
    drawOutgoing();
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, canvasW * t, canvasH);
    ctx.clip();
    drawIncoming();
    ctx.restore();
  }
  else if (transitionType === "Vertical Wipe") {
    // Wipe: reveal incoming image from top to bottom using clip
    drawOutgoing();
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, canvasW, canvasH * t);
    ctx.clip();
    drawIncoming();
    ctx.restore();
  }
  else {
    // Fallback: Crossfade behavior for any unrecognized transition
    drawOutgoing();
    ctx.globalAlpha = t;
    drawIncoming();
    ctx.globalAlpha = 1;
  }
}

// Ken Burns motion patterns: pan start/end as fractions of max pan range
// Each pattern defines directional movement; zoom variation is applied separately
const KEN_BURNS_PATTERNS = [
  // Diagonals
  { sx: 0, sy: 0, ex: 1, ey: 1, label: "TL→BR" },
  { sx: 1, sy: 0, ex: 0, ey: 1, label: "TR→BL" },
  { sx: 0, sy: 1, ex: 1, ey: 0, label: "BL→TR" },
  { sx: 1, sy: 1, ex: 0, ey: 0, label: "BR→TL" },
  // Horizontals
  { sx: 0, sy: 0.5, ex: 1, ey: 0.5, label: "L→R" },
  { sx: 1, sy: 0.5, ex: 0, ey: 0.5, label: "R→L" },
  // Verticals
  { sx: 0.5, sy: 0, ex: 0.5, ey: 1, label: "T→B" },
  { sx: 0.5, sy: 1, ex: 0.5, ey: 0, label: "B→T" },
  // Corner to center variants
  { sx: 0, sy: 0, ex: 0.5, ey: 0.5, label: "TL→C" },
  { sx: 1, sy: 1, ex: 0.5, ey: 0.5, label: "BR→C" },
  { sx: 0.5, sy: 0.5, ex: 1, ey: 0, label: "C→TR" },
  { sx: 0.5, sy: 0.5, ex: 0, ey: 1, label: "C→BL" },
];

// Per-slide Ken Burns motion assignments: { patternIndex, startZoom, endZoom }
// Populated when slideshow playback or export begins.
const kbMotionMap = new Map();

/**
 * Assign a random Ken Burns motion pattern to each slide.
 * - No two consecutive slides share the same pattern.
 * - Each slide gets its own zoom direction (zoom-in or zoom-out).
 * - Called once when playback/export starts; assignments remain stable per slide.
 */
function assignKenBurnsMotions(slideCount, kenStart, kenEnd) {
  kbMotionMap.clear();
  if (slideCount === 0) return;

  const patternCount = KEN_BURNS_PATTERNS.length;
  let prevPattern = -1;

  for (let i = 0; i < slideCount; i++) {
    // Pick a random pattern different from the previous slide
    let pat;
    if (patternCount < 2) {
      pat = 0;
    } else {
      do {
        pat = Math.floor(Math.random() * patternCount);
      } while (pat === prevPattern);
    }
    prevPattern = pat;

    // Randomize zoom direction: some slides zoom in, some zoom out
    // Use kenStart/kenEnd as the range but allow reversal
    const zoomIn = Math.random() < 0.6; // 60% zoom-in, 40% zoom-out for variety
    let startZoom, endZoom;
    if (zoomIn) {
      startZoom = Math.max(1, kenStart);
      endZoom = Math.max(startZoom + 0.01, kenEnd);
    } else {
      // Zoom out: start at the higher zoom, end at lower
      startZoom = Math.max(1, kenEnd);
      endZoom = Math.max(1, kenStart);
      if (startZoom === endZoom) {
        startZoom = endZoom + 0.15;
      }
    }

    kbMotionMap.set(i, { patternIndex: pat, startZoom, endZoom });
  }
}

/**
 * Retrieve the stable Ken Burns motion parameters for a given slide index.
 * Returns { pattern, startZoom, endZoom }.
 */
function getKenBurnsMotion(slideIndex) {
  let motion = kbMotionMap.get(slideIndex);
  if (!motion) {
    // Fallback for slides not yet assigned (shouldn't happen if assignKenBurnsMotions was called)
    const pat = slideIndex % KEN_BURNS_PATTERNS.length;
    motion = { patternIndex: pat, startZoom: 1, endZoom: 1.22 };
    kbMotionMap.set(slideIndex, motion);
  }
  return {
    pattern: KEN_BURNS_PATTERNS[motion.patternIndex],
    startZoom: motion.startZoom,
    endZoom: motion.endZoom,
  };
}

function drawKenBurnsImage(ctx, canvasW, canvasH, image, slideIndex, progress) {
  const imgW = image.naturalWidth;
  const imgH = image.naturalHeight;
  if (imgW <= 0 || imgH <= 0) return;

  const motion = getKenBurnsMotion(slideIndex);
  const pattern = motion.pattern;

  // Calculate zoom at this progress point using per-slide zoom range
  const zoom = motion.startZoom + (motion.endZoom - motion.startZoom) * progress;

  // Base scale to cover canvas (fill, not contain)
  const baseScale = Math.max(canvasW / imgW, canvasH / imgH);
  const scaledW = imgW * baseScale * zoom;
  const scaledH = imgH * baseScale * zoom;

  // How much extra we have to pan with
  const extraW = scaledW - canvasW;
  const extraH = scaledH - canvasH;

  // Interpolate pan position
  const panFractionX = pattern.sx + (pattern.ex - pattern.sx) * progress;
  const panFractionY = pattern.sy + (pattern.ey - pattern.sy) * progress;

  // Calculate draw position (panning within the overscan)
  const x = -extraW * panFractionX;
  const y = -extraH * panFractionY;

  ctx.drawImage(image, x, y, scaledW, scaledH);
}

function drawWatermark(ctx, canvasW, canvasH, settings) {
  const margin = 28;
  ctx.save();
  ctx.globalAlpha = settings.opacity ?? 0.5;

  if (settings.type === "image" && settings.image) {
    // Image watermark
    const img = settings.image;
    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;
    if (imgW <= 0 || imgH <= 0) { ctx.restore(); return; }

    const baseSize = Math.round(80 * (settings.size || 1));
    const scale = baseSize / Math.max(imgW, imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;

    let x = canvasW - margin - drawW;
    let y = canvasH - margin - drawH;
    if (settings.position === "Bottom Left") {
      x = margin;
      y = canvasH - margin - drawH;
    } else if (settings.position === "Top Right") {
      x = canvasW - margin - drawW;
      y = margin;
    } else if (settings.position === "Top Left") {
      x = margin;
      y = margin;
    } else if (settings.position === "Center") {
      x = (canvasW - drawW) / 2;
      y = (canvasH - drawH) / 2;
    }
    ctx.drawImage(img, x, y, drawW, drawH);
  } else {
    // Text watermark
    const text = settings.text || "";
    if (!text) { ctx.restore(); return; }
    const fontSize = Math.round(24 * (settings.size || 1));
    ctx.font = `700 ${fontSize}px Helvetica`;
    ctx.fillStyle = settings.color || "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.85)";
    ctx.shadowBlur = 8;
    ctx.textBaseline = "bottom";
    let x = canvasW - margin;
    let y = canvasH - margin;
    ctx.textAlign = "right";
    if (settings.position === "Bottom Left") {
      x = margin;
      ctx.textAlign = "left";
    } else if (settings.position === "Top Right") {
      y = margin + fontSize;
    } else if (settings.position === "Top Left") {
      x = margin;
      y = margin + fontSize;
      ctx.textAlign = "left";
    } else if (settings.position === "Center") {
      x = canvasW / 2;
      y = canvasH / 2;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
    }
    ctx.fillText(text, x, y);
  }
  ctx.restore();
}

function formatDuration(seconds) {
  const total = Math.round(seconds || 0);
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return `00:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function effectLabel(id) {
  const preset = findEffectPreset(id);
  if (preset)
    return preset.group && preset.group !== "General" ? `${preset.group}: ${preset.label}` : preset.label;
  const legacy = {
    normal: "Normal",
    mono: "Monochrome",
    contrast: "High Contrast",
    negative: "Negative",
    edge: "Edge",
    gain: "High Gain",
    vignette: "Soft Vignette",
    vintage: "Vintage Contrast",
    night: "Night Vision",
    thermal: "Thermal Style",
    xray: "X-Ray Style",
    glow: "Screen Glow",
  };
  return legacy[id] || "Normal";
}

function effectBase(id) {
  const preset = findEffectPreset(id);
  if (!preset)
    return "normal";
  const hasLayers = Array.isArray(preset.layers) && preset.layers.length > 0;
  return hasLayers || preset.lut ? preset.id : "normal";
}

function findEffectPreset(id) {
  const normalized = normalizeEffectId(id);
  return effects.find((effect) => effect.id === normalized) || effects.find((effect) => effect.id === "general-normal") || null;
}

function normalizeEffectId(id) {
  if (effects.some((effect) => effect.id === id))
    return id;
  const legacy = {
    normal: "general-normal",
    mono: "general-monochrome",
    contrast: "general-high-contrast",
    negative: "general-negative",
    edge: "general-edge",
    gain: "general-high-gain",
    vignette: "general-soft-vignette",
    vintage: "general-vintage-contrast",
    night: "general-night-vision",
    thermal: "general-thermal-style",
    xray: "general-x-ray-style",
    glow: "general-screen-glow",
  };
  return legacy[id] || "general-normal";
}

function showPanel(panel) {
  if (panel !== "slideshow")
    stopSlideshow();
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.panel === panel);
  });
  document.querySelectorAll(".drawer").forEach((drawer) => {
    drawer.hidden = drawer.dataset.view !== panel;
  });
  if (panel === "analysis") {
    document.querySelectorAll(".drawer").forEach((drawer) => {
      drawer.hidden = true;
    });
    // Default to frames view when switching to analysis
    switchAnalysisView("frames");
    // Re-render the canvas when switching to analysis to ensure it reflects current state
    updateUI();
    render();
  }
  if (panel === "slideshow") {
    if (!hasActiveSession()) {
      showSessionRequiredMessage("Slideshow");
      return;
    }
    if (state.slideshowSelected.size === 0)
      state.slideshowSelected = new Set(state.evidence.map((item) => item.id));
    renderSlideshowFrameGrid();
    renderSlideshowPreview();
    // If no current project, prompt for name
    if (!state.currentSlideshowProjectId) {
      openSlideshowProjectDialog();
    }
  } else if (panel === "export") {
    if (!hasActiveSession()) {
      showSessionRequiredMessage("Export");
      return;
    }
    renderExportPageSummary();
  } else if (panel === "library" || panel === "camera") {
    renderSessionSurfaces();
    if (panel === "camera") {
      updateCameraStartupOverlay();
    }
  } else if (panel === "frames") {
    if (!hasActiveSession()) {
      showSessionRequiredMessage("Frames");
      return;
    }
    renderFramesGrid();
  } else if (panel === "settings") {
    updateSettingsDiagnostics();
  } else if (panel === "evidence") {
    if (!hasActiveSession()) {
      showSessionRequiredMessage("Evidence");
      return;
    }
  }
}

function showSessionRequiredMessage(featureName) {
  window.alert(`Create or restore a session before using ${featureName}.`);
  showPanel("camera");
}
