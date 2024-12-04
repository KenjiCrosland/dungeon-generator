<template>
  <div>
    <cdr-toggle-group v-if="contentArray.length > 1" v-model="activeView">
      <cdr-toggle-button toggle-value="description">
        Show Description
      </cdr-toggle-button>
      <cdr-toggle-button toggle-value="form">
        Show Form
      </cdr-toggle-button>
    </cdr-toggle-group>
    <h3>{{ roomName }}</h3>
    <div v-if="activeView === 'form'" class="room-form">
      <cdr-input label="Room Name" v-model="roomFormName" :optional="true" />
      <cdr-input label="Short Description" v-model="roomFormShortDescription" :rows="3" :optional="true" />
      <cdr-select label="Include NPC in Room" v-model="selectedNPCName" :options="npcOptions" prompt="Select an NPC"
        :optional="true">
        <template #helper-text-bottom>
          Select an NPC to be present in this room.
        </template>
      </cdr-select>
      <div class="generation-button">
        <cdr-button size="small" @click="generateDescription" modifier="dark">
          Generate Description
        </cdr-button>
      </div>
    </div>
    <div v-if="activeView === 'loading'">
      <RoomSkeleton />
    </div>
    <div v-if="activeView === 'description'">
      <div v-for="(item, index) in contentArray" :key="index">
        <template v-if="item.format === 'read_aloud'">
          <!-- Render read-aloud text in a box with italicized content -->
          <div class="read-aloud-box">
            <p><em>{{ item.content }}</em></p>
          </div>
        </template>
        <template v-else-if="item.format === 'header'">
          <!-- Render header -->
          <h3>{{ item.content }}</h3>
        </template>
        <template v-else-if="item.format === 'paragraph'">
          <!-- Render paragraph -->
          <p>{{ item.content }}</p>
        </template>
      </div>
      <div class="generation-button">
        <cdr-button size="small" @click="generateDescription" modifier="dark">
          Re-Generate Description
        </cdr-button>
      </div>
    </div>
    <div v-if="!dungeonStore.isMapSidebarCollapsed && room && room.doorways && room.doorways.length">
      <h3>Connecting Rooms:</h3>
      <cdr-list class="connecting-room-list">
        <li class="connecting-room" v-for="doorway in room.doorways" :key="doorway.connectedRoomId">
          <cdr-button size="small" modifier="link" @click="selectConnectedRoom(doorway.connectedRoomId)">
            {{ doorway.connectedRoomId }}. {{ getRoomName(doorway.connectedRoomId) }}
          </cdr-button>
        </li>
      </cdr-list>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { CdrButton, CdrList, CdrToggleGroup, CdrToggleButton, CdrInput, CdrSelect } from '@rei/cedar';
import RoomSkeleton from './skeletons/RoomSkeleton.vue';
import { useDungeonStore } from '../stores/dungeon-store.mjs';
import { useRoomDescription } from '../composables/useRoomDescription.js';

const dungeonStore = useDungeonStore();
const { generateRoomDescription } = useRoomDescription();

const contentArray = ref([]);
const roomName = ref('');
const roomFormName = ref('');
const roomFormShortDescription = ref('');
const selectedNPCName = ref(null);
const npcOptions = computed(() => {
  if (dungeonStore.currentDungeon && dungeonStore.currentDungeon.npcs) {
    return ['None', ...dungeonStore.currentDungeon.npcs.map((npc) => npc.name)];
  }
  return ['None'];
});
const room = ref(null);
const activeView = ref('description');

// **Define getRoomName Method**
function getRoomName(roomId) {
  if (!dungeonStore.currentDungeon || !dungeonStore.currentDungeon.rooms) {
    return `Room ${roomId}`;
  }
  const connectedRoom = dungeonStore.currentDungeon.rooms.find(r => r.id === roomId);
  return connectedRoom ? connectedRoom.name || `Room ${roomId}` : `Room ${roomId}`;
}

// **Define selectConnectedRoom Method**
function selectConnectedRoom(roomId) {
  dungeonStore.selectedRoomId = roomId;
}

