// key-room.js

export function generateKeyRoomPrompt(
  dungeonOverview,
  shortDescription,
  obstacleDescription = '',
  formRoomName = '',
  formRoomSummary = '',
  npcString = '',
) {
  // Conditionally include Obstacle Description
  const obstacleSection = obstacleDescription
    ? `**Obstacle Description:**
${obstacleDescription}

`
    : '';

  // Conditionally include Room Name and Room Summary sections
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

  // Conditionally include NPC Information section
  const npcSection = npcString
    ? `**NPC Present in the Room:**
${npcString}

The NPC is currently in the room. Include them in the room description, detailing what they are doing and how they might interact with players. Consider their personality, goals, and any relationships they have.

`
    : '';

  // Conditionally include NPC Integration guidelines
  const npcGuidelines = npcString
    ? `- **NPC Integration:**
  - Include the NPC in the room description, considering their characteristics and role.
  - Describe what the NPC is doing in the room.
  - Consider how the NPC might interact with the players.
  - Do not reveal any secrets or hidden motives unless the players can perceive them.

`
    : '';

  // Precompute conditional strings for use in the prompt
  const obstacleReference = obstacleDescription
    ? 'the obstacle in a different room'
    : 'an obstacle in the dungeon';

  const keyRelation = obstacleDescription
    ? 'The key should logically relate to the obstacle, providing a coherent narrative link.'
    : 'The key should be significant within the dungeon, even if the specific obstacle is not yet defined.';

  const keyConnection = obstacleDescription
    ? 'its connection to the obstacle and the dungeon'
    : "how it fits into the dungeon's lore";

  const sentence4Title = npcString ? 'The Key or NPC' : 'The Key';

  const sentence4Guideline = npcString
    ? 'Introduce the key or NPC if one is present in the room that is essential to overcoming the obstacle. **Do not reveal any hidden solutions or secrets.**'
    : 'Introduce the key in the room that is essential to overcoming the obstacle. **Do not reveal any hidden solutions or secrets.**';

  return `
Using the dungeon overview${
    obstacleDescription ? ', obstacle description,' : ''
  } and short room description below, create a detailed description of the room that contains the **key** needed to overcome ${obstacleReference}. The "key" doesn't have to be a physical key—it could be a lever, an item, a spell, allies who could help, a defeated enemy, or any other creative solution. The room's name and summary will determine its specific type and characteristics.

**Dungeon Overview:**
${dungeonOverview}

${obstacleSection}**Short Room Description (includes size, exits, and any notable features):**
${shortDescription}

${roomNameSection}${roomSummarySection}${npcSection}**Guidelines:**

- **Room Type Determination:**
  - Use the room's name and summary to identify its type (e.g., "Library of Secrets" suggests a library).
  - Ensure the room type aligns with the dungeon's lore and theme.

- **Key Integration:**
  - The key is central to the room and should significantly impact its description.
  - ${keyRelation}

- **Atmosphere and Tone:**
  - Reflect the room's purpose and the key through sensory details.
  - Maintain consistency with the dungeon's overall atmosphere.

- **Integration with Dungeon Lore:**
  - Incorporate elements from the dungeon overview to enhance immersion.
  - Highlight any historical or magical significance based on the room's summary.

${npcGuidelines}- **Avoid Specific Game Mechanics:**
  - Focus on narrative descriptions without referencing specific game rules or mechanics.

**Read Aloud Description Guidelines:**

Compose the **read_aloud_description** using the following sentence-by-sentence structure:

1. **Sentence 1: Room-Specific Description**
   - **Guideline:** Describe the specific type and characteristics of the room within the dungeon. Include details about its size, purpose, and distinctive features to set the scene for what the players are encountering.
   - **Examples:**
     - "You enter the Library of Secrets, a vast chamber filled with towering bookshelves that stretch to the ceiling."
     - "The Armory lies before you, rows of ancient weapons and armor meticulously displayed."
     - "This Enchanted Grove is a serene space, with luminescent plants casting a soft glow."

2. **Sentence 2: Atmospheric Details**
   - **Guideline:** Focus on sensory experiences specific to the room and the key. Describe smells, lighting, sounds, or any atmospheric elements that add depth.
   - **Examples:**
     - "A musty scent of old parchment fills the air, accompanied by the faint rustle of turning pages."
     - "The metallic scent of steel permeates the room, and the clinking of chains echoes softly."
     - "A gentle breeze carries the scent of blossoms, and the sound of distant chimes soothes your senses."

3. **Sentence 3: Unique Features**
   - **Guideline:** Highlight unique, non-interactive elements that make the room special. These can be architectural, artistic, or natural details.
   - **Examples:**
     - "An ornate chandelier hangs from above, its crystals casting rainbows across the floor."
     - "Murals depicting epic battles adorn the walls, their colors vivid despite the passage of time."
     - "A waterfall cascades down one wall, its waters disappearing into a pool that reflects the starry ceiling."

4. **Sentence 4: ${sentence4Title}**
   - **Guideline:** ${sentence4Guideline}
   - **Examples:**
     - "At the center stands a pedestal holding a glowing tome with intricate lock bindings."
     - "A set of armor, unlike the others, radiates a faint blue light from within."
     ${
       npcString
         ? '- "A wise sage sits at a desk, eyes lifting to meet yours as you enter."'
         : ''
     }
     ${
       npcString
         ? '- "An ethereal guardian hovers near the entrance, its gaze following your every move."'
         : ''
     }

**Return the description in JSON format with the following keys:**

- **name**: A short, appropriate name for the room (e.g., "Library of Secrets", "Enchanted Grove", "Armory"). This name should be 1-2 words and should be simple, indicating the function of the room.
- **one_sentence_summary**: A concise summary of the room's purpose and atmosphere.
- **lore_description**: For the Dungeon Master's eyes only. Describe the room's history, purpose, and how it fits into the dungeon's lore. Who created the key, and why is it here?
- **features_and_contents**: For the Dungeon Master's eyes only. Describe notable features, items, or information present in the room that may be of interest to the players.
- **key_header**: A brief header for the key in the room.
- **key_explanation**: For the Dungeon Master's eyes only. Explain what the "key" is, its history, and ${keyConnection}.
- **key_location**: For the Dungeon Master's eyes only. Describe where the "key" is located within the room (e.g., hidden, guarded, or in plain sight).
- **key_acquisition**: For the Dungeon Master's eyes only. Explain how players can acquire the "key," including any challenges, skill checks, or combat encounters.
- **failure_consequences**: For the Dungeon Master's eyes only. Explain what happens if players fail to acquire the "key," including any consequences or additional challenges.
- **key_circumvention**: For the Dungeon Master's eyes only. Ways players might bypass challenges to acquire the "key" using creative thinking or alternative methods.
- **key_acquisition_dm**: A short sentence like 'Once the players acquire the key, read the following aloud.'
- **read_aloud_key_acquisition**: A description to read aloud when players successfully acquire the "key."
- **read_aloud_description**: A vivid description to read aloud when players enter the room, following the sentence-by-sentence guidelines above. Remember to take the following short description into account, particularly regarding room size: ${shortDescription}
- **additional_notes**: For the Dungeon Master's eyes only. Include any other relevant information or secrets about the room${
    npcString ? ' or NPC' : ''
  }.

**Guidelines:**
- Be creative and ensure the "key" fits within the context of the dungeon overview${
    obstacleDescription ? ' and obstacle' : ''
  }.
- ${keyRelation}
- Do not include hidden information in the 'read_aloud_description' or 'read_aloud_key_acquisition'.
- Keep the descriptions engaging and evocative.

**Example JSON Format:**

\`\`\`json
{
  "name": "Library of Secrets",
  "one_sentence_summary": "A vast library holding ancient tomes, one of which holds the key to overcoming ${
    obstacleDescription ? 'the obstacle' : 'an ancient challenge'
  }.",
  "lore_description": "The Library of Secrets was established by the dungeon's original inhabitants to safeguard knowledge too dangerous for the outside world. Among its collections lies a tome that can ${
    obstacleDescription
      ? 'dispel the magical barrier encountered elsewhere'
      : 'unlock hidden powers within the dungeon'
  }.",
  "features_and_contents": "The library contains countless books, scrolls, and manuscripts. Hidden passages and ladders provide access to higher shelves. Mystical artifacts are displayed under glass cases.",
  "key_header": "The Sealed Grimoire",
  "key_explanation": "The Sealed Grimoire is an ancient book containing spells to ${
    obstacleDescription ? 'nullify magical barriers' : 'unlock hidden powers'
  }. It was locked away to prevent misuse.",
  "key_location": "The grimoire rests on a pedestal at the far end of the library, protected by magical wards and a complex locking mechanism.",
  "key_acquisition": "Players must solve a riddle inscribed on the pedestal and deactivate the wards by manipulating nearby artifacts. Success grants access to the grimoire.",
  "failure_consequences": "Failure triggers a defensive spell, summoning spectral guardians to challenge the players.",
  "key_circumvention": "Clever use of dispel magic could neutralize the wards, or finding a hidden switch might bypass the locking mechanism.",
  "key_acquisition_dm": "Once the players acquire the Sealed Grimoire, read the following aloud.",
  "read_aloud_key_acquisition": "As you unlock the grimoire, its pages glow softly, and you feel a surge of arcane knowledge flow through you.",
  "read_aloud_description": "You enter the Library of Secrets, a vast chamber filled with towering bookshelves that stretch to the ceiling. A musty scent of old parchment fills the air, accompanied by the faint rustle of turning pages. An ornate chandelier hangs from above, its crystals casting rainbows across the floor. At the center stands a pedestal holding a glowing tome with intricate lock bindings.",
  "additional_notes": "An NPC scholar might be present, offering hints or seeking assistance. Some books could contain useful information or traps."
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
      'lore_description',
      'features_and_contents',
      'key_header',
      'key_explanation',
      'key_location',
      'key_acquisition',
      'failure_consequences',
      'key_circumvention',
      'key_acquisition_dm',
      'read_aloud_key_acquisition',
      'read_aloud_description',
      'additional_notes',
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
  content.push({ format: 'paragraph', content: data.lore_description });
  content.push({ format: 'paragraph', content: data.features_and_contents });
  content.push({ format: 'paragraph', content: data.additional_notes });
  content.push({ format: 'header', content: data.key_header });
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
