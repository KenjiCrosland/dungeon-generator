<template>
  <div class="app-container">
    <cdr-button modifier="secondary" class="sidebar-toggle" @click="isSidebarVisible = !isSidebarVisible"
      v-show="windowWidth <= 1020">
      <template #icon-left>
        <icon-navigation-menu inherit-color />
      </template>
      {{ isSidebarVisible ? 'Hide Sidebar' : 'Show Sidebar' }}
    </cdr-button>
    <!-- Overlay to close sidebar on click -->
    <div class="overlay" v-show="isSidebarVisible && windowWidth <= 1020" @click="isSidebarVisible = false"></div>
    <div class="sidebar" :style="sidebarStyle">
      <ul class="saved-dungeons">
        <li v-for="(dungeon) in dungeons" :key="dungeon.id" :class="{ active: currentDungeonId === dungeon.id }">
          <button class="dungeon-button" @click="selectDungeon(dungeon.id)">
            <span>{{ dungeon.dungeonOverview.title }}</span>
          </button>
        </li>
        <li>
          <button class="dungeon-button" @click="createNewDungeon" :class="{ active: currentDungeonId === null }">
            + New Dungeon
          </button>
        </li>
      </ul>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div v-if="!currentDungeon && !loadingOverview" class="dungeon-overview-form">
        <h3>Create Dungeon Overview</h3>
        <form @submit.prevent="generateDungeonOverview">
          <cdr-form-group>
            <div class="generator-fields">
              <cdr-input class="generator-field-input" id="adjective" v-model="form.adjective" background="secondary"
                label="Adjective">
                <template #helper-text-bottom>
                  Examples: "Forgotten", "Decaying", "Sunken"
                </template>
              </cdr-input>
              <cdr-input class="generator-field-input" id="setting_type" v-model="form.setting_type"
                background="secondary" label="Type of Dungeon">
                <template #helper-text-bottom>
                  Examples: "Temple", "Fortress", "Outpost", "Catacombs"
                </template>
              </cdr-input>
              <p style="text-align: center;">Of</p>
              <cdr-input class="generator-field-input" id="place_name" v-model="form.place_name" background="secondary"
                label="Place Name">
                <template #helper-text-bottom>
                  Examples: "Forgotten Sun", "Grimhold", "Farwatch Outpost", "The Undercity"
                </template>
              </cdr-input>
            </div>
            <div class="lore-field-input">
              <cdr-input :rows="5" tag="textarea" v-model="form.place_lore" background="secondary" label="Dungeon Lore"
                placeholder="Enter any additional details about the dungeon">
                <template #helper-text-bottom>
                  Write any details about your dungeon that you want to include. Need help coming up
                  with lore for your setting? Use the
                  <cdr-link href="https://cros.land/ai-powered-lore-and-timeline-generator/">Lore Generator</cdr-link>
                  and paste in the generated summary!
                </template>
              </cdr-input>
            </div>
          </cdr-form-group>
          <cdr-button type="submit" modifier="dark">Generate Overview</cdr-button>
        </form>
      </div>

      <Tabs v-if="currentDungeon || loadingOverview" :activeIndex="activeTabIndex" @tab-changed="onTabChanged">
        <TabPanel label="Overview">
          <OverviewSkeleton v-if="loadingOverview" />
          <div v-if="currentDungeon && currentDungeon.dungeonOverview" class="dungeon-overview">
            <h2>{{ currentDungeon.dungeonOverview.title }}</h2>
            <p>{{ currentDungeon.dungeonOverview.overview }}</p>
            <p class="description-text">
              {{ currentDungeon.dungeonOverview.relation_to_larger_setting }}
              {{ currentDungeon.dungeonOverview.finding_the_dungeon }}
            </p>
            <p class="description-text">{{ currentDungeon.dungeonOverview.history }}</p>
            <p class="description-text">
              {{ currentDungeon.dungeonOverview.dominant_power }}
              {{ currentDungeon.dungeonOverview.dominant_power_goals }}
              {{ currentDungeon.dungeonOverview.dominant_power_minions }}
            </p>
            <p class="description-text">
              {{ currentDungeon.dungeonOverview.dominant_power_event }}
              {{ currentDungeon.dungeonOverview.recent_event_consequences }}
            </p>
            <p class="description-text">
              {{ currentDungeon.dungeonOverview.secondary_power }}
              {{ currentDungeon.dungeonOverview.secondary_power_event }}
            </p>
            <p class="description-text">
              {{ currentDungeon.dungeonOverview.main_problem }}
              {{ currentDungeon.dungeonOverview.potential_solutions }}
            </p>
            <p class="description-text">{{ currentDungeon.dungeonOverview.conclusion }}</p>
          </div>
        </TabPanel>
        <TabPanel label="Map">
          <!-- Container for the map and sidebar -->
          <div class="map-and-sidebar-container">
            <!-- Dungeon Map Wrapper -->
            <div class="dungeon-map-wrapper" ref="mapWrapper">
              <!-- Dungeon Map Container -->
              <div class="dungeon-map-container">
                <div v-if="currentDungeon && currentDungeon.rooms" ref="mapContainer">
                  <DungeonMap :rooms="currentDungeon.rooms" @roomClicked="handleRoomClick"
                    @mapClicked="handleMapClick" />
                </div>
              </div>
            </div>
            <MapSidebar v-model:isCollapsed="isMapSidebarCollapsed" :style="{ height: mapContainerHeight || 'auto' }"
              ref="mapSidebarRef">
              <RoomDescription v-if="!isMapSidebarCollapsed" :currentDungeon="currentDungeon"
                :selectedRoomId="selectedRoomId" :selectedRoomDescription="selectedRoomDescription"
                @updateRoomDescription="handleUpdateRoomDescription" />
            </MapSidebar>
          </div>
          <div v-if="currentDungeon && !currentDungeon.rooms">
            <p>Generate a Map for your dungeon</p>
          </div>
          <cdr-button @click="generateMap" modifier="dark">
            {{ currentDungeon && currentDungeon.rooms ? 'Re-generate Map' : 'Generate Map' }}
          </cdr-button>
        </TabPanel>
        <TabPanel label="NPCs">
          <h3>NPC List:</h3>
          <cdr-accordion-group v-if="currentDungeon && currentDungeon.dungeonOverview">
            <cdr-accordion v-for="npc in currentDungeon.dungeonOverview.npc_list" :key="npc.name" :id="npc.name"
              level="4" @accordion-toggle="npc.open = !npc.open" :opened="npc.open">
              <template #label>
                {{ npc.name }}
              </template>
              <div>
                <p><strong>Description:</strong> {{ npc.description }}</p>
              </div>
            </cdr-accordion>
          </cdr-accordion-group>
        </TabPanel>
      </Tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import DungeonMap from './DungeonMap.vue';
