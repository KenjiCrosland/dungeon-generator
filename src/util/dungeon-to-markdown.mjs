export function dungeonToMarkdown(dungeon) {
  let text = '';

  function addSection(content, spacing = 1) {
    if (Array.isArray(content)) {
      content = content.filter(Boolean).join(' ');
    }
    if (content) {
      text += content + `\n${':'.repeat(spacing)}\n\n`;
    }
  }

  function addMarkdownSectionTitle(title, level = 2) {
    return `${'#'.repeat(level)} ${title}`;
  }

  // Dungeon Overview
  text += `# ${dungeon.dungeonOverview.name.toUpperCase()}\n\n`;
  text += `${dungeon.dungeonOverview.overview} ${dungeon.dungeonOverview.relation_to_larger_setting}\n:\n\n`;

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
  addSection(dungeon.dungeonOverview.conclusion, 2);

  // Difficulty Level
  addSection(
    `**Difficulty Level:** ${dungeon.dungeonOverview.difficulty_level}`,
  );

  // NPCs
  if (dungeon.npcs && dungeon.npcs.length > 0) {
    addSection(addMarkdownSectionTitle('NPCs'));
    dungeon.npcs.forEach((npc) => {
      addSection(addMarkdownSectionTitle(npc.name.toUpperCase(), 3));
      if (!npc.read_aloud_description) {
        addSection(npc.short_description);
      } else {
        addSection(`{{descriptive\n ${npc.read_aloud_description} \n}}`);
        addSection(npc.description_of_position);
        addSection(npc.why_in_dungeon);
        addSection(npc.distinctive_features_or_mannerisms);
        addSection(npc.character_secret);
        if (npc.relationships) {
          addSection(addMarkdownSectionTitle('Relationships', 4));
          Object.keys(npc.relationships).forEach((rel) => {
            addSection(`**${rel}:** ${npc.relationships[rel]}`);
          });
        }
        if (npc.roleplaying_tips) {
          addSection(addMarkdownSectionTitle('Roleplaying Tips', 4));
          addSection(npc.roleplaying_tips, 2);
        }
      }
    });
  }

  // Rooms
  if (dungeon.rooms && dungeon.rooms.length > 0) {
    addSection(addMarkdownSectionTitle('Rooms'));
    dungeon.rooms.forEach((room) => {
      addSection(
        addMarkdownSectionTitle(
          `Room ${room.id}: ${room.name || 'Unnamed Room'}`,
          3,
        ),
      );
      if (room.contentArray) {
        room.contentArray.forEach((content) => {
          if (content.format === 'read_aloud') {
            addSection(`{{descriptive\n ${content.content} \n}}`);
          } else if (content.format === 'header') {
            addSection(addMarkdownSectionTitle(content.content, 4));
          } else {
            addSection(content.content);
          }
        });
      }
    });
  }

  return text;
}
