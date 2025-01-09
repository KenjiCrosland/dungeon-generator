// Example statblockToHTML. You can format your statblock however you wish.
function statblockToHTML(statblock) {
  let html = `<div class="statblock">`;
  html += `<h4>${statblock.name}</h4>`;
  html += `<p><strong>Type & Alignment:</strong> ${statblock.type_and_alignment}</p>`;
  html += `<p><strong>Armor Class:</strong> ${statblock.armor_class}</p>`;
  html += `<p><strong>Hit Points:</strong> ${statblock.hit_points}</p>`;
  html += `<p><strong>Speed:</strong> ${statblock.speed}</p>`;
  if (statblock.saving_throws?.trim()) {
    html += `<p><strong>Saving Throws:</strong> ${statblock.saving_throws}</p>`;
  }
  if (statblock.skills?.trim()) {
    html += `<p><strong>Skills:</strong> ${statblock.skills}</p>`;
  }
  if (statblock.damage_resistances?.trim()) {
    html += `<p><strong>Damage Resistances:</strong> ${statblock.damage_resistances}</p>`;
  }
  if (statblock.damage_immunities?.trim()) {
    html += `<p><strong>Damage Immunities:</strong> ${statblock.damage_immunities}</p>`;
  }
  html += `<hr/>`;

  // Attributes in a table, for instance:
  const attrs = statblock.attributes.split(', ');
  html += `
  <table class="attributes">
    <thead>
      <tr>
        <th>STR</th><th>DEX</th><th>CON</th><th>INT</th><th>WIS</th><th>CHA</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        ${attrs
          .map((attr) => {
            const parts = attr.split(' '); // e.g. ["STR", "10", "(+0)"]
            return `<td>${parts[1]} ${parts[2]}</td>`;
          })
          .join('')}
      </tr>
    </tbody>
  </table>
  <hr/>
  `;

  html += `<p><strong>Condition Immunities:</strong> ${statblock.condition_immunities}</p>`;
  html += `<p><strong>Senses:</strong> ${statblock.senses}</p>`;
  html += `<p><strong>Languages:</strong> ${statblock.languages}</p>`;
  html += `<p><strong>Challenge:</strong> ${statblock.challenge_rating}</p>`;
  html += `<hr/>`;

  if (statblock.abilities && statblock.abilities.length) {
    statblock.abilities.forEach((ability) => {
      html += `<p><em><strong>${ability.name}.</strong> ${ability.description}</em></p>`;
    });
  }

  if (statblock.actions && statblock.actions.length) {
    html += `<h5>Actions</h5>`;
    statblock.actions.forEach((action) => {
      html += `<p><em><strong>${action.name}.</strong> ${action.description}</em></p>`;
    });
  }

  if (statblock.legendary_actions && statblock.legendary_actions.length) {
    html += `<h5>Legendary Actions</h5>`;
    statblock.legendary_actions.forEach((legendary) => {
      html += `<p><em><strong>${legendary.name}.</strong> ${legendary.description}</em></p>`;
    });
  }

  html += `</div>`;
  return html;
}

// Helper for the detailedDescription object
function monsterDetailsToHTML(monster) {
  // Always show at least the monster’s name
  const detail = monster.detailedDescription;
  const name = detail?.name || monster.name || 'Unnamed Monster';

  let html = `<h3>${name}</h3>`;

  if (detail?.intro) {
    html += `<p>${detail.intro}</p>`;
  }
  if (detail?.appearance) {
    html += `<p>${detail.appearance}</p>`;
  }
  if (detail?.behaviorAbilities) {
    html += `<p> ${detail.behaviorAbilities}</p>`;
  }
  if (detail?.lore) {
    html += `<p>${detail.lore}</p>`;
  }
  return html;
}

// Now integrate it all into your main dungeonToHTML
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

      // If this NPC also has a statblock:
      if (npc.statblock) {
        html += statblockToHTML(npc.statblock);
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

  // Monsters
  if (dungeon.monsters && dungeon.monsters.length > 0) {
    html += addHTMLSectionTitle('Monsters');
    dungeon.monsters.forEach((monster) => {
      // If it has a detailedDescription, create that block
      if (monster.detailedDescription) {
        // Insert the custom details in order (Intro, Appearance, etc.)
        html += monsterDetailsToHTML(monster);
      } else {
        // Fallback to top-level name & description
        html += addHTMLSectionTitle(monster.name, 3);
        addSection(monster.description);
      }

      // If it has a statblock, convert to HTML
      if (monster.statblock) {
        html += statblockToHTML(monster.statblock);
      }
    });
  }

  return html;
}
