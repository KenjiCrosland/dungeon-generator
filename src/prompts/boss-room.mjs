export function generateBossRoomPrompt(
  dungeonOverview,
  shortDescription,
  connectedRoomsInfo = '',
  formRoomName = '',
  formRoomSummary = '',
  npcString = '',
) {
  const roomNameSection = formRoomName
    ? `**Room Name:**
${formRoomName}

`
    : '';

  const roomSummarySection = formRoomSummary
    ? `**Room Summary:**
${formRoomSummary}

`
    : '';

  const npcSection = npcString
    ? `**NPC Present in the Room:**
${npcString}

The NPC is currently in the room in addition to the boss. Include them in the room description, detailing what they are doing and how they might interact with players and with the boss. Consider their personality, goals, and any relationships they have.

`
    : '';

  const connectedRoomsSection =
    connectedRoomsInfo !== ''
      ? `**Connected Rooms:** 
This room is connected to the following rooms: ${connectedRoomsInfo}\n`
      : '';

  const npcInteractionGuidelines = npcString
    ? `- **NPC Interaction (If NPC is Present):**
  - Describe how the NPC might interact with the players and the boss.
  - Consider the NPC's personality, goals, and any relationships they have with the boss or players.
  - The NPC could provide assistance, hinder the players, or have their own agenda.
`
    : '';

  // Include npc_interaction key description if npcString is provided
  const npcInteractionKey = npcString
    ? `- **npc_interaction**: Describe how the NPC interacts with the players and the boss, their agenda, and their potential influence on the encounter.`
    : '';

  // Include npc_interaction example JSON line if npcString is provided
  const npcInteractionExample = npcString
    ? `,\n  "npc_interaction": "The NPC, Selwyn, stands off to the side, torn between helping the boss or aiding the players, hoping to negotiate a deal that benefits them most."`
    : '';

  return `
Using the dungeon overview and room description below, create a detailed description of the **boss room**. The boss encounter should be engaging, dynamic, and fit within the context of the dungeon.

**Dungeon Overview:**
${dungeonOverview}

**Short Room Description:**
${shortDescription}

${connectedRoomsSection}${roomNameSection}${roomSummarySection}${npcSection}**Guidelines:**

- **Boss Character:**
  - Create a unique and memorable boss character with a clear motivation and goal.
  - The boss can be alone or accompanied by minions.
  - The boss could be an outsider, an interloper, or an original denizen of the dungeon.

- **Room Setting:**
  - The room could be a laboratory, summoning chamber, library, spawn pit, or any setting that fits the boss's theme.
  - Include environmental features that can affect the encounter.

- **Boss's Goal and Consequences:**
  - Clearly define the boss's goal and what happens if they achieve it.
  - Explain the consequences of failure or delay by the players.

- **Boss Weakness:**
  - Describe a weakness the boss has. This weakness may or may not require something acquired elsewhere in the dungeon.
  - Usually, discovering or exploiting this weakness requires a good Knowledge or Wisdom check.
  - The weakness should provide a significant advantage if exploited.

- **Encounter Mechanics:**
  - Describe unique mechanics, phases, or abilities the boss might have.
  - Include any dynamic events or environmental interactions.

- **Roleplaying Opportunities:**
  - Allow for potential dialogue, negotiation, or moral choices.
  - The boss might reveal information or taunt the players.
  
${npcInteractionGuidelines}- **Loot and Rewards:**
  - Specify any unique items, knowledge, or rewards the players gain upon victory.

- **Foreshadowing Elements:**
  - If applicable, reference clues or hints from earlier in the dungeon.

**Return the description in JSON format with the following keys:**

- **name**: ${formRoomName ? formRoomName : 'A descriptive name for the room.'}
- **one_sentence_summary**: A concise summary of the room's purpose and atmosphere.
- **read_aloud_description**: A vivid description to read aloud when players enter the room, setting the scene and atmosphere.
- **boss_name**: The name of the boss.
- **boss_description**: For the Dungeon Master's eyes only. Describe the boss's appearance, abilities, and any unique traits.
- **boss_motivation**: For the Dungeon Master's eyes only. Explain the boss's goal and motivation.
- **boss_weakness**: For the Dungeon Master's eyes only. Describe the boss's weakness, how players can discover or exploit it, and the effects of doing so.
- **boss_mechanics**: For the Dungeon Master's eyes only. Describe the mechanics of the boss encounter, including phases, abilities, and tactics.
- **environmental_features**: For the Dungeon Master's eyes only. Detail any environmental aspects that affect the encounter.
- **failure_consequences**: For the Dungeon Master's eyes only. Explain what happens if the players fail to stop the boss or delay too long.
- **roleplaying_opportunities**: For the Dungeon Master's eyes only. Describe any opportunities for dialogue or moral choices.
- **loot_and_rewards**: For the Dungeon Master's eyes only. List any unique items, knowledge, or rewards gained upon defeating the boss.
- **read_aloud_boss_appearance**: A description to read aloud when the boss is revealed or engages with the players.
${npcInteractionKey ? npcInteractionKey + '\n' : ''}

**Example JSON Format:**

\`\`\`json
{
  "name": "The Abyssal Sanctum",
  "one_sentence_summary": "A chamber of shadow and water where an ancient elemental seeks to flood the world.",
  "read_aloud_description": "You step into a vast chamber carved from obsidian, illuminated by the eerie glow of floating crystals...",
  "boss_name": "Hydrothrax, the Abyssal Tidebinder",
  "boss_description": "Hydrothrax is a towering elemental composed of shadowy water...",
  "boss_motivation": "Hydrothrax seeks to open a permanent portal to the Elemental Plane of Water...",
  "boss_weakness": "Hydrothrax is vulnerable to ancient runic seals...",
  "boss_mechanics": "The encounter has three phases...",
  "environmental_features": "The room's vortex empowers Hydrothrax...",
  "failure_consequences": "If not stopped in time...",
  "roleplaying_opportunities": "Hydrothrax might be reasoned with...",
  "loot_and_rewards": "Defeating Hydrothrax grants...",
  "read_aloud_boss_appearance": "From the vortex emerges a colossal figure..."${npcInteractionExample}
}
\`\`\`
`;
}

