export function dungeonToPlainText(dungeon) {
  let text = '';

  function addSection(content) {
    if (Array.isArray(content)) {
      content = content.filter(Boolean).join(' ');
    }
    if (content) {
      text += `${content}\n\n`;
    }
  }

  function addDoubleDashedSectionTitle(title) {
    const dashes = '-'.repeat(title.length);
    return `${dashes}------\n|  ${title}  |\n------${dashes}`;
  }

  function addDashedSectionTitle(title) {
    const dashes = '-'.repeat(title.length);
    return `${dashes}\n${title}\n${dashes}`;
  }

  function addSingleDashedSectionTitle(title) {
    const dashes = '-'.repeat(title.length);
    return `${title}\n${dashes}`;
  }

  // Dungeon Overview
  text += `${addDoubleDashedSectionTitle(
    dungeon.dungeonOverview.name.toUpperCase(),
  )}\n`;
  text += `${dungeon.dungeonOverview.overview} ${dungeon.dungeonOverview.relation_to_larger_setting}\n\n`;

  addSection(dungeon.dungeonOverview.finding_the_dungeon);
  addSection(dungeon.dungeonOverview.history);
  addSection([
    dungeon.dungeonOverview.dominant_power,
    dungeon.dungeonOverview.dominant_power_goals,
  ]);
  addSection([
    dungeon.dungeonOverview.dominant_power_minions,
    dungeon.dungeonOverview.dominant_power_event,
  ]);
  addSection(dungeon.dungeonOverview.recent_event_consequences);
  addSection(dungeon.dungeonOverview.secondary_power);
  addSection(dungeon.dungeonOverview.secondary_power_event);
  addSection([
    dungeon.dungeonOverview.main_problem,
    dungeon.dungeonOverview.potential_solutions,
  ]);
  addSection(dungeon.dungeonOverview.conclusion);

  // Difficulty Level
  addSection(`Difficulty Level: ${dungeon.dungeonOverview.difficulty_level}`);

  // NPCs
  if (dungeon.npcs && dungeon.npcs.length > 0) {
    text += `${addDashedSectionTitle('NPCs')}\n`;
    dungeon.npcs.forEach((npc) => {
      text += `${addSingleDashedSectionTitle(npc.name.toUpperCase())}\n`;
      if (!npc.read_aloud_description) {
        addSection(npc.short_description);
      } else {
        addSection(npc.read_aloud_description);
        addSection(npc.description_of_position);
        addSection(npc.why_in_dungeon);
        addSection(npc.distinctive_features_or_mannerisms);
        addSection(npc.character_secret);
        if (npc.relationships) {
          text += `Relationships\n`;
          Object.keys(npc.relationships).forEach((rel) => {
            addSection(`${rel}: ${npc.relationships[rel]}`);
          });
        }
        if (npc.roleplaying_tips) {
          text += `Roleplaying Tips\n`;
          addSection(npc.roleplaying_tips);
        }
      }
    });
  }

  // Rooms
  if (dungeon.rooms && dungeon.rooms.length > 0) {
    text += `${addDashedSectionTitle('Rooms')}\n`;
    dungeon.rooms.forEach((room) => {
      text += `${addSingleDashedSectionTitle(
        `Room ${room.id}: ${room.name || 'Unnamed Room'}`,
      )}\n`;
      if (room.contentArray) {
        room.contentArray.forEach((content) => {
          if (content.format === 'read_aloud') {
            addSection(content.content);
          } else if (content.format === 'header') {
            text += `${addSingleDashedSectionTitle(content.content)}\n`;
          } else {
            addSection(content.content);
          }
        });
      }
    });
  }

  return text;
}
