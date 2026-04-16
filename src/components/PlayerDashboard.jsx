'use client';

import { useGame } from '../context/GameContext';
import { RiUser3Line, RiMapPin2Line, RiFootprintLine, RiLeafLine, RiHeartLine, RiEarthLine } from '@remixicon/react';
import { getColorFilterStyle } from './StoryEngine';
import { useState } from 'react';


export default function PlayerDashboard() {
    const { state, project, currentElementId, getAssetUrl, isStarted, colorFilter, discoveredComponents } = useGame();
    const score = state.variables?.score ?? 0;
    const finishedStories = state.finishedStories || [];
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    // Scene Media Logic
    const currentElement = project?.elements?.[currentElementId];
    const coverAssetId = currentElement?.metadata?.cover_url;
    const videoAssetId = currentElement?.metadata?.video_url;

    const activeCoverUrl = getAssetUrl(coverAssetId);
    const videoUrl = getAssetUrl(videoAssetId);

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
    const totalChars = 12; // 3 intro + 3 per story (3*3) = 12 total
    const totalLocs = 3;  // 1 per story

    // Discovered counts
    // For characters, we approximate based on unique discovered components that aren't locations
    // We'll count unique discovered components and cap at 12
    const uniqueDiscovered = [...new Set(discoveredComponents)];
    const discoveredChars = Math.min(uniqueDiscovered.length, 12);
    const discoveredLocs = finishedStories.length; // 1 per story finished

    return (
        <div className="flex flex-col min-h-full">
            {/* Scene Media (Dashboard Slot) - Edge-to-edge top section */}
            {isStarted && (videoUrl || activeCoverUrl) && (
                <div className="w-full relative overflow-hidden bg-zinc-900 animate-in fade-in duration-700 shadow-2xl">
                    <div className="aspect-video relative w-full flex justify-center items-center overflow-hidden">
                        {videoUrl ? (
                            <video
                                key={videoUrl}
                                src={videoUrl}
                                autoPlay loop muted playsInline
                                onCanPlay={() => setIsVideoLoaded(true)}
                                className={`w-full h-full object-cover transition-opacity duration-300 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
                                style={{ filter: getColorFilterStyle(colorFilter) }}
                            />
                        ) : (
                            <img
                                key={activeCoverUrl}
                                src={activeCoverUrl}
                                alt="Scene"
                                className="w-full h-full object-cover"
                                style={{ filter: getColorFilterStyle(colorFilter) }}
                            />
                        )}

                        {/* Bottom edge shadow overlay */}
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/40 to-transparent pointer-events-none" />
                    </div>
                </div>
            )}

            {/* Dashboard Content with Padding */}
            <div className="flex flex-col gap-6 p-4">
                {/* Hint at the top */}
                <div className="px-5 py-4 bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl shadow-sm">
                    <p className="text-xs font-bold text-[#4F7942] text-center leading-relaxed tracking-wide">
                        Figyelj az állatok jelzéseire és hozz bölcs döntéseket a megmentésükért!
                    </p>
                </div>

                {/* Main Level Card */}
                <div className="relative overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-lg">
                    <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <currentLevel.icon size={120} className="text-[#4F7942]" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-1">
                            <div className={`p-2 rounded-lg bg-white shadow-sm ${currentLevel.color}`}>
                                <currentLevel.icon size={20} />
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-[#4F7942]/60 uppercase tracking-widest">Rangod</div>
                                <div className={`text-xl font-serif font-bold ${currentLevel.color}`}>{currentLevel.title}</div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-3xl font-extrabold text-[#4F7942] font-serif tracking-tight drop-shadow-sm">
                                    {score} <span className="text-xs uppercase text-[#4F7942]/70 tracking-widest ml-1 font-sans">pont</span>
                                </span>
                                {nextLevel && (
                                    <span className="text-[10px] text-[#4F7942]/50 font-bold italic drop-shadow-sm">
                                        Következő: {nextLevel.title} ({nextLevel.min} pont)
                                    </span>
                                )}
                            </div>

                            {/* XP Bar */}
                            <div className="h-2 w-full bg-black/10 rounded-full border border-white/5 overflow-hidden">
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
                        <RiUser3Line size={18} className="text-[#4F7942] mb-2" />
                        <div className="text-xl font-bold text-[#4F7942] drop-shadow-sm">{discoveredChars} / {totalChars}</div>
                        <div className="text-[9px] text-[#4F7942]/60 uppercase font-bold tracking-tighter drop-shadow-sm">Szereplők</div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center transition-all hover:bg-white/10 shadow-md">
                        <RiMapPin2Line size={18} className="text-[#4F7942] mb-2" />
                        <div className="text-xl font-bold text-[#4F7942] drop-shadow-sm">{discoveredLocs} / {totalLocs}</div>
                        <div className="text-[9px] text-[#4F7942]/60 uppercase font-bold tracking-tighter drop-shadow-sm">Helyszínek</div>
                    </div>
                </div>

                {/* Friends Image - Story Progression Reveal */}
                <div className="relative overflow-hidden rounded-2xl border border-white/20 shadow-xl bg-zinc-900 group">
                    {/* Base Layer: Grayscale */}
                    <img
                        src="/assets/Images/baratok.webp"
                        alt="Barátok"
                        className="w-full h-auto object-cover grayscale transition-opacity duration-1000"
                    />

                    {/* Reveal Layer: Color */}
                    <img
                        src="/assets/Images/baratok.webp"
                        alt="Barátok Color"
                        className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out"
                        style={{
                            clipPath: `inset(0 0 ${Math.max(0, 100 - (finishedStories.length * 33.33))}% 0)`,
                            filter: 'drop-shadow(0 0 10px rgba(79, 121, 66, 0.3))'
                        }}
                    />

                    {/* Optional overlay division lines */}
                    <div className="absolute inset-0 flex flex-col pointer-events-none opacity-20">
                        <div className="flex-1 border-b border-white" />
                        <div className="flex-1 border-b border-white" />
                        <div className="flex-1" />
                    </div>
                </div>
            </div>
        </div>
    );
}

