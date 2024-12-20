// custom-room-prompt.mjs

export function generateCustomRoomPrompt(
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
Using the dungeon overview and the short room description below, create a detailed description of a specialized room within the dungeon. The room's name and summary will determine its specific type and characteristics.

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
${roomNameSection}${roomSummarySection}${npcSection}**Guidelines:**

- **Room Type Determination:**
  - Use the room's name and summary to identify its type (e.g., "Alchemy Lab" suggests a laboratory).
  - Ensure the room type aligns with the dungeon's lore and theme.

- **Atmosphere and Tone:**
  - Reflect the room's purpose through sensory details.
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
     - "You enter the Alchemy Lab, a spacious room filled with bubbling potions and intricate apparatuses."
     - "The Sanctum is a serene chapel, its high ceilings adorned with stained glass windows depicting celestial scenes."
     - "This Armory is a well-organized space, with racks of weapons and armor neatly arranged along the walls."

2. **Sentence 2: Atmospheric Details**
   - **Guideline:** Focus on sensory experiences specific to the room. Describe smells, lighting, sounds, or any atmospheric elements that add depth to the room’s character.
   - **Examples:**
     - "The air is thick with the scent of herbs and the faint aroma of burning candles."
     - "Dim, flickering light from enchanted lanterns casts long shadows across the stone floor."
     - "A gentle hum of magical energy resonates throughout the chamber, creating an otherworldly ambiance."

3. **Sentence 3: Unique Features**
   - **Guideline:** Highlight unique, non-interactive elements that make the room special. These can be architectural, artistic, or natural details that contribute to the ambiance without being directly usable by the players.
   - **Examples:**
     - "An ornate chandelier hangs from the ceiling, its crystals shimmering with a faint magical glow."
     - "Intricate mosaics depicting ancient symbols cover the walls, their colors vibrant despite the room's age."
     - "A large, enchanted mirror stands against one wall, reflecting not just the room but glimpses of other realms."

4. **Sentence 4: Interactive Element${npcString ? ' or NPC' : ''}**
   - **Guideline:** Introduce one feature in the room that players can interact with${
     npcString ? ' or the NPC if one is present' : ''
   }. These should provoke action, conversation, or decision-making. This will be expanded upon further in the interactive element${
    npcString ? ' or NPC' : ''
  } descriptions. **DO NOT MENTION TRAPS OR ANYTHING HIDDEN TO PLAYERS.**
   - **Examples:**
     - "A large, ancient tome rests open on a pedestal, its pages filled with indecipherable symbols."
     - "A mystical orb floats in the center of the room, pulsating with vibrant light."
     ${
       npcString
         ? '- "A figure clad in dark robes stands near the altar, their gaze fixed upon you."'
         : ''
     }
     ${
       npcString
         ? '- "An elderly dwarf hums softly as he meticulously polishes a set of armor."'
         : ''
     }

**Return the description in JSON format with the following keys:**

- **name**: A short, appropriate name for the room (e.g., "Alchemy Lab", "Sanctum", "Armory"). This name should be 1-2 words and should be simple, indicating the function of the room.
- **one_sentence_summary**: A brief summary of the room's function or purpose within the dungeon.
- **lore_description**: For the Dungeon Master's eyes only. Describe the room's history, purpose, and how it fits into the dungeon's lore. Who uses or used this room, and for what specific activities?
- **features_and_contents**: For the Dungeon Master's eyes only. Describe notable features, items, or information present in the room that may be of interest to the players.
- **interactive_element_header**: A brief header for the interactive element in the room. ${
    npcString ? "If an NPC is present, this should be the NPC's name." : ''
  }
- **interactive_element_lore**: For the Dungeon Master's eyes only. Provide additional lore or context about the interactive element${
    npcString ? ' or NPC' : ''
  }. Why is it here? What is its significance?
- **interactive_element_details**: For the Dungeon Master's eyes only. Describe the interactive element${
    npcString ? ' or NPC' : ''
  } in more detail, including appearance, behavior, and any effects it may have on the players. ${
    npcString
      ? 'Include how the NPC might react to player interactions. What might the NPC say if the players approached?'
      : ''
  }
- **read_aloud_description**: A vivid description to read aloud when players enter the room, following the sentence-by-sentence guidelines above. Remember to take the following short description into account, particularly regarding room size: ${shortDescription}
- **additional_notes**: For the Dungeon Master's eyes only. Include any other relevant information or secrets about the room${
    npcString ? ' or NPC' : ''
  }.

**Example JSON Format:**

\`\`\`json
{
  "name": "Alchemy Lab",
  "one_sentence_summary": "A spacious lab where alchemists concoct potions and perform magical experiments.",
  "lore_description": "This Alchemy Lab was established by the temple's resident alchemists to create potions, elixirs, and perform complex magical experiments. It played a crucial role in maintaining the temple's defenses and healing capabilities.",
  "features_and_contents": "The lab is filled with bubbling potions, intricate apparatuses, and shelves stocked with rare ingredients. A large cauldron sits at the center, surrounded by various alchemical tools and manuscripts detailing advanced potion recipes.",
  "interactive_element_header": ${
    npcString ? '"Elaria Shadowsong"' : '"The Ancient Tome"'
  },
  "interactive_element_lore": ${
    npcString
      ? '"Elaria Shadowsong is a skilled assassin who uses the lab to craft poisons and antidotes. She is secretly plotting against the dungeon\'s overlord."'
      : '"The tome contains secret alchemical recipes and knowledge passed down through generations of alchemists. It is guarded by magical wards to prevent unauthorized access."'
  },
  "interactive_element_details": ${
    npcString
      ? '"Elaria is present in the lab, cloaked and moving silently as she works on her concoctions. She may be wary of intruders but could offer valuable information if approached carefully. Interacting with her might require persuasion or stealth, and she could become an ally or adversary depending on the players\' actions."'
      : '"The tome rests open on a pedestal, its pages glowing with an ethereal light. Players can attempt to read the tome, requiring an Intelligence (Arcana) check to decipher its contents. Successfully reading it may grant access to a powerful potion recipe or reveal a hidden mechanism within the lab."'
  },
  "read_aloud_description": "You enter the Alchemy Lab, a spacious room filled with bubbling potions and intricate apparatuses. The air is thick with the scent of herbs and the faint aroma of burning candles. An ornate chandelier hangs from the ceiling, its crystals shimmering with a faint magical glow. ${
    npcString
      ? 'A figure clad in dark robes stands near a workbench, her gaze briefly meeting yours before she returns to her tasks.'
      : 'A large, ancient tome rests open on a pedestal, its pages filled with indecipherable symbols.'
  }",
  "additional_notes": ${
    npcString
      ? '"Elaria may have quests for the players or information about the dungeon\'s secrets. She values discretion and may react negatively to aggressive behavior."'
      : '"Some of the potions are rare and could be valuable if found, while the manuscripts might hold secrets that could aid or hinder the players in their quest."'
  }
}
\`\`\`
`;
}

// custom-room-prompt.mjs

export function validateCustomRoomResponse(jsonString) {
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

// custom-room-prompt.mjs

export function processCustomRoomResponse(data) {
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
