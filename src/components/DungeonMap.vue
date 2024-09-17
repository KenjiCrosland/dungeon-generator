<!-- DungeonMap.vue -->
<template>
  <div class="dungeon-map">
    <canvas ref="dungeonCanvas"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';

const props = defineProps({
  rooms: {
    type: Array,
    required: true,
  },
  tileSize: {
    type: Number,
    default: 20, // Adjust tile size as needed
  },
});

const dungeonCanvas = ref(null);

const resizeCanvas = () => {
  const canvas = dungeonCanvas.value;
  const tileSize = props.tileSize;

  // Calculate minimum and maximum coordinates
  const allX = props.rooms.flatMap(room => [room.x, room.x + room.width]);
  const allY = props.rooms.flatMap(room => [room.y, room.y + room.height]);
  let minX = Math.min(...allX);
  let maxX = Math.max(...allX);
  let minY = Math.min(...allY);
  let maxY = Math.max(...allY);

  // Adjust minX, minY, maxX, maxY to add padding
  const paddingTiles = 2; // Number of tiles to pad around the dungeon
  minX -= paddingTiles;
  minY -= paddingTiles;
  maxX += paddingTiles;
  maxY += paddingTiles;

  // Calculate width and height based on adjusted min and max coordinates
  canvas.width = (maxX - minX) * tileSize;
  canvas.height = (maxY - minY) * tileSize;

  // Store minX and minY to adjust the drawing positions
  canvas.minX = minX;
  canvas.minY = minY;
};

