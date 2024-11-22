<template>
  <div class="app-container">
    <!-- Sidebar Toggle Button -->
    <cdr-button modifier="secondary" class="sidebar-toggle" @click="isSidebarVisible = !isSidebarVisible"
      v-show="windowWidth <= 1020">
      <template #icon-left>
        <icon-navigation-menu inherit-color />
      </template>
      {{ isSidebarVisible ? 'Hide Sidebar' : 'Show Sidebar' }}
    </cdr-button>

    <!-- Overlay to close sidebar on click -->
    <div class="overlay" v-show="isSidebarVisible && windowWidth <= 1020" @click="isSidebarVisible = false"></div>

    <!-- Sidebar -->
    <div class="sidebar" :style="sidebarStyle">
      <ul class="saved-dungeons">
        <li v-for="(dungeon) in dungeonStore.dungeons" :key="dungeon.id"
          :class="{ active: dungeonStore.currentDungeonId === dungeon.id }">
          <button class="dungeon-button" @click="dungeonStore.selectDungeon(dungeon.id)">
            <span>{{ dungeon.dungeonOverview.title }}</span>
          </button>
        </li>
        <li>
          <button class="dungeon-button" @click="dungeonStore.createNewDungeon"
            :class="{ active: dungeonStore.currentDungeonId === null }">
            + New Dungeon
          </button>
        </li>
      </ul>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div v-if="!dungeonStore.currentDungeon && !dungeonStore.loadingOverview" class="dungeon-overview-form">
        <h3>Create Dungeon Overview</h3>
        <form @submit.prevent="dungeonStore.generateDungeonOverview">
          <cdr-form-group>
            <div class="generator-fields">
              <cdr-input class="generator-field-input" id="adjective" v-model="dungeonStore.form.adjective"
                background="secondary" label="Adjective">
                <template #helper-text-bottom>
                  Examples: "Forgotten", "Decaying", "Sunken"
                </template>
              </cdr-input>
              <cdr-input class="generator-field-input" id="setting_type" v-model="dungeonStore.form.setting_type"
                background="secondary" label="Type of Dungeon">
                <template #helper-text-bottom>
                  Examples: "Temple", "Fortress", "Outpost", "Catacombs"
                </template>
              </cdr-input>
              <p style="text-align: center;">Of</p>
              <cdr-input class="generator-field-input" id="place_name" v-model="dungeonStore.form.place_name"
                background="secondary" label="Place Name">
                <template #helper-text-bottom>
                  Examples: "Forgotten Sun", "Grimhold", "Farwatch Outpost", "The Undercity"
                </template>
              </cdr-input>
            </div>
            <cdr-select class="generator-field-select" id="difficulty" v-model="dungeonStore.form.difficulty"
              background="secondary" label="Dungeon Difficulty" :options="difficultyOptions"
              :placeholder="'Select Difficulty'">
              <template #helper-text-bottom>
                Select the desired difficulty tier for the dungeon.
              </template>
            </cdr-select>
            <div class="lore-field-input">
              <cdr-input :rows="5" tag="textarea" v-model="dungeonStore.form.place_lore" background="secondary"
                label="Dungeon Lore" placeholder="Enter any additional details about the dungeon">
                <template #helper-text-bottom>
                  Write any details about your dungeon that you want to include. Need help coming up with lore for your
                  setting? Use the
                  <cdr-link href="https://cros.land/ai-powered-lore-and-timeline-generator/">Lore Generator</cdr-link>
                  and paste in the generated summary!
                </template>
              </cdr-input>
            </div>
          </cdr-form-group>
          <cdr-button type="submit" modifier="dark">Generate Overview</cdr-button>
        </form>
      </div>

      <Tabs v-if="dungeonStore.currentDungeon || dungeonStore.loadingOverview"
        :activeIndex="dungeonStore.activeTabIndex" @tab-changed="onTabChanged">
        <TabPanel label="Overview">
          <OverviewSkeleton v-if="dungeonStore.loadingOverview" />
          <div v-if="dungeonStore.currentDungeon && dungeonStore.currentDungeon.dungeonOverview"
            class="dungeon-overview">
            <h2>{{ dungeonStore.currentDungeon.dungeonOverview.title }}</h2>
            <p>{{ dungeonStore.currentDungeon.dungeonOverview.overview }}</p>
            <p class="description-text">
              {{ dungeonStore.currentDungeon.dungeonOverview.relation_to_larger_setting }}
              {{ dungeonStore.currentDungeon.dungeonOverview.finding_the_dungeon }}
            </p>
            <p class="description-text">{{ dungeonStore.currentDungeon.dungeonOverview.history }}</p>
            <p class="description-text">
              {{ dungeonStore.currentDungeon.dungeonOverview.dominant_power }}
              {{ dungeonStore.currentDungeon.dungeonOverview.dominant_power_goals }}
              {{ dungeonStore.currentDungeon.dungeonOverview.dominant_power_minions }}
            </p>
            <p class="description-text">
              {{ dungeonStore.currentDungeon.dungeonOverview.dominant_power_event }}
              {{ dungeonStore.currentDungeon.dungeonOverview.recent_event_consequences }}
            </p>
            <p class="description-text">
              {{ dungeonStore.currentDungeon.dungeonOverview.secondary_power }}
              {{ dungeonStore.currentDungeon.dungeonOverview.secondary_power_event }}
            </p>
            <p class="description-text">
              {{ dungeonStore.currentDungeon.dungeonOverview.main_problem }}
              {{ dungeonStore.currentDungeon.dungeonOverview.potential_solutions }}
            </p>
            <p class="description-text">{{ dungeonStore.currentDungeon.dungeonOverview.conclusion }}</p>
          </div>
        </TabPanel>

        <TabPanel label="Map">
          <!-- Container for the map and sidebar -->
          <div class="map-and-sidebar-container" ref="mapContainer">
            <!-- Dungeon Map Wrapper -->
            <div class="dungeon-map-wrapper" ref="mapWrapper">
              <!-- Dungeon Map Container -->
              <div v-if="dungeonStore.currentDungeon" class="dungeon-map-container">
                <h4>{{ dungeonStore.currentDungeon.dungeonOverview.title }}</h4>
                <div v-if="dungeonStore.currentDungeon.rooms">
                  <DungeonMap :rooms="dungeonStore.currentDungeon.rooms" @roomClicked="handleRoomClick"
                    @mapClicked="handleMapClick" />
                </div>
                <div class="generate-button-container">
                  <cdr-button @click="handleGenerateMapClick" modifier="dark" size="small">
                    {{ dungeonStore.currentDungeon && dungeonStore.currentDungeon.rooms ? 'Re-generate Map' :
                      'Generate Map'
                    }}
                  </cdr-button>
                </div>
              </div>
            </div>
            <MapSidebar v-model:isCollapsed="dungeonStore.isMapSidebarCollapsed"
              :style="{ height: mapContainerHeight || 'auto' }" ref="mapSidebarRef">
              <RoomDescription v-if="!dungeonStore.isMapSidebarCollapsed" />
            </MapSidebar>
          </div>
          <div v-if="dungeonStore.currentDungeon && !dungeonStore.currentDungeon.rooms">
            <p>Generate a Map for your dungeon</p>
          </div>
        </TabPanel>
        <!-- NPCs TabPanel -->
        <TabPanel label="NPCs">
          <h2>Notable NPCs</h2>

          <!-- NPC List -->
          <cdr-accordion-group v-if="dungeonStore.currentDungeon && dungeonStore.currentDungeon.npcs">
            <cdr-accordion v-for="(npc, index) in dungeonStore.currentDungeon.npcs" :key="index" :id="'npc-' + index"
              :opened="npc.opened" @accordion-toggle="npc.opened = !npc.opened" level="2">
              <template #label>
                {{ npc.name }}
              </template>
              <div>
                <p><strong>Short Description:</strong> {{ npc.short_description }}</p>

                <!-- If NPC has full details, display them -->
                <div v-if="npc.description_of_position">
                  <p><strong>Description of Position:</strong> {{ npc.description_of_position }}</p>
                  <p><strong>Current Location:</strong> {{ npc.current_location }}</p>
                  <p><strong>Distinctive Features or Mannerisms:</strong> {{ npc.distinctive_features_or_mannerisms }}
                  </p>
                  <p><strong>Character Secret:</strong> {{ npc.character_secret }}</p>
                  <h3>Read-Aloud Description</h3>
                  <p>{{ npc.read_aloud_description }}</p>
                  <h3>Relationships</h3>
                  <div v-for="(relationship, relatedNpcName) in npc.relationships" :key="relatedNpcName">
                    <p><strong>{{ relatedNpcName }}:</strong> {{ relationship }}</p>
                  </div>
                  <h3>Roleplaying Tips</h3>
                  <p>{{ npc.roleplaying_tips }}</p>
                </div>

                <!-- If NPC does not have full details, display button to generate them -->
                <div v-else>
                  <cdr-button @click="dungeonStore.generateDungeonNPC(index)"
                    :disabled="dungeonStore.currentlyLoadingNPC">
                    Generate Full Description
                  </cdr-button>
                </div>

                <!-- Delete NPC Button -->
                <cdr-button @click="dungeonStore.deleteNPC(index)">
                  Delete NPC
                </cdr-button>
              </div>
            </cdr-accordion>
          </cdr-accordion-group>

          <!-- Form to Add New NPCs -->
          <h3>Add a New NPC</h3>
          <cdr-input v-model="dungeonStore.npcName" label="NPC Name">
            <template #helper-text-bottom>
              Enter the name of the NPC.
            </template>
          </cdr-input>
          <cdr-input v-model="dungeonStore.npcShortDescription" label="NPC Short Description">
            <template #helper-text-bottom>
              Examples: "A trapped explorer seeking help", "A ghost haunting the corridors", "A lost child"
            </template>
          </cdr-input>
          <cdr-button @click="dungeonStore.addNPC()" :disabled="dungeonStore.currentlyLoadingNPC">
            Add NPC
          </cdr-button>
        </TabPanel>



      </Tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import DungeonMap from './DungeonMap.vue';
