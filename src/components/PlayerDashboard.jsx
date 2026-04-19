'use client';

import { useGame } from '../context/GameContext';
import {
    RiUser3Line, RiMapPin2Line, RiFootprintLine, RiLeafLine,
    RiHeartLine, RiEarthLine, RiExternalLinkLine, RiZoomInLine
} from '@remixicon/react';
import { getColorFilterStyle } from './StoryEngine';
import { useState } from 'react';
import { CHARACTERS } from '../data/characters';


export default function PlayerDashboard() {
    const {
        state, project, currentElementId, getAssetUrl, isStarted,
        colorFilter, discoveredComponents,
        openLightbox, setShowLibrary, setShowDashboard, setLibrarySearchQuery
    } = useGame();
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
        { min: 10, title: 'Természetbarát', icon: RiLeafLine, color: 'text-[#4F7942]' },
        { min: 25, title: 'Mentőcsapat-tag', icon: RiHeartLine, color: 'text-[#4F7942]' },
        { min: 50, title: 'A Vadon Hőse', icon: RiEarthLine, color: 'text-[#4F7942]' },
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
    // 3 characters after first choice ("Kezdődjön a kaland!") + 3 per story
    const hasStartedKaland = (state.visits['f4476778-0b1f-40cc-a60b-688c895e3c0f'] || 0) > 0;
    const discoveredChars = (hasStartedKaland ? 3 : 0) + (finishedStories.length * 3);
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

                {/* Friends Section - Dynamic List */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 px-1">
                        <RiHeartLine size={16} className="text-[#4F7942]" />
                        <h3 className="text-xs font-bold text-[#4F7942] uppercase tracking-widest">
                            Felfedezett barátok ({discoveredChars} / {totalChars})
                        </h3>
                    </div>

                    <div className="grid gap-3">
                        {CHARACTERS.map((char) => {
                            const isDiscovered = char.storyId === 0 ? hasStartedKaland : finishedStories.includes(char.storyId);
                            if (!isDiscovered) return null;

                            return (
                                <div
                                    key={char.id}
                                    className="bg-white/40 backdrop-blur-md border border-[#4F7942]/10 rounded-2xl p-3 flex gap-4 transition-all hover:bg-white/50 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500"
                                >
                                    {/* ID Photo */}
                                    <div
                                        onClick={() => openLightbox(`/assets/Images/${char.image}`)}
                                        className="relative shrink-0 w-24 aspect-9/16 rounded-xl overflow-hidden border-2 border-white/50 shadow-sm cursor-pointer group"
                                    >
                                        <img
                                            src={`/assets/Images/${char.image}`}
                                            alt={char.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            style={{ filter: getColorFilterStyle(colorFilter) }}
                                        />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <RiZoomInLine size={24} className="text-white" />
                                        </div>
                                    </div>

                                    {/* Info Panel */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <div className="flex items-baseline justify-between gap-2 overflow-hidden">
                                            <h4 className="text-xl font-bold text-zinc-950 truncate">{char.name}</h4>
                                            <button
                                                onClick={() => {
                                                    if (char.externalLink) {
                                                        window.open(char.externalLink, '_blank');
                                                    } else {
                                                        setLibrarySearchQuery(char.species);
                                                        setShowLibrary(true);
                                                        setShowDashboard(false);
                                                    }
                                                }}
                                                className="shrink-0 flex items-center gap-1 text-xs font-bold text-[#4F7942] hover:text-[#3d5d33] transition-colors bg-[#4F7942]/5 px-2 py-1 rounded-md border border-[#4F7942]/10"
                                            >
                                                <span>{char.species}</span>
                                                <RiExternalLinkLine size={12} />
                                            </button>
                                        </div>
                                        <p className="text-sm text-zinc-700 mt-1.5 line-clamp-3 leading-relaxed italic">
                                            "{char.description}"
                                        </p>
                                    </div>
                                </div>
                            );
                        })}

                        {discoveredChars < totalChars && (
                            <div className="bg-black/5 border border-dashed border-[#4F7942]/20 rounded-2xl p-4 text-center">
                                <p className="text-xs text-[#4F7942]/40 font-bold uppercase tracking-widest italic">
                                    Folytasd a kalandot további barátokért!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

