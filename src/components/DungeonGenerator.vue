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
        <li v-for="(dungeon, index) in dungeons" :key="dungeon.id" :class="{ active: currentDungeonId === dungeon.id }">
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

      <Tabs v-if="currentDungeon || loadingOverview" :activeIndex="activeTabIndex">
        <TabPanel label="Overview">
          <OverviewSkeleton v-if="loadingOverview" />
          <div v-if="currentDungeon && currentDungeon.dungeonOverview" class="dungeon-overview">
            <h2>{{ currentDungeon.dungeonOverview.title }}</h2>
            <cdr-text>{{ currentDungeon.dungeonOverview.name }}</cdr-text>
            <cdr-text>{{ currentDungeon.dungeonOverview.overview }}</cdr-text>
            <cdr-text>
              {{ currentDungeon.dungeonOverview.relation_to_larger_setting }}
              {{ currentDungeon.dungeonOverview.finding_the_dungeon }}
            </cdr-text>
            <cdr-text>{{ currentDungeon.dungeonOverview.history }}</cdr-text>
            <cdr-text>
              {{ currentDungeon.dungeonOverview.dominant_power }}
              {{ currentDungeon.dungeonOverview.dominant_power_goals }}
              {{ currentDungeon.dungeonOverview.dominant_power_minions }}
            </cdr-text>
            <cdr-text>
              {{ currentDungeon.dungeonOverview.dominant_power_event }}
              {{ currentDungeon.dungeonOverview.recent_event_consequences }}
            </cdr-text>
            <cdr-text>
              {{ currentDungeon.dungeonOverview.secondary_power }}
              {{ currentDungeon.dungeonOverview.secondary_power_event }}
            </cdr-text>
            <cdr-text>
              {{ currentDungeon.dungeonOverview.main_problem }}
              {{ currentDungeon.dungeonOverview.potential_solutions }}
            </cdr-text>
            <cdr-text>{{ currentDungeon.dungeonOverview.conclusion }}</cdr-text>
          </div>
        </TabPanel>
        <TabPanel label="Map">
          <!-- Selected Room Description -->
          <div v-if="currentDungeon && selectedRoomDescription" class="selected-room-description">
            <h2>Room {{ selectedRoomId }} Description</h2>
            <cdr-text>{{ selectedRoomDescription }}</cdr-text>
            <!-- Add button to generate full description -->
            <cdr-button @click="generateFullRoomDescription" modifier="dark">
              {{ fullRoomDescription ? 'Re-generate Full Description' : 'Generate Full Description' }}
            </cdr-button>
          </div>

          <!-- Full Room Description -->
          <div v-if="fullRoomDescription" class="full-room-description">
            <h3>{{ fullRoomDescription.name }}</h3>
            <cdr-text><strong>Description:</strong> {{ fullRoomDescription.description }}</cdr-text>
            <cdr-text><strong>Contents:</strong> {{ fullRoomDescription.contents }}</cdr-text>
            <cdr-text><strong>Hazards:</strong> {{ fullRoomDescription.hazards }}</cdr-text>

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
              <cdr-text>{{ fullRoomDescription.key_description }}</cdr-text>
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
          </div>

          <!-- Dungeon Map -->
          <div v-if="currentDungeon && currentDungeon.rooms" class="dungeon-map-container">
            <DungeonMap :rooms="currentDungeon.rooms" @roomClicked="handleRoomClick" />
          </div>

          <!-- Generate Map Button -->
          <cdr-text v-if="!currentDungeon || !currentDungeon.rooms">
            Generate a Map for your dungeon
          </cdr-text>
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
                <cdr-text><strong>Description:</strong> {{ npc.description }}</cdr-text>
              </div>
            </cdr-accordion>
          </cdr-accordion-group>
        </TabPanel>
      </Tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import DungeonMap from './DungeonMap.vue';
import { createRoomDescriptions } from '../util/create-room-descriptions.mjs';
import { generateDungeon } from '../util/generate-dungeon.mjs';
import { addDungeonDetails } from '../util/dungeon-details.mjs';
import { generateGptResponse } from '../util/open-ai.mjs';
import { dungeonRoomPrompt, validateRoomDescription } from '../prompts/dungeon-room.mjs';
import { dungeonOverviewPrompt, validateDungeonOverview } from '../prompts/dungeon-overview.mjs';
import Tabs from './tabs/Tabs.vue';
import TabPanel from './tabs/TabPanel.vue';
import OverviewSkeleton from './skeletons/OverviewSkeleton.vue';
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

const loadingOverview = ref(false);
const activeTabIndex = ref(0);

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

const handleRoomClick = (roomId) => {
  selectedRoomId.value = roomId;

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
};

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

const generateFullRoomDescription = async () => {
  try {
    if (!currentDungeon.value || selectedRoomId.value === null) {
      console.error('No room selected');
      return;
    }

    // Get the current room
    const room = currentDungeon.value.rooms.find(
      (room) => room.id === selectedRoomId.value
    );
    if (!room) {
      console.error('Selected room not found');
      return;
    }

    // Get the dungeon overview
    const dungeonOverview = currentDungeon.value.dungeonOverview;

    // Get the room descriptions
    const roomDescriptions = currentDungeon.value.roomDescriptions;

    // Get all rooms
    const rooms = currentDungeon.value.rooms;

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

    // Save the dungeons
    saveDungeons();
  } catch (error) {
    console.error('Error generating full room description:', error);
  }
};


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
    @include cdr-text-body-300;

    h2 {
      margin-top: 0;
    }

    cdr-text {
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
