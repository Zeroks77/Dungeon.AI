// Spell definitions

import { SpellSchool } from "./classes"
import { DamageType } from "./items"

export type SpellTargetType = "self" | "single_enemy" | "single_ally" | "area" | "cone" | "line"

export type SpellEffect = {
  type: "damage" | "heal" | "restore_mana" | "buff" | "debuff" | "summon" | "teleport" | "stun" | "root" | "silence"
  damageType?: DamageType
  value?: number
  valuePerLevel?: number    // added per caster level above minLevel
  duration?: number         // in ticks (0 = instant)
  attribute?: string
  radius?: number           // for area spells (in hex tiles)
}

export type Spell = {
  id: string
  name: string
  description: string
  school: SpellSchool
  manaCost: number
  castTime: number          // in ticks (0 = instant)
  cooldown: number          // in ticks
  range: number             // max hex distance (0 = self)
  targetType: SpellTargetType
  effects: SpellEffect[]
  requiredLevel: number
  requiredClass: string[]
}

export const SPELLS: Record<string, Spell> = {

  // ── Arcane ────────────────────────────────────────────────────
  arcane_missile: {
    id: "arcane_missile", name: "Arkaner Pfeil", description: "Schießt einen Pfeil aus reiner arkaner Energie.",
    school: "arcane", manaCost: 15, castTime: 0, cooldown: 1, range: 6,
    targetType: "single_enemy",
    effects: [{ type: "damage", damageType: "arcane", value: 18, valuePerLevel: 2 }],
    requiredLevel: 1, requiredClass: ["mage"]
  },
  mana_shield: {
    id: "mana_shield", name: "Manaschutzwall", description: "Absorbiert Schaden auf Kosten von Mana.",
    school: "arcane", manaCost: 30, castTime: 0, cooldown: 20, range: 0,
    targetType: "self",
    effects: [{ type: "buff", attribute: "mana_shield", value: 50, duration: 30 }],
    requiredLevel: 1, requiredClass: ["mage"]
  },
  arcane_explosion: {
    id: "arcane_explosion", name: "Arkane Explosion", description: "Entlädt eine Welle arkaner Energie um den Zauberer.",
    school: "arcane", manaCost: 55, castTime: 0, cooldown: 7, range: 0,
    targetType: "area",
    effects: [{ type: "damage", damageType: "arcane", value: 50, valuePerLevel: 5, radius: 3 }],
    requiredLevel: 6, requiredClass: ["mage"]
  },
  time_warp: {
    id: "time_warp", name: "Zeitverzerrung", description: "Verzerrt die Zeit und ermöglicht sofortige Zauber für kurze Zeit.",
    school: "arcane", manaCost: 80, castTime: 0, cooldown: 60, range: 0,
    targetType: "self",
    effects: [{ type: "buff", attribute: "cast_speed", value: 100, duration: 10 }],
    requiredLevel: 10, requiredClass: ["mage", "archmage"]
  },
  arcane_barrier: {
    id: "arcane_barrier", name: "Arkane Barriere", description: "Errichtet eine magische Schutzbarriere aus arkaner Energie.",
    school: "arcane", manaCost: 45, castTime: 0, cooldown: 15, range: 0,
    targetType: "self",
    effects: [{ type: "buff", attribute: "arcane_barrier", value: 80, duration: 20 }],
    requiredLevel: 4, requiredClass: ["mage", "archmage"]
  },
  counterspell: {
    id: "counterspell", name: "Gegenzauber", description: "Unterbricht und vereitelt den Zauber des Feindes.",
    school: "arcane", manaCost: 25, castTime: 0, cooldown: 12, range: 8,
    targetType: "single_enemy",
    effects: [{ type: "silence", duration: 5 }],
    requiredLevel: 5, requiredClass: ["mage", "archmage", "battlemage"]
  },
  blink: {
    id: "blink", name: "Blinken", description: "Teleportiert sich sofort einige Felder vorwärts.",
    school: "arcane", manaCost: 20, castTime: 0, cooldown: 10, range: 5,
    targetType: "self",
    effects: [{ type: "teleport" }],
    requiredLevel: 3, requiredClass: ["mage", "archmage"]
  },

  // ── Fire ──────────────────────────────────────────────────────
  fireball: {
    id: "fireball", name: "Feuerball", description: "Schleudert eine explodierende Feuerkugel ins Zielgebiet.",
    school: "fire", manaCost: 40, castTime: 1, cooldown: 4, range: 8,
    targetType: "area",
    effects: [{ type: "damage", damageType: "fire", value: 45, valuePerLevel: 5, radius: 2 }],
    requiredLevel: 3, requiredClass: ["mage", "paladin"]
  },
  meteor_storm: {
    id: "meteor_storm", name: "Meteorsturm", description: "Regnet Meteore auf ein großes Gebiet.",
    school: "fire", manaCost: 120, castTime: 3, cooldown: 20, range: 10,
    targetType: "area",
    effects: [{ type: "damage", damageType: "fire", value: 120, valuePerLevel: 12, radius: 4 }],
    requiredLevel: 10, requiredClass: ["mage"]
  },
  inferno: {
    id: "inferno", name: "Inferno", description: "Entfesselt ein vernichtendes Flammenmeer, das alle Feinde im Bereich verbrennt.",
    school: "fire", manaCost: 90, castTime: 2, cooldown: 16, range: 7,
    targetType: "area",
    effects: [
      { type: "damage", damageType: "fire", value: 80, valuePerLevel: 8, radius: 3 },
      { type: "debuff", attribute: "burning", value: 10, duration: 6 }
    ],
    requiredLevel: 8, requiredClass: ["mage", "elementalist"]
  },
  flame_wall: {
    id: "flame_wall", name: "Flammenwand", description: "Errichtet eine Wand aus lodernden Flammen, die Feinde beim Durchqueren verbrennt.",
    school: "fire", manaCost: 60, castTime: 1, cooldown: 12, range: 6,
    targetType: "line",
    effects: [{ type: "damage", damageType: "fire", value: 35, valuePerLevel: 4, duration: 10 }],
    requiredLevel: 6, requiredClass: ["mage", "elementalist"]
  },

  // ── Ice ───────────────────────────────────────────────────────
  ice_nova: {
    id: "ice_nova", name: "Eisnova", description: "Explodiert in einer Welle aus gefrorenem Eis.",
    school: "ice", manaCost: 50, castTime: 1, cooldown: 6, range: 0,
    targetType: "area",
    effects: [
      { type: "damage", damageType: "ice", value: 35, valuePerLevel: 4, radius: 3 },
      { type: "root", duration: 3 }
    ],
    requiredLevel: 5, requiredClass: ["mage"]
  },
  ice_wall: {
    id: "ice_wall", name: "Eiswand", description: "Beschwört eine undurchdringliche Mauer aus Eis, die den Weg versperrt.",
    school: "ice", manaCost: 55, castTime: 1, cooldown: 14, range: 5,
    targetType: "line",
    effects: [
      { type: "root", duration: 15 },
      { type: "damage", damageType: "ice", value: 20, valuePerLevel: 2 }
    ],
    requiredLevel: 5, requiredClass: ["mage", "elementalist"]
  },
  blizzard: {
    id: "blizzard", name: "Blizzard", description: "Entfesselt einen vernichtenden Schneesturm über das Zielgebiet.",
    school: "ice", manaCost: 100, castTime: 2, cooldown: 18, range: 9,
    targetType: "area",
    effects: [
      { type: "damage", damageType: "ice", value: 90, valuePerLevel: 9, radius: 4 },
      { type: "debuff", attribute: "movement_speed", value: -30, duration: 8 }
    ],
    requiredLevel: 9, requiredClass: ["mage", "elementalist"]
  },
  frost_nova: {
    id: "frost_nova", name: "Frostnova", description: "Schleudert eine Welle frostiger Kälte, die Feinde einfriert.",
    school: "ice", manaCost: 40, castTime: 0, cooldown: 8, range: 0,
    targetType: "area",
    effects: [
      { type: "damage", damageType: "ice", value: 25, valuePerLevel: 3, radius: 2 },
      { type: "stun", duration: 2 }
    ],
    requiredLevel: 3, requiredClass: ["mage", "elementalist"]
  },
  frozen_tomb: {
    id: "frozen_tomb", name: "Eisgrab", description: "Einschließt das Ziel in einem Sarg aus massivem Eis.",
    school: "ice", manaCost: 70, castTime: 1, cooldown: 18, range: 6,
    targetType: "single_enemy",
    effects: [
      { type: "root", duration: 10 },
      { type: "stun", duration: 4 },
      { type: "damage", damageType: "ice", value: 40, valuePerLevel: 5 }
    ],
    requiredLevel: 8, requiredClass: ["mage"]
  },
  arctic_breath: {
    id: "arctic_breath", name: "Arktikatem", description: "Haucht einen eiskalten Atem aus, der alle Feinde in einem Kegel einfriert.",
    school: "ice", manaCost: 65, castTime: 1, cooldown: 10, range: 5,
    targetType: "cone",
    effects: [
      { type: "damage", damageType: "ice", value: 55, valuePerLevel: 6 },
      { type: "debuff", attribute: "movement_speed", value: -50, duration: 5 }
    ],
    requiredLevel: 7, requiredClass: ["mage", "elementalist"]
  },

  // ── Lightning ─────────────────────────────────────────────────
  chain_lightning: {
    id: "chain_lightning", name: "Kettenblitz", description: "Blitz springt zwischen mehreren Feinden.",
    school: "lightning", manaCost: 60, castTime: 1, cooldown: 8, range: 7,
    targetType: "single_enemy",
    effects: [{ type: "damage", damageType: "lightning", value: 55, valuePerLevel: 6 }],
    requiredLevel: 7, requiredClass: ["mage", "shaman"]
  },
  thunder_clap: {
    id: "thunder_clap", name: "Donnerschlag", description: "Schlägt mit Donnerkraft auf den Boden und betäubt nahe Feinde.",
    school: "lightning", manaCost: 45, castTime: 0, cooldown: 9, range: 0,
    targetType: "area",
    effects: [
      { type: "damage", damageType: "lightning", value: 40, valuePerLevel: 4, radius: 3 },
      { type: "stun", duration: 2 }
    ],
    requiredLevel: 5, requiredClass: ["shaman", "elementalist"]
  },
  storm_call: {
    id: "storm_call", name: "Sturmruf", description: "Ruft einen mächtigen Sturm herbei, der das Schlachtfeld verwüstet.",
    school: "lightning", manaCost: 110, castTime: 3, cooldown: 22, range: 12,
    targetType: "area",
    effects: [
      { type: "damage", damageType: "lightning", value: 100, valuePerLevel: 10, radius: 5 },
      { type: "debuff", attribute: "movement_speed", value: -20, duration: 12 }
    ],
    requiredLevel: 11, requiredClass: ["shaman", "mage"]
  },
  ball_lightning: {
    id: "ball_lightning", name: "Kugelblitz", description: "Erschafft eine wandernde Lichtkugel, die Feinde beim Berühren verbrennt.",
    school: "lightning", manaCost: 70, castTime: 1, cooldown: 12, range: 8,
    targetType: "area",
    effects: [{ type: "damage", damageType: "lightning", value: 60, valuePerLevel: 7, radius: 2 }],
    requiredLevel: 8, requiredClass: ["mage", "shaman"]
  },
  emp_pulse: {
    id: "emp_pulse", name: "EMP-Stoß", description: "Sendet einen elektromagnetischen Puls, der Magieanwender lahmlegt.",
    school: "lightning", manaCost: 55, castTime: 0, cooldown: 15, range: 6,
    targetType: "area",
    effects: [
      { type: "silence", duration: 6 },
      { type: "damage", damageType: "lightning", value: 30, valuePerLevel: 3, radius: 3 }
    ],
    requiredLevel: 7, requiredClass: ["mage", "elementalist"]
  },
  lightning_ward: {
    id: "lightning_ward", name: "Blitzwächter", description: "Hüllt sich in ein Schutzfeld aus Blitzen, das Angreifer schädigt.",
    school: "lightning", manaCost: 50, castTime: 0, cooldown: 20, range: 0,
    targetType: "self",
    effects: [{ type: "buff", attribute: "lightning_ward", value: 20, duration: 25 }],
    requiredLevel: 6, requiredClass: ["mage", "shaman"]
  },

  // ── Holy ──────────────────────────────────────────────────────
  heal: {
    id: "heal", name: "Heilung", description: "Stellt Lebenspunkte des Zieles wieder her.",
    school: "holy", manaCost: 25, castTime: 0, cooldown: 2, range: 4,
    targetType: "single_ally",
    effects: [{ type: "heal", value: 40, valuePerLevel: 5 }],
    requiredLevel: 1, requiredClass: ["cleric", "paladin", "druid"]
  },
  holy_smite: {
    id: "holy_smite", name: "Heiliger Schlag", description: "Kanalisiert göttliche Energie in einen vernichtenden Schlag.",
    school: "holy", manaCost: 20, castTime: 0, cooldown: 3, range: 1,
    targetType: "single_enemy",
    effects: [{ type: "damage", damageType: "holy", value: 30, valuePerLevel: 4 }],
    requiredLevel: 1, requiredClass: ["cleric", "paladin"]
  },
  bless: {
    id: "bless", name: "Segen", description: "Segnet einen Verbündeten und erhöht dessen Kampfkraft.",
    school: "holy", manaCost: 30, castTime: 0, cooldown: 20, range: 4,
    targetType: "single_ally",
    effects: [
      { type: "buff", attribute: "attack", value: 5, duration: 30 },
      { type: "buff", attribute: "defense", value: 3, duration: 30 }
    ],
    requiredLevel: 3, requiredClass: ["cleric", "paladin"]
  },
  turn_undead: {
    id: "turn_undead", name: "Untote wenden", description: "Vertreibt oder vernichtet Untote in der Nähe.",
    school: "holy", manaCost: 40, castTime: 0, cooldown: 10, range: 0,
    targetType: "area",
    effects: [{ type: "damage", damageType: "holy", value: 60, radius: 3 }],
    requiredLevel: 5, requiredClass: ["cleric", "paladin"]
  },
  divine_shield: {
    id: "divine_shield", name: "Göttlicher Schild", description: "Hüllt in unzerstörbare göttliche Energie.",
    school: "holy", manaCost: 60, castTime: 0, cooldown: 60, range: 0,
    targetType: "self",
    effects: [{ type: "buff", attribute: "divine_shield", value: 1, duration: 5 }],
    requiredLevel: 7, requiredClass: ["cleric"]
  },
  resurrection: {
    id: "resurrection", name: "Auferstehung", description: "Erweckt einen gefallenen Verbündeten.",
    school: "holy", manaCost: 150, castTime: 5, cooldown: 100, range: 2,
    targetType: "single_ally",
    effects: [{ type: "heal", value: 50 }],
    requiredLevel: 10, requiredClass: ["cleric"]
  },
  mass_heal: {
    id: "mass_heal", name: "Massenheilung", description: "Heilt alle Verbündeten im Umkreis gleichzeitig.",
    school: "holy", manaCost: 90, castTime: 2, cooldown: 20, range: 0,
    targetType: "area",
    effects: [{ type: "heal", value: 50, valuePerLevel: 5, radius: 4 }],
    requiredLevel: 8, requiredClass: ["cleric", "druid", "healer"]
  },
  holy_nova: {
    id: "holy_nova", name: "Heilige Nova", description: "Sendet eine heilige Stoßwelle aus, die Feinde schädigt und Verbündete heilt.",
    school: "holy", manaCost: 60, castTime: 1, cooldown: 10, range: 0,
    targetType: "area",
    effects: [
      { type: "damage", damageType: "holy", value: 30, valuePerLevel: 3, radius: 3 },
      { type: "heal", value: 25, valuePerLevel: 3, radius: 3 }
    ],
    requiredLevel: 6, requiredClass: ["cleric", "paladin"]
  },
  consecrate: {
    id: "consecrate", name: "Weihen", description: "Weiht den Boden unter dem Zauberer, der Feinde verbrennt.",
    school: "holy", manaCost: 50, castTime: 0, cooldown: 12, range: 0,
    targetType: "area",
    effects: [{ type: "damage", damageType: "holy", value: 20, valuePerLevel: 2, radius: 2, duration: 10 }],
    requiredLevel: 5, requiredClass: ["paladin", "cleric"]
  },
  divine_judgment: {
    id: "divine_judgment", name: "Göttliches Urteil", description: "Ruft göttliches Feuer auf ein einzelnes Ziel herab.",
    school: "holy", manaCost: 75, castTime: 1, cooldown: 14, range: 7,
    targetType: "single_enemy",
    effects: [{ type: "damage", damageType: "holy", value: 85, valuePerLevel: 9 }],
    requiredLevel: 9, requiredClass: ["cleric", "paladin"]
  },
  purify: {
    id: "purify", name: "Reinigung", description: "Beseitigt alle negativen Zustände von einem Verbündeten.",
    school: "holy", manaCost: 30, castTime: 0, cooldown: 8, range: 4,
    targetType: "single_ally",
    effects: [{ type: "buff", attribute: "cleanse", value: 1, duration: 0 }],
    requiredLevel: 3, requiredClass: ["cleric", "paladin", "healer"]
  },

  // ── Shadow ────────────────────────────────────────────────────
  shadow_step: {
    id: "shadow_step", name: "Schattensprung", description: "Teleportiert sich in die Schatten hinter das Ziel.",
    school: "shadow", manaCost: 20, castTime: 0, cooldown: 8, range: 5,
    targetType: "single_enemy",
    effects: [{ type: "teleport" }],
    requiredLevel: 5, requiredClass: ["rogue", "assassin"]
  },
  poison_blade: {
    id: "poison_blade", name: "Giftklinge", description: "Vergiftet die Waffe für mehrere Schläge.",
    school: "shadow", manaCost: 15, castTime: 0, cooldown: 10, range: 0,
    targetType: "self",
    effects: [{ type: "buff", attribute: "poison_weapon", value: 10, duration: 20 }],
    requiredLevel: 3, requiredClass: ["rogue", "assassin"]
  },
  shadow_bolt: {
    id: "shadow_bolt", name: "Schattenblitz", description: "Schleudert einen Pfeil dunkler Energie auf den Feind.",
    school: "shadow", manaCost: 30, castTime: 0, cooldown: 3, range: 7,
    targetType: "single_enemy",
    effects: [{ type: "damage", damageType: "shadow", value: 35, valuePerLevel: 4 }],
    requiredLevel: 1, requiredClass: ["warlock", "necromancer", "cleric"]
  },
  dark_pact: {
    id: "dark_pact", name: "Dunkler Pakt", description: "Opfert eigene Lebenspunkte für einen Schub an Mana.",
    school: "shadow", manaCost: 0, castTime: 0, cooldown: 15, range: 0,
    targetType: "self",
    effects: [
      { type: "debuff", attribute: "health", value: -30, duration: 0 },
      { type: "restore_mana", value: 50 }
    ],
    requiredLevel: 5, requiredClass: ["warlock"]
  },
  fear: {
    id: "fear", name: "Furcht", description: "Erfüllt den Feind mit übernatürlichem Schrecken und treibt ihn in die Flucht.",
    school: "shadow", manaCost: 35, castTime: 0, cooldown: 12, range: 5,
    targetType: "single_enemy",
    effects: [{ type: "stun", duration: 6 }],
    requiredLevel: 4, requiredClass: ["warlock", "necromancer"]
  },
  nightmare: {
    id: "nightmare", name: "Albtraum", description: "Lässt den Feind in einem Alptraum versinken und verursacht anhaltenden Schaden.",
    school: "shadow", manaCost: 60, castTime: 1, cooldown: 16, range: 6,
    targetType: "single_enemy",
    effects: [
      { type: "stun", duration: 4 },
      { type: "damage", damageType: "shadow", value: 15, valuePerLevel: 2, duration: 8 }
    ],
    requiredLevel: 7, requiredClass: ["warlock"]
  },
  soul_drain: {
    id: "soul_drain", name: "Seelentzug", description: "Saugt die Lebenskraft des Feindes aus und überträgt sie auf den Zauberer.",
    school: "shadow", manaCost: 50, castTime: 2, cooldown: 10, range: 5,
    targetType: "single_enemy",
    effects: [
      { type: "damage", damageType: "shadow", value: 40, valuePerLevel: 5 },
      { type: "heal", value: 20, valuePerLevel: 2 }
    ],
    requiredLevel: 6, requiredClass: ["warlock", "necromancer"]
  },
  death_coil: {
    id: "death_coil", name: "Todesspirale", description: "Schleudert eine spiralförmige Woge des Todes auf den Feind.",
    school: "shadow", manaCost: 55, castTime: 0, cooldown: 8, range: 6,
    targetType: "single_enemy",
    effects: [
      { type: "damage", damageType: "shadow", value: 50, valuePerLevel: 6 },
      { type: "root", duration: 3 }
    ],
    requiredLevel: 8, requiredClass: ["necromancer", "warlock"]
  },
  consume_soul: {
    id: "consume_soul", name: "Seele verschlingen", description: "Verschlingt die Seele eines geschwächten Feindes und gewinnt Kraft daraus.",
    school: "shadow", manaCost: 65, castTime: 1, cooldown: 20, range: 4,
    targetType: "single_enemy",
    effects: [
      { type: "damage", damageType: "shadow", value: 70, valuePerLevel: 7 },
      { type: "buff", attribute: "attack", value: 10, duration: 15 }
    ],
    requiredLevel: 9, requiredClass: ["warlock"]
  },

  // ── Death ─────────────────────────────────────────────────────
  animate_dead: {
    id: "animate_dead", name: "Tote beleben", description: "Erweckt einen gefallenen Feind als untoten Diener.",
    school: "death", manaCost: 70, castTime: 2, cooldown: 30, range: 4,
    targetType: "single_enemy",
    effects: [{ type: "summon", duration: 60 }],
    requiredLevel: 5, requiredClass: ["necromancer"]
  },
  bone_nova: {
    id: "bone_nova", name: "Knochennova", description: "Schleudert eine Welle scharfer Knochensplitter nach außen.",
    school: "death", manaCost: 55, castTime: 0, cooldown: 8, range: 0,
    targetType: "area",
    effects: [{ type: "damage", damageType: "physical", value: 45, valuePerLevel: 5, radius: 3 }],
    requiredLevel: 5, requiredClass: ["necromancer"]
  },
  death_grip: {
    id: "death_grip", name: "Todesgriff", description: "Zieht einen Feind mit einer Kette aus Todesenergie heran.",
    school: "death", manaCost: 35, castTime: 0, cooldown: 15, range: 8,
    targetType: "single_enemy",
    effects: [
      { type: "root", duration: 2 },
      { type: "damage", damageType: "shadow", value: 25, valuePerLevel: 3 }
    ],
    requiredLevel: 4, requiredClass: ["necromancer", "lich"]
  },
  lich_form: {
    id: "lich_form", name: "Lichgestalt", description: "Verwandelt sich in eine mächtige Lichgestalt mit erhöhter Zauberkraft.",
    school: "death", manaCost: 100, castTime: 2, cooldown: 90, range: 0,
    targetType: "self",
    effects: [
      { type: "buff", attribute: "spell_power", value: 50, duration: 30 },
      { type: "buff", attribute: "undead_form", value: 1, duration: 30 }
    ],
    requiredLevel: 12, requiredClass: ["necromancer", "lich"]
  },
  plague: {
    id: "plague", name: "Seuche", description: "Infiziert das Ziel mit einer todbringenden Seuche, die sich ausbreitet.",
    school: "death", manaCost: 60, castTime: 1, cooldown: 16, range: 6,
    targetType: "single_enemy",
    effects: [
      { type: "damage", damageType: "poison", value: 10, valuePerLevel: 1, duration: 20 },
      { type: "debuff", attribute: "healing_reduction", value: -50, duration: 20 }
    ],
    requiredLevel: 7, requiredClass: ["necromancer", "plague_doctor"]
  },
  soul_harvest: {
    id: "soul_harvest", name: "Seelenernte", description: "Erntet die Seelen gefallener Feinde und stärkt den Nekromanten.",
    school: "death", manaCost: 45, castTime: 0, cooldown: 20, range: 0,
    targetType: "area",
    effects: [
      { type: "heal", value: 20, valuePerLevel: 3, radius: 5 },
      { type: "restore_mana", value: 25 }
    ],
    requiredLevel: 6, requiredClass: ["necromancer", "soul_harvester"]
  },

  // ── Nature ────────────────────────────────────────────────────
  aimed_shot: {
    id: "aimed_shot", name: "Gezielter Schuss", description: "Ein präziser Schuss mit erhöhter Trefferchance.",
    school: "nature", manaCost: 10, castTime: 0, cooldown: 2, range: 10,
    targetType: "single_enemy",
    effects: [{ type: "damage", damageType: "physical", value: 20, valuePerLevel: 3 }],
    requiredLevel: 1, requiredClass: ["ranger"]
  },
  multishot: {
    id: "multishot", name: "Mehrfachschuss", description: "Verschießt mehrere Pfeile gleichzeitig.",
    school: "nature", manaCost: 20, castTime: 0, cooldown: 5, range: 8,
    targetType: "area",
    effects: [{ type: "damage", damageType: "physical", value: 15, valuePerLevel: 2, radius: 2 }],
    requiredLevel: 3, requiredClass: ["ranger"]
  },
  entangle: {
    id: "entangle", name: "Rankengriff", description: "Lässt Wurzeln aus dem Boden schießen, die Feinde fesseln.",
    school: "nature", manaCost: 35, castTime: 0, cooldown: 10, range: 6,
    targetType: "area",
    effects: [{ type: "root", duration: 8, radius: 2 }],
    requiredLevel: 3, requiredClass: ["druid", "ranger", "shaman"]
  },
  thorns: {
    id: "thorns", name: "Dornen", description: "Umhüllt sich mit scharfen Dornen, die Angreifer verletzen.",
    school: "nature", manaCost: 30, castTime: 0, cooldown: 15, range: 0,
    targetType: "self",
    effects: [{ type: "buff", attribute: "thorns_aura", value: 15, duration: 25 }],
    requiredLevel: 3, requiredClass: ["druid"]
  },
  regrowth: {
    id: "regrowth", name: "Nachwachsen", description: "Ruft die Heilkraft der Natur auf und heilt das Ziel über Zeit.",
    school: "nature", manaCost: 40, castTime: 1, cooldown: 12, range: 4,
    targetType: "single_ally",
    effects: [
      { type: "heal", value: 20, valuePerLevel: 3 },
      { type: "buff", attribute: "regen", value: 8, duration: 15 }
    ],
    requiredLevel: 4, requiredClass: ["druid", "shaman"]
  },
  summon_spirit_wolf: {
    id: "summon_spirit_wolf", name: "Geisterwolf beschwören", description: "Beschwört einen treuen Geisterwolf als Kampfbegleiter.",
    school: "nature", manaCost: 80, castTime: 2, cooldown: 40, range: 1,
    targetType: "self",
    effects: [{ type: "summon", duration: 45 }],
    requiredLevel: 8, requiredClass: ["shaman", "druid"]
  },
  earthquake: {
    id: "earthquake", name: "Erdbeben", description: "Erschüttert den Boden und wirft alle Feinde im Bereich zu Boden.",
    school: "nature", manaCost: 90, castTime: 2, cooldown: 20, range: 0,
    targetType: "area",
    effects: [
      { type: "damage", damageType: "physical", value: 70, valuePerLevel: 7, radius: 5 },
      { type: "stun", duration: 3 }
    ],
    requiredLevel: 10, requiredClass: ["shaman", "druid"]
  },
  stone_skin: {
    id: "stone_skin", name: "Steinhaut", description: "Verhärtet die Haut wie Stein und erhöht die Verteidigung drastisch.",
    school: "nature", manaCost: 45, castTime: 0, cooldown: 18, range: 0,
    targetType: "self",
    effects: [{ type: "buff", attribute: "defense", value: 25, duration: 20 }],
    requiredLevel: 5, requiredClass: ["shaman", "druid"]
  },

  // ── Krieger (physische Fähigkeiten, kein Mana) ────────────────
  power_strike: {
    id: "power_strike", name: "Kraftschlag", description: "Ein mächtiger Schlag mit doppelter Wucht.",
    school: "arcane", manaCost: 0, castTime: 0, cooldown: 3, range: 1,
    targetType: "single_enemy",
    effects: [{ type: "damage", damageType: "physical", value: 0, valuePerLevel: 0 }],
    requiredLevel: 1, requiredClass: ["warrior"]
  },
  berserker_rage: {
    id: "berserker_rage", name: "Berserkerrausch", description: "Erhöht Angriff drastisch auf Kosten der Verteidigung.",
    school: "arcane", manaCost: 0, castTime: 0, cooldown: 30, range: 0,
    targetType: "self",
    effects: [
      { type: "buff", attribute: "attack", value: 20, duration: 15 },
      { type: "debuff", attribute: "defense", value: -10, duration: 15 }
    ],
    requiredLevel: 7, requiredClass: ["warrior"]
  },

  // ── Barde ─────────────────────────────────────────────────────
  sonic_lance: {
    id: "sonic_lance", name: "Schallklinge", description: "Schleudert eine messerscharfe Schallwelle auf den Feind und verstummt ihn.",
    school: "arcane", manaCost: 35, castTime: 0, cooldown: 5, range: 7,
    targetType: "single_enemy",
    effects: [
      { type: "damage", damageType: "arcane", value: 30, valuePerLevel: 4 },
      { type: "silence", duration: 3 }
    ],
    requiredLevel: 3, requiredClass: ["bard"]
  },
  inspire_courage: {
    id: "inspire_courage", name: "Mut einflößen", description: "Inspiriert alle Verbündeten mit einem stärkenden Lied und erhöht ihre Kampfkraft.",
    school: "nature", manaCost: 40, castTime: 1, cooldown: 25, range: 0,
    targetType: "area",
    effects: [
      { type: "buff", attribute: "attack", value: 8, duration: 30, radius: 4 },
      { type: "buff", attribute: "defense", value: 5, duration: 30, radius: 4 }
    ],
    requiredLevel: 4, requiredClass: ["bard"]
  },
  dirge_of_doom: {
    id: "dirge_of_doom", name: "Todesgesang", description: "Singt ein unheilvolles Lied, das Feinden Angst einjagt und ihre Kampfkraft bricht.",
    school: "arcane", manaCost: 55, castTime: 2, cooldown: 18, range: 0,
    targetType: "area",
    effects: [
      { type: "debuff", attribute: "attack", value: -10, duration: 15, radius: 5 },
      { type: "stun", duration: 2 }
    ],
    requiredLevel: 7, requiredClass: ["bard"]
  },

  // ── Mönch ─────────────────────────────────────────────────────
  ki_strike: {
    id: "ki_strike", name: "Ki-Schlag", description: "Kanalisiert innere Lebensenergie in einen zerstörerischen Schlag.",
    school: "arcane", manaCost: 20, castTime: 0, cooldown: 3, range: 1,
    targetType: "single_enemy",
    effects: [{ type: "damage", damageType: "arcane", value: 35, valuePerLevel: 4 }],
    requiredLevel: 1, requiredClass: ["monk"]
  },
  stunning_fist: {
    id: "stunning_fist", name: "Betäubungsfaust", description: "Ein gezielter Schlag auf Nervenpunkte, der den Feind betäubt.",
    school: "arcane", manaCost: 25, castTime: 0, cooldown: 8, range: 1,
    targetType: "single_enemy",
    effects: [
      { type: "damage", damageType: "physical", value: 20, valuePerLevel: 2 },
      { type: "stun", duration: 3 }
    ],
    requiredLevel: 3, requiredClass: ["monk"]
  },
  void_step: {
    id: "void_step", name: "Leerschritt", description: "Tritt kurz in die Leere ein und erscheint hinter dem Feind.",
    school: "arcane", manaCost: 30, castTime: 0, cooldown: 12, range: 6,
    targetType: "single_enemy",
    effects: [{ type: "teleport" }],
    requiredLevel: 6, requiredClass: ["monk", "way_of_shadow"]
  },

  // ── Schamane ──────────────────────────────────────────────────
  chain_heal: {
    id: "chain_heal", name: "Kettenheilung", description: "Heilt ein Ziel und springt dann auf nahe Verbündete über.",
    school: "nature", manaCost: 55, castTime: 1, cooldown: 8, range: 5,
    targetType: "single_ally",
    effects: [{ type: "heal", value: 45, valuePerLevel: 5 }],
    requiredLevel: 5, requiredClass: ["shaman", "restoration"]
  },
  earth_totem: {
    id: "earth_totem", name: "Erdtotem", description: "Pflanzt ein Erdtotem, das nahen Verbündeten Schutz gewährt.",
    school: "nature", manaCost: 40, castTime: 1, cooldown: 20, range: 0,
    targetType: "self",
    effects: [{ type: "buff", attribute: "defense_aura", value: 10, duration: 30, radius: 3 }],
    requiredLevel: 3, requiredClass: ["shaman"]
  },
  ghost_wolf: {
    id: "ghost_wolf", name: "Geisterwolf", description: "Verwandelt sich in einen schnellen Geisterwolf.",
    school: "nature", manaCost: 30, castTime: 0, cooldown: 15, range: 0,
    targetType: "self",
    effects: [{ type: "buff", attribute: "movement_speed", value: 60, duration: 20 }],
    requiredLevel: 4, requiredClass: ["shaman", "spirit_walker"]
  },

  // ── Hexenmeister ──────────────────────────────────────────────
  eldritch_blast: {
    id: "eldritch_blast", name: "Erzmagierstrahl", description: "Schießt einen Strahl alter, verzehrender Macht aus dem Pakt.",
    school: "arcane", manaCost: 30, castTime: 0, cooldown: 2, range: 8,
    targetType: "single_enemy",
    effects: [{ type: "damage", damageType: "arcane", value: 28, valuePerLevel: 3 }],
    requiredLevel: 1, requiredClass: ["warlock"]
  },
  hex: {
    id: "hex", name: "Verwünschung", description: "Belegt das Ziel mit einem lähmenden Fluch, der es schwächt.",
    school: "shadow", manaCost: 40, castTime: 0, cooldown: 14, range: 5,
    targetType: "single_enemy",
    effects: [
      { type: "debuff", attribute: "attack", value: -15, duration: 12 },
      { type: "debuff", attribute: "movement_speed", value: -30, duration: 12 }
    ],
    requiredLevel: 4, requiredClass: ["warlock"]
  },
  hellfire: {
    id: "hellfire", name: "Höllenfeuer", description: "Entfacht das Höllenfeuer, das alle nahen Feinde verbrennt.",
    school: "shadow", manaCost: 80, castTime: 2, cooldown: 16, range: 0,
    targetType: "area",
    effects: [{ type: "damage", damageType: "fire", value: 65, valuePerLevel: 7, radius: 3 }],
    requiredLevel: 8, requiredClass: ["warlock", "fiend_pact"]
  },
  dark_bargain: {
    id: "dark_bargain", name: "Dunkler Handel", description: "Schließt einen Pakt mit dunklen Kräften für massiven Schaden auf Kosten eigener Gesundheit.",
    school: "shadow", manaCost: 90, castTime: 1, cooldown: 25, range: 7,
    targetType: "single_enemy",
    effects: [
      { type: "damage", damageType: "shadow", value: 100, valuePerLevel: 10 },
      { type: "debuff", attribute: "health", value: -20, duration: 0 }
    ],
    requiredLevel: 9, requiredClass: ["warlock"]
  },

  // ── Paladin ───────────────────────────────────────────────────
  lay_on_hands_spell: {
    id: "lay_on_hands_spell", name: "Handauflegen", description: "Überträgt göttliche Heilkraft durch Berührung und heilt das Ziel vollständig.",
    school: "holy", manaCost: 0, castTime: 0, cooldown: 60, range: 1,
    targetType: "single_ally",
    effects: [{ type: "heal", value: 200, valuePerLevel: 20 }],
    requiredLevel: 5, requiredClass: ["paladin"]
  },
  divine_wrath: {
    id: "divine_wrath", name: "Göttlicher Zorn", description: "Entlädt göttlichen Zorn in einem vernichtenden Nahkampfschlag.",
    school: "holy", manaCost: 65, castTime: 0, cooldown: 12, range: 1,
    targetType: "single_enemy",
    effects: [{ type: "damage", damageType: "holy", value: 75, valuePerLevel: 8 }],
    requiredLevel: 7, requiredClass: ["paladin", "vengeance"]
  },
  aura_of_protection: {
    id: "aura_of_protection", name: "Schutzaura", description: "Umgibt alle Verbündeten in der Nähe mit einer göttlichen Schutzaura.",
    school: "holy", manaCost: 50, castTime: 0, cooldown: 30, range: 0,
    targetType: "area",
    effects: [{ type: "buff", attribute: "defense", value: 15, duration: 30, radius: 4 }],
    requiredLevel: 5, requiredClass: ["paladin", "devotion"]
  },
  crusader_strike: {
    id: "crusader_strike", name: "Kreuzritterhieb", description: "Ein heiliger Schlag, der Feinde schwächt und dem Paladin Mana zurückgibt.",
    school: "holy", manaCost: 15, castTime: 0, cooldown: 4, range: 1,
    targetType: "single_enemy",
    effects: [
      { type: "damage", damageType: "holy", value: 30, valuePerLevel: 3 },
      { type: "restore_mana", value: 10 }
    ],
    requiredLevel: 3, requiredClass: ["paladin"]
  },
}

export function getSpell(id: string): Spell | undefined {
  return SPELLS[id]
}

export function getSpellsByClass(classId: string): Spell[] {
  return Object.values(SPELLS).filter(s => s.requiredClass.includes(classId))
}

export function getSpellsBySchool(school: SpellSchool): Spell[] {
  return Object.values(SPELLS).filter(s => s.school === school)
}
