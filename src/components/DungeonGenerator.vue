<template>
  <div class="app-container">
    <cdr-button class="delete-dungeon-button" size="small"
      @click="dungeonStore.deleteDungeon(dungeonStore.currentDungeonId)"
      style="position: absolute; top: 10px; right: 10px;">
      Delete Dungeon
    </cdr-button>
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
            <span>{{ dungeon.dungeonOverview.name }}</span>
          </button>
        </li>
        <li>
          <button class="dungeon-button" @click="dungeonStore.createNewDungeon"
            :class="{ active: dungeonStore.currentDungeonId === null }">
            + New Dungeon
          </button>
        </li>
      </ul>
      <div class="copy-buttons">
        <cdr-button @click="copyDungeonasPlainText" modifier="secondary">Copy As Plain Text</cdr-button>
        <cdr-button @click="copyDungeonasHTML" modifier="secondary">Copy As HTML</cdr-button>
        <cdr-button @click="copyDungeonasMarkdown" modifier="secondary">Copy As Homebrewery Markdown</cdr-button>
        <p>Use the above buttons to copy all setting info into your desired format. For homebrewery go <cdr-link
            href="https://homebrewery.naturalcrit.com/new">here</cdr-link> and paste the markdown
          there. You will need to add your own pagebreaks.</p>

        <cdr-button @click="deleteAllDungeons">Delete All Dungeons</cdr-button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div v-if="!dungeonStore.currentDungeon && !dungeonStore.loadingOverview" class="content-container content-form">
        <h1>Kenji's Dungeon Generator 2.0</h1>
        <p>
          Welcome to the Dungeon Generator! Use the form below to create a dungeon overview, generate a map, and add
          NPCs to your dungeon. You can also copy the dungeon information in various formats for use in your campaign.
        </p>
        <h3>Create Dungeon Overview</h3>
        <form @submit.prevent="dungeonStore.generateDungeonOverview">

          <div class="generator-fields">
            <cdr-input class="generator-field-input" inputContainerClass="generator-field-input" id="adjective"
              v-model="dungeonStore.overviewForm.adjective" background="secondary" label="Adjective">
              <template #helper-text-bottom>
                Examples: "Forgotten", "Decaying", "Sunken"
              </template>
            </cdr-input>
            <cdr-input class="generator-field-input" inputContainerClass="generator-field-input" id="setting_type"
              v-model="dungeonStore.overviewForm.setting_type" background="secondary" label="Type of Dungeon">
              <template #helper-text-bottom>
                Examples: "Temple", "Fortress", "Outpost", "Catacombs"
              </template>
            </cdr-input>
            <p style="text-align: center;">Of</p>
            <cdr-input class="generator-field-input" inputContainerClass="generator-field-input" id="place_name"
              v-model="dungeonStore.overviewForm.place_name" background="secondary" label="Place Name">
              <template #helper-text-bottom>
                Examples: "Forgotten Sun", "Grimhold", "Farwatch Outpost", "The Undercity"
              </template>
            </cdr-input>
          </div>
          <cdr-select class="generator-field-select" id="difficulty" v-model="dungeonStore.overviewForm.difficulty"
            background="secondary" label="Dungeon Difficulty" :options="difficultyOptions"
            :placeholder="'Select Difficulty'">
            <template #helper-text-bottom>
              Select the desired difficulty tier for the dungeon.
            </template>
          </cdr-select>
          <div class="lore-field-input">
            <cdr-input :rows="5" tag="textarea" v-model="dungeonStore.overviewForm.place_lore" background="secondary"
              label="Dungeon Lore" placeholder="Enter any additional details about the dungeon">
              <template #helper-text-bottom>
                Write any details about your dungeon that you want to include. Need help coming up with lore for your
                setting? Use the
                <cdr-link href="https://cros.land/ai-powered-lore-and-timeline-generator/">Lore Generator</cdr-link>
                and paste in the generated summary!
              </template>
            </cdr-input>
          </div>
          <cdr-button style="margin-top: 2rem" type="submit" modifier="dark" :full-width="true">Generate
            Overview</cdr-button>
        </form>
      </div>
      <div v-if="dungeonStore.currentDungeon || dungeonStore.loadingOverview" class="content-container">
        <Tabs :activeIndex="dungeonStore.activeTabIndex" @tab-changed="onTabChanged" class="tabs">
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
                {{ dungeonStore.currentDungeon.dungeonOverview.miniboss_description }}
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
              <div class="dungeon-map-wrapper" ref="mapWrapper" @click="handleMapWrapperClick">
                <!-- Dungeon Map Container -->
                <div v-if="dungeonStore.currentDungeon" class="dungeon-map-container" ref="mapContainer">
                  <h4 style="text-align: center">Map of {{ dungeonStore.currentDungeon.dungeonOverview.name }}</h4>
                  <div v-if="dungeonStore.currentDungeon.rooms">
                    <DungeonMap :rooms="dungeonStore.currentDungeon.rooms" @roomClicked="handleRoomClick"
                      ref="dungeonMap" :dungeonName="dungeonStore.currentDungeon.dungeonOverview.name"
                      @mapClicked="handleMapClick" />
                  </div>
                  <div class="generate-button-container">
                    <cdr-button @click="handleGenerateMapClick" modifier="dark" size="small">
                      {{ dungeonStore.currentDungeon && dungeonStore.currentDungeon.rooms ? 'Re-generate Map' :
                        'Generate Map'
                      }}
                    </cdr-button>
                    <cdr-button v-if="mapExists" @click="handleDownloadMapClick" modifier="dark" size="small">
                      Download Map
                    </cdr-button>
                  </div>
                </div>
              </div>
              <MapSidebar v-model:isCollapsed="dungeonStore.isMapSidebarCollapsed" ref="mapSidebarRef"
                :style="mapContainerInlineStyles">
                <RoomDescription v-if="!dungeonStore.isMapSidebarCollapsed" />
              </MapSidebar>
            </div>
          </TabPanel>

          <TabPanel label="NPCs">
            <h2>Notable NPCs</h2>

            <cdr-accordion-group v-if="dungeonStore.currentDungeon && dungeonStore.currentDungeon.npcs">
              <cdr-accordion v-for="(npc, index) in dungeonStore.currentDungeon.npcs" :key="index" :id="'npc-' + index"
                :opened="npc.opened" @accordion-toggle="npc.opened = !npc.opened" level="2">
                <template #label>
                  {{ npc.name }}
                </template>
                <cdr-tooltip id="tooltip-example" position="left" class="delete-button">
                  <template #trigger>
                    <cdr-button size="small" :icon-only="true" :with-background="true"
                      @click="dungeonStore.deleteNPC(index)">
                      <template #icon>
                        <icon-x-sm />
                      </template>
                    </cdr-button>
                  </template>
                  <div>
                    Delete NPC
                  </div>
                </cdr-tooltip>
                <div>
                  <div v-if="dungeonStore.currentlyLoadingNPCs[index]">
                    <NPCSkeleton />
                  </div>
                  <div v-else>
                    <h2>{{ npc.name }}</h2>
                    <div v-if="npc.description_of_position">
                      <div class="read-aloud-box">
                        <p>{{ npc.read_aloud_description }}</p>
                      </div>
                      <p>{{ npc.description_of_position }}</p>
                      <p>{{ npc.why_in_dungeon }}</p>
                      <p>{{ npc.distinctive_features_or_mannerisms }}</p>
                      <p>{{ npc.character_secret }}</p>
                      <h3>Relationships</h3>
                      <div v-for="(relationship, relatedNpcName) in npc.relationships" :key="relatedNpcName">
                        <p><strong>{{ relatedNpcName }}:</strong> {{ relationship }}</p>
                      </div>
                      <h3>Roleplaying Tips</h3>
                      <p>{{ npc.roleplaying_tips }}</p>
                    </div>
                    <div v-if="!npc.description_of_position">
                      <p>{{ npc.short_description }}</p>
                      <cdr-button @click="dungeonStore.generateDungeonNPC(index)"
                        :disabled="dungeonStore.currentlyLoadingNPCs[index]">
                        Generate Full Description
                      </cdr-button>
                    </div>
                  </div>
                </div>
              </cdr-accordion>

            </cdr-accordion-group>

            <h3 style="margin-top: 3rem; margin-bottom: 1rem">Add a New NPC</h3>
            <cdr-form-group :error="modelError">
              <cdr-input v-model="dungeonStore.npcName" label="NPC Name" :required="true" />
              <cdr-input v-model="dungeonStore.npcShortDescription" label="NPC Short Description" :required="true">
                <template #helper-text-bottom>
                  Examples: "A trapped explorer seeking help", "A ghost haunting the corridors", "A lost child"
                </template>
              </cdr-input>
              <cdr-button style="margin-top: 2rem" @click="createNPC" :disabled="dungeonStore.currentlyLoadingNPC">
                Add NPC
              </cdr-button>
            </cdr-form-group>
          </TabPanel>
          <TabPanel label="Statblocks">
            <template #default>
              <div v-if="dungeonStore.currentDungeon
                && dungeonStore.currentDungeon.dungeonOverview
                && dungeonStore.currentDungeon.dungeonOverview.monsters
                && dungeonStore.currentDungeon.dungeonOverview.monsters.length">
                <h2>Dungeon Monsters</h2>
                <cdr-accordion-group>
                  <cdr-accordion v-for="(monster) in dungeonStore.currentDungeon.dungeonOverview.monsters"
                    :key="monster.id" :id="'monster-' + monster.id" :opened="monster.opened"
                    @accordion-toggle="monster.opened = !monster.opened" level="2">

                    <template #label>
                      {{ monster.name }}
                    </template>
                    <div>
                      <h3>{{ monster.name }}</h3>
                      <p>{{ monster.description }}</p>
                      <div
                        v-if="monster.statblock || dungeonStore?.monsterLoadingStates[monster.id]?.part1 || dungeonStore?.monsterLoadingStates[monster.id]?.part2"
                        style="margin-top: 1rem;">
                        <Statblock :monster="monster.statblock" :premium="premium"
                          :loadingPart1="dungeonStore.monsterLoadingStates[monster.id]?.part1 || false"
                          :loadingPart2="dungeonStore.monsterLoadingStates[monster.id]?.part2 || false"
                          @update-monster="updateMonsterStatblock(monster, $event)" />
                      </div>
                      <!-- CR Select -->
                      <cdr-select v-model="monster.CR" label="CR" background="secondary" :options="crOptions"
                        :placeholder="'Select CR'">
                      </cdr-select>
                      <cdr-select v-model="monster.monsterType" label="Type"
                        :options="['Random', 'Stronger Defense', 'Balanced', 'Stronger Offense']" />
                      <!-- Spellcaster Checkbox -->
                      <cdr-checkbox v-model="monster.isSpellcaster">
                        Creature is a spellcaster
                      </cdr-checkbox>
                      <!-- Use store action for generation -->
                      <cdr-button size="small" @click="dungeonStore.generateMonsterStatblock(monster.id, premium)">
                        {{ dungeonStore.monsterLoadingStates[monster.id]?.generating ? 'Generating...' :
                          'Generate Statblock' }}
                      </cdr-button>
                    </div>
                  </cdr-accordion>
                </cdr-accordion-group>
              </div>
              <div v-else>
                <h2>No Monsters</h2>
                <p>No monsters have been generated for this dungeon yet.</p>
              </div>

              <h3 style="margin-top: 3rem; margin-bottom: 1rem">Generate Statblock</h3>
              <cdr-form-group :error="statblockFormError">
                <cdr-input v-model="statblockForm.name" label="Name" />
                <cdr-select v-model="statblockForm.CR" label="CR" background="secondary" :options="crOptions"
                  :placeholder="'Select CR'">
                  <template #helper-text-bottom>
                    Select the CR for this creature.
                  </template>
                </cdr-select>
                <cdr-input tag="textarea" v-model="statblockForm.description" label="Monster Description"
                  background="secondary" :rows="5" placeholder="Describe the monster's abilities, personality, etc." />
                <cdr-checkbox v-model="statblockForm.isSpellcaster">
                  Creature is a spellcaster
                </cdr-checkbox>

                <cdr-button style="margin-top: 2rem" @click="generateStatblock" :disabled="generatingStatblock">
                  {{ generatingStatblock ? 'Generating...' : 'Generate Statblock' }}
                </cdr-button>
              </cdr-form-group>
            </template>
          </TabPanel>


        </Tabs>
      </div>
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
import NPCSkeleton from './skeletons/NPCSkeleton.vue';
import MapSidebar from './MapSidebar.vue';
import Statblock from './statblock/Statblock.vue';
import {
  CdrInput,
  CdrButton,
  CdrTooltip,
  CdrLink,
  CdrSelect,
  CdrCheckbox,
  CdrAccordionGroup,
  CdrAccordion,
  CdrFormGroup,
  IconNavigationMenu,
  IconXSm,
} from '@rei/cedar';

