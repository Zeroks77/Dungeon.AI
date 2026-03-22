// Character class definitions

export type Attribute = "strength" | "dexterity" | "intelligence" | "wisdom" | "constitution" | "charisma"

export type AttributeModifiers = Record<Attribute, number>

export type SpellSchool = "fire" | "ice" | "lightning" | "arcane" | "holy" | "shadow" | "nature" | "death"

export type SubClass = {
  id: string
  name: string
  description: string
  unlocksAtLevel: number
  bonusAbilities: string[]
  attributeBonusOverride?: Partial<AttributeModifiers>
  additionalSpellSchools?: SpellSchool[]
}

export type CharacterClass = {
  id: string
  name: string
  description: string
  hitDie: number            // z.B. 10 = d10 für HP beim Stufenaufstieg
  baseAttack: number
  baseDefense: number
  baseHp: number
  baseMana: number
  attributeBonuses: Partial<AttributeModifiers>
  primaryAttributes: Attribute[]
  allowedSpellSchools: SpellSchool[]
  startingItems: string[]   // Gegenstands-IDs aus der Items-Definition
  abilities: string[]       // Fähigkeits-IDs, die auf Stufe 1 freigeschaltet werden
  levelAbilities: Record<number, string[]>  // Fähigkeiten, die pro Stufe freigeschaltet werden
  subClasses?: SubClass[]
}

