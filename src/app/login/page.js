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

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const generateCode = () => {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
        let result = ''
        for (let i = 0; i < 6; i++) {
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
        } else {
            setGeneratedCode(code)
            setMessage('Vendég fiók létrehozva! Jegyezd fel a kódodat!')
        }
        setLoading(false)
    }

    const handleGuestLogin = async (e) => {
        e.preventDefault()
        if (!guestCode || guestCode.length !== 6) {
            setError('Kérlek adj meg egy érvényes 6 jegyű kódot!')
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
        <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4 bg-[url('/cover/cover.jpg')] bg-cover bg-center bg-no-repeat bg-blend-multiply">
            <div className="absolute inset-0 bg-black/70 z-0"></div>

            <div className="relative z-10 w-full max-w-2xl grid md:grid-cols-2 gap-8">
                {/* Regular Login */}
                <div className="bg-gray-800/80 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-gray-700">
                    <h2 className="text-2xl font-bold text-center mb-8 text-white">Bejelentkezés</h2>

                    <form className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">E-mail cím</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-white"
                                placeholder="pelda@email.hu"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Jelszó</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-white"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleLogin}
                                disabled={loading}
                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/20"
                            >
                                {loading ? '...' : 'Belépés'}
                            </button>
                            <button
                                onClick={handleSignUp}
                                disabled={loading}
                                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600"
                            >
                                Regisztráció
                            </button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-600"></span></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-gray-800 px-2 text-gray-500">VAGY</span></div>
                        </div>

                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            type="button"
                            className="w-full py-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-3 shadow-md border border-gray-300"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google Bejelentkezés
                        </button>
                    </form>
                </div>

                {/* Guest Login */}
                <div className="bg-gray-800/80 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-gray-700 flex flex-col justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-center mb-8 text-white">Vendég Út</h2>
                        <p className="text-sm text-gray-400 mb-6 text-center">
                            Nincs fiókod? Lépj be vendégként és kapsz egy kódot a későbbi folytatáshoz.
                        </p>

                        <div className="space-y-6">
                            <button
                                onClick={handleGuestSignUp}
                                disabled={loading}
                                className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 shadow-lg shadow-purple-900/20"
                            >
                                Új vendég fiók létrehozása
                            </button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-600"></span></div>
                                <div className="relative flex justify-center text-xs uppercase"><span className="bg-gray-800 px-2 text-gray-500">VAGY</span></div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Visszatérés vendégkóddal</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={guestCode}
                                        onChange={(e) => setGuestCode(e.target.value.toLowerCase().slice(0, 6))}
                                        className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-white text-center font-mono tracking-widest"
                                        placeholder="abc123"
                                        maxLength={6}
                                    />
                                    <button
                                        onClick={handleGuestLogin}
                                        disabled={loading}
                                        className="px-6 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg border border-gray-600 transition-colors"
                                    >
                                        OK
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-center text-gray-500 text-sm">
                        Csupaszív Csapat &copy; 2026
                    </div>
                </div>

                {/* Status Messages */}
                <div className="md:col-span-2">
                    {error && (
                        <div className="text-red-400 text-sm bg-red-900/30 p-4 rounded-lg border border-red-800 mb-4 text-center">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="text-green-400 text-sm bg-green-900/30 p-4 rounded-lg border border-green-800 text-center">
                            {message}
                            {generatedCode && (
                                <div className="mt-2 text-2xl font-mono font-bold tracking-widest text-white selection:bg-purple-500">
                                    {generatedCode}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
