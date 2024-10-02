<template>
  <div id="app">
    <DungeonGenerator />
  </div>
</template>

<script setup>
import DungeonGenerator from './components/DungeonGenerator.vue';
</script>

<style>
@import '@rei/cedar/dist/cdr-fonts.css';
@import '@rei/cedar/dist/cdr-reset.css';

/* import each component used in your project  */
@import '@rei/cedar/dist/style/cdr-text.css';
@import '@rei/cedar/dist/style/cdr-button.css';
@import '@rei/cedar/dist/style/cdr-link.css';
@import '@rei/cedar/dist/style/cdr-accordion.css';
@import '@rei/cedar/dist/style/cdr-accordion-group.css';
@import '@rei/cedar/dist/style/cdr-input.css';
@import '@rei/cedar/dist/style/cdr-grid.css';
@import '@rei/cedar/dist/style/cdr-card.css';

#app {
  text-align: center;
}
</style>
