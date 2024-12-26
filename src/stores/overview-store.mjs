import { computed } from 'vue';
import adjectives from '../data/adjectives.json';
import potentialNames from '../data/dungeon-names.json';
import { generateGptResponse } from '../util/open-ai.mjs';
import {
  dungeonOverviewPrompt,
  validateDungeonOverview,
} from '../prompts/dungeon-overview.mjs';
import {
  dungeons,
  currentDungeonId,
  loadingOverview,
  activeTabIndex,
  overviewForm,
  currentDungeon,
} from './dungeon-state.mjs';
import { saveDungeons } from './dungeon-utils.mjs';

export const currentDungeonOverviewString = computed(() => {
  if (currentDungeon.value && currentDungeon.value.dungeonOverview) {
    return `${currentDungeon.value.dungeonOverview.overview}

${currentDungeon.value.dungeonOverview.relation_to_larger_setting} ${currentDungeon.value.dungeonOverview.finding_the_dungeon}
    
${currentDungeon.value.dungeonOverview.history}
    
${currentDungeon.value.dungeonOverview.dominant_power} ${currentDungeon.value.dungeonOverview.dominant_power_goals} ${currentDungeon.value.dungeonOverview.dominant_power_minions}
    
${currentDungeon.value.dungeonOverview.miniboss_description}
    
${currentDungeon.value.dungeonOverview.dominant_power_event} ${currentDungeon.value.dungeonOverview.recent_event_consequences}

${currentDungeon.value.dungeonOverview.secondary_power} ${currentDungeon.value.dungeonOverview.secondary_power_event}
    
${currentDungeon.value.dungeonOverview.main_problem} ${currentDungeon.value.dungeonOverview.potential_solutions}
    
${currentDungeon.value.dungeonOverview.conclusion}`;
  }
  return '';
});

export async function generateDungeonOverview() {
  try {
    loadingOverview.value = true;
    activeTabIndex.value = 0;

    const potentialSettingTypes = [
      'temple',
      'outpost',
      'catacombs',
      'hideout',
      'caves',
      'crypt',
      'lair',
      'stronghold',
      'mines',
      'tower',
      'lab',
      'ruins',
      'underwater temple',
      'fort',
      'sewer',
      'grove',
      'castle',
      'undercity',
      'tomb',
      'sanctuary',
      'prison',
      'monastery',
      'shrine',
      'ziggurat',
    ];

    let settingType =
      overviewForm.value.setting_type.toLowerCase() ||
      potentialSettingTypes[
        Math.floor(Math.random() * potentialSettingTypes.length)
      ];

    let adjective = '';
    // Check if overviewForm.value.adjective is provided
    if (overviewForm.value.adjective) {
      // If user provided a custom adjective, just use it
      adjective = overviewForm.value.adjective;
    } else {
      // No custom adjective, pick from adjectives for settingType or fallback to generic
      if (adjectives[settingType] && adjectives[settingType].length > 0) {
        adjective =
          adjectives[settingType][
            Math.floor(Math.random() * adjectives[settingType].length)
          ];
      } else {
        // If no adjectives for this settingType, fallback to generic
        adjective =
          adjectives['generic'][
            Math.floor(Math.random() * adjectives['generic'].length)
          ];
      }
    }

    let placeName = '';
    if (potentialNames[settingType] || overviewForm.value.place_name) {
      placeName =
        overviewForm.value.place_name.toLowerCase() ||
        potentialNames[settingType][
          Math.floor(Math.random() * potentialNames[settingType].length)
        ];
    } else {
      placeName =
        potentialNames['generic'][
          Math.floor(Math.random() * potentialNames['generic'].length)
        ];
    }

    const prompt = dungeonOverviewPrompt(
      adjective,
      settingType,
      placeName,
      overviewForm.value.place_lore,
      overviewForm.value.difficulty,
    );
    const response = await generateGptResponse(prompt, validateDungeonOverview);
    const overview = JSON.parse(response);

    const newDungeon = {
      id: Date.now(),
      dungeonOverview: overview,
      rooms: null,
      roomDescriptions: null,
      roomNames: [],
      npcs: [],
      statblocks: [],
    };

    if (overview.monsters && Array.isArray(overview.monsters)) {
      overview.monsters.forEach((monster, index) => {
        monster.id = `${newDungeon.id}-monster-${Date.now()}-${index}`;
      });
    }

    if (overview.npc_list) {
      newDungeon.npcs = overview.npc_list.map((npc) => ({
        name: npc.name,
        short_description: npc.description,
        opened: false,
      }));
    }

    dungeons.value.push(newDungeon);
    currentDungeonId.value = newDungeon.id;

    // Reset form
    overviewForm.value.adjective = '';
    overviewForm.value.setting_type = '';
    overviewForm.value.place_name = '';
    overviewForm.value.place_lore = '';
    overviewForm.value.difficulty = '';

    loadingOverview.value = false;
    saveDungeons();
  } catch (error) {
    loadingOverview.value = false;
    console.error('Error generating dungeon overview:', error);
  }
}
