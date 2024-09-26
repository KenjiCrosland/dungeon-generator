// dungeonProcessor.mjs

/**
 * Processes the dungeon rooms array, adding keys or clues for locked and secret doors,
 * and returns the flattened array with added metadata.
 *
 * @param {Array} rooms - The array of dungeon rooms.
 * @returns {Array} - The processed and flattened array of dungeon rooms.
 */
export function addDungeonDetails(rooms) {
  // Create a map of rooms by their IDs for easy access
  const roomMap = new Map();
  rooms.forEach((room) => {
    roomMap.set(room.id, room);
  });

  // Build the dungeon tree
  const root = buildTree(roomMap, 1);

  // Add keys or clues based on the rules
  addKeysAndClues(root, roomMap);

  // Flatten the tree back into an array
  const flattenedRooms = [];
  flattenTree(root, flattenedRooms);

  return flattenedRooms;
}

/**
 * Recursively builds the dungeon tree starting from the given room ID.
 *
 * @param {Map} roomMap - Map of room IDs to room objects.
 * @param {number} roomId - The current room ID.
 * @param {Set} visited - Set of visited room IDs to prevent cycles.
 * @returns {Object} - The tree node representing the room.
 */
function buildTree(roomMap, roomId, visited = new Set()) {
  const room = roomMap.get(roomId);
  if (!room || visited.has(roomId)) return null;

  visited.add(roomId);

  // Clone the room to avoid mutating the original data
  const node = { ...room, children: [] };

  // Handle merged rooms
  if (room.type === 'merged' && room.sections) {
    node.sections = room.sections.map((section) => {
      const sectionNode = { ...section, children: [] };
      section.doorways.forEach((doorway) => {
        if (!doorway.fromParent) {
          const childNode = buildTree(
            roomMap,
            doorway.connectedRoomId,
            visited,
          );
          if (childNode) {
            sectionNode.children.push(childNode);
          }
        }
      });
      return sectionNode;
    });
  }

  // Process doorways
  room.doorways.forEach((doorway) => {
    if (!doorway.fromParent) {
      const childNode = buildTree(roomMap, doorway.connectedRoomId, visited);
      if (childNode) {
        node.children.push(childNode);
      }
    }
  });

  return node;
}

/**
 * Adds keys or clues to the tree nodes based on the provided rules.
 *
 * @param {Object} node - The current tree node.
 * @param {Map} roomMap - Map of room IDs to room objects.
 * @param {Set} processed - Set of processed room IDs to prevent reprocessing.
 */
function addKeysAndClues(node, roomMap, processed = new Set()) {
  if (!node || processed.has(node.id)) return;

  processed.add(node.id);

  node.doorways.forEach((doorway) => {
    if (doorway.type === 'locked-door' || doorway.type === 'secret') {
      const behindRooms = getRoomsBehindDoor(
        doorway.connectedRoomId,
        node.id,
        roomMap,
      );

      if (behindRooms.size === 1) {
        // Single room behind the door
        doorway.pickable = true;
        const connectedRoom = roomMap.get(doorway.connectedRoomId);
        connectedRoom.hasKey = true;
      } else {
        // Multiple rooms behind the door
        doorway.requiresKey = true;
        const keyRoom = findKeyRoom(node, 2, roomMap, new Set());
        if (keyRoom) {
          keyRoom.hasKey = true;
        }
      }
    }
  });

  // Recursively process children
  node.children.forEach((child) => {
    addKeysAndClues(child, roomMap, processed);
  });

  // Handle merged room sections
  if (node.sections) {
    node.sections.forEach((section) => {
      section.doorways.forEach((doorway) => {
        if (!doorway.fromParent) {
          addKeysAndClues(section, roomMap, processed);
        }
      });
    });
  }
}

/**
 * Gets all rooms behind a locked or secret door.
 *
 * @param {number} startId - Starting room ID.
 * @param {number} excludeId - Room ID to exclude (the parent room).
 * @param {Map} roomMap - Map of room IDs to room objects.
 * @param {Set} visited - Set of visited room IDs.
 * @returns {Set} - Set of room IDs behind the door.
 */
function getRoomsBehindDoor(startId, excludeId, roomMap, visited = new Set()) {
  if (visited.has(startId)) return visited;
  visited.add(startId);

  const room = roomMap.get(startId);
  if (!room) return visited;

  room.doorways.forEach((doorway) => {
    if (doorway.connectedRoomId !== excludeId) {
      getRoomsBehindDoor(doorway.connectedRoomId, excludeId, roomMap, visited);
    }
  });

  return visited;
}

/**
 * Finds a suitable room to place a key, at least minDepth rooms away.
 *
 * @param {Object} node - The current tree node.
 * @param {number} minDepth - Minimum depth required.
 * @param {Map} roomMap - Map of room IDs to room objects.
 * @param {Set} visited - Set of visited room IDs.
 * @param {number} depth - Current depth in the tree.
 * @returns {Object|null} - The room node where the key can be placed.
 */
function findKeyRoom(node, minDepth, roomMap, visited, depth = 0) {
  if (visited.has(node.id)) return null;
  visited.add(node.id);

  if (depth >= minDepth && node.children.length === 0) {
    // Leaf node at required depth
    return node;
  }

  for (const child of node.children) {
    const result = findKeyRoom(child, minDepth, roomMap, visited, depth + 1);
    if (result) return result;
  }

  return null;
}

/**
 * Flattens the tree back into an array.
 *
 * @param {Object} node - The current tree node.
 * @param {Array} result - The array to collect the rooms.
 * @param {Set} visited - Set of visited room IDs.
 */
function flattenTree(node, result, visited = new Set()) {
  if (!node || visited.has(node.id)) return;

  visited.add(node.id);
  result.push(node);

  // Flatten merged sections if any
  if (node.sections) {
    node.sections.forEach((section) => {
      flattenTree(section, result, visited);
    });
  }

  // Flatten child nodes
  node.children.forEach((child) => {
    flattenTree(child, result, visited);
  });
}
