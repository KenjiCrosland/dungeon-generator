<template>
  <!-- Main Container -->
  <div class="dungeon-container">
    <!-- Main Content Area (Wider Column) -->
    <div class="main-content">
      <!-- Dungeon Map -->
      <DungeonMap :rooms="rooms" @roomClicked="handleRoomClick" />

      <!-- Dungeon Overview Form -->
      <div class="dungeon-overview-form">
        <h3>Create Dungeon Overview</h3>
        <form @submit.prevent="generateDungeonOverview">
          <cdr-input id="adjective" v-model="form.adjective" label="Adjective" :required="true"
            background="secondary"></cdr-input>
          <cdr-input id="setting_type" v-model="form.setting_type" label="Setting Type" :required="true"
            background="secondary"></cdr-input>
          <cdr-input id="place_name" v-model="form.place_name" label="Place Name" :required="true"
            background="secondary"></cdr-input>
          <cdr-input id="place_lore" v-model="form.place_lore" label="Place Lore (Optional)" tag="textarea" :rows="5"
            background="secondary"></cdr-input>
          <cdr-button type="submit" modifier="dark">Generate Overview</cdr-button>
        </form>
      </div>

      <!-- Display Dungeon Overview -->
      <div v-if="dungeonOverview" class="dungeon-overview">
        <h2>{{ dungeonOverview.title }}</h2>
        <cdr-text>{{ dungeonOverview.name }}</cdr-text>
        <cdr-text>{{ dungeonOverview.overview }}</cdr-text>
        <cdr-text>{{ dungeonOverview.relation_to_larger_setting }}</cdr-text>
        <cdr-text>{{ dungeonOverview.history }}</cdr-text>
        <cdr-text>{{ dungeonOverview.dominant_power }} {{ dungeonOverview.dominant_power_goals }} {{
          dungeonOverview.dominant_power_minions
          }}</cdr-text>
        <cdr-text> {{ dungeonOverview.dominant_power_event }} {{ dungeonOverview.recent_event_consequences }}</cdr-text>
        <cdr-text>{{ dungeonOverview.secondary_power }} {{ dungeonOverview.secondary_power_event }}</cdr-text>
        <cdr-text>{{ dungeonOverview.main_problem }} {{ dungeonOverview.potential_solutions }}</cdr-text>
        <cdr-text>{{ dungeonOverview.conclusion }}</cdr-text>

        <!-- NPC List -->
        <h3>NPC List:</h3>
        <cdr-accordion-group>
          <cdr-accordion v-for="npc in dungeonOverview.npc_list" :key="npc.name" :id="npc.name">
            <template #label>
              {{ npc.name }}
            </template>
            <div>
              <cdr-text><strong>Description:</strong> {{ npc.description }}</cdr-text>
            </div>
          </cdr-accordion>
        </cdr-accordion-group>
      </div>
    </div>

    <!-- Sidebar (Smaller Column) -->
    <div class="sidebar">
      <!-- Selected Room Description -->
      <div v-if="selectedRoomDescription" class="selected-room-description">
        <h2>Room {{ selectedRoomId }} Description</h2>
        <cdr-text>{{ selectedRoomDescription }}</cdr-text>
      </div>

      <!-- All Room Descriptions -->
      <div class="all-room-descriptions">
        <h2>All Room Descriptions</h2>
        <cdr-accordion-group>
          <cdr-accordion v-for="(description, id) in roomDescriptions" :key="id" :id="'room-' + id" level="2">
            <template #label>
              Room {{ id }}
            </template>
            <div>
              <cdr-text>{{ description }}</cdr-text>
            </div>
          </cdr-accordion>
        </cdr-accordion-group>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import DungeonMap from './DungeonMap.vue';
import { createRoomDescriptions } from '../util/create-room-descriptions.mjs';
import { generateDungeon } from '../util/generate-dungeon.mjs';
import { addDungeonDetails } from '../util/dungeon-details.mjs';
import { generateGptResponse } from '../util/open-ai.mjs';
import { dungeonOverviewPrompt } from '../prompts/dungeon-overview.mjs';
import {
  CdrInput,
  CdrButton,
  CdrAccordionGroup,
  CdrAccordion,
  CdrText
} from '@rei/cedar';

