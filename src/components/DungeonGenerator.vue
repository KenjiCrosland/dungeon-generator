<template>
  <DungeonMap :rooms="flattenedRooms" @roomClicked="handleRoomClick" />
</template>

<script setup>
import { ref } from 'vue';
import DungeonMap from './DungeonMap.vue';
import { createRoomDescriptions } from '../util/create-room-descriptions.mjs';

const handleRoomClick = (roomId) => {
  console.log(`Room ${roomId} was clicked!`);
  console.log(roomDescriptions[roomId]);
  // You can add your custom logic here for when a room is clicked
};

// Function to check for overlapping rooms with a gap
function roomsOverlap(room1, room2) {
  const buffer = 1; // Gap of 1 tile between rooms

  // If rooms are connected via a 'merged' doorway, allow them to touch
  let isMerged = false;
  if (room1.doorways && room2.doorways) {
    room1.doorways.forEach(d1 => {
      if (d1.type === 'merged') {
        room2.doorways.forEach(d2 => {
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

// Global room ID counter
let nextRoomId = 1; // Reset the ID counter before generating the dungeon

function generateTree(room, existingRooms = [], depth = 0) {
  // Assign an ID to the current room if it doesn't have one
  if (!room.id) {
    room.id = nextRoomId++;
  }

  // Check if the room is already in existingRooms
  if (!existingRooms.some(r => r.id === room.id)) {
    existingRooms.push(room);
  } else {
    return; // Room already processed
  }

  if (depth > 3) {
    // Remove all doorways except the one leading back to the parent
    room.doorways = room.doorways.filter(d => d.fromParent);
    return;
  }

  const doorways = room.doorways || [];

  // Keep track of doorways that successfully led to child rooms
  const successfulDoorways = [];

  // Process doorways that are not marked as fromParent
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
    let gap = 1; // Default gap is 1 tile

    // If the connection is 'merged', set gap to 0
    if (doorway.type === 'merged') {
      gap = 0;
    }

    // Calculate the child room's position with gap
    let x = room.x;
    let y = room.y;

    if (parentDoorwaySide === 'top') {
      y = room.y - height - gap; // Place child room above with gap
      x = room.x + doorway.position - childDoorwayPosition;
    } else if (parentDoorwaySide === 'bottom') {
      y = room.y + room.height + gap; // Place child room below with gap
      x = room.x + doorway.position - childDoorwayPosition;
    } else if (parentDoorwaySide === 'left') {
      x = room.x - width - gap; // Place child room to the left with gap
      y = room.y + doorway.position - childDoorwayPosition;
    } else if (parentDoorwaySide === 'right') {
      x = room.x + room.width + gap; // Place child room to the right with gap
      y = room.y + doorway.position - childDoorwayPosition;
    }

    // Create doorways for the child room
    const childDoorways = [];

    // Assign the same type to the child doorway connecting back to the parent
    const parentDoorwayType = doorway.type;

    // Add the connecting doorway back to the parent and mark it appropriately
    childDoorways.push({
      side: oppositeSide,
      position: childDoorwayPosition,
      fromParent: true, // Mark to avoid processing it again
      type: parentDoorwayType, // Ensure the type is consistent
    });

    // For merged connections, both rooms need to know about the merged side
    if (parentDoorwayType === 'merged') {
      // Mark the sides as merged in both rooms
      doorway.merged = true; // In the parent room's doorway
      childDoorways[childDoorways.length - 1].merged = true; // In the child room's doorway
    }

    // Determine the number of additional doorways to add
    const minAdditionalDoorways = 0;
    const maxAdditionalDoorways = 2;
    const numAdditionalDoorways =
      Math.floor(Math.random() * (maxAdditionalDoorways - minAdditionalDoorways + 1)) + minAdditionalDoorways;

    // Get available sides excluding the one connected to the parent
    const availableSides = ['top', 'right', 'bottom', 'left'].filter(
      side => side !== oppositeSide
    );

    // Randomly select sides for additional doorways
    const sidesForDoorways = availableSides
      .sort(() => Math.random() - 0.5)
      .slice(0, numAdditionalDoorways);

    sidesForDoorways.forEach(side => {
      const maxPosition = side === 'top' || side === 'bottom' ? width - 2 : height - 2;
      if (maxPosition > 0) {
        const position = Math.floor(Math.random() * maxPosition) + 1;

        // Randomly assign a type ('door', 'locked-door', 'corridor', 'stairs', 'secret', or 'merged') based on weights
        const randomValue = Math.random();
        let type;

        if (randomValue < 0.3) {
          type = 'door'; // 30% chance for a regular door
        } else if (randomValue < 0.45) {
          type = 'locked-door'; // Next 15%
        } else if (randomValue < 0.7) {
          type = 'corridor'; // Next 25%
        } else if (randomValue < 0.85) {
          type = 'stairs'; // Next 15%
        } else if (randomValue < 0.95) {
          type = 'secret'; // Next 10% for secret doors
        } else {
          type = 'merged'; // Remaining 5%
        }

        const doorwayData = { side, position, type };

        if (type === 'stairs') {
          // Assign connectedRoomId for stairs to reference the parent room
          doorwayData.connectedRoomId = room.id;
        }

        childDoorways.push(doorwayData);
      }
    });

    // Create the new room without assigning an ID yet
    const newRoom = {
      x,
      y,
      width,
      height,
      doorways: childDoorways,
    };

    // Check for overlap with existing rooms
    const overlaps = existingRooms.some(existingRoom => roomsOverlap(existingRoom, newRoom));

    if (!overlaps) {
      // Now assign an ID to the new room
      newRoom.id = nextRoomId++;

      // Proceed to generate child rooms
      generateTree(newRoom, existingRooms, depth + 1);

      // If the child room has at least one doorway (besides the one back to parent), keep the doorway
      if (newRoom.doorways.some(d => !d.fromParent)) {
        successfulDoorways.push(doorway);
      } else {
        // Child room is a dead end; decide whether to keep the doorway
        successfulDoorways.push(doorway);
      }
    } else {
      // Overlaps, remove the doorway from the parent room
      // We don't add this doorway to successfulDoorways
    }
  }

  // Update the room's doorways to only include successful doorways and fromParent doorways
  room.doorways = room.doorways.filter(d => d.fromParent || successfulDoorways.includes(d));
}

// Reset nextRoomId before generating the dungeon
nextRoomId = 1;

// Initialize existingRooms and generate the tree
let existingRooms = [];
const initialRoom = {
  x: 1,
  y: 1,
  width: 5,
  height: 4,
  doorways: [
    { side: 'top', position: 1, type: 'door' },
    { side: 'right', position: 2, type: 'corridor' },
    { side: 'bottom', position: 3, type: 'locked-door' },
  ],
};

generateTree(initialRoom, existingRooms);

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
  return rooms.find(r => {
    if (side === 'top' || side === 'bottom') {
      return (
        r.y === adjacentY &&
        r.x <= adjacentX &&
        adjacentX < r.x + r.width
      );
    } else {
      return (
        r.x === adjacentX &&
        r.y <= adjacentY &&
        adjacentY < r.y + r.height
      );
    }
  });
}

// After generating existingRooms
const uf = new UnionFind();

// Iterate over rooms to union merged rooms
existingRooms.forEach(room => {
  room.doorways.forEach(doorway => {
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

existingRooms.forEach(room => {
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
      type: "merged",
      sections: roomsInGroup,
      doorways: [], // You can handle doorways at the merged room level if needed
    };
    newRooms.push(mergedRoom);
  }
});

// Replace existingRooms with newRooms
existingRooms = newRooms;

// Use existingRooms as the flattened rooms
console.log(existingRooms);
console.log(createRoomDescriptions(existingRooms));
let roomDescriptions = createRoomDescriptions(existingRooms);
const flattenedRooms = ref(existingRooms);
</script>

<style>
/* Add any styles you need here */
</style>
