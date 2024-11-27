export function addDungeonDetails(dungeonData) {
  // Extract the rooms array
  const roomsArray = dungeonData.rooms || dungeonData;

  // Helper functions

  function buildRoomMap(roomsArray) {
    let rooms = {};
    roomsArray.forEach((room) => {
      rooms[room.id] = room;
    });
    return rooms;
  }

  function buildGraph(roomsArray) {
    let graph = {};
    roomsArray.forEach((room) => {
      let roomId = room.id;
      if (!graph[roomId]) graph[roomId] = [];
      room.doorways.forEach((doorway) => {
        let connectedRoomId = doorway.connectedRoomId;
        if (!graph[connectedRoomId]) graph[connectedRoomId] = [];
        // Add edge from roomId to connectedRoomId
        graph[roomId].push({
          from: roomId,
          to: connectedRoomId,
          type: doorway.type,
          doorway: doorway,
        });
        // Add edge from connectedRoomId to roomId
        graph[connectedRoomId].push({
          from: connectedRoomId,
          to: roomId,
          type: doorway.type,
          doorway: doorway,
        });
      });
    });
    return graph;
  }

  function collectLockedDoors(roomsArray) {
    let lockedDoors = [];
    roomsArray.forEach((room) => {
      let roomId = room.id;
      room.doorways.forEach((doorway) => {
        if (
          !doorway.fromParent &&
          (doorway.type === 'locked-door' || doorway.type === 'secret')
        ) {
          let connectedRoomId = doorway.connectedRoomId;
          lockedDoors.push({
            from: roomId,
            to: connectedRoomId,
            type: doorway.type,
            doorway: doorway,
            room: room,
          });
        }
      });
    });
    return lockedDoors;
  }

  function countReachableRooms(startRoomId, excludeRoomId, graph) {
    let visited = new Set();
    function dfs(roomId) {
      if (visited.has(roomId)) return;
      visited.add(roomId);
      graph[roomId].forEach((edge) => {
        if (
          edge.to !== excludeRoomId &&
          edge.type !== 'locked-door' &&
          edge.type !== 'secret'
        ) {
          dfs(edge.to);
        }
      });
    }
    dfs(startRoomId);
    return visited.size;
  }

  function identifyMainLockedDoor(lockedDoors, graph) {
    let mainLockedDoor = null;
    let maxRoomsBeyond = 0;

    lockedDoors.forEach((lockedDoor) => {
      let roomsBeyond = countReachableRooms(
        lockedDoor.to,
        lockedDoor.from,
        graph,
      );
      if (roomsBeyond > 1) {
        if (roomsBeyond > maxRoomsBeyond) {
          maxRoomsBeyond = roomsBeyond;
          mainLockedDoor = lockedDoor;
        }
      }
    });

    // If no main locked door found, return null
    if (!mainLockedDoor) {
      return null;
    }

    return mainLockedDoor;
  }

  function assignBossRoom(bossRoomId, rooms) {
    if (bossRoomId !== null && rooms[bossRoomId]) {
      rooms[bossRoomId].roomType = 'boss';
    }
  }

  function parseRoomSize(shortDescription) {
    if (!shortDescription) return null;

    const sizeRegex = /(small|medium|large)(?:-sized)? room/i;
    const match = shortDescription.match(sizeRegex);
    if (match) {
      return match[1].toLowerCase();
    }
    return null;
  }

  /**
   * Assigns room types to each room in the dungeon based on the dungeon's structure.
   *
   * @param {Array} roomsArray - The rooms array.
   * @param {number} entranceRoomId - The ID of the entrance room.
   * @param {Object} graph - The dungeon graph.
   * @param {Object} rooms - The map of rooms.
   */
  function assignRoomTypes(roomsArray, entranceRoomId, graph, rooms) {
    // Reset room types only if not already assigned
    roomsArray.forEach((room) => {
      if (!room.roomType) {
        room.roomType = null;
      }
      room.size = parseRoomSize(room.shortDescription);
    });

    // Assign entrance room
    rooms[entranceRoomId].roomType = 'entrance';

    // Assign 'secret' rooms (rooms with only one secret doorway)
    roomsArray.forEach((room) => {
      const numConnections = room.doorways.length;
      if (numConnections === 1 && room.doorways[0].type === 'secret') {
        room.roomType = 'secret';
      }
    });

    // Assign 'locked' rooms (rooms with only one locked doorway)
    roomsArray.forEach((room) => {
      const numConnections = room.doorways.length;
      if (numConnections === 1 && room.doorways[0].type === 'locked-door') {
        room.roomType = 'locked';
      }
    });

    // Assign 'connecting' rooms (rooms with 3 or more connections)
    roomsArray.forEach((room) => {
      if (!room.roomType && room.doorways.length >= 3) {
        room.roomType = 'connecting';
      }
    });

    // Now assign room types for the rest
    roomsArray.forEach((room) => {
      if (room.roomType) return; // Skip already assigned rooms

      const numConnections = room.doorways.length;
      const roomSize = room.size;

      // Determine adjacent room types
      let adjacentRoomTypes = new Set();
      graph[room.id].forEach((edge) => {
        let adjacentRoom = rooms[edge.to];
        if (adjacentRoom.roomType) {
          adjacentRoomTypes.add(adjacentRoom.roomType);
        }
      });

      // Initialize probabilities
      let purposeProb = 0.3;
      let livingProb = 0.3;
      let connectingProb = 0;
      let setbackProb = 0.05;

      // Adjust probabilities based on adjacency
      if (adjacentRoomTypes.has('purpose')) {
        purposeProb += 0.2;
      }
      if (adjacentRoomTypes.has('living')) {
        livingProb += 0.2;
      }
      if (adjacentRoomTypes.has('connecting')) {
        connectingProb += 0.1;
      }

      // Adjust probabilities based on room characteristics
      if (roomSize === 'large') {
        purposeProb += 0.1;
      }
      if (numConnections === 1) {
        livingProb += 0.1;
      }

      // Normalize probabilities
      const totalProb = purposeProb + livingProb + setbackProb;
      purposeProb /= totalProb;
      livingProb /= totalProb;
      setbackProb /= totalProb;

      // Randomly assign room type based on adjusted probabilities
      const rand = Math.random();

      if (rand < purposeProb) {
        room.roomType = 'purpose';
      } else if (rand < purposeProb + livingProb) {
        room.roomType = 'living';
      } else {
        room.roomType = 'purpose'; // Default to 'purpose' if other probabilities are low
      }
    });
  }

  function findShortestPath(graph, startRoomId, endRoomId) {
    let queue = [];
    let visited = new Set();
    let predecessor = {};
    queue.push(startRoomId);
    visited.add(startRoomId);

    while (queue.length > 0) {
      let currentRoomId = queue.shift();
      if (currentRoomId === endRoomId) {
        // Reconstruct path
        let path = [];
        let roomId = endRoomId;
        while (roomId !== undefined) {
          path.push(roomId);
          roomId = predecessor[roomId];
        }
        return path.reverse();
      }

      graph[currentRoomId].forEach((edge) => {
        if (!visited.has(edge.to)) {
          visited.add(edge.to);
          predecessor[edge.to] = currentRoomId;
          queue.push(edge.to);
        }
      });
    }
    return null; // No path found
  }

  // Modified function to prioritize traversal through unlocked doors
  function collectRoomsBeyond(
    startRoomId,
    excludeRoomId,
    graph,
    mainLockedDoor,
  ) {
    let visited = new Set();
    let queue = [];
    visited.add(startRoomId);
    queue.push(startRoomId);

    while (queue.length > 0) {
      let roomId = queue.shift();
      let edges = graph[roomId];

      edges.forEach((edge) => {
        if (
          edge.to !== excludeRoomId &&
          !visited.has(edge.to) &&
          edge.type !== 'locked-door' &&
          edge.type !== 'secret'
        ) {
          // Skip traversal through the main locked door
          if (
            mainLockedDoor &&
            ((edge.from === mainLockedDoor.from &&
              edge.to === mainLockedDoor.to) ||
              (edge.from === mainLockedDoor.to &&
                edge.to === mainLockedDoor.from))
          ) {
            return;
          }
          visited.add(edge.to);
          queue.push(edge.to);
        }
      });
    }

    return visited;
  }

  function findFurthestLeafNode(
    startRoomId,
    excludedRooms,
    graph,
    mainLockedDoor,
  ) {
    let queue = [];
    let visited = new Set();
    queue.push({ roomId: startRoomId, path: [startRoomId] });
    visited.add(startRoomId);
    let furthestLeafRoomId = null;
    let maxPathLength = 0;

    while (queue.length > 0) {
      let { roomId, path } = queue.shift();
      let isLeaf = true;

      let edges = graph[roomId];

      edges.forEach((edge) => {
        if (
          !excludedRooms.has(edge.to) &&
          !visited.has(edge.to) &&
          edge.type !== 'locked-door' &&
          edge.type !== 'secret'
        ) {
          // Skip traversal through the main locked door
          if (
            mainLockedDoor &&
            ((edge.from === mainLockedDoor.from &&
              edge.to === mainLockedDoor.to) ||
              (edge.from === mainLockedDoor.to &&
                edge.to === mainLockedDoor.from))
          ) {
            return;
          }
          isLeaf = false;
          visited.add(edge.to);
          queue.push({ roomId: edge.to, path: [...path, edge.to] });
        }
      });

      if (isLeaf && path.length >= maxPathLength && roomId !== startRoomId) {
        maxPathLength = path.length;
        furthestLeafRoomId = roomId;
      }
    }

    return furthestLeafRoomId;
  }

  // Start of main function
  let rooms = buildRoomMap(roomsArray);
  let graph = buildGraph(roomsArray);
  let lockedDoors = collectLockedDoors(roomsArray);
  let mainLockedDoor = identifyMainLockedDoor(lockedDoors, graph);

  let entranceRoomId = roomsArray[0].id; // Assuming the first room is the entrance

  if (mainLockedDoor) {
    // Add requiresKey and hasKeyInRoomId to the room with the locked door
    let roomWithLockedDoor = rooms[mainLockedDoor.from];
    roomWithLockedDoor.requiresKey = true;
    roomWithLockedDoor.hasKeyInRoomId = null; // Will be set later

    // Mark the specific doorway that requires the key
    mainLockedDoor.doorway.requiresKey = true;

    // Optionally, add keyDoor information to the room
    roomWithLockedDoor.keyDoor = {
      side: mainLockedDoor.doorway.side,
      position: mainLockedDoor.doorway.position,
    };

    // Get rooms beyond the locked door, prioritizing unlocked paths
    let roomsBeyondLockedDoor = collectRoomsBeyond(
      mainLockedDoor.to,
      mainLockedDoor.from,
      graph,
      mainLockedDoor,
    );

    // Find the furthest leaf node in a different direction for the key
    let roomWithKeyId = findFurthestLeafNode(
      entranceRoomId,
      roomsBeyondLockedDoor,
      graph,
      mainLockedDoor,
    );

    // Modify this part to handle the case when no suitable room is found
    if (roomWithKeyId && roomWithKeyId !== entranceRoomId) {
      // Update the room with the key
      let roomWithKey = rooms[roomWithKeyId];
      roomWithKey.hasKeyForRoomId = roomWithLockedDoor.id;

      // Update the room with the locked door
      roomWithLockedDoor.hasKeyInRoomId = roomWithKeyId;

      // Assign the boss room, prioritizing unlocked paths
      let bossRoomId = findFurthestLeafNode(
        mainLockedDoor.to,
        new Set([mainLockedDoor.from]),
        graph,
        null, // No need to exclude doors here
      );
      assignBossRoom(bossRoomId, rooms);

      // Assign setback room on the path from entrance to key room
      let pathToKeyRoom = findShortestPath(
        graph,
        entranceRoomId,
        roomWithKeyId,
      );
      assignSetbackRoom(pathToKeyRoom, rooms);
    } else {
      // No suitable room found for the key; skip key and obstacle assignment
      // Reset the requiresKey and hasKeyInRoomId properties
      delete roomWithLockedDoor.requiresKey;
      delete roomWithLockedDoor.hasKeyInRoomId;
      delete mainLockedDoor.doorway.requiresKey;
      delete roomWithLockedDoor.keyDoor;

      // Assign the boss room without considering the locked door
      let bossRoomId = findFurthestLeafNode(
        entranceRoomId,
        new Set(),
        graph,
        null,
      );
      assignBossRoom(bossRoomId, rooms);

      // Assign setback room on the path from entrance to boss room
      let pathToBossRoom = findShortestPath(graph, entranceRoomId, bossRoomId);
      assignSetbackRoom(pathToBossRoom, rooms);
    }
  } else {
    // No main locked door, so assign bossRoom to furthest node from entrance

    // Find the furthest room from the entrance
    let bossRoomId = findFurthestLeafNode(
      entranceRoomId,
      new Set(),
      graph,
      null,
    );

    // Assign bossRoom: true
    assignBossRoom(bossRoomId, rooms);

    // Assign setback room on the path from entrance to boss room
    let pathToBossRoom = findShortestPath(graph, entranceRoomId, bossRoomId);
    assignSetbackRoom(pathToBossRoom, rooms);
  }

  // Assign room types
  assignRoomTypes(roomsArray, entranceRoomId, graph, rooms);

  // Return the modified dungeon data
  if (dungeonData.rooms) {
    dungeonData.rooms = roomsArray;
    return dungeonData;
  } else {
    return roomsArray;
  }
}

// Helper function to assign setback room
function assignSetbackRoom(path, rooms) {
  if (!path || path.length < 3) return; // Not enough rooms to assign a setback room

  // Exclude entrance, key room, and boss room
  let potentialSetbackRooms = path.slice(1, -1);

  // Select the middle room for consistency
  let setbackRoomId =
    potentialSetbackRooms[Math.floor(potentialSetbackRooms.length / 2)];

  if (rooms[setbackRoomId]) {
    rooms[setbackRoomId].roomType = 'setback';
  }
}
