"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";
import GameBoard from "./GameBoard";
import Scoreboard from "./Scoreboard";
import StatusPanel from "./StatusPanel";

export default function GameInterface() {
  const currentPlayerIndex = useGameStore((state) => state.currentPlayerIndex);
  const player = useGameStore((state) => state.players[currentPlayerIndex]);
  const timeLeft = useGameStore((state) => state.timeLeft);
  const round = useGameStore((state) => state.round);
  const isPaused = useGameStore((state) => state.isPaused);
  const eventMessage = useGameStore((state) => state.eventMessage);
  const tick = useGameStore((state) => state.tick);
  const togglePause = useGameStore((state) => state.togglePause);
  const resetGame = useGameStore((state) => state.resetGame);
  useEffect(() => { const timer = window.setInterval(tick, 1000); return () => window.clearInterval(timer); }, [tick]);

  return <main className="game-page">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <section className="game-shell">
      <header className="top-hud">
        <div className="brand-mark"><span>SL</span><div><strong>Selangkah</strong><small>Life strategy game</small></div></div>
        <div className="calendar-card"><span className="binder binder-left" /><span className="binder binder-right" /><strong>15 Mei</strong><small>Langkah {round}/24</small><div className="weather">☀<span>Pancaroba</span></div></div>
        <div className="mission-card"><span>▰</span><div><strong>Kondangan Teman</strong><small>2 langkah lagi</small></div></div>
      </header>
      <div className="game-layout">
        <StatusPanel />
        <section className="board-stage"><div className="gold-badge">✦<strong>Petak<br />Emas</strong></div><GameBoard /><div className="event-toast" role="status">{eventMessage}</div></section>
        <Scoreboard />
      </div>
      <footer className="bottom-hud">
        <div className="turn-display"><span className="timer-ring">{timeLeft}</span><div><strong>{isPaused ? "Dijeda" : `Giliran ${player.name}`}</strong><small>{isPaused ? "Tekan lanjutkan untuk bermain" : "Pilih satu heksa yang menyala"}</small></div></div>
        <div className="action-buttons">
          <button type="button" onClick={resetGame} aria-label="Mulai ulang permainan"><span>↻</span><small>Ulang</small></button>
          <button type="button" aria-label="Ekspresi"><span>☺</span><small>Emote</small></button>
          <button type="button" className="invite-button" aria-label="Kartu ajakan"><i>1</i><span>▱</span><small>Kartu ajakan</small></button>
          <button type="button" className="pause-button" onClick={togglePause} aria-label={isPaused ? "Lanjutkan" : "Jeda"}><span>{isPaused ? "▶" : "Ⅱ"}</span><small>{isPaused ? "Lanjut" : "Jeda"}</small></button>
        </div>
      </footer>
    </section>
    <p className="game-tip">Klik petak yang menyala · scroll untuk zoom</p>
  </main>;
}