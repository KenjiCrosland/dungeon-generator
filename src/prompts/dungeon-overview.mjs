export function dungeonOverviewPrompt(
  adjective,
  setting_type,
  place_name,
  place_lore,
  difficulty,
) {
  let initialSentence = `Give me a description of the ${adjective} ${setting_type} of ${place_name}`;
  if (!place_name) {
    initialSentence = `Give me a description of an ${adjective} ${setting_type}`;
  }
  if (place_lore && !place_name) {
    initialSentence = `Give me a description of a setting`;
    setting_type = 'the setting';
  }

  // Define CR scaling based on difficulty tier
  let minionCR = '1/4';
  let strongMinionCR = '1';
  let largeCreatureCR = '3';

  switch (difficulty) {
    case 'Tier 1: Basic - A local hero in the making.':
      minionCR = '1/4';
      strongMinionCR = '1';
      largeCreatureCR = '3';
      break;
    case 'Tier 2: Expert - An established local hero.':
      minionCR = '1/2';
      strongMinionCR = '2';
      largeCreatureCR = '4';
      break;
    case 'Tier 3: Champion - A regional/kingdom hero.':
      minionCR = '2';
      strongMinionCR = '5';
      largeCreatureCR = '7';
      break;
    case 'Tier 4: Master - A hero of the world.':
      minionCR = '5';
      strongMinionCR = '10';
      largeCreatureCR = '13';
      break;
    case 'Tier 5: Immortal - A hero of the realms.':
      minionCR = '10';
      strongMinionCR = '15';
      largeCreatureCR = '20';
      break;
    default:
      // Default values if difficulty is not provided or recognized
      minionCR = '1/4';
      strongMinionCR = '1';
      largeCreatureCR = '3';
      break;
  }

  return `
  ${initialSentence}. When describing events and individuals be specific about names and locations. Try to use creative and unique names and titles which borrow from more than one literary tradition and ethnicity. Each key should be a sentence or two, should be detailed and specific and should flow together to create a cohesive description. Avoid common fantasy tropes and cliches. Temperature: 0.9

  ${place_lore ? `Additional details about the setting: ${place_lore}.` : ''}

  ${difficulty ? `The dungeon difficulty is "${difficulty}".` : ''}
  ${difficulty ? difficultyPrompts[difficulty] : ''}

  The dungeon should have three types of monsters:
  1. **Minions**: These are low-level creatures that serve as the basic underlings for the dominant power. CR ~ ${minionCR}. Describe what they are and how they serve the dominant entity. If you wish, include details about their boons or special weapons.
  2. **Lieutenant**: A more powerful creature aligned (or once aligned) with the dominant power. This creature should be of the same general type as the minions, but stronger or more capable. CR ~ ${strongMinionCR}.
  3. **Miniboss**: A significant foe who may or may not be directly loyal to the dominant power, possibly seeking their own agenda. CR ~ ${largeCreatureCR}. After describing the minions, add a paragraph (miniboss paragraph) describing this creature’s role and how it differs from the minions and lieutenant. This miniboss should have some unique twist, such as a wizard who hopes to bargain with the dominant entity rather than serving it directly.

  Return the description in JSON format with the following keys. Make sure the npc_list includes all npc names mentioned in the description. The NPCs in npc_list should only be individuals and NOT organizations or groups. If a group or faction is mentioned, come up with the name of an individual within that group. NPCs are not necessarily human. They could be monsters that have intelligence, a personality and a name. Avoid the banned NPC names. Keep descriptions concise, avoid run-on sentences:
  {
    name: '${place_name}',
    overview: 'A brief overview of the dungeon, with a brief description of its current state',
    relation_to_larger_setting: 'How does the dungeon relate to the larger setting? What role does it play in the larger setting? How is it situated geographically in relation to the larger setting? Provide a name for the larger setting if possible',
    finding_the_dungeon: 'How is the dungeon accessed? Is it deep inside dangerous geographical features, hidden in plain sight, or accessible only through a portal or ritual? What are the dangers and obstacles that must be overcome to reach the dungeon?',
    history: 'A very brief history of the dungeon, including its founding/creation and most significant recent events',
    title: 'A descriptive title like: The Haunted Ruins of Blackwood. The title MUST include the setting name',
    dominant_power: 'What entity has dominant power over this dungeon? This entity could be monstrous, fae, demonic, undead, angelic, abyssal, a mindless but powerful beast, etc. Be creative, unique, and specific and match the entity or group to the setting',
    dominant_power_goals: 'What are the goals of the dominant entity? This could be as simple as protecting its habitat or as complex as a ritual to summon a dark god. How do these goals affect the dungeon and its inhabitants?',
    dominant_power_minions: 'What minions or followers does the dominant entity or group have? What are their goals and motivations? How do they serve the dominant entity or group and how were they recruited? If the dominant power has no minions, how do they maintain their power in this place?',
    dominant_power_event: 'describe the most important recent event involving the dominant power. This could be an ancient event or a recent event',
    miniboss_description: 'DON'T SAY THE WORD MINIBOSS, SHOW DON'T TELL. The miniboss could be aligned with the dominant power or seeking their own agenda. Describe the miniboss and their role in the dungeon. They are most likely antagonistic to the PCs, however. They should either be an ally to the dominant power or are neutral. If they are allied how did they come to be so? If they are neutral, what is their agenda and how do they interact with the dominant power?',
    recent_event_consequences: 'describe the consequences of the recent event involving the dominant power. How has this event affected the dungeon and its inhabitants?',
    secondary_power: 'The secondary entity or group that has power in the dungeon. This could be a turncoat willing to betray the dominant entity or group, a rival faction, a group of adventurers, or perhaps the original inhabitants of the dungeon. Be creative, unique, and specific and match the entity or group to the setting. Are they allies, enemies, or neutral to the dominant entity or group? Could they be potential allies or enemies to the PCs?',
    secondary_power_event: 'describe the most important recent event involving the secondary entity or group that has change the power dynamics of the dungeon. This could be an ancient event or a recent event.',
    main_problem: 'Describe a recent scene which illustrates the main problem that ${place_name} faces. How does this scene illustrate the main problem? What would happen if this problem is not resolved?',
    potential_solutions: '1-2 sentences describing potential solutions to the main problem. Who are the key players championing these solutions and what obstacles are they facing?',
    conclusion: 'A brief conclusion summarizing the current state of ${place_name} and hinting at its future. This should tie back to the main problem and potential solutions',
    difficulty_level: 'This is a ${
      difficulty ? difficulty : 'Tier 1/Tier 2/Tier 3/Tier 4/ Tier 5 difficulty'
    } dungeon. Describe the difficulty level and challenges.',
    monsters: [
      {
        type: "minion",
        name: "Minion Name",
        description: "A brief description of the minions and their role",
        CR: "${minionCR}"
      },
      {
        type: "strong_minion",
        name: "Strong Minion Name",
        description: "A brief description of the strong minions and how they differ from the regular minions",
        CR: "${strongMinionCR}"
      },
      {
        type: "large_creature",
        name: "Large Creature Name",
        description: "A brief description of the large creature and how it differs from the minions and lieutenant. This is not the miniboss.",
        CR: "${largeCreatureCR}"
      }
    ],
    npc_list: [
      {
        name: 'NPC Name (INDIVIDUALS ONLY)',
        description: 'A brief description of the NPC's role and personality'
      }
    ]
  }`;
}

