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

  //randomize the difficulty if not provided
  if (!difficulty) {
    const difficultyLevels = [
      'Tier 1: Basic - A local hero in the making.',
      'Tier 2: Expert - An established local hero.',
      'Tier 3: Champion - A regional/kingdom hero.',
      'Tier 4: Master - A hero of the world.',
      'Tier 5: Immortal - A hero of the realms.',
    ];
    difficulty =
      difficultyLevels[Math.floor(Math.random() * difficultyLevels.length)];
  }

  // We'll extract the tier number from something like "Tier 3: Champion - A regional/kingdom hero."
  function extractDifficultyTier(difficultyString) {
    if (!difficultyString) return 1; // default to Tier 1 if there's no string
    const match = difficultyString.match(/Tier\s+(\d+)/i);
    if (!match) return 1; // fallback to Tier 1
    return parseInt(match[1], 10);
  }

  // Actually get the tier number
  const tier = extractDifficultyTier(difficulty);

  // Default CR values
  let minionCR = '1/4';
  let strongMinionCR = '1';
  let largeCreatureCR = '3';

  // Switch on the numeric tier
  switch (tier) {
    case 1: // Tier 1: Basic
      minionCR = '1/4';
      strongMinionCR = '1';
      largeCreatureCR = '3';
      break;
    case 2: // Tier 2: Expert
      minionCR = '1/2';
      strongMinionCR = '2';
      largeCreatureCR = '4';
      break;
    case 3: // Tier 3: Champion
      minionCR = '2';
      strongMinionCR = '5';
      largeCreatureCR = '7';
      break;
    case 4: // Tier 4: Master
      minionCR = '5';
      strongMinionCR = '10';
      largeCreatureCR = '13';
      break;
    case 5: // Tier 5: Immortal
      minionCR = '10';
      strongMinionCR = '15';
      largeCreatureCR = '20';
      break;
    default:
      // Fallback logic
      minionCR = '1/4';
      strongMinionCR = '1';
      largeCreatureCR = '3';
      break;
  }

  return `
  ${initialSentence}. When describing events and individuals be specific about names and locations. Try to use creative and unique names and titles which borrow from more than one literary tradition and ethnicity. Each key should be a sentence or two, should be detailed and specific, and should flow together to create a cohesive description. Avoid common fantasy tropes and clichés. Temperature: 0.9

  ${place_lore ? `Additional details about the setting: ${place_lore}.` : ''}

  ${difficulty ? `The dungeon difficulty is "${difficulty}".` : ''}
  ${difficulty ? difficultyPrompts[difficulty] : ''}

  IMPORTANT:
  - We want exactly 3 monsters in the \`monsters\` array:
    1) A basic minion (type: "minion", CR ~ ${minionCR})
    2) A stronger lieutenant minion (type: "strong_minion", CR ~ ${strongMinionCR})
    3) A large creature (type: "large_creature", CR ~ ${largeCreatureCR})
  - There should be at least 3 NPCs in \`npc_list\`:
    1) The “miniboss” (but do not call it that; it is an NPC with a name and personal motivations, described in \`miniboss_description\`).
    2) The “boss” (the dominant power).
    3) At least one other named NPC.
  - If the “boss” is an intelligent named entity (like a lich, vampire lord, cunning dragon), include it in the \`npc_list\` under a unique name and note that it is the dominant power. If the boss is a truly mindless or bestial creature (like a random giant worm), include it in the \`monsters\` array.
  - The \`npc_list\` can include more than 3 NPCs, but must include at least 3.
  - The “miniboss_description” field describes the named mid-tier antagonist, which MUST be an NPC in \`npc_list\`. The large creature is a separate entity in \`monsters\`, with no overlapping name.
  - No monster in \`monsters\` shares a name with any NPC.
  - Keep the final output in valid JSON with the keys below.

  Return the description in JSON format with the following keys. Make sure the npc_list includes all npc names mentioned in the description. The NPCs in npc_list should only be individuals (not organizations or groups). If a group or faction is mentioned, come up with the name of an individual in that group. NPCs are not necessarily human; they could be intelligent monsters that have a personality and a name. Avoid banned NPC names. Keep descriptions concise and avoid run-on sentences:

  {
    name: '${place_name}',
    overview: 'A brief overview of the dungeon, with a brief description of its current state',
    relation_to_larger_setting: 'How does the dungeon relate to the larger setting? What role does it play? How is it situated geographically in relation to the larger world? Provide a name for the larger region if possible',
    finding_the_dungeon: 'How is the dungeon accessed or reached? What are the unique or dangerous geographical features or magical means? What obstacles must be overcome?',
    history: 'A very brief history of the dungeon, including its founding/creation and any most significant recent events',
    title: 'A descriptive title like: The Haunted Ruins of Blackwood. MUST include the setting name',
    dominant_power: 'What entity has dominant power here? Be creative and match it to the setting (monstrous, fae, demonic, undead, etc.). This description should flow into the next sentence about their goals',
    dominant_power_goals: 'What are the goals or motivations of this dominant entity? Protecting territory? Summoning a dark god? Something else?',
    dominant_power_minions: 'What creatures or followers serve this entity? What are their motivations? If none, how does it maintain power alone?',
    dominant_power_event: 'The most important recent event (could be ancient or recent) involving the dominant power',
    miniboss_description: 'DO NOT say “miniboss.” This is a mid-tier antagonist that might serve or oppose the dominant power. Show us their motives and how they interact with the main entity',
    recent_event_consequences: 'How has the most important recent event affected the dungeon and its inhabitants?',
    secondary_power: 'Another faction or individual who also wields influence here. Could they be allies, rivals, or neutral? Potential friends or enemies for the PCs?',
    secondary_power_event: 'A recent or ancient event involving the secondary power that changed the dungeon's dynamics',
    main_problem: 'Paint a short scene illustrating the main conflict ${place_name} faces. What happens if it's not resolved?',
    potential_solutions: '1-2 sentences on possible resolutions to the main problem. Who's championing them, and what obstacles stand in their way?',
    conclusion: 'Wrap up how things stand in ${place_name} now, and hint at the future. Tie it back to the main problem and solutions',
    difficulty_level: 'This is a ${
      difficulty ? difficulty : 'Tier 1/Tier 2/Tier 3/Tier 4/Tier 5 difficulty'
    } dungeon. Describe the difficulty and challenges in a short note',
    monsters: [
      {
        type: "minion",
        name: "Minion Name",
        description: "A brief description of the minion’s role",
        CR: "${minionCR}"
      },
      {
        type: "strong_minion",
        name: "Stronger Minion Name",
        description: "How do these differ from the regular minions?",
        CR: "${strongMinionCR}"
      },
      {
        type: "large_creature",
        name: "Large Creature Name",
        description: "Big monstrous entity separate from any NPC. Mindless or bestial if the boss is not, or used in a unique way",
        CR: "${largeCreatureCR}"
      }
    ],
    npc_list: [
      {
        name: 'NPC Name (INDIVIDUALS ONLY)',
        description: 'A short note on the NPC’s role and personality'
      }
    ]
  }`;
}

export function validateDungeonOverview(jsonString) {
  try {
    const data = JSON.parse(jsonString);
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