const drawGrid = (ctx) => {
  const { width, height } = ctx.canvas;
  const tileSize = props.tileSize;

  ctx.strokeStyle = '#add8e6'; // Light blue color for grid lines
  ctx.lineWidth = 0.5;

  // Draw vertical lines
  for (let x = 0; x <= width; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Draw horizontal lines
  for (let y = 0; y <= height; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
};

const drawRooms = (ctx) => {
  drawGrid(ctx); // Draw grid first
  props.rooms.forEach(room => {
    drawRoom(ctx, room);
  });
};

const drawRoom = (ctx, room) => {
  ctx.strokeStyle = 'rgba(51, 51, 51, 0.8)'; // Dark gray color with reduced opacity
  ctx.lineWidth = 2.5; // Thicker lines for room outlines
  ctx.lineCap = 'round'; // Round line caps for smoother lines

  // Draw the room outline with doorways
  drawRoomOutline(ctx, room);

  // Draw the room number in the center of the room
  ctx.font = '16px Arial';
  ctx.fillStyle = '#333'; // Dark gray color for text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const textX = ((room.x - ctx.canvas.minX) + room.width / 2) * props.tileSize;
  const textY = ((room.y - ctx.canvas.minY) + room.height / 2) * props.tileSize;
  ctx.fillText(`${room.id}`, textX, textY);
};

const drawRoomOutline = (ctx, room) => {
  const { x, y, width, height, doorways } = room;
  const tileSize = props.tileSize;
  const offsetX = (x - ctx.canvas.minX) * tileSize;
  const offsetY = (y - ctx.canvas.minY) * tileSize;

  ctx.beginPath();

  // Top side with potential doorways (from left to right)
  ctx.moveTo(offsetX, offsetY);
  const topDoorways = doorways?.filter(d => d.side === 'top') || [];
  topDoorways.sort((a, b) => a.position - b.position).forEach(doorway => {
    ctx.lineTo(offsetX + doorway.position * tileSize, offsetY);
    ctx.moveTo(offsetX + (doorway.position + 1) * tileSize, offsetY);
  });
  ctx.lineTo(offsetX + width * tileSize, offsetY);

  // Right side with potential doorways (from top to bottom)
  ctx.moveTo(offsetX + width * tileSize, offsetY);
  const rightDoorways = doorways?.filter(d => d.side === 'right') || [];
  rightDoorways.sort((a, b) => a.position - b.position).forEach(doorway => {
    ctx.lineTo(offsetX + width * tileSize, offsetY + doorway.position * tileSize);
    ctx.moveTo(offsetX + width * tileSize, offsetY + (doorway.position + 1) * tileSize);
  });
  ctx.lineTo(offsetX + width * tileSize, offsetY + height * tileSize);

  // Bottom side with potential doorways (from right to left)
  ctx.moveTo(offsetX + width * tileSize, offsetY + height * tileSize);
  const bottomDoorways = doorways?.filter(d => d.side === 'bottom') || [];
  bottomDoorways.sort((a, b) => b.position - a.position).forEach(doorway => {
    ctx.lineTo(offsetX + (doorway.position + 1) * tileSize, offsetY + height * tileSize);
    ctx.moveTo(offsetX + doorway.position * tileSize, offsetY + height * tileSize);
  });
  ctx.lineTo(offsetX, offsetY + height * tileSize);

  // Left side with potential doorways (from bottom to top)
  ctx.moveTo(offsetX, offsetY + height * tileSize);
  const leftDoorways = doorways?.filter(d => d.side === 'left') || [];
  leftDoorways.sort((a, b) => b.position - a.position).forEach(doorway => {
    ctx.lineTo(offsetX, offsetY + (doorway.position + 1) * tileSize);
    ctx.moveTo(offsetX, offsetY + doorway.position * tileSize);
  });
  ctx.lineTo(offsetX, offsetY);

  ctx.stroke();

  // Draw corridors or doors for each doorway
  doorways?.forEach(doorway => {
    drawCorridor(ctx, room, doorway);
  });
};

const drawCorridor = (ctx, room, doorway) => {
  const doorwayType = doorway.type || 'door'; // Default to 'door' if undefined

  if (doorwayType === 'door') {
    drawDoor(ctx, room, doorway, false); // Regular door
  } else if (doorwayType === 'locked-door') {
    drawDoor(ctx, room, doorway, true); // Locked door
  } else if (doorwayType === 'corridor') {
    drawCorridorWalls(ctx, room, doorway); // Regular corridor
  } else if (doorwayType === 'stairs' && room.id > doorway.connectedRoomId) { // Only draw for one room
    drawStairs(ctx, room, doorway); // Stairs
  }
};



const drawDoor = (ctx, room, doorway, isLocked) => {
  const { x, y, width, height } = room;
  const tileSize = props.tileSize;
  const offsetX = (x - ctx.canvas.minX) * tileSize;
  const offsetY = (y - ctx.canvas.minY) * tileSize;

  // Define dimensions
  const doorSegmentLength = tileSize / 3 - 2; // Adjusted door length
  const doorWidth = tileSize * 0.6 + 4;       // Adjusted door width
  const maxDoorWidth = tileSize - 4;
  const adjustedDoorWidth = Math.min(doorWidth, maxDoorWidth);
  const totalGap = tileSize;
  const corridorSegmentLength = (totalGap - doorSegmentLength) / 2;

  ctx.strokeStyle = 'rgba(51, 51, 51, 0.8)';
  ctx.lineWidth = 2;
  ctx.fillStyle = isLocked ? '#eee' : '#fff'; // Darker fill for locked doors
  ctx.lineCap = 'round';

  if (doorway.side === 'top') {
    const startX = offsetX + doorway.position * tileSize;
    const startY = offsetY;

    // Left wall
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX, startY - corridorSegmentLength);
    ctx.lineTo(startX + (tileSize - adjustedDoorWidth) / 2, startY - corridorSegmentLength);
    ctx.stroke();

    // Right wall
    ctx.beginPath();
    ctx.moveTo(startX + tileSize, startY);
    ctx.lineTo(startX + tileSize, startY - corridorSegmentLength);
    ctx.lineTo(startX + tileSize - (tileSize - adjustedDoorWidth) / 2, startY - corridorSegmentLength);
    ctx.stroke();

    // Door rectangle
    const doorX = startX + (tileSize - adjustedDoorWidth) / 2;
    const doorY = startY - corridorSegmentLength - doorSegmentLength;
    ctx.fillRect(doorX, doorY, adjustedDoorWidth, doorSegmentLength);
    ctx.strokeRect(doorX, doorY, adjustedDoorWidth, doorSegmentLength);

    // Draw lock line if the door is locked
    if (isLocked) {
      ctx.beginPath();
      ctx.moveTo(doorX + 2, doorY + doorSegmentLength / 2);
      ctx.lineTo(doorX + adjustedDoorWidth - 2, doorY + doorSegmentLength / 2);
      ctx.stroke();
    }
  }

  if (doorway.side === 'bottom') {
    const startX = offsetX + doorway.position * tileSize;
    const startY = offsetY + height * tileSize;

    // Left wall
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX, startY + corridorSegmentLength);
    ctx.lineTo(startX + (tileSize - adjustedDoorWidth) / 2, startY + corridorSegmentLength);
    ctx.stroke();

    // Right wall
    ctx.beginPath();
    ctx.moveTo(startX + tileSize, startY);
    ctx.lineTo(startX + tileSize, startY + corridorSegmentLength);
    ctx.lineTo(startX + tileSize - (tileSize - adjustedDoorWidth) / 2, startY + corridorSegmentLength);
    ctx.stroke();

    // Door rectangle
    const doorX = startX + (tileSize - adjustedDoorWidth) / 2;
    const doorY = startY + corridorSegmentLength;
    ctx.fillRect(doorX, doorY, adjustedDoorWidth, doorSegmentLength);
    ctx.strokeRect(doorX, doorY, adjustedDoorWidth, doorSegmentLength);

    // Draw lock line if the door is locked
    if (isLocked) {
      ctx.beginPath();
      ctx.moveTo(doorX + 2, doorY + doorSegmentLength / 2);
      ctx.lineTo(doorX + adjustedDoorWidth - 2, doorY + doorSegmentLength / 2);
      ctx.stroke();
    }
  }

  if (doorway.side === 'left') {
    const startX = offsetX;
    const startY = offsetY + doorway.position * tileSize;

    // Top wall
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX - corridorSegmentLength, startY);
    ctx.lineTo(startX - corridorSegmentLength, startY + (tileSize - adjustedDoorWidth) / 2);
    ctx.stroke();

    // Bottom wall
    ctx.beginPath();
    ctx.moveTo(startX, startY + tileSize);
    ctx.lineTo(startX - corridorSegmentLength, startY + tileSize);
    ctx.lineTo(startX - corridorSegmentLength, startY + tileSize - (tileSize - adjustedDoorWidth) / 2);
    ctx.stroke();

    // Door rectangle
    const doorX = startX - corridorSegmentLength - doorSegmentLength;
    const doorY = startY + (tileSize - adjustedDoorWidth) / 2;
    ctx.fillRect(doorX, doorY, doorSegmentLength, adjustedDoorWidth);
    ctx.strokeRect(doorX, doorY, doorSegmentLength, adjustedDoorWidth);

    // Draw lock line if the door is locked
    if (isLocked) {
      ctx.beginPath();
      ctx.moveTo(doorX + doorSegmentLength / 2, doorY + 2);
      ctx.lineTo(doorX + doorSegmentLength / 2, doorY + adjustedDoorWidth - 2);
      ctx.stroke();
    }
  }

  if (doorway.side === 'right') {
    const startX = offsetX + width * tileSize;
    const startY = offsetY + doorway.position * tileSize;

    // Top wall
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + corridorSegmentLength, startY);
    ctx.lineTo(startX + corridorSegmentLength, startY + (tileSize - adjustedDoorWidth) / 2);
    ctx.stroke();

    // Bottom wall
    ctx.beginPath();
    ctx.moveTo(startX, startY + tileSize);
    ctx.lineTo(startX + corridorSegmentLength, startY + tileSize);
    ctx.lineTo(startX + corridorSegmentLength, startY + tileSize - (tileSize - adjustedDoorWidth) / 2);
    ctx.stroke();

    // Door rectangle
    const doorX = startX + corridorSegmentLength;
    const doorY = startY + (tileSize - adjustedDoorWidth) / 2;
    ctx.fillRect(doorX, doorY, doorSegmentLength, adjustedDoorWidth);
    ctx.strokeRect(doorX, doorY, doorSegmentLength, adjustedDoorWidth);

    // Draw lock line if the door is locked
    if (isLocked) {
      ctx.beginPath();
      ctx.moveTo(doorX + doorSegmentLength / 2, doorY + 2);
      ctx.lineTo(doorX + doorSegmentLength / 2, doorY + adjustedDoorWidth - 2);
      ctx.stroke();
    }
  }
};

