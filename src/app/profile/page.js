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

    const [formData, setFormData] = useState({
        full_name: '',
        gender: '',
        age: ''
    })

    useEffect(() => {
        const getProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setFormData({
                    full_name: user.user_metadata?.full_name || '',
                    gender: user.user_metadata?.gender || '',
                    age: user.user_metadata?.age || ''
                })
            }
            setLoading(false)
        }
        getProfile()
    }, [supabase])

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        setMessage(null)

        const { error } = await supabase.auth.updateUser({
            data: {
                full_name: formData.full_name,
                gender: formData.gender,
                age: formData.age
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="animate-pulse text-xl">Betöltés...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4 bg-[url('/cover/cover.jpg')] bg-cover bg-center bg-no-repeat bg-blend-multiply">
            <div className="absolute inset-0 bg-black/70 z-0"></div>

            <div className="relative z-10 w-full max-w-md bg-gray-800/80 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-gray-700">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-white">Profilom</h1>
                    <Link
                        href="/"
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                    >
                        <span>&larr;</span> Vissza a játékba
                    </Link>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Teljes név</label>
                        <input
                            type="text"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white"
                            placeholder="Minta János"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Nem</label>
                        <select
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white appearance-none"
                        >
                            <option value="">Válassz...</option>
                            <option value="male">Férfi</option>
                            <option value="female">Nő</option>
                            <option value="other">Egyéb</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Életkor</label>
                        <input
                            type="number"
                            value={formData.age}
                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white"
                            placeholder="25"
                            min="1"
                            max="120"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-blue-900/20"
                    >
                        {saving ? 'Mentés...' : 'Mentés'}
                    </button>

                    {error && (
                        <p className="text-red-400 text-sm text-center bg-red-900/20 p-3 rounded-lg border border-red-800/50">
                            {error}
                        </p>
                    )}

                    {message && (
                        <p className="text-green-400 text-sm text-center bg-green-900/20 p-3 rounded-lg border border-green-800/50">
                            {message}
                        </p>
                    )}
                </form>
            </div>
        </div>
    )
}
