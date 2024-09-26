<template>
  <DungeonMap :rooms="rooms" @roomClicked="handleRoomClick" />
</template>

<script setup>
import { ref } from 'vue';
import DungeonMap from './DungeonMap.vue';
import { createRoomDescriptions } from '../util/create-room-descriptions.mjs';
import { generateDungeon } from '../util/generate-dungeon.mjs';
import { addDungeonDetails } from '../util/dungeon-details.mjs';

const handleRoomClick = (roomId) => {
  console.log(`Room ${roomId} was clicked!`);
  console.log(roomDescriptions[roomId]);
  console.log(dungeonRoomArray[roomId - 1]);
  // You can add your custom logic here for when a room is clicked
};

let dungeonRoomArray = generateDungeon();
addDungeonDetails(dungeonRoomArray);
console.log(dungeonRoomArray);
let roomDescriptions = createRoomDescriptions(dungeonRoomArray);
const rooms = ref(dungeonRoomArray);
</script>

<style>
/* Add any styles you need here */
</style>
