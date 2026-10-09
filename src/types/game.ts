export type TileKind = "empty" | "career" | "social" | "health" | "fortune";

export type PlayerStats = {
  wealth: number;
  debt: number;
  health: number;
  stress: number;
};

export type Player = {
  id: string;
  name: string;
  sprite: string;
  color: string;
  accent: string;
  position: number;
  stats: PlayerStats;
};

export type BoardTile = {
  id: number;
  q: number;
  r: number;
  x: number;
  z: number;
  kind: TileKind;
};