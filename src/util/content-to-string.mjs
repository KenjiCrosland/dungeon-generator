// src/util/contentArrayToString.mjs

export function contentArrayToString(contentArray) {
  // Initialize an array to hold the processed strings
  const result = [];

  // Iterate over each item in the contentArray
  contentArray.forEach((item) => {
    switch (item.format) {
      case 'read_aloud':
        // For read_aloud, we might want to enclose the text in quotation marks or italics
        result.push(`"${item.content}"\n`);
        break;
      case 'header':
        // For headers, we can make them uppercase and add line breaks for emphasis
        result.push(`\n${item.content.toUpperCase()}\n`);
        break;
      case 'paragraph':
        // For paragraphs, include the content as is
        result.push(`${item.content}\n`);
        break;
      default:
        // For any other formats, include the content without special formatting
        result.push(`${item.content}\n`);
        break;
    }
  });

  // Join the array into a single string
  return result.join('\n');
}

// src/util/dungeonOverviewToString.js

export function dungeonOverviewToString(dungeonOverview) {
  // Initialize an array to hold the formatted strings
  const result = [];

  // Add the title as a header
  if (dungeonOverview.title) {
    result.push(`${dungeonOverview.title} `);
  }

  // Add the overview
  if (dungeonOverview.overview) {
    result.push(`${dungeonOverview.overview} `);
  }

  // Combine relation_to_larger_setting and finding_the_dungeon
  const settingAndFinding = [
    dungeonOverview.relation_to_larger_setting,
    dungeonOverview.finding_the_dungeon,
  ]
    .filter(Boolean)
    .join(' '); // Combine with a space

  if (settingAndFinding) {
    result.push(`${settingAndFinding} `);
  }

  // Add history
  if (dungeonOverview.history) {
    result.push(`${dungeonOverview.history}\n`);
  }

  // Combine dominant_power, dominant_power_goals, and dominant_power_minions
  const dominantPowerDetails = [
    dungeonOverview.dominant_power,
    dungeonOverview.dominant_power_goals,
    dungeonOverview.dominant_power_minions,
  ]
    .filter(Boolean)
    .join(' ');

  if (dominantPowerDetails) {
    result.push(`${dominantPowerDetails}\n`);
  }

  // Combine dominant_power_event and recent_event_consequences
  const dominantPowerEvents = [
    dungeonOverview.dominant_power_event,
    dungeonOverview.recent_event_consequences,
  ]
    .filter(Boolean)
    .join(' ');

  if (dominantPowerEvents) {
    result.push(`${dominantPowerEvents}\n`);
  }

  // Combine secondary_power and secondary_power_event
  const secondaryPowerDetails = [
    dungeonOverview.secondary_power,
    dungeonOverview.secondary_power_event,
  ]
    .filter(Boolean)
    .join(' ');

  if (secondaryPowerDetails) {
    result.push(`${secondaryPowerDetails}\n`);
  }

  // Combine main_problem and potential_solutions
  const problemAndSolutions = [
    dungeonOverview.main_problem,
    dungeonOverview.potential_solutions,
  ]
    .filter(Boolean)
    .join(' ');

  if (problemAndSolutions) {
    result.push(`${problemAndSolutions}\n`);
  }

  // Add conclusion
  if (dungeonOverview.conclusion) {
    result.push(`${dungeonOverview.conclusion}\n`);
  }

  // Join the array into a single string
  return result.join('\n');
}
