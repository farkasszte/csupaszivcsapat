'use client';

import { useGame } from '../context/GameContext';
import { RiUser3Line, RiMapPin2Line, RiFootprintLine, RiLeafLine, RiHeartLine, RiEarthLine } from '@remixicon/react';


export default function PlayerDashboard() {
    const { state, project, discoveredComponents } = useGame();
    const score = state.variables?.score ?? 0;

    // Level Logic
    const LEVELS = [
        { min: 0, title: 'Kezdő Megfigyelő', icon: RiFootprintLine, color: 'text-[#4F7942]' },
        { min: 10, title: 'Természetbarát', icon: RiLeafLine, color: 'text-white' },
        { min: 25, title: 'Mentőcsapat-tag', icon: RiHeartLine, color: 'text-white' },
        { min: 50, title: 'A Vadon Hőse', icon: RiEarthLine, color: 'text-white' },
    ];


    const currentLevel = [...LEVELS].reverse().find(l => score >= l.min) || LEVELS[0];
    const nextLevelIdx = LEVELS.indexOf(currentLevel) + 1;
    const nextLevel = LEVELS[nextLevelIdx];

    const progress = nextLevel
        ? ((score - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100
        : 100;

    // Discovery Stats Logic
    const charBoardId = '036db898-0cb9-4a29-b19d-3e8f3288d9a2';
    const locBoardId = 'e175e706-97ec-42a8-8791-7855b29396e7';

    // Total counts in project
    const totalChars = project.boards[charBoardId]?.children?.length || 0;
    const totalLocs = project.boards[locBoardId]?.children?.length || 0;

    // Discovered counts
    const uniqueDiscovered = [...new Set(discoveredComponents)];
    const discoveredChars = uniqueDiscovered.filter(id => project.boards[charBoardId]?.children?.includes(id)).length;
    const discoveredLocs = uniqueDiscovered.filter(id => project.boards[locBoardId]?.children?.includes(id)).length;

    return (
        <div className="flex flex-col gap-6 p-4">
            {/* Main Level Card */}
            <div className="relative overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <currentLevel.icon size={120} />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-1">
                        <div className={`p-2 rounded-lg bg-white shadow-sm ${currentLevel.color}`}>
                            <currentLevel.icon size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-[#4F7942] uppercase tracking-widest drop-shadow-sm">Rangod</div>
                            <div className={`text-xl font-serif font-bold ${currentLevel.color}`}>{currentLevel.title}</div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-3xl font-extrabold text-white font-serif tracking-tight drop-shadow-sm">
                                {score} <span className="text-xs uppercase text-white tracking-widest ml-1">pont</span>
                            </span>
                            {nextLevel && (
                                <span className="text-[10px] text-[#4F7942] font-bold italic drop-shadow-sm">
                                    Következő: {nextLevel.title} ({nextLevel.min} pont)
                                </span>
                            )}
                        </div>

                        {/* XP Bar */}
                        <div className="h-2 w-full bg-zinc-800/50 rounded-full border border-white/5 overflow-hidden">
                            <div
                                className="h-full bg-linear-to-r from-blue-600 via-green-500 to-emerald-400 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(52,211,153,0.3)]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center transition-all hover:bg-white/10 shadow-md">
                    <RiUser3Line size={18} className="text-[#4F7942] drop-shadow-sm mb-2" />
                    <div className="text-xl font-bold text-white drop-shadow-sm">{discoveredChars} / {totalChars}</div>
                    <div className="text-[9px] text-[#4F7942] uppercase font-bold tracking-tighter drop-shadow-sm">Szereplők</div>
                </div>
                <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center transition-all hover:bg-white/10 shadow-md">
                    <RiMapPin2Line size={18} className="text-[#4F7942] drop-shadow-sm mb-2" />
                    <div className="text-xl font-bold text-white drop-shadow-sm">{discoveredLocs} / {totalLocs}</div>
                    <div className="text-[9px] text-[#4F7942] uppercase font-bold tracking-tighter drop-shadow-sm">Helyszínek</div>
                </div>
            </div>


            {/* Hint */}
            <div className="px-4 py-4 bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl shadow-md">
                <p className="text-sm font-semibold text-[#3e2723] text-center leading-relaxed">
                    Figyelj az állatok jelzéseire és hozz bölcs döntéseket a megmentésükért!
                </p>
            </div>

        </div>
    );
}

