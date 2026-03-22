// Derived stats computation
// Aggregates base stats + class bonuses + race bonuses + equipment stats + rune effects + active buffs

import { Entity } from "../entities/entity"
import { getItem, ItemStats, DamageType } from "../definitions/items"
import { getRune } from "../definitions/runes"
import { attrMod } from "../components/character"

export type DerivedStats = {
  // Combat
  attack: number
  defense: number
  critChance: number          // 0.0–1.0
  critMultiplier: number      // default 2.0
  speed: number               // movement tiles per turn

  // Health & Mana
  maxHp: number
  maxMp: number
  hpRegen: number             // HP regen per tick
  mpRegen: number             // MP regen per tick

  // Elemental damage bonuses (added on top of base attack)
  elementalDamage: Partial<Record<DamageType, number>>
  // Damage resistances (fraction reduced, 0.0–1.0)
  resistances: Partial<Record<DamageType, number>>

  // Lifesteal / reflect
  lifesteal: number           // fraction of damage dealt returned as HP
  reflectDamage: number       // fraction of damage received reflected to attacker

  // Attribute-derived modifiers
  strMod: number
  dexMod: number
  intMod: number
  wisMod: number
  conMod: number
  chaMod: number
}

export function computeDerivedStats(entity: Entity): DerivedStats {
  // --- Base values from components ------------------------------------------
  const health = entity.components.health as { hp: number; maxHp: number } | undefined
  const mana = entity.components.mana as { mp: number; maxMp: number; regenPerTick: number } | undefined
  const baseCombat = entity.components.combat as { attack: number; defense: number } | undefined
  const char = entity.components.character as {
    attributes?: Record<string, number>
    level?: number
    classId?: string
  } | undefined

  const attrs = char?.attributes ?? {}
  const strMod = attrMod(attrs["strength"] ?? 10)
  const dexMod = attrMod(attrs["dexterity"] ?? 10)
  const intMod = attrMod(attrs["intelligence"] ?? 10)
  const wisMod = attrMod(attrs["wisdom"] ?? 10)
  const conMod = attrMod(attrs["constitution"] ?? 10)
  const chaMod = attrMod(attrs["charisma"] ?? 10)

  let attack = (baseCombat?.attack ?? 0) + strMod
  let defense = (baseCombat?.defense ?? 0) + conMod
  let critChance = 0.05 + dexMod * 0.01
  let critMultiplier = 2.0
  let speed = 4
  let maxHp = (health?.maxHp ?? 0) + conMod * 5
  let maxMp = (mana?.maxMp ?? 0) + intMod * 5
  let hpRegen = Math.max(0, conMod)
  let mpRegen = mana?.regenPerTick ?? 0

  const elementalDamage: Partial<Record<DamageType, number>> = {}
  const resistances: Partial<Record<DamageType, number>> = {}
  let lifesteal = 0
  let reflectDamage = 0

  // --- Equipment slot bonuses -----------------------------------------------
  const equipment = entity.components.equipment as {
    slots: Record<string, { itemId: string; runeIds: string[] }>
  } | undefined

  if (equipment) {
    for (const [_slot, slotData] of Object.entries(equipment.slots)) {
      const itemDef = getItem(slotData.itemId)
      if (!itemDef?.stats) continue
      const s: ItemStats = itemDef.stats

      attack += s.attack ?? 0
      defense += s.defense ?? 0
      maxHp += s.hpBonus ?? 0
      maxMp += s.manaBonus ?? 0
      critChance += s.critChance ?? 0
      if (s.critMultiplier) critMultiplier = Math.max(critMultiplier, s.critMultiplier)
      speed += s.speed ?? 0
      attack += s.strengthBonus ? attrMod((attrs["strength"] ?? 10) + s.strengthBonus) - strMod : 0
      attack += s.dexterityBonus ? attrMod((attrs["dexterity"] ?? 10) + s.dexterityBonus) - dexMod : 0
      if (s.damageBonus && s.damageType) {
        elementalDamage[s.damageType] = (elementalDamage[s.damageType] ?? 0) + s.damageBonus
      }

      // --- Rune bonuses -------------------------------------------------------
      for (const runeId of slotData.runeIds) {
        const rune = getRune(runeId)
        if (!rune) continue
        const e = rune.effect
        switch (e.type) {
          case "add_attack":    attack += e.value; break
          case "add_defense":   defense += e.value; break
          case "add_hp":        maxHp += e.value; break
          case "add_mana":      maxMp += e.value; break
          case "add_attribute": break // handled separately if needed
          case "elemental_damage":
            if (e.damageType) elementalDamage[e.damageType] = (elementalDamage[e.damageType] ?? 0) + e.value
            break
          case "lifesteal":     lifesteal += e.value; break
          case "manasteal":     break
          case "crit_chance":   critChance += e.value; break
          case "elemental_resistance":
            if (e.damageType) resistances[e.damageType] = Math.min(0.8, (resistances[e.damageType] ?? 0) + e.value)
            break
          case "speed":         speed += e.value; break
          case "reflect_damage": reflectDamage += e.value; break
        }
      }
    }
  }

  // --- Active buffs / debuffs from effects list ----------------------------
  const effects = entity.components.activeEffects as Array<{
    type: string
    payload: { attribute?: string; value?: number }
  }> | undefined

  if (effects) {
    for (const eff of effects) {
      if (eff.type !== "buff" && eff.type !== "debuff") continue
      const val = eff.payload.value ?? 0
      switch (eff.payload.attribute) {
        case "attack":   attack += val; break
        case "defense":  defense += val; break
        case "strength": attack += attrMod((attrs["strength"] ?? 10) + val) - strMod; break
        case "speed":    speed += val; break
      }
    }
  }

  // Clamp values
  attack = Math.max(1, attack)
  defense = Math.max(0, defense)
  critChance = Math.min(0.75, Math.max(0, critChance))
  speed = Math.max(1, speed)

  return {
    attack, defense, critChance, critMultiplier, speed,
    maxHp, maxMp, hpRegen, mpRegen,
    elementalDamage, resistances,
    lifesteal, reflectDamage,
    strMod, dexMod, intMod, wisMod, conMod, chaMod
  }
}

export function applyDamageResistance(
  damage: number,
  damageType: DamageType | undefined,
  stats: DerivedStats
): number {
  if (!damageType) return damage
  const reduction = stats.resistances[damageType] ?? 0
  return Math.max(1, Math.floor(damage * (1 - reduction)))
}