import Tabs from './tabs/Tabs.vue';
import TabPanel from './tabs/TabPanel.vue';
import RoomDescription from './RoomDescription.vue';
import OverviewSkeleton from './skeletons/OverviewSkeleton.vue';
import MapSidebar from './MapSidebar.vue';
import {
  CdrInput,
  CdrButton,
  CdrLink,
  CdrSelect,
  CdrAccordionGroup,
  CdrAccordion,
  CdrFormGroup,
  IconNavigationMenu,
} from '@rei/cedar';

import { useDungeonStore } from '../stores/dungeon-store.mjs';

const dungeonStore = useDungeonStore();

const windowWidth = ref(window.innerWidth);
const isSidebarVisible = ref(false); // Start hidden on mobile

const mapContainer = ref(null);
const mapWrapper = ref(null); // Reference to the map wrapper
const mapSidebarRef = ref(null); // Reference to the map sidebar component
const mapContainerHeight = ref('auto');

const difficultyOptions = [
  'Tier 1: Basic - A local hero in the making.',
  'Tier 2: Expert - An established local hero.',
  'Tier 3: Companion - A regional/kingdom hero.',
  'Tier 4: Master - A hero of the world.',
  'Tier 5: Immortal - A hero of the realms.',
]

const selectedRoom = computed(() => {
  if (
    dungeonStore.currentDungeon &&
    dungeonStore.currentDungeon.rooms &&
    dungeonStore.selectedRoomId !== null
  ) {
    return dungeonStore.currentDungeon.rooms.find(
      (room) => room.id === dungeonStore.selectedRoomId
    );
  }
  return null;
});

