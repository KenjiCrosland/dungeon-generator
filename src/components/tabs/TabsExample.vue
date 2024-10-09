<template>
  <h1>TABS EXAMPLE</h1>
  <div class="tabs-container">
    <Tabs :activeIndex="activeTabIndex">
      <TabPanel label="Tab 1">Content for Tab 1</TabPanel>
      <TabPanel label="Tab 2">Content for Tab 2</TabPanel>
      <TabPanel label="Tab 3" :disabled="true">Content for Tab 3</TabPanel>
    </Tabs>

    <!-- Buttons to change tabs externally -->
    <div class="tab-controls">
      <button @click="setActiveTab(0)">Tab 1</button>
      <button @click="setActiveTab(1)">Tab 2</button>
      <button @click="setActiveTab(2)">Tab 3</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Tabs from './Tabs.vue';
import TabPanel from './TabPanel.vue';

const activeTabIndex = ref(0);

// Function to change the active tab index
function setActiveTab(index) {
  activeTabIndex.value = index;
}
</script>

<style scoped>
.tabs-container {
  max-width: 800px;
  margin: 0 auto;
}

.tab-controls {
  margin-top: 20px;
}

button {
  margin-right: 10px;
  padding: 10px 20px;
  cursor: pointer;
}
</style>
