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
                    className="absolute -top-10 right-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800/90 border border-zinc-600/50 text-white hover:text-white text-xs transition-colors"
                >
                    <RiCloseLine size={14} /> Bezárás
                </button>

                {/* Phone shell */}
                <div className="bg-zinc-800 rounded-[3rem] border-4 border-zinc-700 shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden"
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

                <p className="mt-3 text-xs text-white">360 × 780 – kattints hátra a bezáráshoz</p>
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
        volume, setVolume,
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
            <div className="flex flex-col gap-3 p-4 max-h-full overflow-y-auto no-scrollbar">
                {/* Status message */}
                {(error || message) && (
                    <div
                        className={`text-xs text-center px-3 py-2 rounded-lg border ${error
                            ? 'bg-red-100 border-red-500 text-[#4F7942]'
                            : 'bg-emerald-100 border-emerald-500 text-emerald-900'
                            }`}
                    >
                        {error || message}
                    </div>
                )}

                <button
                    onClick={saveGame}
                    disabled={loading}
                    className="flex items-center gap-3 px-4 py-3 bg-white/40 hover:bg-white/50 backdrop-blur-md border border-[#4F7942]/10 shadow-sm rounded-xl transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RiSave3Line size={16} className="shrink-0 text-[#4F7942] transition-colors" />
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-[#4F7942] transition-colors">Mentés</div>
                        <div className="text-xs text-[#4F7942] mt-0.5 opacity-80">Játékállás mentése a fiókba</div>
                    </div>
                </button>

                <button
                    onClick={loadGame}
                    disabled={loading}
                    className="flex items-center gap-3 px-4 py-3 bg-white/40 hover:bg-white/50 backdrop-blur-md border border-[#4F7942]/10 shadow-sm rounded-xl transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RiDownloadLine size={16} className="shrink-0 text-[#4F7942] transition-colors" />
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-[#4F7942] transition-colors">Visszatöltés</div>
                        <div className="text-xs text-[#4F7942] mt-0.5 opacity-80">Mentett állás betöltése</div>
                    </div>
                </button>

                <div className="p-3 bg-white/40 backdrop-blur-md rounded-xl border border-[#4F7942]/10 shadow-sm mt-1">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#4F7942] mb-3 ml-1">Beállítások</h3>

                    {/* Sound Toggle */}
                    <div className="flex flex-col gap-2 px-3 py-2 bg-white/40 rounded-lg mb-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {isMuted ? <RiVolumeMuteLine size={16} className="text-[#4F7942]" /> : <RiVolumeUpLine size={16} className="text-[#4F7942]" />}
                                <span className="text-xs font-semibold text-[#4F7942]">Hangok</span>
                            </div>
                            <button
                                onClick={toggleMute}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isMuted ? 'bg-[#4F7942]/20' : 'bg-[#4F7942]'}`}
                            >
                                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isMuted ? 'translate-x-0' : 'translate-x-4'}`} />
                            </button>
                        </div>

                        {/* Volume Slider */}
                        <div className="flex items-center gap-3 mt-1 opacity-80 hover:opacity-100 transition-opacity">
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="flex-1 accent-[#4F7942] h-1 bg-[#4F7942]/20 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-[10px] font-mono text-[#4F7942] w-8 text-right">
                                {Math.round(volume * 100)}%
                            </span>
                        </div>
                    </div>

                    {/* Scene Transitions */}
                    <div className="px-3 py-2 bg-white/40 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <RiSlideshow3Line size={16} className="text-[#4F7942]" />
                                <span className="text-xs font-semibold text-[#4F7942]">Helyszín áttűnés</span>
                            </div>
                            <button
                                onClick={() => setTransitionsEnabled(!transitionsEnabled)}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${transitionsEnabled ? 'bg-[#4F7942]' : 'bg-[#4F7942]/20'}`}
                            >
                                <div className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out ${transitionsEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Color Filter Selector */}
                    <div className="px-3 py-2 mt-2 bg-white/40 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <RiPaletteLine size={16} className="text-[#4F7942]" />
                            <span className="text-xs font-semibold text-[#4F7942]">Szín szűrő</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                            {filters.map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setColorFilter(f.id)}
                                    className={`px-2 py-1 text-[10px] rounded border transition-all ${colorFilter === f.id
                                        ? 'bg-white/50 border-[#4F7942]/30 text-[#4F7942] shadow-sm font-bold'
                                        : 'bg-white/40 border-[#4F7942]/10 text-[#4F7942] hover:bg-white/50'}`}
                                >
                                    {f.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Typewriter Speed */}
                    <div className="px-3 py-2 mt-2 bg-white/40 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <RiTimerLine size={16} className="text-[#4F7942]" />
                                <span className="text-xs font-semibold text-[#4F7942]">Írógép sebesség</span>
                            </div>
                            <span className="text-[10px] font-mono text-[#4F7942] uppercase">
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
                                className="w-full h-1.5 bg-[#4F7942]/20 rounded-lg appearance-none cursor-pointer accent-[#4F7942] focus:outline-none"
                            />
                            <div className="flex justify-between mt-1 text-[9px] text-[#4F7942] font-medium opacity-70">
                                <span>KI</span>
                                <span>Gyors</span>
                                <span>Lassú</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile preview button */}
                <button
                    onClick={() => setShowPreview(true)}
                    className="flex items-center gap-3 px-4 py-3 bg-white/40 hover:bg-white/50 backdrop-blur-md border border-[#4F7942]/10 shadow-sm rounded-xl transition-all text-left group mt-1"
                >
                    <RiSmartphoneLine size={16} className="shrink-0 text-[#4F7942] transition-colors" />
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-[#4F7942] transition-colors">Mobil előnézet</div>
                        <div className="text-xs text-[#4F7942] mt-0.5 opacity-80">Teljes oldal 360 × 780 px-en</div>
                    </div>
                </button>

                <div className="border-t border-[#4F7942]/10 my-1" />

                <button
                    onClick={() => {
                        if (confirm('Biztosan újrakezded? A mentetlen haladás elvész.')) {
                            resetGame();
                        }
                    }}
                    disabled={loading}
                    className="flex items-center gap-3 px-4 py-3 bg-white/40 hover:bg-white/50 border border-[#4F7942]/10 hover:border-[#4F7942]/30 rounded-xl transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RiRestartLine size={16} className="shrink-0 text-[#4F7942] transition-colors" />
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-[#4F7942] transition-colors">Újrakezdés</div>
                        <div className="text-xs text-[#4F7942] mt-0.5 opacity-80">Visszatérés az elejére</div>
                    </div>
                </button>
            </div>

            {showPreview && <MobilePreviewModal onClose={() => setShowPreview(false)} />}
        </>
    );
}
