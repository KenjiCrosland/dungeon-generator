export function generateSetbackRoomPrompt(
  dungeonOverview,
  shortDescription,
  connectedRoomsInfo = '',
  formRoomName = '',
  formRoomSummary = '',
  npcString = '',
) {
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

  return `
Using the dungeon overview and the short room description below, create a detailed description of a **setback room** within the dungeon. This room introduces a significant challenge or setback to the party, fitting within the context of the dungeon's lore and flavor.

**Dungeon Overview:**
${dungeonOverview}

**Short Room Description (includes size, exits, and any notable features):**
${shortDescription}

${
  connectedRoomsInfo !== ''
    ? `**Connected Rooms:** 
  This room is connected to the following rooms: ${connectedRoomsInfo}\n`
    : ''
}
${roomNameSection}${roomSummarySection}${npcSection}**Guidelines:**

- **Setback Details:**
  - The setback should be substantial, such as a curse, a missing or possessed party member, or a worsening condition that requires specific actions to remedy.
  - The setback should have a meaningful impact on the party, creating tension and driving the narrative forward.
  - The nature of the setback should logically align with the room's purpose and the dungeon's theme.

- **Avoidance Skill Checks:**
  - Include a series of 2-3 skill checks (of any type, e.g., knowledge, perception, dexterity) that players can attempt to avoid or lessen the severity of the setback.
  - Each successful check should decrease the severity of the setback or provide valuable information.
  - The skill checks should be integrated naturally into the room's description and challenges.

- **Overcoming the Setback:**
  - Describe how the party can overcome the setback.
  - This may involve acquiring knowledge from an ally, making a bargain, finding an item elsewhere in the dungeon, or completing a specific task.
  - The method should be achievable and encourage further exploration or interaction with the dungeon's elements.

- **Integration with Dungeon Lore:**
  - Ensure the setback aligns with the dungeon's theme and story.
  - Incorporate elements from the dungeon overview to enhance immersion.

${npcGuidelines}- **Avoid Specific Game Mechanics:**
  - Focus on narrative descriptions without referencing specific game rules or mechanics.

**Read Aloud Description Guidelines:**

Compose the **read_aloud_description** using the following sentence-by-sentence structure:

1. **Sentence 1: Room-Specific Description**
   - **Guideline:** Describe the specific type and characteristics of the room within the dungeon. Include details about its size, purpose, and distinctive features to set the scene for what the players are encountering.
   - **Examples:**
     - "You step into a vast chamber lined with towering bookshelves, the Library of Whispers."
     - "The Forge Room is a cavernous space filled with dormant furnaces and scattered tools."
     - "This chamber appears to be an ancient ritual hall, its walls inscribed with arcane symbols."

2. **Sentence 2: Atmospheric Details**
   - **Guideline:** Focus on sensory experiences specific to the room. Describe smells, lighting, sounds, or any atmospheric elements that add depth to the room’s character.
   - **Examples:**
     - "A thick layer of dust coats every surface, and the air is heavy with the scent of old parchment."
     - "The faint sound of dripping water echoes throughout, and a cold draft chills you to the bone."
     - "A dim, eerie glow emanates from crystals embedded in the walls, casting unsettling shadows."

3. **Sentence 3: Setback Introduction**
   - **Guideline:** Introduce the setback in a subtle yet foreboding manner. Hint at the challenge or danger without revealing everything at once.
   - **Examples:**
     - "Whispers seem to emanate from the books themselves, filling your mind with disquieting thoughts."
     - "The shadows flicker unnaturally, and you sense that you are not alone."
     - "An oppressive energy permeates the room, making it hard to focus."

4. **Sentence 4: Interactive Element${npcString ? ' or NPC' : ''}**
   - **Guideline:** Introduce one feature in the room that players can interact with${
     npcString ? ' or the NPC if one is present' : ''
   }. This element should relate to the setback and encourage player engagement. **DO NOT MENTION TRAPS OR ANYTHING HIDDEN TO PLAYERS.**
   - **Examples:**
     - "An ornate mirror stands at the far end, its surface swirling with mist."
     - "A spectral figure hovers near the central altar, its gaze fixed upon you."
     ${
       npcString
         ? '- "A hooded figure stands silently by a bookshelf, seemingly engrossed in an ancient tome."'
         : ''
     }

**Return the description in JSON format with the following keys:**

- **name**: The name of the room. Use the provided room name if available; otherwise, create a name that suits the room's purpose (e.g., "Library of Whispers", "Forge Room", "Ritual Hall"). This name should be 1-3 words and indicate the function of the room.
- **read_aloud_description**: A vivid description to read aloud when players enter the room, following the sentence-by-sentence guidelines above. Remember to take the following short description into account, particularly regarding room size: ${shortDescription}
- **room_purpose**: A brief description of the room's function or purpose within the dungeon. This should also provide reasons for the setback's existence.
- **setback_title**: A concise title for the setback that isn't overly dramatic. It should very precisely describe what the setback is: such as "Interdimensional Vortex" or "Sinking Carpet" or "Quicksand Pit".
- **setback_explanation**: For the Dungeon Master's eyes only. Describe the nature of the setback, its causes, and its effects on the party.
- **avoidance_checks**: For the Dungeon Master's eyes only. List the skill checks players can attempt to avoid or lessen the setback, including what each check entails and its potential outcome.
- **overcoming_setback**: For the Dungeon Master's eyes only. Explain how the players can overcome the setback, including any required actions, items, or information.
- **consequences_of_failure**: For the Dungeon Master's eyes only. Detail the consequences if the players fail to avoid or overcome the setback.
- **read_aloud_setback_occurs**: A description to read aloud when the setback affects the party.

**Example JSON Format:**

\`\`\`json
{
  "name": "Hall of Whispers",
  "read_aloud_description": "You step into a long, narrow hall lined with faded tapestries, the Hall of Whispers. A cold breeze carries faint murmurs that seem to echo from the walls themselves. The whispers grow louder with each step, sending chills down your spine. ${
    npcString
      ? 'A ghostly figure of a sage stands at the end of the hall, beckoning silently.'
      : 'An ornate mirror stands at the far end, its surface swirling with mist.'
  }",
  "room_purpose": "The Hall of Whispers was once a gathering place for the castle's sages to share forbidden knowledge. The tragic aftermath of a failed ritual has left the hall cursed.",
  "setback_title": "Whispers of Tormented Souls",
  "setback_explanation": "The whispers are echoes of tormented souls trapped between realms due to the failed ritual. They instill fear and confusion, potentially causing paralysis or hallucinations among the party members.",
  "avoidance_checks": [
    "By concentrating, players can attempt to block out the whispers, reducing their effects.",
    "Recognizing the arcane nature of the whispers, a player might recall a protective chant to shield the mind.",
    "A player sensitive to magic may detect the source of the whispers and guide the party around it."
  ],
  "overcoming_setback": "To lift the curse, the party must perform a cleansing ritual found in an ancient tome elsewhere in the dungeon or help the trapped souls find peace by fulfilling a specific task.",
  "consequences_of_failure": "If unaddressed, the party may suffer ongoing mental anguish, impacting their ability to rest or focus, and may experience disadvantage on future checks requiring concentration.",
  "read_aloud_setback_occurs": "The whispers swell into a cacophony, and a crushing sense of dread overwhelms you as the room spins and darkens."
}
\`\`\`
`;
}

