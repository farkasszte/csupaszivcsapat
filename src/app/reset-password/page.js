'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
    const router = useRouter()
    const supabase = createClient()

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const [isMounted, setIsMounted] = useState(false)
    const [sessionReady, setSessionReady] = useState(false)

    useEffect(() => {
        setIsMounted(true)

        // Supabase sends the recovery token in the URL hash.
        // The client library picks it up and fires an auth state change.
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === 'PASSWORD_RECOVERY') {
                    setSessionReady(true)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [supabase])

    const handleResetPassword = async (e) => {
        e.preventDefault()

        if (!password || !confirmPassword) {
            setError('Kérlek töltsd ki mindkét mezőt!')
            return
        }

        if (password !== confirmPassword) {
            setError('A két jelszó nem egyezik meg!')
            return
        }

        if (password.length < 6) {
            setError('A jelszónak legalább 6 karakter hosszúnak kell lennie!')
            return
        }

        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.updateUser({ password })

        if (error) {
            setError(error.message)
        } else {
            setMessage('Jelszód sikeresen megváltozott! Átirányítás...')
            setTimeout(() => {
                router.push('/')
                router.refresh()
            }, 2000)
        }
        setLoading(false)
    }

    if (!isMounted) return null

    return (
        <div className="min-h-screen bg-zinc-950 text-orange-50/90 font-sans flex flex-col items-center justify-center p-4 py-8">
            <div className="w-full max-w-md space-y-6">
                {/* Header */}
                <div className="text-center space-y-3">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-amber-200 font-serif tracking-tight drop-shadow-md">
                        Kiszáradt Legelők
                    </h1>
                    <p className="text-sm text-zinc-400">Jelszó visszaállítása</p>
                </div>

                {/* Card */}
                <div className="bg-zinc-900/60 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/5">
                    {message ? (
                        <div className="text-emerald-300 text-sm bg-emerald-950/50 p-6 rounded-xl border border-emerald-900/50 text-center shadow-lg">
                            <p>{message}</p>
                        </div>
                    ) : !sessionReady ? (
                        <div className="text-center space-y-4">
                            <p className="text-zinc-400 text-sm">
                                Az e-mailben lévő linkre kattintva megérkeztél ide. Várakozás a hitelesítésre...
                            </p>
                            <p className="text-zinc-600 text-xs">
                                Ha ez az oldal nem töltődik be helyesen, kérjük kattints újra az e-mailben lévő linkre.
                            </p>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 text-amber-100">
                                Új jelszó megadása
                            </h2>

                            <form className="space-y-5" onSubmit={handleResetPassword}>
                                <div>
                                    <label className="block text-sm font-medium text-amber-200/70 mb-2">
                                        Új jelszó
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-zinc-950/50 border border-amber-900/30 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all outline-none text-amber-50 placeholder-zinc-600"
                                        placeholder="••••••••"
                                        autoFocus
                                        minLength={6}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-amber-200/70 mb-2">
                                        Jelszó megerősítése
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 bg-zinc-950/50 border border-amber-900/30 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all outline-none text-amber-50 placeholder-zinc-600"
                                        placeholder="••••••••"
                                        minLength={6}
                                    />
                                </div>

                                {error && (
                                    <div className="text-red-300 text-sm bg-red-950/50 p-4 rounded-xl border border-red-900/50 text-center">
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                                >
                                    {loading ? '...' : 'Jelszó mentése'}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                <p className="text-center text-zinc-600 text-xs">
                    Csupaszív Csapat &copy; 2026
                </p>
            </div>
        </div>
    )
}
