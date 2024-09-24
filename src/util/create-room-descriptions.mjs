// Helper function to calculate area for a simple rectangular room
function calculateRectangularRoomArea(room) {
  return room.width * room.height * 25; // Each tile is 25 square feet (5x5)
}

// Helper function to calculate area for L-shaped rooms
function calculateLShapedRoomArea(room1, room2) {
  // Calculate the overlapping area
  const overlapWidth =
    Math.min(room1.x + room1.width, room2.x + room2.width) -
    Math.max(room1.x, room2.x);
  const overlapHeight =
    Math.min(room1.y + room1.height, room2.y + room2.height) -
    Math.max(room1.y, room2.y);

  // If there's no overlap, use only the jutting part
  const overlapArea =
    overlapWidth > 0 && overlapHeight > 0
      ? overlapWidth * overlapHeight * 25
      : 0;

  // Total area of both rooms
  const totalAreaRoom1 = room1.width * room1.height * 25;
  const totalAreaRoom2 = room2.width * room2.height * 25;

  // Subtract the overlapping area from the total to get the L-shaped area
  return totalAreaRoom1 + totalAreaRoom2 - overlapArea;
}

// Helper function to determine room shape for merged rooms
function determineRoomShape(mergedRooms) {
  const room1 = mergedRooms[0];
  const room2 = mergedRooms[1];
  const widthDiff = Math.abs(room1.width - room2.width);
  const heightDiff = Math.abs(room1.height - room2.height);

  // If the difference in width or height is more than 1, it's L-shaped
  if (widthDiff > 1 || heightDiff > 1) {
    return 'L-shaped';
  }

  // Otherwise, we won't mention the shape
  return null;
}

// Function to preprocess rooms and handle merged rooms based on groupId
export function preprocessMergedRooms(rooms) {
  const languageRooms = [];
  const visitedGroups = new Set(); // Track visited groupIds to avoid processing a group multiple times

  rooms.forEach((room) => {
    // Check if the room is part of a merged group
    if (visitedGroups.has(room.groupId)) return; // Skip already processed groups

    const mergedRooms = rooms.filter((r) => r.groupId === room.groupId);

    // If multiple rooms share the same groupId, treat them as a merged room
    if (mergedRooms.length > 1) {
      // Combine the dimensions of the merged rooms
      const combinedRoom = {
        x: Math.min(...mergedRooms.map((r) => r.x)),
        y: Math.min(...mergedRooms.map((r) => r.y)),
        width:
          Math.max(...mergedRooms.map((r) => r.x + r.width)) -
          Math.min(...mergedRooms.map((r) => r.x)),
        height:
          Math.max(...mergedRooms.map((r) => r.y + r.height)) -
          Math.min(...mergedRooms.map((r) => r.y)),
        doorways: mergedRooms.flatMap((r) => r.doorways),
        ids: mergedRooms.map((r) => r.id), // Include all IDs
        groupId: room.groupId,
        displayGroupId: room.displayGroupId,
        shape: determineRoomShape(mergedRooms), // Only return L-shaped if applicable
        area: calculateLShapedRoomArea(mergedRooms[0], mergedRooms[1]), // Calculate the area correctly for L-shaped rooms
      };

      // Mark the group as processed
      visitedGroups.add(room.groupId);

      // Add the combined room to the language rooms
      languageRooms.push(combinedRoom);
    } else {
      // No merged rooms, treat this room as an individual and calculate the area
      const roomWithArea = {
        ...room,
        area: calculateRectangularRoomArea(room),
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
        return 'Hidden somewhere is an entrance to a secret room'; // General secret entrance description
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

  // Join the door descriptions using proper grammar rules
  let doorDescriptionText = '';
  if (doorDescriptions.length === 1) {
    doorDescriptionText = doorDescriptions[0];
  } else if (doorDescriptions.length === 2) {
    // Only two elements, no need for a comma
    doorDescriptionText = `${doorDescriptions[0]} and ${doorDescriptions[1]}`;
  } else if (doorDescriptions.length > 2) {
    // More than two elements, use the Oxford comma
    const lastDoor = doorDescriptions.pop();
    doorDescriptionText = `${doorDescriptions.join(', ')}, and ${lastDoor}`;
  }

  // Include shape description only if L-shaped
  let shapeDescription = '';
  if (room.shape === 'L-shaped') {
    shapeDescription = ' The room is L-shaped.';
  }

  const description = `This is a ${sizeDescription} room (${squareFeet} square feet). There ${
    doorDescriptions.length === 1 ? 'is' : 'are'
  } ${doorDescriptionText}.${shapeDescription}`;

  return description;
}

// Main function to create room descriptions based on room data
export function createRoomDescriptions(rooms) {
  const languageRooms = preprocessMergedRooms(rooms);
  const roomDescriptions = {};

  languageRooms.forEach((room) => {
    const description = describeRoom(room);
    if (room.ids) {
      room.ids.forEach((id) => {
        roomDescriptions[id] = description;
      });
    } else {
      roomDescriptions[room.id] = description;
    }
  });

  return roomDescriptions;
}
