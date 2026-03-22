// Alchemy recipes — crafting potions and special items from ingredients
// Inspired by Full Metal Alchemist: equivalent exchange governs all transmutation.

export type AlchemyType =
  | "brewing"        // traditional potion brewing
  | "transmutation"  // FMA-style: convert one material to another (equivalent exchange)
  | "deconstruction" // break down complex items into components
  | "reconstruction" // rebuild deconstructed materials into new forms
  | "combat"         // instantaneous battle alchemy (thrown/placed)
  | "body_alchemy"   // enhancement of the alchemist's own body (dangerous)
  | "circle_alchemy" // requires drawing a transmutation circle (powerful but slow)

export type AlchemyRecipe = {
  id: string
  name: string
  description: string
  alchemyType: AlchemyType
  ingredients: Record<string, number>  // itemId → quantity required
  output: string                        // item id produced
  outputQty: number
  requiredAlchemyLevel: number          // 0 = no skill required
  value: number                         // gold value of crafted item
  brewTime: number                      // in ticks
}

export const RECIPES: Record<string, AlchemyRecipe> = {

  // ── Brewing (traditional) ──────────────────────────────────────────────────
  brew_health_potion: {
    id: "brew_health_potion",
    name: "Heiltrank brauen",
    description: "Verarbeitet rotes Kraut zu einem Heiltrank.",
    alchemyType: "brewing",
    ingredients: { red_herb: 2 },
    output: "health_potion",
    outputQty: 1,
    requiredAlchemyLevel: 0,
    value: 15,
    brewTime: 5
  },
  brew_greater_health_potion: {
    id: "brew_greater_health_potion",
    name: "Großen Heiltrank brauen",
    description: "Benötigt mehrere Kräuter und einen Kristall.",
    alchemyType: "brewing",
    ingredients: { red_herb: 4, cave_crystal: 1 },
    output: "greater_health_potion",
    outputQty: 1,
    requiredAlchemyLevel: 3,
    value: 50,
    brewTime: 10
  },
  brew_mana_potion: {
    id: "brew_mana_potion",
    name: "Manatrank brauen",
    description: "Blaupilze enthalten natürliche mana-haltige Substanzen.",
    alchemyType: "brewing",
    ingredients: { blue_mushroom: 2 },
    output: "mana_potion",
    outputQty: 1,
    requiredAlchemyLevel: 0,
    value: 20,
    brewTime: 5
  },
  brew_greater_mana_potion: {
    id: "brew_greater_mana_potion",
    name: "Großen Manatrank brauen",
    description: "Hochkonzentrierter Manatrank aus seltenen Zutaten.",
    alchemyType: "brewing",
    ingredients: { blue_mushroom: 4, cave_crystal: 1 },
    output: "greater_mana_potion",
    outputQty: 1,
    requiredAlchemyLevel: 3,
    value: 60,
    brewTime: 10
  },
  brew_antidote: {
    id: "brew_antidote",
    name: "Antidot brauen",
    description: "Nachtschatten entgiftet sich selbst im richtigen Verhältnis.",
    alchemyType: "brewing",
    ingredients: { nightshade: 1, red_herb: 1 },
    output: "antidote",
    outputQty: 2,
    requiredAlchemyLevel: 1,
    value: 10,
    brewTime: 5
  },
  brew_strength_potion: {
    id: "brew_strength_potion",
    name: "Stärketrank brauen",
    description: "Feueressenz verleiht temporäre Stärke.",
    alchemyType: "brewing",
    ingredients: { fire_essence: 1, red_herb: 2 },
    output: "strength_potion",
    outputQty: 1,
    requiredAlchemyLevel: 4,
    value: 40,
    brewTime: 8
  },
  brew_smoke_bomb: {
    id: "brew_smoke_bomb",
    name: "Rauchbombe bauen",
    description: "Geisterstaub und Nachtschatten ergeben eine wirksame Rauchwolke.",
    alchemyType: "brewing",
    ingredients: { spirit_dust: 1, nightshade: 1 },
    output: "smoke_bomb",
    outputQty: 2,
    requiredAlchemyLevel: 2,
    value: 12,
    brewTime: 6
  },
  brew_elixir_of_mending: {
    id: "brew_elixir_of_mending",
    name: "Elixier der Wundheilung brauen",
    description: "Heilkräuter, Kristall und Quellwasser verschmelzen zu einem Elixier, das Wunden langsam aber stetig schließt.",
    alchemyType: "brewing",
    ingredients: { red_herb: 3, cave_crystal: 1, spring_water: 2 },
    output: "elixir_of_mending",
    outputQty: 1,
    requiredAlchemyLevel: 5,
    value: 75,
    brewTime: 12
  },
  brew_swiftness_potion: {
    id: "brew_swiftness_potion",
    name: "Schnelligkeitstrank brauen",
    description: "Windessenz und Blaupilz verleihen dem Trinker flüchtige Schnelligkeit.",
    alchemyType: "brewing",
    ingredients: { wind_essence: 1, blue_mushroom: 1 },
    output: "swiftness_potion",
    outputQty: 1,
    requiredAlchemyLevel: 3,
    value: 35,
    brewTime: 7
  },
  brew_invisibility_draught: {
    id: "brew_invisibility_draught",
    name: "Unsichtbarkeitstrank brauen",
    description: "Nachtschatten, Geisterstaub und Höhlenkristall verbinden sich zu einem Trank, der den Trinker im Schatten verschwinden lässt.",
    alchemyType: "brewing",
    ingredients: { nightshade: 2, spirit_dust: 2, cave_crystal: 1 },
    output: "invisibility_draught",
    outputQty: 1,
    requiredAlchemyLevel: 7,
    value: 120,
    brewTime: 15
  },
  brew_giant_strength: {
    id: "brew_giant_strength",
    name: "Riesenstärketrank brauen",
    description: "Feueressenz und Heilkräuter mit Eisenstaub ergeben einen Trank, der die Stärke eines Riesen verleiht — für kurze Zeit.",
    alchemyType: "brewing",
    ingredients: { fire_essence: 2, red_herb: 4, iron_dust: 1 },
    output: "giant_strength_potion",
    outputQty: 1,
    requiredAlchemyLevel: 8,
    value: 100,
    brewTime: 14
  },
  brew_poison: {
    id: "brew_poison",
    name: "Waffengift brauen",
    description: "Nachtschatten und Säuredrüsen ergeben ein potentes Kontaktgift zum Beschichten von Klingen.",
    alchemyType: "brewing",
    ingredients: { nightshade: 3, acid_gland: 1 },
    output: "weapon_poison",
    outputQty: 3,
    requiredAlchemyLevel: 2,
    value: 18,
    brewTime: 6
  },
  brew_truth_serum: {
    id: "brew_truth_serum",
    name: "Wahrheitsserum brauen",
    description: "Seltene Veilchen und reines Quellwasser erzwingen in Gesprächen unfreiwillige Aufrichtigkeit.",
    alchemyType: "brewing",
    ingredients: { rare_violet: 2, spring_water: 1 },
    output: "truth_serum",
    outputQty: 1,
    requiredAlchemyLevel: 6,
    value: 90,
    brewTime: 10
  },
  brew_philosopher_elixir: {
    id: "brew_philosopher_elixir",
    name: "Philosophen-Elixier brauen",
    description: "Das ultimative Destillat — ein Stein der Weisen aufgelöst in reinem Wasser ergibt ein Elixier jenseits allen Verständnisses.",
    alchemyType: "brewing",
    ingredients: { philosopher_stone_fragment: 1, pure_water: 1 },
    output: "philosophers_elixir",
    outputQty: 1,
    requiredAlchemyLevel: 18,
    value: 5000,
    brewTime: 25
  },

  // ── Transmutation (FMA: äquivalenter Tausch) ───────────────────────────────
  transmute_iron_to_steel: {
    id: "transmute_iron_to_steel",
    name: "Eisen zu Stahl transmutieren",
    description: "Drei Eisenerze werden durch alkemische Transmutation zu einem Stahlbarren verdichtet — äquivalenter Tausch in Reinform.",
    alchemyType: "transmutation",
    ingredients: { iron_ore: 3 },
    output: "steel_ingot",
    outputQty: 1,
    requiredAlchemyLevel: 5,
    value: 45,
    brewTime: 10
  },
  transmute_stone_to_crystal: {
    id: "transmute_stone_to_crystal",
    name: "Stein zu Kristall transmutieren",
    description: "Höhlenstein und Geisterstaub verschmelzen durch Transmutationsmagie zu einem reinen Höhlenkristall.",
    alchemyType: "transmutation",
    ingredients: { cave_stone: 5, spirit_dust: 1 },
    output: "cave_crystal",
    outputQty: 1,
    requiredAlchemyLevel: 4,
    value: 55,
    brewTime: 12
  },
  transmute_wood_to_coal: {
    id: "transmute_wood_to_coal",
    name: "Holz zu Kohle transmutieren",
    description: "Trockenes Holz wird durch beschleunigten alchemistischen Zerfall in Kohle umgewandelt.",
    alchemyType: "transmutation",
    ingredients: { dry_wood: 4 },
    output: "coal_chunk",
    outputQty: 2,
    requiredAlchemyLevel: 2,
    value: 8,
    brewTime: 6
  },
  transmute_base_to_gold: {
    id: "transmute_base_to_gold",
    name: "Eisenerz zu Gold transmutieren",
    description: "Mit einem Stein-der-Weisen-Fragment lässt sich die Grundsubstanz von Eisen in Gold umschreiben — der heilige Gral der Transmutation.",
    alchemyType: "transmutation",
    ingredients: { iron_ore: 10, philosopher_stone_fragment: 1 },
    output: "gold_nugget",
    outputQty: 1,
    requiredAlchemyLevel: 15,
    value: 800,
    brewTime: 30
  },

  // ── Deconstruction (Zerlegung) ─────────────────────────────────────────────
  deconstruct_armor: {
    id: "deconstruct_armor",
    name: "Rüstung zerlegen",
    description: "Beschädigte Rüstungen werden alchemistisch zerlegt und liefern Rohmaterialien zurück.",
    alchemyType: "deconstruction",
    ingredients: { damaged_armor: 1 },
    output: "iron_ore",
    outputQty: 3,
    requiredAlchemyLevel: 3,
    value: 20,
    brewTime: 8
  },
  deconstruct_weapon: {
    id: "deconstruct_weapon",
    name: "Zerbrochenes Schwert zerlegen",
    description: "Ein zerbrochenes Schwert wird in seine Grundbestandteile aufgelöst.",
    alchemyType: "deconstruction",
    ingredients: { broken_sword: 1 },
    output: "iron_ore",
    outputQty: 2,
    requiredAlchemyLevel: 2,
    value: 12,
    brewTime: 6
  },
  deconstruct_potion: {
    id: "deconstruct_potion",
    name: "Leeres Fläschchen zerlegen",
    description: "Glasfläschchen werden zu feinstem Glasstaub gemahlen — nützlich für viele Rezepte.",
    alchemyType: "deconstruction",
    ingredients: { empty_vial: 1 },
    output: "glass_dust",
    outputQty: 1,
    requiredAlchemyLevel: 1,
    value: 3,
    brewTime: 3
  },

  // ── Combat Alchemy (Kampfalchemie) ─────────────────────────────────────────
  brew_fire_flask: {
    id: "brew_fire_flask",
    name: "Feuerkolben brauen",
    description: "Feueressenz wird in einem Glaskolben versiegelt — beim Aufprall explodiert er in einem Flammenball.",
    alchemyType: "combat",
    ingredients: { fire_essence: 2, glass_vial: 1 },
    output: "fire_flask",
    outputQty: 3,
    requiredAlchemyLevel: 3,
    value: 22,
    brewTime: 7
  },
  brew_acid_flask: {
    id: "brew_acid_flask",
    name: "Säurekolben brauen",
    description: "Säuredrüsen und Glaskolben ergeben eine ätzende Wurfwaffe, die Metallrüstungen auflöst.",
    alchemyType: "combat",
    ingredients: { acid_gland: 1, glass_vial: 1 },
    output: "acid_flask",
    outputQty: 2,
    requiredAlchemyLevel: 4,
    value: 30,
    brewTime: 8
  },
  brew_frost_bomb: {
    id: "brew_frost_bomb",
    name: "Frostbombe brauen",
    description: "Eiskristalle und Geisterstaub werden zu einer Wurfwaffe destilliert, die beim Aufprall eine Zone einfriert.",
    alchemyType: "combat",
    ingredients: { ice_crystal: 2, spirit_dust: 1 },
    output: "frost_bomb",
    outputQty: 2,
    requiredAlchemyLevel: 5,
    value: 35,
    brewTime: 9
  },
  brew_smoke_curtain: {
    id: "brew_smoke_curtain",
    name: "Rauchvorhang brauen",
    description: "Nachtschatten und Geisterstaub verdichten sich zu einem Rauchvorhang, der ein weites Gebiet in undurchdringlichem Nebel hüllt.",
    alchemyType: "combat",
    ingredients: { nightshade: 2, spirit_dust: 2 },
    output: "smoke_curtain",
    outputQty: 1,
    requiredAlchemyLevel: 3,
    value: 28,
    brewTime: 7
  },
  brew_explosive: {
    id: "brew_explosive",
    name: "Sprengladung bauen",
    description: "Kohle, Feueressenz und Eisenstaub bilden eine hochexplosive alchemistische Ladung.",
    alchemyType: "combat",
    ingredients: { coal_chunk: 2, fire_essence: 1, iron_dust: 1 },
    output: "explosive_charge",
    outputQty: 1,
    requiredAlchemyLevel: 7,
    value: 65,
    brewTime: 12
  },

  // ── Body Alchemy (Körperalchemie — gefährlich) ─────────────────────────────
  enhance_strength: {
    id: "enhance_strength",
    name: "Stärke verstärken",
    description: "Rote Kräuter, Feueressenz und Geisterstaub werden zu einem Elixier gebraut, das die Muskeln dauerhaft stärkt — auf Kosten von Lebenskraft.",
    alchemyType: "body_alchemy",
    ingredients: { red_herb: 3, fire_essence: 1, spirit_dust: 1 },
    output: "strength_elixir",
    outputQty: 1,
    requiredAlchemyLevel: 8,
    value: 200,
    brewTime: 20
  },
  enhance_intelligence: {
    id: "enhance_intelligence",
    name: "Intelligenz verstärken",
    description: "Blaupilze, Höhlenkristall und Sternlichtstaub destillieren zu einem Weisheitselixier — dauerhaft erhöhte Intelligenz, aber höhere Manakosten.",
    alchemyType: "body_alchemy",
    ingredients: { blue_mushroom: 3, cave_crystal: 1, starlight_dust: 1 },
    output: "wisdom_elixir",
    outputQty: 1,
    requiredAlchemyLevel: 8,
    value: 220,
    brewTime: 18
  },
  blood_binding: {
    id: "blood_binding",
    name: "Blutbindung vollziehen",
    description: "Eigenes Blut und Geisterstaub werden zu einem Blutpaktsiegel gebraut, das das Leben des Alchemisten an ein Artefakt bindet — riskant und unumkehrbar.",
    alchemyType: "body_alchemy",
    ingredients: { own_blood: 1, spirit_dust: 2 },
    output: "bloodpact_seal",
    outputQty: 1,
    requiredAlchemyLevel: 10,
    value: 350,
    brewTime: 22
  },

  // ── Circle Alchemy (Kreisalchemie — mächtig, langsam) ─────────────────────
  circle_healing_field: {
    id: "circle_healing_field",
    name: "Heilungskreis zeichnen",
    description: "Ein aufwändiger Transmutationskreis aus Kräutern, Pilzen und Geisterstaub erschafft einen Heilungskreis, der jeden im Wirkungsbereich fortlaufend heilt.",
    alchemyType: "circle_alchemy",
    ingredients: { red_herb: 5, blue_mushroom: 3, spirit_dust: 2 },
    output: "healing_circle",
    outputQty: 1,
    requiredAlchemyLevel: 6,
    value: 180,
    brewTime: 30
  },
  circle_ward: {
    id: "circle_ward",
    name: "Schutzkreis zeichnen",
    description: "Kristalle, Eisenerz und Geisterstaub bilden einen mächtigen Schutzkreis — eine unsichtbare Kuppel, die Eindringlinge und Projektile abwehrt.",
    alchemyType: "circle_alchemy",
    ingredients: { cave_crystal: 3, iron_ore: 2, spirit_dust: 2 },
    output: "ward_circle",
    outputQty: 1,
    requiredAlchemyLevel: 8,
    value: 300,
    brewTime: 35
  },
  philosopher_stone_fragment: {
    id: "philosopher_stone_fragment",
    name: "Stein der Weisen (Fragment) erschaffen",
    description: "Das Herzstück der Alchemie: Lebensessenz, Todesessenz und reines Gold werden in einem uralten Transmutationskreis zum Fragment des Steins der Weisen verdichtet. Äußerst selten und gefährlich.",
    alchemyType: "circle_alchemy",
    ingredients: { life_essence: 5, death_essence: 5, pure_gold: 1 },
    output: "philosopher_stone_fragment",
    outputQty: 1,
    requiredAlchemyLevel: 20,
    value: 10000,
    brewTime: 100
  }
}

export function getRecipe(id: string): AlchemyRecipe | undefined {
  return RECIPES[id]
}

export function getAllRecipes(): AlchemyRecipe[] {
  return Object.values(RECIPES)
}

export function getRecipesByType(type: AlchemyType): AlchemyRecipe[] {
  return Object.values(RECIPES).filter(r => r.alchemyType === type)
}

export function canCraft(
  inventoryItems: Record<string, number>,
  recipe: AlchemyRecipe
): boolean {
  for (const [ingredientId, qty] of Object.entries(recipe.ingredients)) {
    if ((inventoryItems[ingredientId] ?? 0) < qty) {
      return false
    }
  }
  return true
}

export function canTransmute(
  inventoryItems: Record<string, number>,
  recipe: AlchemyRecipe,
  alchemyLevel: number
): boolean {
  if (recipe.alchemyType !== "transmutation") return false
  if (alchemyLevel < recipe.requiredAlchemyLevel) return false
  return canCraft(inventoryItems, recipe)
}
