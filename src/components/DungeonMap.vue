<template>
  <div class="dungeon-map">
    <canvas ref="dungeonCanvas"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
const emit = defineEmits(['roomClicked']);

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
  const allX = props.rooms.flatMap(room => {
    if (room.type === 'merged') {
      return room.sections.flatMap(section => [section.x, section.x + section.width]);
    } else {
      return [room.x, room.x + room.width];
    }
  });

  const allY = props.rooms.flatMap(room => {
    if (room.type === 'merged') {
      return room.sections.flatMap(section => [section.y, section.y + section.height]);
    } else {
      return [room.y, room.y + room.height];
    }
  });

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

let groupMap;

const computeGroupMap = () => {
  groupMap = new Map();

  props.rooms.forEach(room => {
    const roomId = room.id;

    if (!groupMap.has(roomId)) {
      groupMap.set(roomId, {
        tiles: new Set(),
        minX: Infinity,
        maxX: -Infinity,
        minY: Infinity,
        maxY: -Infinity,
        roomId: roomId,
      });
    }
    const group = groupMap.get(roomId);

    // Handle merged rooms
    if (room.type === 'merged') {
      room.sections.forEach(section => {
        collectRoomTiles(group, section);
      });
    } else {
      collectRoomTiles(group, room);
    }
  });
};

const collectRoomTiles = (group, room) => {
  // Collect all tiles occupied by this room
  for (let i = 0; i < room.width; i++) {
    for (let j = 0; j < room.height; j++) {
      const tileX = room.x + i;
      const tileY = room.y + j;
      const tileKey = `${tileX},${tileY}`;
      group.tiles.add(tileKey);

      // Update group's bounding box
      group.minX = Math.min(group.minX, tileX);
      group.maxX = Math.max(group.maxX, tileX + 1);
      group.minY = Math.min(group.minY, tileY);
      group.maxY = Math.max(group.maxY, tileY + 1);
    }
  }
};

const drawRooms = (ctx) => {
  computeGroupMap(); // Compute group map before drawing

  drawGrid(ctx); // Draw grid first

  // Draw room outlines
  props.rooms.forEach(room => {
    if (room.type === 'merged') {
      // For merged rooms, draw each section
      room.sections.forEach(section => {
        drawRoomOutline(ctx, section);
      });
    } else {
      drawRoomOutline(ctx, room);
    }
  });

  // Draw room numbers
  drawRoomNumbers(ctx);
};

let numberPositions = []; // Store positions of the room numbers
let hoveredRoomId = null; // Track hovered room ID
let clickedRoomId = null; // Track clicked room ID

