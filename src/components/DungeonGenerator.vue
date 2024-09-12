<template>
  <DungeonMap :rooms="flattenedRooms" />
</template>

<script setup>
import { ref } from 'vue';
import DungeonMap from './DungeonMap.vue';

// Function to check for overlapping rooms
function roomsOverlap(room1, room2) {
  return (
    room1.x < room2.x + room2.width &&
    room1.x + room1.width > room2.x &&
    room1.y < room2.y + room2.height &&
    room1.y + room1.height > room2.y
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

  existingRooms.push(room);

  if (depth > 3) {
    return room;
  }

  const doorways = room.doorways || [];

  doorways.forEach(doorway => {
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

    // Calculate the child room's position
    let x = room.x;
    let y = room.y;

    if (parentDoorwaySide === 'top') {
      y = room.y - height; // Place child room above
      x = room.x + doorway.position - childDoorwayPosition;
    } else if (parentDoorwaySide === 'bottom') {
      y = room.y + room.height; // Place child room below
      x = room.x + doorway.position - childDoorwayPosition;
    } else if (parentDoorwaySide === 'left') {
      x = room.x - width; // Place child room to the left
      y = room.y + doorway.position - childDoorwayPosition;
    } else if (parentDoorwaySide === 'right') {
      x = room.x + room.width; // Place child room to the right
      y = room.y + doorway.position - childDoorwayPosition;
    }

    // Create doorways for the child room
    const childDoorways = [];

    // Add the connecting doorway back to the parent
    childDoorways.push({ side: oppositeSide, position: childDoorwayPosition });

    // Determine the number of additional doorways to add
    const minAdditionalDoorways = 0;
    const maxAdditionalDoorways = 2;
    const numAdditionalDoorways = Math.floor(Math.random() * (maxAdditionalDoorways - minAdditionalDoorways + 1)) + minAdditionalDoorways;

    // Get available sides excluding the one connected to the parent
    const availableSides = ['top', 'right', 'bottom', 'left'].filter(side => side !== oppositeSide);

    // Randomly select sides for additional doorways
    const sidesForDoorways = availableSides.sort(() => Math.random() - 0.5).slice(0, numAdditionalDoorways);

    sidesForDoorways.forEach(side => {
      const maxPosition = (side === 'top' || side === 'bottom') ? width - 2 : height - 2;
      if (maxPosition > 0) {
        const position = Math.floor(Math.random() * maxPosition) + 1;
        childDoorways.push({ side, position });
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
      // Assign an ID and add the new room to existingRooms
      newRoom.id = nextRoomId++;
      existingRooms.push(newRoom);

      // Proceed to generate child rooms
      generateTree(newRoom, existingRooms, depth + 1);
    } else {
      // Overlaps, skip this room
    }
  });

  return room;
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
    { side: 'top', position: 1 },
    { side: 'right', position: 2 },
    { side: 'bottom', position: 3 }
  ],
};

generateTree(initialRoom, existingRooms);

// Use existingRooms as the flattened rooms
const flattenedRooms = ref(existingRooms);
</script>