import { useDungeonStore } from '../stores/dungeon-store.mjs';
import { dungeonToMarkdown } from '../util/dungeon-to-markdown.mjs';
import { dungeonToHTML } from '../util/dungeon-to-html.mjs';
import { dungeonToPlainText } from '../util/dungeon-to-plain-text.mjs';
import crList from '../data/cr-list.json';
import { canGenerateStatblock } from "../util/can-generate-statblock.mjs";

const props = defineProps({
  premium: { type: Boolean, default: false },
});

const dungeonStore = useDungeonStore();

const windowWidth = ref(window.innerWidth);
const isSidebarVisible = ref(false);
const mapContainer = ref(null);
const dungeonMap = ref(null);
const mapWrapper = ref(null);
const mapSidebarRef = ref(null);
const mapContainerHeight = ref('auto');

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

const crOptions = crList.fullArray;
const statblockForm = ref({
  name: '',
  CR: '',
  type: 'Random',
  description: '',
  isSpellcaster: false,
});
const statblockFormError = ref(null);
const generatingStatblock = ref(false);

// Updates the monster's statblock if the Statblock component emits an update
function updateMonsterStatblock(monster, updatedMonster) {
  monster.statblock = updatedMonster;
  // Update the monster in the dungeon store
  dungeonStore.updateMonster(monster);
}

