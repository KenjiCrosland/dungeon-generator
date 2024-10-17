<template>
  <div class="map-and-sidebar-container">
    <!-- Dungeon Map Wrapper -->
    <div class="dungeon-map-wrapper" ref="mapWrapper">
      <!-- Dungeon Map Container -->
      <div class="dungeon-map-container">
        <div v-if="currentDungeon && currentDungeon.rooms" ref="mapContainer">
          <DungeonMap :rooms="currentDungeon.rooms" @roomClicked="handleRoomClick" @mapClicked="handleMapClick" />
        </div>
        <!-- Generate Map Button -->
        <div v-else>
          <p>Generate a Map for your dungeon</p>
          <cdr-button @click="generateMap" modifier="dark">
            {{ currentDungeon && currentDungeon.rooms ? 'Re-generate Map' : 'Generate Map' }}
          </cdr-button>
        </div>
      </div>
    </div>

    <!-- Map Sidebar -->
    <MapSidebar v-model:isCollapsed="isMapSidebarCollapsed" :style="{ height: mapContainerHeight || 'auto' }"
      ref="mapSidebarRef" :key="sidebarContentKey">
      <template #default>
        <!-- Selected Room Description -->
        <div v-if="!fullRoomDescription" class="selected-room-description">
          <h2>Room {{ selectedRoomId }} Description</h2>
          <p>{{ selectedRoomDescription }}</p>
          <!-- Button to generate full description -->
          <cdr-button @click="generateFullRoomDescription" modifier="dark">
            Generate Full Description
          </cdr-button>
        </div>

        <!-- Full Room Description -->
        <div v-if="fullRoomDescription" class="full-room-description">
          <h3>{{ fullRoomDescription.name }}</h3>
          <p><strong>Description:</strong> {{ fullRoomDescription.description }}</p>
          <p><strong>Contents:</strong> {{ fullRoomDescription.contents }}</p>
          <p><strong>Hazards:</strong> {{ fullRoomDescription.hazards }}</p>

          <!-- Display clues if present -->
          <div v-if="fullRoomDescription.clues_for_key_door && fullRoomDescription.clues_for_key_door.length">
            <h4>Clues for Key Door:</h4>
            <ul>
              <li v-for="(clue, index) in fullRoomDescription.clues_for_key_door" :key="index">
                {{ clue }}
              </li>
            </ul>
          </div>

          <!-- Display key description if present -->
          <div v-if="fullRoomDescription.key_description">
            <h4>Key Description:</h4>
            <p>{{ fullRoomDescription.key_description }}</p>
          </div>

          <!-- NPCs -->
          <div v-if="fullRoomDescription.npcs && fullRoomDescription.npcs.length">
            <h4>NPCs:</h4>
            <ul>
              <li v-for="npc in fullRoomDescription.npcs" :key="npc.name">
                <strong>{{ npc.name }}:</strong> {{ npc.description }}
              </li>
            </ul>
          </div>

          <!-- Button to re-generate full description -->
          <cdr-button @click="generateFullRoomDescription" modifier="dark">
            Re-generate Full Description
          </cdr-button>
        </div>
      </template>
    </MapSidebar>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick, watch, defineProps, defineEmits } from 'vue';
import DungeonMap from './DungeonMap.vue';
import MapSidebar from './MapSidebar.vue';
import { createRoomDescriptions } from '../util/create-room-descriptions.mjs';
import { generateDungeon } from '../util/generate-dungeon.mjs';
import { addDungeonDetails } from '../util/dungeon-details.mjs';
import { generateGptResponse } from '../util/open-ai.mjs';
import { dungeonRoomPrompt, validateRoomDescription } from '../prompts/dungeon-room.mjs';
import { CdrButton } from '@rei/cedar';

// Define props
const props = defineProps({
  currentDungeon: {
    type: Object,
    required: false,
  },
});

// Define emits
const emit = defineEmits(['update-dungeon']);

// Refs and reactive variables
const mapContainer = ref(null);
const mapWrapper = ref(null);
const mapSidebarRef = ref(null);
const mapContainerHeight = ref('auto');
const isMapSidebarCollapsed = ref(true);
const lastClickedRoomX = ref(null);
const selectedRoomId = ref(null);
const selectedRoomDescription = ref('');
const fullRoomDescription = ref(null);

// Watchers
watch(
  () => isMapSidebarCollapsed.value,
  (newVal, oldVal) => {
    if (oldVal === true && newVal === false) {
      if (selectedRoomId.value !== null) {
        adjustMapScrollPositionForSelectedRoom();
      }
    }
  }
);

// Update map container height
const updateMapContainerHeight = () => {
  if (mapContainer.value) {
    mapContainerHeight.value = `${mapContainer.value.clientHeight}px`;
  }
};

// Handle tab change (if needed)
onMounted(() => {
  updateMapContainerHeight();
  window.addEventListener('resize', updateMapContainerHeight);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateMapContainerHeight);
});
const sidebarContentKey = ref(0);

