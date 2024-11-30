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
import {
  createDungeonNPCPrompt,
  createDungeonNPCRelationshipsPrompt,
  validateDungeonNPCResponse,
  validateDungeonNPCRelationshipsResponse,
} from '../prompts/dungeon-npcs.mjs';
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
  // NPC-related state
  const npcName = ref('');
  const npcShortDescription = ref('');
  const currentlyLoadingNPC = ref(false);

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
    form.value.adjective = '';
    form.value.setting_type = '';
    form.value.place_name = '';
    form.value.place_lore = '';
    form.value.difficulty = '';
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
    difficulty: '',
  });

  async function generateDungeonOverview() {
    try {
      loadingOverview.value = true;
      activeTabIndex.value = 0;
      const prompt = dungeonOverviewPrompt(
        form.value.adjective,
        form.value.setting_type,
        form.value.place_name,
        form.value.place_lore,
        form.value.difficulty,
      );
      const response = await generateGptResponse(
        prompt,
        validateDungeonOverview,
      );
      const overview = JSON.parse(response);

      // Create a new dungeon object
      const newDungeon = {
        id: Date.now(),
        dungeonOverview: overview,
        rooms: null,
        roomDescriptions: null,
        roomNames: [],
        npcs: [], // Initialize NPCs array
      };

      // Map npc_list to npcs array
      if (overview.npc_list) {
        newDungeon.npcs = overview.npc_list.map((npc) => ({
          name: npc.name,
          short_description: npc.description,
          opened: false, // Initialize 'opened' property
        }));
      }

      // Add the new dungeon to the dungeons array
      dungeons.value.push(newDungeon);
      currentDungeonId.value = newDungeon.id;

      loadingOverview.value = false;
      form.value.adjective = '';
      form.value.setting_type = '';
      form.value.place_name = '';
      form.value.place_lore = '';
      form.value.difficulty = '';

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
      room.name = name;
      currentDungeon.value.roomNames =
        currentDungeon.value.rooms.map((room) => room.name).filter(Boolean) ||
        [];

      // Save the updated dungeons data
      saveDungeons();
    } else {
      console.error(`Room with ID ${roomId} not found in currentDungeon`);
    }
  }

  function getDungeonOverviewText(overviewObject) {
    if (!overviewObject) {
      return '';
    }
    return Object.values(overviewObject)
      .filter((value) => typeof value === 'string')
      .join('\n');
  }

  function deleteNPC(npcIndex) {
    if (!currentDungeon.value) return;
    currentDungeon.value.npcs.splice(npcIndex, 1);
    saveDungeons();
  }

  async function generateDungeonNPC(npcIndex) {
    if (!currentDungeon.value) {
      console.error('No dungeon selected');
      return;
    }

    try {
      currentlyLoadingNPC.value = true;

      const npc = currentDungeon.value.npcs[npcIndex];
      if (!npc) {
        console.error('NPC not found');
        currentlyLoadingNPC.value = false;
        return;
      }

      const npcName = npc.name;
      const npcShortDescription = npc.short_description;

      const dungeonOverviewText = getDungeonOverviewText(
        currentDungeon.value.dungeonOverview,
      );

      const prompt = createDungeonNPCPrompt(
        npcName,
        dungeonOverviewText,
        npcShortDescription,
      );

      // Generate the NPC description
      const npcResponse = await generateGptResponse(
        prompt,
        validateDungeonNPCResponse,
      );
      const npcData = JSON.parse(npcResponse);

      // Generate relationships and roleplaying tips
      const relationshipsPrompt = createDungeonNPCRelationshipsPrompt(
        npcName,
        npcResponse,
      );
      const relationshipsResponse = await generateGptResponse(
        relationshipsPrompt,
        validateDungeonNPCRelationshipsResponse,
      );
      const relationshipsData = JSON.parse(relationshipsResponse);

      // Combine NPC data
      const completeNPC = { ...npc, ...npcData, ...relationshipsData };
      completeNPC.opened = true; // Open the accordion after generating full description
      completeNPC.complete = true; // Mark the NPC as complete
      completeNPC.npc_string = buildNPCString(npc);

      // Update the NPC in the current dungeon's NPC list
      currentDungeon.value.npcs.splice(npcIndex, 1, completeNPC);

      currentlyLoadingNPC.value = false;

      // Save the updated dungeons data
      saveDungeons();
    } catch (error) {
      console.error('Error generating dungeon NPC:', error);
      currentlyLoadingNPC.value = false;
    }
  }

  function addNPC() {
    if (!currentDungeon.value) {
      console.error('No dungeon selected');
      return;
    }

    const name = npcName.value || 'Unnamed NPC';
    const shortDescription = npcShortDescription.value;
    if (!shortDescription) {
      console.error('NPC short description is required');
      return;
    }

    currentDungeon.value.npcs.push({
      name,
      short_description: shortDescription,
      opened: false, // Initialize 'opened' property
    });

    npcName.value = '';
    npcShortDescription.value = '';

    saveDungeons();
  }

  function buildNPCString(npc) {
    let npcStringParts = [];

    if (npc.name) {
      npcStringParts.push(npc.name);
    }

    if (npc.description_of_position) {
      npcStringParts.push(npc.description_of_position);
    }

    if (npc.current_location) {
      npcStringParts.push(npc.current_location);
    }

    if (npc.distinctive_features_or_mannerisms) {
      npcStringParts.push(npc.distinctive_features_or_mannerisms);
    }

    if (npc.character_secret) {
      npcStringParts.push(npc.character_secret);
    }

    if (npc.relationships && Object.keys(npc.relationships).length > 0) {
      // Concatenate relationships into a single string
      const relationshipsString = Object.entries(npc.relationships)
        .map(
          ([relatedNpcName, relationship]) =>
            `${relatedNpcName}: ${relationship}`,
        )
        .join('\n');
      npcStringParts.push(relationshipsString);
    }

    if (npc.roleplaying_tips) {
      npcStringParts.push(npc.roleplaying_tips);
    }

    // Join all parts with newlines or any other delimiter you prefer
    return npcStringParts.join('\n');
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
    npcName,
    npcShortDescription,
    currentlyLoadingNPC,

    // Getters
    currentDungeon,

    // Actions
    saveDungeons,
    loadDungeons,
    selectDungeon,
    createNewDungeon,
    deleteDungeon,
    generateDungeonOverview,
    generateDungeonNPC,
    deleteNPC,
    addNPC,
    generateMap,
    handleUpdateRoomDescription,

    // Form data
    form,
  };
});
