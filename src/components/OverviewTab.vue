<template>
  <div>
    <OverviewSkeleton v-if="dungeonStore.loadingOverview" />
    <div v-if="dungeonStore.currentDungeon && dungeonStore.currentDungeon.dungeonOverview" class="dungeon-overview">
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
  </div>
</template>

<script setup>
import { useDungeonStore } from '@/stores/dungeon-store.mjs';
import OverviewSkeleton from '@/components/skeletons/OverviewSkeleton.vue';

const dungeonStore = useDungeonStore();
</script>

<style scoped>
.description-text {
  margin-bottom: 1.6rem;
  font-size: 1.6rem;
  line-height: 3rem;
}

.dungeon-overview h2 {
  margin-top: 0;
}
</style>