import { createRoomDescriptions } from '../util/create-room-descriptions.mjs';
import { generateDungeon } from '../util/generate-dungeon.mjs';
import { addDungeonDetails } from '../util/dungeon-details.mjs';
import { generateGptResponse } from '../util/open-ai.mjs';
import { dungeonOverviewPrompt, validateDungeonOverview } from '../prompts/dungeon-overview.mjs';
import Tabs from './tabs/Tabs.vue';
import TabPanel from './tabs/TabPanel.vue';
import RoomDescription from './RoomDescription.vue';
import OverviewSkeleton from './skeletons/OverviewSkeleton.vue';
import MapSidebar from './MapSidebar.vue';
import {
  CdrInput,
  CdrButton,
  CdrLink,
  CdrAccordionGroup,
  CdrAccordion,
  CdrText,
  CdrFormGroup,
  IconNavigationMenu
} from '@rei/cedar';
const windowWidth = ref(window.innerWidth);
const isSidebarVisible = ref(false); // Start hidden on mobile

const mapContainer = ref(null);
const mapWrapper = ref(null); // Reference to the map wrapper
const mapSidebarRef = ref(null); // Reference to the map sidebar component
const mapContainerHeight = ref('auto');
const loadingOverview = ref(false);
const activeTabIndex = ref(0);
const isMapSidebarCollapsed = ref(true);
const lastClickedRoomX = ref(null);


// Clean up the event listener when the component is unmounted
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateMapContainerHeight);
});

const updateMapContainerHeight = () => {
  if (mapContainer.value) {
    mapContainerHeight.value = `${mapContainer.value.clientHeight}px`;
    console.log('Map Container Height:', mapContainerHeight.value);
  }
};

function onTabChanged(index) {
  activeTabIndex.value = index;
  updateMapContainerHeight();
};

watch(
  () => activeTabIndex.value,
  (newIndex) => {
    console.log('Watcher detected tab change:', newIndex);
    if (newIndex === 1) {
      nextTick(() => {
        updateMapContainerHeight();
      });
    }
  }
);

