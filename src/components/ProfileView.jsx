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
        await supabase.auth.signOut()
        router.push('/')
        router.refresh()
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
                setError('A születési évnek 1925 és 2050 között kell lennie!')
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
            setMessage('Profil sikeresen frissítve!')
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
                <div className="animate-pulse text-xl text-amber-200">Betöltés...</div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-amber-100 mb-2">Profilom</h1>
                <p className="text-xs text-zinc-500 italic">Módosítsd adataidat az élmény személyre szabásához.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-amber-200/50 mb-2">Teljes név</label>
                    <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full px-4 py-3 bg-zinc-950/50 border border-amber-900/30 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all outline-none text-amber-50 placeholder-zinc-600"
                        placeholder="Minta János"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-amber-200/50 mb-2">Nem</label>
                        <select
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            className="w-full px-4 py-3 bg-zinc-950/50 border border-amber-900/30 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all outline-none text-amber-50 appearance-none"
                        >
                            <option value="" className="bg-zinc-900">Válassz...</option>
                            <option value="male" className="bg-zinc-900">Férfi</option>
                            <option value="female" className="bg-zinc-900">Nő</option>
                            <option value="other" className="bg-zinc-900">Egyéb</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase tracking-widest font-bold text-amber-200/50 mb-2">Születési év</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={formData.birth_year}
                            onChange={(e) => setFormData({ ...formData, birth_year: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                            className="w-full px-4 py-3 bg-zinc-950/50 border border-amber-900/30 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all outline-none text-amber-50 placeholder-zinc-600"
                            placeholder="1990"
                            maxLength={4}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                >
                    {saving ? 'Mentés...' : 'Mentés'}
                </button>

                {error && (
                    <p className="text-red-300 text-sm text-center bg-red-950/50 p-3 rounded-xl border border-red-900/50">
                        {error}
                    </p>
                )}

                {message && (
                    <p className="text-emerald-300 text-sm text-center bg-emerald-950/50 p-3 rounded-xl border border-emerald-900/50">
                        {message}
                    </p>
                )}
            </form>

            {/* Divider */}
            <div className="border-t border-white/5" />

            {/* Account Actions */}
            <div className="space-y-4">
                {/* Guest code section */}
                {user?.email?.endsWith('@vendeg.hu') && (
                    <div className="flex flex-col gap-2 p-4 bg-zinc-950/40 border border-amber-900/20 rounded-xl">
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Vendég kódod</div>
                        <div className="flex items-center justify-between">
                            <span className="text-lg font-mono text-amber-200 font-bold">{user.email.split('@')[0]}</span>
                            <button
                                onClick={handleCopyCode}
                                title={copied ? 'Másolva!' : 'Kód másolása'}
                                className={`p-2 rounded-lg transition-all border ${copied
                                    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                                    : 'text-zinc-400 border-white/5 bg-zinc-800/50 hover:text-amber-300 hover:border-amber-500/30'
                                    }`}
                            >
                                {copied ? <RiCheckLine size={18} /> : <RiFileCopyLine size={18} />}
                            </button>
                        </div>
                    </div>
                )}

                {/* Email display for regular users */}
                {user && !user.email?.endsWith('@vendeg.hu') && (
                    <div className="flex items-center gap-2 px-1 text-xs text-zinc-500">
                        <RiUserShared2Line size={14} />
                        <span>Bejelentkezve: {user.email}</span>
                    </div>
                )}

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full py-3 flex items-center justify-center gap-2 bg-zinc-800/50 hover:bg-red-900/40 border border-zinc-700 hover:border-red-800/50 text-zinc-300 hover:text-red-400 font-medium rounded-xl transition-all"
                >
                    <RiLogoutBoxRLine size={18} />
                    Kilépés a fiókból
                </button>
            </div>
        </div>
    )
}
