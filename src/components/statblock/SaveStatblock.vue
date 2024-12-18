<template>
  <hr>
  <p class="instructions">Save this statblock to a folder on the: <cdr-link :href="statblockLink">Statblock Generator App</cdr-link></p>
  <div class="save-fields">
    <cdr-select
      v-model="selectedFolder"
      label="Select Existing Folder:"
      prompt="Select a folder"
      :options="folders"
      class="select-folder"
    />

    <cdr-input class="new-folder" label="Or Create New Folder:" type="text" v-model="newFolder" id="new-folder-input" placeholder="New Folder Name" />
  </div>
  <cdr-button class="save-button" :full-width="true" modifier="dark" @click="saveMonster">Save Statblock</cdr-button>
</template>

<script setup>
import { computed, ref } from 'vue';
import { CdrInput, CdrButton, CdrSelect, CdrLink } from '@rei/cedar';

const props = defineProps({
  monster: Object,
  statblockLink: String
});

const folders = ref([]);
const selectedFolder = ref('');
const newFolder = ref('');
const chosenFolder = computed(() => selectedFolder.value || newFolder.value || 'Uncategorized');

const getFolders = (monsters) => {
  const loadedMonsters = monsters || JSON.parse(localStorage.getItem('monsters')) || {};
  folders.value = Object.keys(loadedMonsters).filter(folder => folder !== 'firstGenerationTime' && folder !== 'generationCount');
  //add uncategorized folder if it doesn't exist
  if (!folders.value.includes('Uncategorized')) {
    folders.value.push('Uncategorized');
  }
};

const saveMonster = () => {
  const monsters = JSON.parse(localStorage.getItem('monsters')) || {};
  
  const folderName = chosenFolder.value.trim();

  if (!folderName) {
    alert('Please select or enter a folder name');
    return;
  }

  for (const folder in monsters) {
    if (!Array.isArray(monsters[folder])) {
      continue;
    }
    if (monsters[folder].find(monster => monster.name === props.monster.name && monster.attributes === props.monster.attributes)) {
      moveMonsterToFolder(folder, folderName);
        selectedFolder.value = '';
        newFolder.value = '';
      return;
    }
  }
  if (!monsters[folderName]) {
    monsters[folderName] = [];
  }

  monsters[folderName].push(props.monster);

  if (!monsters['Uncategorized']) {
    monsters['Uncategorized'] = [];
  }

  localStorage.setItem('monsters', JSON.stringify(monsters));
  selectedFolder.value = '';
  newFolder.value = '';
  getFolders(monsters);
  alert('Statblock saved successfully! Visit the Statblock Generator App to view your saved statblocks.');
};

const getMonsterIndex = (folderName, monsters) => {
  //get monsterIndex by monster.name and monster.attributes
  return monsters[folderName].findIndex(monster => monster.name === props.monster.name && monster.attributes === props.monster.attributes) || -1;
}

const moveMonsterToFolder = (oldFolder, newFolder) => {
  //remove monster from oldFolder
  const monsters = JSON.parse(localStorage.getItem('monsters')) || {};
  const monsterIndex = getMonsterIndex(oldFolder, monsters);
  monsters[oldFolder].splice(monsterIndex, 1);
  //remove oldFolder if empty unless it's Uncategorized
  if (monsters[oldFolder].length === 0 && oldFolder !== 'Uncategorized') {
    delete monsters[oldFolder];
  }
  //add monster to newFolder
  if (!monsters[newFolder]) {
    monsters[newFolder] = [];
  }
  monsters[newFolder].push(props.monster);
  localStorage.setItem('monsters', JSON.stringify(monsters));
  alert(`Statblock moved from ${oldFolder} to ${newFolder} successfully! Visit the Statblock Generator App to view your saved statblocks.`);
  getFolders(monsters);
};

getFolders();
</script>

<style scoped lang="scss">
.instructions {
  font-size: medium;
    margin: 1rem 0 .5rem;
    font-weight: 500;
}
.save-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  @media screen and (max-width: 550px) {
    grid-template-columns: 1fr;
  }
}
.save-button {
  margin-top: 2rem;
}
</style>
