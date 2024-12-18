import { ref, computed } from 'vue';

export const dungeons = ref([]);
export const currentDungeonId = ref(null);
export const loadingOverview = ref(false);
export const selectedRoomId = ref(null);
export const lastClickedRoomX = ref(null);
export const isMapSidebarCollapsed = ref(true);
export const activeTabIndex = ref(0);

// NPC-related
export const npcName = ref('');
export const npcShortDescription = ref('');
export const currentlyLoadingNPCs = ref({});

// Statblocks loading states
export const monsterLoadingStates = ref({});

// Overview form
export const overviewForm = ref({
  adjective: '',
  setting_type: '',
  place_name: '',
  place_lore: '',
  difficulty: '',
});

export const currentDungeon = computed(() => {
  return dungeons.value.find(
    (dungeon) => dungeon.id === currentDungeonId.value,
  );
});
