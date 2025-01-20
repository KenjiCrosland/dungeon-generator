import { currentDungeon, monsterLoadingStates } from './dungeon-state.mjs';
import { currentDungeonOverviewString } from './overview-store.mjs';
import { saveDungeons, findMonsterById } from './dungeon-utils.mjs';
import { canGenerateStatblock } from '../util/can-generate-statblock.mjs';
import { generateGptResponse } from '../util/open-ai.mjs';
import { createStatblockPrompts } from '../prompts/monster-prompts.mjs';
import {
  monsterDescriptionPrompt,
  validateMonsterDescription,
} from '../prompts/monster-description.mjs';
import { generateStatblockForCreature } from '../util/statblock-generator.mjs';

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

export async function createAndGenerateMonster({
  name,
  shortDescription,
  monsterType,
  CR,
  isSpellcaster,
  premium,
}) {
  if (!currentDungeon.value) {
    console.error('No dungeon selected');
    return null;
  }

  // Fall back to placeholders if user left fields blank
  const monsterName = name && name.trim() !== '' ? name : '';
  const monsterDesc =
    shortDescription && shortDescription.trim() !== '' ? shortDescription : '';

  const newMonsterId = crypto.randomUUID();
  const newMonster = {
    id: newMonsterId,
    name: monsterName,
    CR: CR || '1',
    monsterType: monsterType || 'Random',
    isSpellcaster: !!isSpellcaster,
    // We'll store the short user-provided text in `description` so GPT can expand it
    description: monsterDesc,
    statblock: undefined, // will be filled later
    detailedDescription: undefined,
  };

  // Add monster to the dungeon
  currentDungeon.value.monsters.push(newMonster);
  saveDungeons();

  // Now that it's in the array, let's generate its detailed description + statblock
  try {
    await generateDescriptionAndStatblock(newMonsterId, premium);
  } catch (error) {
    console.error('Error generating full monster data:', error);
  }

  return newMonster;
}

export async function generateDescriptionAndStatblock(monsterId, premium) {
  if (!currentDungeon.value) return;

  const monster = findMonsterById(currentDungeon, monsterId);
  if (!monster) {
    console.error('Monster not found');
    return;
  }

  monsterLoadingStates.value[monsterId] = {
    part1: true,
    part2: true,
    description: true,
    generating: true,
  };

  await generateMonsterDescription(monster);
  await generateMonsterStatblock(monsterId, premium);
}

export async function generateMonsterStatblock(monsterId, premium) {
  if (!currentDungeon.value) return;

  const monster = findMonsterById(currentDungeon, monsterId);
  if (!monster) {
    console.error('Monster not found');
    return;
  }

  const canGen = await canGenerateStatblock(premium);
  if (!canGen) return;

  monsterLoadingStates.value[monsterId] = {
    part1: true,
    part2: true,
    description: false,
    generating: true,
  };

  let part1Data = null;
  let part2Data = null;

  try {
    // Build prompt data
    const fullDescription = monster.detailedDescription
      ? Object.values(monster.detailedDescription).join('\n')
      : monster.description || 'A mysterious being';
    const promptOptions = {
      monsterName: monster.name,
      challengeRating: monster.CR || '1',
      monsterType: monster.monsterType || 'Random',
      monsterDescription: fullDescription,
      caster: monster.isSpellcaster || false,
    };
    const statblockPrompts = createStatblockPrompts(promptOptions);

    // Part 1
    const npcStatsPart1 = await generateGptResponse(
      statblockPrompts.part1,
      sbValidationPart1,
      3,
    );
    part1Data = JSON.parse(npcStatsPart1);

    // Assign partial statblock so user sees progress
    monster.statblock = { id: monster.id, ...part1Data };
    saveDungeons();

    monsterLoadingStates.value[monsterId] = {
      part1: false,
      part2: true,
      description: false,
      generating: true,
    };

    // Provide conversation context for GPT
    const previousContext = [
      {
        role: 'user',
        content:
          'Please give me the first part of a D&D statblock in the following format',
      },
      { role: 'system', content: npcStatsPart1 },
    ];

    // Part 2
    const npcStatsPart2 = await generateGptResponse(
      statblockPrompts.part2,
      sbValidationPart2,
      3,
      previousContext,
    );
    part2Data = JSON.parse(npcStatsPart2);

    // Assign final statblock
    monster.statblock = { id: monster.id, ...part1Data, ...part2Data };
    saveDungeons();
  } catch (error) {
    console.error('Error generating monster statblock:', error);
    if (part1Data && !part2Data) {
      // If we got part1 but failed to get part2
      monster.statblock = undefined;
      saveDungeons();
    }
    throw error;
  } finally {
    monsterLoadingStates.value[monsterId] = {
      part1: false,
      part2: false,
      description: false,
      generating: false,
    };
    saveDungeons();
  }
}

export async function updateStatblock(monsterId, statblock) {
  if (!currentDungeon.value) return;

  const monster = findMonsterById(currentDungeon, monsterId);
  if (!monster) {
    console.error('Monster not found');
    return;
  }

  // Ensure the statblock has an id
  if (!statblock.id) {
    statblock.id = monster.id || crypto.randomUUID();
  }

  // Just store the updated statblock on the monster
  monster.statblock = statblock;
  saveDungeons();
}

export async function generateAndSaveStatblock({
  name,
  CR,
  description,
  isSpellcaster,
  premium,
  monsterType,
}) {
  if (!currentDungeon.value) {
    console.error('No dungeon selected');
    return;
  }

  try {
    const statblock = await generateStatblockForCreature({
      name,
      CR,
      description,
      isSpellcaster,
      premium,
      monsterType,
    });

    // If we’re not attaching this to an existing monster, just store the statblock somewhere
    // Or you might create a new monster object on the fly:
    const monster = {
      id: crypto.randomUUID(),
      name,
      CR,
      description,
      isSpellcaster,
      monsterType,
      statblock,
    };

    // Push the new monster to the dungeon’s monsters array
    currentDungeon.value.monsters.push(monster);
    saveDungeons();

    return statblock;
  } catch (error) {
    console.error('Error generating statblock:', error);
    throw error;
  }
}

export async function generateMonsterDescription(monster) {
  if (!currentDungeon.value) return;

  if (!monster) {
    console.error('Monster not found');
    return;
  }

  const overview = currentDungeonOverviewString.value;

  try {
    monsterLoadingStates.value[monster.id] = {
      description: true,
      generating: true,
    };

    const descriptionPrompt = monsterDescriptionPrompt(overview, monster);
    const detailedDescription = await generateGptResponse(
      descriptionPrompt,
      validateMonsterDescription,
      3,
    );

    const descriptionData = JSON.parse(detailedDescription);
    monster.detailedDescription = descriptionData;
    if (!monster.name) {
      monster.name = descriptionData.name;
    }

    monsterLoadingStates.value[monster.id].description = false;
    monsterLoadingStates.value[monster.id].generating = false;
    saveDungeons();
  } catch (error) {
    console.error('Error generating monster description', error);
  }
}

// Delete the entire monster from the dungeon, including its statblock
export function deleteMonster(monsterId) {
  if (!currentDungeon.value) return;

  const idx = currentDungeon.value.monsters.findIndex(
    (m) => m.id === monsterId,
  );
  if (idx !== -1) {
    currentDungeon.value.monsters.splice(idx, 1);
    saveDungeons();
  }
}
