<template>
  <DungeonMap :rooms="flattenedRooms" />
</template>

<script setup>
import { ref } from 'vue';
import DungeonMap from './DungeonMap.vue';

// Function to check for overlapping rooms with a gap
function roomsOverlap(room1, room2) {
  const buffer = 1; // Gap of 1 tile between rooms
  return (
    room1.x - buffer < room2.x + room2.width &&
    room1.x + room1.width + buffer > room2.x &&
    room1.y - buffer < room2.y + room2.height &&
    room1.y + room1.height + buffer > room2.y
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

  // Gap between rooms
  const gap = 1; // 1 tile gap

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

    // Add the connecting doorway back to the parent and mark it as fromParent
    childDoorways.push({
      side: oppositeSide,
      position: childDoorwayPosition,
      fromParent: true, // Mark to avoid processing it again
      type: parentDoorwayType, // Ensure the type is consistent
    });

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

        // Randomly assign a type ('door', 'locked-door', or 'corridor') based on weights
        const randomValue = Math.random();
        let type;
        if (randomValue < 0.4) {
          type = 'door'; // 40% chance
        } else if (randomValue < 0.7) {
          type = 'locked-door'; // Next 30% (0.4 to 0.7)
        } else {
          type = 'corridor'; // Remaining 30% (0.7 to 1)
        }

        childDoorways.push({ side, position, type });
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

  // If the room has no doorways left (except maybe the one from parent) and is not the initial room, it's a dead end
  if (room.doorways.length === 0 && depth !== 0) {
    // Optionally, you can remove the room from existingRooms
    // For now, we'll leave it in as a dead-end room
  }
}

// Reset nextRoomId before generating the dungeon
nextRoomId = 1;

// Initialize existingRooms and generate the tree
const existingRooms = [];
const initialRoom = {
  x: 1,
  y: 1,
  width: 5,
  height: 4,
  doorways: [
    { side: 'top', position: 1, type: 'door' },
    { side: 'right', position: 2, type: 'corridor' },
    { side: 'bottom', position: 3, type: 'locked-door' }, // Added 'locked-door' type
  ],
};

generateTree(initialRoom, existingRooms);

// Use existingRooms as the flattened rooms
const flattenedRooms = ref(existingRooms);
</script>
