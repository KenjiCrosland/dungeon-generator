// secret-room-prompt.mjs

export function generateSecretRoomPrompt(
  dungeonOverview,
  shortDescription,
  connectedRoomDescription = '',
  connectedRoomsInfo = '',
) {
  const connectedRoomSection = connectedRoomDescription
    ? `**Connected Room Description:**
${connectedRoomDescription}

`
    : '';

  return `
Using the dungeon overview and the descriptions below, create a detailed description of a secret room within the dungeon. The secret room is typically unknown to the dungeon's regular inhabitants and may offer a high risk/reward situation for adventurers. It often serves an exclusive purpose, such as a treasury, hidden laboratory, library of forbidden knowledge, expensive reagent storage, or a private study.

**Dungeon Overview:**
${dungeonOverview}

**Short Room Description (includes size, exits, and any notable features):**
${shortDescription}

${connectedRoomSection}**Connected Rooms:**
This room is connected to the following rooms: ${connectedRoomsInfo}

**Guidelines:**

- **Purpose and Theme:**
  - Determine the secret room's purpose based on the dungeon's theme and lore.
  - The room should offer valuable rewards, significant information, or unique challenges.

- **Exclusivity:**
  - Emphasize that the room is hidden even from the dungeon's regular inhabitants.
  - The room may be connected to a leader or significant figure within the dungeon who desires a private space.

- **Atmosphere and Details:**
  - Create a vivid description that reflects the room's secretive nature.
  - Include sensory details (sights, sounds, smells) that enhance the atmosphere.

- **Interactive Elements:**
  - Introduce interactive features or items within the room that players can engage with.
  - These could be valuable treasures, powerful artifacts, or challenging puzzles.

- **Lore Integration:**
  - Provide background information that ties the room into the dungeon's history and the broader narrative.

**Read Aloud Description Guidelines:**

Compose the **read_aloud_description** using the following sentence-by-sentence structure:

1. **Sentence 1: Room-Specific Description**
   - **Guideline:** Describe the specific type and characteristics of the secret room. Include details about its size, purpose, and distinctive features to set the scene for what the players are encountering.
   - **Examples:**
     - "You step into a dimly lit chamber, the Hidden Treasury, where piles of gold coins glint faintly in the sparse light."
     - "The concealed laboratory is cluttered with strange apparatuses and bubbling concoctions, the air thick with the scent of exotic herbs."
     - "Before you lies a forgotten library, its towering shelves filled with ancient tomes bound in worn leather."

2. **Sentence 2: Atmospheric Details**
   - **Guideline:** Focus on sensory experiences specific to the secret room. Describe smells, lighting, sounds, or any atmospheric elements that add depth to the room’s character.
   - **Examples:**
     - "A cool draft whispers through the room, carrying the faint scent of old parchment and dust."
     - "Soft, eerie glows emanate from scattered crystals, casting dancing shadows on the walls."
     - "The silence is profound, broken only by the distant dripping of water echoing through unseen passages."

3. **Sentence 3: Unique Features**
   - **Guideline:** Highlight unique, non-interactive elements that make the secret room special. These can be architectural, artistic, or natural details that contribute to the ambiance without being directly usable by the players.
   - **Examples:**
     - "Elaborate murals adorn the walls, depicting forgotten rituals and celestial events."
     - "An intricate mosaic covers the floor, its pattern forming an unknown sigil that seems to shift when not directly observed."
     - "Suspended from the ceiling is a grand chandelier, its candles long extinguished but still exuding a faint, ghostly light."

4. **Sentence 4: Interactive Element**
   - **Guideline:** Introduce one feature in the room that players can interact with. These should be elements that can provoke action, conversation, or decision-making. This will be expanded upon further in **interactive_elements**. **DO NOT MENTION TRAPS OR ANYTHING HIDDEN TO PLAYERS.**
   - **Examples:**
     - "At the center stands a pedestal holding a mysterious orb that pulsates with arcane energy."
     - "A large, ornate chest rests against the far wall, its surface engraved with ancient runes."
     - "An old lectern holds an open book, its pages filled with writings that glow softly with a silvery light."

**Important Notes:**

- Do **not** include any hidden information or GM-only content in the **read_aloud_description**.
- All hidden details, traps, or secrets should be included in the **lore_description**, **features_and_contents**, **interactive_elements**, or **additional_notes**.
- Ensure that the **read_aloud_description** is suitable to be read directly to players.

**Return the secret room details in JSON format with the following flat keys:**

- **name**: A short, appropriate name for the secret room (e.g., "Hidden Treasury", "Forbidden Library").
- **one_sentence_summary**: A brief summary of the room's function or purpose.
- **read_aloud_description**: The description composed using the guidelines above, suitable for reading to players.
- **lore_description**: Detailed background information about the room's history and purpose.
- **features_and_contents**: Description of notable features, items, or information present in the room.
- **interactive_elements**: Details about any interactive elements within the room, including possible mechanics or outcomes.
- **additional_notes**: Any other relevant information or secrets about the room.

**Example JSON Format:**

\`\`\`json
{
  "name": "Forgotten Sanctuary",
  "one_sentence_summary": "A hidden chamber once used for secret rituals by the dungeon's original inhabitants.",
  "read_aloud_description": "You enter a hidden sanctuary, its vaulted ceilings arching high above with intricate carvings of celestial bodies. A gentle hum fills the air, accompanied by a soft glow emanating from glyphs embedded in the walls. Dominating the center of the room is a stone altar adorned with ancient symbols. Before it stands a large, ornate tome resting on a pedestal, its pages illuminated by an unseen light.",
  "lore_description": "This sanctuary was a sacred space for the dungeon's creators, used to perform rituals invoking otherworldly powers. It was sealed off to protect its secrets from falling into the wrong hands.",
  "features_and_contents": "The walls are lined with alcoves containing relics and artifacts of great significance. The glyphs on the walls pulse with residual magical energy.",
  "interactive_elements": "The tome on the pedestal contains spells and incantations long forgotten. Studying it requires a **DC 18 Arcana** check, offering valuable knowledge or potentially unleashing unintended consequences.",
  "additional_notes": "Hidden compartments beneath the altar may contain rare components or clues about the dungeon's deeper mysteries."
}
\`\`\`
`;
}

// Validation Function
export function validateSecretRoomResponse(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    const requiredKeys = [
      'name',
      'one_sentence_summary',
      'read_aloud_description',
      'lore_description',
      'features_and_contents',
      'interactive_elements',
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

// Processing Function
export function processSecretRoomResponse(data) {
  const content = [];

  content.push({
    format: 'read_aloud',
    content: data.read_aloud_description,
  });

  content.push({
    format: 'paragraph',
    content: data.lore_description,
  });

  content.push({
    format: 'paragraph',
    content: data.features_and_contents,
  });

  content.push({
    format: 'paragraph',
    content: data.interactive_elements,
  });

  content.push({
    format: 'paragraph',
    content: data.additional_notes,
  });

  return content;
}
