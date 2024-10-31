<template>
  <div class="map-sidebar-container">
    <div class="toggle-button" @click="toggleSidebar">
      <!-- Toggle icon changes based on the state -->
      <span>{{ props.isCollapsed ? '<' : '>' }}</span>
    </div>
    <div class="map-sidebar" :class="{ 'is-collapsed': props.isCollapsed }">
      <div class="sidebar-content">
        <!-- Slot for injecting content -->
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:isCollapsed']);

function toggleSidebar() {
  emit('update:isCollapsed', !props.isCollapsed);
}
</script>


<style scoped>
.map-sidebar-container {
  position: relative;
}

.map-sidebar {
  background-color: #fafaf6;
  border-left: 1px solid #ccc;
  width: 450px;
  transition: width 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  font-size: small;
}

.map-sidebar.is-collapsed {
  width: 20px;
  /* Width when collapsed */
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
</style>
