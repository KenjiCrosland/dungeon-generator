export function dungeonOverviewPrompt(
  adjective,
  setting_type,
  place_name,
  place_lore,
) {
  let initialSentence = `Give me a description of the ${adjective} ${setting_type} of ${place_name}`;
  if (!place_name) {
    initialSentence = `Give me a description of an ${adjective} ${setting_type}`;
  }
  if (place_lore && !place_name) {
    initialSentence = `Give me a description of a setting`;
    setting_type = 'the setting';
  }
  return `
  ${initialSentence}. When describing events and individuals be specific about names and locations. Try to use creative and unique names and titles which borrow from more than one literary tradition and ethnicity. Each key should be a sentence or two, should be detailed and specific and should flow together to create a cohesive description. Avoid common fantasy tropes and cliches. Temperature: 0.9

  ${place_lore ? `Additional details about the setting: ${place_lore}.` : ''}
  
  Return the description in JSON format with the following keys. Make sure the npc_list includes all npc names mentioned in the description. The NPCs in npc_list should only be individuals and NOT organizations or groups. NPCs are not necessarily human. They could be monsters that have intelligence, a personality and a name.
  Don't use the following NPC names: Seraphina, Alistair, Kael, Elara, Thalia, Blackthorn, Nightshade, Lyra, Varian, Selene, Lyria, Isolde. Space is limited so please use shorter consise sentences and avoid run-on sentences:
  {
    name: '${place_name}',
    overview: 'A brief overview of the dungeon, with a brief description of its current state',
    relation_to_larger_setting: 'How does the dungeon relate to the larger setting? What role does it play in the larger setting? How is it situated geographically in relation to the larger setting? Provide a name for the larger setting if possible',
    history: 'A very brief history of the dungeon, including its founding/creation and most significant recent events',
    title: 'A descriptive title like: The Haunted Ruins of Blackwood. The title MUST include the setting name',
    dominant_power: 'What entity has dominant power over this dungeon? This entity could be monstrous, fae, demonic, undead, angelic, abyssal, a mindless but powerful beast, etc. Be creative, unique, and specific and match the entity or group to the setting',
    dominant_power_goals: 'What are the goals of the dominant entity? This could be as simple as protecting its habitat or as complex as a ritual to summon a dark god. How do these goals affect the dungeon and its inhabitants?',
    dominant_power_minions: 'What minions or followers does the dominant entity or group have? What are their goals and motivations? How do they serve the dominant entity or group and how were they recruited? If the dominant power has no minions, how do they maintain their power in this place?',
    dominant_power_event: 'describe the most important recent event involving the dominant power. This could be an ancient event or a recent event',
    recent_event_consequences: 'describe the consequences of the recent event involving the dominant power. How has this event affected the dungeon and its inhabitants?',
    secondary_power: 'The secondary entity or group that has power in the dungeon. This could be a turncoat willing to betray the dominant entity or group, a rival faction, a group of adventurers, or perhaps the original inhabitants of the dungeon. Be creative, unique, and specific and match the entity or group to the setting. Are they allies, enemies, or neutral to the dominant entity or group? Could they be potential allies or enemies to the PCs?',
    secondary_power_event: 'describe the most important recent event involving the secondary entity or group that has change the power dynamics of the dungeon. This could be an ancient event or a recent event.',
    main_problem: 'Describe a recent scene which illustrates the main problem that ${place_name} faces. How does this scene illustrate the main problem? What would happen if this problem is not resolved?',
    potential_solutions: '1-2 sentences describing potential solutions to the main problem. Who are the key players championing these solutions and what obstacles are they facing?',
    conclusion: 'A brief conclusion summarizing the current state of ${place_name} and hinting at its future. This should tie back to the main problem and potential solutions',
    npc_list: [
      {
        name: 'NPC Name',
        description: 'A brief description of the NPC's role and personality'
      }
      // Repeat the above structure for each NPC
    ]
  }`;
}