function copyDungeonasMarkdown() {
  const markdown = dungeonToMarkdown(dungeonStore.currentDungeon);
  navigator.clipboard.writeText(markdown);
}

function copyDungeonasHTML() {
  const html = dungeonToHTML(dungeonStore.currentDungeon);
  navigator.clipboard.writeText(html);
}

function copyDungeonasPlainText() {
  const plainText = dungeonToPlainText(dungeonStore.currentDungeon);
  navigator.clipboard.writeText(plainText);
}

function handleDownloadMapClick() {
  if (dungeonMap.value && dungeonMap.value.downloadCanvasAsImage) {
    dungeonMap.value.downloadCanvasAsImage();
  } else {
    console.error('DungeonMap component or downloadCanvasAsImage method not found');
  }
}

function deleteAllDungeons() {
  const confirmed = window.confirm('Are you sure you want to delete all dungeons?');
  if (confirmed) {
    dungeonStore.deleteAllDungeons();
  }
}

const mapExists = computed(() => {
  return dungeonStore.currentDungeon && dungeonStore.currentDungeon.rooms;
});

const modelError = ref(null);
function createNPC() {
  if (!dungeonStore.npcName || !dungeonStore.npcShortDescription) {
    modelError.value = 'Please fill out all fields.';
    return false;
  }
  dungeonStore.addNPC();
  modelError.value = null;
  return true;
}

