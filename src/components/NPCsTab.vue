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
            <!-- View Mode -->
            <div v-if="editingNPCIndex !== index">
              <h2>{{ npc.name }}</h2>

              <!-- Full generated details if we have them -->
              <div v-if="npc.description_of_position || npc.combined_details">
                <div class="read-aloud-box">
                  <p>{{ npc.read_aloud_description }}</p>
                </div>

                <!-- Use combined_details if available, otherwise show individual fields -->
                <div v-if="npc.combined_details" style="margin-top: 1.5rem;">
                  <p v-for="(paragraph, pIndex) in npc.combined_details.split('\n\n')" :key="pIndex">
                    {{ paragraph }}
                  </p>
                </div>
                <div v-else>
                  <p>{{ npc.description_of_position }}</p>
                  <p>{{ npc.why_in_dungeon }}</p>
                  <p>{{ npc.distinctive_features_or_mannerisms }}</p>
                  <p>{{ npc.character_secret }}</p>
                  <p>{{ npc.roleplaying_tips }}</p>
                </div>

                <h3>Relationships</h3>
                <div v-if="npc.relationships && Object.keys(npc.relationships).length > 0">
                  <div v-for="(relationship, relatedNpcName) in npc.relationships" :key="relatedNpcName"
                    style="margin-bottom: 1rem; padding: 1rem; background: #f4f2ed; border-radius: 4px;">
                    <p style="margin: 0;">
                      <strong>{{ relatedNpcName }}:</strong> {{ relationship }}
                    </p>
                  </div>
                </div>
                <div v-else>
                  <p style="font-style: italic; color: #666;">No relationships generated.</p>
                </div>

                <!-- Edit NPC Button -->
                <div class="button-group" style="margin-top: 2rem;">
                  <cdr-button @click="startEditingNPC(index)" modifier="secondary">Edit NPC</cdr-button>
                </div>
              </div>

              <!-- If no full description yet, show short desc + "Generate Full Description" button -->
              <div v-else>
                <p>{{ npc.short_description }}</p>
                <cdr-button @click="dungeonStore.generateDungeonNPC(index)"
                  :disabled="dungeonStore.currentlyLoadingNPCs[index]">
                  Generate Full Description
                </cdr-button>
              </div>
            </div>

            <!-- Edit Mode -->
            <div v-else class="edit-form">
              <h2>Edit NPC</h2>

              <cdr-input v-model="npcEditForm.name" label="NPC Name" background="secondary" class="edit-field" />

              <cdr-input v-model="npcEditForm.read_aloud_description" label="Read-Aloud Description"
                background="secondary" :rows="4" tag="textarea" class="edit-field">
                <template #helper-text-bottom>
                  The initial description when the NPC is first encountered
                </template>
              </cdr-input>

              <cdr-input v-model="npcEditForm.combined_details" label="NPC Details" background="secondary" :rows="10"
                tag="textarea" class="edit-field">
                <template #helper-text-bottom>
                  Position, location, mannerisms, secrets, and roleplaying tips. Use double line breaks for
                  paragraphs.
                </template>
              </cdr-input>

              <h3>Relationships</h3>
              <div v-if="npcEditForm.relationshipsArray.length > 0">
                <div v-for="(relationship, relIndex) in npcEditForm.relationshipsArray" :key="relIndex"
                  style="margin-bottom: 1.5rem; padding: 1.5rem; background: #f4f2ed; border-radius: 4px;">
                  <cdr-input v-model="relationship.name" label="Name" background="secondary"
                    style="margin-bottom: 1rem;" />
                  <cdr-input v-model="relationship.description" label="Relationship Description" background="secondary"
                    :rows="2" tag="textarea" style="margin-bottom: 1rem;" />
                  <cdr-button size="small" @click="deleteRelationship(relIndex)" modifier="secondary">
                    Remove Relationship
                  </cdr-button>
                </div>
              </div>
              <div v-else>
                <p style="font-style: italic; color: #666; margin-bottom: 1rem;">
                  No relationships to edit. Add one below or generate them in view mode first.
                </p>
              </div>

              <cdr-button size="small" @click="addRelationship" modifier="secondary" style="margin-bottom: 1.5rem;">
                Add Relationship
              </cdr-button>

              <div class="button-group">
                <cdr-button @click="saveEditNPC">Save Changes</cdr-button>
                <cdr-button @click="cancelEditNPC" modifier="secondary">Cancel</cdr-button>
              </div>

              <hr style="margin: 2rem 0;">
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

// Edit mode state
const editingNPCIndex = ref(null);
const npcEditForm = ref({
  name: '',
  read_aloud_description: '',
  combined_details: '',
  relationshipsArray: []
});

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

// Helper function to combine NPC detail fields
function combineNPCDetails(npc) {
  if (!npc) return '';

  const parts = [];

  if (npc.description_of_position) {
    parts.push(npc.description_of_position);
  }

  if (npc.why_in_dungeon) {
    parts.push(npc.why_in_dungeon);
  }

  if (npc.distinctive_features_or_mannerisms) {
    parts.push(npc.distinctive_features_or_mannerisms);
  }

  if (npc.character_secret) {
    parts.push(npc.character_secret);
  }

  if (npc.roleplaying_tips) {
    parts.push(npc.roleplaying_tips);
  }

  return parts.filter(Boolean).join('\n\n');
}

// Start editing NPC
function startEditingNPC(index) {
  const npc = dungeonStore.currentDungeon.npcs[index];
  if (!npc) return;

  // Convert relationships object to array
  const relationshipsArray = [];
  if (npc.relationships) {
    Object.entries(npc.relationships).forEach(([name, description]) => {
      relationshipsArray.push({ name, description });
    });
  }

  npcEditForm.value = {
    name: npc.name || '',
    read_aloud_description: npc.read_aloud_description || '',
    combined_details: combineNPCDetails(npc),
    relationshipsArray: relationshipsArray
  };

  editingNPCIndex.value = index;
}

// Cancel editing NPC
function cancelEditNPC() {
  editingNPCIndex.value = null;
}

// Save edited NPC
function saveEditNPC() {
  if (editingNPCIndex.value === null) return;

  const npc = dungeonStore.currentDungeon.npcs[editingNPCIndex.value];
  if (!npc) return;

  // Update NPC fields
  npc.name = npcEditForm.value.name;
  npc.read_aloud_description = npcEditForm.value.read_aloud_description;

  // Store combined details
  npc.combined_details = npcEditForm.value.combined_details;

  // Convert relationships array back to object
  const relationshipsObject = {};
  npcEditForm.value.relationshipsArray.forEach(rel => {
    if (rel.name && rel.description) {
      relationshipsObject[rel.name] = rel.description;
    }
  });
  npc.relationships = relationshipsObject;

  // Save to localStorage
  dungeonStore.saveDungeons();

  editingNPCIndex.value = null;
}

// Delete relationship
function deleteRelationship(relationshipIndex) {
  npcEditForm.value.relationshipsArray.splice(relationshipIndex, 1);
}

// Add relationship
function addRelationship() {
  npcEditForm.value.relationshipsArray.push({ name: '', description: '' });
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

.edit-form {
  width: 100%;
}

.edit-field {
  margin-bottom: 1.5rem;
}

.button-group {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}
</style>
