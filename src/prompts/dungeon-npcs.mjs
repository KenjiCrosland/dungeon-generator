// dungeon-npc-prompts.js

export function createDungeonNPCPrompt(
  npcName,
  dungeonOverview,
  npcShortDescription,
) {
  return `
Please create a detailed Tabletop Roleplaying NPC description for **${npcName}**, who is part of the dungeon described below.

**NPC Short Description:**
${npcShortDescription}

**Dungeon Overview:**
${dungeonOverview}

Please format the NPC description as a JSON object with the following keys:

{
  "name": "${npcName}",
  "description_of_position": "Provide a specific and detailed description of their role in society, including a detail that sets them apart from others in that role.",
  "why_in_dungeon": "Why are they here in the dungeon? Do they live here? Are they visiting? Consider a current goal or aspiration of theirs. If adventurers ran into them what would they be doing?",
  "distinctive_features_or_mannerisms": "Provide a distinctive feature or peculiar mannerism observable in their actions. Avoid clichés and consider how these traits might influence their interactions with others.",
  "character_secret": "A hidden motivation or secret of ${npcName} that influences their behavior. Be specific about what this secret is and how it impacts their actions.",
  "read_aloud_description": "A concise 2-3 sentence description designed for a GM to read aloud when players first encounter ${npcName}. Remember that this would be somewhere in the dungeon."
}
`;
}

export function createDungeonNPCRelationshipsPrompt(npcName, npcDescription) {
  return `
Please create descriptions of relationships for an NPC named **${npcName}** described by the following JSON object:

${npcDescription}

Please respond in JSON Format with the following keys: **relationships**, **roleplaying_tips**. When describing relationships, mention one meaningful event that occurred between the NPC and the character they have a relationship with.

For each relationship, provide 2 sentences:

- **Sentence 1:** Describe the nature of the relationship and how it has evolved or how they met. Include a scene that occurred between the NPC and this character.
- **Sentence 2:** Describe a recent event or development in the relationship or the person's life. Show, don't tell.

Avoid using common NPC names like Seraphina, Alistair, Kael, etc.

Format:

{
  "relationships": {
    "npc_name_1": "Description (as per above instructions).",
    "npc_name_2": "Description (as per above instructions).",
    "npc_name_3": "Description (as per above instructions)"
  },
  "roleplaying_tips": "1-2 sentences of roleplaying tips for this NPC."
}

Please replace "npc_name" with actual names. Ensure that the relationships object has keys with the names of each character the NPC has relationships with.
`;
}

// dungeon-npc-validation.js

export function validateDungeonNPCResponse(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    const requiredKeys = [
      'name',
      'description_of_position',
      'why_in_dungeon',
      'distinctive_features_or_mannerisms',
      'character_secret',
      'read_aloud_description',
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

export function validateDungeonNPCRelationshipsResponse(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (!('relationships' in data) || !('roleplaying_tips' in data)) {
      return false;
    }
    // Optionally validate the structure of relationships
    return true;
  } catch (e) {
    console.error('Invalid JSON:', e);
    return false;
  }
}
