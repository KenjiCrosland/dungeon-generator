<template>
  <div>
    <h2>Notable NPCs</h2>
    <cdr-accordion-group v-if="dungeonStore.currentDungeon && dungeonStore.currentDungeon.npcs">
      <cdr-accordion v-for="(npc, index) in dungeonStore.currentDungeon.npcs" :key="index" :id="'npc-' + index"
        :opened="npc.opened" @accordion-toggle="npc.opened = !npc.opened" level="2">
        <template #label>
          {{ npc.name }}
        </template>
        <cdr-tooltip id="tooltip-example" position="left" class="delete-button">
          <template #trigger>
            <cdr-button size="small" :icon-only="true" :with-background="true" @click="dungeonStore.deleteNPC(index)">
              <template #icon>
                <icon-x-sm />
              </template>
            </cdr-button>
          </template>
          <div>
            Delete NPC
          </div>
        </cdr-tooltip>
        <div>
          <div v-if="dungeonStore.currentlyLoadingNPCs[index]">
            <NPCSkeleton />
          </div>
          <div v-else>
            <h2>{{ npc.name }}</h2>
            <div v-if="npc.description_of_position">
              <div class="read-aloud-box">
                <p>{{ npc.read_aloud_description }}</p>
              </div>
              <p>{{ npc.description_of_position }}</p>
              <p>{{ npc.why_in_dungeon }}</p>
              <p>{{ npc.distinctive_features_or_mannerisms }}</p>
              <p>{{ npc.character_secret }}</p>
              <h3>Relationships</h3>
              <div v-for="(relationship, relatedNpcName) in npc.relationships" :key="relatedNpcName">
                <p><strong>{{ relatedNpcName }}:</strong> {{ relationship }}</p>
              </div>
              <h3>Roleplaying Tips</h3>
              <p>{{ npc.roleplaying_tips }}</p>
            </div>
            <div v-if="!npc.description_of_position">
              <p>{{ npc.short_description }}</p>
              <cdr-button @click="dungeonStore.generateDungeonNPC(index)"
                :disabled="dungeonStore.currentlyLoadingNPCs[index]">
                Generate Full Description
              </cdr-button>
            </div>
          </div>
        </div>
      </cdr-accordion>
    </cdr-accordion-group>

    <h3 style="margin-top: 3rem; margin-bottom: 1rem">Add a New NPC</h3>
    <cdr-form-group :error="modelError">
      <cdr-input v-model="dungeonStore.npcName" label="NPC Name" :required="true" />
      <cdr-input v-model="dungeonStore.npcShortDescription" label="NPC Short Description" :required="true">
        <template #helper-text-bottom>
          Examples: "A trapped explorer seeking help", "A ghost haunting the corridors", "A lost child"
        </template>
      </cdr-input>
      <cdr-button style="margin-top: 2rem" @click="createNPC" :disabled="dungeonStore.currentlyLoadingNPC">
        Add NPC
      </cdr-button>
    </cdr-form-group>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useDungeonStore } from '@/stores/dungeon-store.mjs';
import NPCSkeleton from '@/components/skeletons/NPCSkeleton.vue';
import { CdrFormGroup, CdrInput, CdrButton, CdrTooltip, CdrAccordionGroup, CdrAccordion, IconXSm } from '@rei/cedar';

const dungeonStore = useDungeonStore();
const modelError = ref(null);

function createNPC() {
  if (!dungeonStore.npcName || !dungeonStore.npcShortDescription) {
    modelError.value = 'Please fill out all fields.';
    return false;
  }
  dungeonStore.addNPC();
  modelError.value = null;
  return true;
}
</script>

<style scoped>
.delete-button {
  position: absolute;
  top: 65px;
  right: 15px;
  z-index: 1;
}

.read-aloud-box {
  background-color: #fafaf6;
  padding: 1rem 2rem;
  font-style: italic;
}
</style>
