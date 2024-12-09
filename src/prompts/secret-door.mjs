export function generateSecretDoorPrompt(
  dungeonOverview,
  currentRoomDescription,
  connectedRoomsInfo = '',
  secretRoomSummary = '',
  currentRoomContent = '',
  secretRoomContent = '',
) {
  // Include the secretRoomSummary and room content arrays if provided
  const secretRoomSection = secretRoomSummary
    ? `**Secret Room Summary:**
${secretRoomSummary}

`
    : '';

  const currentRoomContentSection = currentRoomContent
    ? `**Current Room Content:**
${currentRoomContent}

`
    : '';

  const secretRoomContentSection = secretRoomContent
    ? `**Secret Room Content:**
${secretRoomContent}

`
    : '';

  return `
Using the dungeon overview, current room description, connected rooms information, current room content, and secret room details below, create detailed content for a secret door or passage within the current room. The secret door should match the theme of the dungeon and be influenced by the secret room it leads to. All descriptions are intended for the **Game Master (GM)** only.

**Dungeon Overview:**
${dungeonOverview}

**Current Room Description:**
${currentRoomDescription}

${
  connectedRoomsInfo !== ''
    ? `**Connected Rooms:** 
  This room is connected to the following rooms: ${connectedRoomsInfo}`
    : ''
}

${currentRoomContentSection}${secretRoomSection}${secretRoomContentSection}**Guidelines:**

- **Secret Door Header:**
  - Provide a brief, descriptive title for the secret door (e.g., "Hidden Alchemical Shelf", "Magic Mirror", "Hole Behind Tapestry").
  - The door's description should tie into the theme or function of the room it connects to (e.g., if the secret room is a library, the door could involve books or knowledge-based mechanics).

- **Finding Mechanics:**
  - Describe how players can discover the secret door, including any clues or signs.
  - Include mechanics required to find the door, such as high DC skill checks (e.g., Perception, Investigation, Arcana).
  - Ensure that finding the door is challenging, requiring **hard checks**.
  - Make sure that these clues connect with the secret room's theme. For example, if the secret room is dedicated to alchemical experiments, hints may involve alchemical residues or equipment.

- **Opening Mechanics:**
  - Explain what is required to open the secret door once it's found.
  - This could be a simple action or involve solving a puzzle, performing a ritual, or using a specific item.
  - The opening mechanism should be logical and thematic, ideally tied to the lore or features of the connected secret room (e.g., an alchemical formula needs to be completed to access an alchemist's hidden chamber).

- **Lore:**
  - Provide background information on why the secret door exists.
  - Explain what room it hides and why it is concealed.
  - Incorporate elements from the **secret room summary** and **secret room content** if provided, and ensure consistency between the door and the secret room's lore.

**Important Notes:**

- Do **not** include any player-facing descriptions or read-aloud text.
- All information should be detailed and for the **GM's eyes only**.

**Return the secret door details in JSON format with the following flat keys:**

- **finding_mechanics**: Details on how players can find the secret door, including clues and required mechanics.
- **opening_mechanics**: Details on how to open the secret door once found.
- **lore**: Background information about why the door is there, what room it hides, and why it is hidden.

**Example JSON Format:**

\`\`\`json
{
  "finding_mechanics": "The secret door is concealed behind a bookshelf filled with alchemical texts. A **DC 20 Investigation** check reveals scuff marks on the floor, indicating the shelf can be moved. Alternatively, a **DC 18 Perception** check notices a faint draft coming from behind the shelf.",
  "opening_mechanics": "To open the door, one must pull a specific book titled 'Elixirs of Immortality,' which acts as a lever to release the shelf's locking mechanism.",
  "lore": "The secret door leads to the alchemist's hidden laboratory, where forbidden experiments were conducted. The door was hidden to protect dangerous knowledge and prevent intruders from accessing volatile concoctions."
}
\`\`\`
`;
}

export function validateSecretDoorResponse(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    const requiredKeys = ['finding_mechanics', 'opening_mechanics', 'lore'];
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

/// secret-door-prompt.mjs

export function processSecretDoorResponse(data) {
  const content = [];

  content.push({
    format: 'header',
    content: 'Secret Door',
  });

  content.push({
    format: 'paragraph',
    content: data.lore,
  });

  content.push({
    format: 'paragraph',
    content: data.finding_mechanics,
  });

  content.push({
    format: 'paragraph',
    content: data.opening_mechanics,
  });
  return content;
}
