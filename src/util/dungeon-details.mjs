export function addDungeonDetails(dungeonData) {
  // Create a map of rooms by ID for easy access
  let rooms = {};
  dungeonData.forEach((room) => {
    rooms[room.id] = room;
  });

  // Build the graph
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

  // Collect locked or secret doors
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

  // Identify the main locked door that blocks off additional rooms
  let mainLockedDoor = null;
  let maxRoomsBeyond = 0;

  function countReachableRooms(startRoomId, excludeRoomId) {
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

  lockedDoors.forEach((lockedDoor) => {
    let roomsBeyond = countReachableRooms(lockedDoor.to, lockedDoor.from);
    if (roomsBeyond > 1) {
      // This locked door blocks off several more rooms
      if (roomsBeyond > maxRoomsBeyond) {
        maxRoomsBeyond = roomsBeyond;
        mainLockedDoor = lockedDoor;
      }
    }
  });

  // If no main locked door found, pick any locked door
  if (!mainLockedDoor && lockedDoors.length > 0) {
    mainLockedDoor = lockedDoors[0];
  }

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

    // Get rooms beyond the locked door
    let roomsBeyondLockedDoor = new Set();
    function collectRoomsBeyond(roomId, excludeRoomId) {
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
      dfs(roomId);
      return visited;
    }
    roomsBeyondLockedDoor = collectRoomsBeyond(
      mainLockedDoor.to,
      mainLockedDoor.from,
    );

    // Find the furthest leaf node in a different direction
    function findFurthestLeafNode(startRoomId, excludedRooms) {
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

        if (isLeaf && path.length > maxPathLength) {
          maxPathLength = path.length;
          furthestLeafRoomId = roomId;
        }
      }
      return furthestLeafRoomId;
    }

    let furthestLeafRoomId = findFurthestLeafNode(
      mainLockedDoor.from,
      roomsBeyondLockedDoor,
    );

    // Update the room with the key
    let roomWithKey = rooms[furthestLeafRoomId];
    roomWithKey.hasKeyForRoomId = mainLockedDoor.from;

    // Update the room with the locked door
    roomWithLockedDoor.hasKeyInRoomId = furthestLeafRoomId;

    // Update other locked/secret doors
    lockedDoors.forEach((lockedDoor) => {
      if (lockedDoor !== mainLockedDoor) {
        // Add pickable or hasClueInRoom
        lockedDoor.doorway.pickable = true;
      }
    });
  }

  // Return the modified dungeon data
  return dungeonData;
}
