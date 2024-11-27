// useRoomDescription.js

import { ref } from 'vue';
import { generateGptResponse } from '../util/open-ai.mjs';
import {
  contentArrayToString,
  dungeonOverviewToString,
} from '../util/content-to-string.mjs';
// Import prompt, validation, and processing functions
import {
  generateEntrancePrompt,
  validateEntranceResponse,
  processEntranceResponse,
} from '../prompts/dungeon-entrance.mjs';
import {
  generateCustomRoomPrompt,
  validateCustomRoomResponse,
  processCustomRoomResponse,
} from '../prompts/custom-room.mjs';
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
  generateSecretRoomPrompt,
  validateSecretRoomResponse,
  processSecretRoomResponse,
} from '../prompts/secret-room.mjs';
import {
  generateLivingRoomPrompt,
  validateLivingRoomResponse,
  processLivingRoomResponse,
} from '../prompts/living-room.mjs';
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
import {
  generateSecretDoorPrompt,
  validateSecretDoorResponse,
  processSecretDoorResponse,
} from '../prompts/secret-door.mjs';
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

  // **Handler Functions**

  // Entrance Room Handler
  async function handleEntranceRoom({
    dungeonOverview,
    shortDescription,
    connectedRoomsInfo,
    formRoomSummary,
  }) {
    const prompt = generateEntrancePrompt(
      dungeonOverview,
      shortDescription,
      connectedRoomsInfo,
      formRoomSummary,
    );
    const response = await generateGptResponse(
      prompt,
      validateEntranceResponse,
    );
    const roomDescription = JSON.parse(response);
    const contentArray = processEntranceResponse(roomDescription);
    return { roomDescription, contentArray };
  }

  // Custom Room Handler
  async function handleCustomRoom({
    dungeonOverview,
    shortDescription,
    connectedRoomsInfo,
    formRoomName,
    formRoomSummary,
    npcString,
  }) {
    const prompt = generateCustomRoomPrompt(
      dungeonOverview,
      shortDescription,
      connectedRoomsInfo,
      formRoomName,
      formRoomSummary,
      npcString,
    );
    console.log('Prompt:', prompt);
    const customRoomResponse = await generateGptResponse(
      prompt,
      validateCustomRoomResponse,
    );
    const roomDescription = JSON.parse(customRoomResponse);
    const contentArray = processCustomRoomResponse(roomDescription);
    return { roomDescription, contentArray };
  }

  // Boss Room Handler
  async function handleBossRoom({
    dungeonOverview,
    shortDescription,
    connectedRoomsInfo,
  }) {
    const prompt = generateBossRoomPrompt(
      dungeonOverview,
      shortDescription,
      connectedRoomsInfo,
    );
    const response = await generateGptResponse(
      prompt,
      validateBossRoomResponse,
    );
    const roomDescription = JSON.parse(response);
    const contentArray = processBossRoomResponse(roomDescription);
    return { roomDescription, contentArray };
  }

  // Setback Room Handler
  async function handleSetbackRoom({
    dungeonOverview,
    shortDescription,
    connectedRoomsInfo,
  }) {
    const prompt = generateSetbackRoomPrompt(
      dungeonOverview,
      shortDescription,
      connectedRoomsInfo,
    );
    const response = await generateGptResponse(
      prompt,
      validateSetbackRoomResponse,
    );
    const roomDescription = JSON.parse(response);
    const contentArray = processSetbackRoomResponse(roomDescription);
    return { roomDescription, contentArray };
  }

  // Secret Room Handler
  async function handleSecretRoom({
    room,
    currentDungeon,
    dungeonOverview,
    shortDescription,
    connectedRoomsInfo,
  }) {
    const connectedRoomSummary =
      currentDungeon.rooms.find(
        (r) => r.id === room.doorways[0].connectedRoomId,
      ).oneSentenceSummary || '';
    const prompt = generateSecretRoomPrompt(
      dungeonOverview,
      shortDescription,
      connectedRoomsInfo,
      connectedRoomSummary,
    );
    console.log('Prompt:', prompt);
    const response = await generateGptResponse(
      prompt,
      validateSecretRoomResponse,
    );
    const roomDescription = JSON.parse(response);
    const contentArray = processSecretRoomResponse(roomDescription);
    return { roomDescription, contentArray };
  }

  // Living Room Handler
  async function handleLivingRoom({
    dungeonOverview,
    shortDescription,
    connectedRoomsInfo,
    currentDungeon,
  }) {
    const existingRooms = currentDungeon.roomNames.join(', ');
    const prompt = generateLivingRoomPrompt(
      dungeonOverview,
      shortDescription,
      existingRooms,
      connectedRoomsInfo,
    );
    console.log('Prompt:', prompt);
    const response = await generateGptResponse(
      prompt,
      validateLivingRoomResponse,
    );
    const roomDescription = JSON.parse(response);
    const contentArray = processLivingRoomResponse(roomDescription);
    return { roomDescription, contentArray };
  }

  // Connecting Room Handler
  async function handleConnectingRoom({
    dungeonOverview,
    shortDescription,
    connectedRoomsInfo,
  }) {
    const prompt = generateConnectingRoomPrompt(
      dungeonOverview,
      shortDescription,
      connectedRoomsInfo,
    );
    console.log('Prompt:', prompt);
    const response = await generateGptResponse(
      prompt,
      validateConnectingRoomResponse,
    );
    const roomDescription = JSON.parse(response);
    const contentArray = processConnectingRoomResponse(roomDescription);
    return { roomDescription, contentArray };
  }

  // Purpose Room Handler
  async function handlePurposeRoom({
    dungeonOverview,
    shortDescription,
    connectedRoomsInfo,
  }) {
    const prompt = generatePurposeRoomPrompt(
      dungeonOverview,
      shortDescription,
      connectedRoomsInfo,
    );
    console.log('Prompt:', prompt);
    const response = await generateGptResponse(
      prompt,
      validatePurposeRoomResponse,
    );
    const roomDescription = JSON.parse(response);
    const contentArray = processPurposeRoomResponse(roomDescription);
    return { roomDescription, contentArray };
  }

  // **Handler for Secret Doors**
  async function handleSecretDoor({
    room,
    currentDungeon,
    dungeonOverview,
    connectedRoomsInfo,
    contentArray,
  }) {
    const roomDescriptionString = contentArrayToString(
      contentArray.filter((item) => item.format !== 'read_aloud'),
    );

    const secretDoorway = room.doorways.find(
      (doorway) => doorway.type.toLowerCase() === 'secret',
    );

    let secretRoomSummary = '';

    if (secretDoorway && secretDoorway.connectedRoomId) {
      const secretRoom = currentDungeon.rooms.find(
        (r) => r.id === secretDoorway.connectedRoomId,
      );
      if (secretRoom && secretRoom.oneSentenceSummary) {
        secretRoomSummary = secretRoom.oneSentenceSummary;
      }
    }

    const prompt = generateSecretDoorPrompt(
      dungeonOverview,
      roomDescriptionString,
      connectedRoomsInfo,
      secretRoomSummary,
    );
    console.log('Secret Door Prompt:', prompt);
    const secretDoorResponse = await generateGptResponse(
      prompt,
      validateSecretDoorResponse,
    );
    if (validateSecretDoorResponse(secretDoorResponse)) {
      const secretDoorData = JSON.parse(secretDoorResponse);
      const secretDoorContent = processSecretDoorResponse(secretDoorData);
      contentArray.push(...secretDoorContent);
    } else {
      console.error('Secret door response validation failed.');
    }
  }

  // **Handler for Rooms That Require a Key**
  async function handleRoomRequiresKey({
    room,
    currentDungeon,
    dungeonOverview,
    connectedRoomsInfo,
    contentArray,
  }) {
    const obstaclePrompt = generateObstaclePrompt(
      dungeonOverview,
      contentArrayToString(room.contentArray || []),
      room.shortDescription,
      room.hasKeyInRoomId,
      connectedRoomsInfo,
    );
    const obstacleResponse = await generateGptResponse(
      obstaclePrompt,
      validateObstacleResponse,
    );
    const obstacleContentArray = processObstacleResponse(
      JSON.parse(obstacleResponse),
    );
    contentArray.push(...obstacleContentArray);

    const obstacleString = contentArrayToString(obstacleContentArray);
    const keyRoom = currentDungeon.rooms.find(
      (r) => r.id === room.hasKeyInRoomId,
    );
    const keyPrompt = generateKeyRoomPrompt(
      dungeonOverview,
      room.shortDescription,
      obstacleString,
      connectedRoomsInfo,
    );
    const keyRoomResponse = await generateGptResponse(
      keyPrompt,
      validateKeyRoomResponse,
    );
    const keyRoomContentArray = processKeyRoomResponse(
      JSON.parse(keyRoomResponse),
    );
    keyRoom.contentArray = keyRoomContentArray;
    keyRoom.name = JSON.parse(keyRoomResponse).name;
    keyRoom.oneSentenceSummary =
      JSON.parse(keyRoomResponse).one_sentence_summary;
  }

  // **Mapping Room Types to Handler Functions**
  const roomTypeHandlers = {
    boss: handleBossRoom,
    setback: handleSetbackRoom,
    secret: handleSecretRoom,
    living: handleLivingRoom,
    connecting: handleConnectingRoom,
    purpose: handlePurposeRoom,
    // Add other room types as needed
  };

  // **Main Function: Generate Room Description**
  async function generateRoomDescription(
    currentDungeon,
    selectedRoomId,
    formRoomName,
    formRoomSummary,
    npcData,
  ) {
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

      let roomDescription = {};
      let contentArray = [];

      // **Step 3: Generate Prompt Based on Room Type with Summaries**
      if (isEntrance) {
        ({ roomDescription, contentArray } = await handleEntranceRoom({
          dungeonOverview,
          shortDescription,
          connectedRoomsInfo,
          formRoomSummary,
        }));
      } else if (formRoomName || formRoomSummary) {
        let npcString = '';
        if (npcData && npcData.npc_string) {
          npcString = npcData.npc_string;
        }

        ({ roomDescription, contentArray } = await handleCustomRoom({
          dungeonOverview,
          shortDescription,
          connectedRoomsInfo,
          formRoomName,
          formRoomSummary,
          npcString,
        }));
      } else if (room.roomType in roomTypeHandlers) {
        const handler = roomTypeHandlers[room.roomType];
        ({ roomDescription, contentArray } = await handler({
          room,
          currentDungeon,
          dungeonOverview,
          shortDescription,
          connectedRoomsInfo,
        }));
      } else {
        console.error('Unknown room type:', room.roomType);
        return;
      }

      // **Handle Secret Doors and Key Rooms**
      const hasSecretDoor = room.doorways.some(
        (doorway) => doorway.type.toLowerCase() === 'secret',
      );

      if (hasSecretDoor && room.roomType !== 'secret' && !room.requiresKey) {
        await handleSecretDoor({
          room,
          currentDungeon,
          dungeonOverview,
          connectedRoomsInfo,
          contentArray,
        });
      }

      if (room.requiresKey) {
        await handleRoomRequiresKey({
          room,
          currentDungeon,
          dungeonOverview,
          connectedRoomsInfo,
          contentArray,
        });
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
