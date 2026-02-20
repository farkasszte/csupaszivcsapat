'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function UserMenu() {
    const [user, setUser] = useState(null)
    const [isMounted, setIsMounted] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        setIsMounted(true)
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }

        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null)
            }
        )

        return () => subscription.unsubscribe()
    }, [supabase])

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.refresh()
    }

    if (!isMounted) return null;

    if (!user) {
        return (
            <Link
                href="/login"
                className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 font-semibold rounded-lg transition-colors text-sm border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
            >
                Belépés
            </Link>
        )
    }

    return (
        <div className="flex items-center gap-4">
            <div className="flex flex-col items-end sm:flex-row sm:items-center gap-2 sm:gap-4">
                <Link
                    href="/profile"
                    className="text-sm text-amber-200/70 hover:text-amber-100 transition-colors"
                >
                    Profilom
                </Link>
                <span className="text-xs text-zinc-500 hidden md:inline">
                    {user.email?.endsWith('@vendeg.hu')
                        ? `Vendég kód: [${user.email.split('@')[0]}]`
                        : `(${user.email})`}
                </span>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-zinc-800/50 hover:bg-red-900/40 hover:text-red-400 text-zinc-300 rounded-lg transition-all text-sm font-medium border border-zinc-700 hover:border-red-800"
                >
                    Kilépés
                </button>
            </div>
        </div>
    )
}
