// dungeon-details.mjs

// Class to represent each room node in the graph
class RoomNode {
  constructor(room) {
    this.id = room.id;
    this.room = room; // Original room data
    this.neighbors = []; // Adjacent rooms
    this.distanceFromEntrance = Infinity; // Initialize with Infinity
    this.visited = false;
    // Additional metadata
    this.roomType = null; // e.g., 'boss', 'minion', 'goal', etc.
    this.containsKey = false;
    this.faction = null;
    this.isLeaf = false;
    this.isPickable = false; // For locked doors with no further connections
  }
}

// Function to build the dungeon graph
function buildDungeonGraph(rooms) {
  const roomMap = new Map();

  // Create a RoomNode for each room
  rooms.forEach((room) => {
    roomMap.set(room.id, new RoomNode(room));
  });

  // Establish connections between rooms
  rooms.forEach((room) => {
    const currentNode = roomMap.get(room.id);

    // Get all doorways for the room, including those in sections if it's a merged room
    let doorways = [];
    if (room.type === 'merged' && room.sections) {
      room.sections.forEach((section) => {
        if (section.doorways) {
          doorways = doorways.concat(section.doorways);
        }
      });
    } else {
      doorways = room.doorways || [];
    }

    doorways.forEach((doorway) => {
      if (doorway.connectedRoomId !== undefined) {
        const neighborNode = roomMap.get(doorway.connectedRoomId);
        if (neighborNode) {
          currentNode.neighbors.push(neighborNode);
        }
      }
    });
  });

  return roomMap;
}

// Function to calculate distances from the entrance using BFS
function calculateDistances(roomMap, entranceId = 1) {
  const entranceNode = roomMap.get(entranceId);
  entranceNode.distanceFromEntrance = 0;
  entranceNode.visited = true;

  const queue = [entranceNode];

  while (queue.length > 0) {
    const currentNode = queue.shift();
    const currentDistance = currentNode.distanceFromEntrance;

    currentNode.neighbors.forEach((neighbor) => {
      if (!neighbor.visited) {
        neighbor.visited = true;
        neighbor.distanceFromEntrance = currentDistance + 1;
        queue.push(neighbor);
      }
    });
  }
}

// The rest of the code remains the same...

// Function to identify leaf nodes (rooms with only one connection excluding entrance)
function identifyLeafNodes(roomMap) {
  roomMap.forEach((node) => {
    // Exclude the entrance node
    if (node.id !== 1 && node.neighbors.length === 1) {
      node.isLeaf = true;
    }
  });
}

// Function to assign the boss room
function assignBossRoom(roomMap) {
  // Filter out leaf nodes
  const leafNodes = Array.from(roomMap.values()).filter((node) => node.isLeaf);

  // Sort leaf nodes by distance from entrance (descending)
  leafNodes.sort((a, b) => b.distanceFromEntrance - a.distanceFromEntrance);

  const bossRoomNode = leafNodes[0];
  bossRoomNode.roomType = 'boss';

  return bossRoomNode;
}

// Function to assign minion rooms adjacent to the boss room
function assignMinionRooms(bossRoomNode) {
  bossRoomNode.neighbors.forEach((neighbor) => {
    if (neighbor.roomType === null && neighbor.id !== 1) {
      neighbor.roomType = 'minion';
    }
  });
}

// Function to assign the goal room
function assignGoalRoom(bossRoomNode) {
  const goalRoomNode = bossRoomNode.neighbors.find(
    (neighbor) => neighbor.isLeaf && neighbor.roomType === null,
  );

  if (goalRoomNode) {
    goalRoomNode.roomType = 'goal';
    return goalRoomNode;
  } else {
    // If no suitable goal room, the boss room also serves as the goal room
    bossRoomNode.roomType = 'boss-and-goal';
    return bossRoomNode;
  }
}

// Function to assign a secondary faction encounter room
function assignSecondaryFaction(roomMap) {
  const totalRooms = roomMap.size;

  if (totalRooms > 10) {
    const unassignedRooms = Array.from(roomMap.values()).filter(
      (node) => node.roomType === null && node.id !== 1,
    );

    if (unassignedRooms.length > 0) {
      // Choose a room far from the entrance but not the boss room
      unassignedRooms.sort(
        (a, b) => b.distanceFromEntrance - a.distanceFromEntrance,
      );
      const secondaryFactionRoom = unassignedRooms[0];
      secondaryFactionRoom.roomType = 'secondary-faction';
      return secondaryFactionRoom;
    }
  }

  return null;
}

