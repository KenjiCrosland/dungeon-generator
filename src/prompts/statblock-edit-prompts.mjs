import creatureTemplates from '../data/creatureTemplates.json';

export function legendaryActionsPrompt(monster, userSuggestion) {
  let prompt = `Here is a monster object:
  ${JSON.stringify(monster, null, 2)}`;
  if (!monster.legendary_actions || monster.legendary_actions.length === 0) {
    prompt += `
      The monster currently has no legendary actions. Please add 3 and provide a description for each. Make sure to include the cost for each action (1, 2, or 3 actions). The legendary actions should match the CR of the monster and be interesting and challenging for the players;
      Here is an example structure for legendary actions:
      "legendary_actions": [
          {
          "name": "Legendary Action Name (Costs 1 Action)",
          "description": "Description of the legendary action."
          },
          {
          "name": "Legendary Action Name (Costs 2 Actions)",
          "description": "Description of the legendary action."
          },
                      {
          "name": "Legendary Action Name (Costs 3 Actions)",
          "description": "Description of the legendary action."
          }
      ]
      `;
  }
  if (monster.legendary_actions && monster.legendary_actions.length > 0) {
    //make it completely different than the current legendary actions
    prompt += `
      The monster currently has the following legendary actions:
      ${monster.legendary_actions
        .map((action) => `${action.name}: ${action.description}`)
        .join('\n')}
      Please replace the current legendary actions with 3 completely different ones. Make sure to include the cost for each action (1, 2, or 3 actions). The legendary actions should match the CR of the monster and be interesting and challenging for the players;
      Here is an example structure for legendary actions:
      "legendary_actions": [
          {
          "name": "Legendary Action Name (Costs 1 Action)",
          "description": "Description of the legendary action."
          },
          {
          "name": "Legendary Action Name (Costs 2 Actions)",
          "description": "Description of the legendary action."
          },
                      {
          "name": "Legendary Action Name (Costs 3 Actions)",
          "description": "Description of the legendary action."
          }
      ]
      `;
  }
  if (userSuggestion) {
    prompt += `
          The user has made the following suggestion for legendary actions section:
          ${userSuggestion}
          `;
  }
  prompt += `Don't return the full monster object, just the legendary_actions array in JSON format.`;
  return prompt;
}

function getChallengeRating(CRString) {
  //return the CR without the (number XP) part
  return CRString.split(' ')[0];
}
function getRandomTemplateByCRAndType(CR, type) {
  //templates are organized by a CR key
  let templates = creatureTemplates[CR];
  //filter the templates by type don't filter if tyle is "Random"
  if (type !== 'Random') {
    if (type === 'Stronger Offense') {
      type = 'offensive';
    }
    if (type === 'Stronger Defense') {
      type = 'defensive';
    }
    if (type === 'Balanced') {
      type = 'balanced';
    }
    templates = templates.filter((template) => template.type === type);
  }
  //return a random template
  return templates[Math.floor(Math.random() * templates.length)];
}

export function actionsPrompt(monster, userSuggestion) {
  let CR = getChallengeRating(monster.challenge_rating);
  let type = monster.monsterType || 'Random';
  let template = getRandomTemplateByCRAndType(CR, type);
  let prompt = `Here is a monster object:
  ${JSON.stringify(monster, null, 2)}`;
  if (!monster.actions || monster.actions.length === 0) {
    prompt += `
      The monster currently has no actions. Please give me a new actions array that matches the damage and to hit bonuses of the following template:
      ${JSON.stringify(template.actions, null, 2)}
      It's very important to use the exact number of actions and the same damage and to hit bonuses as the template above.
      `;
  }
  if (monster.actions && monster.actions.length > 0) {
    //make it completely different than the current actions
    prompt += `
      Please give me a new actions array that matches the damage and to hit bonuses of the following template:
      ${JSON.stringify(template.actions, null, 2)}
      It's very important to use the exact number of actions and the same damage and to hit bonuses as the template above.
      ]
      `;
  }
  if (userSuggestion) {
    prompt += `
          The user has made the following suggestion for actions section:
          ${userSuggestion}
          `;
  }
  prompt += `Don't return the full monster object, just the actions array in JSON format. When the template says the creature is 'affected by a condition' choose a condition from the following list: Blinded, Charmed, Deafened, Frightened, Grappled, Incapacitated, Paralyzed, Petrified, Poisoned, Prone, Restrained, Stunned, Unconscious. Also, be sure each action has a name. Replace "Action 1" or "Action 2" with a descriptive name.`;
  return prompt;
}

export function monsterAbilitiesPrompt(monster, userSuggestion) {
  let prompt = `Here is a monster object:
  ${JSON.stringify(monster, null, 2)}`;
  prompt += `
  Here is a general structure for the monster abilities:
  abilities: [
    {
        "name": "Ability Name #1",
        "description": "Description of the ability and the mechanics."
    },
    {
        "name": "Ability Name #2",
        "description": "Description of the ability and the mechanics."
    }
]`;
  prompt += `Please return an abilities array in JSON format, don't return the full monster object. Also if the monster object provided already has abilities, please replace them with new and completely different ones that still match the flavor of the creature.
  These abilities should not be legendary actions or actions, they should be passive abilities that the creature has.`;
  return prompt;
}
