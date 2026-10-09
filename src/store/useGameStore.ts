"use client";

import { create } from "zustand";
import { BOARD_TILES, INITIAL_PLAYERS, TILE_DETAILS } from "@/data/game";
import { Player } from "@/types/game";

const TURN_DURATION = 24;

type GameState = {
  players: Player[];
  visitedTileIds: number[];
  currentPlayerIndex: number;
  selectedTileId: number | null;
  timeLeft: number;
  round: number;
  isPaused: boolean;
  eventMessage: string;
  movePlayer: (tileId: number) => void;
  nextTurn: () => void;
  tick: () => void;
  togglePause: () => void;
  resetGame: () => void;
};

function clonePlayers() {
  return INITIAL_PLAYERS.map((player) => ({ ...player, stats: { ...player.stats } }));
}

function getInitialVisitedTileIds() {
  return [...new Set(INITIAL_PLAYERS.map((player) => player.position))];
}

export const useGameStore = create<GameState>((set, get) => ({
  players: clonePlayers(),
  visitedTileIds: getInitialVisitedTileIds(),
  currentPlayerIndex: 0,
  selectedTileId: null,
  timeLeft: TURN_DURATION,
  round: 1,
  isPaused: false,
  eventMessage: "Pilih salah satu petak yang menyala untuk bergerak.",
  movePlayer: (tileId) => {
    const { currentPlayerIndex, players, visitedTileIds } = get();
    const tile = BOARD_TILES[tileId];
    if (!tile) return;
    const updatedPlayers = players.map((player, index) => {
      if (index !== currentPlayerIndex) return player;
      const stats = { ...player.stats };
      if (tile.kind === "career") stats.wealth += 750_000;
      if (tile.kind === "social") stats.stress = Math.max(0, stats.stress - 2);
      if (tile.kind === "health") stats.health = Math.min(10, stats.health + 2);
      if (tile.kind === "fortune") stats.wealth += 1_500_000;
      return { ...player, position: tileId, stats };
    });
    const detail = TILE_DETAILS[tile.kind];
    set({
      players: updatedPlayers,
      visitedTileIds: visitedTileIds.includes(tileId)
        ? visitedTileIds
        : [...visitedTileIds, tileId],
      selectedTileId: tileId,
      eventMessage: tile.kind === "empty" ? `${players[currentPlayerIndex].name} berpindah dengan aman.` : `${detail.label}: ${detail.description}`,
    });
    window.setTimeout(() => get().nextTurn(), 650);
  },
  nextTurn: () => {
    const { currentPlayerIndex, players, round } = get();
    const nextIndex = (currentPlayerIndex + 1) % players.length;
    set({
      currentPlayerIndex: nextIndex,
      selectedTileId: null,
      timeLeft: TURN_DURATION,
      round: nextIndex === 0 ? round + 1 : round,
      eventMessage: `Giliran ${players[nextIndex].name}. Pilih petak tujuan.`,
    });
  },
  tick: () => {
    const { isPaused, timeLeft } = get();
    if (isPaused) return;
    if (timeLeft <= 1) return get().nextTurn();
    set({ timeLeft: timeLeft - 1 });
  },
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  resetGame: () => set({
    players: clonePlayers(), visitedTileIds: getInitialVisitedTileIds(), currentPlayerIndex: 0, selectedTileId: null, timeLeft: TURN_DURATION,
    round: 1, isPaused: false, eventMessage: "Permainan dimulai ulang. Pilih petak yang menyala.",
  }),
}));