import { statblockToMarkdown } from '@/util/statblock-to-markdown.mjs';

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

      // Check if NPC has a statblock, then add it at the bottom
      if (npc.statblock) {
        text += addMarkdownSectionTitle(`${npc.name} Statblock`, 4) + '\n';
        // Replace 'two_columns' with 'one_column' or something else if you want
        text += statblockToMarkdown(npc.statblock, 'two_columns') + '\n\n';
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

  // Monsters & Statblocks
  if (dungeon.monsters && dungeon.monsters.length > 0) {
    addSection(addMarkdownSectionTitle('Monsters'));
    dungeon.monsters.forEach((monster) => {
      // If it has a detailedDescription, we rely mostly on monsterToMarkdown
      if (monster.detailedDescription) {
        text += monsterToMarkdown(monster);
      } else {
        // fallback if no detailedDescription
        addSection(addMarkdownSectionTitle(monster.name, 3));
        addSection(monster.description);

        if (monster.statblock) {
          text +=
            statblockToMarkdown(monster.statblock, 'two_columns') + '\n\n';
        }
      }
    });
  }

  return text;
}
function monsterDetailsToMarkdown(monster) {
  // Fallback name from monster.name if detailedDescription is missing a name
  const theName =
    monster.detailedDescription?.name || monster.name || 'Unnamed Monster';
  let markdown = `### ${theName}\n\n`;

  if (monster.detailedDescription?.intro) {
    markdown += `\n${monster.detailedDescription.intro}\n:\n\n`;
  }
  if (monster.detailedDescription?.appearance) {
    markdown += `\n${monster.detailedDescription.appearance}\n:\n\n`;
  }
  if (monster.detailedDescription?.behaviorAbilities) {
    markdown += `\n${monster.detailedDescription.behaviorAbilities}\n:\n\n`;
  }
  if (monster.detailedDescription?.lore) {
    markdown += `\n${monster.detailedDescription.lore}\n:\n\n`;
  }

  if (monster.description && !monster.detailedDescription) {
    markdown += `**Description**:\n${monster.description}\n:\n\n`;
  }

  return markdown;
}

function monsterToMarkdown(monster) {
  // First do the "detailedDescription" block
  let md = monsterDetailsToMarkdown(monster);

  // Now do the statblock, if it exists
  if (monster.statblock) {
    // Use your existing function and pick 'two_columns' or 'one_column'
    md += statblockToMarkdown(monster.statblock, 'two_columns') + '\n\n';
  }

  return md;
}
