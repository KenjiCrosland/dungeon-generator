import {
  npcName,
  npcShortDescription,
  currentlyLoadingNPCs,
  currentDungeon,
} from './dungeon-state.mjs';
import { saveDungeons } from './dungeon-utils.mjs';
import {
  createDungeonNPCPrompt,
  createDungeonNPCRelationshipsPrompt,
  validateDungeonNPCResponse,
  validateDungeonNPCRelationshipsResponse,
} from '../prompts/dungeon-npcs.mjs';
import { canGenerateStatblock } from '../util/can-generate-statblock.mjs';
import { generateGptResponse } from '../util/open-ai.mjs';
import { createStatblockPrompts } from '../prompts/monster-prompts.mjs';
import { ref } from 'vue';

// We can store loading states for NPC statblock generation:
export const npcStatblockLoadingStates = ref({});

function sbValidationPart1(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    const keys = [
      'armor_class',
      'hit_points',
      'speed',
      'senses',
      'languages',
      'challenge_rating',
      'proficiency_bonus',
      'abilities',
    ];
    return keys.every((k) => k in data);
  } catch {
    return false;
  }
}

function sbValidationPart2(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    return 'actions' in data;
  } catch {
    return false;
  }
}

// Example function:
export async function generateNPCStatblock(
  index,
  { CR, monsterType, isSpellcaster, premium },
) {
  if (!currentDungeon.value) return;
  const npc = currentDungeon.value.npcs[index];
  if (!npc) {
    console.error('NPC not found at index', index);
    return;
  }

  // Quick check for premium usage:
  const canGen = await canGenerateStatblock(premium);
  if (!canGen) return;

  npcStatblockLoadingStates.value[index] = {
    part1: true,
    part2: true,
    generating: true,
  };

  try {
    // Build up the "description" from the NPC data
    const npcBodyString = buildNPCString(npc); // Something like "This NPC named X is..."
    // Possibly also add the shortDescription or read_aloud_description if you want more detail

    const promptOptions = {
      monsterName: npc.name,
      challengeRating: CR || '1',
      monsterType: monsterType || 'Random',
      monsterDescription: npcBodyString || 'A mysterious being',
      caster: !!isSpellcaster,
    };

    const statblockPrompts = createStatblockPrompts(promptOptions);

    // PART 1
    const npcStatsPart1 = await generateGptResponse(
      statblockPrompts.part1,
      sbValidationPart1,
      3,
    );
    const part1Data = JSON.parse(npcStatsPart1);
    npc.statblock = { id: npc.name, ...part1Data }; // Just some ID, or use crypto.randomUUID()

    // PART 2
    // Provide GPT the context of part1
    const previousContext = [
      {
        role: 'user',
        content: 'Please give me the first part of the D&D statblock',
      },
      { role: 'system', content: npcStatsPart1 },
    ];

    const npcStatsPart2 = await generateGptResponse(
      statblockPrompts.part2,
      sbValidationPart2,
      3,
      previousContext,
    );
    const part2Data = JSON.parse(npcStatsPart2);

    // Combine for final
    npc.statblock = { ...npc.statblock, ...part2Data };
    saveDungeons();
  } catch (error) {
    console.error('Error generating NPC statblock:', error);
  } finally {
    npcStatblockLoadingStates.value[index] = {
      part1: false,
      part2: false,
      generating: false,
    };
    saveDungeons();
  }
}

function getDungeonOverviewText(overviewObject) {
  if (!overviewObject) return '';
  return Object.values(overviewObject)
    .filter((v) => typeof v === 'string')
    .join('\n');
}

function buildNPCString(npc) {
  const parts = [];
  if (npc.name) parts.push(npc.name);
  if (npc.description_of_position) parts.push(npc.description_of_position);
  if (npc.current_location) parts.push(npc.current_location);
  if (npc.distinctive_features_or_mannerisms)
    parts.push(npc.distinctive_features_or_mannerisms);
  if (npc.character_secret) parts.push(npc.character_secret);
  return parts.join('\n');
}

export async function generateDungeonNPC(npcIndex) {
  if (!currentDungeon.value) {
    console.error('No dungeon selected');
    return;
  }

  try {
    currentlyLoadingNPCs.value[npcIndex] = true;
    const npc = currentDungeon.value.npcs[npcIndex];
    if (!npc) {
      console.error('NPC not found');
      currentlyLoadingNPCs.value[npcIndex] = false;
      return;
    }

    const npcNameVal = npc.name;
    const npcShortDescriptionVal = npc.short_description;
    const dungeonOverviewText = getDungeonOverviewText(
      currentDungeon.value.dungeonOverview,
    );

    const prompt = createDungeonNPCPrompt(
      npcNameVal,
      dungeonOverviewText,
      npcShortDescriptionVal,
    );
    const npcResponse = await generateGptResponse(
      prompt,
      validateDungeonNPCResponse,
    );
    const npcData = JSON.parse(npcResponse);

    const relationshipsPrompt = createDungeonNPCRelationshipsPrompt(
      npcNameVal,
      npcResponse,
    );
    const relationshipsResponse = await generateGptResponse(
      relationshipsPrompt,
      validateDungeonNPCRelationshipsResponse,
    );
    const relationshipsData = JSON.parse(relationshipsResponse);

    const completeNPC = {
      ...npc,
      ...npcData,
      ...relationshipsData,
      opened: true,
      complete: true,
    };
    completeNPC.npc_string = buildNPCString(completeNPC);

    currentDungeon.value.npcs.splice(npcIndex, 1, completeNPC);
    currentlyLoadingNPCs.value[npcIndex] = false;
    saveDungeons();
  } catch (error) {
    console.error('Error generating dungeon NPC:', error);
    currentlyLoadingNPCs.value[npcIndex] = false;
  }
}

export function deleteNPC(npcIndex) {
  if (!currentDungeon.value) return;
  currentDungeon.value.npcs.splice(npcIndex, 1);
  saveDungeons();
}

export function addNPC() {
  if (!currentDungeon.value) {
    console.error('No dungeon selected');
    return;
  }

  const nameVal = npcName.value || 'Unnamed NPC';
  const shortDesc = npcShortDescription.value;
  if (!shortDesc) {
    console.error('NPC short description is required');
    return;
  }

  currentDungeon.value.npcs.push({
    name: nameVal,
    short_description: shortDesc,
    opened: false,
  });

  npcName.value = '';
  npcShortDescription.value = '';

  generateDungeonNPC(currentDungeon.value.npcs.length - 1);
  saveDungeons();
}
