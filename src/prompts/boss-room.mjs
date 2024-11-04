// boss-room.js

export function generateBossRoomPrompt(dungeonOverview, shortDescription) {
  return `
Using the dungeon overview and room description below, create a detailed description of the **boss room**. The boss encounter should be engaging, dynamic, and fit within the context of the dungeon.

**Dungeon Overview:**
${dungeonOverview}

**Short Room Description:**
${shortDescription}

**Guidelines:**

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

- **Loot and Rewards:**
  - Specify any unique items, knowledge, or rewards the players gain upon victory.

- **Foreshadowing Elements:**
  - If applicable, reference clues or hints from earlier in the dungeon.

**Return the description in JSON format with the following keys:**

- **name**: A short, evocative name for the boss room.
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

**Example JSON Format:**

{
  "name": "The Abyssal Sanctum",
  "one_sentence_summary": "A chamber of shadow and water where an ancient elemental seeks to flood the world.",
  "read_aloud_description": "You step into a vast chamber carved from obsidian, illuminated by the eerie glow of floating crystals. At the center, a swirling vortex pulses with dark energy.",
  "boss_name": "Hydrothrax, the Abyssal Tidebinder",
  "boss_description": "Hydrothrax is a towering elemental composed of shadowy water, its form constantly shifting. Tendrils of dark energy emanate from its core, and its eyes glow with ancient power.",
  "boss_motivation": "Hydrothrax seeks to open a permanent portal to the Elemental Plane of Water, flooding the world and reclaiming lost essences.",
  "boss_weakness": "Hydrothrax is vulnerable to ancient runic seals found throughout the temple. A successful DC 18 Wisdom (Perception) or Intelligence (Arcana) check reveals glowing symbols on its body corresponding to the seals. Players can exploit this weakness by performing a ritual or using spells aligned with the seals, reducing its defenses and preventing it from regenerating health.",
  "boss_mechanics": "The encounter has three phases, each introducing new abilities. Hydrothrax manipulates water and shadow, summons minions, and alters the environment. Special mechanics include rising water levels and area-of-effect attacks.",
  "environmental_features": "The room's vortex empowers Hydrothrax, and crystals can be destroyed to weaken it. Water fills the room gradually, affecting movement.",
  "failure_consequences": "If not stopped in time, the portal opens fully, unleashing a catastrophic flood and summoning powerful elementals.",
  "roleplaying_opportunities": "Hydrothrax might be reasoned with if players offer to help restore balance differently. It reveals lore about the temple and its own creation.",
  "loot_and_rewards": "Defeating Hydrothrax grants the 'Trident of Tides' and knowledge to control the temple's energies.",
  "read_aloud_boss_appearance": "From the vortex emerges a colossal figure of swirling darkness and water. 'You are too late,' it echoes, 'the tide shall consume all.'"
}
**Please provide the response in this JSON format.**
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
