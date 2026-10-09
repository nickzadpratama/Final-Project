import { BoardTile, Player, TileKind } from "@/types/game";

export const TILE_DETAILS: Record<
  TileKind,
  { label: string; icon: string; description: string; color: string }
> = {
  empty: {
    label: "Petak biasa",
    icon: "",
    description: "Tidak ada kejadian khusus.",
    color: "#626a75",
  },
  career: {
    label: "Kerja",
    icon: "▣",
    description: "Kesempatan karier menambah kekayaan.",
    color: "#f2e8cf",
  },
  social: {
    label: "Sosial",
    icon: "●●●",
    description: "Bertemu teman mengurangi stres.",
    color: "#f7efd9",
  },
  health: {
    label: "Kesehatan",
    icon: "♥",
    description: "Istirahat memulihkan kesehatan.",
    color: "#f6e7d3",
  },
  fortune: {
    label: "Rezeki",
    icon: "●",
    description: "Petak emas memberi bonus besar.",
    color: "#f4c64f",
  },
};

const specialKinds: TileKind[] = [
  "empty",
  "career",
  "empty",
  "social",
  "empty",
  "health",
  "empty",
  "career",
  "empty",
  "fortune",
];

export const HEX_TILE_RADIUS = 0.88;
export const FOG_VISIBILITY_RADIUS = 3;

export function hexToWorld(q: number, r: number) {
  return {
    x: HEX_TILE_RADIUS * 1.5 * q,
    z: HEX_TILE_RADIUS * Math.sqrt(3) * (r + q / 2),
  };
}

function createBoard(radius = 3): BoardTile[] {
  const tiles: BoardTile[] = [];
  for (let r = -radius; r <= radius; r += 1) {
    for (let q = -radius; q <= radius; q += 1) {
      if (Math.abs(q + r) > radius) continue;
      const id = tiles.length;
      const edge =
        Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) === radius;
      const kind =
        edge && id % 3 !== 0
          ? "empty"
          : specialKinds[(id * 7 + r + 20) % specialKinds.length];
      const { x, z } = hexToWorld(q, r);
      tiles.push({ id, q, r, x, z, kind });
    }
  }
  return tiles;
}

export const BOARD_TILES = createBoard();

function tileAt(q: number, r: number) {
  return BOARD_TILES.find((tile) => tile.q === q && tile.r === r)?.id ?? 0;
}

export const INITIAL_PLAYERS: Player[] = [
  {
    id: "michael",
    name: "Michael",
    sprite: "/characters/michael.png",
    color: "#f0cfaa",
    accent: "#72bf69",
    position: tileAt(-1, 0),
    stats: { wealth: 8_200_000, debt: 0, health: 7, stress: 4 },
  },
  {
    id: "raka",
    name: "Raka",
    sprite: "/characters/raka.png",
    color: "#8bc8e8",
    accent: "#62a4ce",
    position: tileAt(1, -2),
    stats: { wealth: 9_100_000, debt: 400_000, health: 8, stress: 3 },
  },
  {
    id: "sinta",
    name: "Sinta",
    sprite: "/characters/sinta.png",
    color: "#8dd6b4",
    accent: "#9d70c5",
    position: tileAt(-2, 2),
    stats: { wealth: 6_400_000, debt: 100_000, health: 9, stress: 2 },
  },
  {
    id: "icha",
    name: "Icha",
    sprite: "/characters/icha.png",
    color: "#eaa19b",
    accent: "#df786f",
    position: tileAt(2, 0),
    stats: { wealth: 3_300_000, debt: 0, health: 6, stress: 5 },
  },
];

export function getAdjacentTileIds(tileId: number) {
  const origin = BOARD_TILES[tileId];
  if (!origin) return [];
  const directions = [
    [1, 0],
    [1, -1],
    [0, -1],
    [-1, 0],
    [-1, 1],
    [0, 1],
  ];
  return directions.flatMap(([dq, dr]) => {
    const tile = BOARD_TILES.find(
      (candidate) =>
        candidate.q === origin.q + dq && candidate.r === origin.r + dr,
    );
    return tile ? [tile.id] : [];
  });
}

export function formatRupiah(value: number) {
  return `Rp${new Intl.NumberFormat("id-ID").format(value)}`;
}