// Reactive properties for the selected room
const selectedRoomId = ref(null);
const selectedRoomDescription = ref('');

// Reactive form data
const form = reactive({
  adjective: '',
  setting_type: '',
  place_name: '',
  place_lore: '',
});

// Reactive property for the dungeon overview
const dungeonOverview = ref(null);

// Function to handle room click
const handleRoomClick = (roomId) => {
  selectedRoomId.value = roomId;
  selectedRoomDescription.value = roomDescriptions[roomId];
};

// Generate the dungeon and room descriptions
let dungeonRoomArray = generateDungeon();
addDungeonDetails(dungeonRoomArray);
let roomDescriptions = createRoomDescriptions(dungeonRoomArray);

// Reactive property for rooms
const rooms = ref(dungeonRoomArray);

// Function to generate dungeon overview
const generateDungeonOverview = async () => {
  try {
    // Generate the prompt using the form data
    const prompt = dungeonOverviewPrompt(
      form.adjective,
      form.setting_type,
      form.place_name,
      form.place_lore,
    );

    // Display a loading indicator
    dungeonOverview.value = { title: 'Generating dungeon overview...' };

    // Call the GPT function to generate the overview
    const response = await generateGptResponse(prompt, validateDungeonOverview);

    // Parse the JSON response
    dungeonOverview.value = JSON.parse(response);
  } catch (error) {
    console.error('Error generating dungeon overview:', error);
    dungeonOverview.value = {
      title: 'Error',
      overview: 'Failed to generate dungeon overview. Please try again.',
    };
  }
};

// Function to validate the JSON keys in the GPT response
const validateDungeonOverview = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    // Check for required keys
    const requiredKeys = [
      'name',
      'overview',
      'relation_to_larger_setting',
      'history',
      'title',
      'dominant_power',
      'dominant_power_goals',
      'dominant_power_minions',
      'dominant_power_event',
      'recent_event_consequences',
      'secondary_power',
      'secondary_power_event',
      'main_problem',
      'potential_solutions',
      'conclusion',
      'npc_list',
    ];

    for (const key of requiredKeys) {
      if (!(key in data)) {
        return false;
      }
    }

    return true;
  } catch (e) {
    return false;
  }
};
</script>

<style scoped lang="scss">
@import '@rei/cdr-tokens/dist/rei-dot-com/scss/cdr-tokens.scss';

cdr-text {
  @include cdr-text-body-300;
  color: $cdr-color-text-primary;
  text-align: left;
}

/* Container for the dungeon map and descriptions */
.dungeon-container {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
}

/* Main Content Area (Wider Column) */
.main-content {
  flex: 2;
  /* Adjust the flex value to control the width */
  margin-right: 20px;
}

/* Sidebar (Smaller Column) */
.sidebar {
  flex: 1;
  max-width: 350px;
  overflow-y: auto;
}

form {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;

}

/* Styles for the dungeon overview form */
.dungeon-overview-form {
  margin-top: 20px;
}

.dungeon-overview-form form div {
  margin-bottom: 10px;
}

/* Styles for the dungeon overview display */
.dungeon-overview {
  margin-top: 20px;
}

.dungeon-overview p {
  margin-bottom: 10px;
}

.dungeon-overview ul {
  list-style-type: none;
  padding: 0;
}

.dungeon-overview ul li {
  margin-bottom: 15px;
}

/* Styles for the selected room description */
.selected-room-description {
  margin-bottom: 20px;
}

/* Styles for all room descriptions */
.all-room-descriptions {
  margin-top: 20px;
}

.all-room-descriptions ul {
  list-style-type: none;
  padding: 0;
}

.all-room-descriptions li {
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

/* Responsive design for smaller screens */
@media (max-width: 768px) {
  .dungeon-container {
    flex-direction: column;
  }

  .main-content {
    margin-right: 0;
    margin-bottom: 20px;
  }

  .sidebar {
    max-width: 100%;
    width: 100%;
  }
}
</style>