// Handle room click
function handleRoomClick({ roomId, x }) {
  selectedRoomId.value = roomId;
  lastClickedRoomX.value = x;

  if (props.currentDungeon && props.currentDungeon.roomDescriptions) {
    selectedRoomDescription.value = props.currentDungeon.roomDescriptions[roomId];
  }

  // Reset or load fullRoomDescription
  if (props.currentDungeon) {
    const room = props.currentDungeon.rooms.find((room) => room.id === roomId);
    if (room && room.fullDescription) {
      fullRoomDescription.value = room.fullDescription;
    } else {
      fullRoomDescription.value = null;
    }
  }

  if (isMapSidebarCollapsed.value) {
    isMapSidebarCollapsed.value = false;
    // Map scroll adjustment will be handled by the watcher
  } else {
    adjustMapScrollPosition(x);
  }
  sidebarContentKey.value += 1;
}

// Handle map click (no room selected)
function handleMapClick() {
  // Collapse the map sidebar if it's not already collapsed
  if (!isMapSidebarCollapsed.value) {
    isMapSidebarCollapsed.value = true;
  }

  // Clear selected room data
  selectedRoomId.value = null;
  selectedRoomDescription.value = '';
  lastClickedRoomX.value = null;
  fullRoomDescription.value = null;
}

// Adjust map scroll position for selected room
function adjustMapScrollPositionForSelectedRoom() {
  if (lastClickedRoomX.value !== null) {
    const roomX = lastClickedRoomX.value;

    // Wait for the sidebar transition to complete
    nextTick(() => {
      const sidebarElement = mapSidebarRef.value?.$el;

      if (sidebarElement) {
        const onTransitionEnd = (event) => {
          if (event.propertyName === 'width') {
            sidebarElement.removeEventListener('transitionend', onTransitionEnd);
            adjustMapScrollPosition(roomX);
          }
        };

        sidebarElement.addEventListener('transitionend', onTransitionEnd);
      } else {
        adjustMapScrollPosition(roomX);
      }
    });
  }
}

// Adjust map scroll position
function adjustMapScrollPosition(roomX) {
  const padding = 20; // Optional padding to avoid the room being right at the edge

  // Get the actual sidebar width
  let sidebarWidth = 0;
  const sidebarElement = mapSidebarRef.value?.$el;
  if (sidebarElement) {
    sidebarWidth = sidebarElement.offsetWidth;
  }

  if (mapWrapper.value) {
    // Get the current scroll position and visible area
    const scrollLeft = mapWrapper.value.scrollLeft;
    const visibleWidth = mapWrapper.value.clientWidth;

    // Calculate the position where the sidebar starts in the map
    const sidebarStart = scrollLeft + visibleWidth - sidebarWidth;

    // Check if the room is within the area that will be covered by the sidebar
    if (roomX > sidebarStart) {
      // Calculate how much we need to scroll to bring the room into view
      const scrollAmount = roomX - (scrollLeft + visibleWidth - sidebarWidth) + padding;

      // Scroll the map wrapper left by the calculated amount
      mapWrapper.value.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }
}

// Generate full room description
async function generateFullRoomDescription() {
  try {
    if (!props.currentDungeon || selectedRoomId.value === null) {
      console.error('No room selected');
      return;
    }

    // Get the current room
    const room = props.currentDungeon.rooms.find(
      (room) => room.id === selectedRoomId.value
    );
    if (!room) {
      console.error('Selected room not found');
      return;
    }

    // Get the dungeon overview
    const dungeonOverview = props.currentDungeon.dungeonOverview;

    // Get the room descriptions
    const roomDescriptions = props.currentDungeon.roomDescriptions;

    // Get all rooms
    const rooms = props.currentDungeon.rooms;

    // Generate the prompt
    const prompt = dungeonRoomPrompt(dungeonOverview, room, roomDescriptions, rooms);

    // Generate the room description using GPT
    const response = await generateGptResponse(prompt, validateRoomDescription);

    // Parse the response
    const roomDescription = JSON.parse(response);

    // Update the room in currentDungeon
    room.fullDescription = roomDescription;

    // Update the reactive variable
    fullRoomDescription.value = roomDescription;

    // Emit the updated dungeon to the parent
    emit('update-dungeon', { ...props.currentDungeon });
  } catch (error) {
    console.error('Error generating full room description:', error);
  }
}

// Generate map
function generateMap() {
  if (!props.currentDungeon) {
    console.error('No dungeon selected');
    return;
  }

  let dungeonRoomArray = generateDungeon();
  addDungeonDetails(dungeonRoomArray);

  // Generate room descriptions
  const roomDescriptions = createRoomDescriptions(dungeonRoomArray);

  // Assign descriptions to rooms
  dungeonRoomArray.forEach((room, index) => {
    room.description = roomDescriptions[index];
  });

  // Update the current dungeon
  const updatedDungeon = {
    ...props.currentDungeon,
    rooms: dungeonRoomArray,
    roomDescriptions: roomDescriptions,
  };

  // Emit the updated dungeon to the parent
  emit('update-dungeon', updatedDungeon);
}
</script>

<style scoped lang="scss">
.map-and-sidebar-container {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  overflow: hidden;
  position: relative;
}

.dungeon-map-wrapper {
  background-color: #f3f3e8;
  overflow-x: auto;
  flex: 1;
}

.dungeon-map-container {
  min-width: 100%;
}

.map-sidebar {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 300px;
  flex: 0 0 auto;
}

.selected-room-description,
.full-room-description {
  padding: 1rem;
}

.selected-room-description h2,
.full-room-description h3 {
  margin-top: 0;
}

.cdr-button {
  margin-top: 1rem;
}
</style>
