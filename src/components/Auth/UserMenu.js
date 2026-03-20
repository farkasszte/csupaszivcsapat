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
    const { setShowLog, setShowDashboard, setShowMap, setShowMenu, setShowLibrary, setShowProfile, showProfile, showMenu } = useGame() || {}

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
                <Link href="/login" title="Belépés" className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-[#3e2723] hover:text-[#3e2723] hover:bg-white/20 px-2 py-1 rounded-lg transition-colors">
                    <RiUserLine size={20} />
                    Belépés
                </Link>
            )
        }
        return (
            <Link
                href="/login"
                className="px-4 py-2 bg-white/40 hover:bg-white/60 text-[#3e2723] font-semibold rounded-lg transition-colors text-sm border border-white/50 shadow-sm"
            >
                Belépés
            </Link>
        )
    }

    const isGuest = user.email?.endsWith('@vendeg.hu')
    const guestCode = isGuest ? user.email.split('@')[0] : null
    const onProfile = pathname === '/profile'

    const handleProfileClick = () => {
        setShowProfile?.()
    }

    const handleMenuClick = () => {
        setShowMenu?.()
    }

    if (compact) {
        return (
            <button
                onClick={handleProfileClick}
                title={onProfile ? 'Vissza a játékba' : 'Profilom'}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-colors px-2 py-1 rounded-lg hover:bg-white/20 ${onProfile ? 'text-[#3e2723] bg-white/40 shadow-sm' : 'text-[#3e2723]/80 hover:text-[#3e2723]'}`}
            >
                <RiUserLine size={20} />
                Profil
            </button>
        )
    }

    return (
        <div className="flex items-center justify-between w-full px-1">
            {/* Settings Toggle Button (Left) */}
            <div className="flex-1 flex justify-start">
                <button
                    onClick={handleMenuClick}
                    className={`px-2 py-1.5 rounded-lg text-sm font-bold transition-all border ${showMenu
                        ? 'bg-white/50 text-[#3e2723] border-white/50 shadow-sm'
                        : 'text-[#3e2723]/80 border-transparent hover:text-[#3e2723] hover:bg-white/20'
                        }`}
                >
                    Beállítások
                </button>
            </div>

            {/* Middle section: Guest code or Email */}
            <div className="flex-1 flex justify-center">
                {isGuest && (
                    <span className="hidden md:flex items-center gap-1.5 text-xs text-[#3e2723] whitespace-nowrap">
                        Vendég kód: <span className="text-[#3e2723] font-mono font-bold bg-white/30 px-1.5 py-0.5 rounded">{guestCode}</span>
                        <button
                            onClick={handleCopyCode}
                            title={copied ? 'Másolva!' : 'Kód másolása'}
                            className={`p-1 rounded transition-all hover:bg-white/30 ${copied ? 'text-emerald-700' : 'text-[#3e2723] hover:text-[#3e2723]'}`}
                        >
                            {copied
                                ? <RiCheckLine size={14} />
                                : <RiFileCopyLine size={14} />
                            }
                        </button>
                    </span>
                )}

                {!isGuest && user && (
                    <span className="text-xs text-[#3e2723]/80 hidden md:inline bg-white/20 px-2 py-0.5 rounded-full border border-white/30">
                        {user.email}
                    </span>
                )}
            </div>

            {/* Profile Toggle Button (Right) */}
            <div className="flex-1 flex justify-end">
                <button
                    onClick={handleProfileClick}
                    className={`px-2 py-1.5 rounded-lg text-sm font-bold transition-all border ${showProfile
                        ? 'bg-white/50 text-[#3e2723] border-white/50 shadow-sm'
                        : 'text-[#3e2723]/80 border-transparent hover:text-[#3e2723] hover:bg-white/20'
                        }`}
                >
                    Profil
                </button>
            </div>
        </div>
    )
}

