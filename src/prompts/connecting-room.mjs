// connecting-room.js

export function generateConnectingRoomPrompt(
  dungeonOverview,
  shortDescription,
  existingRooms = 'none',
  connectedRoomsInfo = 'none',
  npcString = '',
) {
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
Using the dungeon overview and the short room description below, create a detailed description of a connecting room within the dungeon. This room should serve as a transitional space that leads to more specialized rooms, fitting within the context of the dungeon's lore and theme.

**Dungeon Overview:**
${dungeonOverview}

**Short Room Description (includes size, exits, and any notable features):**
${shortDescription}
No need to use the room's shape in the description if it's not relevant to the room's function. Just use the shape to inform other details. For example, if the room is long, you could describe it as a corridor lined with statues or tapestries.

${
  connectedRoomsInfo !== ''
    ? `**Connected Rooms:** 
  This room is connected to the following rooms: ${connectedRoomsInfo}`
    : ''
}

${npcSection}**Guidelines:**

- **Room Type:**
  - The room could be a corridor, hallway, gallery, atrium, antechamber, grand foyer, or any multi-purpose space that connects other rooms.
  - Choose a specific type of connecting room that makes sense within the dungeon's context.
  - Use the room size and shape to determine the appropriate type:
    - **Long:** Could be a corridor or gallery. If the word "long" is not in the short description, don't say that it's a corridor.
    - **Small:** Could be a salon, antechamber, or small foyer.
    - **Large:** Could be a grand hall, atrium, or common room.

- **Purpose and Features:**
  - Reflect the function of the room as a connecting space.
  - Include architectural or decorative elements that hint at the dungeon's history and inhabitants.
  - The room may contain objects or features that contribute to the dungeon's atmosphere but are not the main focus.

${npcGuidelines}- **Integration with Dungeon Lore:**
  - Ensure the description aligns with the dungeon's theme and story.
  - Incorporate elements from the dungeon overview to enhance immersion.

- **Avoid Specific Game Mechanics:**
  - Focus on narrative descriptions without referencing specific game rules or mechanics.

**Read Aloud Description Guidelines:**

Compose the **read_aloud_description** using the following sentence-by-sentence structure:

1. **Sentence 1: Room-Specific Description**
   - **Guideline:** Describe the specific type and characteristics of the room within the dungeon. Include details about its size, purpose, and distinctive features to set the scene for what the players are encountering.
   - **Examples:**
     - "The corridor stretches before you, its walls adorned with ancient murals depicting forgotten battles."
     - "You enter a grand atrium, the ceiling soaring above with intricate carvings of celestial bodies."
     - "A narrow passageway winds ahead, the air growing colder with each step."

2. **Sentence 2: Atmospheric Details**
   - **Guideline:** Focus on sensory experiences specific to the room. Describe smells, lighting, sounds, or any atmospheric elements that add depth to the room’s character.
   - **Examples:**
     - "Flickering torchlight casts eerie shadows that dance along the stone floor."
     - "A faint draft carries the scent of damp earth and distant decay."
     - "The sound of dripping water echoes softly, breaking the silence."

3. **Sentence 3: Unique Features**
   - **Guideline:** Highlight unique, non-interactive elements that make the room special. These can be architectural, artistic, or natural details that contribute to the ambiance without being directly usable by the players.
   - **Examples:**
     - "Columns carved to resemble intertwined serpents line the hallway."
     - "Stained glass windows depict scenes of an ancient ritual, colors muted by dust."
     - "An ornate chandelier hangs precariously, its crystals reflecting fragments of light."

4. **Sentence 4: Interactive Element${npcString ? ' or NPC' : ''}**
   - **Guideline:** Introduce one feature in the room that players can interact with${
     npcString ? ' or the NPC if one is present' : ''
   }. This will be expanded upon further in the interactive element${
    npcString ? ' or NPC' : ''
  } descriptions. **DO NOT MENTION TRAPS OR ANYTHING HIDDEN TO PLAYERS.**
   - **Examples:**
     - "A heavy wooden door stands ajar at the far end, intricate runes etched into its frame."
     - "An old, weathered map is mounted on the wall, its details faded but still discernible."
     - "A series of levers protrude from a panel beside the passageway, their purpose unclear."
     ${
       npcString
         ? '- "A cloaked figure stands silently by a pillar, their gaze following your movements."'
         : ''
     }
     ${
       npcString
         ? '- "An armored guard patrols the area, his footsteps echoing in the vast space."'
         : ''
     }

**Return the description in JSON format with the following keys:**

- **name**: A short, appropriate name for the room (e.g., "Grand Hallway", "Foyer", "Antechamber", "Gallery", "Atrium", "Corridor"). This name should be 1-2 words and should be simple, indicating the function of the room. Don't use overly descriptive names. It should be a common room type.
- **one_sentence_summary**: A brief summary of the room's function or purpose within the dungeon.
- **lore_description**: For the Dungeon Master's eyes only. Describe the room's history, purpose, and how it fits into the dungeon's lore.
- **features_and_contents**: For the Dungeon Master's eyes only. Describe notable features, items, or information present in the room that may be of interest to the players.
- **interactive_element_header**: A brief header for the interactive element in the room${
    npcString ? " or the NPC's name if present" : ''
  } (e.g., "The Etched Door", "The Faded Map", "The Lever Panel"${
    npcString ? ', "Mysterious Figure", "Armored Guard"' : ''
  }).
- **interactive_element_lore**: For the Dungeon Master's eyes only. Provide additional lore or context about the interactive element${
    npcString ? ' or NPC' : ''
  }. Why is it here? What is its significance?
