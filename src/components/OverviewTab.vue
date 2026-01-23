<template>
  <div>
    <OverviewSkeleton v-if="dungeonStore.loadingOverview" />
    <div v-if="dungeonStore.currentDungeon && dungeonStore.currentDungeon.dungeonOverview" class="dungeon-overview">
      <!-- View Mode -->
      <div v-if="!isEditing">
        <h2>{{ dungeonStore.currentDungeon.dungeonOverview.title }}</h2>
        <div v-if="dungeonStore.currentDungeon.dungeonOverview.combined_content" class="overview-content">
          <p v-for="(paragraph, index) in dungeonStore.currentDungeon.dungeonOverview.combined_content.split('\n\n')"
            :key="index" class="description-text">
            {{ paragraph }}
          </p>
        </div>
        <div v-else class="overview-content">
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

        <div class="button-group">
          <cdr-button @click="startEditing" modifier="secondary">Edit Overview</cdr-button>
        </div>
      </div>

      <!-- Edit Mode -->
      <div v-else class="edit-form">
        <h2>Edit Dungeon Overview</h2>

        <cdr-input v-model="editForm.title" label="Title" background="secondary" class="edit-field">
          <template #helper-text-bottom>
            The title of your dungeon
          </template>
        </cdr-input>

        <cdr-input v-model="editForm.content" label="Overview Content" background="secondary" :rows="15"
          tag="textarea" class="edit-field">
          <template #helper-text-bottom>
            The main content of your dungeon overview. Use double line breaks for paragraphs.
          </template>
        </cdr-input>

        <div class="button-group">
          <cdr-button @click="saveEdit">Save Changes</cdr-button>
          <cdr-button @click="cancelEdit" modifier="secondary">Cancel</cdr-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useDungeonStore } from '@/stores/dungeon-store.mjs';
import OverviewSkeleton from '@/components/skeletons/OverviewSkeleton.vue';
import { CdrButton, CdrInput } from '@rei/cedar';
import '@rei/cedar/dist/style/cdr-button.css';
import '@rei/cedar/dist/style/cdr-input.css';

const dungeonStore = useDungeonStore();

// Edit mode state
const isEditing = ref(false);
const editForm = ref({
  title: '',
  content: ''
});

// Helper function to combine overview fields into a single content block
const combineOverviewFields = (overview) => {
  if (!overview) return '';

  const parts = [];

  if (overview.overview) {
    parts.push(overview.overview);
  }

  if (overview.relation_to_larger_setting || overview.finding_the_dungeon) {
    parts.push([overview.relation_to_larger_setting, overview.finding_the_dungeon].filter(Boolean).join(' '));
  }

  if (overview.history) {
    parts.push(overview.history);
  }

  if (overview.dominant_power || overview.dominant_power_goals || overview.dominant_power_minions) {
    parts.push([overview.dominant_power, overview.dominant_power_goals, overview.dominant_power_minions].filter(Boolean).join(' '));
  }

  if (overview.miniboss_description) {
    parts.push(overview.miniboss_description);
  }

  if (overview.dominant_power_event || overview.recent_event_consequences) {
    parts.push([overview.dominant_power_event, overview.recent_event_consequences].filter(Boolean).join(' '));
  }

  if (overview.secondary_power || overview.secondary_power_event) {
    parts.push([overview.secondary_power, overview.secondary_power_event].filter(Boolean).join(' '));
  }

  if (overview.main_problem || overview.potential_solutions) {
    parts.push([overview.main_problem, overview.potential_solutions].filter(Boolean).join(' '));
  }

  if (overview.conclusion) {
    parts.push(overview.conclusion);
  }

  return parts.filter(Boolean).join('\n\n');
};

// Start editing
const startEditing = () => {
  const overview = dungeonStore.currentDungeon.dungeonOverview;

  editForm.value = {
    title: overview?.title || '',
    content: overview?.combined_content || combineOverviewFields(overview)
  };

  isEditing.value = true;
};

// Cancel editing
const cancelEdit = () => {
  isEditing.value = false;
};

// Save edited content
const saveEdit = () => {
  if (dungeonStore.currentDungeon.dungeonOverview) {
    dungeonStore.currentDungeon.dungeonOverview.title = editForm.value.title;
    dungeonStore.currentDungeon.dungeonOverview.combined_content = editForm.value.content;
  }

  // Save to localStorage
  dungeonStore.saveDungeons();

  isEditing.value = false;
};
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

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.edit-form {
  width: 100%;
}

.edit-field {
  margin-bottom: 2rem;
}

.overview-content {
  margin-bottom: 2rem;
}
</style>
