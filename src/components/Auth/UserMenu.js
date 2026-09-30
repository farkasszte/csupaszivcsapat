'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { RiQrCodeLine } from '@remixicon/react'
import { useGame } from '@/context/GameContext'

export default function UserMenu({ compact = false }) {
    const [isMounted, setIsMounted] = useState(false)
    const pathname = usePathname()
    const { setShowMenu, setShowProfile, showProfile, showMenu, t } = useGame() || {}

    useEffect(() => {
        setIsMounted(true)
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
                title={t('mobile_qr') || 'Mobil'}
                className={`flex flex-col items-center gap-0.5 text-xs font-semibold transition-colors px-2 py-1 rounded-lg hover:bg-white/20 ${onProfile || showProfile ? 'text-amber-300 hover:text-amber-400' : 'text-white/80 hover:text-white'}`}
            >
                <RiQrCodeLine size={20} />
                {t('mobile_qr') || 'Mobil'}
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

            {/* Middle section: App branding */}
            <div className="flex-1 flex justify-center">
                <span className="text-xs text-white/70 hidden md:inline bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    {t('local_mode') || 'Helyi mentés'}
                </span>
            </div>

            {/* QR / Mobile Toggle Button (Right) */}
            <div className="flex-1 flex justify-end">
                <button
                    onClick={handleProfileClick}
                    className={`px-2 py-1.5 rounded-lg text-sm font-bold transition-all border flex items-center gap-1.5 ${showProfile
                        ? 'bg-white/20 backdrop-blur-md text-white border-white/30 shadow-sm'
                        : 'text-white/80 border-transparent hover:text-white hover:bg-white/20'
                        }`}
                >
                    <RiQrCodeLine size={16} />
                    <span>{t('mobile_qr') || 'Mobil'}</span>
                </button>
            </div>
        </div>
    )
}
