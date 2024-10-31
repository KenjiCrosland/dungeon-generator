// entrance-room.js

export function generateEntrancePrompt(dungeonOverview, shortDescription) {
  return `
Using the dungeon overview below, describe the entrance to the dungeon in detail. Be sure to address the following:

Dungeon Overview:
${dungeonOverview}


Below are the guidelines for each sentence in the JSON response:

read_aloud_overview: A 1 sentence description of dungeon entrance, setting the scene for the challenge. It describe a transition from the outside world to the dungeon. It should be evocative and engaging but not describe the challenge itself.

Examples:
"As you rappell down the cliff side the air grows colder and the sound of the forest fades away."
"As you emerge from the dense forest, the clearing before you is shrouded in an eerie mist."
"Deep in the murky darkness of the underwater tunnel, the faint glow of bioluminescent algae beckons you forward."

read_aloud_first_detail: A 1 sentence description of the first detail of the challenge that awaits the players. This could be a visual cue, a sound, a smell, or a feeling that hints at the nature of the challenge.

Examples:
"At bottom of the cliff, you see thousands of bones scattered across the ground."
"The mist swirls around you, forming ghostly shapes that whisper in an unknown language."
"The bioluminescent algae flickers, revealing the silhouettes of strange, aquatic creatures."

read_aloud_second_detail: This is the second 1 sentence detail of the challenge that players encounter. It should provide more information about the nature of the challenge and hint at the obstacles they will face.
"Among the bones, you notice a glint of metal, reflecting the faint light."
"The ghostly shapes coalesce into humanoid figures, their eyes glowing with an otherworldly light."
"The aquatic creatures swim closer, revealing sharp teeth and glowing eyes."

read_aloud_third_detail: The third 1 sentence detail of the challenge that players encounter. This should be the most revealing detail that prepares them for the challenge ahead.
"As you approach the metal, you see that it is a rusted sword, embedded in the ground."
"The humanoid figures reach out to you, their hands passing through your body like smoke."
"The creatures bare their teeth and let out a low, menacing growl."

Please consider the following challenge types when creating the entrance challenge:
- Hidden entrance: Is the entrance remote, magically disguised, or hidden?
- Guards: Perhaps the dominant faction has set up guards or traps to protect the entrance or alert certain individuals of intruders while they pursue their goals inside the dungeon.
- Monster: A creature or group of creatures that must be defeated or bypassed to enter the dungeon.
- Roleplaying: A challenge that requires the players to interact with NPCs or the environment in a specific way to gain entrance.
- Puzzle: A non-combat challenge that requires the players to solve a riddle, decipher a code, or manipulate objects to gain entrance.
- Magic: A magical barrier, ward, or enchantment that must be dispelled or bypassed to enter the dungeon.
- Offering: A challenge that requires the players to provide an offering, perform a ritual, or fulfill a specific condition to gain entrance.

When doing the read_aloud_entry, please be sure to use these basic details:
${shortDescription}

Please only choose one challenge type for the entrance challenge

Guidelines for the interactive element upon entering the dungeon:
Introduce unusual objects, guardians, characters, or features in the room that players can interact with. These should be elements that can provoke action, conversation, or decision-making. DO NOT MENTION TRAPS OR ANYTHING HIDDEN TO PLAYERS. DO NOT INCLUDE CHESTS OR TREASURE.
"A kobold has been chained to the wall, its eyes wide with fear and pain."
"There appears to be a sleeping face carved into the stone wall, its expression serene and peaceful."
"A rusty automaton stands in the corner, its gears grinding and whirring as it moves."

Return the description in JSON format with the following keys:
{
  "name": "Entrance",
  "read_aloud_overview": "A brief description of the dungeon entrance, setting the scene for the challenge.",
  "read_aloud_first_detail": "A brief description of the first detail of the challenge that awaits the players.",
  "read_aloud_second_detail": "A brief description of the second detail of the challenge that players encounter.",
  "read_aloud_third_detail": "A brief description of the third detail of the challenge that players encounter.",
  "descriptive_header": "A descriptive header for the entrance challenge. This could be a title or a summary of the challenge. Example: 'The Boneyard and the Cursed Blade'",
  "challenge_explanation": "This is for the Dungeon Master's eyes only. This should explain what the players are facing, this should be more about the lore of the challenge. What is the history of the challenge? Why is it here? What is the purpose of the challenge? What is the challenge's connection to the dungeon?",
  "challenge_mechanics": "This is for the Dungeon Master's eyes only. This should explain how the challenge works mechanically. What are the rules of the challenge? What are the consequences of failure? What are the rewards for success? Include skill checks, combat encounters, or other mechanics that the players will face.",
  "failure_scenario": "This is for the Dungeon Master's eyes only. This should explain what happens if the players fail the challenge. What are the consequences of failure? How does it affect the players and the dungeon? The most common negative outcome will be combat (ie a guardian emerges and attacks the players). If the players overcome the failure scenario they can still proceed.",
  "challenge_circumvention": "Ways to circumvent the challenge. This could include alternative solutions, bypassing the obstacle, or using specific items or abilities. This should not be obvious to the players and should require some thought or investigation.",
  "challenge_completion_dm": "A short sentence that says 'once X condition is met, read the following aloud'",
  "read_aloud_challenge_completion": "A brief description of what the players see or experience when they successfully complete the challenge. This should be applicable to succeeding the first time or after overcoming a failure scenario.",
  "read_aloud_entry": "A brief description of the players entering the dungeon after completing the challenge. This should set the scene for the next part of the adventure.",
  "read_aloud_entrance_room_dimensions": "A brief description of the dimensions of the entrance room. This could include the size, shape, and any notable features of the room.",
  "read_aloud_entrance_room_interesting_feature": "1 sentence describing a single interesting or unusual feature that has no mechanical effect.",
  "read_aloud_entrance_room_interactive_element": "1 sentence describing a single interactive element that players can interact with in the entrance room. See the above examples for inspiration.",
  "interactive_element_header": "A simple header for the interactive element. This could be a title or a summary of the interactive element. Example: 'The Distressed Kobold'. Don't get too fancy, just a simple title.",
  "interactive_element_details": "A brief description of the interactive element. This could include what it does, how it works, and any consequences of interacting with it. Are skill checks required? Does it trigger a combat encounter? Does it provide a reward or information?"
}`;
}

export function validateEntranceResponse(jsonString) {
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
    'read_aloud_entrance_room_interactive_element',
    'interactive_element_header',
    'interactive_element_details',
  ];
  for (const key of requiredKeys) {
    if (!(key in data)) {
      console.error(`Missing required key: ${key}`);
      return false;
    }
  }
  return true;
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
    content: `${data.read_aloud_challenge_completion} \n\n ${data.read_aloud_entry} ${data.read_aloud_entrance_room_dimensions} ${data.read_aloud_entrance_room_interesting_feature} ${data.read_aloud_entrance_room_interactive_element}`,
  });
  content.push({ format: 'header', content: data.interactive_element_header });
  content.push({
    format: 'paragraph',
    content: data.interactive_element_details,
  });

  return content;
}
