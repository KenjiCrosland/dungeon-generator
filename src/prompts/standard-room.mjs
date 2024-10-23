// standard-room.js

export function generateStandardRoomPrompt(dungeonOverview, room) {
  return `
Using the dungeon overview and the specific room details provided below, generate a detailed description of this room in the dungeon. Ensure that the description is creative, unique, and avoids common fantasy tropes and clichés. The description should fit logically within the dungeon's narrative and structure, and should be engaging for players.

**Dungeon Overview:**
${JSON.stringify(dungeonOverview, null, 2)}

**Room Details:**
${JSON.stringify(room, null, 2)}

**Instructions:**

- **Name**: Provide a descriptive and evocative name for the room (e.g., "Hall of Whispering Shadows").
- **Description**: Describe the room's appearance, atmosphere, and any notable features in detail. Mention the entrances and exits based on the doorways provided.
- **Contents**: List any items, creatures, or notable objects found in the room. Be specific and imaginative.
- **Hazards**: Describe any traps, environmental dangers, or challenges present in the room.
- **Connections**: Briefly describe how this room connects to adjacent rooms, based on the doorways.
- **Secrets**: Include any hidden elements, secret passages, or lore associated with the room.
- **NPCs**: If any relevant NPCs from the dungeon overview are present in the room, include them with a brief description of their role and intentions.

**Return the room description in JSON format with the following structure:**

\`\`\`json
{
  "name": "A descriptive name for the room.",
  "description": "Detailed description of the room's appearance, atmosphere, and notable features.",
  "contents": "Items, creatures, or notable objects found in the room.",
  "hazards": "Traps, environmental dangers, or challenges present in the room.",
  "connections": "How this room connects to adjacent rooms.",
  "secrets": "Hidden elements, secret passages, or lore associated with the room.",
  "npcs": [
    {
      "name": "NPC Name",
      "description": "A brief description of the NPC, their role in the room, and their intentions."
    }
    // Repeat the above structure for each NPC in the room
  ]
}
\`\`\`

**Guidelines:**

- Be creative and original in your descriptions.
- Ensure that the room fits logically within the dungeon's overall narrative.
- Avoid clichés and overused fantasy tropes.
- Use clear and concise language suitable for a dungeon master to convey to players.
- If the room contains any clues or keys relevant to other rooms (e.g., keys for locked doors), include them in the contents or secrets.
- Make sure any NPCs included are consistent with those described in the dungeon overview.

**Note:** Do not include any additional information outside of the JSON structure provided. Ensure the JSON is properly formatted and valid.

**Example of the expected output:**

\`\`\`json
{
  "name": "Chamber of Echoing Whispers",
  "description": "The chamber is vast, with walls covered in ancient runes that seem to shimmer in the dim light. A soft whispering fills the air, echoing off the stone surfaces.",
  "contents": "An ornate pedestal stands at the center, holding a crystalline orb. Shadows flicker at the edges of the room.",
  "hazards": "A magical trap triggers whispers that can confuse and disorient intruders.",
  "connections": "Exits lead to the north and east, through arched doorways engraved with symbols.",
  "secrets": "A hidden switch behind a loose stone reveals a secret passage to another room.",
  "npcs": [
    {
      "name": "Elaria the Whisperer",
      "description": "A ghostly figure bound to the chamber, offering cryptic hints but seeking to trap the unwary."
    }
  ]
}
\`\`\`
`;
}

export function validateStandardRoomResponse(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    const requiredKeys = [
      'name',
      'description',
      'contents',
      'hazards',
      'connections',
      'secrets',
      'npcs',
    ];
    for (const key of requiredKeys) {
      if (!(key in data)) {
        console.error(`Missing required key: ${key}`);
        return false;
      }
    }
    // Additional checks for data types and structures can be added here
    return true;
  } catch (e) {
    console.error('Invalid JSON format:', e.message);
    return false;
  }
}

export function processStandardRoomResponse(data) {
  const paragraphs = [];

  // Concatenate description, contents, and hazards into one paragraph
  const firstParagraph = [data.description, data.contents, data.hazards]
    .filter(Boolean)
    .join(' ');

  paragraphs.push(firstParagraph);

  // NPCs as a separate paragraph
  if (data.npcs && data.npcs.length > 0) {
    const npcDescriptions = data.npcs.map(
      (npc) => `${npc.name}: ${npc.description}`,
    );
    paragraphs.push('NPCs: ' + npcDescriptions.join('; '));
  }

  // Connections and secrets as separate paragraphs
  if (data.connections) {
    paragraphs.push(data.connections);
  }

  if (data.secrets) {
    paragraphs.push(data.secrets);
  }

  return paragraphs;
}
