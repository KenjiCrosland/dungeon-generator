export function dungeonToHTML(dungeon) {
  let html = '';

  function addSection(content, tag = 'p') {
    if (Array.isArray(content)) {
      content = content.filter(Boolean).join(' ');
    }
    if (content) {
      html += `<${tag}>${content}</${tag}>`;
    }
  }

  function addHTMLSectionTitle(title, level = 2) {
    return `<h${level}>${title}</h${level}>`;
  }

  // Dungeon Overview
  html += `<h1>${dungeon.dungeonOverview.name.toUpperCase()}</h1>`;
  html += `<p>${dungeon.dungeonOverview.overview} ${dungeon.dungeonOverview.relation_to_larger_setting}</p>`;

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
  addSection(dungeon.dungeonOverview.conclusion, 'div');

  // Difficulty Level
  addSection(
    `<strong>Difficulty Level:</strong> ${dungeon.dungeonOverview.difficulty_level}`,
    'p',
  );

  // NPCs
  if (dungeon.npcs && dungeon.npcs.length > 0) {
    html += addHTMLSectionTitle('NPCs');
    dungeon.npcs.forEach((npc) => {
      html += addHTMLSectionTitle(npc.name.toUpperCase(), 3);
      if (!npc.read_aloud_description) {
        addSection(npc.short_description);
      } else {
        addSection(
          `<div class="descriptive">${npc.read_aloud_description}</div>`,
          'div',
        );
        addSection(npc.description_of_position);
        addSection(npc.why_in_dungeon);
        addSection(npc.distinctive_features_or_mannerisms);
        addSection(npc.character_secret);
        if (npc.relationships) {
          html += addHTMLSectionTitle('Relationships', 4);
          Object.keys(npc.relationships).forEach((rel) => {
            addSection(
              `<strong>${rel}:</strong> ${npc.relationships[rel]}`,
              'p',
            );
          });
        }
        if (npc.roleplaying_tips) {
          html += addHTMLSectionTitle('Roleplaying Tips', 4);
          addSection(npc.roleplaying_tips, 'div');
        }
      }
    });
  }

  // Rooms
  if (dungeon.rooms && dungeon.rooms.length > 0) {
    html += addHTMLSectionTitle('Rooms');
    dungeon.rooms.forEach((room) => {
      html += addHTMLSectionTitle(
        `Room ${room.id}: ${room.name || 'Unnamed Room'}`,
        3,
      );
      if (room.contentArray) {
        room.contentArray.forEach((content) => {
          if (content.format === 'read_aloud') {
            addSection(
              `<div class="descriptive">${content.content}</div>`,
              'div',
            );
          } else if (content.format === 'header') {
            html += addHTMLSectionTitle(content.content, 4);
          } else {
            addSection(content.content);
          }
        });
      }
    });
  }

  return html;
}