const sidebarStyle = computed(() => {
  if (windowWidth.value <= 1020) {
    return {
      position: 'fixed',
      transform: isSidebarVisible.value ? 'translateX(0)' : 'translateX(-100%)',
      width: '70%', // Adjust width for mobile
      maxWidth: '400px'
    };
  } else {
    return {
      width: '400px',
      position: 'static',
      transform: 'none'
    };
  }
});

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};
// Update based on viewport size immediately and on resize
const updateVisibility = () => {
  if (window.innerWidth > 768) {
    isSidebarVisible.value = true;  // Always show on desktop
  } else {
    isSidebarVisible.value = false;  // Manage with toggle button on mobile
  }
};

onMounted(() => {
  loadDungeons();
  window.addEventListener('resize', updateWindowWidth);
});

// Reactive properties
const dungeons = ref([]);
const currentDungeonId = ref(null);
const fullRoomDescription = ref(null);

const currentDungeon = computed(() => {
  return dungeons.value.find(dungeon => dungeon.id === currentDungeonId.value);
});

// Reactive form data
const form = reactive({
  adjective: '',
  setting_type: '',
  place_name: '',
  place_lore: '',
});

// Function to handle room click
const selectedRoomId = ref(null);
const selectedRoomDescription = ref('');

watch(
  () => isMapSidebarCollapsed.value,
  (newVal, oldVal) => {
    // Check if the sidebar has changed from collapsed to expanded
    if (oldVal === true && newVal === false) {
      // If a room is selected, adjust the map scroll position
      if (selectedRoomId.value !== null) {
        adjustMapScrollPositionForSelectedRoom();
      }
    }
  }
);


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

function handleMapClick() {
  // Collapse the map sidebar if it's not already collapsed
  if (!isMapSidebarCollapsed.value) {
    isMapSidebarCollapsed.value = true;
  }
}

function handleRoomClick({ roomId, x }) {
  selectedRoomId.value = roomId;
  lastClickedRoomX.value = x;

  if (currentDungeon.value && currentDungeon.value.roomDescriptions) {
    selectedRoomDescription.value = currentDungeon.value.roomDescriptions[roomId];
  }

  // Reset or load fullRoomDescription
  if (currentDungeon.value) {
    const room = currentDungeon.value.rooms.find((room) => room.id === roomId);
    if (room && room.fullDescription) {
      fullRoomDescription.value = room.fullDescription;
    } else {
      fullRoomDescription.value = null;
    }
  }

  if (isMapSidebarCollapsed.value) {
    isMapSidebarCollapsed.value = false;
    // No need to adjust the map scroll position here; the watcher will handle it
  } else {
    // Sidebar is already expanded; adjust the map scroll position immediately
    adjustMapScrollPosition(x);
  }
};

