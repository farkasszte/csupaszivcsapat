'use client';

import { useGame } from '../context/GameContext';
import { RiUser3Line, RiMapPin2Line, RiFootprintLine, RiLeafLine, RiHeartLine, RiEarthLine } from '@remixicon/react';


export default function PlayerDashboard() {
    const { state, project, discoveredComponents } = useGame();
    const score = state.variables?.score ?? 0;

    // Level Logic
    const LEVELS = [
        { min: 0, title: 'Kezdő Megfigyelő', icon: RiFootprintLine, color: 'text-blue-400' },
        { min: 10, title: 'Természetbarát', icon: RiLeafLine, color: 'text-[#FDF5E6]' },
        { min: 25, title: 'Mentőcsapat-tag', icon: RiHeartLine, color: 'text-[#FDF5E6]' },
        { min: 50, title: 'A Vadon Hőse', icon: RiEarthLine, color: 'text-[#FDF5E6]' },
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
            <div className="relative overflow-hidden bg-zinc-900/40 border border-white/5 rounded-2xl p-6 shadow-2xl">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <currentLevel.icon size={120} />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-1">
                        <div className={`p-2 rounded-lg bg-zinc-800/50 border border-white/5 ${currentLevel.color}`}>
                            <currentLevel.icon size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-[#FDF5E6] uppercase tracking-widest">Rangod</div>
                            <div className={`text-xl font-serif font-bold ${currentLevel.color}`}>{currentLevel.title}</div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-3xl font-extrabold text-[#FDF5E6] font-serif tracking-tight">
                                {score} <span className="text-xs uppercase text-[#FDF5E6] tracking-widest ml-1">pont</span>
                            </span>
                            {nextLevel && (
                                <span className="text-[10px] text-[#FDF5E6] italic">
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
                <div className="bg-zinc-800/30 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center transition-all hover:bg-zinc-800/50">
                    <RiUser3Line size={18} className="text-[#FDF5E6] mb-2" />
                    <div className="text-xl font-bold text-[#FDF5E6]">{discoveredChars} / {totalChars}</div>
                    <div className="text-[9px] text-[#FDF5E6] uppercase font-semibold tracking-tighter">Szereplők</div>
                </div>
                <div className="bg-zinc-800/30 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center transition-all hover:bg-zinc-800/50">
                    <RiMapPin2Line size={18} className="text-blue-500/50 mb-2" />
                    <div className="text-xl font-bold text-[#FDF5E6]">{discoveredLocs} / {totalLocs}</div>
                    <div className="text-[9px] text-[#FDF5E6] uppercase font-semibold tracking-tighter">Helyszínek</div>
                </div>
            </div>


            {/* Hint */}
            <div className="px-2 py-3 bg-emerald-900/5 border border-emerald-900/20 rounded-lg">
                <p className="text-[10px] text-[#FDF5E6] text-center italic leading-relaxed">
                    Figyelj az állatok jelzéseire és hozz bölcs döntéseket a megmentésükért!
                </p>
            </div>

        </div>
    );
}

