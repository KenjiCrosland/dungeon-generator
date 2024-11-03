// src/stores/dungeonStore.js

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { generateDungeon } from '../util/generate-dungeon.mjs';
import { createRoomDescriptions } from '../util/create-room-descriptions.mjs';
import { addDungeonDetails } from '../util/dungeon-details.mjs';
import {
  dungeonOverviewPrompt,
  validateDungeonOverview,
} from '../prompts/dungeon-overview.mjs';
import { generateGptResponse } from '../util/open-ai.mjs';

export const useDungeonStore = defineStore('dungeon', () => {
  // State
  const dungeons = ref([]);
  const currentDungeonId = ref(null);
  const loadingOverview = ref(false);
  const selectedRoomId = ref(null);
  const lastClickedRoomX = ref(null);
  const isMapSidebarCollapsed = ref(true);
  const activeTabIndex = ref(0);

  // Getters
  const currentDungeon = computed(() => {
    return dungeons.value.find(
      (dungeon) => dungeon.id === currentDungeonId.value,
    );
  });

  // Actions
  function saveDungeons() {
    localStorage.setItem('dungeons', JSON.stringify(dungeons.value));
  }

  function loadDungeons() {
    const savedDungeons = localStorage.getItem('dungeons');
    if (savedDungeons) {
      dungeons.value = JSON.parse(savedDungeons);
      currentDungeonId.value = dungeons.value.length
        ? dungeons.value[0].id
        : null;
    }
  }

  function selectDungeon(dungeonId) {
    currentDungeonId.value = dungeonId;
  }

  function createNewDungeon() {
    form.adjective = '';
    form.setting_type = '';
    form.place_name = '';
    form.place_lore = '';
    currentDungeonId.value = null;
  }

  function deleteDungeon(dungeonId) {
    const index = dungeons.value.findIndex(
      (dungeon) => dungeon.id === dungeonId,
    );
    if (index !== -1) {
      dungeons.value.splice(index, 1);
      // If the deleted dungeon was the current one, reset selection
      if (currentDungeonId.value === dungeonId) {
        currentDungeonId.value = dungeons.value.length
          ? dungeons.value[0].id
          : null;
      }
      saveDungeons();
    }
  }

  // Reactive form data
  const form = ref({
    adjective: '',
    setting_type: '',
    place_name: '',
    place_lore: '',
  });

  async function generateDungeonOverview() {
    try {
      loadingOverview.value = true;
      const prompt = dungeonOverviewPrompt(
        form.value.adjective,
        form.value.setting_type,
        form.value.place_name,
        form.value.place_lore,
      );

      const response = await generateGptResponse(
        prompt,
        validateDungeonOverview,
      );
      const overview = JSON.parse(response);

      // Create a new dungeon object
      const newDungeon = {
        id: Date.now(), // Simple unique ID using timestamp
        dungeonOverview: overview,
        rooms: null,
        roomDescriptions: null,
        roomNames: [],
      };

      // Add the new dungeon to the dungeons array
      dungeons.value.push(newDungeon);
      currentDungeonId.value = newDungeon.id;

      loadingOverview.value = false;
      saveDungeons();
    } catch (error) {
      loadingOverview.value = false;
      console.error('Error generating dungeon overview:', error);
    }
  }

  function generateMap() {
    if (!currentDungeon.value) {
      console.error('No dungeon selected');
      return;
    }

    let dungeonRoomArray = generateDungeon();
    addDungeonDetails(dungeonRoomArray);

    // Generate room descriptions
    const roomDescriptions = createRoomDescriptions(dungeonRoomArray);
    console.log('Room Descriptions:', roomDescriptions);

    // Assign descriptions to rooms
    dungeonRoomArray.forEach((room, index) => {
      room.shortDescription = roomDescriptions[index + 1];
    });

    // Update the current dungeon
    currentDungeon.value.rooms = dungeonRoomArray;
    currentDungeon.value.roomDescriptions = roomDescriptions;

    saveDungeons();
  }

  function handleUpdateRoomDescription({ roomId, contentArray, name }) {
    if (!currentDungeon.value) return;

    const room = currentDungeon.value.rooms.find((room) => room.id === roomId);
    if (room) {
      room.contentArray = contentArray;
      room.name = name; // or room.roomName = name
      currentDungeon.value.roomNames =
        currentDungeon.value.rooms.map((room) => room.name).filter(Boolean) ||
        [];

      // Save the updated dungeons data
      saveDungeons();
    } else {
      console.error(`Room with ID ${roomId} not found in currentDungeon`);
    }
  }

  return {
    // State
    dungeons,
    currentDungeonId,
    loadingOverview,
    selectedRoomId,
    lastClickedRoomX,
    isMapSidebarCollapsed,
    activeTabIndex,

    // Getters
    currentDungeon,

    // Actions
    saveDungeons,
    loadDungeons,
    selectDungeon,
    createNewDungeon,
    deleteDungeon,
    generateDungeonOverview,
    generateMap,
    handleUpdateRoomDescription,

    // Form data
    form,
  };
});
