// NPC Dialogue system — branching dialogue trees with quest integration

export type DialogueOption = {
  id: string
  text: string                      // player choice text
  condition?: DialogueCondition     // optional condition to show this option
  nextNodeId?: string               // node to go to after choice (null = end)
  actions?: DialogueAction[]        // actions triggered by this choice
}

export type DialogueCondition = {
  type: "has_quest" | "completed_quest" | "has_item" | "reputation_min" | "level_min" | "not_completed_quest"
  value: string | number
}

export type DialogueAction = {
  type: "start_quest" | "give_item" | "take_item" | "reputation_change" | "give_gold"
  questId?: string
  itemId?: string
  factionId?: string
  delta?: number
  amount?: number
}

export type DialogueNode = {
  id: string
  npcText: string                   // what the NPC says
  options: DialogueOption[]
  isEnd?: boolean
}

export type DialogueTree = {
  id: string
  npcId?: string                    // optional specific NPC
  npcType?: string                  // applies to all NPCs of this type
  greeting: string                  // initial node id
  nodes: Record<string, DialogueNode>
}

export const DIALOGUE_TREES: Record<string, DialogueTree> = {
  // ── Händler ───────────────────────────────────────────────────────────────
  merchant_generic: {
    id: "merchant_generic",
    npcType: "merchant",
    greeting: "start",
    nodes: {
      start: {
        id: "start",
        npcText: "Guten Tag, Reisender! Was kann ich für Euch tun?",
        options: [
          { id: "trade", text: "Ich möchte handeln.", nextNodeId: "trade" },
          { id: "info", text: "Was gibt es Neues in der Stadt?", nextNodeId: "news" },
          { id: "bye", text: "Auf Wiedersehen.", nextNodeId: "bye" }
        ]
      },
      trade: {
        id: "trade",
        npcText: "Natürlich! Schaut Euch ruhig um. Alles zu fairen Preisen.",
        options: [
          { id: "back", text: "Vielleicht ein anderes Mal.", nextNodeId: "start" }
        ]
      },
      news: {
        id: "news",
        npcText: "Gerüchte aus dem Norden: Eine alte Ruine wurde entdeckt. Abenteurer versuchen ihr Glück – wenige kehren zurück.",
        options: [
          { id: "more", text: "Interessant. Was wisst Ihr sonst noch?", nextNodeId: "news2" },
          { id: "back", text: "Danke für die Information.", nextNodeId: "start" }
        ]
      },
      news2: {
        id: "news2",
        npcText: "Die Eiserne Krone zahlt gut für Informationen über die Schattengilde. Seid vorsichtig, wem Ihr vertraut.",
        options: [
          { id: "back", text: "Ich werde es im Hinterkopf behalten.", nextNodeId: "start" }
        ]
      },
      bye: {
        id: "bye",
        npcText: "Kommt gut voran! Passt auf Euch auf.",
        options: [],
        isEnd: true
      }
    }
  },

  // ── Wachhauptmann (Quest-Geber) ───────────────────────────────────────────
  guard_captain: {
    id: "guard_captain",
    npcType: "guard_captain",
    greeting: "start",
    nodes: {
      start: {
        id: "start",
        npcText: "Halt! Was führt Euch zu mir? Ich bin ein beschäftigter Mann.",
        options: [
          { id: "quest_goblin", text: "Ich suche Arbeit. Habt Ihr Aufträge?", nextNodeId: "offer_goblin" },
          { id: "info", text: "Was ist die Lage in der Gegend?", nextNodeId: "situation" },
          { id: "bye", text: "Entschuldigung, ich habe mich geirrt.", nextNodeId: "bye" }
        ]
      },
      offer_goblin: {
        id: "offer_goblin",
        npcText: "Goblin-Plünderer überfallen unsere Karawanen. Schafft fünf von ihnen aus dem Weg, und ich zahle gut.",
        options: [
          {
            id: "accept",
            text: "Abgemacht. Ich übernehme den Auftrag.",
            actions: [{ type: "start_quest", questId: "goblin_slayer" }],
            nextNodeId: "quest_accepted",
            condition: { type: "not_completed_quest", value: "goblin_slayer" }
          },
          {
            id: "done",
            text: "Die Goblins sind tot.",
            nextNodeId: "quest_done",
            condition: { type: "completed_quest", value: "goblin_slayer" }
          },
          { id: "back", text: "Ich überlege es mir.", nextNodeId: "start" }
        ]
      },
      quest_accepted: {
        id: "quest_accepted",
        npcText: "Gut! Die Goblins nisten sich im Wald südlich der Stadt ein. Beeilt Euch!",
        options: [
          { id: "back", text: "Ich mache mich sofort auf den Weg.", nextNodeId: "bye" }
        ]
      },
      quest_done: {
        id: "quest_done",
        npcText: "Ausgezeichnet! Ihr habt Euren Teil gehalten. Hier ist Euer Lohn. Die Stadt ist Euch dankbar.",
        options: [
          { id: "back", text: "Gerne. Gibt es weitere Aufträge?", nextNodeId: "start" }
        ]
      },
      situation: {
        id: "situation",
        npcText: "Die Lage ist ernst. Goblins im Süden, Gerüchte über die Schattengilde in der Altstadt, und die Eiserne Krone schickt immer weniger Verstärkung.",
        options: [
          { id: "back", text: "Ich werde die Augen offen halten.", nextNodeId: "start" }
        ]
      },
      bye: {
        id: "bye",
        npcText: "Dann verschwendet nicht meine Zeit. Macht Euren Job.",
        options: [],
        isEnd: true
      }
    }
  },

  // ── Alchemistin ───────────────────────────────────────────────────────────
  alchemist: {
    id: "alchemist",
    npcType: "alchemist",
    greeting: "start",
    nodes: {
      start: {
        id: "start",
        npcText: "Ah, ein Besucher! Ich bin gerade mitten in einem Experiment. Was braucht Ihr?",
        options: [
          { id: "quest_herbs", text: "Ihr braucht Kräuter? Ich kann helfen.", nextNodeId: "offer_herbs" },
          { id: "buy", text: "Habt Ihr Tränke zu verkaufen?", nextNodeId: "trade" },
          { id: "learn", text: "Könnt Ihr mich die Alchemie lehren?", nextNodeId: "teach" },
          { id: "bye", text: "Entschuldigt die Störung.", nextNodeId: "bye" }
        ]
      },
      offer_herbs: {
        id: "offer_herbs",
        npcText: "Tatsächlich! Ich brauche rotes Kraut für meine Forschung. Bringt mir fünf davon, und ich belohne Euch großzügig.",
        options: [
          {
            id: "accept",
            text: "Ich bringe Euch die Kräuter.",
            actions: [{ type: "start_quest", questId: "herb_gathering" }],
            nextNodeId: "quest_accepted",
            condition: { type: "not_completed_quest", value: "herb_gathering" }
          },
          { id: "back", text: "Ich sehe, was ich tun kann.", nextNodeId: "start" }
        ]
      },
      quest_accepted: {
        id: "quest_accepted",
        npcText: "Wunderbar! Die Kräuter wachsen in Wäldern und auf Wiesen. Sucht in der Nähe von Wasser.",
        options: [
          { id: "back", text: "Auf geht's!", nextNodeId: "bye" }
        ]
      },
      trade: {
        id: "trade",
        npcText: "Meine Tränke sind die besten weit und breit. Wählt gut!",
        options: [
          { id: "back", text: "Ich schaue mich um.", nextNodeId: "start" }
        ]
      },
      teach: {
        id: "teach",
        npcText: "Alchemie ist Wissenschaft und Kunst zugleich. Fängt mit einfachen Rezepten an — Heiltränke aus rotem Kraut. Ihr braucht zwei Exemplare und etwas Geduld.",
        options: [
          { id: "more", text: "Was sind fortgeschrittene Rezepte?", nextNodeId: "advanced" },
          { id: "back", text: "Danke für die Auskunft.", nextNodeId: "start" }
        ]
      },
      advanced: {
        id: "advanced",
        npcText: "Für stärkere Tränke braucht Ihr Höhlenkristalle und Feueressenz. Die Kristalle findet Ihr in Höhlen, die Essenz an vulkanischen Gebieten.",
        options: [
          { id: "back", text: "Ich werde es versuchen.", nextNodeId: "start" }
        ]
      },
      bye: {
        id: "bye",
        npcText: "Passt auf Euch auf. Die Natur ist schön, aber gefährlich.",
        options: [],
        isEnd: true
      }
    }
  },

  // ── Gelehrter (Dungeon-Quest) ──────────────────────────────────────────────
  scholar: {
    id: "scholar",
    npcType: "scholar",
    greeting: "start",
    nodes: {
      start: {
        id: "start",
        npcText: "Ah, endlich jemand, der vielleicht helfen kann! Ich habe das uralte Gewölbe lokalisiert, kann aber nicht selbst dorthin.",
        options: [
          { id: "quest", text: "Was ist in diesem Gewölbe?", nextNodeId: "info" },
          { id: "bye", text: "Tut mir leid, ich habe keine Zeit.", nextNodeId: "bye" }
        ]
      },
      info: {
        id: "info",
        npcText: "Legenden besagen, dass ein uralter Drache dort schlummert. Aber mich interessiert eine Schuppe dieses Wesens für meine Forschung. Wer sie bringt, wird reich belohnt.",
        options: [
          {
            id: "accept",
            text: "Ich erkunde das Gewölbe für Euch.",
            actions: [{ type: "start_quest", questId: "ancient_dungeon" }],
            nextNodeId: "quest_accepted",
            condition: { type: "not_completed_quest", value: "ancient_dungeon" }
          },
          {
            id: "level_too_low",
            text: "Das klingt nach einem Job für erfahrenere Abenteurer.",
            nextNodeId: "bye",
            condition: { type: "level_min", value: 8 }
          },
          { id: "back", text: "Lasst mich darüber nachdenken.", nextNodeId: "start" }
        ]
      },
      quest_accepted: {
        id: "quest_accepted",
        npcText: "Ausgezeichnet! Das Gewölbe liegt östlich der Stadt. Nehmt Proviant mit — es ist tief und gefährlich. Bringt mir die Schuppe unbeschädigt.",
        options: [
          { id: "back", text: "Ich mache mich auf den Weg.", nextNodeId: "bye" }
        ]
      },
      bye: {
        id: "bye",
        npcText: "Mögen die Götter Euch beschützen.",
        options: [],
        isEnd: true
      }
    }
  },

  // ── Schatteninformant ─────────────────────────────────────────────────────
  shadow_contact: {
    id: "shadow_contact",
    npcType: "shadow_contact",
    greeting: "start",
    nodes: {
      start: {
        id: "start",
        npcText: "Pst... Ihr habt mich gefunden. Gut. Die richtigen Leute wissen immer, wo sie suchen müssen.",
        options: [
          { id: "work", text: "Ich suche Arbeit. Die Art, bei der man keine Fragen stellt.", nextNodeId: "offer" },
          { id: "info", text: "Was verkauft Ihr?", nextNodeId: "info" },
          { id: "bye", text: "Ich habe mich geirrt.", nextNodeId: "bye" }
        ]
      },
      offer: {
        id: "offer",
        npcText: "Interessant. Ich habe eine Lieferung. Ein Paket muss zu einem bestimmten Empfänger. Keine Inspektion, keine Fragen. Zahlung bei Lieferung.",
        options: [
          {
            id: "accept",
            text: "Abgemacht. Was ist die Adresse?",
            actions: [{ type: "start_quest", questId: "shadow_delivery" }],
            nextNodeId: "quest_accepted",
            condition: { type: "not_completed_quest", value: "shadow_delivery" }
          },
          { id: "back", text: "Das ist mir zu riskant.", nextNodeId: "start" }
        ]
      },
      quest_accepted: {
        id: "quest_accepted",
        npcText: "Das Paket liegt unter der dritten Holzdiele. Der Empfänger wartet in der Taverne am Hafen. Sprecht ihn mit dem Codewort 'Mitternacht' an.",
        options: [
          { id: "back", text: "Verstanden.", nextNodeId: "bye" }
        ]
      },
      info: {
        id: "info",
        npcText: "Information ist die wertvollste Ware. Nichts Bestimmtes – ich höre nur, was gesagt wird. Und manchmal lasse ich Dinge fallen.",
        options: [
          { id: "back", text: "Ich werde mich erinnern.", nextNodeId: "start" }
        ]
      },
      bye: {
        id: "bye",
        npcText: "Dieser Weg hat uns nie miteinander in Berührung gebracht.",
        options: [],
        isEnd: true
      }
    }
  }
}

