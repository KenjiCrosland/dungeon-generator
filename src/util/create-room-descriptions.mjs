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

// Function to generate room descriptions
export function describeRoom(room) {
  const numberOfTiles = room.area / 25; // Now we correctly use the area passed into the room object
  let sizeDescription;

  if (numberOfTiles <= 20) {
    sizeDescription = 'small';
  } else if (numberOfTiles <= 35) {
    sizeDescription = 'medium-sized';
  } else {
    sizeDescription = 'large';
  }

  const squareFeet = room.area; // Now the area is correctly calculated

  const sideToDirection = {
    top: 'north',
    bottom: 'south',
    left: 'west',
    right: 'east',
  };

  // Handle the list of doorways and adjust for Oxford comma and secret door description
  const doorDescriptions = room.doorways
    .map((doorway) => {
      if (!doorway || !doorway.type || !doorway.side) return ''; // Ignore invalid or incomplete doorways
      const direction = sideToDirection[doorway.side] || 'unknown direction';

      if (doorway.type === 'door') {
        return `an unlocked door to the ${direction}`;
      } else if (doorway.type === 'locked-door') {
        return `a locked door to the ${direction}`;
      } else if (doorway.type === 'secret') {
        return 'hidden somewhere is an entrance to a secret room'; // General secret entrance description
      } else if (doorway.type === 'corridor') {
        return `a corridor leading to the ${direction}`;
      } else if (doorway.type === 'stairs') {
        return `stairs leading ${
          doorway.side === 'top' || doorway.side === 'left' ? 'up' : 'down'
        } to the ${direction}`;
      } else {
        return ''; // In case of an unknown doorway type, return an empty string
      }
    })
    .filter((desc) => desc !== ''); // Remove any empty descriptions

  // Remove duplicate door descriptions (since merged rooms may have overlapping doorways)
  const uniqueDoorDescriptions = [...new Set(doorDescriptions)];

  // Join the door descriptions using proper grammar rules
  let doorDescriptionText = '';
  if (uniqueDoorDescriptions.length === 1) {
    doorDescriptionText = uniqueDoorDescriptions[0];
  } else if (uniqueDoorDescriptions.length === 2) {
    // Only two elements, no need for a comma
    doorDescriptionText = `${uniqueDoorDescriptions[0]} and ${uniqueDoorDescriptions[1]}`;
  } else if (uniqueDoorDescriptions.length > 2) {
    // More than two elements, use the Oxford comma
    const lastDoor = uniqueDoorDescriptions.pop();
    doorDescriptionText = `${uniqueDoorDescriptions.join(
      ', ',
    )}, and ${lastDoor}`;
  }

  // Include shape description only if L-shaped
  let shapeDescription = '';
  if (room.shape === 'L-shaped') {
    shapeDescription = ' The room is L-shaped.';
  }

  // Adjust verb agreement based on the number of doorways
  const verb = uniqueDoorDescriptions.length === 1 ? 'is' : 'are';

  // Handle cases where there are no doorways
  let doorSentence = '';
  if (uniqueDoorDescriptions.length > 0) {
    doorSentence = `There ${verb} ${doorDescriptionText}.`;
  } else {
    doorSentence = 'There are no visible exits.';
  }

  const description = `This is a ${sizeDescription} room (${squareFeet} square feet). ${doorSentence}${shapeDescription}`;

  return description;
}

// Main function to create room descriptions based on room data
export function createRoomDescriptions(rooms) {
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
