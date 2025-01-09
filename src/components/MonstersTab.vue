<template>
  <div>
    <!-- Existing Monster List -->
    <div v-if="
      dungeonStore.currentDungeon
      && dungeonStore.currentDungeon.monsters
      && dungeonStore.currentDungeon.monsters.length
    ">
      <h2>Dungeon Monsters</h2>
      <cdr-accordion-group>
        <cdr-accordion v-for="monster in dungeonStore.currentDungeon.monsters" :key="monster.id"
          :id="'monster-' + monster.id" :opened="monster.opened" @accordion-toggle="monster.opened = !monster.opened"
          level="2">
          <template #label>
            {{ monster.name }}
          </template>

          <div>
            <div class="monster-header">
              <h3>{{ monster.name }}</h3>
              <cdr-tooltip id="tooltip-example" position="left" class="delete-button">
                <template #trigger>
                  <cdr-button size="small" :icon-only="true" :with-background="true"
                    @click="dungeonStore.deleteMonster(monster.id)">
                    <template #icon>
                      <icon-x-sm />
                    </template>
                  </cdr-button>
                </template>
                <div>Delete Monster</div>
              </cdr-tooltip>
            </div>

            <p v-if="
              !monster.detailedDescription &&
              !dungeonStore.monsterLoadingStates[monster.id]?.description
            ">
              {{ monster.description }}
            </p>

            <div v-if="
              monster.detailedDescription &&
              !dungeonStore.monsterLoadingStates[monster.id]?.description
            ">
              <p>{{ monster.detailedDescription.intro }}</p>
              <p>{{ monster.detailedDescription.appearance }}</p>
              <p>{{ monster.detailedDescription.behaviorAbilities }}</p>
              <p>{{ monster.detailedDescription.lore }}</p>
            </div>
            <MonsterDescriptionSkeleton v-if="dungeonStore.monsterLoadingStates[monster.id]?.description" />

            <!-- If monster has (or is generating) a statblock, show it -->
            <div v-if="
              monster.statblock ||
              dungeonStore?.monsterLoadingStates[monster.id]?.part1 ||
              dungeonStore?.monsterLoadingStates[monster.id]?.part2
            " style="margin-top: 1rem;">
              <Statblock :monster="monster.statblock" :premium="premium"
                :loadingPart1="dungeonStore.monsterLoadingStates[monster.id]?.part1 || false"
                :loadingPart2="dungeonStore.monsterLoadingStates[monster.id]?.part2 || false"
                @update-monster="updateMonsterStatblock(monster, $event)" />
            </div>

            <div v-if="!dungeonStore.monsterLoadingStates[monster.id]?.generating">
              <div class="monster-statblock-selects">
                <cdr-select v-model="monster.CR" label="CR" background="secondary" :options="crOptions"
                  :placeholder="'Select CR'" />
                <cdr-select v-model="monster.monsterType" label="Monster Type" prompt="Select Monster Type"
                  :options="['Random', 'Stronger Defense', 'Balanced', 'Stronger Offense']" />
                <div style="margin-top: 3rem;">
                  <cdr-checkbox v-model="monster.isSpellcaster">
                    Creature is a spellcaster
                  </cdr-checkbox>
                </div>
              </div>
            </div>

            <div class="monster-buttons">
              <cdr-button size="small" @click="dungeonStore.generateDescriptionAndStatblock(monster.id, premium)">
                {{
                  dungeonStore.monsterLoadingStates[monster.id]?.generating
                    ? 'Generating...'
                    : (monster.statblock
                      ? 'Re-generate Description & Statblock'
                      : 'Generate Description & Statblock')
                }}
              </cdr-button>
              <cdr-button v-if="monster.detailedDescription" size="small" @click="generateMonsterDescription(monster)">
                Regenerate Description
              </cdr-button>
              <cdr-button v-if="monster.statblock" @click="dungeonStore.generateMonsterStatblock(monster.id, premium)"
                size="small" variant="secondary">
                Regenerate Statblock
              </cdr-button>
            </div>
          </div>
        </cdr-accordion>
      </cdr-accordion-group>
    </div>
    <div v-else>
      <h2>No Monsters</h2>
      <p>No monsters have been generated for this dungeon yet.</p>
    </div>

    <!--
      FORM FOR CREATING A BRAND-NEW MONSTER:
      We set the default CR to the highest existing monster’s CR (if any).
    -->
    <h3 style="margin-top: 3rem; margin-bottom: 1rem">
      Create a Custom Monster
    </h3>
    <form @submit.prevent="generateNewMonster">
      <cdr-form-group :error="statblockFormError" class="monster-form">
        <!-- TOP ROW: monster name, monster type, CR -->
        <div class="form-row-top">
          <cdr-input id="monsterName" v-model="statblockForm.name" background="secondary"
            label="Monster Name (Example: Headless Horseman)" />
          <cdr-select v-model="statblockForm.monsterType" label="Monster Type"
            :options="['Random', 'Stronger Defense', 'Balanced', 'Stronger Offense']" background="secondary" />
          <cdr-select v-model="statblockForm.CR" label="CR" :options="crOptions" background="secondary"
            :placeholder="'Select CR'" />
        </div>

        <!-- MIDDLE ROW: monster description -->
        <div class="form-row-mid">
          <cdr-input tag="textarea" v-model="statblockForm.description"
            label="Monster Description / Special Instructions" :rows="4" background="secondary"
            placeholder="Describe the monster's abilities, or any special instructions..." />
        </div>

        <!-- BOTTOM ROW: isSpellcaster checkbox -->
        <div class="form-row-end">
          <cdr-checkbox v-model="statblockForm.isSpellcaster">
            Creature is a spellcaster
          </cdr-checkbox>
        </div>

        <!-- Submit button -->
        <cdr-button class="monster-form-button" type="submit" :disabled="generatingStatblock">
          {{ generatingStatblock ? 'Generating...' : 'Create Monster' }}
        </cdr-button>
      </cdr-form-group>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useDungeonStore } from '@/stores/dungeon-store.mjs';
