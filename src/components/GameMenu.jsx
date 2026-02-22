'use client';

import { useGame } from '../context/GameContext';
import {
    RiSave3Line,
    RiDownloadLine,
    RiRestartLine,
    RiSmartphoneLine,
    RiCloseLine,
    RiVolumeUpLine,
    RiVolumeMuteLine,
    RiPaletteLine,
    RiTimerLine,
    RiSlideshow3Line,
} from '@remixicon/react';
import { useState } from 'react';

import { createPortal } from 'react-dom';

function MobilePreviewModal({ onClose }) {
    return createPortal(
        <div
            className="fixed inset-0 z-9999 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={onClose}
        >
            {/* Phone frame — clicks inside don't bubble to backdrop */}
            <div
                className="relative flex flex-col items-center"
                onClick={e => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute -top-10 right-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800/90 border border-zinc-600/50 text-zinc-300 hover:text-white text-xs transition-colors"
                >
                    <RiCloseLine size={14} /> Bezárás
                </button>

                {/* Phone shell */}
                <div className="bg-zinc-900 rounded-[3rem] border-4 border-zinc-700 shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden"
                    style={{ width: 360 + 16, padding: 4 }}>
                    {/* Notch bar */}
                    <div className="flex justify-center items-center py-2">
                        <div className="w-24 h-2 bg-zinc-800 rounded-full" />
                    </div>

                    {/* Screen */}
                    <div className="overflow-hidden rounded-2xl" style={{ width: 360, height: 780 }}>
                        <iframe
                            src="/"
                            title="Mobil előnézet"
                            width={360}
                            height={780}
                            style={{ border: 'none', display: 'block' }}
                        />
                    </div>

                    {/* Home bar */}
                    <div className="flex justify-center py-2">
                        <div className="w-20 h-1 bg-zinc-600 rounded-full" />
                    </div>
                </div>

                <p className="mt-3 text-xs text-zinc-500">360 × 780 – kattints hátra a bezáráshoz</p>
            </div>
        </div>,
        document.body
    );
}

export default function GameMenu() {
    const {
        saveGame, loadGame, resetGame, loading, error, message,
        isMuted, toggleMute,
        colorFilter, setColorFilter,
        typewriterSpeed, setTypewriterSpeed,
        transitionsEnabled, setTransitionsEnabled,
    } = useGame();

    const [showPreview, setShowPreview] = useState(false);

    const filters = [
        { id: 'none', name: 'Nincs' },
        { id: 'protanopia', name: 'Protanopia' },
        { id: 'deuteranopia', name: 'Deuteranopia' },
        { id: 'tritanopia', name: 'Tritanopia' },
        { id: 'grayscale', name: 'Szürkeárnyalatos' },
        { id: 'vibrant', name: 'Élénk' },
    ];


    return (
        <>
            <div className="flex flex-col gap-3 p-4">
                {/* Status message */}
                {(error || message) && (
                    <div
                        className={`text-xs text-center px-3 py-2 rounded-lg border ${error
                            ? 'bg-red-900/30 border-red-800/50 text-red-300'
                            : 'bg-emerald-900/30 border-emerald-800/50 text-emerald-300'
                            }`}
                    >
                        {error || message}
                    </div>
                )}

                <button
                    onClick={saveGame}
                    disabled={loading}
                    className="flex items-center gap-3 px-4 py-3 bg-amber-900/10 hover:bg-amber-900/25 border border-amber-700/15 hover:border-amber-600/30 rounded-xl transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RiSave3Line size={16} className="shrink-0 text-amber-500/70 group-hover:text-amber-400 transition-colors" />
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-amber-200 group-hover:text-amber-100 transition-colors">Mentés</div>
                        <div className="text-xs text-zinc-500 mt-0.5">Játékállás mentése a fiókba</div>
                    </div>
                </button>

                <button
                    onClick={loadGame}
                    disabled={loading}
                    className="flex items-center gap-3 px-4 py-3 bg-zinc-800/40 hover:bg-zinc-800/60 border border-zinc-700/30 hover:border-zinc-600/50 rounded-xl transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RiDownloadLine size={16} className="shrink-0 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-zinc-300 group-hover:text-zinc-100 transition-colors">Visszatöltés</div>
                        <div className="text-xs text-zinc-600 mt-0.5">Mentett állás betöltése</div>
                    </div>
                </button>

                <div className="border-t border-white/5 my-1" />

                <div className="px-1 py-1">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3 ml-1">Beállítások</h3>

                    {/* Sound Toggle */}
                    <div className="flex items-center justify-between px-3 py-2 bg-zinc-800/20 rounded-lg border border-white/5 mb-2">
                        <div className="flex items-center gap-2">
                            {isMuted ? <RiVolumeMuteLine size={16} className="text-red-500/70" /> : <RiVolumeUpLine size={16} className="text-amber-500/70" />}
                            <span className="text-xs font-semibold text-zinc-300">Hangok</span>
                        </div>
                        <button
                            onClick={toggleMute}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isMuted ? 'bg-zinc-700' : 'bg-amber-600/80'}`}
                        >
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isMuted ? 'translate-x-0' : 'translate-x-4'}`} />
                        </button>
                    </div>

                    {/* Scene Transitions */}
                    <div className="px-3 py-2 bg-zinc-800/20 rounded-lg border border-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <RiSlideshow3Line size={16} className="text-amber-500/70" />
                                <span className="text-xs font-semibold text-zinc-300">Helyszín áttűnés</span>
                            </div>
                            <button
                                onClick={() => setTransitionsEnabled(!transitionsEnabled)}
                                className={`h-5 w-9 rounded-full transition-colors relative ${transitionsEnabled ? 'bg-amber-600' : 'bg-zinc-700'}`}
                            >
                                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${transitionsEnabled ? 'left-4.5' : 'left-0.5'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Color Filter Selector */}
                    <div className="px-3 py-2 bg-zinc-800/20 rounded-lg border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <RiPaletteLine size={16} className="text-amber-500/70" />
                            <span className="text-xs font-semibold text-zinc-300">Szín szűrő</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                            {filters.map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setColorFilter(f.id)}
                                    className={`px-2 py-1 text-[10px] rounded border transition-all ${colorFilter === f.id
                                        ? 'bg-amber-900/30 border-amber-600/50 text-amber-200 shadow-glow-primary'
                                        : 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    {f.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Typewriter Speed */}
                    <div className="px-3 py-2 bg-zinc-800/20 rounded-lg border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <RiTimerLine size={16} className="text-amber-500/70" />
                                <span className="text-xs font-semibold text-zinc-300">Írógép sebesség</span>
                            </div>
                            <span className="text-[10px] font-mono text-amber-500/60 uppercase">
                                {typewriterSpeed === 0 ? 'KI' : typewriterSpeed <= 20 ? 'Gyors' : typewriterSpeed <= 50 ? 'Közepes' : 'Lassú'}
                            </span>
                        </div>
                        <div className="px-1">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="10"
                                value={typewriterSpeed}
                                onChange={(e) => setTypewriterSpeed(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-600 focus:outline-none"
                            />
                            <div className="flex justify-between mt-1 text-[9px] text-zinc-600 font-medium">
                                <span>KI</span>
                                <span>Gyors</span>
                                <span>Lassú</span>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="border-t border-white/5 my-1" />

                {/* Mobile preview button */}
                <button
                    onClick={() => setShowPreview(true)}
                    className="flex items-center gap-3 px-4 py-3 bg-zinc-800/30 hover:bg-zinc-800/50 border border-zinc-700/20 hover:border-zinc-600/40 rounded-xl transition-all text-left group"
                >
                    <RiSmartphoneLine size={16} className="shrink-0 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-zinc-300 group-hover:text-zinc-100 transition-colors">Mobil előnézet</div>
                        <div className="text-xs text-zinc-600 mt-0.5">Teljes oldal 360 × 780 px-en</div>
                    </div>
                </button>

                <div className="border-t border-white/5 my-1" />

                <button
                    onClick={() => {
                        if (confirm('Biztosan újrakezded? A mentetlen haladás elvész.')) {
                            resetGame();
                        }
                    }}
                    disabled={loading}
                    className="flex items-center gap-3 px-4 py-3 bg-red-900/10 hover:bg-red-900/25 border border-red-800/15 hover:border-red-700/40 rounded-xl transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RiRestartLine size={16} className="shrink-0 text-red-600/70 group-hover:text-red-400 transition-colors" />
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-red-400/80 group-hover:text-red-300 transition-colors">Újrakezdés</div>
                        <div className="text-xs text-zinc-600 mt-0.5">Visszatérés az elejére</div>
                    </div>
                </button>
            </div>

            {showPreview && <MobilePreviewModal onClose={() => setShowPreview(false)} />}
        </>
    );
}
