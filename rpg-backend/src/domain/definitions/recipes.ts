// Alchemy recipes — crafting potions and special items from ingredients

export type AlchemyRecipe = {
  id: string
  name: string
  description: string
  ingredients: Record<string, number>  // itemId → quantity required
  output: string                        // item id produced
  outputQty: number
  requiredAlchemyLevel: number          // 0 = no skill required
  value: number                         // gold value of crafted item
  brewTime: number                      // in ticks
}

export const RECIPES: Record<string, AlchemyRecipe> = {
  brew_health_potion: {
    id: "brew_health_potion",
    name: "Heiltrank brauen",
    description: "Verarbeitet rotes Kraut zu einem Heiltrank.",
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
    ingredients: { spirit_dust: 1, nightshade: 1 },
    output: "smoke_bomb",
    outputQty: 2,
    requiredAlchemyLevel: 2,
    value: 12,
    brewTime: 6
  }
}

export function getRecipe(id: string): AlchemyRecipe | undefined {
  return RECIPES[id]
}

export function getAllRecipes(): AlchemyRecipe[] {
  return Object.values(RECIPES)
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
