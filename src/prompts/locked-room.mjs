// locked-room-prompt.mjs

export function generateLockedRoomPrompt(
  dungeonOverview,
  shortDescription,
  connectedRoomsInfo = '',
) {
  return `
Using the dungeon overview and the descriptions below, create a detailed description of a locked room within the dungeon. The locked room is known to the dungeon's regular inhabitants and serves a specific purpose, often containing important treasures, valuable items, or significant information. It may function as a storage room, armory, prison cell, treasury, or a guarded chamber.

**Dungeon Overview:**
${dungeonOverview}

**Short Room Description (includes size, exits, and any notable features):**
${shortDescription}

${
  connectedRoomsInfo !== ''
    ? `**Connected Rooms:** 
  This room is connected to the following rooms: ${connectedRoomsInfo}`
    : ''
}
**Guidelines:**

- **Purpose and Theme:**
  - Determine the locked room's purpose based on the dungeon's theme and lore.
  - The room should contain items or information valuable to the dungeon's inhabitants.

- **Security Features:**
  - Emphasize the locked nature of the room.
  - Describe any security measures, such as sturdy doors, guards, magical seals, or traps (do not reveal traps in the read_aloud_description).

- **Atmosphere and Details:**
  - Create a vivid description that reflects the room's purpose and importance.
  - Include sensory details (sights, sounds, smells) that enhance the atmosphere.

- **Interactive Elements:**
  - Introduce interactive features or items within the room that players can engage with.
  - These could be valuable treasures, important documents, or objects relevant to the dungeon's narrative.

- **Lore Integration:**
  - Provide background information that ties the room into the dungeon's history and the broader narrative.

**Read Aloud Description Guidelines:**

Compose the **read_aloud_description** using the following sentence-by-sentence structure:

1. **Sentence 1: Room-Specific Description**
   - **Guideline:** Describe the specific type and characteristics of the locked room. Include details about its size, purpose, and distinctive features to set the scene for what the players are encountering.
   - **Examples:**
     - "You enter a fortified chamber, the Armory, lined with racks of weapons and suits of armor."
     - "The door opens to reveal a spacious treasury, where chests overflowing with coins are neatly arranged."
     - "Before you lies a dimly lit prison cell, its walls bearing the marks of former captives."

2. **Sentence 2: Atmospheric Details**
   - **Guideline:** Focus on sensory experiences specific to the locked room. Describe smells, lighting, sounds, or any atmospheric elements that add depth to the room’s character.
   - **Examples:**
     - "The scent of oil and metal fills the air, mingling with the faint echo of clanking chains."
     - "A warm glow emanates from lanterns hung along the walls, casting flickering shadows across the treasures."
     - "The cold, damp air chills you to the bone, and the distant sound of dripping water echoes softly."

3. **Sentence 3: Unique Features**
   - **Guideline:** Highlight unique, non-interactive elements that make the locked room special. These can be architectural, artistic, or natural details that contribute to the ambiance without being directly usable by the players.
   - **Examples:**
     - "Intricate tapestries depicting historic battles adorn the walls."
     - "An imposing statue of a dragon stands guard in the corner, its eyes seeming to follow your every move."
     - "Iron bars reinforce the stone walls, and a small window high above lets in a sliver of light."

4. **Sentence 4: Interactive Element**
   - **Guideline:** Introduce one feature in the room that players can interact with. These should be elements that can provoke action, conversation, or decision-making. This will be expanded upon further in **interactive_elements**. **DO NOT MENTION TRAPS OR ANYTHING HIDDEN TO PLAYERS.**
   - **Examples:**
     - "A large, ornate chest rests against the far wall, its lock gleaming invitingly."
     - "On a central table lies a map spread open, marked with various strategic locations."
     - "Chains hang from the ceiling, and among them dangles a key just out of easy reach."

**Important Notes:**

- Do **not** include any hidden information or GM-only content in the **read_aloud_description**.
- All hidden details, traps, or secrets should be included in the **lore_description**, **features_and_contents**, **interactive_elements**, or **additional_notes**.
- Ensure that the **read_aloud_description** is suitable to be read directly to players.

**Return the locked room details in JSON format with the following flat keys:**

- **name**: A short, appropriate name for the locked room (e.g., "Armory", "Treasury").
- **one_sentence_summary**: A brief summary of the room's function or purpose.
- **read_aloud_description**: The description composed using the guidelines above, suitable for reading to players.
- **lore_description**: Detailed background information about the room's history and purpose.
- **features_and_contents**: Description of notable features, items, or information present in the room.
- **interactive_elements**: Details about any interactive elements within the room, including possible mechanics or outcomes.
- **additional_notes**: Any other relevant information or secrets about the room.

**Example JSON Format:**

\`\`\`json
{
  "name": "Guarded Armory",
  "one_sentence_summary": "A locked armory containing weapons and armor used by the dungeon's defenders.",
  "read_aloud_description": "You enter a fortified chamber, the Armory, lined with racks of weapons and suits of armor. The scent of oil and metal fills the air, and torches flicker along the walls. Intricate banners displaying the dungeon's emblem hang proudly above. At the center stands a sturdy wooden table with an array of finely crafted swords laid out.",
  "lore_description": "The armory stores the arms and armor for the dungeon's guards. It is kept locked to prevent unauthorized access and is regularly maintained by the quartermaster.",
  "features_and_contents": "The room contains various weapons and armor, some of which are of exceptional quality. A ledger on a side table records the inventory and distribution of equipment.",
  "interactive_elements": "Players can examine the weapons and possibly acquire some if they can bypass any security measures. The ledger may reveal information about the dungeon's defenses.",
  "additional_notes": "Some items may be trapped or enchanted to prevent theft. Guards may patrol the area or respond if an alarm is triggered."
}
\`\`\`
`;
}

// Validation Function
export function validateLockedRoomResponse(jsonString) {
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
export function processLockedRoomResponse(data) {
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
