import creatureTemplates from '../data/creatureTemplates.json';
import challengeRatingObjects from '../data/challengeRatings.json';

const baseCreatureTemplate = {
  name: 'Crystal Centipede',
  type_and_alignment: 'Huge monstrosity, unaligned',
  armor_class: '20 (natural armor)',
  hit_points: '300 (24d12 + 120)',
  speed: '60 ft., burrow 30 ft., climb 30 ft.',
  attributes:
    'STR 26 (+8), DEX 16 (+3), CON 20 (+5), INT 3 (-4), WIS 10 (+0), CHA 3 (-4)',
  saving_throws:
    'STR +14, CON +12 (These should aways be higher than attribute bonuses)',
  skills: 'Stealth +8',
  damage_resistances: 'Cold, Fire',
  damage_immunities: 'Poison',
  condition_immunities: 'Poisoned',
  senses: 'Darkvision 120 ft., tremorsense 60 ft., passive Perception 20',
  languages: 'Primordial',
  challenge_rating: '15 (13,000 XP)',
  proficiency_bonus: '+5',
};

export function createStatblockPrompts(options) {
  let {
    monsterName,
    challengeRating,
    monsterType,
    monsterDescription,
    caster,
  } = options;

  const monsterTypeDictionary = {
    Random: 'random',
    'Stronger Defense': 'defensive',
    Balanced: 'balanced',
    'Stronger Offense': 'offensive',
  };
  monsterType = monsterTypeDictionary[monsterType];
  //console.log('Monster Type:', monsterType);
  let templateArray = creatureTemplates[challengeRating];
  let template;
  if (monsterType !== 'random') {
    templateArray = templateArray.filter((template) => {
      return template.type === monsterType;
    });
  }
  if (templateArray.length === 0) {
    templateArray = creatureTemplates[challengeRating];
  }
  ////console.log(templateArray);
  template = templateArray[Math.floor(Math.random() * templateArray.length)];
  let challengeRatingObj = challengeRatingObjects[challengeRating];

  let abilityTypes = {
    random: [
      {
        name: 'Another Ability',
        description: 'Description of Another Ability (NOT AN ATTACK)',
      },
    ],
    defensive: [
      {
        name: 'Defensive Ability',
        description: 'Description of a Defensive Ability (NOT AN ATTACK)',
      },
    ],
    balanced: [
      {
        name: 'Another Ability',
        description: 'Description of Another Ability (NOT AN ATTACK)',
      },
    ],
    offensive: [
      {
        name: 'Offensive Ability',
        description:
          'Description of an ability that increases offensive capability but does not use an attack action',
      },
    ],
  };
  monsterType = monsterType || 'random';
  let abilities = abilityTypes[monsterType];
  abilities.unshift({
    name: 'An Ability',
    description: 'Description of an Ability (NOT AN ATTACK)',
  });
  let casterPrompt = '';
  if (caster === true) {
    abilities.push({
      name: 'Spellcasting',
      description:
        "Example Template: The pixie's innate ability is Charisma (spell save DC 12, +4 to hit with spell attacks). It can innately cast the following spells: At will: druidcraft, thaumaturgy. 1/day each: sanctuary, bless",
    });
    casterPrompt =
      'This creature is a spellcaster, so be sure to include thematically appropriate spells or cantrips for this creature in the abilities section. Also, make sure the spellcasting ability (INT, WIS or CHA) is at least 11 or above. These spells will all require an action or bonus action depending on the spell';
  }

  let monsterDescriptionPromptPart1 = '';
  let monsterDescriptionPromptPart2 = '';
  if (monsterDescription.length > 0) {
    monsterDescriptionPromptPart1 = `Finally, here are some final output instructions provided by the user via a form field. These instructions could include a description of the creature (example: the creature is very evasive) or output instructions (please output in a particular language) Do not modify stats based on the special instructions unless explicitly stated below. Also, as this creature will be generated in two parts, please ignore any details of the below special instructions that doesn't fit into the above data structure: 
    ${monsterDescription}`;
    monsterDescriptionPromptPart2 = `Finally, please remember the final output instructions provided in the previous prompt: ${monsterDescription}. If any part of these special instructions can be applied to the actions or legendary actions (either mechanically or as flavor) please do so. Do not modify stats based on special instructions unless explcitly stated to do so.`;
  }
  baseCreatureTemplate.abilities = abilities;
  let legendaryResistancePrompt = '';
  if (template.legendary_actions) {
    abilities.push({
      name: 'Legendary Resistance (3/Day)',
      description: `If the creature fails a saving throw, it can choose to succeed instead.`,
    });
    legendaryResistancePrompt = `Be sure to include legendary resistances in the abilities array for this creature.`;
  }
  //console.log(parseInt(challengeRating));
  if (template.actions.length <= 3 && parseInt(challengeRating) > 1) {
    //console.log('In another action');
    template.actions.push({
      name: 'Another Action',
      description:
        'An action that thematically matches the creature. The more unique the better. If this technique does more damage than normal, add a recharge mechanic',
    });
  }
  let tohit = '';
  if (template.to_hit_bonus) {
    tohit = `The to hit bonus for all attacks should be ${template.to_hit_bonus}`;
  }

  let numberOfSavingThrows = template.saving_throws
    ? template.saving_throws.split(',').length
    : 0;
  let savingThrowsPrompt = '';
  if (numberOfSavingThrows > 0) {
    savingThrowsPrompt = `The creature should have ${numberOfSavingThrows} saving throws of ${template.saving_throws}. Choose the most thematically appropriate attributes to match the saving throw bonuses for this creature.`;
  }

  function generateResistanceAndImmunityPrompt(template, challengeRating) {
    // Base thresholds for resistances and immunities based on CR
    const baseThresholds = {
      low: { maxResistances: 1, maxImmunities: 0 },
      mid: { maxResistances: 2, maxImmunities: 1 },
      high: { maxResistances: 3, maxImmunities: 1 },
      epic: { maxResistances: 4, maxImmunities: 2 },
    };

    // Type adjustments to base thresholds
    const typeAdjustments = {
      defensive: { resistanceBonus: 1, immunityBonus: 1 },
      balanced: { resistanceBonus: 0, immunityBonus: 0 },
      offensive: { resistanceBonus: -1, immunityBonus: -1 },
    };

    // Determine the appropriate level based on CR
    let level;
    challengeRating = parseInt(challengeRating);
    if (challengeRating <= 5) level = 'low';
    else if (challengeRating <= 10) level = 'mid';
    else if (challengeRating <= 25) level = 'high';
    else level = 'epic';
    //console.log('Level:', level);
    const baseLimit = baseThresholds[level];
    //console.log('Template Type:', template.type);
    const adjustment =
      typeAdjustments[template.type] || typeAdjustments['balanced'];

    // Calculate the adjusted limits directly using the maximum allowed values
    const totalResistances = Math.max(
      0,
      baseLimit.maxResistances + adjustment.resistanceBonus,
    );
    const totalImmunities = Math.max(
      0,
      baseLimit.maxImmunities + adjustment.immunityBonus,
    );

    // Construct the prompt text
    let resistancePrompt = `The creature has ${totalResistances} resistances.`;
    let immunityPrompt = `The creature has ${totalImmunities} immunities.`;

    // Combine explanation with the generated prompts
    let resistanceAndImmunitiesPrompt = `${resistancePrompt} ${immunityPrompt}`;

    return resistanceAndImmunitiesPrompt;
  }

  // Example usage within your statblock creation logic
  let resistanceAndImmunitiesPrompt = generateResistanceAndImmunityPrompt(
    template,
    challengeRating,
  );

  const part2Obj = {
    actions: [...template.actions],
  };
  if (template.legendary_actions) {
    part2Obj.legendary_actions = template.legendary_actions;
  }
  let multiattackString = '';
  let hasMultiattack = determineMultiattack(template.actions);
  if (hasMultiattack) {
    multiattackString =
      'Be sure to move the Multiattack action to the very beginning of the actions array.';
  }

  function determineMultiattack(actions) {
    let hasMultiattack = false;
    actions.forEach((action) => {
      if (action.name.toLowerCase() === 'multiattack') {
        hasMultiattack = true;
      }
    });
    return hasMultiattack;
  }

  return {
    part1: `Please give me the first part of a D&D statblock in the following format:

    ${JSON.stringify(baseCreatureTemplate, null, '\t')}
    
    With the above format in mind, please generate the first part of a statblock for ${monsterName}. Abilities should be passive and not require an action. ${casterPrompt}
    The creature should have a challenge_rating ${challengeRating} with a proficiency_bonus of +${
      challengeRatingObj.proficiency_bonus
    }. The effective armor_class should be ${
      template.armor_class
    } (depending on abilities) and hit_points should be ${template.hit_points}.
    ${savingThrowsPrompt} ${resistanceAndImmunitiesPrompt} ${legendaryResistancePrompt} Remember that the only possible damage types are from this list: Acid, Bludgeoning, Cold, Fire, Force, Lightning, Necrotic, Piercing, Poison, Psychic, Radiant, Slashing, Thunder as well as "Bludgeoning, Slashing and Piercing from non-magical weapons". Finally condition_immunities can only be selected from this list: Blinded, Charmed, Deafened, Frightened, Grappled, Incapacitated, Paralyzed, Petrified, Poisoned, Prone, Restrained, Stunned, Unconscious
    ${monsterDescriptionPromptPart1}`,

    part2: `Please give me the second part of a D&D statblock in the following format. Use the same number of actions and abilities (except the example action) and use all the info provided in the description. Use the exact average damage, number/type of dice and damage modifiers provided below for each action template. Anything in this format: 30 (4d12 + 4) should not be changed. If special instructions were used in the previous prompt, please use it to inform the actions of this creature.
    
    ${JSON.stringify(part2Obj, null, '\t')}
    
    With the above format in mind, please generate the second part of a statblock for ${monsterName}. The attack_bonus for each attack should be ${
      template.to_hit_bonus || challengeRatingObj.attack_bonus
    }. For each of the example actions in the actions array, please retain the exact avg_damage and the exact (number_of_dice/type_of_dice + modifier) and the exact dice roll modifiers. Do not add more actions than there are examples for them. Provide damage types and flavor. ${multiattackString} Actions (Action 1, Action 2, etc) should be replaced with their actual generated names. Actions should not repeat any content from the previously generated abilities array. Conditions caused by actions should vary and not repeat conditions cuased by other actions or abilities. Don't include passive abilities. Finally, if an action doesn't fit thematically with ${monsterName} feel free to modify but try to keep damage and DC saves the same. ${monsterDescriptionPromptPart2}`,
  };
}
