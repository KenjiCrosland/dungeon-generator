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
  generateLockedRoomPrompt,
  validateLockedRoomResponse,
  processLockedRoomResponse,
} from '../prompts/locked-room.mjs';
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
    formRoomName = '',
    formRoomSummary = '',
    npcString = '',
  }) {
    const prompt = generateEntrancePrompt(
      dungeonOverview,
      shortDescription,
      connectedRoomsInfo,
      formRoomName,
      formRoomSummary,
      npcString,
    );
    console.log('Prompt:', prompt);
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
    room,
    currentDungeon,
    dungeonOverview,
    shortDescription,
    connectedRoomsInfo,
    formRoomName = '',
    formRoomSummary = '',
    npcString = '',
  }) {
    const roomName = formRoomName || room.name || '';
    const roomSummary = formRoomSummary || room.oneSentenceSummary || '';

    const prompt = generateBossRoomPrompt(
      dungeonOverview,
      shortDescription,
      connectedRoomsInfo,
      roomName,
      roomSummary,
      npcString,
    );
    console.log('Prompt:', prompt);
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
    room,
    currentDungeon,
    dungeonOverview,
    shortDescription,
    connectedRoomsInfo,
    formRoomName = '',
    formRoomSummary = '',
    npcString = '',
  }) {
    const roomName = formRoomName || room.name || '';
    const roomSummary = formRoomSummary || room.oneSentenceSummary || '';

    const prompt = generateSetbackRoomPrompt(
      dungeonOverview,
      shortDescription,
      connectedRoomsInfo,
      roomName,
      roomSummary,
      npcString,
    );
    console.log('Prompt:', prompt);
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
    formRoomName = '',
    formRoomSummary = '',
    npcString = '',
  }) {
    const roomName = formRoomName || room.name || '';
    const roomSummary = formRoomSummary || room.oneSentenceSummary || '';

    const connectedRoomSummary =
      currentDungeon.rooms.find(
        (r) => r.id === room.doorways[0].connectedRoomId,
      ).oneSentenceSummary || '';
    const prompt = generateSecretRoomPrompt(
      dungeonOverview,
      shortDescription,
      connectedRoomsInfo,
      connectedRoomSummary,
      roomName,
      roomSummary,
      npcString,
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

  // Locked Room Handler
  async function handleLockedRoom({
    room,
    currentDungeon,
    dungeonOverview,
    shortDescription,
    connectedRoomsInfo,
    formRoomName = '',
    formRoomSummary = '',
    npcString = '',
  }) {
    const roomName = formRoomName || room.name || '';
    const roomSummary = formRoomSummary || room.oneSentenceSummary || '';

    const prompt = generateLockedRoomPrompt(
      dungeonOverview,
      shortDescription,
      connectedRoomsInfo,
      roomName,
      roomSummary,
      npcString,
    );
    console.log('Prompt:', prompt);
    const response = await generateGptResponse(
      prompt,
      validateLockedRoomResponse,
    );
    const roomDescription = JSON.parse(response);
    const contentArray = processLockedRoomResponse(roomDescription);
    return { roomDescription, contentArray };
  }

  // Living Room Handler
  async function handleLivingRoom({
    room,
    currentDungeon,
    dungeonOverview,
    shortDescription,
    connectedRoomsInfo,
    npcString = '',
  }) {
    const existingRooms = currentDungeon.roomNames.join(', ');
    const prompt = generateLivingRoomPrompt(
      dungeonOverview,
      shortDescription,
      existingRooms,
      connectedRoomsInfo,
      npcString,
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
    room,
    currentDungeon,
    dungeonOverview,
    shortDescription,
    connectedRoomsInfo,
    npcString = '',
  }) {
    const existingRooms = currentDungeon.roomNames.join(', ');
    const prompt = generateConnectingRoomPrompt(
      dungeonOverview,
      shortDescription,
      existingRooms,
      connectedRoomsInfo,
      npcString,
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
    room,
    currentDungeon,
    dungeonOverview,
    shortDescription,
    connectedRoomsInfo,
    npcString = '',
  }) {
    const existingRooms = currentDungeon.roomNames.join(', ');
    const prompt = generatePurposeRoomPrompt(
      dungeonOverview,
      shortDescription,
      existingRooms,
      connectedRoomsInfo,
      npcString,
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

  async function handleObstacleRoom({
    room,
    currentDungeon,
    dungeonOverview,
    shortDescription,
    connectedRoomsInfo,
    formRoomName = '',
    formRoomSummary = '',
    npcString = '',
  }) {
    // Find the key room
    const keyRoom = currentDungeon.rooms.find(
      (r) => r.id === room.hasKeyInRoomId,
    );

    let keyRoomDescriptionString = '';

    if (keyRoom && keyRoom.contentArray && keyRoom.contentArray.length > 0) {
      // Key room has been generated, use its description
      keyRoomDescriptionString = contentArrayToString(keyRoom.contentArray);
    } else {
      // Key room has not been generated or has no content
      console.log('Key room content not found, proceeding without it');
      // Proceed without the key room description
    }

    // Generate the obstacle prompt for the room
    const obstaclePrompt = generateObstaclePrompt(
      dungeonOverview,
      shortDescription,
      connectedRoomsInfo,
      room.hasKeyInRoomId,
      keyRoomDescriptionString, // Pass the key room description if available
      formRoomName,
      formRoomSummary,
      npcString,
    );
    console.log('Obstacle Prompt:', obstaclePrompt);

    // Get the response and process it
    const obstacleResponse = await generateGptResponse(
      obstaclePrompt,
      validateObstacleResponse,
    );
    const roomDescription = JSON.parse(obstacleResponse);
    const contentArray = processObstacleResponse(roomDescription);

    // Return the obstacle room's description and content array
    return { roomDescription, contentArray };
  }

  async function handleKeyRoom({
    room,
    currentDungeon,
    dungeonOverview,
    shortDescription,
    connectedRoomsInfo,
    formRoomName = '',
    formRoomSummary = '',
    npcString = '',
  }) {
    // Find the obstacle room
    const obstacleRoom = currentDungeon.rooms.find(
      (r) => r.id === room.hasKeyForRoomId,
    );

    if (!obstacleRoom) {
      console.error('Obstacle room not found');
      return;
    }

    let obstacleString = '';

    // Check if the obstacle room has content
    if (obstacleRoom.contentArray && obstacleRoom.contentArray.length > 0) {
      // Obstacle room has content, use it
      obstacleString = contentArrayToString(obstacleRoom.contentArray);
    } else {
      // Obstacle room does not have content
      console.log('Obstacle room content not found, proceeding without it');
      // We can proceed without the obstacle description
    }

    // Now generate the key room description
    const keyPrompt = generateKeyRoomPrompt(
      dungeonOverview,
      shortDescription,
      obstacleString, // This may be an empty string if obstacle room content is not available
      formRoomName,
      formRoomSummary,
      npcString,
    );
    console.log('Key Room Prompt:', keyPrompt);

    const keyRoomResponse = await generateGptResponse(
      keyPrompt,
      validateKeyRoomResponse,
    );
    const roomDescription = JSON.parse(keyRoomResponse);
    const contentArray = processKeyRoomResponse(roomDescription);

    // Return the key room's description and content array
    return { roomDescription, contentArray };
  }

  // **Mapping Room Types to Handler Functions**
  const roomTypeHandlers = {
    boss: handleBossRoom,
    setback: handleSetbackRoom,
    secret: handleSecretRoom,
    locked: handleLockedRoom,
    purpose: handlePurposeRoom,
    living: handleLivingRoom,
    connecting: handleConnectingRoom,
    // Add other room types as needed
  };

  // **Main Function: Generate Room Description**
  async function generateRoomDescription(
    currentDungeon,
    selectedRoomId,
    formRoomName = '',
    formRoomSummary = '',
    npcData = null,
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
      let npcString = '';
      if (npcData && npcData.npc_string) {
        npcString = npcData.npc_string;
      }

      // **Step 3: Generate Prompt Based on Room Type and Inputs**

      // First, check for special room types
      if (isEntrance) {
        // Handle entrance room
        ({ roomDescription, contentArray } = await handleEntranceRoom({
          dungeonOverview,
          shortDescription,
          connectedRoomsInfo,
          formRoomName,
          formRoomSummary,
          npcString,
        }));
      } else if (room.requiresKey) {
        ({ roomDescription, contentArray } = await handleObstacleRoom({
          room,
          currentDungeon,
          dungeonOverview,
          shortDescription,
          connectedRoomsInfo,
          formRoomName,
          formRoomSummary,
          npcString,
        }));
      } else if (room.hasKeyForRoomId) {
        ({ roomDescription, contentArray } = await handleKeyRoom({
          room,
          currentDungeon,
          dungeonOverview,
          shortDescription,
          connectedRoomsInfo,
          formRoomName,
          formRoomSummary,
          npcString,
        }));
      } else if (
        ['setback', 'locked', 'boss', 'secret'].includes(room.roomType)
      ) {
        // Use specific handler for these room types
        const handler = roomTypeHandlers[room.roomType];
        ({ roomDescription, contentArray } = await handler({
          room,
          currentDungeon,
          dungeonOverview,
          shortDescription,
          connectedRoomsInfo,
          formRoomName,
          formRoomSummary,
          npcString,
        }));
      } else if (formRoomName || formRoomSummary) {
        // Use custom room prompt
        ({ roomDescription, contentArray } = await handleCustomRoom({
          dungeonOverview,
          shortDescription,
          connectedRoomsInfo,
          formRoomName,
          formRoomSummary,
          npcString,
        }));
      } else if (['purpose', 'living', 'connecting'].includes(room.roomType)) {
        // Use specific handlers for these room types without form inputs
        const handler = roomTypeHandlers[room.roomType];
        ({ roomDescription, contentArray } = await handler({
          room,
          currentDungeon,
          dungeonOverview,
          shortDescription,
          connectedRoomsInfo,
          npcString,
        }));
      } else {
        console.error('Unknown room type:', room.roomType);
        return;
      }

      // **Update Room Details**
      room.oneSentenceSummary = roomDescription.one_sentence_summary || '';
      room.name = roomDescription.name || `Room ${selectedRoomId}`;
      room.contentArray = contentArray;

      // **Handle Secret Doors**
      const hasSecretDoor = room.doorways.some(
        (doorway) => doorway.type.toLowerCase() === 'secret',
      );

      if (hasSecretDoor && room.roomType !== 'secret') {
        await handleSecretDoor({
          room,
          currentDungeon,
          dungeonOverview,
          connectedRoomsInfo,
          contentArray,
        });
      }

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
