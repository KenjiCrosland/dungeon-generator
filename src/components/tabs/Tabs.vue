<template>
  <div class="tabs">
    <ul class="tab-header-container" role="tablist">
      <li v-for="(tab, index) in tabs" :key="index" role="presentation">
        <button :ref="(el) => setButtonRef(el, index)" :aria-selected="currentIndex === index"
          :tabindex="focusedIndex === index && !tab.disabled ? 0 : -1" :disabled="tab.disabled" class="tab-header-item"
          :class="{ 'active': currentIndex === index, 'disabled': tab.disabled }" role="tab"
          @click="tab.disabled ? null : selectTab(index)"
          @keydown.right.prevent="tab.disabled ? null : moveFocus(focusedIndex, 'next')"
          @keydown.down.prevent="tab.disabled ? null : moveFocus(focusedIndex, 'next')"
          @keydown.up.prevent="tab.disabled ? null : moveFocus(focusedIndex, 'prev')"
          @keydown.left.prevent="tab.disabled ? null : moveFocus(focusedIndex, 'prev')"
          @keydown.enter.prevent="tab.disabled ? null : selectTab(focusedIndex)"
          @keydown.space.prevent="tab.disabled ? null : selectTab(focusedIndex)">
          {{ tab.label }}
        </button>
      </li>
    </ul>
    <div class="tab-content">
      <slot></slot>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, provide, onMounted, watch } from 'vue';
// Accept an activeIndex prop
const props = defineProps({
  activeIndex: {
    type: Number,
    default: 0
  }
});

const tabs = ref([]);
const currentIndex = ref(props.activeIndex);
const focusedIndex = ref(props.activeIndex); // Initialize with the active index prop
const tabRefs = ref([]);

watch(() => props.activeIndex, (newIndex) => {
  if (newIndex !== currentIndex.value) {
    selectTab(newIndex);
  }
}, { immediate: true });

const setButtonRef = (el, index) => {
  tabRefs.value[index] = el;
};

function selectTab(index) {
  currentIndex.value = index;
  focusedIndex.value = index; // Update focused index to match the selected tab
  focusTab(index); // Focus when tab is selected
}


function focusTab(index) {
  if (tabRefs.value[index]) {
    tabRefs.value[index].focus(); // Set focus using the DOM element
  }
}

function moveFocus(currentIndex, direction) {
  let newIndex = direction === 'next' ?
    (currentIndex + 1) % tabs.value.length :
    (currentIndex - 1 + tabs.value.length) % tabs.value.length;
  focusedIndex.value = newIndex; // Update focused index
  focusTab(newIndex); // Move focus
}

watch(focusedIndex, (newIndex) => {
  tabRefs.value.forEach((tab, index) => {
    if (tab) tab.tabIndex = index === newIndex ? 0 : -1; // Update tabIndex reactively
  });
}, { immediate: true });

onMounted(() => {
  focusedIndex.value = currentIndex.value; // Initialize focused index
});
provide('tabs', tabs);
provide('currentIndex', currentIndex);
</script>


<style scoped>
.tabs {
  display: flex;
  flex-direction: column;
}

.tab-header-container {
  display: flex;
  flex-direction: row;
  overflow: hidden;
  list-style: none;
  padding: 0;
  border-bottom: .1rem solid #928b80;
}

@media (max-width: 768px) {
  .tab-header-container {
    flex-direction: column;
  }

  .tab-header-item {
    width: 100%;
  }
}

.tab-header-item {
  font-family: Graphik, Helvetica Neue, sans-serif;
  padding: 12px 16px;
  text-align: center;
  border: none;
  background-color: inherit;
  outline: none;
  cursor: pointer;
  transition: background-color 0.3s;
  font-style: normal;
  font-weight: inherit;
  letter-spacing: -.008rem;
  font-size: 1.6rem;
  line-height: 2.2rem;
  flex-grow: 1;
  background-color: transparent;
  display: block;
  color: #423b2fbf;
  font-weight: 300;
  text-decoration: none;
  padding: 1.2rem .8rem;
  white-space: nowrap;
  outline-offset: -.3rem;
  min-width: 10rem;
}

/* not aria-selected */
.tab-header-item[aria-selected="false"] {
  color: #423b2fbf;
  /* lighter color for better visibility */
  background-color: #fff;
  /* lighter background for inactive tab */
  font-weight: 300;
  border-bottom: 3px solid #fff;
  border-top: 3px solid #fff;
  /* lighter text for inactive tab */
}

.tab-header-item[aria-selected="true"] {
  color: #0c0b08bf;
  /* darker color for better visibility */
  background-color: #f0f0f0;
  /* lighter background for active tab */
  font-weight: 500;
  border-bottom: 3px solid #406eb5;
  border-top: 3px solid #f0f0f0;
  /* bolder text for active tab */
}

.tab-header-item.disabled {
  color: #aaa;
  /* Gray out the label */
  cursor: not-allowed;
}

.tab-header-item.disabled:hover,
.tab-header-item.disabled:focus {
  background-color: transparent;
  border: 3px solid #fff;
  font-weight: 300;
  color: #aaa;
}

.tab-header-item:hover,
.tab-header-item:focus {
  border: 3px solid #406eb5;
  color: #406eb5;
  font-weight: 600;
  background-color: #f0f0f0;
}
</style>
