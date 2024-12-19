<template>
  <div>
    <div v-if="
      dungeonStore.currentDungeon
      && dungeonStore.currentDungeon.dungeonOverview
      && dungeonStore.currentDungeon.dungeonOverview.monsters
      && dungeonStore.currentDungeon.dungeonOverview.monsters.length
    ">
      <h2>Dungeon Monsters</h2>
      <cdr-accordion-group>
        <cdr-accordion v-for="(monster) in dungeonStore.currentDungeon.dungeonOverview.monsters" :key="monster.id"
          :id="'monster-' + monster.id" :opened="monster.opened" @accordion-toggle="monster.opened = !monster.opened"
          level="2">
          <template #label>
            {{ monster.name }}
          </template>
          <div>
            <h3>{{ monster.name }}</h3>
            <p>{{ monster.description }}</p>
            <div
              v-if="monster.statblock || dungeonStore?.monsterLoadingStates[monster.id]?.part1 || dungeonStore?.monsterLoadingStates[monster.id]?.part2"
              style="margin-top: 1rem;">
              <Statblock :monster="monster.statblock" :premium="premium"
                :loadingPart1="dungeonStore.monsterLoadingStates[monster.id]?.part1 || false"
                :loadingPart2="dungeonStore.monsterLoadingStates[monster.id]?.part2 || false"
                @update-monster="updateMonsterStatblock(monster, $event)" />
            </div>
            <cdr-select v-model="monster.CR" label="CR" background="secondary" :options="crOptions"
              :placeholder="'Select CR'" />
            <cdr-select v-model="monster.monsterType" label="Type"
              :options="['Random', 'Stronger Defense', 'Balanced', 'Stronger Offense']" />
            <cdr-checkbox v-model="monster.isSpellcaster">
              Creature is a spellcaster
            </cdr-checkbox>
            <cdr-button size="small" @click="dungeonStore.generateMonsterStatblock(monster.id, premium)">
              {{ dungeonStore.monsterLoadingStates[monster.id]?.generating
                ? 'Generating...'
                : (monster.statblock ? 'Re-generate Statblock' : 'Generate Statblock') }}
            </cdr-button>
          </div>
        </cdr-accordion>
      </cdr-accordion-group>
    </div>
    <div v-else>
      <h2>No Monsters</h2>
      <p>No monsters have been generated for this dungeon yet.</p>
    </div>

    <h3 style="margin-top: 3rem; margin-bottom: 1rem">Generate Statblock</h3>
    <cdr-form-group :error="statblockFormError">
      <cdr-input v-model="statblockForm.name" label="Name" />
      <cdr-select v-model="statblockForm.CR" label="CR" background="secondary" :options="crOptions"
        :placeholder="'Select CR'">
        <template #helper-text-bottom>
          Select the CR for this creature.
        </template>
      </cdr-select>
      <cdr-input tag="textarea" v-model="statblockForm.description" label="Monster Description" background="secondary"
        :rows="5" placeholder="Describe the monster's abilities, personality, etc." />
      <cdr-checkbox v-model="statblockForm.isSpellcaster">
        Creature is a spellcaster
      </cdr-checkbox>

      <cdr-button style="margin-top: 2rem" @click="generateStatblock" :disabled="generatingStatblock">
        {{ generatingStatblock ? 'Generating...' : 'Generate Statblock' }}
      </cdr-button>
    </cdr-form-group>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useDungeonStore } from '@/stores/dungeon-store.mjs';
import Statblock from '@/components/statblock/Statblock.vue';
import { CdrSelect, CdrCheckbox, CdrButton, CdrFormGroup, CdrInput, CdrAccordion, CdrAccordionGroup } from '@rei/cedar';
import crList from '@/data/cr-list.json';

const dungeonStore = useDungeonStore();
const props = defineProps({ premium: { type: Boolean, default: false } });

const crOptions = crList.fullArray;

const statblockForm = ref({
  name: '',
  CR: '',
  monsterType: '',
  description: '',
  isSpellcaster: false
});

const statblockFormError = ref(null);
const generatingStatblock = ref(false);

function updateMonsterStatblock(monster, updatedMonster) {
  // Update the monster object’s statblock locally
  monster.statblock = updatedMonster;
  // Then call the store method with the monster’s id and the updated statblock
  dungeonStore.updateStatblock(monster.id, updatedMonster);
}


async function generateStatblock() {
  if (!dungeonStore.currentDungeon) {
    statblockFormError.value = 'No dungeon selected.';
    return;
  }

  generatingStatblock.value = true;
  try {
    await dungeonStore.generateAndSaveStatblock({
      name: statblockForm.value.name,
      CR: statblockForm.value.CR,
      monsterType: statblockForm.value.monsterType,
      description: statblockForm.value.description,
      isSpellcaster: statblockForm.value.isSpellcaster,
      premium: props.premium
    });
  } catch (error) {
    statblockFormError.value = error.message;
  } finally {
    generatingStatblock.value = false;
  }
}
</script>

<style scoped></style>
