<template>
  <DungeonMap :rooms="flattenedRooms" @roomClicked="handleRoomClick" />
</template>

<script setup>
import { ref } from 'vue';
import DungeonMap from './DungeonMap.vue';
import { createRoomDescriptions } from '../util/create-room-descriptions.mjs';
import { generateDungeon } from '../util/generate-dungeon.mjs';
import { createDungeonDetails } from '../util/dungeon-details.mjs';

const handleRoomClick = (roomId) => {
  console.log(`Room ${roomId} was clicked!`);
  console.log(roomDescriptions[roomId]);
  console.log(existingRooms[roomId - 1]);
  // You can add your custom logic here for when a room is clicked
};

let existingRooms = generateDungeon();
createDungeonDetails(existingRooms);
console.log(existingRooms);
let roomDescriptions = createRoomDescriptions(existingRooms);
const flattenedRooms = ref(existingRooms);
</script>

<style>
/* Add any styles you need here */
</style>
