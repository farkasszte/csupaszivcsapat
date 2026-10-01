'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '../context/GameContext';
import {
    RiDownloadLine,
    RiUploadLine,
    RiRestartLine,
    RiHome4Line,
    RiVolumeUpLine,
    RiVolumeMuteLine,
    RiPaletteLine,
    RiTimerLine,
    RiGlobalLine,
    RiFontFamily,
    RiTvLine,
} from '@remixicon/react';

export default function GameMenu() {
    const router = useRouter();
    const [localError, setLocalError] = useState(null);
    const [localMessage, setLocalMessage] = useState(null);

    const {
        loadGame, resetGame, loading, error, message,
        isMuted, toggleMute,
        colorFilter, setColorFilter,
        presentationMode, setPresentationMode,
        typewriterSpeed, setTypewriterSpeed,
        volume, setVolume,
        language, setLanguage,
        fontFamily, setFontFamily, effectiveFont, isCyrillic,
        t
    } = useGame();

    const handleExportSave = () => {
        try {
            const raw = localStorage.getItem('csupasziv_game_save');
            if (!raw) {
                setLocalError(t('export_no_save') || 'Nincs mentett játékállás a kiexportáláshoz.');
                return;
            }
            const blob = new Blob([raw], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `csupasziv_mentes_${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            setLocalMessage(t('export_success') || 'Mentés sikeresen letöltve!');
            setLocalError(null);
        } catch (err) {
            setLocalError(t('export_error') || 'Hiba történt a mentés exportálásakor.');
            setLocalMessage(null);
        }
    };

    const handleImportSave = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const content = event.target?.result;
                if (content && typeof content === 'string') {
                    JSON.parse(content); // Verify valid JSON
                    localStorage.setItem('csupasziv_game_save', content);
                    await loadGame();
                    setLocalMessage(t('import_success') || 'Mentés sikeresen betöltve!');
                    setLocalError(null);
                }
            } catch (err) {
                setLocalError(t('import_error') || 'Érvénytelen mentési fájl!');
                setLocalMessage(null);
            }
        };
        reader.readAsText(file);
    };

    const filters = [
        { id: 'none', name: t('none') },
        { id: 'protanopia', name: t('protanopia') },
        { id: 'deuteranopia', name: t('deuteranopia') },
        { id: 'tritanopia', name: t('tritanopia') },
        { id: 'grayscale', name: t('grayscale') },
        { id: 'vibrant', name: t('vibrant') },
    ];

    const languages = [
        { id: 'hu', name: 'Magyar' },
        { id: 'en', name: 'English' },
        { id: 'sr-latn', name: 'Srpski (Lat)' },
        { id: 'sr-cyrl', name: 'Српски (Ћир)' },
    ];

    const displayError = localError || error;
    const displayMessage = localMessage || message;

    return (
        <>
            <div className="flex flex-col gap-3 p-4 max-h-full overflow-y-auto overflow-x-hidden no-scrollbar w-full">
                {/* Status message */}
                {(displayError || displayMessage) && (
                    <div
                        className={`text-xs text-center px-3 py-2 rounded-lg border ${displayError
                            ? 'bg-red-100 border-red-500 text-red-900'
                            : 'bg-emerald-100 border-emerald-500 text-emerald-900'
                            }`}
                    >
                        {displayError || displayMessage}
                    </div>
                )}

                <button
                    onClick={handleExportSave}
                    disabled={loading}
                    className="flex items-center gap-3 px-4 py-3 bg-white/40 hover:bg-white/50 backdrop-blur-md border border-[#4F7942]/10 shadow-sm rounded-xl transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    <RiDownloadLine size={16} className="shrink-0 text-[#4F7942] transition-colors" />
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-[#4F7942] transition-colors">{t('export_save') || 'Mentés letöltése'}</div>
                        <div className="text-xs text-[#4F7942] mt-0.5 opacity-80">{t('export_save_desc') || 'Játékállás mentése fájlba'}</div>
                    </div>
                </button>

                <label className="flex items-center gap-3 px-4 py-3 bg-white/40 hover:bg-white/50 backdrop-blur-md border border-[#4F7942]/10 shadow-sm rounded-xl transition-all text-left group cursor-pointer">
                    <RiUploadLine size={16} className="shrink-0 text-[#4F7942] transition-colors" />
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-[#4F7942] transition-colors">{t('import_save') || 'Mentés betöltése'}</div>
                        <div className="text-xs text-[#4F7942] mt-0.5 opacity-80">{t('import_save_desc') || 'Mentési fájl betöltése'}</div>
                    </div>
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleImportSave}
                        className="hidden"
                    />
                </label>

                <div className="p-3 bg-white/40 backdrop-blur-md rounded-xl border border-[#4F7942]/10 shadow-sm mt-1">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-[#4F7942] mb-3 ml-1">{t('settings')}</h3>

                    {/* Language Switch */}
                    <div className="px-3 py-2 bg-white/40 rounded-lg mb-2">
                        <div className="flex items-center gap-2 mb-2">
                            <RiGlobalLine size={16} className="text-[#4F7942]" />
                            <span className="text-xs font-semibold text-[#4F7942]">{t('language')}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                            {languages.map(lang => (
                                <button
                                    key={lang.id}
                                    onClick={() => setLanguage(lang.id)}
                                    className={`px-2 py-1.5 text-xs rounded border transition-all text-center truncate ${language === lang.id
                                        ? 'bg-[#4F7942] hover:bg-[#3d5e33] border-[#4F7942] text-white shadow-sm font-bold'
                                        : 'bg-white/40 border-[#4F7942]/10 text-[#4F7942] hover:bg-white/60 hover:brightness-95'}`}
                                    title={lang.name}
                                >
                                    {lang.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sound Toggle */}
                    <div className="flex flex-col gap-2 px-3 py-2 bg-white/40 rounded-lg mb-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {isMuted ? <RiVolumeMuteLine size={16} className="text-[#4F7942]" /> : <RiVolumeUpLine size={16} className="text-[#4F7942]" />}
                                <span className="text-xs font-semibold text-[#4F7942]">{t('mute')}</span>
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
                            <span className="text-xs font-mono text-[#4F7942] w-10 text-right">
                                {Math.round(volume * 100)}%
                            </span>
                        </div>
                    </div>

                    {/* Color Filter Selector */}
                    <div className="px-3 py-2 mt-2 bg-white/40 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <RiPaletteLine size={16} className="text-[#4F7942]" />
                            <span className="text-xs font-semibold text-[#4F7942]">{t('visual_aid')}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                            {filters.map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setColorFilter(f.id)}
                                    className={`px-2 py-1 text-xs rounded border transition-all ${colorFilter === f.id
                                        ? 'bg-[#4F7942] hover:bg-[#3d5e33] border-[#4F7942] text-white shadow-sm font-bold'
                                        : 'bg-white/40 border-[#4F7942]/10 text-[#4F7942] hover:bg-white/60 hover:brightness-95'}`}
                                >
                                    {f.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Font Selector (Accessibility) */}
                    <div className="px-3 py-2 mt-2 bg-white/40 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <RiFontFamily size={16} className="text-[#4F7942]" />
                            <span className="text-xs font-semibold text-[#4F7942]">{t('font_style') || 'Betűtípus'}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                            <button
                                onClick={() => setFontFamily('montserrat')}
                                className={`px-2 py-1.5 text-xs rounded border transition-all text-center truncate ${effectiveFont === 'montserrat'
                                    ? 'bg-[#4F7942] hover:bg-[#3d5e33] border-[#4F7942] text-white shadow-sm font-bold'
                                    : 'bg-white/40 border-[#4F7942]/10 text-[#4F7942] hover:bg-white/60 hover:brightness-95'}`}
                                title={t('font_standard_tooltip') || 'Montserrat'}
                            >
                                {t('font_standard')}
                            </button>
                            <button
                                onClick={() => !isCyrillic && setFontFamily('lexend')}
                                disabled={isCyrillic}
                                title={isCyrillic ? t('font_cyrillic_unavailable') : (t('font_dyslexic_tooltip') || 'Lexend')}
                                className={`px-2 py-1.5 text-xs rounded border transition-all text-center truncate ${isCyrillic
                                    ? 'opacity-40 cursor-not-allowed bg-zinc-200/50 border-zinc-300 text-zinc-500'
                                    : effectiveFont === 'lexend'
                                        ? 'bg-[#4F7942] hover:bg-[#3d5e33] border-[#4F7942] text-white shadow-sm font-bold'
                                        : 'bg-white/40 border-[#4F7942]/10 text-[#4F7942] hover:bg-white/60 hover:brightness-95'}`}
                            >
                                {t('font_dyslexic')}
                            </button>
                        </div>
                        {isCyrillic && (
                            <p className="text-[11px] text-zinc-600 mt-1.5 italic leading-tight">
                                {t('font_cyrillic_unavailable')}
                            </p>
                        )}
                    </div>

                    {/* Typewriter Speed */}
                    <div className="px-3 py-2 mt-2 bg-white/40 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <RiTimerLine size={16} className="text-[#4F7942]" />
                                <span className="text-xs font-semibold text-[#4F7942]">{t('typewriter_speed')}</span>
                            </div>
                            <span className="text-xs font-mono text-[#4F7942] uppercase">
                                {typewriterSpeed === 0 ? t('none') : typewriterSpeed <= 20 ? t('fast') : typewriterSpeed <= 50 ? t('medium') || 'Közepes' : t('slow')}
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
                            <div className="flex justify-between mt-1 text-xs text-[#4F7942] font-medium opacity-70">
                                <span>{t('none')}</span>
                                <span>{t('fast')}</span>
                                <span>{t('slow')}</span>
                            </div>
                        </div>
                    </div>
                    {/* Presentation Mode Toggle */}
                    <div className="flex flex-col gap-1 px-3 py-2.5 mt-2 bg-white/40 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <RiTvLine size={16} className="text-[#4F7942]" />
                                <span className="text-xs font-semibold text-[#4F7942]">{t('presentation_mode') || 'Bemutató mód'}</span>
                            </div>
                            <button
                                onClick={() => setPresentationMode(!presentationMode)}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${presentationMode ? 'bg-[#4F7942]' : 'bg-[#4F7942]/20'}`}
                            >
                                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${presentationMode ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        <p className="text-[11px] text-[#4F7942]/80 leading-tight mt-0.5">
                            {t('presentation_mode_desc') || 'A külső linkek felugró ablakban nyílnak meg a bemutató elhagyása nélkül.'}
                        </p>
                    </div>
                </div>

                <div className="border-t border-[#4F7942]/10 my-1" />

                <button
                    onClick={() => {
                        if (confirm(t('confirm_reset') || 'Biztosan újrakezded? A mentetlen haladás elvész.')) {
                            resetGame();
                        }
                    }}
                    disabled={loading}
                    className="flex items-center gap-3 px-4 py-3 bg-white/40 hover:bg-white/50 border border-[#4F7942]/10 hover:border-[#4F7942]/30 rounded-xl transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    <RiRestartLine size={16} className="shrink-0 text-[#4F7942] transition-colors" />
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-[#4F7942] transition-colors">{t('reset_game') || 'Újrakezdés'}</div>
                        <div className="text-xs text-[#4F7942] mt-0.5 opacity-80">{t('reset_game_desc') || 'Visszatérés az elejére'}</div>
                    </div>
                </button>

                <button
                    onClick={() => router.push('/login')}
                    className="flex items-center gap-3 px-4 py-3 bg-white/40 hover:bg-white/50 border border-[#4F7942]/10 hover:border-[#4F7942]/30 rounded-xl transition-all text-left group cursor-pointer"
                >
                    <RiHome4Line size={16} className="shrink-0 text-[#4F7942] transition-colors" />
                    <div className="flex-1">
                        <div className="text-sm font-semibold text-[#4F7942] transition-colors">{t('return_to_home') || 'Visszatérés a kezdőlapra'}</div>
                        <div className="text-xs text-[#4F7942] mt-0.5 opacity-80">{t('return_to_home_desc') || 'Főmenü megnyitása'}</div>
                    </div>
                </button>
            </div>
        </>
    );
}
