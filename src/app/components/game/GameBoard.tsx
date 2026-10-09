"use client";

import { Html, OrbitControls, RoundedBox } from "@react-three/drei";
import { Canvas, ThreeEvent } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  BOARD_TILES,
  FOG_VISIBILITY_RADIUS,
  getAdjacentTileIds,
  HEX_TILE_RADIUS,
  TILE_DETAILS,
} from "@/data/game";
import { useGameStore } from "@/store/useGameStore";
import { getVisibleTileIds } from "@/utils/hex";
import GameCharacters from "./GameCharacters";

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();
const HEX_TILE_OUTLINE_RADIUS = HEX_TILE_RADIUS * 1.01;
const HEX_TILE_SURFACE_RADIUS = HEX_TILE_RADIUS * 0.96;
const HEX_TILE_ROTATION = Math.PI / 6;
const HEX_TILE_HEIGHT = 0.25;
const HEX_TILE_SURFACE_OFFSET = 0.02;
const HEX_TILE_ACTIVE_ELEVATION = 0.14;
const HEX_TILE_OUTLINE_COLOR = "#111318";
const FOG_HIDDEN_COLOR = "#17191d";
const FOG_VISIBLE_UNVISITED_MULTIPLIER = 0.55;

function HexTiles() {
  const outlineMesh = useRef<THREE.InstancedMesh>(null);
  const surfaceMesh = useRef<THREE.InstancedMesh>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const players = useGameStore((state) => state.players);
  const visitedTileIds = useGameStore((state) => state.visitedTileIds);
  const currentPlayerIndex = useGameStore((state) => state.currentPlayerIndex);
  const selectedTileId = useGameStore((state) => state.selectedTileId);
  const isPaused = useGameStore((state) => state.isPaused);
  const movePlayer = useGameStore((state) => state.movePlayer);
  const activePlayerTileId = players[currentPlayerIndex]?.position;
  const availableTiles = useMemo(
    () => activePlayerTileId === undefined
      ? []
      : getAdjacentTileIds(activePlayerTileId),
    [activePlayerTileId],
  );
  const availableTileSet = useMemo(
    () => new Set(availableTiles),
    [availableTiles],
  );
  const visibleTileSet = useMemo(
    () => new Set(
      activePlayerTileId === undefined
        ? []
        : getVisibleTileIds(
            activePlayerTileId,
            FOG_VISIBILITY_RADIUS,
            BOARD_TILES,
          ),
    ),
    [activePlayerTileId],
  );
  const visitedTileSet = useMemo(
    () => new Set(visitedTileIds),
    [visitedTileIds],
  );

  useEffect(() => {
    if (!outlineMesh.current || !surfaceMesh.current) return;

    const outline = outlineMesh.current;
    const surface = surfaceMesh.current;

    BOARD_TILES.forEach((tile, index) => {
      const isVisible = visibleTileSet.has(tile.id);
      const isVisited = visitedTileSet.has(tile.id);
      const isAvailable = availableTileSet.has(tile.id) &&
        isVisible &&
        selectedTileId === null &&
        !isPaused;
      const isHovered = hovered === tile.id && isAvailable;
      const isSelected = selectedTileId === tile.id;
      const tileElevation = isAvailable || isSelected ? HEX_TILE_ACTIVE_ELEVATION : 0;

      tempObject.position.set(
        tile.x,
        tileElevation,
        tile.z,
      );
      tempObject.rotation.set(0, HEX_TILE_ROTATION, 0);
      tempObject.scale.setScalar(isHovered ? 1.07 : 1);
      tempObject.updateMatrix();
      outline.setMatrixAt(index, tempObject.matrix);

      tempObject.position.y = tileElevation + HEX_TILE_SURFACE_OFFSET;
      tempObject.updateMatrix();
      surface.setMatrixAt(index, tempObject.matrix);

      if (isHovered || isSelected) {
        tempColor.set("#ffd34e");
      } else if (isAvailable) {
        tempColor.set(
          tile.kind === "empty"
            ? "#fff1b7"
            : TILE_DETAILS[tile.kind].color,
        );
      } else if (isVisited) {
        tempColor.set(TILE_DETAILS[tile.kind].color);
      } else if (isVisible) {
        tempColor
          .set(TILE_DETAILS[tile.kind].color)
          .multiplyScalar(FOG_VISIBLE_UNVISITED_MULTIPLIER);
      } else {
        tempColor.set(FOG_HIDDEN_COLOR);
      }
      surface.setColorAt(index, tempColor);
    });

    outline.instanceMatrix.needsUpdate = true;
    surface.instanceMatrix.needsUpdate = true;
    if (surface.instanceColor) surface.instanceColor.needsUpdate = true;
  }, [availableTileSet, hovered, isPaused, selectedTileId, visibleTileSet, visitedTileSet]);

  function handlePointerMove(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation();
    const tileId = event.instanceId ?? null;
    setHovered(tileId);
    document.body.style.cursor = tileId !== null &&
      availableTileSet.has(tileId) &&
      visibleTileSet.has(tileId)
      ? "pointer"
      : "default";
  }

  function handleClick(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation();
    const tileId = event.instanceId;
    if (
      tileId === undefined ||
      !availableTileSet.has(tileId) ||
      !visibleTileSet.has(tileId) ||
      selectedTileId !== null ||
      isPaused
    ) return;
    movePlayer(tileId);
  }

  return (
    <>
      <instancedMesh
        ref={outlineMesh}
        args={[undefined, undefined, BOARD_TILES.length]}
        receiveShadow
      >
        <cylinderGeometry
          args={[
            HEX_TILE_OUTLINE_RADIUS,
            HEX_TILE_OUTLINE_RADIUS,
            HEX_TILE_HEIGHT,
            6,
          ]}
        />
        <meshStandardMaterial
          color={HEX_TILE_OUTLINE_COLOR}
          roughness={0.9}
          metalness={0}
        />
      </instancedMesh>
      <instancedMesh
        ref={surfaceMesh}
        args={[undefined, undefined, BOARD_TILES.length]}
        castShadow
        receiveShadow
        onPointerMove={handlePointerMove}
        onPointerOut={() => {
          setHovered(null);
          document.body.style.cursor = "default";
        }}
        onClick={handleClick}
      >
        <cylinderGeometry
          args={[
            HEX_TILE_SURFACE_RADIUS,
            HEX_TILE_SURFACE_RADIUS,
            HEX_TILE_HEIGHT,
            6,
          ]}
        />
        <meshStandardMaterial roughness={0.72} metalness={0.05} />
      </instancedMesh>
      {BOARD_TILES.filter(
        (tile) =>
          tile.kind !== "empty" &&
          (visibleTileSet.has(tile.id) || visitedTileSet.has(tile.id)),
      ).map((tile) => (
        <Html
          key={tile.id}
          position={[tile.x, 0.34, tile.z]}
          center
          transform
          distanceFactor={10}
          style={{ pointerEvents: "none" }}
        >
          <span className={`tile-symbol tile-symbol-${tile.kind}`}>
            {TILE_DETAILS[tile.kind].icon}
          </span>
        </Html>
      ))}
    </>
  );
}

