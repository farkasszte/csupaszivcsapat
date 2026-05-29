'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import {
    RiFileCopyLine,
    RiCheckLine,
    RiLogoutBoxRLine,
    RiUserShared2Line
} from '@remixicon/react'
import { useGame } from '@/context/GameContext'

export default function ProfileView() {
    const supabase = createClient()
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [user, setUser] = useState(null)
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const [isMounted, setIsMounted] = useState(false)
    const { resetGame, t } = useGame()

    const [formData, setFormData] = useState({
        full_name: '',
        gender: '',
        birth_year: ''
    })

    useEffect(() => {
        setIsMounted(true)
        const getProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUser(user)
                setFormData({
                    full_name: user.user_metadata?.full_name || '',
                    gender: user.user_metadata?.gender || '',
                    birth_year: user.user_metadata?.birth_year || ''
                })
            }
            setLoading(false)
        }
        getProfile()
    }, [supabase])

    const handleLogout = async () => {
        resetGame?.()
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    const handleCopyCode = () => {
        const code = user?.email?.split('@')[0]
        if (code) {
            navigator.clipboard.writeText(code).then(() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            })
        }
    }

    const handleSave = async (e) => {
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

        const { error } = await supabase.auth.updateUser({
            data: {
                full_name: formData.full_name,
                gender: formData.gender,
                birth_year: formData.birth_year
            }
        })

        if (error) {
            setError(error.message)
        } else {
            setMessage(t('profile_updated') || 'Profil sikeresen frissítve!')
            setTimeout(() => {
                router.refresh()
            }, 2000)
        }
        setSaving(false)
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
                <h1 className="text-2xl font-bold text-[#4F7942] mb-2">{t('profile_title') || 'Profilom'}</h1>
                <p className="text-xs text-zinc-700 font-medium italic">{t('profile_desc') || 'Módosítsd adataidat az élmény személyre szabásához.'}</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-[#4F7942]/80 mb-2">Teljes név</label>
                    <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full px-4 py-3 bg-white/90 backdrop-blur-md shadow-sm rounded-xl focus:ring-2 focus:ring-[#4F7942]/40 focus:border-[#4F7942]/40 transition-all outline-none text-surface placeholder-surface/50"
                        placeholder="Minta János"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-[#4F7942]/80 mb-2">{t('gender') || 'Nem'}</label>
                        <select
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            className="w-full px-4 py-3 bg-white/90 backdrop-blur-md shadow-sm rounded-xl focus:ring-2 focus:ring-[#4F7942]/40 focus:border-[#4F7942]/40 transition-all outline-none text-surface appearance-none"
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
                            className="w-full px-4 py-3 bg-white/90 backdrop-blur-md shadow-sm rounded-xl focus:ring-2 focus:ring-[#4F7942]/40 focus:border-[#4F7942]/40 transition-all outline-none text-surface placeholder-surface/50"
                            placeholder="1990"
                            maxLength={4}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3 bg-[#4F7942] hover:bg-[#3d5e33] text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
                >
                    {saving ? (t('saving') || 'Mentés...') : (t('save_button') || 'Mentés')}
                </button>

                {error && (
                    <p className="text-red-900 text-sm text-center bg-red-100/80 p-3 rounded-xl border border-red-500/50">
                        {error}
                    </p>
                )}

                {message && (
                    <p className="text-emerald-900 text-sm text-center bg-emerald-100/80 p-3 rounded-xl border border-emerald-500/50">
                        {message}
                    </p>
                )}
            </form>

            {/* Divider */}
            <div className="border-t border-[#4F7942]/10" />

            {/* Account Actions */}
            <div className="space-y-4">
                {/* Guest code section */}
                {user?.email?.endsWith('@vendeg.hu') && (
                    <div className="flex flex-col gap-2 p-4 bg-white/40 border border-[#4F7942]/10 rounded-xl backdrop-blur-md shadow-sm">
                        <div className="text-[10px] font-bold text-[#4F7942]/70 uppercase tracking-widest">{t('guest_code') || 'Vendég kódod'}</div>
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-mono text-zinc-950 font-bold">{user.email.split('@')[0]}</span>
                            <button
                                onClick={handleCopyCode}
                                title={copied ? (t('copied') || 'Másolva!') : (t('copy_code_hint') || 'Kód másolása')}
                                className={`p-2 rounded-lg transition-all border border-[#4F7942]/10 bg-white/60 text-[#4F7942] hover:text-[#3d5e33] hover:bg-white/90 shadow-sm cursor-pointer ${copied ? 'text-emerald-600 bg-emerald-50' : ''}`}
                            >
                                {copied ? <RiCheckLine size={18} /> : <RiFileCopyLine size={18} />}
                            </button>
                        </div>
                    </div>
                )}

                {/* Email display for regular users */}
                {user && !user.email?.endsWith('@vendeg.hu') && (
                    <div className="flex items-center gap-2 px-1 text-xs text-zinc-800 font-semibold">
                        <RiUserShared2Line size={14} className="text-[#4F7942]" />
                        <span>Bejelentkezve: {user.email}</span>
                    </div>
                )}

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full py-3 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-950 font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                >
                    <RiLogoutBoxRLine size={18} />
                    {t('logout_button') || 'Kilépés a fiókból'}
                </button>
            </div>
        </div>
    )
}
