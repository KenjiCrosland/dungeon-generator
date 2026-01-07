<template>
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <!-- material symbols (REQUIRED for many of your ligatures like fort, diamond, workspace_premium) -->
  <link
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
    rel="stylesheet">

  <div id="app">
    <ToolSuiteShowcase :displayMode="'banner'" :premium="false" />
    <DungeonGenerator :premium="false" />
  </div>
</template>

<script setup>
import DungeonGenerator from './components/DungeonGenerator.vue';
import ToolSuiteShowcase from './components/ToolSuiteShowcase.vue';
</script>

<style lang="scss"></style>
