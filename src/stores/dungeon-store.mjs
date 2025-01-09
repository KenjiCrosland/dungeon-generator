import { defineStore } from 'pinia';
import {
  dungeons,
  currentDungeonId,
  loadingOverview,
  selectedRoomId,
  lastClickedRoomX,
  isMapSidebarCollapsed,
  activeTabIndex,
  npcName,
  npcShortDescription,
  currentlyLoadingNPCs,
  overviewForm,
  monsterLoadingStates,
  currentDungeon,
} from './dungeon-state.mjs';

import { saveDungeons, loadDungeons } from './dungeon-utils.mjs';
import {
  generateDungeonOverview,
  currentDungeonOverviewString,
} from './overview-store.mjs';
import { generateMap, handleUpdateRoomDescription } from './map-store.mjs';
import {
  generateDungeonNPC,
  deleteNPC,
  addNPC,
  npcStatblockLoadingStates,
  generateNPCStatblock,
} from './npc-store.mjs';
import {
  createAndGenerateMonster,
  generateMonsterStatblock,
  generateAndSaveStatblock,
  updateStatblock,
  generateMonsterDescription,
  generateDescriptionAndStatblock,
  deleteMonster,
} from './monster-store.mjs';

export const useDungeonStore = defineStore('dungeon', () => {
  function selectDungeon(dungeonId) {
    currentDungeonId.value = dungeonId;
  }

  function createNewDungeon() {
    overviewForm.value.adjective = '';
    overviewForm.value.setting_type = '';
    overviewForm.value.place_name = '';
    overviewForm.value.place_lore = '';
    overviewForm.value.difficulty = '';
    currentDungeonId.value = null;
  }

  function deleteDungeon(dungeonId) {
    activeTabIndex.value = 0;
    const index = dungeons.value.findIndex(
      (dungeon) => dungeon.id === dungeonId,
    );
    if (index !== -1) {
      dungeons.value.splice(index, 1);
      if (currentDungeonId.value === dungeonId) {
        currentDungeonId.value = dungeons.value.length
          ? dungeons.value[0].id
          : null;
      }
      saveDungeons();
    }
  }

  function deleteAllDungeons() {
    dungeons.value = [];
    currentDungeonId.value = null;
    saveDungeons();
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
    currentlyLoadingNPCs,
    overviewForm,
    monsterLoadingStates,
    currentDungeon,
    currentDungeonOverviewString,

    // Actions
    saveDungeons,
    loadDungeons: () => loadDungeons(currentDungeonId),
    selectDungeon,
    createNewDungeon,
    deleteDungeon,
    deleteAllDungeons,
    generateDungeonOverview,
    generateDungeonNPC,
    deleteNPC,
    addNPC,
    generateNPCStatblock,
    npcStatblockLoadingStates,
    generateMap,
    handleUpdateRoomDescription,
    createAndGenerateMonster,
    generateAndSaveStatblock,
    generateMonsterStatblock,
    generateMonsterDescription,
    generateDescriptionAndStatblock,
    deleteMonster,
    updateStatblock,
  };
});
