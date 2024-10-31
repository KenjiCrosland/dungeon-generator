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

  function collectRoomsBeyond(startRoomId, excludeRoomId, graph) {
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
    return visited;
  }

  function findFurthestLeafNode(startRoomId, excludedRooms, graph) {
    let queue = [];
    let visited = new Set();
    queue.push({ roomId: startRoomId, path: [startRoomId] });
    visited.add(startRoomId);
    let furthestLeafRoomId = startRoomId;
    let maxPathLength = 0;

    while (queue.length > 0) {
      let { roomId, path } = queue.shift();
      let isLeaf = true;

      graph[roomId].forEach((edge) => {
        if (
          !excludedRooms.has(edge.to) &&
          !visited.has(edge.to) &&
          edge.type !== 'locked-door' &&
          edge.type !== 'secret'
        ) {
          isLeaf = false;
          visited.add(edge.to);
          queue.push({ roomId: edge.to, path: [...path, edge.to] });
        }
      });

      if (isLeaf && path.length >= maxPathLength) {
        maxPathLength = path.length;
        furthestLeafRoomId = roomId;
      }
    }
    return furthestLeafRoomId;
  }

  function assignBossRoom(bossRoomId) {
    if (bossRoomId !== null && rooms[bossRoomId]) {
      rooms[bossRoomId].bossRoom = true;
    }
  }

  function findShortestPath(
    graph,
    startRoomId,
    endRoomId,
    excludedEdges = new Set(),
  ) {
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
        if (
          !visited.has(edge.to) &&
          !excludedEdges.has(`${currentRoomId}-${edge.to}`) &&
          edge.type !== 'locked-door' &&
          edge.type !== 'secret'
        ) {
          visited.add(edge.to);
          predecessor[edge.to] = currentRoomId;
          queue.push(edge.to);
        }
      });
    }
    return null; // No path found
  }

  function assignSetbackRoom(path) {
    if (!path || path.length < 3) return; // Not enough rooms to assign a setback room

    // Exclude entrance, key room, and boss room
    let potentialSetbackRooms = path.slice(1, -1);

    // Randomly select a room from potential setback rooms
    let setbackRoomId =
      potentialSetbackRooms[Math.floor(potentialSetbackRooms.length / 2)]; // Choose the middle room for consistency

    rooms[setbackRoomId].setbackRoom = true;
  }

  // Start of main function
  let rooms = buildRoomMap(dungeonData);
  let graph = buildGraph(dungeonData);
  let lockedDoors = collectLockedDoors(dungeonData);
  let mainLockedDoor = identifyMainLockedDoor(lockedDoors, graph);

  let entranceRoomId = dungeonData[0].id; // Assuming the first room is the entrance

  if (mainLockedDoor) {
    // Existing logic when there is an obstacle and key pair

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

    // Get rooms beyond the locked door
    let roomsBeyondLockedDoor = collectRoomsBeyond(
      mainLockedDoor.to,
      mainLockedDoor.from,
      graph,
    );

    // Find the furthest leaf node in a different direction for the key
    let roomWithKeyId = findFurthestLeafNode(
      mainLockedDoor.from,
      roomsBeyondLockedDoor,
      graph,
    );

    // Update the room with the key
    let roomWithKey = rooms[roomWithKeyId];
    roomWithKey.hasKeyForRoomId = mainLockedDoor.from;

    // Update the room with the locked door
    roomWithLockedDoor.hasKeyInRoomId = roomWithKeyId;

    // Update other locked/secret doors
    lockedDoors.forEach((lockedDoor) => {
      if (lockedDoor !== mainLockedDoor) {
        // Add pickable or hasClueInRoom
        lockedDoor.doorway.pickable = true;
      }
    });

    // Assign the boss room
    let bossRoomId = findFurthestLeafNode(
      mainLockedDoor.to,
      new Set([mainLockedDoor.from]),
      graph,
    );
    assignBossRoom(bossRoomId);

    // Assign setback room on the path from entrance to key room
    let pathToKeyRoom = findShortestPath(graph, entranceRoomId, roomWithKeyId);
    assignSetbackRoom(pathToKeyRoom);
  } else {
    // No main locked door, so assign bossRoom to furthest node from entrance

    // Find the furthest room from the entrance
    let bossRoomId = findFurthestLeafNode(entranceRoomId, new Set(), graph);

    // Assign bossRoom: true
    assignBossRoom(bossRoomId);

    // Assign setback room on the path from entrance to boss room
    let pathToBossRoom = findShortestPath(graph, entranceRoomId, bossRoomId);
    assignSetbackRoom(pathToBossRoom);
  }

  // Return the modified dungeon data
  return dungeonData;
}
