import { ref } from 'vue';
import { generateGptResponse } from '../util/open-ai.mjs';
import {
  contentArrayToString,
  dungeonOverviewToString,
} from '../util/content-to-string.mjs';
import {
  generateEntrancePrompt,
  validateEntranceResponse,
  processEntranceResponse,
} from '../prompts/dungeon-entrance.mjs';
import {
  generateLivingRoomPrompt,
  validateLivingRoomResponse,
  processLivingRoomResponse,
} from '../prompts/living-room.mjs';
import {
  generateObstaclePrompt,
  validateObstacleResponse,
  processObstacleResponse,
} from '../prompts/dungeon-obstacle.mjs';
import {
  generateKeyRoomPrompt,
  validateKeyRoomResponse,
  processKeyRoomResponse,
} from '../prompts/key-room.mjs';
import {
  generateBossRoomPrompt,
  validateBossRoomResponse,
  processBossRoomResponse,
} from '../prompts/boss-room.mjs';
import {
  generateSetbackRoomPrompt,
  validateSetbackRoomResponse,
  processSetbackRoomResponse,
} from '../prompts/setback-room.mjs';

export function useRoomDescription() {
  async function generateRoomDescription(currentDungeon, selectedRoomId) {
    try {
      if (!currentDungeon || selectedRoomId === null) {
        console.error('No room selected');
        return;
      }

      const room = currentDungeon.rooms.find(
        (room) => room.id === selectedRoomId,
      );

      if (!room) {
        console.error('Selected room not found');
        return;
      }

      const isEntrance = selectedRoomId === 1;
      const dungeonOverview = dungeonOverviewToString(
        currentDungeon.dungeonOverview,
      );
      const shortDescription = room.shortDescription;

      let prompt;
      let roomDescription = {};
      let contentArray = [];

      if (isEntrance) {
        prompt = generateEntrancePrompt(dungeonOverview, shortDescription);
        const response = await generateGptResponse(
          prompt,
          validateEntranceResponse,
        );
        roomDescription = JSON.parse(response);
        contentArray = processEntranceResponse(roomDescription);
      } else if (room.roomType === 'living') {
        const existingRooms = currentDungeon.roomNames.join(', ');
        prompt = generateLivingRoomPrompt(
          dungeonOverview,
          shortDescription,
          existingRooms,
        );
        const livingRoomResponse = await generateGptResponse(
          prompt,
          validateLivingRoomResponse,
        );
        roomDescription = JSON.parse(livingRoomResponse);
        contentArray = processLivingRoomResponse(roomDescription);
      } else if (room.bossRoom) {
        prompt = generateBossRoomPrompt(dungeonOverview, shortDescription);
        const bossRoomResponse = await generateGptResponse(
          prompt,
          validateBossRoomResponse,
        );
        roomDescription = JSON.parse(bossRoomResponse);
        contentArray = processBossRoomResponse(roomDescription);
      } else if (room.setbackRoom) {
        prompt = generateSetbackRoomPrompt(dungeonOverview, shortDescription);
        const setbackRoomResponse = await generateGptResponse(
          prompt,
          validateSetbackRoomResponse,
        );
        roomDescription = JSON.parse(setbackRoomResponse);
        contentArray = processSetbackRoomResponse(roomDescription);
      } else {
        prompt = generateStandardRoomPrompt(dungeonOverview, shortDescription);
        const standardRoomResponse = await generateGptResponse(
          prompt,
          validateStandardRoomResponse,
        );
        roomDescription = JSON.parse(standardRoomResponse);
        contentArray = processStandardRoomResponse(roomDescription);
      }

      if (room.requiresKey) {
        prompt = generateObstaclePrompt(
          dungeonOverview,
          contentArrayToString(room.contentArray || []),
          room.shortDescription,
          room.hasKeyInRoomId,
        );
        const obstacleResponse = await generateGptResponse(
          prompt,
          validateObstacleResponse,
        );
        const obstacleContentArray = processObstacleResponse(
          JSON.parse(obstacleResponse),
        );
        contentArray.push(...obstacleContentArray);

        const obstacleString = contentArrayToString(obstacleContentArray);
        const keyRoom = currentDungeon.rooms[room.hasKeyInRoomId - 1];
        prompt = generateKeyRoomPrompt(
          dungeonOverview,
          shortDescription,
          obstacleString,
        );
        const keyRoomResponse = await generateGptResponse(
          prompt,
          validateKeyRoomResponse,
        );
        const keyRoomContentArray = processKeyRoomResponse(
          JSON.parse(keyRoomResponse),
        );
        keyRoom.contentArray = keyRoomContentArray;
        keyRoom.name = JSON.parse(keyRoomResponse).name;
      }

      const roomNameValue = roomDescription.name || `Room ${selectedRoomId}`;
      room.name = roomNameValue;
      room.contentArray = contentArray;

      currentDungeon.roomNames =
        currentDungeon.rooms.map((room) => room.name).filter(Boolean) || [];
    } catch (error) {
      console.error('Error generating room description:', error);
    }
  }

  return {
    generateRoomDescription,
  };
}
