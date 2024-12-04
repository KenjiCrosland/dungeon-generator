// purpose-room.js

export function generatePurposeRoomPrompt(
  dungeonOverview,
  shortDescription,
  existingRooms = 'none',
  connectedRoomsInfo = 'none',
) {
  return `
Using the dungeon overview and the short room description below, create a detailed description of a specialized purpose room within the dungeon. This room should align with the purpose of either the dungeon's former or current inhabitants, fitting within the context of the dungeon's lore and theme.

**Dungeon Overview:**
${dungeonOverview}

**Short Room Description (includes size, exits, and any notable features):**
${shortDescription}
No need to use the room's shape in the description if it's not relevant to the room's function. Just use the shape to inform other details. For example, if the room is large, it could be a grand library with towering shelves or a chapel with high ceilings.

${
  connectedRoomsInfo !== ''
    ? `**Connected Rooms:** 
  This room is connected to the following rooms: ${connectedRoomsInfo}`
    : ''
}

**Guidelines:**

- **Room Type:**
  - The room could be a library, laboratory, study, chapel, hatchery, armory, ritual chamber, treasury, observatory, or any specialized space that serves a specific function.
  - Choose a specific type of purpose room that makes sense within the dungeon's context and lore.
  - Use the room size to determine the appropriate type:
    - **Small:** Study, small chapel, alchemist's nook.
    - **Medium:** Laboratory, armory, hatchery.
    - **Large:** Library, grand chapel, ritual chamber, treasury.

- **Purpose and Features:**
  - Reflect the specialized function of the room.
  - Include details that highlight its use and significance to the inhabitants.
  - Incorporate elements that connect to the dungeon's history, magic, technology, or culture.

- **Integration with Dungeon Lore:**
  - Ensure the description aligns with the dungeon's theme and story.
  - Incorporate elements from the dungeon overview to enhance immersion.

- **Avoid Specific Game Mechanics:**
  - Focus on narrative descriptions without referencing specific game rules or mechanics.

**Read Aloud Description Guidelines:**

Compose the **read_aloud_description** using the following sentence-by-sentence structure:

1. **Sentence 1: Room-Specific Description**
   - **Guideline:** Describe the specific type and characteristics of the room within the dungeon. Include details about its size, purpose, and distinctive features to set the scene for what the players are encountering.
   - **Examples:**
     - "You enter a vast library filled with towering bookshelves that stretch to the vaulted ceiling."
     - "The chamber is a sacred chapel, illuminated by ethereal light filtering through stained glass windows."
     - "This room appears to be a laboratory, cluttered with strange apparatuses and bubbling concoctions."

2. **Sentence 2: Atmospheric Details**
   - **Guideline:** Focus on sensory experiences specific to the room. Describe smells, lighting, sounds, or any atmospheric element that adds depth to the room’s character.
   - **Examples:**
     - "The scent of old parchment and leather fills the air, mingling with a faint hint of dust."
     - "A haunting melody echoes softly, as if the walls themselves remember ancient hymns."
     - "The air is thick with the acrid smell of chemicals, and a faint hum of energy vibrates through the floor."

3. **Sentence 3: Unique Features**
   - **Guideline:** Highlight unique, non-interactive elements that make the room special. These can be architectural, artistic, or natural details that contribute to the ambiance without being directly usable by the players.
   - **Examples:**
     - "An enormous hourglass stands in the center, sand flowing upward in defiance of gravity."
     - "Intricate frescoes depict celestial events, their colors remarkably vibrant despite the passage of time."
     - "A series of crystal orbs float near the ceiling, casting prismatic light throughout the room."

4. **Sentence 4: Interactive Element**
   - **Guideline:** Introduce one feature in the room that players can interact with. This will be expanded upon further in interactive_element_description. **DO NOT MENTION TRAPS OR ANYTHING HIDDEN TO PLAYERS.**
   - **Examples:**
     - "A massive tome rests open on a pedestal, its pages illuminated with moving script."
     - "An altar at the far end glows softly, a single artifact placed upon it."
     - "A complex contraption of gears and levers occupies one corner, mechanisms quietly whirring."

**Return the description in JSON format with the following keys:**

- **name**: A short, appropriate name for the room (e.g., "Library", "Laboratory", "Chapel", "Armory"). This name should be 1-2 words and should be simple, indicating the function of the room.
- **one_sentence_summary**: A brief summary of the room's function or purpose within the dungeon.
- **lore_description**: For the Dungeon Master's eyes only. Describe the room's history, purpose, and how it fits into the dungeon's lore. Who uses or used this room, and for what specific activities?
- **features_and_contents**: For the Dungeon Master's eyes only. Describe notable features, items, or information present in the room that may be of interest to the players.
- **interactive_element_header**: A brief header for the interactive element in the room (e.g., "The Enchanted Tome", "The Glowing Artifact", "The Mechanical Contraption").
- **interactive_element_lore**: For the Dungeon Master's eyes only. Provide additional lore or context about the interactive element. Why is it here? What is its significance?
- **interactive_element_details**: For the Dungeon Master's eyes only. Describe the interactive element in more detail, including its appearance, behavior, and any effects it may have on the players. Are there any skill checks or actions required to interact with it? What benefits or consequences might arise from interacting with it?
- **read_aloud_description**: A vivid description to read aloud when players enter the room, following the sentence-by-sentence guidelines above. Remember to take the following short description into account, particularly when it comes to room size: ${shortDescription}
- **additional_notes**: For the Dungeon Master's eyes only. Include any other relevant information or secrets about the room.

**Example JSON Format:**

\`\`\`json
{
  "name": "Arcane Library",
  "one_sentence_summary": "A grand library once used by mages to study ancient texts and perform research.",
  "lore_description": "This library was the heart of the temple's knowledge, housing scrolls and books on magic, history, and lore. The mages who served here sought to unlock the secrets of the universe and recorded their findings within these walls.",
  "features_and_contents": "The shelves are filled with ancient tomes, some sealed with magical locks. A large astrolabe hangs from the ceiling, its parts still moving in a slow, deliberate dance. Scrolls and parchments are scattered across tables, covered in cryptic symbols.",
  "interactive_element_header": "The Enchanted Tome",
  "interactive_element_lore": "The tome contains powerful spells and was used by the head mage. It is protected by enchantments to prevent unauthorized access.",
  "interactive_element_details": "The tome rests on a pedestal, pages glowing softly. Players who attempt to read it may need to disable magical protections first. Successfully accessing the tome could grant knowledge of a new spell, a clue to a puzzle, or insight into the dungeon's secrets.",
  "read_aloud_description": "You enter a vast library filled with towering bookshelves that stretch to the vaulted ceiling. The scent of old parchment and leather fills the air, mingling with a faint hint of dust. An enormous hourglass stands in the center, sand flowing upward in defiance of gravity. A massive tome rests open on a pedestal, its pages illuminated with moving script.",
  "additional_notes": "Some of the books might be valuable or contain forbidden knowledge. Disturbing certain items could trigger magical defenses or attract unwanted attention."
}
\`\`\`

The dungeon already has the following rooms: ${existingRooms}

Do not reuse any of these room types. Ensure that the room description is unique and adds depth to the dungeon's narrative.

If they aren't in the list, you can use the following room types: library, laboratory, study, chapel, hatchery, armory, ritual chamber, treasury, observatory, or any specialized space that serves a specific function. Focus on rooms that align with the dungeon's lore and the activities of its inhabitants.

Room size should determine the type of room you choose. For example:

- A **small** room could be a study or small chapel.
- A **medium** room could be a laboratory or armory.
- A **large** room could be a library or grand chapel.

**Please provide the response in this JSON format.**
`;
}

export function validatePurposeRoomResponse(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    const requiredKeys = [
      'name',
      'one_sentence_summary',
      'read_aloud_description',
      'lore_description',
      'features_and_contents',
      'interactive_element_header',
      'interactive_element_lore',
      'interactive_element_details',
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

export function processPurposeRoomResponse(data) {
  const content = [];
  content.push({
    format: 'read_aloud',
    content: data.read_aloud_description,
  });
  content.push({ format: 'paragraph', content: data.lore_description });
  content.push({ format: 'paragraph', content: data.features_and_contents });
  content.push({ format: 'paragraph', content: data.additional_notes });
  content.push({ format: 'header', content: data.interactive_element_header });
  content.push({ format: 'paragraph', content: data.interactive_element_lore });
  content.push({
    format: 'paragraph',
    content: data.interactive_element_details,
  });

  return content;
}