// Function to find the shortest path between two nodes using BFS
function findShortestPath(roomMap, startId, endId) {
  const startNode = roomMap.get(startId);
  const endNode = roomMap.get(endId);

  const visited = new Set();
  const queue = [[startNode]];
  visited.add(startNode);

  while (queue.length > 0) {
    const path = queue.shift();
    const currentNode = path[path.length - 1];

    if (currentNode === endNode) {
      return path;
    }

    currentNode.neighbors.forEach((neighbor) => {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        const newPath = [...path, neighbor];
        queue.push(newPath);
      }
    });
  }

  return null; // No path found
}

// Function to assign a setback room along the path to the boss room
function assignSetbackRoom(roomMap, bossRoomNode) {
  const pathToBoss = findShortestPath(roomMap, 1, bossRoomNode.id);

  if (pathToBoss) {
    // Exclude the entrance and the boss room
    const candidateRooms = pathToBoss.filter(
      (node) =>
        node.id !== 1 && node.id !== bossRoomNode.id && node.roomType === null,
    );

    if (candidateRooms.length > 0) {
      const setbackRoom = candidateRooms[Math.floor(candidateRooms.length / 2)]; // Pick a room in the middle
      setbackRoom.roomType = 'setback';
      return setbackRoom;
    }
  }

  return null;
}

// Function to place keys in rooms for locked doors leading to significant areas
function placeKeys(roomMap) {
  roomMap.forEach((node) => {
    const doorways = getAllDoorways(node.room);
    doorways.forEach((doorway) => {
      if (doorway.type === 'locked-door') {
        const connectedNode = roomMap.get(doorway.connectedRoomId);

        if (
          connectedNode &&
          (connectedNode.roomType === 'boss' ||
            connectedNode.roomType === 'goal' ||
            connectedNode.roomType === 'boss-and-goal')
        ) {
          // Find a room to place the key
          const candidateRooms = Array.from(roomMap.values()).filter(
            (n) => n.roomType === null && n.id !== node.id,
          );

          if (candidateRooms.length > 0) {
            // Choose a room farthest from the locked door
            candidateRooms.sort(
              (a, b) => b.distanceFromEntrance - a.distanceFromEntrance,
            );
            const keyRoom = candidateRooms[0];
            keyRoom.containsKey = true;
          }
        }
      }
    });
  });
}

// Function to handle locked leaf rooms
function handleLockedLeafRooms(roomMap) {
  roomMap.forEach((node) => {
    if (node.isLeaf && node.roomType === null) {
      const doorways = getAllDoorways(node.room);
      const hasLockedDoor = doorways.some(
        (doorway) => doorway.type === 'locked-door',
      );

      if (hasLockedDoor) {
        // Decide whether to place the key in the same room or make it pickable
        // For simplicity, we'll make it pickable
        node.room.isPickable = true;
      }
    }
  });
}

// Helper function to get all doorways of a room, including merged sections
function getAllDoorways(room) {
  let doorways = [];
  if (room.type === 'merged' && room.sections) {
    room.sections.forEach((section) => {
      if (section.doorways) {
        doorways = doorways.concat(section.doorways);
      }
    });
  } else {
    doorways = room.doorways || [];
  }
  return doorways;
}

// Main function to create dungeon details
export function createDungeonDetails(rooms) {
  const roomMap = buildDungeonGraph(rooms);
  calculateDistances(roomMap);
  identifyLeafNodes(roomMap);

  const bossRoomNode = assignBossRoom(roomMap);
  assignMinionRooms(bossRoomNode);
  assignGoalRoom(bossRoomNode);
  assignSecondaryFaction(roomMap);
  assignSetbackRoom(roomMap, bossRoomNode);
  placeKeys(roomMap);
  handleLockedLeafRooms(roomMap);

  // Update room data with metadata
  const updatedRooms = [];
  roomMap.forEach((node) => {
    node.room.roomType = node.roomType;
    node.room.containsKey = node.containsKey;
    node.room.faction = node.faction;
    node.room.distanceFromEntrance = node.distanceFromEntrance;
    node.room.isLeaf = node.isLeaf;
    node.room.isPickable = node.room.isPickable || false;
    updatedRooms.push(node.room);
  });

  return updatedRooms;
}