export const CHARACTER_CLASSES: Record<string, CharacterClass> = {
  warrior: {
    id: "warrior",
    name: "Krieger",
    description: "Meister des Nahkampfes, gepanzert und unerschütterlich.",
    hitDie: 10,
    baseAttack: 15,
    baseDefense: 10,
    baseHp: 120,
    baseMana: 0,
    attributeBonuses: { strength: 3, constitution: 2 },
    primaryAttributes: ["strength", "constitution"],
    allowedSpellSchools: [],
    startingItems: ["iron_sword", "leather_armor", "health_potion"],
    abilities: ["power_strike", "shield_block"],
    levelAbilities: {
      3: ["whirlwind"],
      5: ["battle_cry"],
      7: ["berserker_rage"],
      10: ["avatar_of_war"]
    },
    subClasses: [
      {
        id: "guardian",
        name: "Wächter",
        description: "Unüberwindliche Festung aus Stahl und Willen – schützt Verbündete mit seinem Leben.",
        unlocksAtLevel: 3,
        bonusAbilities: ["provozieren", "eiserne_festung", "schutzaura"],
        attributeBonusOverride: { constitution: 4, strength: 2 }
      },
      {
        id: "champion",
        name: "Champion",
        description: "Unaufhaltsamer Offensivkämpfer, der jeden Gegner mit brutaler Kraft niederstreckt.",
        unlocksAtLevel: 3,
        bonusAbilities: ["furiose_attacke", "kritischer_schlag", "siegesrausch"],
        attributeBonusOverride: { strength: 5, dexterity: 1 }
      },
      {
        id: "warlord",
        name: "Kriegsherr",
        description: "Geborener Anführer, der Schlachten durch Taktik und inspirierende Befehle gewinnt.",
        unlocksAtLevel: 4,
        bonusAbilities: ["schlachtruf", "taktischer_befehl", "heldenmut"],
        attributeBonusOverride: { strength: 3, charisma: 2 }
      }
    ]
  },
  mage: {
    id: "mage",
    name: "Magier",
    description: "Zerbrechlich aber vernichtend mächtig.",
    hitDie: 6,
    baseAttack: 5,
    baseDefense: 3,
    baseHp: 60,
    baseMana: 150,
    attributeBonuses: { intelligence: 4, wisdom: 1 },
    primaryAttributes: ["intelligence", "wisdom"],
    allowedSpellSchools: ["fire", "ice", "lightning", "arcane"],
    startingItems: ["wooden_staff", "mage_robes", "mana_potion", "fireball_tome"],
    abilities: ["arcane_missile", "mana_shield"],
    levelAbilities: {
      3: ["fireball"],
      5: ["ice_nova"],
      7: ["chain_lightning"],
      10: ["meteor_storm"]
    },
    subClasses: [
      {
        id: "elementalist",
        name: "Elementarmagier",
        description: "Beherrscht die rohen Kräfte der Elemente – Feuer, Eis und Blitz gehorchen seinem Willen.",
        unlocksAtLevel: 3,
        bonusAbilities: ["elementarsturm", "elementarschild", "naturgewalt"],
        attributeBonusOverride: { intelligence: 5, wisdom: 1 },
        additionalSpellSchools: ["nature"]
      },
      {
        id: "archmage",
        name: "Erzmagier",
        description: "Höchste Stufe der reinen Magie – manipuliert die Grundstruktur der Realität.",
        unlocksAtLevel: 5,
        bonusAbilities: ["manaverstärkung", "zeitverzerrung", "arkan_dominanz"],
        attributeBonusOverride: { intelligence: 6, wisdom: 2 }
      },
      {
        id: "battlemage",
        name: "Kampfmagier",
        description: "Kombiniert arkane Macht mit körperlicher Stärke – gefährlich auf jede Distanz.",
        unlocksAtLevel: 3,
        bonusAbilities: ["magieklinge", "zauberpanzer", "entladung"],
        attributeBonusOverride: { intelligence: 3, strength: 2 }
      }
    ]
  },
  rogue: {
    id: "rogue",
    name: "Schurke",
    description: "Meister des Schattens, tödlich aus dem Hinterhalt.",
    hitDie: 8,
    baseAttack: 12,
    baseDefense: 6,
    baseHp: 80,
    baseMana: 30,
    attributeBonuses: { dexterity: 4, charisma: 1 },
    primaryAttributes: ["dexterity", "charisma"],
    allowedSpellSchools: ["shadow"],
    startingItems: ["dagger", "leather_armor", "smoke_bomb"],
    abilities: ["backstab", "stealth"],
    levelAbilities: {
      3: ["poison_blade"],
      5: ["shadow_step"],
      7: ["evasion"],
      10: ["death_mark"]
    },
    subClasses: [
      {
        id: "assassin",
        name: "Assassine",
        description: "Kaltblütiger Meuchelmörder, der Ziele mit einem einzigen tödlichen Streich eliminiert.",
        unlocksAtLevel: 3,
        bonusAbilities: ["todesstoß", "giftklinge_meister", "schleichmeister"],
        attributeBonusOverride: { dexterity: 5, strength: 1 }
      },
      {
        id: "trickster",
        name: "Trickster",
        description: "Unberechenbarer Illusionist, der Feinde verwirrt und mit Ablenkungen besiegt.",
        unlocksAtLevel: 3,
        bonusAbilities: ["blendwerk", "doppelgänger", "ablenkungsmanöver"],
        attributeBonusOverride: { dexterity: 3, charisma: 3 },
        additionalSpellSchools: ["arcane"]
      },
      {
        id: "shadowdancer",
        name: "Schattentänzer",
        description: "Bewegt sich wie ein Geist durch Schatten und schlägt aus der Dunkelheit zu.",
        unlocksAtLevel: 4,
        bonusAbilities: ["schattensprung", "dunkelheit_schleier", "schattenklon"],
        attributeBonusOverride: { dexterity: 4, wisdom: 2 },
        additionalSpellSchools: ["shadow"]
      }
    ]
  },
  cleric: {
    id: "cleric",
    name: "Kleriker",
    description: "Göttlicher Krieger, heilt Verbündete und vernichtet Untote.",
    hitDie: 8,
    baseAttack: 10,
    baseDefense: 8,
    baseHp: 90,
    baseMana: 100,
    attributeBonuses: { wisdom: 3, constitution: 2 },
    primaryAttributes: ["wisdom", "constitution"],
    allowedSpellSchools: ["holy", "shadow"],
    startingItems: ["mace", "chain_mail", "holy_symbol", "health_potion"],
    abilities: ["heal", "holy_smite"],
    levelAbilities: {
      3: ["bless"],
      5: ["turn_undead"],
      7: ["divine_shield"],
      10: ["resurrection"]
    },
    subClasses: [
      {
        id: "healer",
        name: "Heiler",
        description: "Unübertroffener Heilzauberer, der Leben rettet und Wunden mit göttlichem Licht schließt.",
        unlocksAtLevel: 3,
        bonusAbilities: ["massenheiling", "göttliche_regeneration", "wunderheilung"],
        attributeBonusOverride: { wisdom: 5, constitution: 1 }
      },
      {
        id: "war_priest",
        name: "Kriegspriester",
        description: "Furchtloser Gottesstreiter, der Feinde im Namen seiner Gottheit niederstreckt.",
        unlocksAtLevel: 3,
        bonusAbilities: ["heiliges_feuer", "göttlicher_zorn", "gesegnete_klinge"],
        attributeBonusOverride: { wisdom: 3, strength: 2 }
      },
      {
        id: "oracle",
        name: "Orakel",
        description: "Prophetische Seele, die Zukunft sieht und Schicksal beeinflusst.",
        unlocksAtLevel: 5,
        bonusAbilities: ["weissagung", "schicksalsblick", "prophezeihung"],
        attributeBonusOverride: { wisdom: 4, charisma: 2 }
      }
    ]
  },
  ranger: {
    id: "ranger",
    name: "Waldläufer",
    description: "Meister des Fernkampfes und des Überlebens in der Wildnis.",
    hitDie: 8,
    baseAttack: 11,
    baseDefense: 7,
    baseHp: 85,
    baseMana: 40,
    attributeBonuses: { dexterity: 3, wisdom: 2 },
    primaryAttributes: ["dexterity", "wisdom"],
    allowedSpellSchools: ["nature"],
    startingItems: ["short_bow", "leather_armor", "quiver", "hunting_knife"],
    abilities: ["aimed_shot", "track"],
    levelAbilities: {
      3: ["multishot"],
      5: ["animal_companion"],
      7: ["camouflage"],
      10: ["rain_of_arrows"]
    },
    subClasses: [
      {
        id: "hunter",
        name: "Jäger",
        description: "Unerbittlicher Monsterjäger, spezialisiert auf das Aufspüren und Erlegen mächtiger Kreaturen.",
        unlocksAtLevel: 3,
        bonusAbilities: ["monstertöter", "schwächepunkt_analyse", "jagdinstinkt"],
        attributeBonusOverride: { dexterity: 4, strength: 1 }
      },
      {
        id: "beastmaster",
        name: "Tiermeister",
        description: "Untrennbar mit seinen treuen Tierbegleitern verbunden, kämpft als ein Rudel.",
        unlocksAtLevel: 3,
        bonusAbilities: ["rudel_angriff", "tier_telepathie", "tieropfer"],
        attributeBonusOverride: { wisdom: 4, constitution: 1 }
      },
      {
        id: "scout",
        name: "Kundschafter",
        description: "Unübertroffener Späher und Saboteur im Dienste der Gruppe.",
        unlocksAtLevel: 4,
        bonusAbilities: ["unsichtbarkeit", "falle_meister", "geländeläufer"],
        attributeBonusOverride: { dexterity: 4, intelligence: 1 }
      }
    ]
  },
  paladin: {
    id: "paladin",
    name: "Paladin",
    description: "Heiliger Krieger, vereint göttliche Kraft mit unnachgiebiger Kampfkunst. Schützt die Schwachen mit Auren und Laysandhel.",
    hitDie: 10,
    baseAttack: 13,
    baseDefense: 9,
    baseHp: 110,
    baseMana: 80,
    attributeBonuses: { strength: 3, wisdom: 2 },
    primaryAttributes: ["strength", "wisdom"],
    allowedSpellSchools: ["holy", "fire"],
    startingItems: ["longsword", "plate_armor", "holy_symbol", "health_potion"],
    abilities: ["heilige_klinge", "laysandhel", "aura_des_schutzes"],
    levelAbilities: {
      3: ["göttlicher_schild"],
      5: ["heiliges_urteil"],
      7: ["aura_des_mutes"],
      10: ["göttliche_vergeltung"]
    },
    subClasses: [
      {
        id: "devotion",
        name: "Paladin der Hingabe",
        description: "Verkörpert höchste Tugend und Heiligkeit, leuchtet als Licht in der Dunkelheit.",
        unlocksAtLevel: 3,
        bonusAbilities: ["heiliges_licht", "segensaura", "göttliche_gunst"],
        attributeBonusOverride: { wisdom: 4, strength: 2 }
      },
      {
        id: "vengeance",
        name: "Paladin der Vergeltung",
        description: "Unnachgiebiger Rächer, der das Böse mit heiliger Wut vernichtet.",
        unlocksAtLevel: 3,
        bonusAbilities: ["vergeltungsschlag", "eifer", "unerbittliche_jagd"],
        attributeBonusOverride: { strength: 4, charisma: 2 }
      },
      {
        id: "ancients",
        name: "Paladin der Urzeit",
        description: "Hüter des Lebens und der Natur, verbündet mit uralten Kräften des Lichts.",
        unlocksAtLevel: 4,
        bonusAbilities: ["naturgeheiligtes_wort", "uralte_aura", "lebendiges_licht"],
        attributeBonusOverride: { wisdom: 3, constitution: 3 },
        additionalSpellSchools: ["nature"]
      }
    ]
  },
  necromancer: {
    id: "necromancer",
    name: "Nekromant",
    description: "Meister der Todesmagie, beschwört Untote und saugt Lebenskraft aus seinen Feinden.",
    hitDie: 6,
    baseAttack: 5,
    baseDefense: 3,
    baseHp: 65,
    baseMana: 140,
    attributeBonuses: { intelligence: 3, wisdom: 2 },
    primaryAttributes: ["intelligence", "wisdom"],
    allowedSpellSchools: ["shadow", "death"],
    startingItems: ["bone_staff", "dark_robes", "mana_potion", "soul_shard"],
    abilities: ["lebensraub", "skelett_beschwören"],
    levelAbilities: {
      3: ["seuchenfluch"],
      5: ["armee_der_toten"],
      7: ["todesaura"],
      10: ["lichform"]
    },
    subClasses: [
      {
        id: "lich",
        name: "Lich",
        description: "Hat den Tod selbst überwunden und ist zu einem Wesen unsterblicher Macht geworden.",
        unlocksAtLevel: 5,
        bonusAbilities: ["unsterblichkeit", "todesberührung", "phylakterium"],
        attributeBonusOverride: { intelligence: 5, wisdom: 2 }
      },
      {
        id: "plague_doctor",
        name: "Seuchenarzt",
        description: "Nutzt Tod und Verfall als Waffe – vergiftet, verseucht und zersetzt.",
        unlocksAtLevel: 3,
        bonusAbilities: ["tödliche_seuche", "giftwolke", "verfall_beschleunigen"],
        attributeBonusOverride: { intelligence: 3, constitution: 3 }
      },
      {
        id: "soul_harvester",
        name: "Seelenernte",
        description: "Stehlt und verbraucht Seelen gefallener Feinde, um immer mächtiger zu werden.",
        unlocksAtLevel: 4,
        bonusAbilities: ["seelenstehlen", "seelenvorrat", "todesexplosion"],
        attributeBonusOverride: { intelligence: 4, charisma: 2 },
        additionalSpellSchools: ["arcane"]
      }
    ]
  },
  druid: {
    id: "druid",
    name: "Druide",
    description: "Hüter der Natur, verwandelt sich in Tiere und kanalisiert die Urkräfte des Waldes.",
    hitDie: 8,
    baseAttack: 8,
    baseDefense: 6,
    baseHp: 95,
    baseMana: 110,
    attributeBonuses: { wisdom: 3, constitution: 2 },
    primaryAttributes: ["wisdom", "constitution"],
    allowedSpellSchools: ["nature", "holy"],
    startingItems: ["wooden_staff", "leather_armor", "herb_pouch", "nature_tome"],
    abilities: ["tiergestalt", "naturheilung"],
    levelAbilities: {
      3: ["dornenranken"],
      5: ["ruf_des_rudels"],
      7: ["naturkatastrophe"],
      10: ["weltbaum_erwachen"]
    },
    subClasses: [
      {
        id: "circle_of_moon",
        name: "Kreis des Mondes",
        description: "Meisterhafte Gestaltwandler, die mächtige und exotische Tierformen annehmen.",
        unlocksAtLevel: 3,
        bonusAbilities: ["kampftier", "elementargestalt", "wildform_meister"],
        attributeBonusOverride: { constitution: 4, strength: 2 }
      },
      {
        id: "circle_of_land",
        name: "Kreis des Landes",
        description: "Kanalisiert die Magie des Landes und beherrscht mächtige Elementarzauber.",
        unlocksAtLevel: 3,
        bonusAbilities: ["landmagie", "naturzyklus", "urkraft"],
        attributeBonusOverride: { wisdom: 5, intelligence: 1 },
        additionalSpellSchools: ["lightning"]
      },
      {
        id: "circle_of_spores",
        name: "Kreis der Sporen",
        description: "Nutzt den Kreislauf von Tod und Erneuerung – Fäulnis und Wachstum als Waffe.",
        unlocksAtLevel: 4,
        bonusAbilities: ["sporenausbruch", "symbiontenrüstung", "nekrotischer_pilz"],
        attributeBonusOverride: { wisdom: 3, constitution: 3 },
        additionalSpellSchools: ["death"]
      }
    ]
  },
  bard: {
    id: "bard",
    name: "Barde",
    description: "Inspirierender Künstler, der durch Lieder und Geschichten verbündete stärkt und Feinde schwächt.",
    hitDie: 8,
    baseAttack: 9,
    baseDefense: 6,
    baseHp: 80,
    baseMana: 100,
    attributeBonuses: { charisma: 4, dexterity: 1 },
    primaryAttributes: ["charisma", "dexterity"],
    allowedSpellSchools: ["arcane", "nature"],
    startingItems: ["lute", "leather_armor", "dagger", "inspiration_tome"],
    abilities: ["bardenlied", "inspirierende_note"],
    levelAbilities: {
      3: ["bezaubernde_melodie"],
      5: ["kriegshymne"],
      7: ["lied_der_ruhe"],
      10: ["episches_lied"]
    },
    subClasses: [
      {
        id: "college_of_lore",
        name: "Kolleg des Wissens",
        description: "Unerschöpflicher Wissensspeicher, der Geheimnisse der Welt in Lieder webt.",
        unlocksAtLevel: 3,
        bonusAbilities: ["schneidende_worte", "bonus_fähigkeit", "magiediebstahl"],
        attributeBonusOverride: { charisma: 4, intelligence: 2 },
        additionalSpellSchools: ["arcane"]
      },
      {
        id: "college_of_valor",
        name: "Kolleg der Tapferkeit",
        description: "Kampfbarde, der mitten in der Schlacht singt und Verbündete zu Heldentaten anspornt.",
        unlocksAtLevel: 3,
        bonusAbilities: ["kampfinspieration", "extra_angriff", "magische_geheimnisse"],
        attributeBonusOverride: { charisma: 3, strength: 2 }
      },
      {
        id: "college_of_glamour",
        name: "Kolleg des Glanzes",
        description: "Bezaubert und betört durch übernatürliche Anziehungskraft und feenartige Magie.",
        unlocksAtLevel: 4,
        bonusAbilities: ["ummantelnder_glanz", "mantel_der_inspiration", "erzwungene_ruhe"],
        attributeBonusOverride: { charisma: 5, wisdom: 1 }
      }
    ]
  },
  monk: {
    id: "monk",
    name: "Mönch",
    description: "Meister des unbewaffneten Kampfes, kanalisiert Ki-Energie für übernatürliche Fähigkeiten und Schnelligkeit.",
    hitDie: 8,
    baseAttack: 13,
    baseDefense: 8,
    baseHp: 90,
    baseMana: 0,
    attributeBonuses: { dexterity: 3, wisdom: 2 },
    primaryAttributes: ["dexterity", "wisdom"],
    allowedSpellSchools: [],
    startingItems: ["monk_robes", "handwraps", "health_potion"],
    abilities: ["ki_schlag", "blitzreflexe"],
    levelAbilities: {
      3: ["betäubender_schlag"],
      5: ["ki_entladung"],
      7: ["diamantseele"],
      10: ["leerer_körper"]
    },
    subClasses: [
      {
        id: "way_of_shadow",
        name: "Weg des Schattens",
        description: "Verbindet Kampfkünste mit Schattenmagie zu tödlicher Unsichtbarkeit und Stille.",
        unlocksAtLevel: 3,
        bonusAbilities: ["schattenschritt", "schattenkloak", "stille_des_dunkels"],
        attributeBonusOverride: { dexterity: 4, wisdom: 2 },
        additionalSpellSchools: ["shadow"]
      },
      {
        id: "way_of_open_hand",
        name: "Weg der offenen Hand",
        description: "Vollkommenheit im unbewaffneten Kampf, kann Feinde schleudern, lähmen oder töten.",
        unlocksAtLevel: 3,
        bonusAbilities: ["offene_hand_technik", "vollkommenheit_des_selbst", "quivering_palm"],
        attributeBonusOverride: { dexterity: 3, constitution: 3 }
      },
      {
        id: "way_of_four_elements",
        name: "Weg der vier Elemente",
        description: "Beherrscht Elementarkräfte durch Ki und entfesselt sie in Kampf.",
        unlocksAtLevel: 4,
        bonusAbilities: ["elementarfaust", "feuerwind", "erderschütterung"],
        attributeBonusOverride: { wisdom: 4, dexterity: 2 },
        additionalSpellSchools: ["fire", "lightning"]
      }
    ]
  },
  shaman: {
    id: "shaman",
    name: "Schamane",
    description: "Geisterbeschwörer und Elementarzauberer, kommuniziert mit Ahnen und setzt Totems als strategische Werkzeuge.",
    hitDie: 8,
    baseAttack: 8,
    baseDefense: 5,
    baseHp: 85,
    baseMana: 120,
    attributeBonuses: { wisdom: 3, constitution: 2 },
    primaryAttributes: ["wisdom", "constitution"],
    allowedSpellSchools: ["nature", "lightning"],
    startingItems: ["spirit_staff", "hide_armor", "totem_carving", "spirit_potion"],
    abilities: ["geisterruf", "erdtotem"],
    levelAbilities: {
      3: ["blitztotem"],
      5: ["ahnengeist"],
      7: ["elementarsturm"],
      10: ["großer_geist"]
    },
    subClasses: [
      {
        id: "elemental",
        name: "Elementarschamane",
        description: "Ruft die rohe Kraft der Elemente und kanalisiert sie in vernichtende Angriffe.",
        unlocksAtLevel: 3,
        bonusAbilities: ["elementarflut", "sturmanruf", "erdwall"],
        attributeBonusOverride: { wisdom: 4, intelligence: 2 },
        additionalSpellSchools: ["fire"]
      },
      {
        id: "restoration",
        name: "Heilschamane",
        description: "Nutzt Geisterkraft zur Heilung und Stärkung der Gruppe.",
        unlocksAtLevel: 3,
        bonusAbilities: ["geisterheilung", "ahnengeist_heilung", "totem_des_lebens"],
        attributeBonusOverride: { wisdom: 5, constitution: 1 },
        additionalSpellSchools: ["holy"]
      },
      {
        id: "spirit_walker",
        name: "Geisterwanderer",
        description: "Wandert zwischen Geisterwelt und Realität – unsichtbar und allwissend.",
        unlocksAtLevel: 4,
        bonusAbilities: ["geisterwandel", "geistersicht", "jenseits_blick"],
        attributeBonusOverride: { wisdom: 4, dexterity: 2 },
        additionalSpellSchools: ["shadow"]
      }
    ]
  },
  warlock: {
    id: "warlock",
    name: "Hexenmeister",
    description: "Hat einen Pakt mit dunklen Mächten geschlossen und kanalisiert deren Kraft durch Eldritch-Blast und Flüche.",
    hitDie: 8,
    baseAttack: 9,
    baseDefense: 5,
    baseHp: 75,
    baseMana: 120,
    attributeBonuses: { charisma: 3, intelligence: 2 },
    primaryAttributes: ["charisma", "intelligence"],
    allowedSpellSchools: ["shadow", "arcane"],
    startingItems: ["eldritch_focus", "dark_leather_armor", "pact_tome"],
    abilities: ["eldritch_blast", "hexenfluch"],
    levelAbilities: {
      3: ["paktmagie"],
      5: ["dunkler_schild"],
      7: ["eldritch_meister"],
      10: ["dunkler_gott_ruf"]
    },
    subClasses: [
      {
        id: "fiend_pact",
        name: "Teufelspakt",
        description: "Dient einem mächtigen Teufel und erhält dämonische Macht über Feuer und Vernichtung.",
        unlocksAtLevel: 3,
        bonusAbilities: ["höllisches_tadeln", "dunkelsegens_glück", "höllenfeuer"],
        attributeBonusOverride: { charisma: 4, constitution: 2 },
        additionalSpellSchools: ["fire"]
      },
      {
        id: "great_old_one_pact",
        name: "Pakt des Großen Alten",
        description: "Geistiger Kontakt mit einem kosmischen Wesen jenseits des Verstehens.",
        unlocksAtLevel: 3,
        bonusAbilities: ["gedankenkontrolle", "kosmischer_schrecken", "erwachende_enthüllung"],
        attributeBonusOverride: { intelligence: 3, charisma: 3 }
      },
      {
        id: "hexblade_pact",
        name: "Hexklingenpakt",
        description: "Pakt mit einem mysteriösen Wesen der Schattenwaffen – Klinge und Fluch vereint.",
        unlocksAtLevel: 4,
        bonusAbilities: ["hexklinge_fluch", "geisterklinge", "hexklinge_schutz"],
        attributeBonusOverride: { charisma: 3, strength: 3 }
      }
    ]
  },
  berserker: {
    id: "berserker",
    name: "Berserker",
    description: "Extremkampfmaschine aus Wut und Schmerz – verletzt sich selbst für überwältigende Macht.",
    hitDie: 12,
    baseAttack: 17,
    baseDefense: 5,
    baseHp: 130,
    baseMana: 0,
    attributeBonuses: { strength: 4, constitution: 2 },
    primaryAttributes: ["strength", "constitution"],
    allowedSpellSchools: [],
    startingItems: ["great_axe", "fur_armor", "health_potion", "war_paint"],
    abilities: ["rasende_wut", "schmerz_als_kraft"],
    levelAbilities: {
      3: ["blutdurst"],
      5: ["frenzy_schlag"],
      7: ["unaufhaltsam"],
      10: ["göttlicher_wahnsinn"]
    },
    subClasses: [
      {
        id: "totem_warrior",
        name: "Totemkrieger",
        description: "Kanalisiert den Geist eines mächtigen Tieres und übernimmt dessen Kampfkraft.",
        unlocksAtLevel: 3,
        bonusAbilities: ["bär_totem", "adler_totem", "wolf_totem"],
        attributeBonusOverride: { strength: 4, constitution: 3 }
      },
      {
        id: "battlerager",
        name: "Kampfrasender",
        description: "Schlägt noch wilder, je mehr Schaden er einsteckt – Schmerz macht ihn stärker.",
        unlocksAtLevel: 3,
        bonusAbilities: ["schmerz_rausch", "kampfraserei", "blutbad"],
        attributeBonusOverride: { strength: 5, constitution: 1 }
      },
      {
        id: "ancestral_guardian",
        name: "Ahnenwächter",
        description: "Ruft die Geister gefallener Vorfahren als Schutz und Bedrohung herbei.",
        unlocksAtLevel: 4,
        bonusAbilities: ["ahnengeister_rufen", "geistertäuschung", "ahnenfluch"],
        attributeBonusOverride: { strength: 3, wisdom: 3 }
      }
    ]
  },
  artificer: {
    id: "artificer",
    name: "Artifizier",
    description: "Genialer Magietechniker, baut magische Konstrukte und beherrscht Runenkunde.",
    hitDie: 8,
    baseAttack: 8,
    baseDefense: 7,
    baseHp: 80,
    baseMana: 100,
    attributeBonuses: { intelligence: 3, dexterity: 2 },
    primaryAttributes: ["intelligence", "dexterity"],
    allowedSpellSchools: ["arcane"],
    startingItems: ["arcane_wrench", "light_armor", "construct_kit", "rune_tome"],
    abilities: ["konstrukt_erschaffen", "rune_aktivieren"],
    levelAbilities: {
      3: ["magische_waffe"],
      5: ["golem_herbeirufen"],
      7: ["runenexplosion"],
      10: ["koloss_konstrukt"]
    },
    subClasses: [
      {
        id: "alchemist",
        name: "Alchemist",
        description: "Meister der Trankmischung und chemischer Reaktionen – heilt und vernichtet mit Substanzen.",
        unlocksAtLevel: 3,
        bonusAbilities: ["meistertrank", "säurespritzer", "heilelixier"],
        attributeBonusOverride: { intelligence: 4, wisdom: 2 },
        additionalSpellSchools: ["nature"]
      },
      {
        id: "artillerist",
        name: "Artillerist",
        description: "Baut magische Geschütze und Sprengvorrichtungen für maximale Zerstörung.",
        unlocksAtLevel: 3,
        bonusAbilities: ["arkan_kanone", "explosivgeschoss", "feuerschild"],
        attributeBonusOverride: { intelligence: 4, dexterity: 2 },
        additionalSpellSchools: ["fire"]
      },
      {
        id: "battle_smith",
        name: "Kampfschmied",
        description: "Erschafft und kämpft neben einem magischen Stahlwächter-Konstrukt.",
        unlocksAtLevel: 3,
        bonusAbilities: ["stahlwächter", "arkan_waffenmeister", "kampfkonstrukt"],
        attributeBonusOverride: { intelligence: 3, strength: 2 }
      }
    ]
  },
  hexblade: {
    id: "hexblade",
    name: "Hexklingenträger",
    description: "Hybrid aus Nahkämpfer und Magier – führt eine verfluchte Waffe und kombiniert Klinge mit arkaner Macht.",
    hitDie: 8,
    baseAttack: 12,
    baseDefense: 7,
    baseHp: 85,
    baseMana: 90,
    attributeBonuses: { charisma: 3, strength: 2 },
    primaryAttributes: ["charisma", "strength"],
    allowedSpellSchools: ["shadow", "arcane"],
    startingItems: ["cursed_blade", "half_plate", "hex_focus", "soul_shard"],
    abilities: ["hexenklinge", "fluchklinge"],
    levelAbilities: {
      3: ["geisterklinge"],
      5: ["seelenschnitt"],
      7: ["fluchmeister"],
      10: ["seelenernte_klinge"]
    },
    subClasses: [
      {
        id: "shadow_blade",
        name: "Schattenklinge",
        description: "Meistert Waffen aus reiner Schattensubstanz – tödlich und flüchtig wie Dunkelheit.",
        unlocksAtLevel: 3,
        bonusAbilities: ["schattenwaffe", "dunkelheitsschritt", "schattenfusion"],
        attributeBonusOverride: { charisma: 4, dexterity: 2 },
        additionalSpellSchools: ["shadow"]
      },
      {
        id: "curse_bringer",
        name: "Fluchbringer",
        description: "Spezialist für anhaltende und sich verstärkende Flüche auf Feinden.",
        unlocksAtLevel: 3,
        bonusAbilities: ["anhaltender_fluch", "fluchverbreitung", "des_fluches_ernte"],
        attributeBonusOverride: { charisma: 5, intelligence: 1 }
      },
      {
        id: "soul_reaper",
        name: "Seelenreaper",
        description: "Erntet Seelen gefallener Feinde, um Kraft und Fähigkeiten zu verstärken.",
        unlocksAtLevel: 5,
        bonusAbilities: ["seelen_schnitter", "seelenvorrat_klinge", "todesklinge"],
        attributeBonusOverride: { charisma: 3, strength: 3 },
        additionalSpellSchools: ["death"]
      }
    ]
  }
}

export function getClass(id: string): CharacterClass | undefined {
  return CHARACTER_CLASSES[id]
}

export function getAllClasses(): CharacterClass[] {
  return Object.values(CHARACTER_CLASSES)
}

export function getSubClass(classId: string, subClassId: string): SubClass | undefined {
  return CHARACTER_CLASSES[classId]?.subClasses?.find(sc => sc.id === subClassId)
}
