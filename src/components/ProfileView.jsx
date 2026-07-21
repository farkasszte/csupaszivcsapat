'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    RiDownloadLine,
    RiUploadLine,
    RiDeleteBin6Line,
    RiCheckLine,
    RiHome4Line
} from '@remixicon/react'
import { useGame } from '@/context/GameContext'
import { useGameStore } from '@/store/useGameStore'

export default function ProfileView() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const [isMounted, setIsMounted] = useState(false)
    const { resetGame, t } = useGame()
    const { clearSaveGame, loadGame } = useGameStore()

    const [formData, setFormData] = useState({
        full_name: '',
        gender: '',
        birth_year: ''
    })

    useEffect(() => {
        setIsMounted(true)
        if (typeof window !== 'undefined') {
            try {
                const profile = JSON.parse(localStorage.getItem('csupasziv_user_profile') || '{}')
                setFormData({
                    full_name: profile.full_name || '',
                    gender: profile.gender || '',
                    birth_year: profile.birth_year || ''
                })
            } catch (e) {
                console.error(e)
            }
        }
        setLoading(false)
    }, [])

    const handleSave = (e) => {
        e.preventDefault()

        if (formData.birth_year) {
            const year = parseInt(formData.birth_year)
            if (isNaN(year) || year < 1925 || year > 2050) {
                setError(t('error_birth_year') || 'A születési évnek 1925 és 2050 között kell lennie!')
                return
            }
        }

        setSaving(true)
        setError(null)
        setMessage(null)

        try {
            localStorage.setItem('csupasziv_user_profile', JSON.stringify(formData))
            setMessage(t('profile_updated') || 'Profil adatok sikeresen elmentve!')
        } catch (err) {
            setError(err.message || 'Sikertelen mentés!')
        } finally {
            setSaving(false)
        }
    }

    const handleExportSave = () => {
        try {
            const raw = localStorage.getItem('csupasziv_game_save')
            if (!raw) {
                setError(t('export_no_save') || 'Nincs mentett játékállás a kiexportáláshoz.')
                return
            }
            const blob = new Blob([raw], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `csupasziv_mentes_${new Date().toISOString().slice(0, 10)}.json`
            a.click()
            URL.revokeObjectURL(url)
            setMessage(t('export_success') || 'Mentés sikeresen letöltve!')
        } catch (err) {
            setError(t('export_error') || 'Hiba történt a mentés exportálásakor.')
        }
    }

    const handleImportSave = (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = async (event) => {
            try {
                const content = event.target?.result
                if (content && typeof content === 'string') {
                    JSON.parse(content) // Verify valid JSON
                    localStorage.setItem('csupasziv_game_save', content)
                    await loadGame()
                    setMessage(t('import_success') || 'Mentés sikeresen beimportálva!')
                }
            } catch (err) {
                setError(t('import_error') || 'Érvénytelen mentési fájl!')
            }
        }
        reader.readAsText(file)
    }

    const handleClearSave = () => {
        if (confirm(t('clear_save_confirm') || 'Biztosan törölni szeretnéd a helyi mentést? Ez nem vonható vissza.')) {
            clearSaveGame()
            resetGame?.()
            setMessage(t('save_cleared') || 'Mentés törölve.')
        }
    }

    if (!isMounted) return null

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <div className="animate-pulse text-xl text-white">{t('loading') || 'Betöltés...'}</div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-[#4F7942] mb-2">{t('profile_title') || 'Játékos Profil'}</h1>
                <p className="text-xs text-zinc-700 font-medium italic">{t('profile_desc') || 'Adatok és mentések kezelése ezen az eszközön.'}</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-[#4F7942]/80 mb-2">{t('player_name_nickname') || t('player_name_label') || 'Játékos Neve / Becenév'}</label>
                    <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full px-4 py-3 bg-white/90 backdrop-blur-md shadow-sm rounded-xl focus:ring-2 focus:ring-[#4F7942]/40 focus:border-[#4F7942]/40 transition-all outline-none text-surface placeholder-surface/50 font-semibold"
                        placeholder={t('player_name_placeholder') || 'Írd be a neved...'}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-[#4F7942]/80 mb-2">{t('gender') || 'Nem'}</label>
                        <select
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            className="w-full px-4 py-3 bg-white/90 backdrop-blur-md shadow-sm rounded-xl focus:ring-2 focus:ring-[#4F7942]/40 focus:border-[#4F7942]/40 transition-all outline-none text-surface appearance-none font-medium"
                        >
                            <option value="" className="bg-[#ebd7b1] text-surface">{t('choose') || 'Válassz...'}</option>
                            <option value="male" className="bg-[#ebd7b1] text-surface">{t('male') || 'Fiú'}</option>
                            <option value="female" className="bg-[#ebd7b1] text-surface">{t('female') || 'Lány'}</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-[#4F7942]/80 mb-2">Születési év</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={formData.birth_year}
                            onChange={(e) => setFormData({ ...formData, birth_year: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                            className="w-full px-4 py-3 bg-white/90 backdrop-blur-md shadow-sm rounded-xl focus:ring-2 focus:ring-[#4F7942]/40 focus:border-[#4F7942]/40 transition-all outline-none text-surface placeholder-surface/50 font-medium"
                            placeholder="1990"
                            maxLength={4}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3 bg-[#4F7942] hover:bg-[#3d5e33] text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-md cursor-pointer"
                >
                    {saving ? (t('saving') || 'Mentés...') : (t('save_button') || 'Profil Mentése')}
                </button>

                {error && (
                    <p className="text-red-900 text-sm text-center bg-red-100/80 p-3 rounded-xl border border-red-500/50 font-bold">
                        {error}
                    </p>
                )}

                {message && (
                    <p className="text-emerald-900 text-sm text-center bg-emerald-100/80 p-3 rounded-xl border border-emerald-500/50 font-bold">
                        {message}
                    </p>
                )}
            </form>

            <div className="border-t border-[#4F7942]/10" />

            {/* Save file backup & restore section */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-[#4F7942] uppercase tracking-wider">{t('local_save_management') || 'Helyi Mentés Kezelése'}</h3>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={handleExportSave}
                        className="py-2.5 px-3 flex items-center justify-center gap-2 bg-white/60 hover:bg-white/90 border border-[#4F7942]/20 text-[#4F7942] font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
                    >
                        <RiDownloadLine size={16} />
                        {t('export_save') || 'Mentés letöltése'}
                    </button>

                    <label className="py-2.5 px-3 flex items-center justify-center gap-2 bg-white/60 hover:bg-white/90 border border-[#4F7942]/20 text-[#4F7942] font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer">
                        <RiUploadLine size={16} />
                        {t('import_save') || 'Mentés betöltése'}
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImportSave}
                            className="hidden"
                        />
                    </label>
                </div>

                <button
                    onClick={handleClearSave}
                    className="w-full py-2.5 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-900 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                    <RiDeleteBin6Line size={16} />
                    {t('clear_local_save') || 'Helyi Mentés Törlése'}
                </button>

                <div className="border-t border-[#4F7942]/10 my-2" />

                <button
                    onClick={() => router.push('/login')}
                    className="w-full py-3 flex items-center justify-center gap-2 bg-[#4F7942] hover:bg-[#3d5e33] text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
                >
                    <RiHome4Line size={18} />
                    {t('return_to_home') || 'Visszatérés a kezdőlapra'}
                </button>
            </div>
        </div>
    )
}