- **interactive_element_details**: For the Dungeon Master's eyes only. Describe the interactive element${
    npcString ? ' or NPC' : ''
  } in more detail, including its appearance, behavior, and any effects it may have on the players.${
    npcString
      ? ' Include how the NPC might react to player interactions. What might the NPC say or do if the players approach?'
      : ''
  }
- **read_aloud_description**: A vivid description to read aloud when players enter the room, following the sentence-by-sentence guidelines above. Remember to take the following short description into account, particularly when it comes to room size: ${shortDescription}
- **additional_notes**: For the Dungeon Master's eyes only. Include any other relevant information or secrets about the room${
    npcString ? ' or NPC' : ''
  }.

**Example JSON Format:**

\`\`\`json
{
  "name": "Grand Hallway",
  "one_sentence_summary": "A long corridor connecting various parts of the dungeon, adorned with historical murals.",
  "lore_description": "This hallway was the main artery of the temple, used by priests and acolytes to move between sacred chambers. The murals tell the story of the deity worshipped here, depicting key events and rituals.",
  "features_and_contents": "The floor is made of polished marble, now cracked and worn. Niches along the walls hold statues of forgotten heroes. Sconces for torches are empty, but faint magical light still illuminates the path.",
  "interactive_element_header": ${
    npcString ? '"Mysterious Figure"' : '"The Faded Map"'
  },
  "interactive_element_lore": ${
    npcString
      ? '"A rogue agent of the Shadow Guild, stationed here to monitor dungeon activity."'
      : '"The map was created by the original architects, showing secret passages and hidden rooms intended for only the most trusted members."'
  },
  "interactive_element_details": ${
    npcString
      ? '"The figure is cloaked, obscuring their features. If approached, they may offer cryptic warnings or bartering opportunities. Interacting with them could lead to valuable information or potential conflict, depending on the players\' actions."'
      : '"The map is etched into a metal plate mounted on the wall. Players who examine it closely can make an Investigation check to uncover hidden routes. Success reveals a secret door in this hallway or provides advantage on navigating the dungeon."'
  },
  "read_aloud_description": "The corridor stretches before you, its walls adorned with ancient murals depicting forgotten battles. Flickering torchlight casts eerie shadows that dance along the stone floor. Columns carved to resemble intertwined serpents line the hallway. ${
    npcString
      ? 'A cloaked figure stands silently by a pillar, their gaze following your movements.'
      : 'An old, weathered map is mounted on the wall, its details faded but still discernible.'
  }",
  "additional_notes": "Some of the statues may hold clues or keys needed elsewhere in the dungeon. The magical light is sustained by ancient enchantments that could be disrupted."
}
\`\`\`

The dungeon already has the following rooms: ${existingRooms}

Do not reuse any of these room types. Ensure that the room description is unique and adds depth to the dungeon's narrative.

If they aren't in the list, you can use the following room types: corridor, hallway, gallery, atrium, antechamber, grand foyer, or any multi-purpose space that connects other rooms. Focus on spaces that serve as transitions between areas.

Room size and shape should determine the type of room you choose. For example:

- A **long** room could be a corridor or gallery.
- A **small** room could be a salon, antechamber, or small foyer.
- A **large** room could be a grand hall, atrium, or common room.

**Please provide the response in this JSON format.**
`;
}

export function validateConnectingRoomResponse(jsonString) {
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

export function processConnectingRoomResponse(data) {
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
