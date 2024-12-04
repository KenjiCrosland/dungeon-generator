// Helper function to get the opposite side
function getOppositeSide(side) {
  const opposites = {
    top: 'bottom',
    bottom: 'top',
    left: 'right',
    right: 'left',
  };
  return opposites[side];
}

// Function to check if two rooms overlap
function roomsOverlap(room1, room2) {
  const buffer = 1; // Gap of 1 tile between rooms

  // If rooms are connected via a 'merged' doorway, allow them to touch
  let isMerged = false;
  if (room1.doorways && room2.doorways) {
    room1.doorways.forEach((d1) => {
      if (d1.type === 'merged') {
        room2.doorways.forEach((d2) => {
          if (
            d2.type === 'merged' &&
            getOppositeSide(d1.side) === d2.side &&
            d1.position === d2.position &&
            room1.id !== room2.id
          ) {
            isMerged = true;
          }
        });
      }
    });
  }

  const actualBuffer = isMerged ? 0 : buffer;

  return (
    room1.x - actualBuffer < room2.x + room2.width &&
    room1.x + room1.width + actualBuffer > room2.x &&
    room1.y - actualBuffer < room2.y + room2.height &&
    room1.y + room1.height + actualBuffer > room2.y
  );
}

// Global room ID counter
let nextRoomId = 1; // Reset the ID counter before generating the dungeon