export function validateBossRoomResponse(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    const requiredKeys = [
      'name',
      'one_sentence_summary',
      'read_aloud_description',
      'boss_name',
      'boss_description',
      'boss_motivation',
      'boss_weakness',
      'boss_mechanics',
      'environmental_features',
      'failure_consequences',
      'roleplaying_opportunities',
      'loot_and_rewards',
      'read_aloud_boss_appearance',
    ];
    for (const key of requiredKeys) {
      if (!(key in data)) {
        console.error(`Missing required key: ${key}`);
        return false;
      }
    }
    return true;
  } catch (e) {
    console.error('Invalid JSON:', e);
    return false;
  }
}

export function processBossRoomResponse(data) {
  const content = [];
  content.push({
    format: 'read_aloud',
    content: data.read_aloud_description,
  });
  content.push({ format: 'header', content: data.boss_name });
  content.push({ format: 'paragraph', content: data.boss_description });
  content.push({ format: 'paragraph', content: data.boss_motivation });
  content.push({ format: 'paragraph', content: data.boss_weakness });
  content.push({ format: 'paragraph', content: data.boss_mechanics });
  content.push({ format: 'paragraph', content: data.environmental_features });
  if (data.npc_interaction) {
    content.push({ format: 'paragraph', content: data.npc_interaction });
  }
  content.push({ format: 'paragraph', content: data.failure_consequences });
  content.push({
    format: 'paragraph',
    content: data.roleplaying_opportunities,
  });
  content.push({ format: 'paragraph', content: data.loot_and_rewards });
  content.push({
    format: 'read_aloud',
    content: data.read_aloud_boss_appearance,
  });

  return content;
}