function adjustMapScrollPosition(roomX) {
  const sidebarWidth = 300; // Adjust based on your actual sidebar width
  const padding = 20; // Optional padding to avoid the room being right at the edge

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


// Save Dungeons to Local Storage
const saveDungeons = () => {
  localStorage.setItem('dungeons', JSON.stringify(dungeons.value));
};

// Load Dungeons from Local Storage
const loadDungeons = () => {
  const savedDungeons = localStorage.getItem('dungeons');
  if (savedDungeons) {
    dungeons.value = JSON.parse(savedDungeons);
    currentDungeonId.value = dungeons.value.length ? dungeons.value[0].id : null;
  }
};

// Generate Dungeon Overview
const generateDungeonOverview = async () => {
  try {
    loadingOverview.value = true;
    const prompt = dungeonOverviewPrompt(
      form.adjective,
      form.setting_type,
      form.place_name,
      form.place_lore,
    );

    const response = await generateGptResponse(prompt, validateDungeonOverview);
    const overview = JSON.parse(response);

    // Create a new dungeon object
    const newDungeon = {
      id: Date.now(), // Simple unique ID using timestamp
      dungeonOverview: overview,
      rooms: null,
      roomDescriptions: null,
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
};

// function handleUpdateFullRoomDescription({ roomId, roomDescription }) {
//   if (!currentDungeon.value) return;
//   const room = currentDungeon.value.rooms.find((room) => room.id === roomId);
//   if (room) {
//     room.fullDescription = roomDescription;
//   }
//   saveDungeons();
// }

function handleUpdateRoomDescription({ roomId, contentArray, name }) {
  if (!currentDungeon.value) return;

  const room = currentDungeon.value.rooms.find((room) => room.id === roomId);
  if (room) {
    room.contentArray = contentArray;
    room.name = name; // or room.roomName = name

    // Save the updated dungeons data
    saveDungeons();
  } else {
    console.error(`Room with ID ${roomId} not found in currentDungeon`);
  }
}

// Generate Map
const generateMap = () => {
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
    room.description = roomDescriptions[index];
  });

  // Update the current dungeon
  currentDungeon.value.rooms = dungeonRoomArray;
  currentDungeon.value.roomDescriptions = roomDescriptions;

  saveDungeons();
  nextTick(() => {
    updateMapContainerHeight();
  });
};

// Select Dungeon
const selectDungeon = (dungeonId) => {
  currentDungeonId.value = dungeonId;
};

// Delete Dungeon
const deleteDungeon = (dungeonId) => {
  const index = dungeons.value.findIndex(dungeon => dungeon.id === dungeonId);
  if (index !== -1) {
    dungeons.value.splice(index, 1);
    // If the deleted dungeon was the current one, reset selection
    if (currentDungeonId.value === dungeonId) {
      currentDungeonId.value = dungeons.value.length ? dungeons.value[0].id : null;
    }
    saveDungeons();
  }
};

// Create New Dungeon (Reset Form)
const createNewDungeon = () => {
  form.adjective = '';
  form.setting_type = '';
  form.place_name = '';
  form.place_lore = '';
  currentDungeonId.value = null;
};
</script>

<style scoped lang="scss">
@import '@rei/cdr-tokens/dist/rei-dot-com/scss/cdr-tokens.scss';
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

.app-container {
  display: flex;
}

.map-and-sidebar-container {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  overflow: hidden;
  position: relative;
  /* Add position relative if the sidebar is absolutely positioned */
}

.dungeon-map-wrapper {
  background-color: #f3f3e8;
  overflow-x: scroll;
  flex: 1;
}

.dungeon-map-container {
  min-width: 100%;
  /* Or set a specific width if needed */
}

.map-sidebar {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 450px;
  flex: 0 0 auto;
  /* Sidebar doesn't shrink */
}

.selected-room-description,
.full-room-description {
  /* Optional: Add styles for content inside the sidebar */
}

/* Sidebar Styles */
.sidebar {
  width: 250px;
  background-color: #f4f4f4;
  padding: 1rem;
  height: 100vh;
  overflow-y: auto;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 3;

  .saved-dungeons {
    list-style: none;
    padding: 0;

    li {
      margin-bottom: 10px;

      &.active .dungeon-button {
        background-color: #e0e0e0;
        font-weight: bold;
      }

      .dungeon-button {
        width: 100%;
        display: flex;
        justify-content: space-between;
        padding: 12px 20px;
        font-size: 1.5rem;
        text-align: left;
        background-color: #e0e0e0;
        border: none;
        color: inherit;
        cursor: pointer;
        border-left: 5px solid transparent;
        transition: background-color 0.3s, border-left-color 0.3s;

        &:hover {
          background-color: #f0f0f0;
        }

        &:focus {
          outline: none;
          border-left-color: #007BFF;
        }

        &.active {
          background-color: #ffffff;
          border-left-color: #007BFF;
          font-weight: bold;
        }
      }
    }
  }

  .new-dungeon-button {
    width: 100%;
    margin-top: 1rem;
  }
}

/* Overlay for mobile sidebar */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2;
}

/* Sidebar Toggle Button */
.sidebar-toggle {
  display: none;
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 1001;

  @media (max-width: 1020px) {
    display: block;
  }
}

/* Main Content Styles */
.main-content {
  flex: 1;
  margin-left: 250px;
  padding: 2rem;
  max-width: 800px;
  margin: 3rem auto;
  box-shadow: 0 4px 6px #0000001a;
  border-radius: 5px;
  background-color: #ffffff;

  .description-text {
    margin-bottom: 1.6rem;
  }

  .dungeon-overview-form {
    margin-top: 20px;

    h3 {
      margin-top: 0;
    }

    .generator-fields {
      display: flex;
      gap: 2rem;
      align-items: center;
    }

    .lore-field-input {
      margin-top: 1rem;
    }
  }

  .dungeon-overview {
    h2 {
      margin-top: 0;
    }

    p {
      margin-bottom: 1rem;
    }
  }

  .selected-room-description {
    margin-top: 2rem;

    h2 {
      margin-bottom: 1rem;
    }
  }
}

/* Adjust main content when sidebar is hidden */
@media (max-width: 1020px) {
  .main-content {
    margin-left: 0;
  }

  .sidebar {
    transform: translateX(-250px);
    transition: transform 0.3s ease;

    &.visible {
      transform: translateX(0);
    }
  }
}

/* Responsive design for smaller screens */
@media (max-width: 768px) {
  .app-container {
    flex-direction: column;
  }

  .main-content {
    margin: 0 auto;
    padding: 1rem;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-250px);
    transition: transform 0.3s ease;
    z-index: 1000;

    &.visible {
      transform: translateX(0);
    }
  }

  .overlay {
    display: block;
  }
}
</style>
