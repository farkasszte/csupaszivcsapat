'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useGame } from '@/context/GameContext'
import {
    RiFileCopyLine,
    RiCheckLine,
    RiLogoutBoxRLine,
    RiUserShared2Line
} from '@remixicon/react'


export default function ProfilePage() {
    const supabase = createClient()
    const router = useRouter()
    const { setShowLog, setShowDashboard, setShowMap, setShowMenu, setShowLibrary } = useGame() || {}

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [user, setUser] = useState(null)
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const [isMounted, setIsMounted] = useState(false)


    useEffect(() => {
        setIsMounted(true)
        // Close all panels so the game resets to clean state behind the profile
        setShowLog?.(false)
        setShowDashboard?.(false)
        setShowMap?.(false)
        setShowMenu?.(false)
        setShowLibrary?.(false)
    }, [])

    const [formData, setFormData] = useState({
        full_name: '',
        gender: '',
        birth_year: ''
    })

    useEffect(() => {
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
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
                <div className="animate-pulse text-xl text-white">Betöltés...</div>
            </div>
        )
    }

    return (
        // Backdrop — click anywhere outside the card to go back
        <div
            className="relative min-h-screen bg-zinc-950 text-white p-4 pb-12 bg-[url('/cover/cover.jpg')] bg-cover bg-center bg-no-repeat bg-blend-multiply flex items-start lg:items-center justify-center cursor-pointer"
            onClick={() => router.back()}
        >
            <div className="absolute inset-0 bg-black/70 z-0" />

            {/* Card — clicks inside stay inside */}
            <div
                className="relative z-10 w-full max-w-md bg-zinc-800/60 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/5 cursor-default"
                onClick={e => e.stopPropagation()}
            >
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white">Profilom</h1>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Teljes név</label>
                        <input
                            type="text"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl focus:ring-2 focus:ring-white/40 focus:border-white/40 transition-all outline-none text-[#3e2723] placeholder-[#3e2723]/50"
                            placeholder="Minta János"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Nem</label>
                        <select
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl focus:ring-2 focus:ring-white/40 focus:border-white/40 transition-all outline-none text-[#3e2723] appearance-none"
                        >
                            <option value="" className="bg-zinc-800">Válassz...</option>
                            <option value="male" className="bg-zinc-800">Férfi</option>
                            <option value="female" className="bg-zinc-800">Nő</option>
                            <option value="other" className="bg-zinc-800">Egyéb</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Születési év</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={formData.birth_year}
                            onChange={(e) => setFormData({ ...formData, birth_year: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl focus:ring-2 focus:ring-white/40 focus:border-white/40 transition-all outline-none text-[#3e2723] placeholder-[#3e2723]/50"
                            placeholder="1990"
                            maxLength={4}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-white/20 shadow-sm"
                    >
                        {saving ? 'Mentés...' : 'Mentés'}
                    </button>

                    {error && (
                        <p className="text-white text-sm text-center bg-red-950/50 p-3 rounded-xl border border-red-900/50">
                            {error}
                        </p>
                    )}

                    {message && (
                        <p className="text-white text-sm text-center bg-emerald-950/50 p-3 rounded-xl border border-emerald-900/50">
                            {message}
                        </p>
                    )}
                </form>

                {/* Divider */}
                <div className="my-8 border-t border-white/5" />

                {/* Account Actions */}
                <div className="space-y-4">
                    {/* Guest code section */}
                    {user?.email?.endsWith('@vendeg.hu') && (
                        <div className="flex flex-col gap-2 p-4 bg-white/5 border border-white/10 rounded-xl">
                            <div className="text-[10px] font-bold text-white uppercase tracking-widest">Vendég fiók kódja</div>
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-mono text-white font-bold">{user.email.split('@')[0]}</span>
                                <button
                                    onClick={handleCopyCode}
                                    title={copied ? 'Másolva!' : 'Kód másolása'}
                                    className={`p-2 rounded-lg transition-all border ${copied
                                        ? 'text-white border-emerald-500/30 bg-emerald-500/10'
                                        : 'text-white border-white/5 bg-white/10 hover:text-white hover:bg-white/20 hover:border-white/30'
                                        }`}
                                >
                                    {copied ? <RiCheckLine size={18} /> : <RiFileCopyLine size={18} />}
                                </button>
                            </div>
                            <p className="text-[10px] text-white leading-relaxed italic">
                                Jegyzed meg ezt a kódot, ha később máshonnan is folytatni szeretnéd a játékot!
                            </p>
                        </div>
                    )}

                    {/* Email display for regular users */}
                    {user && !user.email?.endsWith('@vendeg.hu') && (
                        <div className="flex items-center gap-2 px-1 text-xs text-white">
                            <RiUserShared2Line size={14} />
                            <span>Bejelentkezve: {user.email}</span>
                        </div>
                    )}

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="w-full py-3 flex items-center justify-center gap-2 bg-zinc-800/50 hover:bg-red-900/40 border border-zinc-700 hover:border-red-800/50 text-white hover:text-white font-medium rounded-xl transition-all"
                    >
                        <RiLogoutBoxRLine size={18} />
                        Kilépés
                    </button>
                </div>
            </div>
        </div>

    )
}
