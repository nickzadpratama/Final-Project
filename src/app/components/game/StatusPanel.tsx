"use client";

import { formatRupiah } from "@/data/game";
import { useGameStore } from "@/store/useGameStore";

function Meter({ value, color }: { value: number; color: string }) {
  return <div className="meter-track"><span style={{ width: `${value * 10}%`, background: color }} /></div>;
}

export default function StatusPanel() {
  const player = useGameStore((state) => state.players[0]);
  return (
    <aside className="paper-panel status-panel">
      <p className="panel-kicker">Kartu status pribadi</p>
      <p className="privacy-note">▣ Hanya kamu yang melihat</p>
      <div className="status-list">
        <div className="status-row"><span className="status-icon coin-icon">●</span><div><small>Kekayaan</small><strong>{formatRupiah(player.stats.wealth)}</strong></div></div>
        <div className="status-row"><span className="status-icon debt-icon">−</span><div><small>Hutang</small><strong>{formatRupiah(player.stats.debt)}</strong></div></div>
        <div className="status-row"><span className="status-icon health-icon">♥</span><div><small>Kesehatan</small><Meter value={player.stats.health} color="#72b85d" /></div><b>{player.stats.health}/10</b></div>
        <div className="status-row"><span className="status-icon stress-icon">ϟ</span><div><small>Level stres</small><Meter value={player.stats.stress} color="#ef6d5d" /></div><b>{player.stats.stress}/10</b></div>
      </div>
      <div className="tile-legend">
        <p>Kamus petak</p><span><b>▣</b> Kerja (Karier)</span><span><b>●●●</b> Sosial</span>
        <span><b>♥</b> Kesehatan</span><span><b>●</b> Keuangan / Rezeki</span>
      </div>
    </aside>
  );
}