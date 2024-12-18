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
import { generateGptResponse } from '../util/open-ai.mjs';

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
