export function monsterDescriptionPrompt(overview, monster) {
  return `
  Based on the following dungeon overview, expand the short description of a monster into a detailed full description. Structure the description into four parts: Intro, Appearance, Behavior/Abilities, and Lore. Use the example structure provided, but do not use the example text directly. Ensure the description is vivid, creative, and consistent with the overall dungeon theme:

  Dungeon Overview: ${overview}

  Monster Short Description: ${monster.description}

  Monster Name: ${monster.name ? monster.name : 'Generate an appropriate name'}

  Return the monster description in JSON format with the following keys. Limit each section to 1-2 sentences:
  {
    "name": "${monster.name}",
    "intro": "A brief introduction describing the monster's role and significance in the dungeon or setting. This should set the tone for what kind of creature it is and how it fits into the dungeon.",
    "appearance": "A detailed visual description of the monster, highlighting its unique physical features and emphasizing creativity and uniqueness.",
    "behaviorAbilities": "A concise section detailing the monster's behaviors, combat abilities, and notable traits. Include how it interacts with the dungeon's environment and its role in the ecosystem.",
    "lore": "Background information about the monster. This should cover its origin, purpose, or any folklore associated with it, tying it to the dungeon and its dominant power or secondary power if relevant."
  }

  Ensure the description aligns with the dungeon's theme, difficulty level, and the overall narrative. Use rich, evocative language, and avoid common fantasy tropes. Use specific names or references only if consistent with the overview provided. Keep descriptions short, focused, and engaging.
  `;
}

export function validateMonsterDescription(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    // Check for required keys
    const requiredKeys = ['intro', 'appearance', 'behaviorAbilities', 'lore'];

    for (const key of requiredKeys) {
      if (!(key in data)) {
        return false;
      }
    }

    return true;
  } catch (e) {
    return false;
  }
}