function selectConnectedRoom(roomId) {
  dungeonStore.selectedRoomId = roomId;

  if (dungeonStore.isMapSidebarCollapsed) {
    dungeonStore.isMapSidebarCollapsed = false;
  }
}

function getRoomName(roomId) {
  const room = dungeonStore.currentDungeon.rooms.find((room) => room.id === roomId);
  return room ? `${room.name || 'Unnamed'}` : `Unnamed`;
}


function formatDoorwayType(type) {
  // Replace hyphens with spaces and capitalize each word
  return type
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}



function updateMapContainerHeight() {
  if (mapContainer.value) {
    mapContainerHeight.value = `${mapContainer.value.clientHeight}px`;
  }
}

function onTabChanged(index) {
  dungeonStore.activeTabIndex = index;
  updateMapContainerHeight();
}

watch(
  () => dungeonStore.activeTabIndex,
  (newIndex) => {
    if (newIndex === 1) {
      nextTick(() => {
        updateMapContainerHeight();
      });
    }
  }
);

function handleGenerateMapClick() {
  if (dungeonStore.currentDungeon && dungeonStore.currentDungeon.rooms) {
    // A map already exists, ask for confirmation
    const confirmed = window.confirm(
      'Are you sure you want to re-generate the map? This will overwrite the existing map and all of its room descriptions.'
    );
    if (confirmed) {
      dungeonStore.generateMap();
    }
  } else {
    // No map exists, generate one directly
    dungeonStore.generateMap();
  }
}


const sidebarStyle = computed(() => {
  if (windowWidth.value <= 1020) {
    return {
      position: 'fixed',
      transform: isSidebarVisible.value ? 'translateX(0)' : 'translateX(-100%)',
      width: '70%', // Adjust width for mobile
      maxWidth: '400px',
    };
  } else {
    return {
      width: '400px',
      position: 'static',
      transform: 'none',
    };
  }
});

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  dungeonStore.loadDungeons();
  window.addEventListener('resize', updateWindowWidth);
});

function handleRoomClick({ roomId, x }) {
  dungeonStore.selectedRoomId = roomId;
  dungeonStore.lastClickedRoomX = x;

  if (dungeonStore.isMapSidebarCollapsed) {
    dungeonStore.isMapSidebarCollapsed = false;
    // No need to adjust the map scroll position here; the watcher will handle it
  } else {
    // Sidebar is already expanded; adjust the map scroll position immediately
    adjustMapScrollPosition(x);
  }
}

function handleMapClick() {
  // Collapse the map sidebar if it's not already collapsed
  if (!dungeonStore.isMapSidebarCollapsed) {
    dungeonStore.isMapSidebarCollapsed = true;
  }
}

function adjustMapScrollPosition(roomX) {
  const sidebarWidth = 450; // Adjust based on your actual sidebar width
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
  min-height: 75vh;
  /* Add position relative if the sidebar is absolutely positioned */
}

.dungeon-map-wrapper {
  background-color: #fafaf6;
  overflow-x: scroll;
  flex: 1;
  display: flex;
  justify-content: center;
}

.dungeon-map-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* Or set a specific width if needed */
}

.map-sidebar {
  position: absolute;
  right: 0;
  top: 0;
  min-height: 75vh;
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

.generate-button-container {
  text-align: center;
  margin-top: 2rem;
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
