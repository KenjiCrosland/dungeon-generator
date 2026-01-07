<template>
  <cdr-modal label="Save/Load Data" :opened="opened" aria-describedby="dataManagerModalDescription"
    @closed="closeModal">
    <template #title>
      <cdr-text tag="h3" class="title-header">
        Save/Load Data
      </cdr-text>
    </template>

    <!-- If NOT premium, show an upsell UI instead of the checkboxes -->
    <div v-if="!premium">
      <cdr-text id="dataManagerModalDescription" tag="p" style="margin-bottom: 1rem;">
        Downloading and uploading app data is reserved for the premium version of this app.
        Please access the premium version here:
      </cdr-text>

      <!-- Show the link for the currentApp, if it exists -->
      <cdr-link v-if="matchedApp?.premiumLink" :href="matchedApp.premiumLink" target="_blank">
        {{ matchedApp?.appName }} - Premium Version
      </cdr-link>
    </div>

    <!-- If premium, show the normal checkboxes + download/upload UI -->
    <div v-else>
      <cdr-text id="dataManagerModalDescription" tag="p" style="margin-bottom: 1rem;">
        Select which data you want to download. Only apps for which there is currently saved info will appear below. To
        upload, pick a file.
      </cdr-text>

      <!-- "Select All" checkbox (only appears if more than one recognized key) -->
      <cdr-checkbox v-if="localStorageApps.length > 1" v-model="selectAllChecked" @change="toggleSelectAll">
        Select All
      </cdr-checkbox>

      <!-- One checkbox per recognized localStorage key -->
      <div class="checkboxes-container" v-if="localStorageApps.length">
        <cdr-checkbox v-for="app in localStorageApps" :key="app.key" v-model="checkedApps[app.key]">
          {{ app.appName }}
        </cdr-checkbox>
      </div>
      <p v-else>
        No recognized data found in localStorage.
      </p>

      <div class="buttons-container">
        <!-- Download data -->
        <cdr-button modifier="secondary" @click="downloadData">
          Download JSON
        </cdr-button>

        <!-- Upload data (file input hidden) -->
        <cdr-button @click="triggerFileSelect">
          Upload JSON
        </cdr-button>
        <input ref="fileInput" type="file" accept="application/json" style="display: none;"
          @change="handleFileChange" />
      </div>
    </div>
  </cdr-modal>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import {
  CdrModal,
  CdrText,
  CdrCheckbox,
  CdrButton,
  CdrLink
} from '@rei/cedar';