const drawStairs = (ctx, room, doorway) => {
  const { x, y, width, height } = room;
  const tileSize = props.tileSize;
  const offsetX = (x - ctx.canvas.minX) * tileSize;
  const offsetY = (y - ctx.canvas.minY) * tileSize;

  const stepHeight = tileSize / 5; // Spacing between steps
  const numSteps = 3; // Number of steps
  const minStepLength = tileSize / 3; // Ensure the smallest step isn't a dot
  const firstStepLength = tileSize * 0.75; // Shorten the first step length

  ctx.strokeStyle = '#666'; // Line color for the stairs
  ctx.lineWidth = 2;

  if (doorway.side === 'top') {
    const startX = offsetX + doorway.position * tileSize;
    const startY = offsetY;

    // Shift the starting point of the first step by one "space" forward
    const shiftForward = stepHeight;

    // Draw the shortened wide line at the top (first step)
    ctx.beginPath();
    ctx.moveTo(startX + (tileSize - firstStepLength) / 2, startY - shiftForward);
    ctx.lineTo(startX + (tileSize + firstStepLength) / 2, startY - shiftForward);
    ctx.stroke();

    // Draw progressively shorter lines (steps) moving downward
    for (let i = 1; i <= numSteps; i++) {
      const stepLength = Math.max(minStepLength, firstStepLength - i * (firstStepLength / numSteps));
      const stepY = startY - (i + 1) * stepHeight;
      ctx.beginPath();
      ctx.moveTo(startX + (tileSize - stepLength) / 2, stepY);
      ctx.lineTo(startX + (tileSize + stepLength) / 2, stepY);
      ctx.stroke();
    }

    // Ensure the last line aligns with the edge of the connecting room
    ctx.beginPath();
    ctx.moveTo(startX + (tileSize - minStepLength) / 2, startY - (numSteps + 1) * stepHeight);
    ctx.lineTo(startX + (tileSize + minStepLength) / 2, startY - (numSteps + 1) * stepHeight);
    ctx.stroke();
  } else if (doorway.side === 'bottom') {
    const startX = offsetX + doorway.position * tileSize;
    const startY = offsetY + height * tileSize;

    // Shift the starting point of the first step by one "space" forward
    const shiftForward = stepHeight;

    // Draw the shortened wide line at the bottom (first step)
    ctx.beginPath();
    ctx.moveTo(startX + (tileSize - firstStepLength) / 2, startY + shiftForward);
    ctx.lineTo(startX + (tileSize + firstStepLength) / 2, startY + shiftForward);
    ctx.stroke();

    // Draw progressively shorter lines (steps) moving upward
    for (let i = 1; i <= numSteps; i++) {
      const stepLength = Math.max(minStepLength, firstStepLength - i * (firstStepLength / numSteps));
      const stepY = startY + (i + 1) * stepHeight;
      ctx.beginPath();
      ctx.moveTo(startX + (tileSize - stepLength) / 2, stepY);
      ctx.lineTo(startX + (tileSize + stepLength) / 2, stepY);
      ctx.stroke();
    }

    // Ensure the last line aligns with the edge of the connecting room
    ctx.beginPath();
    ctx.moveTo(startX + (tileSize - minStepLength) / 2, startY + (numSteps + 1) * stepHeight);
    ctx.lineTo(startX + (tileSize + minStepLength) / 2, startY + (numSteps + 1) * stepHeight);
    ctx.stroke();
  } else if (doorway.side === 'left') {
    const startX = offsetX;
    const startY = offsetY + doorway.position * tileSize;

    // Shift the starting point of the first step by one "space" forward
    const shiftForward = stepHeight;

    // Draw the shortened wide line on the left (first step)
    ctx.beginPath();
    ctx.moveTo(startX - shiftForward, startY + (tileSize - firstStepLength) / 2);
    ctx.lineTo(startX - shiftForward, startY + (tileSize + firstStepLength) / 2);
    ctx.stroke();

    // Draw progressively shorter lines (steps) moving right
    for (let i = 1; i <= numSteps; i++) {
      const stepLength = Math.max(minStepLength, firstStepLength - i * (firstStepLength / numSteps));
      const stepX = startX - (i + 1) * stepHeight;
      ctx.beginPath();
      ctx.moveTo(stepX, startY + (tileSize - stepLength) / 2);
      ctx.lineTo(stepX, startY + (tileSize + stepLength) / 2);
      ctx.stroke();
    }

    // Ensure the last line aligns with the edge of the connecting room
    ctx.beginPath();
    ctx.moveTo(startX - (numSteps + 1) * stepHeight, startY + (tileSize - minStepLength) / 2);
    ctx.lineTo(startX - (numSteps + 1) * stepHeight, startY + (tileSize + minStepLength) / 2);
    ctx.stroke();
  } else if (doorway.side === 'right') {
    const startX = offsetX + width * tileSize;
    const startY = offsetY + doorway.position * tileSize;

    // Shift the starting point of the first step by one "space" forward
    const shiftForward = stepHeight;

    // Draw the shortened wide line on the right (first step)
    ctx.beginPath();
    ctx.moveTo(startX + shiftForward, startY + (tileSize - firstStepLength) / 2);
    ctx.lineTo(startX + shiftForward, startY + (tileSize + firstStepLength) / 2);
    ctx.stroke();

    // Draw progressively shorter lines (steps) moving left
    for (let i = 1; i <= numSteps; i++) {
      const stepLength = Math.max(minStepLength, firstStepLength - i * (firstStepLength / numSteps));
      const stepX = startX + (i + 1) * stepHeight;
      ctx.beginPath();
      ctx.moveTo(stepX, startY + (tileSize - stepLength) / 2);
      ctx.lineTo(stepX, startY + (tileSize + stepLength) / 2);
      ctx.stroke();
    }

    // Ensure the last line aligns with the edge of the connecting room
    ctx.beginPath();
    ctx.moveTo(startX + (numSteps + 1) * stepHeight, startY + (tileSize - minStepLength) / 2);
    ctx.lineTo(startX + (numSteps + 1) * stepHeight, startY + (tileSize + minStepLength) / 2);
    ctx.stroke();
  }
};