export function validateDungeonOverview(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    // Check for required keys
    const requiredKeys = [
      'name',
      'overview',
      'relation_to_larger_setting',
      'finding_the_dungeon',
      'history',
      'title',
      'dominant_power',
      'dominant_power_goals',
      'dominant_power_minions',
      'dominant_power_event',
      'miniboss_description',
      'recent_event_consequences',
      'secondary_power',
      'secondary_power_event',
      'main_problem',
      'potential_solutions',
      'conclusion',
      'difficulty_level',
      'npc_list',
      'monsters',
    ];

    for (const key of requiredKeys) {
      if (!(key in data)) {
        return false;
      }
    }

    return true;
  } catch (e) {
    return false;
  }
}

const difficultyPrompts = {
  'Tier 1: Basic - A local hero in the making.':
    'These dungeons are bandit hideouts, goblin caves, kobold strongholds, lairs of wyrmlings, and other challenges suitable for beginning adventurers. The consequences of success or failure are local in scope, affecting a village, town, or small region. Obstacles are simple traps or low level enchantments, and the rewards are modest.',
  'Tier 2: Expert - An established local hero.':
    'These dungeons are the lairs of young dragons, the hideouts of powerful bandit lords, the ruins of ancient temples, and other challenges suitable for experienced adventurers. The consequences of success or failure are regional in scope, affecting a city, kingdom, or large region. Obstacles are complex traps, powerful enchantments, and dangerous monsters, and the rewards are substantial.',
  'Tier 3: Champion - A regional/kingdom hero.':
    'These dungeons are the strongholds of adult dragons, the sanctuaries of powerful liches, the ruins of lost civilizations, and other challenges suitable for legendary adventurers. The consequences of success or failure are continental in scope, affecting multiple kingdoms, continents, or the entire world. Obstacles are deadly traps, ancient curses, and world-threatening monsters, and the rewards are legendary.',
  'Tier 4: Master - A hero of the world.':
    'These dungeons are the domains of ancient dragons, the citadels of demon lords, the vaults of forgotten gods, and other challenges suitable for epic adventurers. The consequences of success or failure are cosmic in scope, affecting the planes of existence, the fabric of reality, or the balance of power between gods. Obstacles are reality-warping traps, world-ending enchantments, and universe-threatening monsters, and the rewards are divine.',
  'Tier 5: Immortal - A hero of the realms.':
    'These dungeons are the realms of elder dragons, the domains of archdevils, the prisons of elder gods, and other challenges suitable for immortal adventurers. The consequences of success or failure are multiversal in scope, affecting the multiverse, the afterlife, or the very nature of existence. Obstacles are beyond mortal comprehension, and the rewards are beyond mortal imagination.',
};
