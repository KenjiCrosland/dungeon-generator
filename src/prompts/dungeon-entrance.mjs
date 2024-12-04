// entrance-room.js

export function generateEntrancePrompt(
  dungeonOverview,
  shortDescription,
  connectedRoomsInfo = '',
  formRoomName = '',
  formRoomSummary = '',
  npcString = '',
) {
  // Conditionall include formRoomName
  const roomNameSection = formRoomName
    ? `**Room Name:**
${formRoomName}

`
    : '';

  // Conditionally include NPC Information section
  const npcSection = npcString
    ? `**NPC Present at the Entrance:**
${npcString}

The NPC is currently at the dungeon entrance. Include them in the entrance description, detailing what they are doing and how they might interact with players. Consider their personality, goals, and any relationships they have.

If the NPC described is the dungeon's boss or a powerful being unlikely to be at the entrance, present them as a **weakened version, projection, illusion, or avatar** as part of a **"final boss preview"**. This encounter should foreshadow the ultimate challenge without revealing all their abilities or secrets.

`
    : '';

  // Conditionally include NPC Integration guidelines
  const npcGuidelines = npcString
    ? `- **NPC Integration:**
    - Include the NPC in the entrance description, considering their characteristics and role.
    - If the NPC is the dungeon's boss or a powerful entity unlikely to be at the entrance, present them in a way that serves as a "final boss preview" (e.g., a weakened form, projection, or illusion).
    - Create a memorable encounter that foreshadows the ultimate challenge.
    - Do not reveal all the boss's abilities or secrets; provide hints about their power and intentions.
    - The NPC may taunt the players, set conditions, or test their resolve.
    - Ensure the interaction fits within the chosen challenge type (e.g., roleplaying, magic, puzzle).
    - Do not reveal any secrets or hidden motives unless the players can perceive them.

`
    : '';

  // Conditionally include Form Room Summary
  const roomSummarySection = formRoomSummary
    ? `**Short Description of the Entrance Room:**
${formRoomSummary}

`
    : '';

  return `
Using the dungeon overview below, describe the entrance to the dungeon in detail. Be sure to address the following:

${roomNameSection}

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
${npcSection}${roomSummarySection}Please consider the following challenge types when creating the entrance challenge:
- **Hidden entrance**: Is the entrance remote, magically disguised, or hidden?
- **Guards**: Perhaps the dominant faction has set up guards or traps to protect the entrance or alert certain individuals of intruders while they pursue their goals inside the dungeon.
- **Monster**: A creature or group of creatures that must be defeated or bypassed to enter the dungeon.
- **Roleplaying**: A challenge that requires the players to interact with NPCs or the environment in a specific way to gain entrance.
- **Puzzle**: A non-combat challenge that requires the players to solve a riddle, decipher a code, or manipulate objects to gain entrance.
- **Magic**: A magical barrier, ward, or enchantment that must be dispelled or bypassed to enter the dungeon.
- **Offering**: A challenge that requires the players to provide an offering, perform a ritual, or fulfill a specific condition to gain entrance.

Please only choose **one** challenge type for the entrance challenge.

${npcGuidelines}**Guidelines for the Read Aloud Description:**

Compose the **read_aloud_overview**, **read_aloud_first_detail**, **read_aloud_second_detail**, and **read_aloud_third_detail** using the following guidelines:

- **read_aloud_overview**: A 1-sentence description of the dungeon entrance, setting the scene for the challenge. It should describe a transition from the outside world to the dungeon. It should be evocative and engaging but not describe the challenge itself.
  - **Examples:**
    - "As you rappel down the cliffside, the air grows colder and the sound of the forest fades away."
    - "Emerging from the dense forest, the clearing before you is shrouded in an eerie mist."
    - "Deep in the murky darkness of the underwater tunnel, the faint glow of bioluminescent algae beckons you forward."

- **read_aloud_first_detail**: A 1-sentence description of the first detail of the challenge that awaits the players. This could be a visual cue, a sound, a smell, or a feeling that hints at the nature of the challenge.
  - **Examples:**
    - "At the bottom of the cliff, you see thousands of bones scattered across the ground."
    - "The mist swirls around you, forming ghostly shapes that whisper in an unknown language."
    - "The bioluminescent algae flickers, revealing the silhouettes of strange aquatic creatures."

- **read_aloud_second_detail**: A 1-sentence description providing more information about the challenge, hinting at obstacles they will face.
  - **Examples:**
    - "Among the bones, you notice a glint of metal reflecting the faint light."
    - "The ghostly shapes coalesce into humanoid figures, their eyes glowing with otherworldly light."
    - "The aquatic creatures swim closer, revealing sharp teeth and glowing eyes."

- **read_aloud_third_detail**: A 1-sentence detail that prepares them for the challenge ahead.
  - **Examples:**
    - "As you approach the metal, you see that it is a rusted sword embedded in the ground."
    - "The humanoid figures reach out to you, their hands passing through your body like smoke."
    - "The creatures bare their teeth and let out a low, menacing growl."

**Guidelines for the Interactive Element upon Entering the Dungeon:**

- Introduce unusual objects, guardians, characters, or features in the room that players can interact with.
- These should provoke action, conversation, or decision-making.
- **Do not mention traps or anything hidden to players.**
- **Do not include chests or treasure.**
- **Examples:**
  - "A kobold has been chained to the wall, its eyes wide with fear and pain."
  - "There appears to be a sleeping face carved into the stone wall, its expression serene and peaceful."
  - "A rusty automaton stands in the corner, its gears grinding and whirring as it moves."
  ${
    npcString
      ? '- "A spectral figure resembling the dungeon\'s master materializes before you, its eyes burning with a sinister glow."'
      : ''
  }

**Return the description in JSON format with the following keys:**

{
  "name": "Entrance",
  "read_aloud_overview": "A brief description of the dungeon entrance, setting the scene for the challenge.",
  "read_aloud_first_detail": "A brief description of the first detail of the challenge that awaits the players.",
  "read_aloud_second_detail": "A brief description of the second detail of the challenge that players encounter.",
  "read_aloud_third_detail": "A brief description of the third detail of the challenge that players encounter.",
  "descriptive_header": "A descriptive header for the entrance challenge. This could be a title or a summary of the challenge. Example: 'The Boneyard and the Cursed Blade'",
  "challenge_explanation": "For the Dungeon Master's eyes only. Explain what the players are facing, including the lore of the challenge. What is its history, purpose, and connection to the dungeon?",
  "challenge_mechanics": "For the Dungeon Master's eyes only. Explain how the challenge works mechanically. Include rules, consequences of failure, and rewards for success. Include skill checks, combat encounters, or other mechanics.",
  "failure_scenario": "For the Dungeon Master's eyes only. Explain what happens if the players fail the challenge. What are the consequences, and how does it affect the players and the dungeon? The most common negative outcome will be combat (e.g., a guardian emerges and attacks the players). If the players overcome the failure scenario, they can still proceed.",
  "challenge_circumvention": "Ways to circumvent the challenge. Include alternative solutions, bypassing the obstacle, or using specific items or abilities. This should not be obvious and should require thought or investigation.",
  "challenge_completion_dm": "A short sentence indicating when to read the following aloud, e.g., 'Once the puzzle is solved, read the following aloud.'",
  "read_aloud_challenge_completion": "A brief description of what the players see or experience when they successfully complete the challenge. Applicable to succeeding the first time or after overcoming a failure scenario.",
  "read_aloud_entry": "A brief description of the players entering the dungeon after completing the challenge. Set the scene for the next part of the adventure.",
  "read_aloud_entrance_room_dimensions": "A brief description of the dimensions of the entrance room, including size, shape, and any notable features.",
  "read_aloud_entrance_room_interesting_feature": "1 sentence describing a single interesting or unusual feature that has no mechanical effect. Further investigation may reveal lore about the dungeon.",
  "interesting_feature_lore": "For the Dungeon Master's eyes only. Provide additional lore or information about the interesting feature. Ensure it makes sense for the entrance to the dungeon.",
  "one_sentence_summary": "A concise summary of the purpose and function of the room."
}
`;
}