const drawCorridorWalls = (ctx, room, doorway) => {
  const { x, y, width, height } = room;
  const tileSize = props.tileSize;
  const offsetX = (x - ctx.canvas.minX) * tileSize;
  const offsetY = (y - ctx.canvas.minY) * tileSize;

  const corridorWidth = tileSize; // Width of the corridor (1 tile)
  const corridorLength = tileSize; // Length of the corridor (1 tile gap)

  ctx.strokeStyle = 'rgba(51, 51, 51, 0.8)'; // Same color as room outlines
  ctx.lineWidth = 2.5; // Same line width as room outlines
  ctx.lineCap = 'round'; // Ensure lines have rounded ends

  if (doorway.side === 'top') {
    const corridorX = offsetX + doorway.position * tileSize;
    const corridorYStart = offsetY;
    const corridorYEnd = offsetY - corridorLength;

    // Left wall of the corridor
    ctx.beginPath();
    ctx.moveTo(corridorX, corridorYStart);
    ctx.lineTo(corridorX, corridorYEnd);
    ctx.stroke();

    // Right wall of the corridor
    ctx.beginPath();
    ctx.moveTo(corridorX + tileSize, corridorYStart);
    ctx.lineTo(corridorX + tileSize, corridorYEnd);
    ctx.stroke();
  } else if (doorway.side === 'bottom') {
    const corridorX = offsetX + doorway.position * tileSize;
    const corridorYStart = offsetY + height * tileSize;
    const corridorYEnd = corridorYStart + corridorLength;

    // Left wall of the corridor
    ctx.beginPath();
    ctx.moveTo(corridorX, corridorYStart);
    ctx.lineTo(corridorX, corridorYEnd);
    ctx.stroke();

    // Right wall of the corridor
    ctx.beginPath();
    ctx.moveTo(corridorX + tileSize, corridorYStart);
    ctx.lineTo(corridorX + tileSize, corridorYEnd);
    ctx.stroke();
  } else if (doorway.side === 'left') {
    const corridorXStart = offsetX;
    const corridorXEnd = offsetX - corridorLength;
    const corridorY = offsetY + doorway.position * tileSize;

    // Top wall of the corridor
    ctx.beginPath();
    ctx.moveTo(corridorXStart, corridorY);
    ctx.lineTo(corridorXEnd, corridorY);
    ctx.stroke();

    // Bottom wall of the corridor
    ctx.beginPath();
    ctx.moveTo(corridorXStart, corridorY + tileSize);
    ctx.lineTo(corridorXEnd, corridorY + tileSize);
    ctx.stroke();
  } else if (doorway.side === 'right') {
    const corridorXStart = offsetX + width * tileSize;
    const corridorXEnd = corridorXStart + corridorLength;
    const corridorY = offsetY + doorway.position * tileSize;

    // Top wall of the corridor
    ctx.beginPath();
    ctx.moveTo(corridorXStart, corridorY);
    ctx.lineTo(corridorXEnd, corridorY);
    ctx.stroke();

    // Bottom wall of the corridor
    ctx.beginPath();
    ctx.moveTo(corridorXStart, corridorY + tileSize);
    ctx.lineTo(corridorXEnd, corridorY + tileSize);
    ctx.stroke();
  }
};

onMounted(() => {
  const canvas = dungeonCanvas.value;
  const ctx = canvas.getContext('2d');

  resizeCanvas();
  drawRooms(ctx);
});

watch(
  () => props.rooms,
  () => {
    const canvas = dungeonCanvas.value;
    const ctx = canvas.getContext('2d');

    resizeCanvas();
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before redrawing
    drawRooms(ctx);
  },
  { deep: true }
);
</script>

<style scoped>
.dungeon-map {
  margin: auto;
  display: block;
  background-color: #f3f3e8;
}
</style>
