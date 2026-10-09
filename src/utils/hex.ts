import type { BoardTile } from "@/types/game";

type HexCoordinate = Pick<BoardTile, "q" | "r">;

export function getHexDistance(
  first: HexCoordinate,
  second: HexCoordinate,
) {
  const dq = first.q - second.q;
  const dr = first.r - second.r;
  const ds = -first.q - first.r - (-second.q - second.r);

  return Math.max(Math.abs(dq), Math.abs(dr), Math.abs(ds));
}

export function getVisibleTileIds(
  originTileId: number,
  radius: number,
  tiles: readonly BoardTile[],
) {
  if (radius < 0) return [];

  const origin = tiles.find((tile) => tile.id === originTileId);
  if (!origin) return [];

  return tiles
    .filter((tile) => getHexDistance(origin, tile) <= radius)
    .map((tile) => tile.id);
}