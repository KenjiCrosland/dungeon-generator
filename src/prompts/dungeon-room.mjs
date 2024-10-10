// dungeon-room-prompt.mjs

export function dungeonRoomPrompt(
  dungeonOverview,
  room,
  roomDescriptions,
  rooms,
) {
  // Extract necessary details from the dungeonOverview
  const { name: dungeonName, title: dungeonTitle } = dungeonOverview;

  // Get the current room's basic description
  const currentRoomDescription = roomDescriptions[room.id];

  // Get doorways and keyDoor information
  const doorways = room.doorways || [];
  const keyDoor = room.keyDoor || null;

  // Prepare doorways descriptions
  const doorwaysDescriptions = doorways.map((doorway) => {
    let description = `A ${doorway.type.replace('-', ' ')} to the ${
      doorway.side
    }`;
    if (doorway.type === 'locked-door' && doorway.requiresKey) {
      description += ' that requires a key';
    }
    return description;
  });

  // Initialize additional descriptions
  let keyDoorDescription = '';
  let keyRoomDescription = '';

  // Prepare keyDoor information if present
  if (keyDoor) {
    keyDoorDescription = `\n\nNote: There is a significant obstacle at the ${keyDoor.side} side of the room. This obstacle requires specific actions or items to overcome.`;

    // Check if there's a room that contains the key
    if (room.hasKeyInRoomId) {
      const keyRoomId = room.hasKeyInRoomId;
      const keyRoom = rooms.find((r) => r.id === keyRoomId);

      if (keyRoom && keyRoom.fullDescription) {
        // Use details from the key room's full description
        const keyRoomName = keyRoom.fullDescription.name || `Room ${keyRoomId}`;
        keyDoorDescription += ` The key or solution to this obstacle is located in ${keyRoomName}. Ensure that the description of this obstacle is consistent with the key described in that room.`;
      } else {
        // The key room doesn't have a full description yet
        keyDoorDescription += ` The key or solution to this obstacle is located in another room (Room ${keyRoomId}). You may proceed to describe the obstacle, but ensure that when the key room's description is generated, it provides the necessary key or clues.`;
      }
    }

    keyDoorDescription += ` Provide detailed instructions to the Dungeon Master on how players can navigate this obstacle, including three clues with varying difficulty levels to assist the players. The obstacle could be illusionary, magical, or physical in nature. Ensure there is a slim possibility of bypassing it without the key or required action.`;
  }

  // Check if the room contains a key for another room's obstacle
  if (room.hasKeyForRoomId) {
    const obstacleRoomId = room.hasKeyForRoomId;
    const obstacleRoom = rooms.find((r) => r.id === obstacleRoomId);

    if (obstacleRoom && obstacleRoom.fullDescription) {
      // Use details from the obstacle room's full description
      const obstacleRoomName =
        obstacleRoom.fullDescription.name || `Room ${obstacleRoomId}`;
      const obstacleDescription =
        obstacleRoom.fullDescription.hazards || 'an obstacle';
      keyRoomDescription = `\n\nNote: This room contains the key or solution to overcome the obstacle in ${obstacleRoomName}. Ensure that the description of the key or solution matches the requirements described in that room. Provide details on how the key can be found or obtained by the players.`;
    } else {
      // The obstacle room doesn't have a full description yet
      keyRoomDescription = `\n\nNote: This room contains the key or solution to overcome an obstacle in another room (Room ${obstacleRoomId}). You may proceed to describe the key or solution, but ensure that when the obstacle room's description is generated, it matches this description.`;
    }
  }

  return `
Given the dungeon overview, the current room's basic description, and its doorways, generate a detailed description of this specific room in the dungeon. Use the provided context to ensure the room fits logically within the dungeon's narrative and structure. Be creative, unique, and avoid common fantasy tropes and clichés. Temperature: 0.9

Dungeon Overview:
${JSON.stringify(dungeonOverview, null, 2)}

Current Room Basic Description:
"${currentRoomDescription}"

Doorways:
${doorwaysDescriptions.join('; ')}

${keyDoor ? `Key Door Information:${keyDoorDescription}` : ''}
${room.hasKeyForRoomId ? `Key Room Information:${keyRoomDescription}` : ''}

Return the room description in JSON format with the following keys. Make sure to include any relevant NPCs from the dungeon overview if they are present in the room. Space is limited, so please use concise sentences and avoid run-on sentences:

{
  "room_id": "${room.id}",
  "name": "A descriptive name for the room, e.g., 'Hall of Whispering Shadows'",
  "description": "A detailed description of the room's appearance, atmosphere, and any notable features. Mention the entrances and exits based on the doorways provided.",
  "contents": "List of items, creatures, or notable objects found in the room",
  "hazards": "Any traps, environmental dangers, or challenges present in the room, including details about the key door obstacle if applicable",
  ${
    keyDoor
      ? `"clues_for_key_door": [
    "Clue 1 (Easy difficulty)",
    "Clue 2 (Medium difficulty)",
    "Clue 3 (Hard difficulty)"
  ],`
      : ''
  }
  ${
    room.hasKeyForRoomId
      ? `"key_description": "Description of the key or solution found in this room, including how players might discover it",`
      : ''
  }
  "connections": "Brief description of how this room connects to adjacent rooms, based on the doorways",
  "secrets": "Any hidden elements, secret passages, or lore associated with the room",
  "npcs": [
    {
      "name": "NPC Name",
      "description": "A brief description of the NPC, their role in the room, and their intentions"
    }
    // Repeat the above structure for each NPC in the room
  ]
}
`;
}

