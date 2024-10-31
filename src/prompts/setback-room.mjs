// setback-room.js

export function generateSetbackRoomPrompt(dungeonOverview, shortDescription) {
  return `
Using the dungeon overview below, create a detailed description of a **setback room**. This room introduces a significant challenge or setback to the party, fitting within the context of the dungeon's lore and flavor.

**Dungeon Overview:**
${dungeonOverview}

**Short Room Description (includes exits and any notable features):**
${shortDescription}

**Guidelines:**

- **Setback Details:**
  - The setback should be substantial, such as a curse, a missing or possessed party member, or a worsening condition that requires specific actions to remedy.
  - The setback should have a meaningful impact on the party, creating tension and driving the narrative forward.

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

- **Do Not Specify Exact Game Mechanics:**
  - Avoid mentioning specific game mechanics or dice rolls.
  - Focus on narrative descriptions that the Dungeon Master can adapt to their preferred game system.

**Return the description in JSON format with the following keys:**

- **name**: A short, evocative name for the setback room.
- **read_aloud_description**: A vivid description to read aloud when players enter the room, setting the scene and atmosphere.
- **setback_explanation**: For the Dungeon Master's eyes only. Describe the nature of the setback, its causes, and its effects on the party.
- **avoidance_checks**: For the Dungeon Master's eyes only. Describe the skill checks players can attempt to avoid or lessen the setback, including what each check entails and its potential outcome.
- **overcoming_setback**: For the Dungeon Master's eyes only. Explain how the players can overcome the setback, including any required actions, items, or information.
- **consequences_of_failure**: For the Dungeon Master's eyes only. Detail the consequences if the players fail to avoid or overcome the setback.
- **read_aloud_setback_occurs**: A description to read aloud when the setback affects the party.

**Example JSON Format:**

\`\`\`json
{
  "name": "The Chamber of Echoes",
  "read_aloud_description": "As you enter the chamber, whispers swirl around you, and the air grows heavy. Ancient runes flicker on the walls, and a faint humming resonates beneath your feet.",
  "setback_explanation": "The room is haunted by lingering spirits trapped by a cursed ritual. The spirits seek to possess the living to escape their confinement.",
  "avoidance_checks": [
    "By observing the shifting runes on the walls, players may sense the presence of a lingering curse. This awareness can help them brace for the spiritual assault, lessening its impact.",
    "Recalling ancient lore about the temple, players might remember a protective chant that wards off malevolent spirits, providing them a defense against possession.",
    "Through sheer willpower and focus, a player might resist the spirits' attempts to invade their mind, preventing possession."
  ],
  "overcoming_setback": "To free the possessed party member, the players must perform a cleansing ritual found in an ancient tome located in the library room. Alternatively, they can seek guidance from a benevolent spirit elsewhere in the dungeon to break the curse.",
  "consequences_of_failure": "If unaddressed, the possessed member may act against the party's interests, causing harm or sabotaging efforts until the spirit is expelled.",
  "read_aloud_setback_occurs": "A chilling wind envelops you, and one of your companions' eyes glaze over with an otherworldly glow. A sinister smile crosses their face as the whispers grow louder."
}
\`\`\`

**Please provide the response in this JSON format.**
`;
}

export function validateSetbackRoomResponse(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    const requiredKeys = [
      'name',
      'read_aloud_description',
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
  content.push({ format: 'header', content: data.name });
  content.push({
    format: 'read_aloud',
    content: data.read_aloud_description,
  });
  content.push({ format: 'paragraph', content: data.setback_explanation });
  content.push({ format: 'header', content: 'Avoidance Skill Checks' });
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
