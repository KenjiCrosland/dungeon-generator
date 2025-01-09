import { dungeons } from './dungeon-state.mjs';

export function saveDungeons() {
  localStorage.setItem('dungeons', JSON.stringify(dungeons.value));
}

export function loadDungeons(currentDungeonId) {
  const savedDungeons = localStorage.getItem('dungeons');
  if (savedDungeons) {
    dungeons.value = JSON.parse(savedDungeons);
    currentDungeonId.value = dungeons.value.length
      ? dungeons.value[0].id
      : null;
  }
}

export function findMonsterById(currentDungeon, monsterId) {
  if (!currentDungeon.value) return null;
  const monsters = currentDungeon.value.monsters || [];
  return monsters.find((m) => m.id === monsterId);
}