export function validateEntranceResponse(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    const requiredKeys = [
      'read_aloud_overview',
      'read_aloud_first_detail',
      'read_aloud_second_detail',
      'read_aloud_third_detail',
      'descriptive_header',
      'challenge_explanation',
      'challenge_mechanics',
      'failure_scenario',
      'challenge_circumvention',
      'challenge_completion_dm',
      'read_aloud_challenge_completion',
      'read_aloud_entry',
      'read_aloud_entrance_room_dimensions',
      'read_aloud_entrance_room_interesting_feature',
      'interesting_feature_lore',
      'one_sentence_summary',
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

export function processEntranceResponse(data) {
  const content = [];
  content.push({
    format: 'read_aloud',
    content: `${data.read_aloud_overview} ${data.read_aloud_first_detail} ${data.read_aloud_second_detail} ${data.read_aloud_third_detail}`,
  });
  content.push({ format: 'header', content: data.descriptive_header });
  content.push({ format: 'paragraph', content: data.challenge_explanation });
  content.push({ format: 'paragraph', content: data.challenge_mechanics });
  content.push({ format: 'paragraph', content: data.failure_scenario });
  content.push({ format: 'paragraph', content: data.challenge_circumvention });
  content.push({
    format: 'paragraph',
    content: data.challenge_completion_dm,
  });
  content.push({
    format: 'read_aloud',
    content: `${data.read_aloud_challenge_completion}

${data.read_aloud_entry} ${data.read_aloud_entrance_room_dimensions} ${data.read_aloud_entrance_room_interesting_feature}`,
  });
  content.push({
    format: 'paragraph',
    content: data.interesting_feature_lore,
  });

  return content;
}