function generateTree(
  room,
  existingRooms = [],
  depth = 0,
  lockedDoorPlacedAtDepth1 = false,
  maxDepthBeyondLockedOrSecretDoor = null,
) {
  // Assign an ID to the current room if it doesn't have one
  if (!room.id) {
    room.id = nextRoomId++;
  }

  // Check if the room is already in existingRooms
  if (!existingRooms.some((r) => r.id === room.id)) {
    existingRooms.push(room);
  } else {
    return; // Room already processed
  }

  // If maxDepthBeyondLockedOrSecretDoor is set and we've reached it, stop recursion
  if (
    maxDepthBeyondLockedOrSecretDoor !== null &&
    depth > maxDepthBeyondLockedOrSecretDoor
  ) {
    // Remove all doorways except the one leading back to the parent
    room.doorways = room.doorways.filter((d) => d.fromParent);
    return;
  }

  if (depth > 5) {
    // Limit overall dungeon depth
    room.doorways = room.doorways.filter((d) => d.fromParent);
    return;
  }

  // Determine if we must place the locked door in this room
  let mustPlaceLockedDoor = false;
  if (depth === 1 && !lockedDoorPlacedAtDepth1) {
    mustPlaceLockedDoor = true;
  }

  // Initialize a variable to keep track of locked or secret doorways
  let hasLockedOrSecretDoor = room.doorways.some(
    (d) => d.type === 'locked-door' || d.type === 'secret',
  );

  // Generate additional doorways in the current room (excluding fromParent doorway)
  let minAdditionalDoorways = 0;
  let maxAdditionalDoorways = 2;
  let numAdditionalDoorways =
    Math.floor(
      Math.random() * (maxAdditionalDoorways - minAdditionalDoorways + 1),
    ) + minAdditionalDoorways;

  // If we must place a locked door, ensure at least one additional doorway
  if (mustPlaceLockedDoor && numAdditionalDoorways === 0) {
    numAdditionalDoorways = 1;
  }

  // Get available sides excluding the one connected to the parent
  const connectedSides = room.doorways
    .filter((d) => d.fromParent)
    .map((d) => d.side);

  const availableSides = ['top', 'right', 'bottom', 'left'].filter(
    (side) => !connectedSides.includes(side),
  );

  // Randomly select sides for additional doorways
  const sidesForDoorways = availableSides
    .sort(() => Math.random() - 0.5)
    .slice(0, numAdditionalDoorways);

  sidesForDoorways.forEach((side) => {
    const maxPosition =
      side === 'top' || side === 'bottom' ? room.width - 2 : room.height - 2;
    if (maxPosition > 0) {
      const position = Math.floor(Math.random() * maxPosition) + 1;

      let selectedType;

      // Logic for placing the locked door in rooms adjacent to entrance
      if (mustPlaceLockedDoor) {
        selectedType = 'locked-door';
        mustPlaceLockedDoor = false;
        hasLockedOrSecretDoor = true;
        lockedDoorPlacedAtDepth1 = true;
      } else {
        // Define available doorway types
        let availableTypes = [
          { type: 'door', weight: 30 },
          { type: 'corridor', weight: 25 },
          { type: 'stairs', weight: 15 },
          { type: 'merged', weight: 5 },
        ];

        // For depth > 1, allow additional locked or secret doors that lead to one room
        if (depth > 1 && !hasLockedOrSecretDoor) {
          availableTypes.push({ type: 'locked-door', weight: 10 });
          availableTypes.push({ type: 'secret', weight: 10 });
        }

        // Compute total weight
        const totalWeight = availableTypes.reduce(
          (sum, entry) => sum + entry.weight,
          0,
        );

        // Randomly select a type based on weights
        const randomValue = Math.random() * totalWeight;
        let cumulativeWeight = 0;
        selectedType = 'door'; // default

        for (const entry of availableTypes) {
          cumulativeWeight += entry.weight;
          if (randomValue < cumulativeWeight) {
            selectedType = entry.type;
            break;
          }
        }

        // If we selected a locked door or secret door
        if (selectedType === 'locked-door' || selectedType === 'secret') {
          hasLockedOrSecretDoor = true;
        }
      }

      const doorwayData = { side, position, type: selectedType };
      room.doorways.push(doorwayData);
    }
  });

  // Now, process each doorway in the room (excluding fromParent doorways)
  const doorways = room.doorways || [];

  // Keep track of doorways that successfully led to child rooms
  const successfulDoorways = [];

  for (let i = 0; i < doorways.length; i++) {
    const doorway = doorways[i];

    if (doorway.fromParent) {
      continue; // Skip processing the doorway back to the parent
    }

    const parentDoorwaySide = doorway.side;
    const oppositeSide = getOppositeSide(parentDoorwaySide);

    // Randomly generate dimensions for the child room
    let width = Math.floor(Math.random() * 5) + 3;
    let height = Math.floor(Math.random() * 5) + 3;

    // The position of the doorway in the child room that connects to the parent room
    let childDoorwayPosition = doorway.position;

    // Adjust child room dimensions if necessary
    if (parentDoorwaySide === 'top' || parentDoorwaySide === 'bottom') {
      if (childDoorwayPosition >= width - 1) {
        width = childDoorwayPosition + 2;
      }
    } else {
      if (childDoorwayPosition >= height - 1) {
        height = childDoorwayPosition + 2;
      }
    }

    // Gap between rooms
    let gap = doorway.type === 'merged' ? 0 : 1;

    // Calculate the child room's position with gap
    let x = room.x;
    let y = room.y;

    if (parentDoorwaySide === 'top') {
      y = room.y - height - gap;
      x = room.x + doorway.position - childDoorwayPosition;
    } else if (parentDoorwaySide === 'bottom') {
      y = room.y + room.height + gap;
      x = room.x + doorway.position - childDoorwayPosition;
    } else if (parentDoorwaySide === 'left') {
      x = room.x - width - gap;
      y = room.y + doorway.position - childDoorwayPosition;
    } else if (parentDoorwaySide === 'right') {
      x = room.x + room.width + gap;
      y = room.y + doorway.position - childDoorwayPosition;
    }

    // Create doorways for the child room
    const childDoorways = [];

    // Assign the same type to the child doorway connecting back to the parent
    const parentDoorwayType = doorway.type;

    // Add the connecting doorway back to the parent and mark it appropriately
    const childDoorwayToParent = {
      side: oppositeSide,
      position: childDoorwayPosition,
      fromParent: true,
      type: parentDoorwayType,
    };

    childDoorways.push(childDoorwayToParent);

    // Create the new room without assigning an ID yet
    const newRoom = {
      x,
      y,
      width,
      height,
      doorways: childDoorways,
    };

    // Check for overlap with existing rooms
    const overlaps = existingRooms.some((existingRoom) =>
      roomsOverlap(existingRoom, newRoom),
    );

    if (!overlaps) {
      // Now assign an ID to the new room
      newRoom.id = nextRoomId++;

      // Set connectedRoomId in doorways here

      // In the parent doorway
      doorway.connectedRoomId = newRoom.id;

      // In the child doorway back to the parent
      childDoorwayToParent.connectedRoomId = room.id;

      // Determine the max depth beyond this room
      let childMaxDepthBeyondLockedOrSecretDoor =
        maxDepthBeyondLockedOrSecretDoor;

      // If this doorway is a locked door or secret door
      if (doorway.type === 'locked-door' || doorway.type === 'secret') {
        if (depth === 1 && doorway.type === 'locked-door') {
          // For the locked door adjacent to the entrance, allow unlimited depth
          childMaxDepthBeyondLockedOrSecretDoor = null;
        } else {
          // For other locked or secret doors, limit the depth to current depth + 1
          childMaxDepthBeyondLockedOrSecretDoor = depth + 1;
        }
      }

      // If the doorway is a 'locked-door' leading to one room, with a 50% chance, make it a 'secret' door
      if (
        doorway.type === 'locked-door' &&
        childMaxDepthBeyondLockedOrSecretDoor !== null &&
        Math.random() < 0.5
      ) {
        doorway.type = 'secret';
        childDoorwayToParent.type = 'secret';
      }

      // Proceed to generate child rooms
      generateTree(
        newRoom,
        existingRooms,
        depth + 1,
        lockedDoorPlacedAtDepth1,
        childMaxDepthBeyondLockedOrSecretDoor,
      );

      // Keep the doorway
      successfulDoorways.push(doorway);
    } else {
      // Overlaps, remove the doorway from the parent room
      // We don't add this doorway to successfulDoorways
    }
  }

  // Update the room's doorways to only include successful doorways and fromParent doorways
  room.doorways = room.doorways.filter(
    (d) => d.fromParent || successfulDoorways.includes(d),
  );
}

