import { Attribute, AttributeModifiers, CharacterClass, SpellSchool } from "./classes"
import { Spell } from "./spells"

export type CompanionPersonality =
  | "loyal"
  | "sarcastic"
  | "mysterious"
  | "cheerful"
  | "brooding"
  | "wise"
  | "reckless"
  | "cunning"

export type CompanionRelationship = {
  level: number // 0-100 (0=stranger, 100=soulbound)
  affinity: "positive" | "neutral" | "negative"
  unlocks: Record<number, string[]> // relationship level → unlocked dialogue/quests/abilities
}

export type CompanionCombatRole = "tank" | "healer" | "dps_melee" | "dps_ranged" | "support" | "mage"

export type Companion = {
  id: string
  name: string
  title: string
  description: string
  race: string
  classId: string
  personality: CompanionPersonality
  combatRole: CompanionCombatRole
  baseStats: {
    strength: number
    dexterity: number
    intelligence: number
    wisdom: number
    constitution: number
    charisma: number
    hp: number
    mana: number
    attack: number
    defense: number
    speed: number
  }
  abilities: string[]
  passiveTraits: string[]
  startingEquipment: string[]
  relationship: CompanionRelationship
  recruitCondition: string
  personalQuestId?: string
  dialogueTreeId?: string
  favoredFactions: string[]
  hatedFactions: string[]
  reactsTo: string[]
}