// Watch for changes in selectedRoomId or currentDungeon
watch(
  () => dungeonStore.selectedRoomId,
  (newVal) => {
    if (dungeonStore.currentDungeon && newVal !== null) {
      loadRoomData(newVal);
    } else {
      return;
    }
  },
  { immediate: true }
);

watch(
  () => dungeonStore.currentDungeon,
  (newVal) => {
    if (newVal && dungeonStore.selectedRoomId !== null) {
      loadRoomData(dungeonStore.selectedRoomId);
    } else {
      return;
    }
  },
  { immediate: true }
);

function loadRoomData(roomId) {
  if (!dungeonStore.currentDungeon || !dungeonStore.currentDungeon.rooms) {
    return;
  }

  room.value = dungeonStore.currentDungeon.rooms.find((room) => room.id === roomId);
  if (room.value) {
    contentArray.value = room.value.contentArray || [
      { format: 'paragraph', content: 'No description available.' },
    ];
    roomName.value = `${roomId}. ${room.value.name || `Room ${roomId}`}`;
    roomFormName.value = room.value.name || '';
    roomFormShortDescription.value = room.value.oneSentenceSummary || '';
    if (contentArray.value.length > 1) {
      activeView.value = 'description';
    } else {
      activeView.value = 'form';
    }
  } else {
    contentArray.value = [{ format: 'paragraph', content: 'No description available.' }];
    roomName.value = `Room ${roomId}`;
  }
}

async function generateDescription() {
  if (!dungeonStore.currentDungeon) {
    console.error('No current dungeon selected.');
    return;
  }

  if (selectedNPCName.value === 'None') {
    selectedNPCName.value = null;
  }
  activeView.value = 'loading';

  // Handle NPC logic here
  let npcData = null;
  if (selectedNPCName.value) {
    // Find the NPC in the dungeon's NPC list
    const npcIndex = dungeonStore.currentDungeon.npcs.findIndex(
      (npc) => npc.name === selectedNPCName.value
    );
    if (npcIndex !== -1) {
      const npc = dungeonStore.currentDungeon.npcs[npcIndex];

      // Check if the NPC has a full description
      if (!npc.complete) {
        // Generate the NPC's full description
        await dungeonStore.generateDungeonNPC(npcIndex);
      }

      // Now retrieve the updated NPC data
      npcData = dungeonStore.currentDungeon.npcs[npcIndex];
      // Ensure npcData has npc_string
      if (!npcData.npc_string) {
        console.error('npc_string not found on npcData');
      }
    }
  }

  // Call generateRoomDescription with npcData
  await generateRoomDescription(
    dungeonStore.currentDungeon,
    dungeonStore.selectedRoomId,
    roomFormName.value,
    roomFormShortDescription.value,
    npcData,
  );

  activeView.value = 'description';
  dungeonStore.saveDungeons();
  loadRoomData(dungeonStore.selectedRoomId);
}

onMounted(() => {
  if (!dungeonStore.currentDungeon || !dungeonStore.currentDungeon.rooms || dungeonStore.currentDungeon.rooms.length === 0) {
    return;
  }

  if (dungeonStore.selectedRoomId === null) {
    dungeonStore.selectedRoomId = dungeonStore.currentDungeon.rooms[0].id;
  }
  loadRoomData(dungeonStore.selectedRoomId);
});
</script>

<style scoped>
.read-aloud-box {
  border: 1px solid #ccc;
  padding: 1em;
  margin: 1em 0;
  background-color: #f9f9f9;
}

.read-aloud-box p {
  font-style: italic;
  margin: 0;
}

.selected-room-description,
.full-room-description {
  margin-top: 1rem;
}

.selected-room-description h2,
.full-room-description h3 {
  margin-bottom: 0.5rem;
}

.generation-button {
  margin-top: 1rem;
  text-align: center;
}

.connecting-room-list {
  margin-top: 0;
  padding-left: 0;
}

.connecting-room {
  list-style: none;
}

.cdr-toggle-group--large_15-2-0 .cdr-toggle-button__item_15-2-0 {
  padding: 0;
}

.room-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background-color: #f3f3e8;
  border-radius: 4px;
  padding: 1rem;
}
</style>
