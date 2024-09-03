<!-- DungeonGenerator.vue -->
<template>
  <DungeonMap :rooms="rooms" />
</template>

<script setup>
import { ref } from 'vue';
import DungeonMap from './DungeonMap.vue';

const rooms = ref([
  // Top rooms with various doorways
  { id: 1, x: 1, y: 1, width: 5, height: 4, doorways: [{ side: 'top', position: 2 }] },
  { id: 2, x: 8, y: 1, width: 6, height: 5, doorways: [{ side: 'top', position: 3 }, { side: 'top', position: 5 }] },
  { id: 3, x: 15, y: 2, width: 4, height: 4, doorways: [{ side: 'top', position: 1 }] },

  // Right rooms with various doorways
  { id: 4, x: 23, y: 1, width: 7, height: 4, doorways: [{ side: 'right', position: 2 }] },
  { id: 5, x: 31, y: 3, width: 5, height: 6, doorways: [{ side: 'right', position: 4 }] },

  // Bottom rooms with different configurations
  { id: 6, x: 2, y: 10, width: 5, height: 4, doorways: [{ side: 'bottom', position: 3 }] },
  { id: 7, x: 10, y: 12, width: 6, height: 5, doorways: [{ side: 'bottom', position: 4 }] },
  { id: 8, x: 18, y: 14, width: 4, height: 4, doorways: [{ side: 'bottom', position: 3 }] },
  { id: 9, x: 25, y: 15, width: 8, height: 6, doorways: [{ side: 'bottom', position: 1 }, { side: 'bottom', position: 7 }] },

  // Left rooms with multiple doorways
  { id: 10, x: 34, y: 10, width: 6, height: 5, doorways: [{ side: 'left', position: 1 }, { side: 'left', position: 3 }] },
  { id: 11, x: 42, y: 13, width: 5, height: 7, doorways: [{ side: 'left', position: 4 }] },

  // Rooms with doorways on multiple sides
  { id: 12, x: 50, y: 2, width: 7, height: 6, doorways: [{ side: 'top', position: 3 }, { side: 'right', position: 2 }, { side: 'bottom', position: 5 }] },
  { id: 13, x: 60, y: 8, width: 6, height: 5, doorways: [{ side: 'left', position: 1 }, { side: 'right', position: 4 }, { side: 'bottom', position: 2 }] },

  // Narrow rooms acting as corridors
  { id: 14, x: 1, y: 20, width: 2, height: 8, doorways: [{ side: 'bottom', position: 1 }] },
  { id: 15, x: 5, y: 20, width: 10, height: 2, doorways: [{ side: 'right', position: 0 }] },

  // Large room with doorways on all sides
  {
    id: 16, x: 18, y: 22, width: 10, height: 8, doorways: [
      { side: 'top', position: 4 },
      { side: 'right', position: 6 },
      { side: 'bottom', position: 7 },
      { side: 'left', position: 2 }
    ]
  },

  // Edge case room with doorways at all four corners
  {
    id: 17, x: 30, y: 22, width: 6, height: 6, doorways: [
      { side: 'top', position: 0 },
      { side: 'right', position: 0 },
      { side: 'bottom', position: 0 },
      { side: 'left', position: 0 }
    ]
  },
]);






</script>
