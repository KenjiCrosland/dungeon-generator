// Helper function to calculate area for a simple rectangular room
function calculateRectangularRoomArea(room) {
  return room.width * room.height * 25; // Each tile is 25 square feet (5x5)
}

// Helper function to calculate area for merged rooms
function calculateMergedRoomArea(sections) {
  const tileSet = new Set();

  sections.forEach((room) => {
    for (let i = 0; i < room.width; i++) {
      for (let j = 0; j < room.height; j++) {
        const tileX = room.x + i;
        const tileY = room.y + j;
        const tileKey = `${tileX},${tileY}`;
        tileSet.add(tileKey);
      }
    }
  });

  // Total area is number of tiles * 25 (since each tile is 5x5 ft)
  return tileSet.size * 25;
}

// Helper function to determine room shape for merged rooms
function determineRoomShape(sections) {
  const minX = Math.min(...sections.map((r) => r.x));
  const minY = Math.min(...sections.map((r) => r.y));
  const maxX = Math.max(...sections.map((r) => r.x + r.width));
  const maxY = Math.max(...sections.map((r) => r.y + r.height));

  const boundingArea = (maxX - minX) * (maxY - minY);

  const actualArea = calculateMergedRoomArea(sections) / 25; // Number of tiles

  if (actualArea < boundingArea) {
    return 'L-shaped';
  }

  return null; // If it's rectangular
}

// Function to preprocess rooms and handle merged rooms
export function preprocessRooms(rooms) {
  const languageRooms = [];

  rooms.forEach((room) => {
    if (room.type === 'merged') {
      // Merged room with sections
      const combinedRoom = {
        id: room.id,
        type: 'merged',
        sections: room.sections,
        x: Math.min(...room.sections.map((r) => r.x)),
        y: Math.min(...room.sections.map((r) => r.y)),
        width:
          Math.max(...room.sections.map((r) => r.x + r.width)) -
          Math.min(...room.sections.map((r) => r.x)),
        height:
          Math.max(...room.sections.map((r) => r.y + r.height)) -
          Math.min(...room.sections.map((r) => r.y)),
        doorways: room.sections.flatMap((r) =>
          r.doorways.filter((d) => d.type !== 'merged'),
        ),
        shape: determineRoomShape(room.sections),
        area: calculateMergedRoomArea(room.sections),
      };

      // Add the combined room to the language rooms
      languageRooms.push(combinedRoom);
    } else {
      // Simple room
      const roomWithArea = {
        ...room,
        area: calculateRectangularRoomArea(room),
        // Exclude 'merged' doorways if any
        doorways: room.doorways.filter((d) => d.type !== 'merged'),
      };
      languageRooms.push(roomWithArea);
    }
  });

  return languageRooms;
}

// Function to add connectedRoomId to doorways
function addConnectedRoomIds(rooms) {
  // Create a map from room positions to room IDs
  const positionToRoomId = new Map();
  rooms.forEach((room) => {
    const addTiles = (r) => {
      for (let i = 0; i < r.width; i++) {
        for (let j = 0; j < r.height; j++) {
          const x = r.x + i;
          const y = r.y + j;
          const key = `${x},${y}`;
          positionToRoomId.set(key, room.id);
        }
      }
    };

    if (room.type === 'merged') {
      room.sections.forEach((section) => {
        addTiles(section);
      });
    } else {
      addTiles(room);
    }
  });

  // For each room, for each doorway, find the connected room and add or overwrite connectedRoomId
  rooms.forEach((room) => {
    const doorways = room.doorways || [];
    doorways.forEach((doorway) => {
      if (doorway.type === 'merged') {
        // Merged doorways connect to internal sections, skip
        return;
      }

      const side = doorway.side;
      const position = doorway.position;

      let x = room.x;
      let y = room.y;

      if (side === 'top') {
        x = x + position;
        y = y - 1;
      } else if (side === 'bottom') {
        x = x + position;
        y = y + room.height;
      } else if (side === 'left') {
        x = x - 1;
        y = y + position;
      } else if (side === 'right') {
        x = x + room.width;
        y = y + position;
      }

      const key = `${x},${y}`;
      const connectedRoomId = positionToRoomId.get(key);
      if (connectedRoomId !== undefined && connectedRoomId !== room.id) {
        doorway.connectedRoomId = connectedRoomId;
      }
    });
  });
}

