// useRoomDescription.js

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
import {
  generateConnectingRoomPrompt,
  validateConnectingRoomResponse,
  processConnectingRoomResponse,
} from '../prompts/connecting-room.mjs';
import {
  generatePurposeRoomPrompt,
  validatePurposeRoomResponse,
  processPurposeRoomResponse,
} from '../prompts/purpose-room.mjs';

export function useRoomDescription() {
  // **Helper Function: Aggregate Connected Rooms' Summaries**
  function getConnectedRoomsSummaries(currentDungeon, room) {
    if (!room.doorways || room.doorways.length === 0) return [];

    const summaries = room.doorways.map((doorway) => {
      const connectedRoom = currentDungeon.rooms.find(
        (r) => r.id === doorway.connectedRoomId,
      );
      if (connectedRoom) {
        return {
          name: connectedRoom.name || `Room ${connectedRoom.id}`,
          summary: connectedRoom.oneSentenceSummary || '',
          connectionType: doorway.type, // e.g., door, corridor, locked-door
          direction: doorway.side, // e.g., north, south
        };
      } else {
        return {
          name: `Room ${doorway.connectedRoomId}`,
          summary: '',
          connectionType: doorway.type,
          direction: doorway.side,
        };
      }
    });

    // **Filter Out Rooms Without Summaries**
    return summaries.filter((room) => room.summary);
  }

  // **Main Function: Generate Room Description**
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

      // **Step 1: Get Connected Rooms' Summaries**
      const connectedRoomsSummaries = getConnectedRoomsSummaries(
        currentDungeon,
        room,
      );

      // **Step 2: Format the Summaries as a String**
      const connectedRoomsInfo = connectedRoomsSummaries
        .map(
          (cr) =>
            `"${cr.name}", "${cr.summary}" connected by a ${cr.connectionType} leading ${cr.direction}`,
        )
        .join(', ');

      let prompt;
      let roomDescription = {};
      let contentArray = [];

      // **Step 3: Generate Prompt Based on Room Type with Summaries**
      if (isEntrance) {
        prompt = generateEntrancePrompt(
          dungeonOverview,
          shortDescription,
          connectedRoomsInfo,
        );
        const response = await generateGptResponse(
          prompt,
          validateEntranceResponse,
        );
        roomDescription = JSON.parse(response);
        contentArray = processEntranceResponse(roomDescription);
      } else if (room.roomType === 'boss') {
        prompt = generateBossRoomPrompt(
          dungeonOverview,
          shortDescription,
          connectedRoomsInfo,
        );
        const bossRoomResponse = await generateGptResponse(
          prompt,
          validateBossRoomResponse,
        );
        roomDescription = JSON.parse(bossRoomResponse);
        contentArray = processBossRoomResponse(roomDescription);
      } else if (room.roomType === 'setback') {
        prompt = generateSetbackRoomPrompt(
          dungeonOverview,
          shortDescription,
          connectedRoomsInfo,
        );
        const setbackRoomResponse = await generateGptResponse(
          prompt,
          validateSetbackRoomResponse,
        );
        roomDescription = JSON.parse(setbackRoomResponse);
        contentArray = processSetbackRoomResponse(roomDescription);
      } else if (room.roomType === 'living') {
        const existingRooms = currentDungeon.roomNames.join(', ');
        prompt = generateLivingRoomPrompt(
          dungeonOverview,
          shortDescription,
          existingRooms,
          connectedRoomsInfo,
        );
        console.log('Prompt:', prompt);
        const livingRoomResponse = await generateGptResponse(
          prompt,
          validateLivingRoomResponse,
        );
        roomDescription = JSON.parse(livingRoomResponse);
        contentArray = processLivingRoomResponse(roomDescription);
      } else if (room.roomType === 'connecting') {
        prompt = generateConnectingRoomPrompt(
          dungeonOverview,
          shortDescription,
          connectedRoomsInfo,
        );
        console.log('Prompt:', prompt);
        const connectingRoomResponse = await generateGptResponse(
          prompt,
          validateConnectingRoomResponse,
        );
        roomDescription = JSON.parse(connectingRoomResponse);
        contentArray = processConnectingRoomResponse(roomDescription);
      } else if (room.roomType === 'purpose') {
        console.log('Prompt:', prompt);
        prompt = generatePurposeRoomPrompt(
          dungeonOverview,
          shortDescription,
          connectedRoomsInfo,
        );
        const purposeRoomResponse = await generateGptResponse(
          prompt,
          validatePurposeRoomResponse,
        );
        roomDescription = JSON.parse(purposeRoomResponse);
        contentArray = processPurposeRoomResponse(roomDescription);
      }

      // **Handle Rooms That Require a Key**
      if (room.requiresKey) {
        prompt = generateObstaclePrompt(
          dungeonOverview,
          contentArrayToString(room.contentArray || []),
          room.shortDescription,
          room.hasKeyInRoomId,
          connectedRoomsInfo,
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
          connectedRoomsInfo,
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

      // **Update Room Details**
      room.oneSentenceSummary = roomDescription.one_sentence_summary || '';
      room.name = roomDescription.name || `Room ${selectedRoomId}`;
      room.contentArray = contentArray;

      // **Update Dungeon's Room Names**
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
