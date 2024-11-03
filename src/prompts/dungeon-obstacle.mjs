// obstacle.js

export function generateObstaclePrompt(
  dungeonOverview,
  roomDescription,
  shortDescription,
  solutionRoomId,
) {
  // Define arrays of possible obstacle types and solutions
  const obstacleTypes = [
    'a physical barrier (e.g., a flooded chamber, a wall of thorns, a chasm)',
    'a magical illusion (e.g., a never-ending hallway, shifting walls)',
    "an impassable guardian that's very difficult to defeat",
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

  return `
Using the dungeon overview and room description below, describe an **obstacle** in this room that will require the adventurers to fulfill a requirement before progressing further. The obstacle should be **${randomObstacleType}**. To overcome this obstacle, the players will need to **${randomSolution}**, which involves going to another room in the dungeon (Room ID: ${solutionRoomId}). If the "key" is not an actual key, don't use the word "key" in the description--say what it acutally is.

**Dungeon Overview:**
${dungeonOverview}

**Room Description:**
${roomDescription ? roomDescription : 'No room description provided.'}

**Short Room Description (includes exits and which side of the room has the obstacle):**
${shortDescription}
Note: The "locked" door in the short description indicates the side of the room where the obstacle is located.

**Return the description in JSON format with the following keys:**

- **name**: A short, evocative name for the obstacle.
- **read_aloud_description**: A description to read aloud to the players when they encounter the obstacle.
- **obstacle_explanation**: For the Dungeon Master's eyes only. Explain what the obstacle is (type: ${randomObstacleType}), its history, and its connection to the dungeon.
- **obstacle_mechanics**: For the Dungeon Master's eyes only. Explain how the obstacle works mechanically, including any skill checks, combat encounters, or other mechanics.
- **failure_scenario**: For the Dungeon Master's eyes only. Explain what happens if the players fail to overcome the obstacle, including consequences or additional challenges.
- **obstacle_solution**: For the Dungeon Master's eyes only. Explain how the players can overcome the obstacle by **${randomSolution}**, involving going to Room ID: ${solutionRoomId}.
- **obstacle_circumvention**: Ways players might bypass the obstacle without fulfilling the intended requirement. This should require creative thinking or investigation.
- **obstacle_completion_dm**: A short sentence like 'Once the players fulfill X condition, read the following aloud.'
- **read_aloud_obstacle_completion**: A description to read aloud when players successfully overcome the obstacle. Remember that the obstacle is in another room, so the party may hear mechanisms unlocking, oppressive auras lifting or doors opening but not see the direct result.

**Guidelines:**
- Be creative and ensure the obstacle fits within the context of the dungeon overview and room description.
- Do not include hidden information in the 'read_aloud_description' or 'read_aloud_obstacle_completion'.
- Keep the descriptions engaging and evocative.
- **Avoid using door-related obstacles; focus on other types.**
- Ensure the obstacle and its solution are logically connected.

**Please provide the response in this JSON format.**
`;
}

export function validateObstacleResponse(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    const requiredKeys = [
      'name',
      'read_aloud_description',
      'obstacle_explanation',
      'obstacle_mechanics',
      'failure_scenario',
      'obstacle_solution',
      'obstacle_circumvention',
      'obstacle_completion_dm',
      'read_aloud_obstacle_completion',
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
  content.push({ format: 'header', content: data.name });
  content.push({
    format: 'read_aloud',
    content: data.read_aloud_description,
  });
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
