import { currentDungeon, monsterLoadingStates } from './dungeon-state.mjs';
import { saveDungeons, findMonsterById } from './dungeon-utils.mjs';
import { canGenerateStatblock } from '../util/can-generate-statblock.mjs';
import { generateGptResponse } from '../util/open-ai.mjs';
import { createStatblockPrompts } from '../prompts/monster-prompts.mjs';

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
    generating: true,
  };
  let part1Data = null;
  let part2Data = null;

  try {
    const fullDescription = `${
      monster.description || 'A mysterious being'
    } known as ${monster.name}.`;
    const promptOptions = {
      monsterName: monster.name,
      challengeRating: monster.CR || '1',
      monsterType: monster.monsterType || 'Random',
      monsterDescription: fullDescription,
      caster: monster.isSpellcaster || false,
    };
    console.log('Prompt Options', promptOptions);
    const statblockPrompts = createStatblockPrompts(promptOptions);
    console.log('PArt 1', statblockPrompts.part1);
    console.log('PArt 2', statblockPrompts.part2);
    // Part 1
    let npcStatsPart1 = await generateGptResponse(
      statblockPrompts.part1,
      sbValidationPart1,
      3,
    );
    part1Data = JSON.parse(npcStatsPart1);
    monster.statblock = { ...part1Data };
    currentDungeon.value.statblocks.push(monster.statblock);
    saveDungeons();

    monsterLoadingStates.value[monsterId] = {
      part1: false,
      part2: true,
      generating: true,
    };

    const previousContext = [
      {
        role: 'user',
        content:
          'Please give me the first part of a D&D statblock in the following format',
      },
      { role: 'system', content: npcStatsPart1 },
    ];

    // Part 2
    let npcStatsPart2;
    try {
      npcStatsPart2 = await generateGptResponse(
        statblockPrompts.part2,
        sbValidationPart2,
        3,
        previousContext,
      );
    } catch (error) {
      console.error('Error generating part 2 of statblock:', error);
      const idx = currentDungeon.value.statblocks.indexOf(monster.statblock);
      if (idx !== -1) currentDungeon.value.statblocks.splice(idx, 1);
      monster.statblock = undefined;
      saveDungeons();
      throw error;
    }

    part2Data = JSON.parse(npcStatsPart2);
    monster.statblock = { ...part1Data, ...part2Data };

    // Replace partial statblock
    const partialIdx = currentDungeon.value.statblocks.indexOf(part1Data);
    if (partialIdx !== -1) {
      currentDungeon.value.statblocks[partialIdx] = monster.statblock;
    } else {
      currentDungeon.value.statblocks.push(monster.statblock);
    }
    saveDungeons();
  } catch (e) {
    console.error('Error generating monster statblock:', e);
    if (part1Data && !part2Data) {
      const idx = currentDungeon.value.statblocks.indexOf(monster.statblock);
      if (idx !== -1) currentDungeon.value.statblocks.splice(idx, 1);
      monster.statblock = undefined;
      saveDungeons();
    }
  } finally {
    monsterLoadingStates.value[monsterId] = {
      part1: false,
      part2: false,
      generating: false,
    };
    saveDungeons();
  }
}

export async function generateAndSaveStatblock({
  name,
  CR,
  description,
  isSpellcaster,
  premium,
}) {
  if (!currentDungeon.value) {
    console.error('No dungeon selected');
    return;
  }

  try {
    const { generateStatblockForCreature } = await import(
      '../util/statblock-generator.mjs'
    );
    const statblock = await generateStatblockForCreature({
      name,
      CR,
      description,
      isSpellcaster,
      premium,
    });
    currentDungeon.value.statblocks.push(statblock);
    saveDungeons();
    return statblock;
  } catch (error) {
    console.error('Error generating statblock:', error);
    throw error;
  }
}
