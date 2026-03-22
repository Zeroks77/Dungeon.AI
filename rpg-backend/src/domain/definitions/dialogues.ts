// NPC Dialogue system — branching dialogue trees with quest integration

export type DialogueOption = {
  id: string
  text: string                      // player choice text
  condition?: DialogueCondition     // optional condition to show this option
  nextNodeId?: string               // node to go to after choice (null = end)
  actions?: DialogueAction[]        // actions triggered by this choice
}

export type DialogueCondition = {
  type: "has_quest" | "completed_quest" | "has_item" | "reputation_min" | "level_min" | "not_completed_quest" | "is_race"
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
  },

  // ── Begleiter Kael Eisenherz (Paladin) ───────────────────────────────────
  companion_kael: {
    id: "companion_kael",
    npcId: "kael_eisenherz",
    greeting: "start",
    nodes: {
      start: {
        id: "start",
        npcText: "Ich bin Kael Eisenherz, ehemaliger Ritter der Eisernen Krone. Ihr solltet nicht allein reisen — diese Lande sind gefährlicher als sie aussehen.",
        options: [
          { id: "ask_past", text: "Was hat Euch zur Eisernen Krone gebracht?", nextNodeId: "ask_past" },
          { id: "ask_mission", text: "Was ist Eure Mission?", nextNodeId: "ask_mission" },
          {
            id: "ask_join",
            text: "Schließt Euch mir an. Gemeinsam sind wir stärker.",
            nextNodeId: "ask_join",
            condition: { type: "level_min", value: 3 }
          },
          { id: "bye", text: "Ich brauche keine Gesellschaft. Lebt wohl.", nextNodeId: "bye" }
        ]
      },
      ask_past: {
        id: "ask_past",
        npcText: "Ich diente der Eisernen Krone zwölf Jahre lang. Ein Orden aus Stahl und Glauben — so dachte ich jedenfalls.",
        options: [
          { id: "betrayal_details", text: "Was ist geschehen?", nextNodeId: "betrayal_details" },
          { id: "ask_mission", text: "Was ist Eure aktuelle Mission?", nextNodeId: "ask_mission" },
          { id: "back", text: "Ich höre.", nextNodeId: "start" }
        ]
      },
      betrayal_details: {
        id: "betrayal_details",
        npcText: "Vor einem Jahr befahl der Großmeister, ein ganzes Dorf auszulöschen — Zeugen eines Rituals, das wir nie hätten durchführen sollen. Ich weigerte mich. Sie jagten mich wie ein Tier.",
        options: [
          { id: "ritual_question", text: "Was für ein Ritual war das?", nextNodeId: "ritual_question" },
          { id: "ask_mission", text: "Und seitdem kämpft Ihr allein?", nextNodeId: "ask_mission" },
          {
            id: "ask_join",
            text: "Ich verstehe. Kämpft an meiner Seite gegen solche Ungerechtigkeiten.",
            nextNodeId: "ask_join",
            condition: { type: "level_min", value: 3 }
          }
        ]
      },
      ritual_question: {
        id: "ritual_question",
        npcText: "Nekromantie. Der Großmeister versuchte, gefallene Krieger als Untote zu erwecken, um sein Heer zu verdoppeln. Ich schwor meinen Eid auf das Leben, nicht den Tod. Daher die Konsequenzen.",
        options: [
          { id: "ask_mission", text: "Und nun verfolgt Ihr sie?", nextNodeId: "ask_mission" },
          {
            id: "ask_join",
            text: "Dann kämpft gemeinsam mit mir gegen sie.",
            nextNodeId: "ask_join",
            condition: { type: "level_min", value: 3 }
          },
          { id: "back", text: "Das ist eine schwere Last.", nextNodeId: "start" }
        ]
      },
      ask_mission: {
        id: "ask_mission",
        npcText: "Ich will Beweise sammeln und die Wahrheit über den Großmeister ans Licht bringen. Der Orden muss von innen heraus gereinigt werden — oder er muss fallen.",
        options: [
          {
            id: "ask_join",
            text: "Lasst uns gemeinsam kämpfen. Ich werde Euch helfen.",
            nextNodeId: "ask_join",
            condition: { type: "level_min", value: 3 }
          },
          { id: "back", text: "Ein ehrenhaftes Ziel. Ich wünsche Euch Erfolg.", nextNodeId: "start" }
        ]
      },
      ask_join: {
        id: "ask_join",
        npcText: "Ihr wollt mich an Eurer Seite? Ich habe genug von Einzelkämpfern, die allein fallen. Wenn Ihr mir versprecht, dass wir den Orden zur Rechenschaft ziehen… dann habe ich Euer Schwert.",
        options: [
          {
            id: "recruit",
            text: "Abgemacht. Der Orden wird sich verantworten.",
            actions: [
              { type: "start_quest", questId: "recruit_kael" },
              { type: "reputation_change", factionId: "iron_crown", delta: -10 }
            ],
            nextNodeId: "join_accepted"
          },
          { id: "back", text: "Ich überlege es mir noch.", nextNodeId: "start" }
        ]
      },
      join_accepted: {
        id: "join_accepted",
        npcText: "Dann ist es beschlossen. Ich folge Euch. Haltet Euren Rücken frei — ich werde meinen Teil tun. Und… danke. Es ist lange her, seit mir jemand vertraut hat.",
        options: [
          { id: "bye", text: "Willkommen im Bund, Kael.", nextNodeId: "bye" }
        ]
      },
      bye: {
        id: "bye",
        npcText: "Möge das Licht Euren Weg erhellen — auch wenn die Dunkelheit tief ist.",
        options: [],
        isEnd: true
      }
    }
  },

  // ── Meisterschmied ────────────────────────────────────────────────────────
  blacksmith_master: {
    id: "blacksmith_master",
    npcType: "master_blacksmith",
    greeting: "start",
    nodes: {
      start: {
        id: "start",
        npcText: "Tritt näher! Ich bin Brodur Hammerfaust, Meisterschmied von Eisenfurt. Was braucht Ihr — eine Klinge, eine Rüstung oder Wissen?",
        options: [
          { id: "offer_crafting", text: "Könnt Ihr mir etwas schmieden?", nextNodeId: "offer_crafting" },
          { id: "ask_runes", text: "Was wisst Ihr über Runen-Gravuren?", nextNodeId: "ask_runes" },
          { id: "ask_rumors", text: "Habt Ihr Neuigkeiten aus der Gegend?", nextNodeId: "ask_rumors" },
          { id: "buy_items", text: "Ich möchte Waffen oder Rüstungen kaufen.", nextNodeId: "buy_items" },
          { id: "leave", text: "Entschuldigt die Störung.", nextNodeId: "leave" }
        ]
      },
      offer_crafting: {
        id: "offer_crafting",
        npcText: "Natürlich! Mit dem richtigen Material kann ich alles herstellen. Eisenschwerter, Kettenrüstungen, Plattenpanzer. Bringt mir die Rohstoffe, und ich zeige Euch, was echter Handwerk bedeutet.",
        options: [
          { id: "upgrade_weapon", text: "Könnt Ihr meine Waffe verbessern?", nextNodeId: "upgrade_weapon" },
          { id: "craft_armor", text: "Ich brauche eine neue Rüstung.", nextNodeId: "craft_armor" },
          { id: "back", text: "Ich komme wieder, wenn ich Materialien habe.", nextNodeId: "start" }
        ]
      },
      upgrade_weapon: {
        id: "upgrade_weapon",
        npcText: "Eine gute Klinge schärfen oder verstärken? Bringt mir Eisenerz und etwas Gold, und Eure Waffe wird wie neu sein. Für magische Verbesserungen braucht Ihr zusätzlich eine Runenessenz.",
        options: [
          { id: "back", text: "Ich sorge dafür.", nextNodeId: "start" }
        ]
      },
      craft_armor: {
        id: "craft_armor",
        npcText: "Leder oder Stahl? Lederrüstungen sind leicht und günstig — gut für Schurken und Waldläufer. Plattenpanzer sind teuer und schwer, aber keine Klinge dringt durch echten Brodur-Stahl.",
        options: [
          { id: "back", text: "Ich überlege es mir.", nextNodeId: "start" }
        ]
      },
      ask_runes: {
        id: "ask_runes",
        npcText: "Runen? Das ist Kunst, kein Handwerk. Jede Rune muss bei Mondlicht in den Stahl geritzt werden — zu früh oder zu spät, und die Magie versagt.",
        options: [
          { id: "rune_types", text: "Was für Runen könnt Ihr gravieren?", nextNodeId: "rune_types" },
          { id: "rune_warning", text: "Gibt es Risiken?", nextNodeId: "rune_warning" },
          { id: "back", text: "Faszinierend. Danke.", nextNodeId: "start" }
        ]
      },
      rune_types: {
        id: "rune_types",
        npcText: "Feuerrune für brennende Klingen, Eisrune für verlangsamendes Metall, Kraftrune für mehr Schlagkraft. Die mächtigsten — Todes- und Seelenrunen — berühre ich nicht mehr. Zu gefährlich.",
        options: [
          { id: "rune_warning", text: "Warum nicht?", nextNodeId: "rune_warning" },
          { id: "back", text: "Verstanden.", nextNodeId: "start" }
        ]
      },
      rune_warning: {
        id: "rune_warning",
        npcText: "Ich hatte einmal einen Kunden — Nekromant aus dem Süden. Ließ mich eine Todesrune in seinen Stab gravieren. Eine Woche später kam er nicht zurück. Sein Stab schon. Allein.",
        options: [
          { id: "back", text: "Das ist beunruhigend.", nextNodeId: "start" }
        ]
      },
      ask_rumors: {
        id: "ask_rumors",
        npcText: "Gerüchte? Oh, ich höre einiges. Jeder Kämpfer, der durch diese Werkstatt geht, hinterlässt eine Geschichte.",
        options: [
          { id: "rumors_cult", text: "Habt Ihr von Kultisten gehört?", nextNodeId: "rumors_cult" },
          { id: "rumors_war", text: "Was ist mit dem Krieg im Norden?", nextNodeId: "rumors_war" },
          { id: "back", text: "Danke für die Offenheit.", nextNodeId: "start" }
        ]
      },
      rumors_cult: {
        id: "rumors_cult",
        npcText: "Der Todesbund — so nennen sie sich. Schmuggeln Knochen und seltsame Artefakte durch die Stadt. Letzte Woche kam einer hier an und wollte, dass ich seine Waffe mit 'Lebensenergie' schärfe. Ich warf ihn raus.",
        options: [
          { id: "back", text: "Gut getan.", nextNodeId: "start" }
        ]
      },
      rumors_war: {
        id: "rumors_war",
        npcText: "Der Norden brennt. Die Eiserne Krone schickt immer mehr Truppen, aber weniger kehren zurück. Meine Aufträge für Schwerter und Helme sind um das Dreifache gestiegen. Schlecht für die Welt, gut für mein Geschäft.",
        options: [
          { id: "back", text: "Düstere Zeiten.", nextNodeId: "start" }
        ]
      },
      buy_items: {
        id: "buy_items",
        npcText: "Seht Euch um. Ich habe Schwerter, Äxte, Kettenrüstungen und einiges mehr. Alles von Hand geschmiedet — keine billige Massenware.",
        options: [
          { id: "back", text: "Ich schaue mich um.", nextNodeId: "start" }
        ]
      },
      leave: {
        id: "leave",
        npcText: "Kommt wieder, wenn Ihr gutes Metall braucht. Meine Tür ist offen — so lange der Hammer schwingt.",
        options: [],
        isEnd: true
      }
    }
  },

  // ── Kultist des Todesbundes ───────────────────────────────────────────────
  dark_ritual_cultist: {
    id: "dark_ritual_cultist",
    npcType: "undead_cultist",
    greeting: "start",
    nodes: {
      start: {
        id: "start",
        npcText: "Ihr stört das Ritual. Das war ein Fehler. Wählt Eure nächsten Worte mit Bedacht — sie könnten Eure letzten sein.",
        options: [
          { id: "undead_greeting", text: "[Ihr seid auch untot] Bruder… Schwester. Ich bin einer von Euch.", nextNodeId: "undead_greeting", condition: { type: "is_race", value: "undead" } },
          { id: "negotiate", text: "Wartet. Ich bin kein Feind. Ich möchte reden.", nextNodeId: "negotiate" },
          { id: "threaten", text: "Ich bin derjenige, der Fehler macht? Legt die Waffe nieder.", nextNodeId: "threaten" },
          { id: "ask_covenant", text: "Was ist der Todesbund? Was wollt Ihr hier?", nextNodeId: "ask_covenant" },
          { id: "flee", text: "Ich habe hier nichts zu suchen. Ich gehe.", nextNodeId: "flee" }
        ]
      },
      undead_greeting: {
        id: "undead_greeting",
        npcText: "Was…? Ihr tragt den Hauch des Todes. Seid Ihr… erwacht? Unvergänglich wie wir? Der Meister sucht solche wie Euch. Vielleicht seid Ihr kein Feind nach allem.",
        options: [
          { id: "undead_join", text: "Erzählt mir mehr über Euren Meister.", nextNodeId: "undead_details" },
          { id: "undead_refuse", text: "Ich teile Eure Natur, nicht Eure Ziele.", nextNodeId: "negotiate" },
          { id: "flee", text: "Ich ziehe es vor zu gehen.", nextNodeId: "flee" }
        ]
      },
      undead_details: {
        id: "undead_details",
        npcText: "Der Meister sammelt die Erwachten — Untote mit freiem Willen. Er baut ein Reich jenseits von Leben und Tod. Wer Euch verflucht hat, tat es aus Versehen. Wir könnten den Fluch vollenden… oder brechen.",
        options: [
          { id: "ask_covenant", text: "Was genau tut Ihr hier?", nextNodeId: "ask_covenant" },
          { id: "negotiate", text: "Ich höre zu. Was wollt Ihr von mir?", nextNodeId: "negotiate" },
          { id: "flee", text: "Das ist nicht mein Weg.", nextNodeId: "flee" }
        ]
      },
      negotiate: {
        id: "negotiate",
        npcText: "Ihr wollt reden? Interessant. Die meisten kommen schreiend oder fliehend. Was habt Ihr anzubieten, dass wir dieses Gespräch nicht sofort beenden?",
        options: [
          { id: "offer_service", text: "Ich kenne diesen Wald. Ich könnte Euch Informationen geben.", nextNodeId: "negotiate_deal" },
          { id: "offer_silence", text: "Schweigen. Ich sage niemandem, was ich hier gesehen habe.", nextNodeId: "negotiate_silence" },
          { id: "back", text: "Vielleicht war das keine gute Idee.", nextNodeId: "start" }
        ]
      },
      negotiate_deal: {
        id: "negotiate_deal",
        npcText: "Ein Informant. Das könnte nützlich sein. Gut — Ihr lebt heute Nacht. Aber wenn Ihr lügt oder die Wachen ruft, findet Ihr Euch bald auf unserer Seite wieder. Und zwar unfreiwillig.",
        options: [
          { id: "ask_covenant", text: "Dann erzählt mir von Eurem Bund.", nextNodeId: "ask_covenant" },
          { id: "flee", text: "Verstanden. Ich gehe.", nextNodeId: "flee" }
        ]
      },
      negotiate_silence: {
        id: "negotiate_silence",
        npcText: "Schweigen kostet nichts — bis es etwas kostet. Wir nehmen Euer Angebot an. Dieses Mal. Aber wir sehen Euch, Reisender. Immer.",
        options: [
          { id: "flee", text: "Ich verstehe.", nextNodeId: "flee" }
        ]
      },
      threaten: {
        id: "threaten",
        npcText: "Ha! Drohungen von einem Sterblichen. Wisst Ihr, wie viele Helden uns mit solchen Worten gegenübergestanden haben? Ihre Knochen dienen uns jetzt.",
        options: [
          { id: "threaten_fight", text: "Dann fügt mich der Sammlung hinzu — wenn Ihr könnt!", nextNodeId: "threaten_fight" },
          { id: "back_down", text: "Ich… ich habe mich geirrt. Vergessen wir das.", nextNodeId: "negotiate" }
        ]
      },
      threaten_fight: {
        id: "threaten_fight",
        npcText: "Mutig. Oder dumm. Beides endet gleich.",
        options: [
          { id: "flee", text: "Ich ziehe mich zurück!", nextNodeId: "flee" }
        ],
        isEnd: false
      },
      ask_covenant: {
        id: "ask_covenant",
        npcText: "Der Todesbund? Wir sind die Wahrheit, die die Lebenden verdrängen. Der Tod ist nicht das Ende — er ist der Anfang. Unser Meister hat die Grenze überwunden. Er ruft uns alle dazu auf.",
        options: [
          { id: "covenant_leader", text: "Wer ist Euer Meister?", nextNodeId: "covenant_leader" },
          { id: "covenant_ritual", text: "Was ist das Ziel dieses Rituals?", nextNodeId: "covenant_ritual" },
          { id: "flee", text: "Genug gehört. Ich gehe.", nextNodeId: "flee" }
        ]
      },
      covenant_leader: {
        id: "covenant_leader",
        npcText: "Sein Name ist Morthen der Ewige. Er starb einst als Archmagier — und erwachte als etwas Größeres. Er baut an einem Portal in die Ebene der Toten. Wenn es öffnet, wird nichts mehr wie vorher sein.",
        options: [
          { id: "covenant_ritual", text: "Und dieses Ritual hier ist Teil davon?", nextNodeId: "covenant_ritual" },
          { id: "flee", text: "Ich habe genug gehört.", nextNodeId: "flee" }
        ]
      },
      covenant_ritual: {
        id: "covenant_ritual",
        npcText: "Wir öffnen einen kleinen Spalt — einen Vorgeschmack. Seelen aus dem Jenseits fließen herein. Sie... formen die Welt um. Ihr solltet gehen, bevor es beginnt.",
        options: [
          { id: "flee", text: "Ich gehe sofort.", nextNodeId: "flee" }
        ]
      },
      flee: {
        id: "flee",
        npcText: "Lauft, Lebender. Wir werden uns wiedersehen — früher als Ihr denkt.",
        options: [],
        isEnd: true
      }
    }
  },

  // ── Uraltes Orakel ────────────────────────────────────────────────────────
  ancient_oracle: {
    id: "ancient_oracle",
    npcType: "oracle",
    greeting: "start",
    nodes: {
      start: {
        id: "start",
        npcText: "… Du kommst. Ich sah es. Die Fäden deines Schicksals leuchten seltsam — gewoben aus Licht und Asche. Was suchst du, Sterblicher? Wissen kostet. Nicht in Worten.",
        options: [
          { id: "ask_future", text: "Was liegt in meiner Zukunft? (20 Gold)", nextNodeId: "ask_future" },
          { id: "ask_past", text: "Zeigt mir etwas aus meiner Vergangenheit. (20 Gold)", nextNodeId: "ask_past" },
          { id: "ask_faction", text: "Sprecht über eine der großen Fraktionen. (30 Gold)", nextNodeId: "ask_faction" },
          { id: "ask_companion", text: "Was seht Ihr über einen meiner Begleiter? (30 Gold)", nextNodeId: "ask_companion" },
          { id: "leave", text: "Ich brauche nichts von Euch.", nextNodeId: "leave" }
        ]
      },
      ask_future: {
        id: "ask_future",
        npcText: "Das Gold fließt. Gut.",
        options: [
          {
            id: "pay_future",
            text: "Ich zahle. Zeigt mir die Zukunft.",
            actions: [{ type: "give_gold", amount: -20 }],
            nextNodeId: "future_answer"
          },
          { id: "back", text: "Vielleicht nicht.", nextNodeId: "start" }
        ]
      },
      future_answer: {
        id: "future_answer",
        npcText: "Ich sehe… eine Tür. Sie öffnet sich in beide Richtungen. Jemand, dem du vertraust, trägt ein zweites Gesicht. Und am Ende eines langen Weges wartet nicht ein Schatz — sondern eine Wahl.",
        options: [
          { id: "clarify_future", text: "Könnt Ihr Euch klarer ausdrücken?", nextNodeId: "future_cryptic" },
          { id: "back", text: "Danke… ich denke.", nextNodeId: "start" }
        ]
      },
      future_cryptic: {
        id: "future_cryptic",
        npcText: "Klarheit kostet mehr als Gold. Sie kostet Erfahrung. Geht — lebt — und kehrt zurück. Dann werden die Fäden deutlicher.",
        options: [
          { id: "back", text: "Gut. Ich werde zurückkommen.", nextNodeId: "start" }
        ]
      },
      ask_past: {
        id: "ask_past",
        npcText: "Das Gold fließt. Gut.",
        options: [
          {
            id: "pay_past",
            text: "Ich zahle. Zeigt mir die Vergangenheit.",
            actions: [{ type: "give_gold", amount: -20 }],
            nextNodeId: "past_answer"
          },
          { id: "back", text: "Nein, doch nicht.", nextNodeId: "start" }
        ]
      },
      past_answer: {
        id: "past_answer",
        npcText: "Deine Vergangenheit riecht nach Verlust. Eine Flamme, die zu früh erloschen ist. Du trägst eine Schuld, die nicht deine ist — und ein Versprechen, das noch eingelöst werden muss.",
        options: [
          { id: "past_details", text: "Was meint Ihr mit einem Versprechen?", nextNodeId: "past_details" },
          { id: "back", text: "Das trifft mich tiefer als ich dachte.", nextNodeId: "start" }
        ]
      },
      past_details: {
        id: "past_details",
        npcText: "Es wurde in einer Nacht des Regens gesprochen. Jemand wartete auf dich — und du kamst nicht. Die Zeit kann nicht zurückgedreht werden. Aber Versprechen können anders erfüllt werden.",
        options: [
          { id: "back", text: "Danke, Orakel.", nextNodeId: "start" }
        ]
      },
      ask_faction: {
        id: "ask_faction",
        npcText: "Über welche Macht möchtest du wissen?",
        options: [
          {
            id: "faction_iron_crown",
            text: "Die Eiserne Krone. (30 Gold)",
            actions: [{ type: "give_gold", amount: -30 }],
            nextNodeId: "faction_iron_crown"
          },
          {
            id: "faction_shadow_guild",
            text: "Die Schattengilde. (30 Gold)",
            actions: [{ type: "give_gold", amount: -30 }],
            nextNodeId: "faction_shadow_guild"
          },
          {
            id: "faction_covenant",
            text: "Der Todesbund. (30 Gold)",
            actions: [{ type: "give_gold", amount: -30 }],
            nextNodeId: "faction_covenant"
          },
          { id: "back", text: "Keine davon. Zurück.", nextNodeId: "start" }
        ]
      },
      faction_iron_crown: {
        id: "faction_iron_crown",
        npcText: "Die Eiserne Krone glänzt — aber Glanz verbirgt Rost. Was einst ein Orden aus Glaube war, ist nun ein Apparat aus Angst. Ihr Kern fault von innen. Doch faulende Bäume fallen laut.",
        options: [
          { id: "back", text: "Ich danke Euch.", nextNodeId: "start" }
        ]
      },
      faction_shadow_guild: {
        id: "faction_shadow_guild",
        npcText: "Die Schattengilde ist kein Feind, kein Freund. Sie ist der Spiegel des Lichts — notwendig und unbequem. Ihr Anführer kennt ein Geheimnis über deinen Weg. Du wirst ihn treffen. Bereite dich vor.",
        options: [
          { id: "back", text: "Beunruhigend. Danke.", nextNodeId: "start" }
        ]
      },
      faction_covenant: {
        id: "faction_covenant",
        npcText: "Der Todesbund ist ein Riss im Gewebe. Sie öffnen Türen, die für immer geschlossen sein sollten. Ihr Meister — Morthen — glaubt, er befreit die Toten. Er irrt sich. Er kettet sie.",
        options: [
          { id: "back", text: "Das ist erschreckend.", nextNodeId: "start" }
        ]
      },
      ask_companion: {
        id: "ask_companion",
        npcText: "Über wen soll ich schauen?",
        options: [
          {
            id: "comp_kael",
            text: "Kael Eisenherz. (30 Gold)",
            actions: [{ type: "give_gold", amount: -30 }],
            nextNodeId: "comp_kael"
          },
          {
            id: "comp_other",
            text: "Über jemand anderen aus meiner Gruppe. (30 Gold)",
            actions: [{ type: "give_gold", amount: -30 }],
            nextNodeId: "comp_other"
          },
          { id: "back", text: "Niemanden. Zurück.", nextNodeId: "start" }
        ]
      },
      comp_kael: {
        id: "comp_kael",
        npcText: "Der Paladin. Er trägt eine Wunde tiefer als Stahl. Sein Glaube ist echt — aber er zweifelt, ob er ihn verdient. Ein Moment kommt, in dem er zwischen Pflicht und Menschlichkeit wählen muss. Wie du ihn führst, formt ihn.",
        options: [
          { id: "back", text: "Ich werde es nicht vergessen.", nextNodeId: "start" }
        ]
      },
      comp_other: {
        id: "comp_other",
        npcText: "Die Fäden… unscharf. Diese Person verbirgt etwas — nicht aus Bosheit, sondern aus Angst. Schenke ihr Zeit, und die Wahrheit kommt von allein. Drücke zu fest, und sie bricht.",
        options: [
          { id: "back", text: "Danke, Orakel.", nextNodeId: "start" }
        ]
      },
      leave: {
        id: "leave",
        npcText: "Du gehst, aber die Fäden bleiben. Sie weben sich weiter, ob du schaust oder nicht.",
        options: [],
        isEnd: true
      }
    }
  },

  // ── Taverne: Barde ────────────────────────────────────────────────────────
  tavern_bard: {
    id: "tavern_bard",
    npcType: "bard",
    greeting: "start",
    nodes: {
      start: {
        id: "start",
        npcText: "Ah, ein neues Gesicht! Ich bin Finn Silberzunge, bescheidener Barde und unübertroffener Geschichtenerzähler dieses ehrwürdigen Etablissements. Was darf ich für Euch tun?",
        options: [
          { id: "ask_rumors", text: "Habt Ihr Neuigkeiten aus der Gegend?", nextNodeId: "ask_rumors" },
          { id: "song_courage", text: "Spielt uns ein Lied des Mutes.", nextNodeId: "song_courage" },
          { id: "song_melancholy", text: "Ich möchte eine nachdenkliche Melodie hören.", nextNodeId: "song_melancholy" },
          { id: "song_adventure", text: "Ein Abenteuerslied, wenn ich bitten darf!", nextNodeId: "song_adventure" },
          {
            id: "hire_bard",
            text: "Würdet Ihr Euch einer Reisegruppe anschließen?",
            nextNodeId: "hire_offer",
            condition: { type: "not_completed_quest", value: "hire_bard_finn" }
          },
          { id: "leave", text: "Ich muss weiter. Gute Unterhaltung!", nextNodeId: "leave" }
        ]
      },
      ask_rumors: {
        id: "ask_rumors",
        npcText: "Gerüchte! Das ist mein Lieblingsthema nach Musik. Ich habe Neuigkeiten aus dem Norden, Süden und aus dieser Stadt selbst. Was interessiert Euch?",
        options: [
          { id: "rumors_north", text: "Was hört man aus dem Norden?", nextNodeId: "rumors_north" },
          { id: "rumors_south", text: "Und aus dem Süden?", nextNodeId: "rumors_south" },
          { id: "rumors_city", text: "Was geht in der Stadt vor?", nextNodeId: "rumors_city" },
          { id: "back", text: "Ein andermal vielleicht.", nextNodeId: "start" }
        ]
      },
      rumors_north: {
        id: "rumors_north",
        npcText: "Im Norden brodelt es! Die Eiserne Krone verliert Territorium an ein Heer, das — glaubt es mir oder nicht — angeblich aus Untoten besteht. Einige sagen, ein Nekromant führt sie. Andere sagen, es ist die Strafe der Götter.",
        options: [
          { id: "rumors_south", text: "Und der Süden?", nextNodeId: "rumors_south" },
          { id: "back", text: "Interessant. Danke.", nextNodeId: "start" }
        ]
      },
      rumors_south: {
        id: "rumors_south",
        npcText: "Aus dem Süden höre ich von einer versunkenen Stadt, die sich wieder erhebt — buchstäblich aus dem Meer. Fischer berichten von Türmen, die um Mitternacht leuchten. Schätze? Fluch? Beides, vermutlich.",
        options: [
          { id: "rumors_city", text: "Was ist mit der Stadt hier?", nextNodeId: "rumors_city" },
          { id: "back", text: "Dankeschön.", nextNodeId: "start" }
        ]
      },
      rumors_city: {
        id: "rumors_city",
        npcText: "Ah, das Interessanteste! Der Wachhauptmann empfängt nachts Besucher in Kapuzen. Der Meisterschmied hat einen Auftrag abgelehnt — was er nie tut. Und jemand zahlt sehr gut dafür, dass ein bestimmtes Gerücht nicht weitergetragen wird. Zu spät, natürlich.",
        options: [
          { id: "back", text: "Ihr seid ein wandelndes Nachrichtenblatt.", nextNodeId: "start" }
        ]
      },
      song_courage: {
        id: "song_courage",
        npcText: "Ein Lied des Mutes! Hervorragende Wahl. *Er stimmt eine mitreißende Melodie an, die Herz und Arme stärkt.* — Mögen Eure Klingen scharf sein und Euer Arm unermüdlich!",
        options: [
          {
            id: "receive_buff",
            text: "Das war wunderbar. Ich fühle mich gestärkt!",
            actions: [{ type: "give_item", itemId: "strength_potion" }],
            nextNodeId: "after_song"
          }
        ]
      },
      song_melancholy: {
        id: "song_melancholy",
        npcText: "Eine Melodie der Besinnung… *Er spielt leise Töne, die den Geist öffnen und den Atem verlangsamen.* Manchmal braucht die Seele Stille, um wieder wachsen zu können.",
        options: [
          {
            id: "receive_buff",
            text: "Selten hat mich Musik so tief berührt.",
            actions: [{ type: "give_item", itemId: "mana_potion" }],
            nextNodeId: "after_song"
          }
        ]
      },
      song_adventure: {
        id: "song_adventure",
        npcText: "Ein Abenteuerslied! Das ist meine Spezialität. *Er schlägt die Saiten laut an und singt von fernen Landen und glorreichen Taten.* Die Straße ruft — wer bin ich, zu schweigen?",
        options: [
          {
            id: "receive_buff",
            text: "Jetzt will ich sofort losziehen!",
            actions: [{ type: "give_item", itemId: "health_potion" }],
            nextNodeId: "after_song"
          }
        ]
      },
      after_song: {
        id: "after_song",
        npcText: "Ich freue mich immer, wenn meine Musik jemandem nützt. Ein Barde ohne Publikum ist wie eine Laute ohne Saiten — technisch vorhanden, aber sehr traurig.",
        options: [
          { id: "back", text: "Noch ein Lied?", nextNodeId: "start" },
          { id: "leave", text: "Ich muss weiterziehen. Auf Wiederhören!", nextNodeId: "leave" }
        ]
      },
      hire_offer: {
        id: "hire_offer",
        npcText: "Mitnehmen? Hmm. Ich bin eigentlich sesshafter Natur — diese Taverne zahlt gut, das Bett ist weich, das Bier ist akzeptabel. Aber… *er seufzt theatralisch* die Geschichten hier werden immer dünner. Was zahlt Ihr?",
        options: [
          {
            id: "hire_accept",
            text: "50 Gold und Anteil an den Abenteuern.",
            actions: [
              { type: "give_gold", amount: -50 },
              { type: "start_quest", questId: "hire_bard_finn" }
            ],
            nextNodeId: "hire_accepted"
          },
          { id: "back", text: "Vielleicht ein andermal.", nextNodeId: "start" }
        ]
      },
      hire_accepted: {
        id: "hire_accepted",
        npcText: "50 Gold und Ruhm! Das ist ein Angebot, das ein Barde nicht ablehnen kann. *Er greift nach seiner Laute und springt vom Hocker.* Wohin geht die Reise? Ich habe bereits drei Strophen im Kopf!",
        options: [
          { id: "leave", text: "Willkommen im Team, Finn!", nextNodeId: "leave" }
        ]
      },
      leave: {
        id: "leave",
        npcText: "Reist sicher — und kommt mit guten Geschichten zurück! Ich werde sie in Lieder fassen, versprochen.",
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
  playerLevel: number,
  playerRace?: string
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
    case "is_race":
      return playerRace === condition.value
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
  playerLevel: number,
  playerRace?: string
): DialogueOption[] {
  return node.options.filter(opt => {
    if (!opt.condition) return true
    return evaluateCondition(opt.condition, playerQuestLog, playerInventory, playerReputation, playerLevel, playerRace)
  })
}
