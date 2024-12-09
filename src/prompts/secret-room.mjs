// secret-room-prompt.mjs

export function generateSecretRoomPrompt(
  dungeonOverview,
  roomDescription,
  connectedRoomsInfo = '',
  secretDoorDetails = '',
) {
  // Include the secretDoorDetails if provided
  const secretDoorSection = secretDoorDetails
    ? `**Secret Door Details:**
${secretDoorDetails}

`
    : '';

  return `
Using the dungeon overview, current room description, and connected rooms information below, create a detailed content for a secret room within the dungeon. The secret room should match the theme of the dungeon and incorporate elements that explain why it is concealed and the nature of the secret door leading to it. All descriptions are intended for the **Game Master (GM)** only.

**Dungeon Overview:**
${dungeonOverview}

**Room Description:**
${roomDescription}

${
  connectedRoomsInfo !== ''
    ? `**Connected Rooms:** 
  This room is connected to the following rooms: ${connectedRoomsInfo}`
    : ''
}

${secretDoorSection}**Guidelines:**

- **Room Name and Summary:**
  - Provide a short, appropriate name for the room (e.g., "Hidden Alchemy Lab", "Secret Archives").
  - Summarize the room's function or purpose within the dungeon in a single sentence.

- **Lore Description:**
  - Describe the room's history, its original purpose, and how it fits within the dungeon's lore.
  - Explain why the room was hidden, and how it connects to the secret door. (E.g., if the door is hidden behind a tapestry, the room might have been used for activities requiring secrecy, such as forbidden rituals.)

- **Features and Contents:**
  - Describe the notable features, items, or information in the room.
  - Tie in elements that relate to the secret door's finding and opening mechanics (e.g., items or writings that justify the door's mechanism).

- **Interactive Elements:**
  - Include details about interactive elements, such as items of interest, mechanisms, or NPCs present.
  - Describe how the players might interact with these elements and any consequences of doing so.

**Important Notes:**

- All descriptions should be for **GM's eyes only**.
- Ensure consistency between the secret door and the room it leads to.

**Return the secret room details in JSON format with the following flat keys:**

- **name**: A short, appropriate name for the room.
- **one_sentence_summary**: A brief summary of the room's function or purpose.
- **read_aloud_description**: A vivid description to read aloud when players enter the room, setting the scene and atmosphere.
- **lore_description**: Describe the room's history, purpose, and why it was hidden.
- **features_and_contents**: Notable features, items, or information in the room.
- **interactive_elements**: Details about interactive elements, items, or NPCs.
- **additional_notes**: Include any other relevant information or secrets about the room.

**Example JSON Format:**

\`\`\`json
{
  "name": "Hidden Alchemy Lab",
  "one_sentence_summary": "A concealed lab filled with forbidden alchemical research.",
  "read_aloud_description": "The room is dimly lit, with shelves of strange vials and bubbling concoctions. The air is thick with the scent of chemicals, and the walls are lined with ancient manuscripts.",
  "lore_description": "This lab was used by rogue alchemists to create potent but dangerous elixirs. The lab was hidden to keep its experiments secret from the order of enchanters who sought to control the use of volatile magic.",
  "features_and_contents": "The lab contains an assortment of alchemical equipment, ingredients, and old manuscripts detailing experiments. A locked chest sits in the corner, and the air is filled with a metallic scent.",
  "interactive_elements": "The locked chest requires a DC 18 Dexterity check to open, containing rare alchemical ingredients. There is also a peculiar apparatus that can be activated with a successful Intelligence (Arcana) check.",
  "additional_notes": "If players stay in the room too long, they may hear faint whispers, an echo of the forbidden experiments conducted here."
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