// dungeon-room-prompt.mjs

export function validateRoomDescription(jsonString) {
  try {
    const data = JSON.parse(jsonString);

    // Required keys for all rooms
    const requiredKeys = [
      'room_id',
      'name',
      'description',
      'contents',
      'hazards',
      'connections',
      'secrets',
      'npcs',
    ];

    // Check for required keys
    for (const key of requiredKeys) {
      if (!(key in data)) {
        console.error(`Missing required key: ${key}`);
        return false;
      }
    }

    // Validate data types
    if (typeof data.room_id !== 'string') {
      console.error('room_id must be a string');
      return false;
    }
    if (typeof data.name !== 'string') {
      console.error('name must be a string');
      return false;
    }
    if (typeof data.description !== 'string') {
      console.error('description must be a string');
      return false;
    }
    if (typeof data.contents !== 'string') {
      console.error('contents must be a string');
      return false;
    }
    if (typeof data.hazards !== 'string') {
      console.error('hazards must be a string');
      return false;
    }
    if (typeof data.connections !== 'string') {
      console.error('connections must be a string');
      return false;
    }
    if (typeof data.secrets !== 'string') {
      console.error('secrets must be a string');
      return false;
    }

    // Validate 'npcs' array
    if (!Array.isArray(data.npcs)) {
      console.error('npcs must be an array');
      return false;
    }
    for (const npc of data.npcs) {
      if (typeof npc.name !== 'string' || typeof npc.description !== 'string') {
        console.error(
          'Each NPC must have a name and description of type string',
        );
        return false;
      }
    }

    // Conditional validation for 'clues_for_key_door'
    if ('clues_for_key_door' in data) {
      if (
        !Array.isArray(data.clues_for_key_door) ||
        data.clues_for_key_door.length !== 3
      ) {
        console.error('clues_for_key_door must be an array of three strings');
        return false;
      }
      for (const clue of data.clues_for_key_door) {
        if (typeof clue !== 'string') {
          console.error('Each clue in clues_for_key_door must be a string');
          return false;
        }
      }
    }

    // Conditional validation for 'key_description'
    if ('key_description' in data) {
      if (typeof data.key_description !== 'string') {
        console.error('key_description must be a string');
        return false;
      }
    }

    // All validations passed
    return true;
  } catch (e) {
    console.error('Invalid JSON format:', e.message);
    return false;
  }
}
