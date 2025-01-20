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

    <!-- Overlay -->
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
        <p>
          Use the above buttons to copy all setting info into your desired format.
          For homebrewery go
          <cdr-link href="https://homebrewery.naturalcrit.com/new">here</cdr-link> and paste the markdown.
          You will need to add your own pagebreaks.
        </p>

        <cdr-button @click="deleteAllDungeons">Delete All Dungeons</cdr-button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div v-if="!dungeonStore.currentDungeon && !dungeonStore.loadingOverview" class="content-container content-form">
        <h1 v-if="!premium">Kenji's Dungeon Generator 2.0 -- Free Version</h1>
        <h1 v-if="premium">Kenji's Dungeon Generator 2.0 -- Premium Version</h1>
        <p>
          Welcome to the Dungeon Generator! Use the form below to create a dungeon overview, generate a map, and add
          NPCs and Monsters with Full Statblocks. You can copy dungeon info in various formats.
        </p>
        <p v-if="!premium">
          This free version has a
          limited number of statblocks you
          can
          generate. The premium version can be found here: <cdr-link
            href="https://cros.land/dungeon-generator-2-0-premium-version/">https://cros.land/dungeon-generator-2-0-premium-version/</cdr-link>.
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
              label="Dungeon Lore" placeholder="Enter additional details">
              <template #helper-text-bottom>
                Need help with lore? Use the
                <cdr-link href="https://cros.land/ai-powered-lore-and-timeline-generator/">Lore Generator</cdr-link>.
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
            <OverviewTab />
          </TabPanel>

          <TabPanel label="Map">
            <MapTab />
          </TabPanel>

          <TabPanel label="NPCs">
            <NPCsTab :premium="premium" />
          </TabPanel>

          <TabPanel label="Monsters">
            <MonstersTab :premium="premium" />
          </TabPanel>
        </Tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useDungeonStore } from '@/stores/dungeon-store.mjs';

import { CdrButton, CdrLink, CdrInput, CdrSelect, IconNavigationMenu } from '@rei/cedar';
import Tabs from '@/components/tabs/Tabs.vue';
import TabPanel from '@/components/tabs/TabPanel.vue';

// The tabs as separate components
import OverviewTab from '@/components/OverviewTab.vue';
import MapTab from '@/components/MapTab.vue';
import NPCsTab from '@/components/NPCsTab.vue';
import MonstersTab from '@/components/MonstersTab.vue';

import { dungeonToMarkdown } from '@/util/dungeon-to-markdown.mjs';
import { dungeonToHTML } from '@/util/dungeon-to-html.mjs';
import { dungeonToPlainText } from '@/util/dungeon-to-plain-text.mjs';

const props = defineProps({
  premium: { type: Boolean, default: false },
});

const dungeonStore = useDungeonStore();

const windowWidth = ref(window.innerWidth);
const isSidebarVisible = ref(false);
const sidebarStyle = computed(() => {
  if (windowWidth.value <= 1020) {
    return {
      position: 'fixed',
      transform: isSidebarVisible.value ? 'translateX(0)' : 'translateX(-100%)',
      width: '70%',
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

const difficultyOptions = [
  'Tier 1: Basic - A local hero in the making.',
  'Tier 2: Expert - An established local hero.',
  'Tier 3: Champion - A hero of the region.',
  'Tier 4: Master - A hero of the world.',
  'Tier 5: Immortal - A hero of the realms.',
];

function copyDungeonasMarkdown() {
  const markdown = dungeonToMarkdown(dungeonStore.currentDungeon);
  navigator.clipboard.writeText(markdown);
  alert('Content copied as markdown!');
}

function copyDungeonasHTML() {
  const html = dungeonToHTML(dungeonStore.currentDungeon);
  navigator.clipboard.writeText(html);
  alert('Content copied as HTML!');
}

function copyDungeonasPlainText() {
  const plainText = dungeonToPlainText(dungeonStore.currentDungeon);
  navigator.clipboard.writeText(plainText);
  alert('Content copied as plain text!');
}

function deleteAllDungeons() {
  const confirmed = window.confirm('Are you sure you want to delete all dungeons?');
  if (confirmed) {
    dungeonStore.deleteAllDungeons();
  }
}

function onTabChanged(index) {
  dungeonStore.activeTabIndex = index;
}

function updateWindowWidth() {
  windowWidth.value = window.innerWidth;
}

onMounted(() => {
  dungeonStore.loadDungeons();
  window.addEventListener('resize', updateWindowWidth);
});
</script>

<style scoped lang="scss">
@import '@rei/cdr-tokens/dist/rei-dot-com/scss/cdr-tokens.scss';
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');

.app-container {
  position: relative;
  display: flex;
}

.copy-buttons {
  display: flex;
  flex-direction: column;
  margin: 1rem;
  gap: 1rem;
  margin-bottom: 7rem;
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
}

.main-content {
  flex: 1;
  margin-left: 250px;
  padding: 2rem;
  max-width: 800px;
  margin: 3rem auto;

  .content-container {
    box-shadow: 0 4px 6px #0000001a;
    margin-top: 20px;
    border-radius: 5px;
    background-color: #ffffff;
    padding: 20px;

    .generator-fields {
      display: flex;
      gap: 2rem;
      align-items: center;
    }

    .lore-field-input {
      margin-top: 1rem;
    }
  }
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
      padding: 1rem;
      box-shadow: none;
      margin: auto;
    }
  }

  .generator-fields {
    flex-direction: column;

    p {
      margin: 0;
    }

    .generator-field-input {
      width: 100%;
    }
  }
}
</style>
