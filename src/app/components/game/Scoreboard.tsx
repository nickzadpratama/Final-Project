"use client";

import { formatRupiah } from "@/data/game";
import { useGameStore } from "@/store/useGameStore";

export default function Scoreboard() {
  const players = useGameStore((state) => state.players);
  const currentPlayerIndex = useGameStore((state) => state.currentPlayerIndex);
  const sorted = [...players].sort((first, second) => second.stats.wealth - first.stats.wealth);
  return (
    <aside className="paper-panel scoreboard">
      <p className="panel-kicker">Papan skor</p><p className="score-subtitle">Skor sementara</p>
      <ol>{sorted.map((player, index) => {
        const isActive = players[currentPlayerIndex].id === player.id;
        return <li key={player.id} className={isActive ? "active-score" : ""}>
          <span className="rank">{index + 1}.</span><span className="pawn" style={{ color: player.accent }}>♟</span>
          <span><strong>{player.name}{player.id === "michael" ? " (Kamu)" : ""}</strong><small>{formatRupiah(player.stats.wealth)}</small></span>
        </li>;
      })}</ol>
      <p className="score-footnote">Beban peringkat 1: peluang zonk +15%</p>
      <div className="gold-note"><strong>Petak Emas</strong><span>Hangus dalam 3 ronde</span></div>
    </aside>
  );
}