'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const router = useRouter()
    const supabase = createClient()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const [guestCode, setGuestCode] = useState('')
    const [generatedCode, setGeneratedCode] = useState(null)
    const [isMounted, setIsMounted] = useState(false)
    const [showForgotPassword, setShowForgotPassword] = useState(false)
    const [forgotEmail, setForgotEmail] = useState('')

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const generateCode = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
        let result = ''
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
        }
        return result
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        if (!email || !password) {
            setError('Kérlek add meg az email címedet és a jelszavadat!')
            return
        }

        setLoading(true)
        setError(null)
        setGeneratedCode(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
        } else {
            router.push('/')
            router.refresh()
        }
        setLoading(false)
    }

    const handleSignUp = async (e) => {
        e.preventDefault()
        if (!email || !password) {
            setError('Kérlek add meg az email címedet és a jelszavadat a regisztrációhoz!')
            return
        }

        setLoading(true)
        setError(null)
        setMessage(null)
        setGeneratedCode(null)

        const { error } = await supabase.auth.signUp({
            email,
            password,
        })

        if (error) {
            setError(error.message)
        } else {
            setMessage('Regisztráció sikeres! Ellenőrizd az e-mailedet a visszaigazoláshoz.')
        }
        setLoading(false)
    }

    const handleForgotPassword = async (e) => {
        e.preventDefault()
        if (!forgotEmail) {
            setError('Kérlek add meg az e-mail címedet!')
            return
        }

        setLoading(true)
        setError(null)
        setMessage(null)

        const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
            redirectTo: `${window.location.origin}/reset-password`,
        })

        if (error) {
            setError(error.message)
        } else {
            setMessage('Jelszó-visszaállítási linket küldtünk az e-mail címedre. Ellenőrizd a postaládádat!')
        }
        setLoading(false)
    }

    const handleGoogleLogin = async () => {
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            }
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        }
    }

    const handleGuestSignUp = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage(null)

        const code = generateCode()
        const guestEmail = `${code}@vendeg.hu`

        const { error } = await supabase.auth.signUp({
            email: guestEmail,
            password: code,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            // Auto login after sign up
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: guestEmail,
                password: code,
            })

            if (signInError) {
                setError('Hiba történt az automatikus bejelentkezés során: ' + signInError.message)
                setGeneratedCode(code)
                setLoading(false)
            } else {
                setGeneratedCode(code)
                setMessage('Vendég fiók létrehozva! Bejelentkezés folyamatban...')
                setTimeout(() => {
                    router.push('/')
                    router.refresh()
                }, 1500) // Give the user time to read the code
            }
        }
    }

    const handleGuestLogin = async (e) => {
        e.preventDefault()
        if (!guestCode || guestCode.length !== 8) {
            setError('Kérlek adj meg egy érvényes 8 karakteres kódot!')
            return
        }

        setLoading(true)
        setError(null)
        setGeneratedCode(null)

        const guestEmail = `${guestCode}@vendeg.hu`

        const { error } = await supabase.auth.signInWithPassword({
            email: guestEmail,
            password: guestCode,
        })

        if (error) {
            setError('Helytelen vendégkód!')
        } else {
            router.push('/')
            router.refresh()
        }
        setLoading(false)
    }

    if (!isMounted) return null

    return (
        <div className="min-h-screen text-zinc-950 font-sans flex flex-col items-center justify-center p-4 py-8">

            <div className="w-full max-w-4xl space-y-6 sm:space-y-12">
                {/* Header Section representing the image */}
                <div className="text-center space-y-3 sm:space-y-4 max-w-2xl mx-auto">
                    <h1 className="text-2xl sm:text-5xl font-extrabold text-zinc-950 tracking-tight drop-shadow-sm">Csupaszív kalandok: Homokhátság Hősei</h1>
                    <p className="text-sm sm:text-lg text-zinc-950 font-medium leading-relaxed">
                        A tűző nap égeti a homokháti pusztát. A föld repedezett, és minden élet vízért könyörög. Mentsd meg az állatokat Ürge Panni, Szalakóta Szilvia és Túzok tanár úr segítségével!
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 sm:gap-10 relative z-10 w-full">
                    {/* Regular Login / Forgot Password */}
                    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[2rem] p-6 sm:p-10">

                        {showForgotPassword ? (
                            /* ===== Forgot Password View ===== */
                            <>
                                <button
                                    onClick={() => { setShowForgotPassword(false); setError(null); setMessage(null) }}
                                    className="flex items-center gap-1 text-xs text-zinc-950 font-semibold hover:opacity-80 transition-opacity mb-6"
                                >
                                    ← Vissza a bejelentkezéshez
                                </button>
                                <h2 className="text-xl sm:text-2xl font-bold text-center mb-2 text-zinc-950">Jelszó visszaállítása</h2>
                                <p className="text-sm text-zinc-950 text-center mb-6">Add meg az e-mail címedet és küldünk egy visszaállítási linket.</p>

                                <form className="space-y-5" onSubmit={handleForgotPassword}>
                                    <div>
                                        <label className="block text-sm font-bold text-zinc-950 mb-2">E-mail cím</label>
                                        <input
                                            type="email"
                                            value={forgotEmail}
                                            onChange={(e) => setForgotEmail(e.target.value)}
                                            className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl focus:ring-2 focus:ring-white/40 focus:border-white/40 transition-all outline-none text-[#3e2723] placeholder-[#3e2723]/50"
                                            placeholder="pelda@email.hu"
                                            autoFocus
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-3.5 bg-[#4F7942] text-white font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#4F7942]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? '...' : 'Link küldése'}
                                    </button>
                                </form>
                            </>
                        ) : (
                            /* ===== Regular Login View ===== */
                            <>
                                <h2 className="text-xl sm:text-2xl font-bold text-center mb-5 sm:mb-8 text-zinc-950">Bejelentkezés</h2>

                                <form className="space-y-6">
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-bold text-zinc-950 mb-2">E-mail cím</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl focus:ring-2 focus:ring-white/40 focus:border-white/40 transition-all outline-none text-[#3e2723] placeholder-[#3e2723]/50"
                                                placeholder="pelda@email.hu"
                                            />
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-sm font-bold text-zinc-950">Jelszó</label>
                                                <button
                                                    type="button"
                                                    onClick={() => { setShowForgotPassword(true); setError(null); setMessage(null); setForgotEmail(email) }}
                                                    className="text-xs text-zinc-950 font-semibold hover:opacity-80 transition-opacity"
                                                >
                                                    Elfelejtett jelszó?
                                                </button>
                                            </div>
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl focus:ring-2 focus:ring-white/40 focus:border-white/40 transition-all outline-none text-[#3e2723] placeholder-[#3e2723]/50"
                                                placeholder="••••••••"
                                            />
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                            <button
                                                onClick={handleLogin}
                                                disabled={loading}
                                                className="w-full sm:flex-1 py-3.5 bg-[#4F7942] text-white font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#4F7942]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {loading ? '...' : 'Belépés'}
                                            </button>
                                            <button
                                                onClick={handleSignUp}
                                                disabled={loading}
                                                className="w-full sm:flex-1 py-3.5 bg-emerald-900/10 hover:bg-emerald-900/20 text-zinc-950 font-bold rounded-xl transition-all border border-[#4F7942]/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Regisztráció
                                            </button>
                                        </div>

                                        <div className="relative py-2">
                                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#4F7942]/30"></span></div>
                                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white/20 px-2 text-zinc-950 font-bold rounded-sm">VAGY</span></div>
                                        </div>

                                        <button
                                            onClick={handleGoogleLogin}
                                            disabled={loading}
                                            type="button"
                                            className="w-full py-3.5 bg-[#4F7942] text-white font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#4F7942]/20 disabled:opacity-50 flex items-center justify-center gap-3 border-none"
                                        >
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            Google Bejelentkezés
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>

                    {/* Guest Login */}
                    <div className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[2rem] p-6 sm:p-10 flex flex-col justify-between">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-center mb-5 sm:mb-8 text-zinc-950">Gyors Játék</h2>
                            <p className="text-sm text-zinc-950 font-medium mb-5 sm:mb-8 text-center px-2 sm:px-4 leading-relaxed">
                                Nincs fiókod? Lépj be vendégként és próbáld ki a játékot egy egyedi kóddal.
                            </p>

                            <div className="space-y-5 sm:space-y-8">
                                <button
                                    onClick={handleGuestSignUp}
                                    disabled={loading}
                                    className="w-full py-4 bg-[#4F7942] text-white font-extrabold rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-[#4F7942]/20 flex flex-col items-center justify-center gap-1 border border-white/10"
                                >
                                    <span className="text-xl drop-shadow-sm">Kezdjük el</span>
                                    <span className="text-xs text-white/80 font-semibold tracking-wide uppercase">Új vendég fiókkal</span>
                                </button>

                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#4F7942]/30"></span></div>
                                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white/20 px-2 text-zinc-950 font-bold rounded-sm">VAGY</span></div>
                                </div>

                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-zinc-950 text-center">Van már kódod? Folytasd!</label>
                                    <div className="flex gap-2 sm:gap-3">
                                        <input
                                            type="text"
                                            value={guestCode}
                                            onChange={(e) => setGuestCode(e.target.value.toLowerCase().slice(0, 8))}
                                            className="flex-1 px-3 sm:px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 outline-none text-emerald-50 text-center font-mono tracking-widest sm:tracking-[0.2em] uppercase placeholder-zinc-700 text-sm sm:text-base"
                                            placeholder="8 KARAKTER"
                                            maxLength={8}
                                        />
                                        <button
                                            onClick={handleGuestLogin}
                                            disabled={loading}
                                            className="px-6 sm:px-8 bg-[#4F7942] text-white font-bold rounded-xl transition-all hover:scale-[1.05] active:scale-[0.95] shadow-lg shadow-[#4F7942]/20 text-sm sm:text-base border-none"
                                        >
                                            OK
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 text-center text-zinc-950 font-bold text-sm">
                            Csupaszív Csapat &copy; 2026
                        </div>
                    </div>

                    {/* Status Messages */}
                    <div className="md:col-span-2 relative z-20">
                        {error && (
                            <div className="text-red-900 text-sm bg-red-100/80 p-4 rounded-xl border border-red-500/50 mb-4 text-center shadow-lg backdrop-blur-sm font-bold">
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="text-zinc-950 text-sm bg-emerald-100/80 p-6 rounded-xl border border-[#4F7942]/50 text-center shadow-lg backdrop-blur-sm font-bold">
                                <p className="mb-3">{message}</p>
                                {generatedCode && (
                                    <div className="mt-4 p-4 bg-black/40 rounded-lg inline-block border border-white/5">
                                        <div className="text-2xl sm:text-3xl font-mono font-bold tracking-widest sm:tracking-[0.25em] text-zinc-950 selection:bg-[#4F7942]/30 uppercase">
                                            {generatedCode}
                                        </div>
                                        <div className="text-xs text-zinc-950 mt-2 font-sans tracking-normal opacity-80">Ez a te egyedi azonosítód</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
