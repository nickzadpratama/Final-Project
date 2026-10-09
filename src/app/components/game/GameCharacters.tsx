"use client";

import { BOARD_TILES, hexToWorld } from "@/data/game";
import { useGameStore } from "@/store/useGameStore";
import CharacterSprite from "./CharacterSprite";

type GameCharactersProps = {
  surfaceY: number;
  selectedTileElevation: number;
};

export default function GameCharacters({
  surfaceY,
  selectedTileElevation,
}: GameCharactersProps) {
  const players = useGameStore((state) => state.players);
  const selectedTileId = useGameStore((state) => state.selectedTileId);

  return players.map((player) => {
    const tile = BOARD_TILES[player.position];
    if (!tile) return null;

    const { x, z } = hexToWorld(tile.q, tile.r);
    const y = surfaceY +
      (selectedTileId === tile.id ? selectedTileElevation : 0);

    return (
      <CharacterSprite
        key={player.id}
        name={player.name}
        sprite={player.sprite}
        position={[x, y, z]}
      />
    );
  });
}