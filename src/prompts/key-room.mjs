// key-room.js

export function generateKeyRoomPrompt(
  dungeonOverview,
  shortDescription,
  obstacleDescription,
) {
  return `
Using the dungeon overview, room description, and obstacle description below, describe a room that contains the **key** needed to overcome the obstacle in a different room. The "key" doesn't have to be a physical key—it could be a lever, an item, a spell to bypass an obstacle, allies who could help you, a defeated enemy, or any other creative solution.

**Dungeon Overview:**
${dungeonOverview}

**Obstacle Description:**
${obstacleDescription}

**Short Room Description:**
${shortDescription}
It's very important to not add any extra entrances or exits to the room. The short room description describes what's on the map.

**Return the description in JSON format with the following keys:**

- **name**: A short, evocative name for the room.
- **one_sentence_summary**: A concise summary of the room's purpose and atmosphere.
- **read_aloud_description**: A description to read aloud when players enter the room, setting the scene and describing key features without revealing hidden information.
- **key_explanation**: For the Dungeon Master's eyes only. Explain what the "key" is, its history, and its connection to the obstacle and the dungeon.
- **key_location**: For the Dungeon Master's eyes only. Describe where the "key" is located within the room (e.g., hidden, guarded, or in plain sight).
- **key_acquisition**: For the Dungeon Master's eyes only. Explain how players can acquire the "key," including any challenges, skill checks, or combat encounters.
- **failure_consequences**: For the Dungeon Master's eyes only. Explain what happens if players fail to acquire the "key," including any consequences or additional challenges.
- **key_circumvention**: Ways players might bypass challenges to acquire the "key" using creative thinking or alternative methods.
- **key_acquisition_dm**: A short sentence like 'Once the players acquire the key, read the following aloud.'
- **read_aloud_key_acquisition**: A description to read aloud when players successfully acquire the "key."

**Guidelines:**
- Be creative and ensure the "key" fits within the context of the dungeon overview and obstacle.
- The "key" should logically relate to the obstacle, providing a coherent narrative link.
- Do not include hidden information in the 'read_aloud_description' or 'read_aloud_key_acquisition'.
- Keep the descriptions engaging and evocative.

**Example JSON Format:**

\`\`\`json
{
  "name": "Chamber of the Phoenix",
  "one_sentence_summary": "A room filled with the ashes of a fallen phoenix, its rebirth key to overcoming the obstacle.",
  "read_aloud_description": "The room is bathed in a warm, golden light that seems to emanate from the walls themselves. In the center, a stone pedestal holds a pile of shimmering ashes that occasionally spark and glow. The air is thick with the scent of charred wood and the sound of gentle crackling.",
  "key_explanation": "The ashes belong to a phoenix that once dwelt in the dungeon, its fiery essence imbuing the ashes with the power of rebirth.",
  "key_location": "The ashes rest on a stone pedestal in the center of the room, surrounded by a protective ward that requires a specific incantation to bypass.",
  "key_acquisition": "Players must decipher the incantation from the runes on the walls, reciting it to dispel the ward and claim the ashes.",
  "failure_consequences": "If players fail to acquire the ashes, the room grows colder, and the ashes crumble to dust, lost forever.",
  "key_circumvention": "Players could attempt to bypass the ward by using a fire-based spell to burn it away, though this risks damaging the ashes.",
  "key_acquisition_dm": "Once the players acquire the ashes, read the following aloud.",
  "read_aloud_key_acquisition": "As you recite the incantation, the protective ward shimmers and fades, allowing you to claim the ashes."
}
\`\`\`
`;
}

export function validateKeyRoomResponse(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    const requiredKeys = [
      'name',
      'one_sentence_summary',
      'read_aloud_description',
      'key_explanation',
      'key_location',
      'key_acquisition',
      'failure_consequences',
      'key_circumvention',
      'key_acquisition_dm',
      'read_aloud_key_acquisition',
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

export function processKeyRoomResponse(data) {
  const content = [];
  content.push({
    format: 'read_aloud',
    content: data.read_aloud_description,
  });
  content.push({ format: 'header', content: data.name });
  content.push({ format: 'paragraph', content: data.key_explanation });
  content.push({ format: 'paragraph', content: data.key_location });
  content.push({ format: 'paragraph', content: data.key_acquisition });
  content.push({ format: 'paragraph', content: data.failure_consequences });
  content.push({ format: 'paragraph', content: data.key_circumvention });
  content.push({
    format: 'paragraph',
    content: data.key_acquisition_dm,
  });
  content.push({
    format: 'read_aloud',
    content: data.read_aloud_key_acquisition,
  });

  return content;
}
