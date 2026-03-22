// Spell combination effects — when two spells from different schools are cast
// within triggerWindow ticks of each other, a special combo effect triggers.

import { SpellSchool } from "./classes"

export type SpellComboEffect = {
  id: string
  name: string
  description: string
  schoolA: SpellSchool
  schoolB: SpellSchool
  resultEffect: string    // description of what happens
  bonusDamage?: number
  specialEffect?: "freeze" | "ignite" | "stun" | "terrify" | "arcane_burst" | "vaporize" | "electrocute" | "plague" | "shatter" | "overload"
  triggerWindow: number   // ticks within which both spells must be cast
}

export const SPELL_COMBOS: SpellComboEffect[] = [
  // ── Feuer + Eis ───────────────────────────────────────────────
  {
    id: "steam_explosion",
    name: "Dampfexplosion",
    description: "Feuer trifft Eis und erzeugt eine verheerende Dampfexplosion.",
    schoolA: "fire",
    schoolB: "ice",
    resultEffect: "Feuer- und Eiszauber kollidieren in einer massiven Dampfexplosion, die alle Feinde im Bereich vernichtet und die Sichtweite durch Dampfwolken einschränkt.",
    bonusDamage: 60,
    specialEffect: "vaporize",
    triggerWindow: 3,
  },

  // ── Feuer + Blitz ─────────────────────────────────────────────
  {
    id: "plasma_burst",
    name: "Plasmaausbruch",
    description: "Feuer und Blitz vereinen sich zu einem vernichtenden Plasmaausbruch.",
    schoolA: "fire",
    schoolB: "lightning",
    resultEffect: "Feuer- und Blitzzauber ionisieren die Luft und erzeugen ein Plasma, das in einem breiten Bereich explodiert und Feinde in Brand setzt.",
    bonusDamage: 75,
    specialEffect: "ignite",
    triggerWindow: 3,
  },

  // ── Eis + Blitz ───────────────────────────────────────────────
  {
    id: "frozen_lightning",
    name: "Gefrorener Blitz",
    description: "Blitz durchzuckt gefrorene Luft und erzeugt eine Massenbetäubung.",
    schoolA: "ice",
    schoolB: "lightning",
    resultEffect: "Eiszauber kühlt die Luft, durch die der Blitz springt und erschafft ein Feld aus gefrorenem Plasma, das alle Feinde im Bereich betäubt.",
    bonusDamage: 50,
    specialEffect: "stun",
    triggerWindow: 3,
  },

  // ── Arkan + Feuer ─────────────────────────────────────────────
  {
    id: "arcane_inferno",
    name: "Arkanes Inferno",
    description: "Arkane Energie entzündet das Feuer zu einem magisch verstärkten Inferno.",
    schoolA: "arcane",
    schoolB: "fire",
    resultEffect: "Arkane und Feuerzauber verschmelzen zu einem verzauberten Feuerinferno, das auch magische Widerstände durchbricht und erhöhten Schaden an Magiern anrichtet.",
    bonusDamage: 80,
    specialEffect: "arcane_burst",
    triggerWindow: 4,
  },

  // ── Heilig + Schatten ─────────────────────────────────────────
  {
    id: "void_implosion",
    name: "Leersog",
    description: "Heilige und Schattenenergie kollidieren und erzeugen einen vernichtenden Leersog.",
    schoolA: "holy",
    schoolB: "shadow",
    resultEffect: "Die Kollision von heiliger und dunkler Magie reißt ein Loch in die Realität, das alle nahen Feinde aufsaugt und in Schrecken versetzt.",
    bonusDamage: 100,
    specialEffect: "terrify",
    triggerWindow: 3,
  },

  // ── Tod + Heilig ──────────────────────────────────────────────
  {
    id: "undead_banishment",
    name: "Bannfluch der Untoten",
    description: "Heilige Energie trifft auf Todesmagie und vernichtet Untote sofort.",
    schoolA: "death",
    schoolB: "holy",
    resultEffect: "Heilige Energie heiligt die Todesmagie und erzeugt einen Vernichtungsstoß, der Untote auflöst und lebende Feinde erschüttert.",
    bonusDamage: 120,
    specialEffect: "shatter",
    triggerWindow: 3,
  },

  // ── Natur + Blitz ─────────────────────────────────────────────
  {
    id: "storm_surge",
    name: "Sturmschwung",
    description: "Naturmagie und Blitz vereinen sich zu einem gewaltigen Sturmschwung.",
    schoolA: "nature",
    schoolB: "lightning",
    resultEffect: "Naturkräfte und Blitz verschmelzen in einem Sturmschwung, der Feinde verwurzelt und betäubt, während Blitze durch das Gestrüpp springen.",
    bonusDamage: 65,
    specialEffect: "stun",
    triggerWindow: 4,
  },

  // ── Arkan + Eis ───────────────────────────────────────────────
  {
    id: "crystal_prison",
    name: "Kristallgefängnis",
    description: "Arkane Energie gefriert zu einem unzerstörbaren Kristallgefängnis.",
    schoolA: "arcane",
    schoolB: "ice",
    resultEffect: "Arkane und Eismagie kristallisieren zusammen und einschließen das Ziel in einem magisch verstärkten Eiskristall, aus dem es kaum entkommen kann.",
    bonusDamage: 45,
    specialEffect: "freeze",
    triggerWindow: 3,
  },

  // ── Schatten + Tod ────────────────────────────────────────────
  {
    id: "soul_annihilation",
    name: "Seelenlöschung",
    description: "Schatten- und Todesmagie löschen die Seele des Zieles aus.",
    schoolA: "shadow",
    schoolB: "death",
    resultEffect: "Schatten und Tod verschmelzen zu einer vernichtenden Kraft, die die Seele des Zieles endgültig auslöscht und nahe Feinde mit Seuche infiziert.",
    bonusDamage: 90,
    specialEffect: "plague",
    triggerWindow: 4,
  },

  // ── Arkan + Blitz ─────────────────────────────────────────────
  {
    id: "arcane_overload",
    name: "Arkane Überlastung",
    description: "Arkane Energie überlastet den Blitz zu einem verheerenden Entladestrahl.",
    schoolA: "arcane",
    schoolB: "lightning",
    resultEffect: "Arkane und Blitzmagie überladen sich gegenseitig und entladen sich in einem massiven Energiestrahl, der magische Barrieren durchbricht.",
    bonusDamage: 85,
    specialEffect: "overload",
    triggerWindow: 3,
  },

  // ── Feuer + Schatten ──────────────────────────────────────────
  {
    id: "hellblaze",
    name: "Höllenglut",
    description: "Feuer und Schatten verschmelzen zur vernichtenden Höllenglut.",
    schoolA: "fire",
    schoolB: "shadow",
    resultEffect: "Feuer- und Schattenmagie erzeugen eine dunkle Höllenflamme, die physische und magische Schilde durchdringt und anhaltend brennt.",
    bonusDamage: 70,
    specialEffect: "ignite",
    triggerWindow: 4,
  },

  // ── Natur + Heilig ────────────────────────────────────────────
  {
    id: "sacred_growth",
    name: "Heiliges Wachstum",
    description: "Naturkraft und heilige Energie verweben sich zu überwältigender Heilmagie.",
    schoolA: "nature",
    schoolB: "holy",
    resultEffect: "Natur und Heilig verstärken sich gegenseitig und erzeugen einen massiven Heilungsimpuls für alle Verbündeten sowie schützende Ranken um sie herum.",
    bonusDamage: 0,
    triggerWindow: 5,
  },

  // ── Tod + Arkan ───────────────────────────────────────────────
  {
    id: "lich_surge",
    name: "Lichmagiestoß",
    description: "Todesmagie und arkane Kraft erzeugen einen übernatürlichen Magiestoß.",
    schoolA: "death",
    schoolB: "arcane",
    resultEffect: "Todesmagie kombiniert mit arkaner Energie erzeugt einen überladenen Zauberstoß, der Abwehrzauber bricht und Feinde mit Todesenergie tränkt.",
    bonusDamage: 80,
    specialEffect: "arcane_burst",
    triggerWindow: 3,
  },

  // ── Eis + Schatten ────────────────────────────────────────────
  {
    id: "frozen_terror",
    name: "Gefrorener Schrecken",
    description: "Eisige Kälte und Schattenangst lähmen das Ziel vollständig.",
    schoolA: "ice",
    schoolB: "shadow",
    resultEffect: "Eis und Schatten vereinen sich zu einem lähmenden Schrecken, der das Ziel einfriert und in tiefe Panik versetzt.",
    bonusDamage: 40,
    specialEffect: "terrify",
    triggerWindow: 3,
  },

  // ── Natur + Tod ───────────────────────────────────────────────
  {
    id: "plague_bloom",
    name: "Seuchenblüte",
    description: "Natur- und Todesmagie verwandeln Vegetation in tödliches Seuchengift.",
    schoolA: "nature",
    schoolB: "death",
    resultEffect: "Naturmagie infiziert mit Todesmagie erzeugt eine giftige Seuchenblüte, die sich langsam über das Schlachtfeld ausbreitet und alle Feinde im Bereich vergiftet.",
    bonusDamage: 55,
    specialEffect: "plague",
    triggerWindow: 5,
  },

  // ── Blitz + Heilig ────────────────────────────────────────────
  {
    id: "divine_thunder",
    name: "Göttlicher Donner",
    description: "Göttliche Energie kanalisiert durch einen Blitz erzeugt betäubenden Donner.",
    schoolA: "lightning",
    schoolB: "holy",
    resultEffect: "Blitz und heilige Energie entladen sich in einem donnernden Schlag, der böse Wesen sofort betäubt und Untote mit göttlichem Feuer verbrennt.",
    bonusDamage: 70,
    specialEffect: "electrocute",
    triggerWindow: 3,
  },
]

export function getCombosBySchools(schoolA: SpellSchool, schoolB: SpellSchool): SpellComboEffect[] {
  return SPELL_COMBOS.filter(
    c => (c.schoolA === schoolA && c.schoolB === schoolB) ||
         (c.schoolA === schoolB && c.schoolB === schoolA)
  )
}

export function getComboById(id: string): SpellComboEffect | undefined {
  return SPELL_COMBOS.find(c => c.id === id)
}