import Statblock from '@/components/statblock/Statblock.vue';
import {
  CdrSelect,
  CdrCheckbox,
  CdrButton,
  CdrFormGroup,
  CdrInput,
  CdrAccordion,
  CdrAccordionGroup,
  CdrTooltip,
  IconXSm,
} from '@rei/cedar';
import crList from '@/data/cr-list.json';
import MonsterDescriptionSkeleton from '@/components/skeletons/MonsterDescriptionSkeleton.vue';

const dungeonStore = useDungeonStore();
const props = defineProps({ premium: { type: Boolean, default: false } });

const crOptions = crList.fullArray;

// This form is for creating a brand-new monster from scratch
const statblockForm = ref({
  name: '',
  CR: '',
  monsterType: '',
  description: '',
  isSpellcaster: false,
});

const statblockFormError = ref(null);
const generatingStatblock = ref(false);

function parseCR(crString) {
  if (!crString) return 0;
  if (crString.includes('/')) {
    const [num, den] = crString.split('/');
    const numerator = parseFloat(num);
    const denominator = parseFloat(den);
    if (!isNaN(numerator) && !isNaN(denominator)) {
      return numerator / denominator;
    }
  }
  const asFloat = parseFloat(crString);
  return isNaN(asFloat) ? 0 : asFloat;
}

function setDefaultCRToHighestMonster() {
  if (!dungeonStore.currentDungeon) return;
  const monsters = dungeonStore.currentDungeon.monsters || [];
  if (!monsters.length) return;

  let highestValue = 0;
  let highestString = '';

  for (const monster of monsters) {
    const val = parseCR(monster.CR);
    if (val > highestValue) {
      highestValue = val;
      highestString = monster.CR;
    }
  }
  // Set the form CR to the highest CR found
  if (highestString) {
    statblockForm.value.CR = highestString;
  }
}

onMounted(() => {
  setDefaultCRToHighestMonster();
});

// Called by the Statblock component to update an existing monster's statblock
function updateMonsterStatblock(monster, updatedMonster) {
  monster.statblock = updatedMonster;
  dungeonStore.updateStatblock(monster.id, updatedMonster);
}

// Regenerate only the monster’s description
async function generateMonsterDescription(monster) {
  try {
    await dungeonStore.generateMonsterDescription(monster);
  } catch (error) {
    console.error('Error generating monster description', error);
  }
}

// Create a new monster with a statblock (via GPT or any generator)
async function generateNewMonster() {
  if (!dungeonStore.currentDungeon) {
    statblockFormError.value = 'No dungeon selected.';
    return;
  }

  generatingStatblock.value = true;
  try {
    await dungeonStore.createAndGenerateMonster({
      name: statblockForm.value.name,
      shortDescription: statblockForm.value.description,
      monsterType: statblockForm.value.monsterType,
      CR: statblockForm.value.CR,
      isSpellcaster: statblockForm.value.isSpellcaster,
      premium: props.premium,
    });
  } catch (error) {
    statblockFormError.value = error.message;
  } finally {
    generatingStatblock.value = false;
  }
}
</script>

<style lang="scss" scoped>
.monster-statblock-selects {
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  justify-content: center;
}

.monster-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.monster-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-row-top {
  display: grid;
  grid-template-columns: 4fr 1.5fr .5fr;
  gap: 2rem;
}

@media screen and (max-width: 1020px) {
  .form-row-top {
    grid-template-columns: 1fr;
  }


}

.form-row-mid {
  margin-top: 1rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.form-row-end {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}
</style>
