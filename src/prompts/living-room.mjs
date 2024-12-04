// living-room.js

export function generateLivingRoomPrompt(
  dungeonOverview,
  shortDescription,
  existingRooms = 'none',
  connectedRoomsInfo,
) {
  return `
Using the dungeon overview and the short room description below, create a detailed description of a daily use type room within the dungeon. This room should provide a slice of life for the current or former residents, fitting within the context of the dungeon's lore and theme.

**Dungeon Overview:**
${dungeonOverview}

**Short Room Description (includes size, exits, and any notable features):**
${shortDescription}
No need to use the room's shape in the description if it's not relevant to the room's function. Just use the shape to inform other details. For example if the room is long, you could say that there are many beds lined up against the walls.

${
  connectedRoomsInfo !== ''
    ? `**Connected Rooms:** 
  This room is connected to the following rooms: ${connectedRoomsInfo}`
    : ''
}

**Guidelines:**

- **Room Type:**
  - The room could be a dormitory, bedroom, kitchen, dining room, drawing room, campsite, warren, or any space where inhabitants live or spend leisure time.
  - Choose a specific type of living room that makes sense within the dungeon's context.

- **Current or Former Residents:**
  - Reflect the lifestyle and characteristics of the current or former inhabitants.
  - Include details that hint at who uses or used the room (e.g., furniture, personal items, decorations).

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
     - "The Guardroom is cramped and dimly lit, with rusted weapons and shields adorning its walls."
     - "The Alchemist's Lab is cluttered with bubbling potions and strange apparatuses, the air heavy with the scent of chemicals."
     - "The Treasure Chamber gleams with gold and jewels, but its opulence is overshadowed by the ominous statues guarding every corner."

2. **Sentence 2: Atmospheric Details**
   - **Guideline:** Focus on sensory experiences specific to the room. Describe smells, lighting, sounds, or any atmospheric element that adds depth to the room’s character.
   - **Examples:**
     - "A musty odor permeates the air, mingling with a faint, metallic scent of old battles."
     - "Faint, eerie lights from various flasks cast unsettling shadows on the stone walls."
     - "The clink of shifting coins echoes softly, disturbed by a barely perceptible draft."

3. **Sentence 3: Unique Features**
   - **Guideline:** Highlight unique, non-interactive elements that make the room special. These can be architectural, artistic, or natural details that contribute to the ambiance without being directly usable by the players.
   - **Examples:**
     - "An ancient tapestry, threadbare and faded, depicts a long-forgotten battle, hanging precariously on one wall."
     - "Shelves lined with oddly colored fungi emit a faint luminescence, providing the only light in the chamber."
     - "Intricate mosaics on the floor, partially covered by dust, show celestial patterns and unknown symbols."

4. **Sentence 4: Interactive Element**
   - **Guideline:** Introduce one feature in the room that players can interact with. These should be elements that can provoke action, conversation, or decision-making. This will be expanded upon further in interactive_element_description **DO NOT MENTION TRAPS OR ANYTHING HIDDEN TO PLAYERS.**
   - **Examples:**
     - "A ghostly figure, clad in ancient armor, paces restlessly, murmuring about a lost battle and a betrayed king."
     - "Among the clutter, a prominently placed tome radiates a subtle, magical aura, seemingly beckoning for a closer look."
     - "A conspicuously ornate chest sits in the center, its lock glinting ominously under the flickering torchlight."

**Return the description in JSON format with the following keys:**

- **name**: A short, appropriate name for the room (e.g., "Barracks", "Kitchen", "Goblin Camp", "Parlor", "Bedroom"). This name should be 1-2 words and should be simple, almost dull. The interesting stuff is in the description not the name. Just give us the function of the room.
- **one_sentence_summary**: A brief summary of the room's function or purpose within the dungeon.
- **lore_description**: For the Dungeon Master's eyes only. Describe the room's function or purpose within the dungeon. Who spends or spent time here? What activities take place or took place here? Were all inhabitants allowed in this room or just a select few?
- **features_and_contents**: For the Dungeon Master's eyes only. Describe notable features, items, or information present in the room that may be of interest to the players.
- **interactive_element_header**: A brief header for the interactive element in the room (e.g., "The Ghostly Figure", "The Enchanted Tome", "The Ornate Chest").
- **interactive_element_lore**: For the Dungeon Master's eyes only. Provide additional lore or context about the interactive element. Why is it here? What is its significance?
- **interactive_element_details**: For the Dungeon Master's eyes only. Describe the interactive element in more detail, including its appearance, behavior, and any effects it may have on the players. Are there any skill checks or actions required to interact with it? What benefits or consequences might arise from interacting with it?
- **read_aloud_description**: A vivid description to read aloud when players enter the room, following the sentence-by-sentence guidelines above. Remember to take the following short description into account, particularly when it comes to room size: ${shortDescription}
- **additional_notes**: For the Dungeon Master's eyes only. Include any other relevant information or secrets about the room.

**Example JSON Format:**

\`\`\`json
{
  "name": "Cultist Dormitory",
  "one_sentence_summary": "A room where cultists once slept and meditated.",
  "lore_description": "This room served as the sleeping quarters for the cultists who once inhabited the dungeon. They would gather here for rest and meditation between their dark rituals.",
  "features_and_contents": "The cots are neatly made, with small personal belongings tucked under each pillow. A faded tapestry depicting a hooded figure hangs above the entrance.",
  "interactive_element_header": "The Hooded Figure",
  "interactive_element_lore": "The tapestry depicts the cult's mysterious leader, known only as the Shadowed One. His face is obscured by shadows, and his eyes seem to follow your every move.",
  "interactive_element_details": "The tapestry radiates a faint magical aura, and a soft whispering voice can be heard when standing near it. Players who examine the tapestry may make a knowledge check to decipher the the symbolism embedded in the design. The symbolism will provide a clue to a future challenge or hidden treasure.",
  "read_aloud_description": "The room is cramped and dimly lit, with rows of simple cots lining the walls. The air is heavy with the scent of incense, and faint whispers echo through the chamber. A faded tapestry depicting a hooded figure hangs above the entrance.",
  "additional_notes": "The cultists' personal belongings are mundane but well cared for, suggesting a sense of order and discipline among the group."
}
\`\`\`

The dungeon already has the following rooms: ${existingRooms}

Do not reuse any of these room types. Ensure that the room description is unique and adds depth to the dungeon's narrative.
If they aren't in the list, you can use the following room types: dormitory, bedroom, kitchen, dining room, drawing room, campsite, warren, or any space where inhabitants live or spend leisure time. Focus on eating, sleeping, or socializing spaces first before moving on to more specialized rooms.
Room size should determine the type of room you choose. For example, a large room could be a dining room or dormitory, while a small room could be a kitchen or bedroom.
**Please provide the response in this JSON format.**
`;
}

export function validateLivingRoomResponse(jsonString) {
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

export function processLivingRoomResponse(data) {
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
