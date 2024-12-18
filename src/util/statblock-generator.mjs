import { generateGptResponse } from '../util/open-ai.mjs';
import { createStatblockPrompts } from '../prompts/monster-prompts.mjs';
import { canGenerateStatblock } from '../util/can-generate-statblock.mjs';

function validationPart1(jsonString) {
  try {
    const jsonObj = JSON.parse(jsonString);
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
    return keys.every((key) => key in jsonObj);
  } catch (error) {
    return false;
  }
}

function validationPart2(jsonString) {
  try {
    const jsonObj = JSON.parse(jsonString);
    const keys = ['actions'];
    return keys.every((key) => key in jsonObj);
  } catch (error) {
    return false;
  }
}

export async function generateStatblockForCreature({
  name,
  CR,
  description,
  isSpellcaster,
  premium,
}) {
  const canGenerate = await canGenerateStatblock(premium);
  if (!canGenerate) {
    throw new Error('Cannot generate statblock. Limit reached or not allowed.');
  }

  const promptOptions = {
    monsterName: name,
    challengeRating: CR,
    monsterType: 'Random', // Adjust if needed
    monsterDescription: description,
    caster: isSpellcaster,
  };

  const npcPrompts = createStatblockPrompts(promptOptions);

  // Part 1
  const npcStatsPart1 = await generateGptResponse(
    npcPrompts.part1,
    validationPart1,
    3,
  );
  const part1Data = JSON.parse(npcStatsPart1);

  const previousContext = [
    {
      role: 'user',
      content: `Please give me the first part of a D&D statblock in the following format`,
    },
    { role: 'system', content: `${npcStatsPart1}` },
  ];

  const npcStatsPart2 = await generateGptResponse(
    npcPrompts.part2,
    validationPart2,
    3,
    previousContext,
  );
  const part2Data = JSON.parse(npcStatsPart2);

  return {
    ...part1Data,
    ...part2Data,
  };
}
