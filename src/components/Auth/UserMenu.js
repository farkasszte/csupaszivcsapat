'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    RiUserLine,
    RiFileCopyLine,
    RiCheckLine,
    RiLogoutBoxRLine,
} from '@remixicon/react'

export default function UserMenu({ compact = false }) {
    const [user, setUser] = useState(null)
    const [isMounted, setIsMounted] = useState(false)
    const [copied, setCopied] = useState(false)
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

    const handleCopyCode = () => {
        const code = user?.email?.split('@')[0]
        if (code) {
            navigator.clipboard.writeText(code).then(() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            })
        }
    }

    if (!isMounted) return null;

    if (!user) {
        if (compact) {
            return (
                <Link href="/login" title="Belépés" className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-zinc-500 hover:text-amber-300 transition-colors">
                    <RiUserLine size={20} />
                    Belépés
                </Link>
            )
        }
        return (
            <Link
                href="/login"
                className="px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 font-semibold rounded-lg transition-colors text-sm border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
            >
                Belépés
            </Link>
        )
    }

    const isGuest = user.email?.endsWith('@vendeg.hu')
    const guestCode = isGuest ? user.email.split('@')[0] : null

    if (compact) {
        return (
            <Link href="/profile" title="Profilom" className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-zinc-500 hover:text-amber-300 transition-colors">
                <RiUserLine size={20} />
                Profil
            </Link>
        )
    }

    return (
        <div className="flex items-center gap-3">
            {/* Guest code with copy button */}
            {isGuest && (
                <span className="hidden md:flex items-center gap-1.5 text-xs text-zinc-500">
                    Vendég kód: {guestCode}
                    <button
                        onClick={handleCopyCode}
                        title={copied ? 'Másolva!' : 'Kód másolása'}
                        className={`p-1 rounded transition-all ${copied ? 'text-emerald-400' : 'text-zinc-500 hover:text-amber-300'}`}
                    >
                        {copied
                            ? <RiCheckLine size={14} />
                            : <RiFileCopyLine size={14} />
                        }
                    </button>
                </span>
            )}

            {/* Regular email (non-guest) */}
            {!isGuest && (
                <span className="text-xs text-zinc-500 hidden md:inline">({user.email})</span>
            )}

            {/* Profile icon link */}
            <Link
                href="/profile"
                title="Profilom"
                className="p-1.5 text-amber-200/60 hover:text-amber-100 transition-colors rounded"
            >
                <RiUserLine size={18} />
            </Link>

            {/* Logout button */}
            <button
                onClick={handleLogout}
                title="Kilépés"
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 hover:bg-red-900/40 hover:text-red-400 text-zinc-300 rounded-lg transition-all text-sm font-medium border border-zinc-700 hover:border-red-800"
            >
                <RiLogoutBoxRLine size={15} />
                <span className="hidden sm:inline">Kilépés</span>
            </button>
        </div>
    )
}
