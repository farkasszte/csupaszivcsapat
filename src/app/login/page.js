'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/store/useGameStore'
import { translations } from '@/data/translations'
import {
    RiPlayCircleLine,
    RiRestartLine,
    RiUser3Line
} from '@remixicon/react'

export default function LoginPage() {
    const router = useRouter()
    const [isMounted, setIsMounted] = useState(false)
    const [hasSave, setHasSave] = useState(false)
    const [saveDate, setSaveDate] = useState(null)
    const [playerName, setPlayerName] = useState('')
    const [showConfirmNew, setShowConfirmNew] = useState(false)

    const { language, setLanguage, loadGame, resetGame } = useGameStore()
    const t = (key) => translations[language]?.[key] || translations['hu']?.[key] || key

    useEffect(() => {
        setIsMounted(true)
        if (typeof window !== 'undefined') {
            try {
                const rawSave = localStorage.getItem('csupasziv_game_save')
                if (rawSave) {
                    const parsed = JSON.parse(rawSave)
                    setHasSave(true)
                    if (parsed.savedAt) {
                        const d = new Date(parsed.savedAt)
                        setSaveDate(d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
                    }
                }
                const profile = JSON.parse(localStorage.getItem('csupasziv_user_profile') || '{}')
                if (profile.full_name) {
                    setPlayerName(profile.full_name)
                }
            } catch (e) {
                console.error(e)
            }
        }
    }, [])

    const saveNameIfProvided = () => {
        if (typeof window !== 'undefined' && playerName.trim()) {
            const profile = JSON.parse(localStorage.getItem('csupasziv_user_profile') || '{}')
            profile.full_name = playerName.trim()
            localStorage.setItem('csupasziv_user_profile', JSON.stringify(profile))
        }
    }

    const handleContinue = async () => {
        saveNameIfProvided()
        await loadGame()
        router.push('/')
    }

    const handleStartNew = () => {
        if (hasSave && !showConfirmNew) {
            setShowConfirmNew(true)
            return
        }
        saveNameIfProvided()
        resetGame()
        router.push('/')
    }

    if (!isMounted) return null

    return (
        <div className="min-h-screen text-zinc-950 font-sans flex flex-col items-center justify-between p-4 py-8 relative overflow-hidden">

            {/* Background Decorative Layer (h1, h2, h3 on background layer) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {/* h1.webp: Bottom Left */}
                <img
                    src="/assets/Images/h1.webp"
                    alt=""
                    className="absolute -bottom-4 left-[76px] w-[204px] sm:w-[288px] md:w-[360px] lg:w-[432px] max-w-none h-auto object-contain drop-shadow-xl opacity-90 transition-all duration-700"
                />

                {/* h2.webp: Bottom */}
                <img
                    src="/assets/Images/h2.webp"
                    alt=""
                    className="absolute -bottom-4 right-[268px] w-[165px] sm:w-[240px] md:w-[315px] max-w-none h-auto object-contain drop-shadow-lg opacity-85 transition-all duration-700"
                />

                {/* h3.webp: Bottom Right */}
                <img
                    src="/assets/Images/h3.webp"
                    alt=""
                    className="absolute -bottom-[40px] -right-6 w-[120px] sm:w-[180px] md:w-[230px] max-w-none h-auto object-contain drop-shadow-lg opacity-85 transition-all duration-700"
                />
            </div>

            {/* Language Selector (Top right) */}
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/40 backdrop-blur-md p-1 rounded-lg border border-white/20 z-50">
                {['hu', 'en', 'sr-latn', 'sr-cyrl'].map((lang) => (
                    <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`px-2 py-0.5 text-xs font-bold rounded transition-all ${language === lang ? 'bg-[#4F7942] text-white shadow-sm' : 'text-[#4F7942] hover:bg-white/40'}`}
                    >
                        {lang === 'sr-latn' ? 'SR(LAT)' : lang === 'sr-cyrl' ? 'SR(ЋИР)' : lang.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Main Centered Content */}
            <div className="w-full max-w-xl my-auto space-y-6 sm:space-y-8 relative z-10 py-6">

                {/* Header Section */}
                <div className="text-center space-y-3 sm:space-y-4 max-w-2xl mx-auto mt-4 sm:mt-0">
                    <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-950 tracking-tight drop-shadow-sm">
                        {t('game_title').includes(':') ? (
                            <>
                                {t('game_title').split(':')[0]}:
                                <br />
                                <span className="block mt-1 sm:mt-2">{t('game_title').split(':').slice(1).join(':').trim()}</span>
                            </>
                        ) : (
                            t('game_title')
                        )}
                    </h1>
                    <p className="text-sm sm:text-lg text-[#004d40] font-medium leading-relaxed">
                        {t('login_desc')}
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-4xl p-6 sm:p-10 space-y-6">
                    {/* Player Name Input */}
                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-zinc-900 uppercase tracking-wider">
                            <RiUser3Line size={16} className="text-[#4F7942]" />
                            {t('player_name_label') || 'JÁTÉKOS NEVE (OPCIONÁLIS)'}
                        </label>
                        <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder={t('player_name_placeholder') || 'Írd be a neved...'}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl outline-none text-zinc-950 placeholder-zinc-700 font-medium transition-all focus:ring-2 focus:ring-[#4F7942]/40"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4 pt-2">
                        {hasSave && (
                            <button
                                onClick={handleContinue}
                                className="w-full py-4 px-6 bg-[#4F7942] hover:bg-[#3f6134] text-white font-extrabold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#4F7942]/20 flex items-center justify-between group cursor-pointer border border-white/10"
                            >
                                <div className="flex items-center gap-3">
                                    <RiPlayCircleLine size={32} className="text-white/90 group-hover:scale-110 transition-transform" />
                                    <div className="text-left">
                                        <div className="text-lg font-bold leading-none">{t('continue_game') || 'Játék folytatása'}</div>
                                        {saveDate && <div className="text-xs text-white/80 font-normal mt-1">{t('last_save_prefix') || 'Utolsó mentés: '}{saveDate}</div>}
                                    </div>
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1.5 rounded-lg border border-white/20">{t('continue_button_tag') || 'FOLYTATÁS →'}</span>
                            </button>
                        )}

                        <button
                            onClick={handleStartNew}
                            className={`w-full py-4 px-6 font-extrabold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-between group cursor-pointer border ${hasSave
                                ? 'bg-white/10 hover:bg-white/20 text-zinc-950 border-white/20 shadow-md'
                                : 'bg-[#4F7942] hover:bg-[#3f6134] text-white border-white/10 shadow-lg shadow-[#4F7942]/20'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <RiRestartLine size={28} className="text-[#4F7942] group-hover:rotate-180 transition-transform duration-500" />
                                <span className="text-lg font-bold">{hasSave ? (t('start_new_game') || 'Új játék kezdése') : (t('start_game_button') || 'Játék indítása')}</span>
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1.5 rounded-lg border border-white/20">{t('start_button_tag') || 'INDÍTÁS →'}</span>
                        </button>

                        {/* Confirmation Dialog */}
                        {showConfirmNew && (
                            <div className="p-4 bg-red-100/90 border border-red-500/50 rounded-2xl space-y-3 text-center">
                                <p className="text-xs text-red-950 font-bold">
                                    {t('confirm_overwrite_warning') || '⚠️ Új játék indításakor a meglévő elmentett játékállásod felülíródik! Biztosan folytatod?'}
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowConfirmNew(false)
                                            saveNameIfProvided()
                                            resetGame()
                                            router.push('/')
                                        }}
                                        className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                                    >
                                        {t('confirm_yes') || 'Igen, új játék'}
                                    </button>
                                    <button
                                        onClick={() => setShowConfirmNew(false)}
                                        className="flex-1 py-2.5 bg-white/40 hover:bg-white/60 text-zinc-950 font-bold text-xs rounded-xl cursor-pointer border border-white/20"
                                    >
                                        {t('confirm_cancel') || 'Mégse'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center text-zinc-950 font-bold text-sm">
                    <a href="mailto:csupaszivcsapat@google.com" className="hover:underline">Csupaszív Csapat</a> &copy; 2026
                </div>
            </div>
        </div>
    )
}
