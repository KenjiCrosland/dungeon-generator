<template>
  <div>
    <h3>{{ roomName }}</h3>
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
    <cdr-button @click="generateDescription" modifier="dark">
      {{ contentArray.length > 1 ? 'Re-generate Description' : 'Generate Description' }}
    </cdr-button>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { CdrButton } from '@rei/cedar';
import { useDungeonStore } from '../stores/dungeon-store.mjs';
import { useRoomDescription } from '../composables/useRoomDescription.js';

const dungeonStore = useDungeonStore();
const { generateRoomDescription } = useRoomDescription();

const contentArray = ref([]);
const roomName = ref('');

// Watch for changes in selectedRoomId
watch(
  () => dungeonStore.selectedRoomId,
  (newVal) => {
    if (dungeonStore.currentDungeon && newVal !== null) {
      loadRoomData(newVal);
    }
  },
  { immediate: true }
);

function loadRoomData(roomId) {
  const room = dungeonStore.currentDungeon.rooms.find((room) => room.id === roomId);
  if (room) {
    contentArray.value = room.contentArray || [
      { format: 'paragraph', content: 'No description available.' },
    ];
    roomName.value = `${roomId}. ${room.name || `Room ${roomId}`}`;
  } else {
    contentArray.value = [{ format: 'paragraph', content: 'No description available.' }];
    roomName.value = `Room ${roomId}`;
  }
}

async function generateDescription() {
  await generateRoomDescription(dungeonStore.currentDungeon, dungeonStore.selectedRoomId);
  dungeonStore.saveDungeons();
  loadRoomData(dungeonStore.selectedRoomId);
}

onMounted(() => {
  if (dungeonStore.selectedRoomId !== null) {
    loadRoomData(dungeonStore.selectedRoomId);
  }
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
</style>
