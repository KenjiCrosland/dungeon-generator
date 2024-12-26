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
    description: false,
    generating: true,
  };

  let part1Data = null;
  let part2Data = null;
  let statblockId = monster.id || crypto.randomUUID();

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
    const statblockPrompts = createStatblockPrompts(promptOptions);

    // Part 1
    let npcStatsPart1 = await generateGptResponse(
      statblockPrompts.part1,
      sbValidationPart1,
      3,
    );
    part1Data = JSON.parse(npcStatsPart1);

    // Assign partial statblock now so user can see partial progress
    const partialStatblock = { id: statblockId, ...part1Data };
    monster.statblock = partialStatblock;

    // Check if we already have a statblock with this id
    const existingIdx = currentDungeon.value.statblocks.findIndex(
      (sb) => sb.id === statblockId,
    );
    if (existingIdx !== -1) {
      currentDungeon.value.statblocks[existingIdx] = partialStatblock;
    } else {
      currentDungeon.value.statblocks.push(partialStatblock);
    }
    saveDungeons();

    monsterLoadingStates.value[monsterId] = {
      part1: false,
      part2: true,
      description: false,
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
      // Remove partial statblock since part2 failed
      const idx = currentDungeon.value.statblocks.findIndex(
        (sb) => sb.id === statblockId,
      );
      if (idx !== -1) {
        currentDungeon.value.statblocks.splice(idx, 1);
      }
      monster.statblock = undefined;
      saveDungeons();
      throw error;
    }

    part2Data = JSON.parse(npcStatsPart2);
    const finalStatblock = { id: statblockId, ...part1Data, ...part2Data };
    monster.statblock = finalStatblock;

    // Replace partial with final
    const partialIdx = currentDungeon.value.statblocks.findIndex(
      (sb) => sb.id === statblockId,
    );
    if (partialIdx !== -1) {
      currentDungeon.value.statblocks[partialIdx] = finalStatblock;
    } else {
      currentDungeon.value.statblocks.push(finalStatblock);
    }

    saveDungeons();
  } catch (e) {
    console.error('Error generating monster statblock:', e);
    if (part1Data && !part2Data) {
      // If we had part1 but failed before part2 was saved,
      // remove the partial statblock from the dungeon
      const idx = currentDungeon.value.statblocks.findIndex(
        (sb) => sb.id === statblockId,
      );
      if (idx !== -1) {
        currentDungeon.value.statblocks.splice(idx, 1);
      }
      monster.statblock = undefined;
      saveDungeons();
    }
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

  monster.statblock = statblock;
  const existingIdx = currentDungeon.value.statblocks.findIndex(
    (sb) => sb.id === statblock.id,
  );
  if (existingIdx !== -1) {
    currentDungeon.value.statblocks[existingIdx] = statblock;
  } else {
    currentDungeon.value.statblocks.push(statblock);
  }
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
    const { generateStatblockForCreature } = await import(
      '../util/statblock-generator.mjs'
    );
    const statblock = await generateStatblockForCreature({
      name,
      CR,
      description,
      isSpellcaster,
      premium,
      monsterType,
    });

    if (!statblock.id) {
      statblock.id = crypto.randomUUID();
    }

    const existingIdx = currentDungeon.value.statblocks.findIndex(
      (sb) => sb.id === statblock.id,
    );
    if (existingIdx !== -1) {
      currentDungeon.value.statblocks[existingIdx] = statblock;
    } else {
      currentDungeon.value.statblocks.push(statblock);
    }
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
    // Generate the detailed monster description
    monsterLoadingStates.value[monster.id] = {
      part1: false,
      part2: false,
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

    monsterLoadingStates.value[monster.id] = {
      part1: false,
      part2: false,
      description: false,
      generating: true,
    };

    // Save the description to the monster
    const existingIdx = currentDungeon.value.statblocks.findIndex(
      (sb) => sb.id === monster.id,
    );
    if (existingIdx !== -1) {
      currentDungeon.value.statblocks[existingIdx].description =
        descriptionData;
    } else {
      currentDungeon.value.statblocks.push({
        id: monster.id,
        description: descriptionData,
      });
    }
    saveDungeons();
  } catch (error) {
    console.error('Error generating monster description', error);
  }
}
