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
    default: 20,
  },
});

const dungeonCanvas = ref(null);

const resizeCanvas = () => {
  const canvas = dungeonCanvas.value;
  const maxX = Math.max(...props.rooms.map(room => room.x + room.width));
  const maxY = Math.max(...props.rooms.map(room => room.y + room.height));
  canvas.width = maxX * props.tileSize + 20;  // Add some padding
  canvas.height = maxY * props.tileSize + 20; // Add some padding
};

const drawGrid = (ctx) => {
  const { width, height } = ctx.canvas;
  ctx.strokeStyle = '#ddd'; // Light gray color for grid lines
  ctx.lineWidth = 1;

  // Draw vertical lines
  for (let x = 0; x <= width; x += props.tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Draw horizontal lines
  for (let y = 0; y <= height; y += props.tileSize) {
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
  ctx.strokeStyle = '#000'; // Black color for room outlines
  ctx.lineWidth = 2;

  // Draw the room outline with doorways
  drawRoomOutline(ctx, room);

  // Draw the room ID in the center of the room
  ctx.font = '16px Arial';
  ctx.fillStyle = '#000';
  const textX = (room.x + room.width / 2) * props.tileSize;
  const textY = (room.y + room.height / 2) * props.tileSize;
  ctx.fillText(`ID: ${room.id}`, textX, textY);
};

const drawRoomOutline = (ctx, room) => {
  const { x, y, width, height, doorways } = room;
  const tileSize = props.tileSize;
  ctx.beginPath();

  // Top outline with potential doorways
  ctx.moveTo(x * tileSize, y * tileSize);
  let currentX = x * tileSize;
  doorways?.filter(d => d.side === 'top').forEach(doorway => {
    ctx.lineTo((x + doorway.position) * tileSize, y * tileSize); // Draw up to the doorway
    currentX = (x + doorway.position + 1) * tileSize;
    ctx.moveTo(currentX, y * tileSize); // Skip the doorway
  });
  ctx.lineTo((x + width) * tileSize, y * tileSize); // Complete the top side

  // Right outline with potential doorways
  ctx.moveTo((x + width) * tileSize, y * tileSize);
  let currentY = y * tileSize;
  doorways?.filter(d => d.side === 'right').forEach(doorway => {
    ctx.lineTo((x + width) * tileSize, (y + doorway.position) * tileSize); // Draw up to the doorway
    currentY = (y + doorway.position + 1) * tileSize;
    ctx.moveTo((x + width) * tileSize, currentY); // Skip the doorway
  });
  ctx.lineTo((x + width) * tileSize, (y + height) * tileSize); // Complete the right side

  // Adjusted Bottom outline with doorways (right to left)
  ctx.moveTo((x + width) * tileSize, (y + height) * tileSize);
  currentX = (x + width) * tileSize;
  doorways?.filter(d => d.side === 'bottom').forEach(doorway => {
    // Apply manual correction by subtracting 1 from the position
    const correctedPosition = doorway.position; // This corrects the off-by-one issue
    const doorwayStart = (x + width - correctedPosition) * tileSize;
    ctx.lineTo(doorwayStart, (y + height) * tileSize); // Draw up to the doorway
    currentX = doorwayStart - tileSize;
    ctx.moveTo(currentX, (y + height) * tileSize); // Skip the doorway
  });
  ctx.lineTo(x * tileSize, (y + height) * tileSize); // Complete the bottom side

  // Left outline with potential doorways (already working)
  ctx.moveTo(x * tileSize, (y + height) * tileSize);
  currentY = (y + height) * tileSize;
  doorways?.filter(d => d.side === 'left').forEach(doorway => {
    const doorwayStart = (y + height - doorway.position - 1) * tileSize;
    ctx.lineTo(x * tileSize, doorwayStart); // Draw up to the doorway
    currentY = doorwayStart - tileSize;
    ctx.moveTo(x * tileSize, currentY); // Skip the doorway
  });
  ctx.lineTo(x * tileSize, y * tileSize); // Complete the left side

  ctx.stroke();
};





onMounted(() => {
  const canvas = dungeonCanvas.value;
  const ctx = canvas.getContext('2d');

  resizeCanvas();
  drawRooms(ctx);
});

// Redraw the canvas whenever the rooms prop changes
watch(() => props.rooms, () => {
  const canvas = dungeonCanvas.value;
  const ctx = canvas.getContext('2d');

  resizeCanvas();
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before redrawing
  drawRooms(ctx);
});
</script>

<style scoped>
.dungeon-map {
  margin: auto;
  display: block;
  background-color: #fff;
}
</style>
