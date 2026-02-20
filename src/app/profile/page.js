'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ProfilePage() {
    const supabase = createClient()
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
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

    const handleSave = async (e) => {
        e.preventDefault()

        // Validation
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
            <div className="min-h-screen bg-zinc-950 text-orange-50/90 flex items-center justify-center">
                <div className="animate-pulse text-xl text-amber-200">Betöltés...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-orange-50/90 flex items-center justify-center p-4 bg-[url('/cover/cover.jpg')] bg-cover bg-center bg-no-repeat bg-blend-multiply">
            <div className="absolute inset-0 bg-black/70 z-0"></div>

            <div className="relative z-10 w-full max-w-md bg-zinc-900/60 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/5">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-amber-100">Profilom</h1>
                    <Link
                        href="/"
                        className="text-sm text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
                    >
                        <span>&larr;</span> Vissza a játékba
                    </Link>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-amber-200/70 mb-2">Teljes név</label>
                        <input
                            type="text"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            className="w-full px-4 py-3 bg-zinc-950/50 border border-amber-900/30 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all outline-none text-amber-50 placeholder-zinc-600"
                            placeholder="Minta János"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-amber-200/70 mb-2">Nem</label>
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
                        <label className="block text-sm font-medium text-amber-200/70 mb-2">Születési év</label>
                        <input
                            type="number"
                            value={formData.birth_year}
                            onChange={(e) => setFormData({ ...formData, birth_year: e.target.value })}
                            className="w-full px-4 py-3 bg-zinc-950/50 border border-amber-900/30 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all outline-none text-amber-50 placeholder-zinc-600"
                            placeholder="1990"
                            min="1925"
                            max="2050"
                        />
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
            </div>
        </div>
    )
}
