import { generateGptResponse } from './open-ai.mjs';
import { createStatblockPrompts } from './monster-prompts.mjs';

export async function generateStatblockPart1({
  monsterName,
  challengeRating,
  monsterType,
  monsterDescription,
  caster,
}) {
  let monsterPart1 = null;
  let errorMessage = '';

  const promptOptions = {
    monsterName,
    challengeRating,
    monsterType,
    monsterDescription,
    caster,
  };
  const monsterPrompts = createStatblockPrompts(promptOptions);

  try {
    console.log(monsterPrompts.part1);
    const monsterStatsPart1 = await generateGptResponse(
      monsterPrompts.part1,
      validationPart1,
      3,
    );
    monsterPart1 = JSON.parse(monsterStatsPart1);
  } catch (e) {
    errorMessage =
      'There was an issue generating Part 1 of the description. Please retry.';
  }

  return { monsterPart1, monsterPrompts, errorMessage };
}

export async function completeStatblock(monsterStatsPart1, monsterPrompts) {
  let monsterPart2 = null;
  let errorMessage = '';

  const previousContext = [
    {
      role: 'user',
      content: `Please give me the first part of a D&D statblock in the following format`,
    },
    { role: 'system', content: `${monsterStatsPart1}` },
  ];

  try {
    console.log(monsterPrompts.part2);
    const monsterStatsPart2 = await generateGptResponse(
      monsterPrompts.part2,
      validationPart2,
      3,
      previousContext,
    );
    monsterPart2 = JSON.parse(monsterStatsPart2);
  } catch (e) {
    errorMessage =
      'There was an issue generating Part 2 of the description. Please retry.';
  }

  return { monsterPart2, errorMessage };
}

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
