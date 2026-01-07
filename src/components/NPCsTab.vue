<template>
  <div>
    <h2>Notable NPCs</h2>
    <cdr-accordion-group v-if="dungeonStore.currentDungeon && dungeonStore.currentDungeon.npcs">
      <cdr-accordion v-for="(npc, index) in dungeonStore.currentDungeon.npcs" :key="index" :id="'npc-' + index"
        :opened="npc.opened" @accordion-toggle="npc.opened = !npc.opened" level="2">
        <template #label>
          {{ npc.name }}
        </template>

        <!-- The "Delete NPC" tooltip/button -->
        <cdr-tooltip id="tooltip-example" position="left" class="delete-button">
          <template #trigger>
            <cdr-button size="small" :icon-only="true" :with-background="true" @click="dungeonStore.deleteNPC(index)">
              <template #icon>
                <icon-x-sm />
              </template>
            </cdr-button>
          </template>
          <div>Delete NPC</div>
        </cdr-tooltip>

        <!-- NPC content -->
        <div>
          <!-- Skeleton if loading -->
          <div v-if="dungeonStore.currentlyLoadingNPCs[index]">
            <NPCSkeleton />
          </div>

          <!-- NPC Details -->
          <div v-else>
            <h2>{{ npc.name }}</h2>

            <!-- Full generated details if we have them -->
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

            <!-- If no full description yet, show short desc + "Generate Full Description" button -->
            <div v-else>
              <p>{{ npc.short_description }}</p>
              <cdr-button @click="dungeonStore.generateDungeonNPC(index)"
                :disabled="dungeonStore.currentlyLoadingNPCs[index]">
                Generate Full Description
              </cdr-button>
            </div>

            <!-- NPC Statblock Section -->
            <div v-if="npc.description_of_position"
              style="margin-top: 2rem; border-top: 1px solid #ccc; padding-top: 1rem;">
              <h3>NPC Statblock</h3>
              <!-- If npc has a statblock or is generating one, display it -->
              <div v-if="
                npc.statblock ||
                dungeonStore.npcStatblockLoadingStates[index]?.part1 ||
                dungeonStore.npcStatblockLoadingStates[index]?.part2
              " style="margin-top: 1rem;">
                <Statblock :monster="npc.statblock" :premium="premium"
                  :loadingPart1="dungeonStore.npcStatblockLoadingStates[index]?.part1 || false"
                  :loadingPart2="dungeonStore.npcStatblockLoadingStates[index]?.part2 || false"
                  @update-monster="updateNpcStatblock(index, $event)" />
              </div>

              <!-- Simple form to generate a new statblock for the NPC -->
              <form v-if="npc.description_of_position" @submit.prevent="generateNpcStatblock(index, premium)"
                class="npc-statblock-form">
                <div class="form-row-top">
                  <cdr-select v-model="npcStatblockData[index].CR" label="CR" :options="crOptions" prompt="Select CR" />
                  <cdr-select v-model="npcStatblockData[index].monsterType" label="Type"
                    :options="['Random', 'Stronger Defense', 'Balanced', 'Stronger Offense']"
                    prompt="Select Monster Type" />

                </div>
                <cdr-checkbox v-model="npcStatblockData[index].isSpellcaster" style="margin-top: 2rem;">
                  Creature is a spellcaster
                </cdr-checkbox>
                <!-- Submit button -->
                <cdr-button class="monster-form-button" type="submit" style="margin-top: 1rem;"
                  :disabled="dungeonStore.npcStatblockLoadingStates[index]?.generating">
                  {{
                    dungeonStore.npcStatblockLoadingStates[index]?.generating
                      ? 'Generating...'
                      : (npc.statblock
                        ? 'Re-generate Statblock'
                        : 'Generate Statblock')
                  }}
                </cdr-button>
              </form>
            </div>
          </div>
        </div>
      </cdr-accordion>
    </cdr-accordion-group>

    <!-- Add a new NPC -->
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
import { ref, reactive, onBeforeMount, watch } from 'vue';
import { useDungeonStore } from '@/stores/dungeon-store.mjs';
import NPCSkeleton from '@/components/skeletons/NPCSkeleton.vue';
import Statblock from '@/components/statblock/Statblock.vue';
import {
  CdrFormGroup,
  CdrInput,
  CdrButton,
  CdrTooltip,
  CdrAccordionGroup,
  CdrAccordion,
  IconXSm,
  CdrSelect,
  CdrCheckbox,
} from '@rei/cedar';
import crList from '@/data/cr-list.json';
const props = defineProps({ premium: { type: Boolean, default: false } });
const dungeonStore = useDungeonStore();
const modelError = ref(null);

// The CR dropdown data
const crOptions = crList.fullArray;

// We'll keep an object that holds per-NPC data for statblock generation
// so each NPC can have different CR / isSpellcaster etc.
const npcStatblockData = reactive({});

/**
 * On component mount (or whenever NPCs change), we can ensure each NPC has
 * an entry in `npcStatblockData[index]`.
 */
function ensureNpcStatblockData() {
  if (!dungeonStore.currentDungeon?.npcs) return;
  dungeonStore.currentDungeon.npcs.forEach((npc, idx) => {
    if (!npcStatblockData[idx]) {
      npcStatblockData[idx] = {
        CR: getCR(npc?.CR || '1'), // Use getCR to extract the number
        monsterType: 'Random',
        isSpellcaster: npc.isSpellcaster || false,
      };
    }
  });
}

//7 (2,900 XP)
//CR presents as a string I just need the first number as a string withouth the (XP)
function getCR(cr) {
  return cr.split(' ')[0];
}

onBeforeMount(() => {
  ensureNpcStatblockData();
});

watch(
  () => dungeonStore.currentDungeon?.npcs,
  () => {
    ensureNpcStatblockData();
  },
  { deep: true }
);

// Whenever the NPC list changes, make sure our form data is in sync
//ensureNpcStatblockData();

function createNPC() {
  if (!dungeonStore.npcName || !dungeonStore.npcShortDescription) {
    modelError.value = 'Please fill out all fields.';
    return false;
  }
  dungeonStore.addNPC();
  modelError.value = null;
  return true;
}

// Update the NPC's statblock once GPT finishes
function updateNpcStatblock(index, updatedStatblock) {
  const npc = dungeonStore.currentDungeon.npcs[index];
  if (!npc) return;
  npc.statblock = updatedStatblock;
  // If you want to store CR and isSpellcaster in npc as well, do so here
  npc.CR = updatedStatblock.challenge_rating || npc.CR;
  npc.isSpellcaster = npcStatblockData[index].isSpellcaster;
  dungeonStore.saveDungeons();
}

/**
 * This triggers the store function that calls GPT to generate or re-generate
 * a statblock for the NPC.
 */
async function generateNpcStatblock(index, premium) {
  const npc = dungeonStore.currentDungeon.npcs[index];
  if (!npc) return;

  const { CR, monsterType, isSpellcaster } = npcStatblockData[index];

  await dungeonStore.generateNPCStatblock(index, {
    CR,
    monsterType,
    isSpellcaster,
    premium,
  });
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

/* Reuse your .form-row-top, .form-row-mid, etc. classes. Example: */
.form-row-top {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  align-items: center;
}

.monster-form-button {
  margin-top: 1rem;
}
</style>
