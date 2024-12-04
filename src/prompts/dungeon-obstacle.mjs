// obstacle.js

export function generateObstaclePrompt(
  dungeonOverview,
  shortDescription,
  connectedRoomsInfo = '',
  solutionRoomId,
  keyRoomDescription = '',
  formRoomName = '',
  formRoomSummary = '',
  npcString = '',
) {
  // Define arrays of possible obstacle types and solutions
  const obstacleTypes = [
    'a physical barrier (e.g., a flooded chamber, a wall of thorns, a chasm)',
    'a magical illusion (e.g., a never-ending hallway, shifting walls)',
    "an impassable guardian that's very difficult to defeat (not the boss of the dungeon)",
    'a magical barrier (e.g., an energy field, a time distortion)',
    'an environmental hazard (e.g., toxic gas filling the room, extreme heat)',
    'a trap that must be disarmed or avoided',
    'a puzzle or riddle that requires information or items from another room',
    'an enchantment that binds the players or prevents movement',
    'a cursed area that drains abilities or health',
    'a time loop that resets the room until a condition is met',
    'a moral dilemma that requires making a difficult choice',
    'an anti-magic zone that disables spells',
    'a labyrinth or maze with shifting paths',
    'an area of darkness or silence that impedes senses',
    'a series of complex mechanisms that need synchronization',
  ];

  const solutions = [
    'acquiring a specific item from another room (e.g., a key, artifact, or component)',
    'learning a password or incantation',
    'defeating an enemy whose defeat removes the obstacle',
    'activating a mechanism or pulling a switch elsewhere in the dungeon',
    'performing a ritual or using a spell',
    'allying with an NPC who can assist',
    'solving a secondary puzzle that provides clues',
    'retrieving a magical essence or energy source',
    'completing a test of character or virtue',
    'restoring balance to an element or force',
    'collecting scattered fragments or pieces',
    'breaking a curse by fulfilling a condition',
    'manipulating environmental features creatively',
    'deciphering ancient texts or symbols',
    'using a combination of skills or abilities',
  ];

  // Randomly select an obstacle type and solution
  const randomObstacleType =
    obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
  const randomSolution =
    solutions[Math.floor(Math.random() * solutions.length)];

  // Conditionally include Key Room Description
  const keyRoomSection = keyRoomDescription
    ? `**Key Room Description:**
${keyRoomDescription}

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
  const keyRoomReference = keyRoomDescription
    ? 'Using the key room description, '
    : '';
  const obstacleSolutionReference = keyRoomDescription
    ? 'the players will need to use information or items from the key room'
    : 'the players will need to acquire something or perform an action elsewhere in the dungeon';

  const obstacleConnection = keyRoomDescription
    ? 'Explain how the key room and its contents relate to overcoming the obstacle.'
    : 'Indicate that the solution involves another room in the dungeon (Room ID: ' +
      solutionRoomId +
      ').';

  const obstacleExamples = keyRoomDescription
    ? '- "A swirling vortex of arcane energy blocks the passage ahead, echoing the magic you sensed earlier."'
    : '- "A swirling vortex of arcane energy blocks the passage ahead."';

  const additionalNotesReference = npcString ? ' or NPC' : '';

  return `
Using the dungeon overview${
    keyRoomDescription ? ', key room description,' : ''
  } and the short room description below, create a detailed description of an **obstacle-focused room** within the dungeon. The room's name and summary will determine its specific type and characteristics. The obstacle should be **${randomObstacleType}**. To overcome this obstacle, ${obstacleSolutionReference}. ${keyRoomReference}If the "key" is not an actual key, don't use the word "key" in the description—describe what it actually is.

**Dungeon Overview:**
${dungeonOverview}

${keyRoomSection}**Short Room Description (includes size, exits, and any notable features):**
${shortDescription}

${
  connectedRoomsInfo !== ''
    ? `**Connected Rooms:** 
This room is connected to the following rooms: ${connectedRoomsInfo}

`
    : ''
}${roomNameSection}${roomSummarySection}${npcSection}**Guidelines:**

- **Room Type Determination:**
  - Use the room's name and summary to identify its type (e.g., "Barrier Chamber" suggests a room designed to halt intruders).
  - Ensure the room type aligns with the dungeon's lore and theme.

- **Obstacle Integration:**
  - The obstacle is central to the room and should significantly impact its description.
  - The obstacle should be **${randomObstacleType}**.
  - ${obstacleConnection}

- **Atmosphere and Tone:**
  - Reflect the room's purpose and the obstacle through sensory details.
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
     - "You step into the Barrier Chamber, a vast hall dominated by an eerie energy field blocking the far exit."
     - "The Enigma Room unfolds before you, walls adorned with shifting symbols that seem to defy comprehension."
     - "This Guardian's Lair is a grand cavern, its ceiling lost in darkness, with a towering figure standing vigil."

2. **Sentence 2: Atmospheric Details**
   - **Guideline:** Focus on sensory experiences specific to the room and the obstacle. Describe smells, lighting, sounds, or any atmospheric elements that add depth.
   - **Examples:**
     - "A palpable tension fills the air, and the hairs on the back of your neck stand up."
     - "Whispers echo softly around you, though no source can be seen."
     - "An oppressive heat emanates from the glowing runes etched into the floor."

3. **Sentence 3: Unique Features**
   - **Guideline:** Highlight unique, non-interactive elements that make the room special. These can be architectural, artistic, or natural details.
   - **Examples:**
     - "Statuettes line the walls, each depicting a different creature frozen in fear."
     - "The ceiling is a mosaic of mirrored fragments, reflecting distorted images of the room."
     - "Columns of ancient stone rise unevenly from the floor, some broken and leaning."

4. **Sentence 4: The Obstacle${npcString ? ' or NPC' : ''}**
   - **Guideline:** Introduce the obstacle${
     npcString ? ' or NPC if one is present' : ''
   } in the room that prevents progress. **Do not reveal any hidden solutions or secrets.**
   - **Examples:**
     ${obstacleExamples}
     ${
       npcString
         ? '- "A formidable guardian stands before the exit, its eyes glowing with an otherworldly light."'
         : ''
     }
     ${
       npcString
         ? '- "A spectral figure hovers near the doorway, its gaze fixed upon you with silent intensity."'
         : ''
     }

**Return the description in JSON format with the following keys:**

- **name**: A short, appropriate name for the room (e.g., "Barrier Chamber", "Enigma Room", "Guardian's Lair"). This name should be 1-2 words and should be simple, indicating the function of the room.
- **one_sentence_summary**: A brief summary of the room's function or purpose within the dungeon.
- **lore_description**: For the Dungeon Master's eyes only. Describe the room's history, purpose, and how it fits into the dungeon's lore. Who created the obstacle, and why is it here?
- **features_and_contents**: For the Dungeon Master's eyes only. Describe notable features, items, or information present in the room that may be of interest to the players.
- **obstacle_header**: A brief header for the obstacle in the room.
- **obstacle_explanation**: For the Dungeon Master's eyes only. Explain what the obstacle is (type: ${randomObstacleType}), its history, and its connection to the dungeon.
- **obstacle_mechanics**: For the Dungeon Master's eyes only. Explain how the obstacle works mechanically, including any challenges the players may face.
- **failure_scenario**: For the Dungeon Master's eyes only. Explain what happens if the players fail to overcome the obstacle, including consequences or additional challenges.
- **obstacle_solution**: For the Dungeon Master's eyes only. Explain how the players can overcome the obstacle by **${randomSolution}**. ${obstacleConnection}
- **obstacle_circumvention**: For the Dungeon Master's eyes only. Describe ways players might bypass the obstacle without fulfilling the intended requirement, requiring creative thinking or investigation.
- **obstacle_completion_dm**: A short sentence like 'Once the players fulfill X condition, read the following aloud.'
- **read_aloud_obstacle_completion**: A description to read aloud when players successfully overcome the obstacle.
- **read_aloud_description**: A vivid description to read aloud when players enter the room, following the sentence-by-sentence guidelines above. Remember to take the following short description into account, particularly regarding room size: ${shortDescription}
- **additional_notes**: For the Dungeon Master's eyes only. Include any other relevant information or secrets about the room${additionalNotesReference}.

**Guidelines:**
- Be creative and ensure the obstacle fits within the context of the dungeon overview${
    keyRoomDescription
      ? ' and connects logically to the key room description'
      : ''
  }.
- Do not include hidden information in the 'read_aloud_description' or 'read_aloud_obstacle_completion'.
- Keep the descriptions engaging and evocative.

**Example JSON Format:**

\`\`\`json
{
  "name": "Barrier Chamber",
  "one_sentence_summary": "A vast hall containing a magical barrier that blocks further passage.",
  "lore_description": "The Barrier Chamber was constructed by the ancient mages to protect the inner sanctum. The magical barrier has kept intruders at bay for centuries, powered by a crystal in Room ID: ${solutionRoomId}.",
  "features_and_contents": "The room is adorned with statues of past guardians, and the walls are inscribed with ancient runes that glow faintly.",
  "obstacle_header": "Arcane Energy Field",
  "obstacle_explanation": "An impenetrable energy field spans from floor to ceiling, shimmering with arcane light. It was created as a last line of defense.",
  "obstacle_mechanics": "The barrier cannot be dispelled by conventional means. Attempts to touch it result in a forceful repulsion. Players must deactivate it by acquiring the crystal from Room ID: ${solutionRoomId}.",
  "failure_scenario": "If players attempt to force through the barrier, they are thrown back and take damage. Prolonged contact may trigger an alarm or summon guardians.",
  "obstacle_solution": "Players must retrieve the crystal from Room ID: ${solutionRoomId}, which, when brought close to the barrier, causes it to deactivate.",
  "obstacle_circumvention": "Creative use of teleportation magic or finding hidden passages could allow bypassing the barrier.",
  "obstacle_completion_dm": "Once the players bring the crystal near the barrier, read the following aloud.",
  "read_aloud_obstacle_completion": "As you present the crystal, the barrier flickers and then dissipates, leaving the passage ahead clear.",
  "read_aloud_description": "You step into the Barrier Chamber, a vast hall dominated by an eerie energy field blocking the far exit. A palpable tension fills the air, and the hairs on the back of your neck stand up. Statuettes line the walls, each depicting a different creature frozen in fear. A swirling vortex of arcane energy blocks the passage ahead.",
  "additional_notes": "The statues might provide clues about the barrier. An NPC mage could be present, studying the barrier and offering assistance or requesting help."
}
\`\`\`
`;
}

