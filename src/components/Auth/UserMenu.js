'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { RiUserLine } from '@remixicon/react'
import { useGame } from '@/context/GameContext'

export default function UserMenu({ compact = false }) {
    const [isMounted, setIsMounted] = useState(false)
    const [playerName, setPlayerName] = useState('')
    const pathname = usePathname()
    const { setShowMenu, setShowProfile, showProfile, showMenu, t } = useGame() || {}

    useEffect(() => {
        setIsMounted(true)
        if (typeof window !== 'undefined') {
            try {
                const profile = JSON.parse(localStorage.getItem('csupasziv_user_profile') || '{}')
                if (profile.full_name) {
                    setPlayerName(profile.full_name)
                }
            } catch (e) {
                // ignore
            }
        }
    }, [])

    if (!isMounted) return null

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
                title={onProfile ? (t('back_to_game') || 'Vissza') : (t('profile') || 'Profil')}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-colors px-2 py-1 rounded-lg hover:bg-white/20 ${onProfile ? 'text-white bg-white/20 border border-white/20 shadow-sm backdrop-blur-md' : 'text-white/80 hover:text-white'}`}
            >
                <RiUserLine size={20} />
                {t('profile') || 'Profil'}
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
                        ? 'bg-white/20 backdrop-blur-md text-white border-white/30 shadow-sm'
                        : 'text-white/80 border-transparent hover:text-white hover:bg-white/20'
                        }`}
                >
                    {t('settings') || 'Beállítások'}
                </button>
            </div>

            {/* Middle section: Player Name or App branding */}
            <div className="flex-1 flex justify-center">
                {playerName ? (
                    <span className="text-xs text-white/90 hidden md:inline bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 shadow-sm font-medium">
                        {playerName}
                    </span>
                ) : (
                    <span className="text-xs text-white/70 hidden md:inline bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                        {t('local_mode') || 'Helyi mentés'}
                    </span>
                )}
            </div>

            {/* Profile Toggle Button (Right) */}
            <div className="flex-1 flex justify-end">
                <button
                    onClick={handleProfileClick}
                    className={`px-2 py-1.5 rounded-lg text-sm font-bold transition-all border ${showProfile
                        ? 'bg-white/20 backdrop-blur-md text-white border-white/30 shadow-sm'
                        : 'text-white/80 border-transparent hover:text-white hover:bg-white/20'
                        }`}
                >
                    {t('profile') || 'Profil'}
                </button>
            </div>
        </div>
    )
}