function DeskScene() {
  return <>
    <color attach="background" args={["#8f4f2f"]} /><fog attach="fog" args={["#8f4f2f", 13, 24]} />
    <ambientLight intensity={1.5} /><directionalLight position={[-4, 9, 5]} intensity={2.8} color="#fff2d0" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
    <pointLight position={[5, 5, -4]} intensity={16} color="#ffc25c" distance={14} />
    <RoundedBox args={[12, 0.35, 9.1]} radius={0.24} smoothness={4} position={[0, -0.36, 0]} receiveShadow><meshStandardMaterial color="#61331f" roughness={0.86} /></RoundedBox>
    <HexTiles />
    <Suspense fallback={null}>
      <GameCharacters
        surfaceY={HEX_TILE_HEIGHT / 2 + HEX_TILE_SURFACE_OFFSET}
        selectedTileElevation={HEX_TILE_ACTIVE_ELEVATION}
      />
    </Suspense>
    <OrbitControls enablePan={false} enableRotate={false} minDistance={10} maxDistance={15} target={[0, 0, 0]} />
  </>;
}

export default function GameBoard() {
  return <div className="board-canvas" aria-label="Papan permainan heksagonal 3D">
    <Canvas shadows dpr={[1, 1.6]} camera={{ position: [0, 10.5, 8.8], fov: 42 }} gl={{ antialias: true, powerPreference: "high-performance" }}><DeskScene /></Canvas>
  </div>;
}