// Union-Find class for grouping merged rooms
class UnionFind {
  constructor() {
    this.parent = {};
  }

  find(u) {
    if (this.parent[u] === undefined) {
      this.parent[u] = u;
    }
    if (this.parent[u] !== u) {
      this.parent[u] = this.find(this.parent[u]); // Path compression
    }
    return this.parent[u];
  }

  union(u, v) {
    const pu = this.find(u);
    const pv = this.find(v);
    if (pu !== pv) {
      this.parent[pu] = pv;
    }
  }
}

// Function to find adjacent room
function findAdjacentRoom(room, doorway, rooms) {
  const side = doorway.side;
  const position = doorway.position;

  let adjacentX = room.x;
  let adjacentY = room.y;

  if (side === 'top') {
    adjacentY = room.y - 1; // Directly above
    adjacentX = room.x + position;
  } else if (side === 'bottom') {
    adjacentY = room.y + room.height; // Directly below
    adjacentX = room.x + position;
  } else if (side === 'left') {
    adjacentX = room.x - 1; // Directly to the left
    adjacentY = room.y + position;
  } else if (side === 'right') {
    adjacentX = room.x + room.width; // Directly to the right
    adjacentY = room.y + position;
  }

  // Find the adjacent room in rooms
  return rooms.find((r) => {
    if (side === 'top' || side === 'bottom') {
      return r.y === adjacentY && r.x <= adjacentX && adjacentX < r.x + r.width;
    } else {
      return (
        r.x === adjacentX && r.y <= adjacentY && adjacentY < r.y + r.height
      );
    }
  });
}