const props = defineProps({
  opened: {
    type: Boolean,
    default: false
  },
  premium: {
    type: Boolean,
    default: false
  },
  currentApp: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:opened']);

/**
 * We have a known list of localStorage keys => friendly names => optional premium link.
 */
const knownApps = [
  {
    key: 'monsters',
    appName: 'Statblock Generator',
    premiumLink: 'https://cros.land/ai-powered-dnd-5e-monster-statblock-generator-premium/'
  },
  {
    key: 'savedItems',
    appName: 'Magic Item Generator',
    premiumLink: 'https://cros.land/dnd-5e-magic-item-generator-premium-version/'
  },
  {
    key: 'rpgTimelineState',
    appName: 'Timeline Generator',
    premiumLink: null
  },
  {
    key: 'gameSettings',
    appName: 'Worldbuilding Dashboard',
    premiumLink: 'https://cros.land/rpg-setting-generator-and-world-building-tool-premium-version/'
  },
  {
    key: 'dungeons',
    appName: 'Dungeon Generator',
    premiumLink: 'https://cros.land/dungeon-generator-2-0-premium-version/'
  }
];

/**
 * Find the app entry for the currentApp prop, if any
 */
const matchedApp = computed(() => {
  return knownApps.find(a => a.key === props.currentApp);
});

/**
 * We'll only show the checkboxes for recognized keys that actually exist in localStorage.
 */
const localStorageApps = computed(() =>
  knownApps.filter(app => localStorage.getItem(app.key) !== null)
);

/**
 * A dictionary of booleans: which apps are checked for download
 */
const checkedApps = reactive({});

/**
 * "Select All" boolean
 */
const selectAllChecked = ref(false);

// Whenever localStorageApps changes, add default false for new keys
watch(localStorageApps, (apps) => {
  apps.forEach(app => {
    if (checkedApps[app.key] === undefined) {
      checkedApps[app.key] = false;
    }
  });
}, { immediate: true });

/**
 * Toggling "Select All" sets all recognized keys to that boolean
 */
function toggleSelectAll() {
  localStorageApps.value.forEach(app => {
    checkedApps[app.key] = selectAllChecked.value;
  });
}

/**
 * Which keys are selected for download?
 */
const chosenKeys = computed(() =>
  localStorageApps.value
    .filter(app => checkedApps[app.key])
    .map(app => app.key)
);

/**
 * Close the modal
 */
function closeModal() {
  //uncheck all checkboxes
  localStorageApps.value.forEach(app => {
    checkedApps[app.key] = false;
  });
  emit('update:opened', false);
}

/**
 * Download the chosen localStorage keys
 */
function downloadData() {
  if (!chosenKeys.value.length) {
    alert('Please select at least one app to download.');
    return;
  }

  const dataToSave = {};
  chosenKeys.value.forEach(key => {
    const stored = localStorage.getItem(key);
    if (!stored) return;
    const parsed = JSON.parse(stored);

    // For 'monsters', remove generationCount & firstGenerationTime
    if (key === 'monsters') {
      delete parsed.generationCount;
      delete parsed.firstGenerationTime;
    }
    dataToSave[key] = parsed;
  });

  if (!Object.keys(dataToSave).length) {
    alert('No data found to download.');
    return;
  }

  // Build the filename: game-master-data-nov-11-25.json
  const date = new Date();
  const monthName = date.toLocaleString('default', { month: 'short' }).toLowerCase();
  const day = date.getDate();
  const year = date.getFullYear().toString().slice(-2);
  const fileName = `game-master-data-${monthName}-${day}-${year}.json`;

  const jsonStr = JSON.stringify(dataToSave, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);

  closeModal();
}

/**
 * Trigger the hidden file input to upload JSON
 */
const fileInput = ref(null);
function triggerFileSelect() {
  fileInput.value?.click();
}

/**
 * Handle file upload, parse known apps, confirm, then overwrite localStorage
 */
function handleFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const dataObj = JSON.parse(e.target.result);
      const keysInFile = Object.keys(dataObj);

      if (!keysInFile.length) {
        alert('No top-level keys found in JSON file.');
        return;
      }

      // Among known apps, which appear in the uploaded file?
      const recognizedApps = knownApps.filter(a => keysInFile.includes(a.key));
      if (!recognizedApps.length) {
        alert('No recognized apps found in the uploaded file.');
        return;
      }

      const appNames = recognizedApps.map(a => a.appName).join(', ');
      const confirmationMessage =
        `File contains data for:\n\n${appNames}\n\n` +
        'This will overwrite any current data for those apps. Continue?';

      if (!confirm(confirmationMessage)) {
        return;
      }

      recognizedApps.forEach(app => {
        if (app.key === 'monsters') {
          delete dataObj[app.key].generationCount;
          delete dataObj[app.key].firstGenerationTime;
        }
        localStorage.setItem(app.key, JSON.stringify(dataObj[app.key]));
      });

      alert('Data uploaded successfully.');
      //reload the page to show the new data
      location.reload();
      closeModal();
    } catch (err) {
      alert('Error parsing JSON file: ' + err.message);
    } finally {
      event.target.value = '';
    }
  };
  reader.readAsText(file);
}
</script>

<style scoped>
.checkboxes-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.buttons-container {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: flex-end;
}
</style>
