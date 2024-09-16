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
  const tileSize = props.tileSize;

  // Calculate minimum and maximum coordinates
  const allX = props.rooms.flatMap(room => [room.x, room.x + room.width]);
  const allY = props.rooms.flatMap(room => [room.y, room.y + room.height]);
  let minX = Math.min(...allX);
  let maxX = Math.max(...allX);
  let minY = Math.min(...allY);
  let maxY = Math.max(...allY);

  // Adjust minX, minY, maxX, maxY to add 2 units of padding
  minX -= 2;
  minY -= 2;
  maxX += 2;
  maxY += 2;

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

  // Top side with potential doorways (counting from the left)
  ctx.moveTo(offsetX, offsetY);
  let currentX = offsetX;
  doorways?.filter(d => d.side === 'top').forEach(doorway => {
    ctx.lineTo(offsetX + doorway.position * tileSize, offsetY);
    currentX = offsetX + (doorway.position + 1) * tileSize;
    ctx.moveTo(currentX, offsetY);
  });
  ctx.lineTo(offsetX + width * tileSize, offsetY);

  // Right side with potential doorways (counting from the top)
  ctx.moveTo(offsetX + width * tileSize, offsetY);
  let currentY = offsetY;
  doorways?.filter(d => d.side === 'right').forEach(doorway => {
    ctx.lineTo(offsetX + width * tileSize, offsetY + doorway.position * tileSize);
    currentY = offsetY + (doorway.position + 1) * tileSize;
    ctx.moveTo(offsetX + width * tileSize, currentY);
  });
  ctx.lineTo(offsetX + width * tileSize, offsetY + height * tileSize);

  // Bottom side with potential doorways (counting from the left)
  ctx.moveTo(offsetX, offsetY + height * tileSize);
  currentX = offsetX;
  doorways?.filter(d => d.side === 'bottom').forEach(doorway => {
    const doorwayStart = offsetX + doorway.position * tileSize;
    ctx.lineTo(doorwayStart, offsetY + height * tileSize);
    currentX = doorwayStart + tileSize;
    ctx.moveTo(currentX, offsetY + height * tileSize);
  });
  ctx.lineTo(offsetX + width * tileSize, offsetY + height * tileSize);

  // Left side with potential doorways (counting from the top)
  ctx.moveTo(offsetX, offsetY);
  currentY = offsetY;
  doorways?.filter(d => d.side === 'left').forEach(doorway => {
    ctx.lineTo(offsetX, offsetY + doorway.position * tileSize);
    currentY = offsetY + (doorway.position + 1) * tileSize;
    ctx.moveTo(offsetX, currentY);
  });
  ctx.lineTo(offsetX, offsetY + height * tileSize);

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
  background-color: #f3f3e8;
}
</style>
