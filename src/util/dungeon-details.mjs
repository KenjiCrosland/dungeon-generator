export function addDungeonDetails(dungeonData) {
  // Helper functions

  function buildRoomMap(dungeonData) {
    let rooms = {};
    dungeonData.forEach((room) => {
      rooms[room.id] = room;
    });
    return rooms;
  }

  function buildGraph(dungeonData) {
    let graph = {};
    dungeonData.forEach((room) => {
      let roomId = room.id;
      if (!graph[roomId]) graph[roomId] = [];
      room.doorways.forEach((doorway) => {
        let connectedRoomId = doorway.connectedRoomId;
        if (!graph[connectedRoomId]) graph[connectedRoomId] = [];
        // Add edge from roomId to connectedRoomId
        graph[roomId].push({
          to: connectedRoomId,
          type: doorway.type,
          doorway: doorway,
        });
        // Add edge from connectedRoomId to roomId if not already added
        if (!graph[connectedRoomId].some((edge) => edge.to === roomId)) {
          graph[connectedRoomId].push({
            to: roomId,
            type: doorway.type,
            doorway: doorway,
          });
        }
      });
    });
    return graph;
  }

  function collectLockedDoors(dungeonData) {
    let lockedDoors = [];
    dungeonData.forEach((room) => {
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
      rooms[bossRoomId].bossRoom = true;
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

  function assignRoomTypes(dungeonData, entranceRoomId, graph) {
    let guardRoomCount = 0;
    let storageRoomCount = 0;

    // Set maximum guard and storage rooms based on total rooms
    const totalRooms = dungeonData.length;
    const maxGuardRooms = totalRooms >= 15 ? 2 : 1;
    const maxStorageRooms = totalRooms >= 15 ? 2 : 1;

    // First, mark the special rooms
    dungeonData.forEach((room) => {
      // Assign entrance room
      if (room.id === entranceRoomId) {
        room.roomType = 'entrance';
      }
      // Assign boss room, key room, and setback room as purpose rooms
      else if (room.bossRoom || room.hasKeyForRoomId || room.setbackRoom) {
        room.roomType = 'purpose';
      }

      // Parse and add room size to the room object
      room.size = parseRoomSize(room.shortDescription);
    });

    // Ensure no purpose room connects directly to the entrance
    graph[entranceRoomId].forEach((edge) => {
      let connectedRoom = rooms[edge.to];
      if (connectedRoom.roomType === 'purpose') {
        connectedRoom.roomType = null; // Reset to be reassigned
      }
    });

    // Now, assign room types for the rest
    dungeonData.forEach((room) => {
      // Skip rooms that already have a roomType
      if (room.roomType) {
        return;
      }

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

      // Decide whether to assign it as a purpose room
      let purposeClusterSize = 0;
      let livingClusterSize = 0;

      adjacentRoomTypes.forEach((type) => {
        if (type === 'purpose') {
          purposeClusterSize++;
        }
        if (type === 'living') {
          livingClusterSize++;
        }
      });

      // Adjust chance based on cluster sizes
      let purposeChance = 0.2;
      let livingChance = 0.5;

      if (purposeClusterSize === 1) {
        purposeChance = 0.6;
      } else if (purposeClusterSize >= 2) {
        purposeChance = 0.2;
      }

      if (livingClusterSize === 1) {
        livingChance = 0.8;
      } else if (livingClusterSize >= 2) {
        livingChance = 0.3;
      }

      // Ensure the room does not connect directly to the entrance if it's a purpose room
      let connectsToEntrance = graph[room.id].some(
        (edge) => edge.to === entranceRoomId,
      );

      // Start assigning room types based on updated logic
      if (!connectsToEntrance && Math.random() < purposeChance) {
        room.roomType = 'purpose';
      } else if (Math.random() < livingChance) {
        room.roomType = 'living';
      } else if (
        numConnections <= 2 &&
        guardRoomCount < maxGuardRooms &&
        Math.random() < 0.3
      ) {
        room.roomType = 'guard';
        guardRoomCount++;
      } else if (
        numConnections === 1 &&
        storageRoomCount < maxStorageRooms &&
        roomSize === 'small' && // Only assign storage rooms to small rooms
        Math.random() < 0.5
      ) {
        room.roomType = 'storage';
        storageRoomCount++;
      } else if (numConnections >= 3) {
        // Assign connecting room only if the room has 3 or more connections
        room.roomType = 'connecting';
      } else {
        // Assign as 'misc' for rooms with 1 or 2 connections not assigned above
        room.roomType = 'misc';
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
    rooms,
    keyDoorRoomId,
  ) {
    let visited = new Set();
    let queue = [];
    visited.add(startRoomId);
    queue.push(startRoomId);

    while (queue.length > 0) {
      let roomId = queue.shift();
      let edges = graph[roomId];

      let unlockedEdges = [];
      let lockedEdges = [];

      edges.forEach((edge) => {
        if (edge.to !== excludeRoomId && !visited.has(edge.to)) {
          // Skip traversal through the door that requires the key we're assigning
          if (
            edge.type === 'locked-door' &&
            ((rooms[edge.to].requiresKey &&
              rooms[edge.to].hasKeyInRoomId === keyDoorRoomId) ||
              (edge.doorway &&
                edge.doorway.requiresKey &&
                edge.to === keyDoorRoomId))
          ) {
            return;
          }
          if (edge.type === 'locked-door' || edge.type === 'secret') {
            lockedEdges.push(edge);
          } else {
            unlockedEdges.push(edge);
          }
        }
      });

      // First, process unlocked edges
      unlockedEdges.forEach((edge) => {
        visited.add(edge.to);
        queue.push(edge.to);
      });

      // Then, process locked edges
      lockedEdges.forEach((edge) => {
        visited.add(edge.to);
        queue.push(edge.to);
      });
    }

    return visited;
  }

  function findFurthestLeafNode(
    startRoomId,
    excludedRooms,
    graph,
    rooms,
    keyDoorRoomId,
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

      // Get edges and sort them to prioritize unlocked doors
      let edges = graph[roomId];

      let unlockedEdges = [];
      let lockedEdges = [];

      edges.forEach((edge) => {
        if (!excludedRooms.has(edge.to) && !visited.has(edge.to)) {
          // Skip traversal through the door that requires the key we're assigning
          if (
            edge.type === 'locked-door' &&
            ((rooms[edge.to].requiresKey &&
              rooms[edge.to].hasKeyInRoomId === keyDoorRoomId) ||
              (edge.doorway &&
                edge.doorway.requiresKey &&
                edge.to === keyDoorRoomId))
          ) {
            return;
          }
          if (edge.type === 'locked-door' || edge.type === 'secret') {
            lockedEdges.push(edge);
          } else {
            unlockedEdges.push(edge);
          }
        }
      });

      // First, process unlocked edges
      unlockedEdges.forEach((edge) => {
        isLeaf = false;
        visited.add(edge.to);
        queue.push({ roomId: edge.to, path: [...path, edge.to] });
      });

      // Then, process locked edges
      lockedEdges.forEach((edge) => {
        isLeaf = false;
        visited.add(edge.to);
        queue.push({ roomId: edge.to, path: [...path, edge.to] });
      });

      if (isLeaf && path.length >= maxPathLength && roomId !== startRoomId) {
        maxPathLength = path.length;
        furthestLeafRoomId = roomId;
      }
    }

    return furthestLeafRoomId;
  }

  // Start of main function
  let rooms = buildRoomMap(dungeonData);
  let graph = buildGraph(dungeonData);
  let lockedDoors = collectLockedDoors(dungeonData);
  let mainLockedDoor = identifyMainLockedDoor(lockedDoors, graph);

  let entranceRoomId = dungeonData[0].id; // Assuming the first room is the entrance

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
      rooms,
      roomWithLockedDoor.id,
    );

    // Find the furthest leaf node in a different direction for the key
    let roomWithKeyId = findFurthestLeafNode(
      entranceRoomId,
      roomsBeyondLockedDoor,
      graph,
      rooms,
      roomWithLockedDoor.id,
    );

    if (!roomWithKeyId) {
      // Handle the case where no suitable room is found
      roomWithKeyId = entranceRoomId;
    }

    // Update the room with the key
    let roomWithKey = rooms[roomWithKeyId];
    roomWithKey.hasKeyForRoomId = roomWithLockedDoor.id;

    // Update the room with the locked door
    roomWithLockedDoor.hasKeyInRoomId = roomWithKeyId;

    // Update other locked/secret doors
    lockedDoors.forEach((lockedDoor) => {
      if (lockedDoor !== mainLockedDoor) {
        // Add pickable or hasClueInRoom
        lockedDoor.doorway.pickable = true;
      }
    });

    // Assign the boss room, prioritizing unlocked paths
    let bossRoomId = findFurthestLeafNode(
      mainLockedDoor.to,
      new Set([mainLockedDoor.from]),
      graph,
      rooms,
      null, // No need to exclude doors here
    );
    assignBossRoom(bossRoomId, rooms);

    // Assign setback room on the path from entrance to key room
    let pathToKeyRoom = findShortestPath(graph, entranceRoomId, roomWithKeyId);
    assignSetbackRoom(pathToKeyRoom, rooms);
  } else {
    // No main locked door, so assign bossRoom to furthest node from entrance

    // Find the furthest room from the entrance
    let bossRoomId = findFurthestLeafNode(
      entranceRoomId,
      new Set(),
      graph,
      rooms,
      null,
    );

    // Assign bossRoom: true
    assignBossRoom(bossRoomId, rooms);

    // Assign setback room on the path from entrance to boss room
    let pathToBossRoom = findShortestPath(graph, entranceRoomId, bossRoomId);
    assignSetbackRoom(pathToBossRoom, rooms);
  }

  // Assign room types
  assignRoomTypes(dungeonData, entranceRoomId, graph);

  // Return the modified dungeon data
  return dungeonData;
}

// Helper function to assign setback room
function assignSetbackRoom(path, rooms) {
  if (!path || path.length < 3) return; // Not enough rooms to assign a setback room

  // Exclude entrance, key room, and boss room
  let potentialSetbackRooms = path.slice(1, -1);

  // Select the middle room for consistency
  let setbackRoomId =
    potentialSetbackRooms[Math.floor(potentialSetbackRooms.length / 2)];

  rooms[setbackRoomId].setbackRoom = true;
}