const drawRoomNumbers = (ctx) => {
  const tileSize = props.tileSize;
  numberPositions = [];

  groupMap.forEach((group) => {
    const tileCoordinates = Array.from(group.tiles).map(tileKey => {
      const [x, y] = tileKey.split(',').map(Number);
      return { x, y };
    });

    if (tileCoordinates.length === 0) return;

    const sumX = tileCoordinates.reduce((acc, tile) => acc + tile.x + 0.5, 0);
    const sumY = tileCoordinates.reduce((acc, tile) => acc + tile.y + 0.5, 0);
    let centroidX = sumX / tileCoordinates.length;
    let centroidY = sumY / tileCoordinates.length;

    centroidX = Math.max(group.minX, Math.min(centroidX, group.maxX));
    centroidY = Math.max(group.minY, Math.min(centroidY, group.maxY));

    const centerX = (centroidX - ctx.canvas.minX) * tileSize;
    const centerY = (centroidY - ctx.canvas.minY) * tileSize;

    numberPositions.push({
      roomId: group.roomId,
      x: centerX,
      y: centerY,
      radius: 10,
    });

    // Change style for hovered or clicked state
    ctx.font = '14px Arial';
    if (group.roomId === hoveredRoomId || group.roomId === clickedRoomId) {
      ctx.font = 'bold 16px Arial';
    }
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${group.roomId}`, centerX, centerY);
  });
};



const drawRoomOutline = (ctx, room) => {
  const { x, y, width, height, doorways } = room;
  const tileSize = props.tileSize;
  const offsetX = (x - ctx.canvas.minX) * tileSize;
  const offsetY = (y - ctx.canvas.minY) * tileSize;

  ctx.beginPath();

  // Function to check if there's a merged connection on a given side
  const hasMergedConnection = (side) => {
    return doorways?.some(d => d.side === side && d.type === 'merged');
  };

  // For each side, draw it if there is no merged connection
  if (!hasMergedConnection('top')) {
    // Top side with potential doorways (from left to right)
    ctx.moveTo(offsetX, offsetY);
    const topDoorways = doorways?.filter(d => d.side === 'top' && d.type !== 'merged') || [];
    topDoorways.sort((a, b) => a.position - b.position).forEach(doorway => {
      ctx.lineTo(offsetX + doorway.position * tileSize, offsetY);
      ctx.moveTo(offsetX + (doorway.position + 1) * tileSize, offsetY);
    });
    ctx.lineTo(offsetX + width * tileSize, offsetY);
  }

  if (!hasMergedConnection('right')) {
    // Right side with potential doorways (from top to bottom)
    ctx.moveTo(offsetX + width * tileSize, offsetY);
    const rightDoorways = doorways?.filter(d => d.side === 'right' && d.type !== 'merged') || [];
    rightDoorways.sort((a, b) => a.position - b.position).forEach(doorway => {
      ctx.lineTo(offsetX + width * tileSize, offsetY + doorway.position * tileSize);
      ctx.moveTo(offsetX + width * tileSize, offsetY + (doorway.position + 1) * tileSize);
    });
    ctx.lineTo(offsetX + width * tileSize, offsetY + height * tileSize);
  }

  if (!hasMergedConnection('bottom')) {
    // Bottom side with potential doorways (from right to left)
    ctx.moveTo(offsetX + width * tileSize, offsetY + height * tileSize);
    const bottomDoorways = doorways?.filter(d => d.side === 'bottom' && d.type !== 'merged') || [];
    bottomDoorways.sort((a, b) => b.position - a.position).forEach(doorway => {
      ctx.lineTo(offsetX + (doorway.position + 1) * tileSize, offsetY + height * tileSize);
      ctx.moveTo(offsetX + doorway.position * tileSize, offsetY + height * tileSize);
    });
    ctx.lineTo(offsetX, offsetY + height * tileSize);
  }

  if (!hasMergedConnection('left')) {
    // Left side with potential doorways (from bottom to top)
    ctx.moveTo(offsetX, offsetY + height * tileSize);
    const leftDoorways = doorways?.filter(d => d.side === 'left' && d.type !== 'merged') || [];
    leftDoorways.sort((a, b) => b.position - a.position).forEach(doorway => {
      ctx.lineTo(offsetX, offsetY + (doorway.position + 1) * tileSize);
      ctx.moveTo(offsetX, offsetY + doorway.position * tileSize);
    });
    ctx.lineTo(offsetX, offsetY);
  }

  ctx.strokeStyle = 'rgba(51, 51, 51, 0.8)'; // Dark gray color with reduced opacity
  ctx.lineWidth = 2.5; // Thicker lines for room outlines
  ctx.lineCap = 'round'; // Round line caps for smoother lines
  ctx.stroke();

  // Draw doorways (excluding merged connections)
  doorways?.forEach(doorway => {
    if (doorway.type !== 'merged') {
      drawCorridor(ctx, room, doorway);
    }
  });

  // Handle extensions for merged connections
  doorways?.forEach(doorway => {
    if (doorway.type === 'merged') {
      const adjacentRoom = findAdjacentRoom(room, doorway);
      if (adjacentRoom) {
        extendWallsForMergedRooms(ctx, room, adjacentRoom, doorway);
      }
    }
  });
};

const findAdjacentRoom = (room, doorway) => {
  const side = doorway.side;
  const position = doorway.position;

  // Calculate the expected position of the adjacent room
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

  // Find the adjacent room in props.rooms or in merged room sections
  let allRooms = [];
  props.rooms.forEach(r => {
    if (r.type === 'merged') {
      allRooms.push(...r.sections);
    } else {
      allRooms.push(r);
    }
  });

  return allRooms.find(r => {
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
};

const extendWallsForMergedRooms = (ctx, room1, room2, doorway) => {
  const tileSize = props.tileSize;

  // Determine the side of connection
  const side = doorway.side;

  // Calculate positions
  const room1OffsetX = (room1.x - ctx.canvas.minX) * tileSize;
  const room1OffsetY = (room1.y - ctx.canvas.minY) * tileSize;
  const room2OffsetX = (room2.x - ctx.canvas.minX) * tileSize;
  const room2OffsetY = (room2.y - ctx.canvas.minY) * tileSize;

  ctx.beginPath();
  ctx.strokeStyle = 'rgba(51, 51, 51, 0.8)';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';

  if (side === 'right' || side === 'left') {
    // Vertical extension

    // Determine the x-coordinate of the wall to draw
    const wallX = side === 'right' ? room1OffsetX + room1.width * tileSize : room1OffsetX;

    // Calculate the overlap in y-direction
    const overlapTop = Math.max(room1OffsetY, room2OffsetY);
    const overlapBottom = Math.min(
      room1OffsetY + room1.height * tileSize,
      room2OffsetY + room2.height * tileSize
    );

    // Draw wall segments above and below the overlapping area
    if (overlapTop > Math.min(room1OffsetY, room2OffsetY)) {
      ctx.moveTo(wallX, Math.min(room1OffsetY, room2OffsetY));
      ctx.lineTo(wallX, overlapTop);
    }
    if (overlapBottom < Math.max(room1OffsetY + room1.height * tileSize, room2OffsetY + room2.height * tileSize)) {
      ctx.moveTo(wallX, overlapBottom);
      ctx.lineTo(wallX, Math.max(room1OffsetY + room1.height * tileSize, room2OffsetY + room2.height * tileSize));
    }
  } else if (side === 'top' || side === 'bottom') {
    // Horizontal extension

    // Determine the y-coordinate of the wall to draw
    const wallY = side === 'bottom' ? room1OffsetY + room1.height * tileSize : room1OffsetY;

    // Calculate the overlap in x-direction
    const overlapLeft = Math.max(room1OffsetX, room2OffsetX);
    const overlapRight = Math.min(
      room1OffsetX + room1.width * tileSize,
      room2OffsetX + room2.width * tileSize
    );

    // Draw wall segments to the left and right of the overlapping area
    if (overlapLeft > Math.min(room1OffsetX, room2OffsetX)) {
      ctx.moveTo(Math.min(room1OffsetX, room2OffsetX), wallY);
      ctx.lineTo(overlapLeft, wallY);
    }
    if (overlapRight < Math.max(room1OffsetX + room1.width * tileSize, room2OffsetX + room2.width * tileSize)) {
      ctx.moveTo(overlapRight, wallY);
      ctx.lineTo(Math.max(room1OffsetX + room1.width * tileSize, room2OffsetX + room2.width * tileSize), wallY);
    }
  }

  ctx.stroke();
};

const drawCorridor = (ctx, room, doorway) => {
  const doorwayType = doorway.type || 'door';

  if (doorwayType === 'door') {
    drawDoor(ctx, room, doorway, false);
  } else if (doorwayType === 'locked-door') {
    drawDoor(ctx, room, doorway, true);
  } else if (doorwayType === 'secret') {
    drawSecretDoor(ctx, room, doorway);
  } else if (doorwayType === 'corridor') {
    drawCorridorWalls(ctx, room, doorway);
  } else if (doorwayType === 'stairs' && room.id > doorway.connectedRoomId) {
    drawStairs(ctx, room, doorway);
  } else if (doorwayType === 'merged') {
    // Do nothing for merged connections
  }
};
const drawSecretDoor = (ctx, room, doorway) => {
  const { x, y, width, height } = room;
  const tileSize = props.tileSize;
  const offsetX = (x - ctx.canvas.minX) * tileSize;
  const offsetY = (y - ctx.canvas.minY) * tileSize;

  // Define the gap size (you've increased it to 1/2, so we'll use that)
  const gapSize = tileSize / 2;

  // Wall segments should be adjusted accordingly
  const wallSegmentLength = (tileSize - gapSize) / 2;

  ctx.strokeStyle = 'rgba(51, 51, 51, 0.8)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  if (doorway.side === 'top') {
    const startX = offsetX + doorway.position * tileSize;
    const startY = offsetY;

    // Left wall segment
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX, startY - wallSegmentLength);
    ctx.stroke();

    // Right wall segment
    ctx.beginPath();
    ctx.moveTo(startX + tileSize, startY);
    ctx.lineTo(startX + tileSize, startY - wallSegmentLength);
    ctx.stroke();

    // Connect the two segments with a horizontal line
    ctx.beginPath();
    ctx.moveTo(startX, startY - wallSegmentLength);
    ctx.lineTo(startX + tileSize, startY - wallSegmentLength);
    ctx.stroke();
  } else if (doorway.side === 'bottom') {
    const startX = offsetX + doorway.position * tileSize;
    const startY = offsetY + height * tileSize;

    // Left wall segment
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX, startY + wallSegmentLength);
    ctx.stroke();

    // Right wall segment
    ctx.beginPath();
    ctx.moveTo(startX + tileSize, startY);
    ctx.lineTo(startX + tileSize, startY + wallSegmentLength);
    ctx.stroke();

    // Connect the two segments with a horizontal line
    ctx.beginPath();
    ctx.moveTo(startX, startY + wallSegmentLength);
    ctx.lineTo(startX + tileSize, startY + wallSegmentLength);
    ctx.stroke();
  } else if (doorway.side === 'left') {
    const startX = offsetX;
    const startY = offsetY + doorway.position * tileSize;

    // Top wall segment
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX - wallSegmentLength, startY);
    ctx.stroke();

    // Bottom wall segment
    ctx.beginPath();
    ctx.moveTo(startX, startY + tileSize);
    ctx.lineTo(startX - wallSegmentLength, startY + tileSize);
    ctx.stroke();

    // Connect the two segments with a vertical line
    ctx.beginPath();
    ctx.moveTo(startX - wallSegmentLength, startY);
    ctx.lineTo(startX - wallSegmentLength, startY + tileSize);
    ctx.stroke();
  } else if (doorway.side === 'right') {
    const startX = offsetX + width * tileSize;
    const startY = offsetY + doorway.position * tileSize;

    // Top wall segment
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + wallSegmentLength, startY);
    ctx.stroke();

    // Bottom wall segment
    ctx.beginPath();
    ctx.moveTo(startX, startY + tileSize);
    ctx.lineTo(startX + wallSegmentLength, startY + tileSize);
    ctx.stroke();

    // Connect the two segments with a vertical line
    ctx.beginPath();
    ctx.moveTo(startX + wallSegmentLength, startY);
    ctx.lineTo(startX + wallSegmentLength, startY + tileSize);
    ctx.stroke();
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

  // Handle mousemove event for hover effect
  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    let isHovering = false;

    numberPositions.forEach(position => {
      const distance = Math.sqrt(
        (mouseX - position.x) ** 2 + (mouseY - position.y) ** 2
      );
      if (distance <= position.radius) {
        hoveredRoomId = position.roomId;
        isHovering = true;
        canvas.style.cursor = 'pointer';
      }
    });

    if (!isHovering) {
      hoveredRoomId = null;
      canvas.style.cursor = 'default';
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRooms(ctx);
  });

  // Handle click event
  canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    numberPositions.forEach(position => {
      const distance = Math.sqrt(
        (clickX - position.x) ** 2 + (clickY - position.y) ** 2
      );
      if (distance <= position.radius) {
        clickedRoomId = position.roomId;
        emit('roomClicked', position.roomId); // Emit the event with room ID
      }
    });

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRooms(ctx);
  });

  // Handle mousedown event for visual feedback
  canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    numberPositions.forEach(position => {
      const distance = Math.sqrt(
        (mouseX - position.x) ** 2 + (mouseY - position.y) ** 2
      );
      if (distance <= position.radius) {
        clickedRoomId = position.roomId;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawRooms(ctx);
      }
    });
  });
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