export function getDialogueTree(treeId: string): DialogueTree | undefined {
  return DIALOGUE_TREES[treeId]
}

export function getDialogueTreeForNpcType(npcType: string): DialogueTree | undefined {
  return Object.values(DIALOGUE_TREES).find(t => t.npcType === npcType)
}

export function getDialogueNode(treeId: string, nodeId: string): DialogueNode | undefined {
  return DIALOGUE_TREES[treeId]?.nodes[nodeId]
}

// Evaluate a condition against player state
export function evaluateCondition(
  condition: DialogueCondition,
  playerQuestLog: { active: Array<{ questId: string }>; completed: string[] },
  playerInventory: string[],
  playerReputation: Record<string, number>,
  playerLevel: number
): boolean {
  switch (condition.type) {
    case "has_quest":
      return playerQuestLog.active.some(q => q.questId === condition.value)
    case "completed_quest":
      return playerQuestLog.completed.includes(condition.value as string)
    case "not_completed_quest":
      return !playerQuestLog.completed.includes(condition.value as string)
    case "has_item":
      return playerInventory.includes(condition.value as string)
    case "reputation_min": {
      const [factionId, minStr] = (condition.value as string).split(":")
      return (playerReputation[factionId] ?? 0) >= parseInt(minStr, 10)
    }
    case "level_min":
      return playerLevel >= (condition.value as number)
    default:
      return true
  }
}

// Filter options for a given player state
export function getAvailableOptions(
  node: DialogueNode,
  playerQuestLog: { active: Array<{ questId: string }>; completed: string[] },
  playerInventory: string[],
  playerReputation: Record<string, number>,
  playerLevel: number
): DialogueOption[] {
  return node.options.filter(opt => {
    if (!opt.condition) return true
    return evaluateCondition(opt.condition, playerQuestLog, playerInventory, playerReputation, playerLevel)
  })
}