function handleMapWrapperClick(event) {
  if (dungeonStore.isMapSidebarCollapsed) return;

  const dungeonMapElement = dungeonMap.value.$el;
  const sidebarElement = mapSidebarRef.value.$el;

  if (dungeonMapElement.contains(event.target) || sidebarElement.contains(event.target)) {
    return;
  }

  dungeonStore.isMapSidebarCollapsed = true;
}

const difficultyOptions = [
  'Tier 1: Basic - A local hero in the making.',
  'Tier 2: Expert - An established local hero.',
  'Tier 3: Champion - A hero of the region.',
  'Tier 4: Master - A hero of the world.',
  'Tier 5: Immortal - A hero of the realms.',
]

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
    const confirmed = window.confirm(
      'Are you sure you want to re-generate the map? This will overwrite the existing map and all of its room descriptions.'
    );
    if (confirmed) {
      dungeonStore.generateMap();
    }
  } else {
    dungeonStore.generateMap();
  }
}

const isMobileWidth = computed(() => windowWidth.value <= 768);
const mapContainerInlineStyles = computed(() => (
  isMobileWidth.value ? {} : { height: mapContainerHeight.value }
));

const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  dungeonStore.loadDungeons();
  window.addEventListener('resize', updateWindowWidth);
});

function handleRoomClick({ roomId, x, y }) {
  dungeonStore.selectedRoomId = roomId;
  dungeonStore.lastClickedRoomX = x;

  if (!isMobileWidth.value) {
    if (dungeonStore.isMapSidebarCollapsed) {
      dungeonStore.isMapSidebarCollapsed = false;
      setTimeout(() => {
        adjustMapScrollPosition(x);
      }, 300);
    } else {
      adjustMapScrollPosition(x);
    }
  } else {
    if (dungeonStore.isMapSidebarCollapsed) {
      dungeonStore.isMapSidebarCollapsed = false;
      setTimeout(() => {
        adjustMapScrollToPosition(x, y);
      }, 300);
    } else {
      adjustMapScrollToPosition(x, y);
    }
  }
}

