import { currentDungeon } from './dungeon-state.mjs';
import { saveDungeons } from './dungeon-utils.mjs';
import { generateDungeon } from '../util/generate-dungeon.mjs';
import { addDungeonDetails } from '../util/dungeon-details.mjs';
import { createRoomDescriptions } from '../util/create-room-descriptions.mjs';

export function generateMap() {
  if (!currentDungeon.value) {
    console.error('No dungeon selected');
    return;
  }

  let dungeonRoomArray = generateDungeon();
  addDungeonDetails(dungeonRoomArray);

  const roomDescriptions = createRoomDescriptions(dungeonRoomArray);
  dungeonRoomArray.forEach((room, index) => {
    room.shortDescription = roomDescriptions[index + 1];
  });

  currentDungeon.value.rooms = dungeonRoomArray;
  currentDungeon.value.roomDescriptions = roomDescriptions;
  saveDungeons();
}

export function handleUpdateRoomDescription({ roomId, contentArray, name }) {
  if (!currentDungeon.value) return;

  const room = currentDungeon.value.rooms.find((r) => r.id === roomId);
  if (room) {
    room.contentArray = contentArray;
    room.name = name;
    currentDungeon.value.roomNames =
      currentDungeon.value.rooms.map((r) => r.name).filter(Boolean) || [];
    saveDungeons();
  } else {
    console.error(`Room with ID ${roomId} not found`);
  }
}
