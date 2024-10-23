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
      <!-- Add more formats if needed -->
    </div>
    <cdr-button @click="generateRoomDescription" modifier="dark">
      {{ contentArray.length > 1 ? 'Re-generate Description' : 'Generate Description' }}
    </cdr-button>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { defineProps, defineEmits } from 'vue';
import { CdrButton } from '@rei/cedar';
import { generateGptResponse } from '../util/open-ai.mjs';

import {
  generateEntrancePrompt,
  validateEntranceResponse,
  processEntranceResponse,
} from '../prompts/dungeon-entrance.mjs';
import {
  generateStandardRoomPrompt,
  validateStandardRoomResponse,
  processStandardRoomResponse,
} from '../prompts/standard-room.mjs';

const props = defineProps({
  currentDungeon: Object, // Entire dungeon object, containing rooms array
  selectedRoomId: [Number, String],
  isMapSidebarCollapsed: Boolean,
  selectedRoomDescription: String,
});

const emit = defineEmits(['updateRoomDescription']);

const contentArray = ref([]);
const roomName = ref('');  // Ref for storing room name

// Watch for room changes
watch(
  () => props.selectedRoomId,
  (newVal) => {
    if (props.currentDungeon && newVal !== null) {
      loadRoomData(newVal); // Load from dungeon object
      const room = props.currentDungeon.rooms.find((room) => room.id === newVal);
      if (room) {
        // Use room name from room object if it exists, or fallback to "ID. Room Name"
        roomName.value = `${newVal}. ${room.name || `Room ${newVal}`}`;
      } else {
        roomName.value = `Room ${newVal}`; // Default room name if not found
      }
    }
  },
  { immediate: true }
);

// Load room name and contentArray from dungeon object
function loadRoomData(roomId) {
  const room = props.currentDungeon.rooms.find((room) => room.id === roomId);
  if (room) {
    contentArray.value = room.contentArray || [{ format: 'paragraph', content: 'No description available.' }];
    roomName.value = `${roomId}. ${room.name || `Room ${roomId}`}`;
  } else {
    contentArray.value = [{ format: 'paragraph', content: 'No description available.' }];
    roomName.value = `Room ${roomId}`;
  }
}

async function generateRoomDescription() {
  try {
    if (!props.currentDungeon || props.selectedRoomId === null) {
      console.error('No room selected');
      return;
    }

    const room = props.currentDungeon.rooms.find(
      (room) => room.id === props.selectedRoomId
    );

    if (!room) {
      console.error('Selected room not found');
      return;
    }

    const isEntrance = props.selectedRoomId === 1;
    const dungeonOverview = props.currentDungeon.dungeonOverview;
    const basicDescription = props.currentDungeon.roomDescriptions[props.selectedRoomId];

    let prompt, validateResponse, processResponse;

    if (isEntrance) {
      prompt = generateEntrancePrompt(dungeonOverview, basicDescription);
      validateResponse = validateEntranceResponse;
      processResponse = processEntranceResponse;
    } else {
      prompt = generateStandardRoomPrompt(dungeonOverview, room);
      validateResponse = validateStandardRoomResponse;
      processResponse = processStandardRoomResponse;
    }

    const response = await generateGptResponse(prompt, validateResponse);
    const roomDescription = JSON.parse(response);

    // Process the room description
    contentArray.value = processResponse(roomDescription);

    // Set room name with ID and new room name (e.g., "1. Entrance")
    const roomNameValue = roomDescription.name || `Room ${props.selectedRoomId}`;
    roomName.value = `${props.selectedRoomId}. ${roomNameValue}`;

    // Emit the updated room data
    emit('updateRoomDescription', {
      roomId: props.selectedRoomId,
      contentArray: contentArray.value,
      name: roomNameValue,
    });

  } catch (error) {
    console.error('Error generating room description:', error);
    contentArray.value = [
      { format: 'paragraph', content: 'An error occurred. Please try again.' },
    ];
  }
}

// Load data from dungeon object when the component is mounted
onMounted(() => {
  if (props.selectedRoomId !== null) {
    loadRoomData(props.selectedRoomId);
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
