'use client';

import { useGame } from '../context/GameContext';
import { RiStarLine } from '@remixicon/react';

export default function PlayerDashboard() {
    const { state } = useGame();
    const score = state.variables?.score ?? 0;

    return (
        <div className="flex flex-col gap-4 p-4">
            {/* Score card */}
            <div className="flex flex-col items-center justify-center gap-3 bg-amber-900/10 border border-amber-700/20 rounded-xl p-6">
                <div className="flex items-center gap-2 text-amber-400/70 text-xs font-semibold uppercase tracking-widest">
                    <RiStarLine size={14} />
                    Pontszám
                </div>
                <div className="text-6xl font-extrabold text-amber-200 font-serif tracking-tight drop-shadow-md">
                    {score}
                </div>
                <div className="text-xs text-zinc-600">pont</div>
            </div>

            {/* Placeholder for future stats */}
            <div className="text-center text-zinc-700 text-xs italic mt-2">
                Hamarosan több statisztika…
            </div>
        </div>
    );
}
