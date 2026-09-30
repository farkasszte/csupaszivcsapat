'use client'

import { useEffect, useState } from 'react'
import { RiExternalLinkLine } from '@remixicon/react'
import { useGame } from '@/context/GameContext'

export default function ProfileView() {
    const [isMounted, setIsMounted] = useState(false)
    const { t } = useGame() || {}

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    return (
        <div className="p-6 space-y-5 animate-in fade-in duration-500 max-w-xl mx-auto flex flex-col items-center text-center">
            <div>
                <h1 className="text-2xl font-bold text-[#4F7942] mb-1">{t('open_on_mobile') || 'Megnyitás telefonon'}</h1>
                <p className="text-xs text-zinc-700 font-medium italic">{t('mobile_qr_desc') || 'Olvasd be a QR-kódot a telefonoddal a kaland megnyitásához!'}</p>
            </div>

            <div className="flex flex-col items-center">
                <img
                    src="/qr-code.svg"
                    alt="csupaszivcsapat.vercel.app QR kód"
                    className="w-56 h-56 sm:w-64 sm:h-64 rounded-2xl object-contain select-none shadow-sm"
                />

                <a
                    href="https://csupaszivcsapat.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#4F7942] hover:text-[#3d5e33] hover:underline transition-colors"
                >
                    <span>csupaszivcsapat.vercel.app</span>
                    <RiExternalLinkLine size={16} />
                </a>
            </div>
        </div>
    )
}