// Function to generate room descriptions
function describeRoom(room) {
  const numberOfTiles = room.area / 25;
  let sizeDescription;

  if (numberOfTiles <= 20) {
    sizeDescription = 'small';
  } else if (numberOfTiles <= 35) {
    sizeDescription = 'medium-sized';
  } else {
    sizeDescription = 'large';
  }

  const squareFeet = room.area;

  const sideToDirection = {
    top: 'north',
    bottom: 'south',
    left: 'west',
    right: 'east',
  };

  const doorways = room.doorways || [];

  // Collect doorways into exits
  const exits = doorways
    .map((doorway) => {
      if (!doorway || !doorway.type || !doorway.side) return null;

      const direction = sideToDirection[doorway.side] || 'unknown direction';

      let description = '';

      if (doorway.type === 'secret') {
        description = 'a secret door to the ' + direction;
      } else if (doorway.type === 'locked-door') {
        description = 'a locked door to the ' + direction;
      } else if (doorway.type === 'door') {
        description = 'a door to the ' + direction;
      } else if (doorway.type === 'corridor') {
        description = 'a corridor leading to the ' + direction;
      } else if (doorway.type === 'stairs') {
        // Determine if stairs are leading up or down
        let stairsDirection = '';
        if (doorway.connectedRoomId !== undefined) {
          stairsDirection = doorway.connectedRoomId < room.id ? 'down' : 'up';
        }
        description = `stairs leading ${stairsDirection} to the ${direction}`;
      } else {
        description = 'an exit to the ' + direction;
      }

      return {
        description,
        type: doorway.type,
        connectedRoomId: doorway.connectedRoomId,
        direction,
        doorway, // Include the original doorway for reference
      };
    })
    .filter((exit) => exit !== null);

  // Remove duplicates
  const uniqueExits = [];
  const exitDescriptionsSet = new Set();
  exits.forEach((exit) => {
    if (!exitDescriptionsSet.has(exit.description)) {
      uniqueExits.push(exit);
      exitDescriptionsSet.add(exit.description);
    }
  });

  // Start with the default description
  let description = `This is a ${sizeDescription} room (${squareFeet} square feet).`;

  // Set to keep track of doorways already mentioned
  const mentionedDoorways = new Set();

  // Check for special cases
  const connectionsFromLowerIdRooms = doorways.filter(
    (doorway) =>
      doorway.connectedRoomId !== undefined &&
      doorway.connectedRoomId < room.id,
  );
  const onlyAccessIsLockedDoor =
    connectionsFromLowerIdRooms.length > 0 &&
    connectionsFromLowerIdRooms.every(
      (doorway) => doorway.type === 'locked-door',
    );

  if (onlyAccessIsLockedDoor) {
    const firstLockedDoor = connectionsFromLowerIdRooms[0];
    const direction = sideToDirection[firstLockedDoor.side];
    description += ` The only access is through a locked door to the ${direction}.`;

    // Mark this doorway as mentioned
    mentionedDoorways.add(firstLockedDoor);
  }

  if (doorways.length > 0 && doorways.every((d) => d.type === 'secret')) {
    // If all doorways are secret
    description += ' This is a hidden room with a secret entrance.';

    // Mark all doorways as mentioned
    doorways.forEach((d) => mentionedDoorways.add(d));
  }

  // Include exits
  const exitsToDescribe = uniqueExits.filter(
    (exit) => !mentionedDoorways.has(exit.doorway),
  );

  if (exitsToDescribe.length === 0) {
    if (
      !onlyAccessIsLockedDoor &&
      !(doorways.length > 0 && doorways.every((d) => d.type === 'secret'))
    ) {
      description += ' There are no visible exits.';
    }
  } else {
    const exitDescriptions = exitsToDescribe.map((exit) => exit.description);
    const exitText = listToText(exitDescriptions);
    description += ` There ${
      exitDescriptions.length === 1 ? 'is' : 'are'
    } ${exitText}.`;
  }

  // Include shape description only if L-shaped
  if (room.shape === 'L-shaped') {
    description += ' The room is L-shaped.';
  }

  return description.trim();
}

// Helper function to format lists into natural language
function listToText(list) {
  if (list.length === 1) {
    return list[0];
  } else if (list.length === 2) {
    return `${list[0]} and ${list[1]}`;
  } else {
    const lastItem = list.pop();
    return `${list.join(', ')}, and ${lastItem}`;
  }
}

// Main function to create room descriptions based on room data
export function createRoomDescriptions(rooms) {
  // First, add connectedRoomIds to doorways
  addConnectedRoomIds(rooms);

  const languageRooms = preprocessRooms(rooms);
  const roomDescriptions = {};

  languageRooms.forEach((room) => {
    const description = describeRoom(room);
    // For merged rooms, assign the description to the merged room ID and optionally to its sections
    if (room.type === 'merged') {
      roomDescriptions[room.id] = description;
      // Optionally, assign the same description to individual sections
      room.sections.forEach((section) => {
        roomDescriptions[section.id] = description;
      });
    } else {
      roomDescriptions[room.id] = description;
    }
  });

  return roomDescriptions;
}