// Main dungeon generation function
export function generateDungeon() {
  // Reset nextRoomId before generating the dungeon
  nextRoomId = 1;

  // Initialize existingRooms and generate the tree
  let existingRooms = [];
  const initialRoom = {
    x: 1,
    y: 1,
    width: 5,
    height: 4,
    doorways: [],
  };

  // Generate initial doorways for the entrance room
  // We don't want a locked door or secret door here, so we can proceed normally
  const entranceDoorways = [];

  const sides = ['top', 'right', 'bottom', 'left'];
  const numDoorways = 3; // Number of doorways from the entrance
  const sidesForDoorways = sides
    .sort(() => Math.random() - 0.5)
    .slice(0, numDoorways);

  sidesForDoorways.forEach((side) => {
    const maxPosition =
      side === 'top' || side === 'bottom'
        ? initialRoom.width - 2
        : initialRoom.height - 2;
    if (maxPosition > 0) {
      const position = Math.floor(Math.random() * maxPosition) + 1;
      entranceDoorways.push({ side, position, type: 'door' });
    }
  });

  initialRoom.doorways = entranceDoorways;

  // Generate the dungeon starting from the initial room
  generateTree(initialRoom, existingRooms, 0, false, null);

  // After generating existingRooms, proceed with merging rooms and adjusting IDs

  // Union-Find instance for grouping merged rooms
  const uf = new UnionFind();

  // Iterate over rooms to union merged rooms
  existingRooms.forEach((room) => {
    room.doorways.forEach((doorway) => {
      if (doorway.type === 'merged') {
        const adjacentRoom = findAdjacentRoom(room, doorway, existingRooms);
        if (adjacentRoom) {
          uf.union(room.id, adjacentRoom.id);
        }
      }
    });
  });

  // Process existingRooms to combine merged rooms
  const groupIdToRooms = new Map();

  existingRooms.forEach((room) => {
    const groupId = uf.find(room.id);
    if (!groupIdToRooms.has(groupId)) {
      groupIdToRooms.set(groupId, []);
    }
    groupIdToRooms.get(groupId).push(room);
  });

  const newRooms = [];
  let nextMergedRoomId = nextRoomId; // Continue ID numbering

  groupIdToRooms.forEach((roomsInGroup) => {
    if (roomsInGroup.length === 1) {
      // Only one room in this group, keep it as is
      const room = roomsInGroup[0];
      newRooms.push(room);
    } else {
      // Multiple rooms in this group, create a merged room
      const mergedRoom = {
        id: nextMergedRoomId++,
        type: 'merged',
        sections: roomsInGroup,
        doorways: [], // Doorways will be handled below
      };
      newRooms.push(mergedRoom);
    }
  });

  // Replace existingRooms with newRooms
  existingRooms = newRooms;

  // Reassign IDs to ensure they are sequential
  let newRoomIdCounter = 1;
  const oldIdToNewId = {};

  // Reassign IDs
  existingRooms.forEach((room) => {
    const oldId = room.id;
    room.id = newRoomIdCounter++;
    oldIdToNewId[oldId] = room.id;

    if (room.sections) {
      // If room is a merged room, remove IDs from sections and update mapping
      room.sections.forEach((section) => {
        const sectionOldId = section.id;
        if (sectionOldId !== undefined) {
          oldIdToNewId[sectionOldId] = room.id; // Map section ID to merged room ID
          delete section.id;
        }
      });
    }
  });

  // Update connectedRoomIds in doorways
  existingRooms.forEach((room) => {
    const doorways = room.doorways || [];

    doorways.forEach((doorway) => {
      if (doorway.connectedRoomId !== undefined) {
        doorway.connectedRoomId = oldIdToNewId[doorway.connectedRoomId];
      }
    });

    if (room.sections) {
      // Update doorways in sections as well
      room.sections.forEach((section) => {
        const sectionDoorways = section.doorways || [];
        sectionDoorways.forEach((doorway) => {
          if (doorway.connectedRoomId !== undefined) {
            doorway.connectedRoomId = oldIdToNewId[doorway.connectedRoomId];
          }
        });
      });
      room.sections.forEach((section) => {
        if (section.doorways) {
          section.doorways.forEach((doorway) => {
            if (doorway.type !== 'merged') {
              room.doorways.push(doorway);
            }
          });
        }
      });
    }
  });

  return existingRooms;
}
