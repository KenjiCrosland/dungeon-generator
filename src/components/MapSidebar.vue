<template>
  <div class="map-sidebar-container">
    <div class="toggle-button" :class="{ 'mobile': isMobile, 'expanded': !props.isCollapsed && isMobile }"
      @click="toggleSidebar" :aria-expanded="!props.isCollapsed" aria-label="Toggle sidebar" role="button" tabindex="0"
      @keydown.enter.space="toggleSidebar">
      <!-- Toggle icon changes based on the state and viewport -->
      <span>{{ toggleIcon }}</span>
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
import { ref, onMounted, onUnmounted, computed } from 'vue';

const isMobile = ref(false);

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

function checkIsMobile() {
  isMobile.value = window.innerWidth <= 768;
}

onMounted(() => {
  checkIsMobile();
  window.addEventListener('resize', checkIsMobile);
});

onUnmounted(() => {
  window.removeEventListener('resize', checkIsMobile);
});

// Computed property to determine the toggle icon
const toggleIcon = computed(() => {
  if (isMobile.value) {
    return props.isCollapsed ? '▲' : '▼'; // Up and Down triangles for mobile
  } else {
    return props.isCollapsed ? '◀' : '▶'; // Left and Right triangles for desktop
  }
});
</script>

<style scoped>
.map-sidebar-container {
  position: relative;
}

.sidebar-content {
  padding: 20px;
  overflow-y: auto;
}

/* Sidebar Styles */
.map-sidebar {
  background-color: #fafaf6;
  border-left: 1px solid #ccc;
  width: 450px;
  transition: width 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  font-size: 1.6rem;
}

.map-sidebar.is-collapsed {
  width: 20px;
}

/* Toggle Button Styles */
.toggle-button {
  position: absolute;
  width: 30px;
  height: 60px;
  background-color: #ccc;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1001;
  color: #777;
  /* Ensure it's above the sidebar content */
}

/* Toggle Icon Styling */
.toggle-button span {
  font-size: 1.5rem;
  /* Increased size for better visibility */
  line-height: 1;
}

/* Hover and Active States */
.toggle-button:hover {
  background-color: #bbb;
}

.toggle-button:active {
  background-color: #aaa;
}

/* Desktop-specific Styles */
@media (min-width: 769px) {
  .toggle-button {
    top: 60px;
    left: -30px;
    /* Fixed to the edge of the sidebar */
    transform: translateY(-50%);
    border-radius: 5px 0 0 5px;
    /* Tab shape */
  }

  .toggle-button.expanded {
    left: -25px;
    /* Maintain fixed position to the edge when expanded */
  }
}

/* Mobile-specific Styles */
@media (max-width: 768px) {
  .map-sidebar-container {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
  }

  .map-sidebar {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
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
    height: 500px;
    /* Adjust this height as needed */
  }

  .toggle-button.mobile {
    position: fixed;
    left: 50%;
    bottom: 10px;
    /* When collapsed */
    transform: translateX(-50%);
    width: 50px;
    /* Larger size for better touch targets */
    height: 50px;
    /* Larger size for better touch targets */
    border-radius: 50%;
    /* Completely round */
  }

  .toggle-button.mobile.expanded {
    bottom: 510px;
    /* 500px sidebar height + 10px margin */
  }
}
</style>
