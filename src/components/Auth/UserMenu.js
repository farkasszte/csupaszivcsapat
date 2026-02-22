'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
    RiUserLine,
    RiFileCopyLine,
    RiCheckLine,
} from '@remixicon/react'

import { useGame } from '@/context/GameContext'

export default function UserMenu({ compact = false }) {
    const [user, setUser] = useState(null)
    const [isMounted, setIsMounted] = useState(false)
    const [copied, setCopied] = useState(false)
    const supabase = createClient()
    const router = useRouter()
    const pathname = usePathname()
    const { setShowLog, setShowDashboard, setShowMap, setShowMenu, setShowLibrary } = useGame() || {}

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
    const onProfile = pathname === '/profile'

    const handleProfileClick = () => {
        if (onProfile) {
            // Close all panels and go back to the game
            setShowLog?.(false)
            setShowDashboard?.(false)
            setShowMap?.(false)
            setShowMenu?.(false)
            setShowLibrary?.(false)
            router.push('/')
        } else {
            router.push('/profile')
        }
    }

    if (compact) {
        return (
            <button
                onClick={handleProfileClick}
                title={onProfile ? 'Vissza a játékba' : 'Profilom'}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-colors ${onProfile ? 'text-amber-300' : 'text-zinc-500 hover:text-amber-300'}`}
            >
                <RiUserLine size={20} />
                Profil
            </button>
        )
    }

    return (
        <div className="flex items-center gap-6">
            {/* Guest code with copy button */}
            {isGuest && (
                <span className="hidden md:flex items-center gap-1.5 text-xs text-zinc-500">
                    Vendég kód: <span className="text-amber-200/40 font-mono font-bold">{guestCode}</span>
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

            {/* Profile Toggle Button */}
            <button
                onClick={handleProfileClick}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all border ${onProfile
                    ? 'bg-amber-600/20 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'text-zinc-400 border-transparent hover:text-amber-200 hover:bg-zinc-800/50'
                    }`}
            >
                {onProfile ? 'Vissza a játékba' : 'Profil'}
            </button>
        </div>
    )
}