export function validateObstacleResponse(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    const requiredKeys = [
      'name',
      'one_sentence_summary',
      'lore_description',
      'features_and_contents',
      'obstacle_header',
      'obstacle_explanation',
      'obstacle_mechanics',
      'failure_scenario',
      'obstacle_solution',
      'obstacle_circumvention',
      'obstacle_completion_dm',
      'read_aloud_obstacle_completion',
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

export function processObstacleResponse(data) {
  const content = [];
  content.push({
    format: 'read_aloud',
    content: data.read_aloud_description,
  });
  content.push({ format: 'paragraph', content: data.lore_description });
  content.push({ format: 'paragraph', content: data.features_and_contents });
  content.push({ format: 'paragraph', content: data.additional_notes });
  content.push({ format: 'header', content: data.obstacle_header });
  content.push({ format: 'paragraph', content: data.obstacle_explanation });
  content.push({ format: 'paragraph', content: data.obstacle_mechanics });
  content.push({ format: 'paragraph', content: data.failure_scenario });
  content.push({ format: 'paragraph', content: data.obstacle_solution });
  content.push({ format: 'paragraph', content: data.obstacle_circumvention });
  content.push({
    format: 'paragraph',
    content: data.obstacle_completion_dm,
  });
  content.push({
    format: 'read_aloud',
    content: data.read_aloud_obstacle_completion,
  });

  return content;
}
