import { detectIncognito } from 'detectincognitojs';

export async function canGenerateStatblock(isPremium) {
  if (isPremium) {
    return true;
  }
  const incognitoResult = await detectIncognito();

  if (incognitoResult.isPrivate) {
    alert(
      "The free statblock generator is not available in incognito or private mode as we can't keep track of the number of statblocks generated. Please disable incognito mode to use the generator or you can access unlimited statblock generation as a $5 patron.",
    );
    return false;
  }
  const MAX_GENERATIONS = 5;
  const storage = window.localStorage;
  const monsters = JSON.parse(storage.getItem('monsters')) || {
    generationCount: '0',
    firstGenerationTime: null,
  };

  let generationCount = parseInt(monsters.generationCount) || 0;
  let firstGenerationTime = parseInt(monsters.firstGenerationTime);
  const currentTime = new Date().getTime();

  if (generationCount >= MAX_GENERATIONS) {
    if (!firstGenerationTime || currentTime - firstGenerationTime >= 86400000) {
      // 24 hours in milliseconds
      // Reset the count and set the new day's first generation time
      monsters.generationCount = '1';
      monsters.firstGenerationTime = currentTime.toString();
    } else {
      const resetTime = new Date(firstGenerationTime + 86400000);
      const alertMessage = `You have reached the 5 statblock generation limit for a 24-hour period. Please come back at ${resetTime.toLocaleString()} or you can access unlimited statblock generation as a $5 patron.`;
      alert(alertMessage);
      return false;
    }
  } else {
    // Increment the count
    monsters.generationCount = (generationCount + 1).toString();
    if (generationCount === 0) {
      monsters.firstGenerationTime = currentTime.toString(); // Set the first generation time if this is the first count
    }
  }

  storage.setItem('monsters', JSON.stringify(monsters)); // Save the updated object to local storage
  return true;
}