export function validateSetbackRoomResponse(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    const requiredKeys = [
      'name',
      'read_aloud_description',
      'room_purpose',
      'setback_title',
      'setback_explanation',
      'avoidance_checks',
      'overcoming_setback',
      'consequences_of_failure',
      'read_aloud_setback_occurs',
    ];
    for (const key of requiredKeys) {
      if (!(key in data)) {
        console.error(`Missing required key: ${key}`);
        return false;
      }
    }
    // Ensure avoidance_checks is an array
    if (!Array.isArray(data.avoidance_checks)) {
      console.error('avoidance_checks should be an array');
      return false;
    }
    return true;
  } catch (e) {
    console.error('Invalid JSON:', e);
    return false;
  }
}

export function processSetbackRoomResponse(data) {
  const content = [];
  content.push({
    format: 'read_aloud',
    content: data.read_aloud_description,
  });
  content.push({ format: 'paragraph', content: data.room_purpose });
  content.push({ format: 'paragraph', content: data.setback_explanation });
  content.push({ format: 'header', content: data.setback_title });
  data.avoidance_checks.forEach((check) => {
    content.push({
      format: 'paragraph',
      content: check,
    });
  });
  content.push({ format: 'paragraph', content: data.overcoming_setback });
  content.push({ format: 'paragraph', content: data.consequences_of_failure });
  content.push({
    format: 'read_aloud',
    content: data.read_aloud_setback_occurs,
  });

  return content;
}