export const COMPANIONS: Companion[] = [
  {
    id: "kael_eisenherz",
    name: "Kael Eisenherz",
    title: "Der gefallene Paladin",
    description:
      "Kael war einst ein stolzer Ritter der Eisernen Krone, bis er befohlen wurde, ein unschuldiges Dorf niederzubrennen. Er weigerte sich, floh und wurde zum Verräter erklärt. Seitdem wandert er als Büßer durch das Land, sucht Vergebung und kämpft für die Schwachen. Sein Glaube an das Licht flackert noch, auch wenn die Kirche ihn verstoßen hat.",
    race: "human",
    classId: "paladin",
    personality: "loyal",
    combatRole: "tank",
    baseStats: {
      strength: 18,
      dexterity: 10,
      intelligence: 10,
      wisdom: 14,
      constitution: 17,
      charisma: 13,
      hp: 130,
      mana: 60,
      attack: 20,
      defense: 22,
      speed: 8,
    },
    abilities: ["lay_on_hands_spell", "aura_of_protection", "crusader_strike", "divine_shield", "holy_smite"],
    passiveTraits: ["iron_will", "shield_mastery", "divine_resilience", "inspiring_presence"],
    startingEquipment: ["iron_sword", "plate_armor", "holy_symbol"],
    relationship: {
      level: 0,
      affinity: "neutral",
      unlocks: {
        20: ["dialogue_kael_past", "ability_holy_ground"],
        40: ["quest_kaels_redemption", "dialogue_kael_iron_crown"],
        60: ["ability_sacred_oath", "dialogue_kael_faith"],
        80: ["quest_reclaim_honor", "ability_divine_wrath"],
        100: ["dialogue_kael_soulbound", "ability_avatar_of_light", "title_Kaels_Champion"],
      },
    },
    recruitCondition:
      "Kael wird im Dorf Aschenfeld angetroffen, wo er gerade alleine gegen eine Gruppe von Eisenkronen-Söldnern kämpft, die das Dorf bedrohen. Hilf ihm, die Söldner zu vertreiben. Danach bietet er sich als Begleiter an, solange der Spieler keine bösen Absichten verfolgt.",
    personalQuestId: "quest_kaels_redemption",
    dialogueTreeId: "dialogue_tree_kael",
    favoredFactions: ["church_of_light", "merchants_league"],
    hatedFactions: ["shadow_guild", "undead_covenant", "iron_crown"],
    reactsTo: [
      "protect_innocent",
      "spare_enemy",
      "donate_to_poor",
      "attack_civilian",
      "join_shadow_guild",
      "desecrate_shrine",
    ],
  },
  {
    id: "lyria_mondpfeil",
    name: "Lyria Mondpfeil",
    title: "Die ewige Späher",
    description:
      "Lyria ist eine uralte Elfenspäherin, deren wahres Alter selbst sie nicht mehr genau kennt. Sie trägt ein Geheimnis über den Ursprung der Welt, das sie in einer versteckten Elfenruine entdeckte – ein Wissen, das sie seitdem verfolgt. Sie bewegt sich im Verborgenen, spricht wenig, beobachtet alles und vertraut niemandem leichtfertig.",
    race: "elf",
    classId: "ranger",
    personality: "mysterious",
    combatRole: "dps_ranged",
    baseStats: {
      strength: 11,
      dexterity: 20,
      intelligence: 14,
      wisdom: 16,
      constitution: 11,
      charisma: 12,
      hp: 95,
      mana: 80,
      attack: 22,
      defense: 14,
      speed: 14,
    },
    abilities: ["aimed_shot", "multishot", "entangle", "shadow_step"],
    passiveTraits: ["eagle_eye", "forest_stride", "ancient_knowledge", "silent_hunter"],
    startingEquipment: ["short_bow", "leather_armor", "quiver"],
    relationship: {
      level: 0,
      affinity: "neutral",
      unlocks: {
        20: ["dialogue_lyria_origins", "ability_moonshot"],
        40: ["quest_lyria_secret", "dialogue_lyria_ruins"],
        60: ["ability_phantom_arrow", "dialogue_lyria_truth"],
        80: ["quest_the_ancient_revelation", "ability_rain_of_arrows"],
        100: ["dialogue_lyria_soulbound", "ability_worldsong_arrow", "title_Keeper_of_Secrets"],
      },
    },
    recruitCondition:
      "Lyria beobachtet den Spieler aus dem Verborgenen, während dieser eine alten Elfenruine erkundet. Wenn der Spieler die Ruine respektvoll behandelt und keine Artefakte zerstört, tritt sie aus dem Schatten und bietet ihre Dienste an. Sie lehnt kategorisch ab, wenn der Spieler zuvor Elfenstätten geplündert oder die Walddruiden beleidigt hat.",
    personalQuestId: "quest_lyria_secret",
    dialogueTreeId: "dialogue_tree_lyria",
    favoredFactions: ["forest_druids"],
    hatedFactions: ["iron_crown", "orcish_horde", "undead_covenant"],
    reactsTo: [
      "preserve_nature",
      "respect_ruins",
      "befriend_animals",
      "destroy_forest",
      "loot_sacred_site",
      "kill_wildlife_needlessly",
    ],
  },
  {
    id: "torvin_glutfaust",
    name: "Torvin Glutfaust",
    title: "Der verstoßene Sohn",
    description:
      "Torvin wurde aus den Bergklans verbannt, nachdem er in einem Wutanfall seinen eigenen Clanchef herausforderte und fast tötete. Er bereut die Verbannung nicht, aber die Scham brennt in ihm wie glühende Kohle. Ohne Clan und ohne Heimat lebt er nur für den Kampf, und wer ihm zur Seite steht, gewinnt einen erbitterten Kämpfer – solange er ihn kämpfen lässt.",
    race: "dwarf",
    classId: "berserker",
    personality: "reckless",
    combatRole: "dps_melee",
    baseStats: {
      strength: 21,
      dexterity: 10,
      intelligence: 7,
      wisdom: 8,
      constitution: 19,
      charisma: 8,
      hp: 150,
      mana: 30,
      attack: 26,
      defense: 13,
      speed: 9,
    },
    abilities: ["berserker_rage", "power_strike", "thunder_clap"],
    passiveTraits: ["dwarven_resilience", "battle_fury", "unstoppable", "pain_tolerance"],
    startingEquipment: ["great_axe", "fur_armor", "health_potion"],
    relationship: {
      level: 0,
      affinity: "neutral",
      unlocks: {
        20: ["dialogue_torvin_clan", "ability_reckless_charge"],
        40: ["quest_torvin_exile", "dialogue_torvin_honor"],
        60: ["ability_war_cry", "dialogue_torvin_scars"],
        80: ["quest_return_to_the_mountains", "ability_titan_smash"],
        100: ["dialogue_torvin_soulbound", "ability_ancestral_fury", "title_Blooded_Companion"],
      },
    },
    recruitCondition:
      "Torvin ist in einer Hafentaverne anzutreffen, wo er gerade einen Schlägerei mit vier Männern gleichzeitig verliert – obwohl er ihnen gute Gegenwehr bietet. Hilf ihm, indem du die Männer besiegst oder versckeuchst. Er schließt sich an, ohne viele Worte zu machen, und erwartet vom Spieler, dass er ihn kämpfen lässt, ohne ihn zu zügeln.",
    personalQuestId: "quest_torvin_exile",
    dialogueTreeId: "dialogue_tree_torvin",
    favoredFactions: ["mountain_clans", "sea_brotherhood"],
    hatedFactions: ["iron_crown", "undead_covenant", "shadow_guild"],
    reactsTo: [
      "charge_into_battle",
      "fight_outnumbered",
      "refuse_retreat",
      "sneak_past_enemies",
      "negotiate_surrender",
      "show_mercy_to_strong_foe",
    ],
  },
  {
    id: "seraphine",
    name: "Seraphine",
    title: "Die reumütige Teuflerin",
    description:
      "Seraphine schloss einst einen Pakt mit einem Höllenarchon, um ihre sterbende Mutter zu retten – der Archon heilte die Mutter und nahm stattdessen Seraphines Seelenlicht. Seitdem ist sie zynisch, bissig und betäubt ihren Schmerz mit dunklem Humor. Trotzdem kämpft sie im Grunde für das Gute, auch wenn sie es niemals zugeben würde.",
    race: "tiefling",
    classId: "warlock",
    personality: "sarcastic",
    combatRole: "mage",
    baseStats: {
      strength: 9,
      dexterity: 14,
      intelligence: 19,
      wisdom: 11,
      constitution: 11,
      charisma: 18,
      hp: 90,
      mana: 130,
      attack: 16,
      defense: 11,
      speed: 11,
    },
    abilities: ["eldritch_blast", "hex", "hellfire", "dark_pact", "fear"],
    passiveTraits: ["infernal_heritage", "dark_vision", "pact_empowerment", "shadow_affinity"],
    startingEquipment: ["eldritch_focus", "dark_robes", "mana_potion"],
    relationship: {
      level: 0,
      affinity: "neutral",
      unlocks: {
        20: ["dialogue_seraphine_pact", "ability_eldritch_chains"],
        40: ["quest_seraphines_debt", "dialogue_seraphine_mother"],
        60: ["ability_soul_rend", "dialogue_seraphine_regret"],
        80: ["quest_break_the_pact", "ability_infernal_rebuke"],
        100: ["dialogue_seraphine_soulbound", "ability_reclaimed_soul", "title_Her_Unlikely_Champion"],
      },
    },
    recruitCondition:
      "Seraphine sitzt in einem Buchladen in der Stadt und liest gelangweilt verbotene Grimoires. Sie schließt sich dem Spieler an, wenn dieser ihr beweist, nützlich zu sein – entweder durch einen schwierigen Kampf in ihrer Nähe oder indem man ihr ein seltenes magisches Artefakt anbietet. Sie lehnt religiöse Charaktere anfangs mit beißendem Sarkasmus ab, kann aber durch Beharrlichkeit überzeugt werden.",
    personalQuestId: "quest_seraphines_debt",
    dialogueTreeId: "dialogue_tree_seraphine",
    favoredFactions: ["arcane_circle", "shadow_guild"],
    hatedFactions: ["church_of_light", "iron_crown"],
    reactsTo: [
      "use_dark_magic",
      "make_a_bargain",
      "outsmart_enemy",
      "pray_at_shrine",
      "blindly_follow_orders",
      "sacrifice_ally",
    ],
  },
  {
    id: "bruder_aldric",
    name: "Bruder Aldric",
    title: "Der zweifelnde Mönch",
    description:
      "Aldric war ein frommer Reisemönch der Kirche des Lichts, bis er ein Massaker bezeugte, das im Namen des Lichts befohlen wurde. Seitdem zweifelt er an allem, woran er glaubte, betet aber weiterhin – aus Gewohnheit oder Hoffnung, er weiß es selbst nicht. Er heilt jeden, der Hilfe braucht, ganz gleich ob Heiliger oder Sünder, denn das scheint ihm das Einzige zu sein, was wirklich stimmt.",
    race: "human",
    classId: "cleric",
    personality: "wise",
    combatRole: "healer",
    baseStats: {
      strength: 13,
      dexterity: 9,
      intelligence: 14,
      wisdom: 20,
      constitution: 13,
      charisma: 14,
      hp: 105,
      mana: 120,
      attack: 13,
      defense: 15,
      speed: 9,
    },
    abilities: ["heal", "mass_heal", "bless", "divine_shield", "purify"],
    passiveTraits: ["healing_hands", "inner_peace", "light_of_dawn", "theological_insight"],
    startingEquipment: ["mace", "chain_mail", "holy_symbol"],
    relationship: {
      level: 0,
      affinity: "positive",
      unlocks: {
        20: ["dialogue_aldric_doubt", "ability_greater_heal"],
        40: ["quest_aldrics_crisis", "dialogue_aldric_massacre"],
        60: ["ability_sanctuary", "dialogue_aldric_faith_tested"],
        80: ["quest_truth_of_the_light", "ability_miracle"],
        100: ["dialogue_aldric_soulbound", "ability_divine_intervention", "title_Blessed_Companion"],
      },
    },
    recruitCondition:
      "Bruder Aldric ist auf einer Landstraße anzutreffen, wo er gerade einen verwundeten Banditen versorgt, den er soeben im Kampf selbst niedergestreckt hat. Er schließt sich dem Spieler freiwillig an, sucht er doch Begleitung auf seiner Pilgerreise. Er fragt nur, ob der Spieler plant, Unschuldige zu töten – und wenn die Antwort glaubhaft 'Nein' ist, kommt er mit.",
    personalQuestId: "quest_aldrics_crisis",
    dialogueTreeId: "dialogue_tree_aldric",
    favoredFactions: ["church_of_light", "merchants_league", "forest_druids"],
    hatedFactions: ["undead_covenant", "shadow_guild"],
    reactsTo: [
      "heal_enemy",
      "spare_wounded",
      "help_civilians",
      "murder_prisoners",
      "desecrate_holy_place",
      "use_necromancy",
    ],
  },
  {
    id: "zara_schattenklinge",
    name: "Zara Schattenklinge",
    title: "Die freie Klinge",
    description:
      "Zara wuchs in der Schattengilde auf, trainierte von Kindesbeinen an als Meuchelmörderin und tötete auf Befehl, ohne zu fragen. Als man ihr befahl, ein Kind zu ermorden, verweigerte sie den Auftrag und floh – seitdem steht die Gilde auf ihrer Abschussliste, und sie auf ihrer. Als Söldnerin lebt sie von Job zu Job, kalkuliert jeden Schritt, vertraut niemandem sofort und hält ihr Wort, wenn sie es einmal gibt.",
    race: "dark_elf",
    classId: "rogue",
    personality: "cunning",
    combatRole: "dps_melee",
    baseStats: {
      strength: 12,
      dexterity: 21,
      intelligence: 16,
      wisdom: 12,
      constitution: 10,
      charisma: 14,
      hp: 88,
      mana: 70,
      attack: 24,
      defense: 13,
      speed: 16,
    },
    abilities: ["shadow_step", "poison_blade", "shadow_bolt"],
    passiveTraits: ["shadow_meld", "poisoner", "acrobatics", "dark_elf_heritage"],
    startingEquipment: ["shadow_blade", "dark_leather_armor", "smoke_bomb"],
    relationship: {
      level: 0,
      affinity: "neutral",
      unlocks: {
        20: ["dialogue_zara_guild", "ability_crippling_strike"],
        40: ["quest_zaras_bounty", "dialogue_zara_the_child"],
        60: ["ability_death_mark", "dialogue_zara_trust"],
        80: ["quest_topple_the_shadow_guild", "ability_shadowstrike_combo"],
        100: ["dialogue_zara_soulbound", "ability_phantom_dance", "title_Shadow_Partner"],
      },
    },
    recruitCondition:
      "Zara wird in einem Stadtgefängnis angetroffen, wo sie auf ihre Hinrichtung wartet – zu Unrecht beschuldigt von Gildenspionen. Hilf ihr bei der Flucht oder beweise vor dem Stadtrat ihre Unschuld. Sie schließt sich als Bezahlung an, aber nur für eine bestimmte Zeit – es sei denn, man beweist ihr im Laufe der Zeit, dass es sich lohnt zu bleiben.",
    personalQuestId: "quest_zaras_bounty",
    dialogueTreeId: "dialogue_tree_zara",
    favoredFactions: ["sea_brotherhood", "merchants_league"],
    hatedFactions: ["shadow_guild", "iron_crown", "church_of_light"],
    reactsTo: [
      "plan_before_acting",
      "use_deception",
      "honor_a_contract",
      "blindly_trust_strangers",
      "work_for_free",
      "join_shadow_guild",
    ],
  },
  {
    id: "mira_sprühfunke",
    name: "Mira Sprühfunke",
    title: "Die wilde Erfinderien",
    description:
      "Mira ist eine gnomische Artifizerin mit einem unbändigen Enthusiasmus für Experimente, die meistens explodieren – manchmal absichtlich. Sie baute ihren ersten Golem im Alter von zwölf Jahren aus Kochtöpfen und einer Uhr, und seitdem hat sie nie aufgehört zu basteln. Ihre Erfindungen sind launisch, genial und gelegentlich gefährlich für die eigene Seite, aber Mira bleibt dabei stets strahlend gut gelaunt.",
    race: "gnome",
    classId: "artificer",
    personality: "cheerful",
    combatRole: "support",
    baseStats: {
      strength: 7,
      dexterity: 16,
      intelligence: 20,
      wisdom: 13,
      constitution: 10,
      charisma: 15,
      hp: 80,
      mana: 110,
      attack: 14,
      defense: 12,
      speed: 12,
    },
    abilities: ["emp_pulse", "stone_skin", "inspire_courage", "arcane_explosion"],
    passiveTraits: ["tinker", "golem_master", "quick_assembly", "arcane_innovation"],
    startingEquipment: ["arcane_wrench", "light_armor", "construct_kit"],
    relationship: {
      level: 0,
      affinity: "positive",
      unlocks: {
        20: ["dialogue_mira_inventions", "ability_deploy_turret"],
        40: ["quest_miras_masterwork", "dialogue_mira_academy"],
        60: ["ability_arcane_overcharge", "dialogue_mira_dream_golem"],
        80: ["quest_the_great_golem", "ability_mech_companion"],
        100: ["dialogue_mira_soulbound", "ability_titan_golem", "item_miras_pocket_cannon"],
      },
    },
    recruitCondition:
      "Mira ist in einer Waffenschmiede am Stadtrand anzutreffen, wo sie gerade einen ihrer Golems demonstriert, der unkontrolliert um sich schlägt. Hilf ihr, den Golem zu stoppen (Kampf oder Kreativität), und sie ist sofort begeistert. Sie schließt sich dem Spieler an, weil Abenteuer das beste Testgelände für ihre Erfindungen sind.",
    personalQuestId: "quest_miras_masterwork",
    dialogueTreeId: "dialogue_tree_mira",
    favoredFactions: ["arcane_circle", "merchants_league"],
    hatedFactions: ["orcish_horde", "undead_covenant"],
    reactsTo: [
      "use_gadget_or_tool",
      "find_rare_components",
      "support_research",
      "destroy_knowledge",
      "dismiss_technology",
      "burn_a_library",
    ],
  },
  {
    id: "korgath",
    name: "Korgath",
    title: "Der Seelenflüsterer",
    description:
      "Korgath ist ein Halbork-Schamane, der die Geister der Toten seines gefallenen Clans sprechen hört – ein Clan, der durch Verrat der Eisernen Krone ausgelöscht wurde. Er ist still, in sich gekehrt und trägt eine schwere Last, aber seine Verbindung zu den Geisterwelten macht ihn zu einem unschätzbaren Bundesgenossen. Er sucht keinen Krieg, aber er sucht Gerechtigkeit für seine Toten.",
    race: "half_orc",
    classId: "shaman",
    personality: "brooding",
    combatRole: "support",
    baseStats: {
      strength: 16,
      dexterity: 10,
      intelligence: 13,
      wisdom: 19,
      constitution: 15,
      charisma: 9,
      hp: 110,
      mana: 100,
      attack: 17,
      defense: 14,
      speed: 10,
    },
    abilities: ["chain_heal", "ghost_wolf", "earth_totem", "summon_spirit_wolf"],
    passiveTraits: ["spirit_sight", "ancestral_guidance", "orcish_endurance", "hex_ward"],
    startingEquipment: ["spirit_staff", "hide_armor", "totem_carving"],
    relationship: {
      level: 0,
      affinity: "neutral",
      unlocks: {
        20: ["dialogue_korgath_clan", "ability_spirit_bond"],
        40: ["quest_korgaths_vengeance", "dialogue_korgath_the_dead"],
        60: ["ability_ancestral_shield", "dialogue_korgath_peace"],
        80: ["quest_rest_the_fallen", "ability_spirit_army"],
        100: ["dialogue_korgath_soulbound", "ability_world_spirit_channeling", "title_Spirit_Bound"],
      },
    },
    recruitCondition:
      "Korgath ist allein bei einem alten Scheiterhaufen in einer verbrannten Dorfruine anzutreffen – den Überresten seines Clans. Er spricht gerade mit unsichtbaren Geistern. Wer ihn in Ruhe lässt und nicht spottet, erhält nach einem Moment das Angebot, ihn zu begleiten. Er lehnt jeden ab, der mit der Eisernen Krone verbündet ist oder Nekromantie betreibt.",
    personalQuestId: "quest_korgaths_vengeance",
    dialogueTreeId: "dialogue_tree_korgath",
    favoredFactions: ["forest_druids", "mountain_clans"],
    hatedFactions: ["iron_crown", "undead_covenant", "orcish_horde"],
    reactsTo: [
      "respect_the_dead",
      "commune_with_spirits",
      "protect_sacred_ground",
      "use_necromancy",
      "desecrate_burial_site",
      "ally_with_iron_crown",
    ],
  },
]

export function getCompanion(id: string): Companion | undefined {
  return COMPANIONS.find((c) => c.id === id)
}

export function getAllCompanions(): Companion[] {
  return COMPANIONS
}

export function getCompanionsByRole(role: CompanionCombatRole): Companion[] {
  return COMPANIONS.filter((c) => c.combatRole === role)
}