function handleMapClick() {
  if (!dungeonStore.isMapSidebarCollapsed) {
    dungeonStore.isMapSidebarCollapsed = true;
  }
}

function adjustMapScrollPosition(roomX) {
  if (mapWrapper.value) {
    const visibleWidth = mapWrapper.value.clientWidth;
    const targetScrollLeft = roomX - visibleWidth / 2;
    mapWrapper.value.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth',
    });
  }
}

function adjustMapScrollToPosition(roomX, roomY) {
  if (mapWrapper.value) {
    const visibleWidth = mapWrapper.value.clientWidth;
    const visibleHeight = mapWrapper.value.clientHeight;
    const maxScrollLeft = mapWrapper.value.scrollWidth - visibleWidth;
    const maxScrollTop = mapWrapper.value.scrollHeight - visibleHeight;

    const targetScrollLeft = Math.min(Math.max(roomX - visibleWidth / 2, 0), maxScrollLeft);
    const targetScrollTop = Math.min(Math.max(roomY - visibleHeight / 2, 0), maxScrollTop);

    mapWrapper.value.scrollTo({
      left: targetScrollLeft,
      top: targetScrollTop,
      behavior: 'smooth',
    });
  }
}

// Generate a custom statblock from the form at the bottom
async function generateStatblock() {
  if (!dungeonStore.currentDungeon) {
    statblockFormError.value = 'No dungeon selected.';
    return;
  }

  generatingStatblock.value = true;
  try {
    const generated = await dungeonStore.generateAndSaveStatblock({
      name: statblockForm.value.name,
      CR: statblockForm.value.CR,
      description: statblockForm.value.description,
      isSpellcaster: statblockForm.value.isSpellcaster,
      premium: props.premium
    });
    // Handle or display the generated statblock from dungeonStore.currentDungeon.statblocks if desired
  } catch (error) {
    statblockFormError.value = error.message;
  } finally {
    generatingStatblock.value = false;
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
  min-height: 75vh;
}

.copy-buttons {
  display: flex;
  flex-direction: column;
  margin: 1rem;
  gap: 1rem;
  margin-bottom: 7rem;
}

.dungeon-map-wrapper {
  background-color: #fafaf6;
  overflow-x: auto;
  overflow-y: auto;
  flex: 1 1 auto;
}

.dungeon-map-container {
  width: max-content;
  margin: 0 auto;
}

.generate-button-container {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.selected-room-description,
.full-room-description {
  /* Optional: Add styles for content inside the sidebar */
}

.map-sidebar {
  background-color: #fafaf6;
  border-left: 1px solid #ccc;
  width: 450px;
  flex-shrink: 0;
  transition: width 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-size: 1.6rem;
  line-height: 3rem;
}

.map-sidebar.is-collapsed {
  width: 20px;
}

.toggle-button {
  position: absolute;
  top: 10px;
  left: -20px;
  width: 20px;
  height: 40px;
  background-color: #ccc;
  border-radius: 5px 0 0 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.sidebar-content {
  padding: 10px;
  overflow-y: auto;
  height: 100%;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2;
}

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

.sidebar {
  width: 250px;
  background-color: #f4f4f4;
  padding: 1rem;
  height: 100vh;
  overflow-y: auto;
  position: fixed;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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

.main-content {
  flex: 1;
  margin-left: 250px;
  padding: 2rem;
  max-width: 800px;
  margin: 3rem auto;


  .description-text {
    margin-bottom: 1.6rem;
    font-size: 1.6rem;
    line-height: 3rem;
  }

  .content-container {
    box-shadow: 0 4px 6px #0000001a;
    margin-top: 20px;
    border-radius: 5px;
    background-color: #ffffff;
    padding: 20px;

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

.read-aloud-box {
  background-color: $cdr-color-background-secondary;
  color: $cdr-color-text-secondary;
  padding: 1rem 2rem;
  font-style: italic;
}

.delete-button {
  position: absolute;
  top: 65px;
  right: 15px;
  z-index: 1;
}

.generate-button-container {
  text-align: center;
  margin-top: 2rem;
}

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

    .saved-dungeons {
      margin-top: 5rem;
    }
  }
}

/* Mobile styles */
@media (max-width: 768px) {
  .tabs {
    width: calc(100vw - 1rem);
    margin: 0 auto;
  }



  .app-container {
    flex-direction: column;
  }

  .main-content {
    margin: 1rem auto;
    padding: 0;

    .content-container {
      padding: 0;
      box-shadow: none;
      margin: auto;
    }

    .content-form {
      padding: 1rem;
    }
  }

  .map-and-sidebar-container {
    flex-direction: column;
  }

  .dungeon-map-wrapper {
    margin-bottom: 500px;
  }

  .map-sidebar-container {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 2;
  }

  .map-sidebar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 0;
    transition: height 0.3s ease;
    overflow: hidden;
    border-left: none;
    border-top: 1px solid #ccc;
  }

  .map-sidebar.is-collapsed {
    height: 0;
  }

  .map-sidebar:not(.is-collapsed) {
    height: 200px;
  }

  .toggle-button {
    position: fixed;
    bottom: 210px;
    right: 10px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #ccc;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    left: auto;
    top: auto;
  }

  .sidebar-content {
    height: 100%;
  }

  .main-content {
    margin-left: 0;
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

  .generator-fields {
    flex-direction: column;

    p {
      margin: 0;
    }
  }

  .generator-field-input {
    flex: 1 1 100%;
    width: 100%;
  }
}
</style>
