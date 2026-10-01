'use client'

import { useEffect, useState } from 'react'
import { RiExternalLinkLine } from '@remixicon/react'
import { useGame } from '@/context/GameContext'

export default function ProfileView() {
    const [isMounted, setIsMounted] = useState(false)
    const { t, openExternalUrl } = useGame() || {}

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    return (
        <div className="p-4 sm:p-5 space-y-4 animate-in fade-in duration-500 max-w-xl mx-auto flex flex-col items-center text-center w-full">
            {/* Card 1: Game on Mobile */}
            <div className="w-full bg-white/40 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#4F7942]/15 shadow-sm flex flex-col items-center">
                <div className="mb-3">
                    <h2 className="text-lg sm:text-xl font-bold text-[#4F7942] mb-1">
                        {t('open_on_mobile') || 'Megnyitás telefonon'}
                    </h2>
                    <p className="text-xs text-zinc-700 font-medium italic max-w-xs mx-auto">
                        {t('mobile_qr_desc') || 'Olvasd be a QR-kódot a telefonoddal a kaland megnyitásához!'}
                    </p>
                </div>

                <div className="p-2.5 bg-white rounded-xl shadow-sm border border-black/5">
                    <img
                        src="/qr-code.svg"
                        alt="csupaszivcsapat.vercel.app QR kód"
                        className="w-36 h-36 sm:w-44 sm:h-44 rounded-lg object-contain select-none"
                    />
                </div>

                <a
                    href="https://csupaszivcsapat.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                        e.preventDefault();
                        openExternalUrl?.('https://csupaszivcsapat.vercel.app');
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#4F7942] hover:text-[#3d5e33] hover:underline transition-colors bg-[#4F7942]/5 hover:bg-[#4F7942]/10 px-3 py-1.5 rounded-lg border border-[#4F7942]/15 cursor-pointer"
                >
                    <span>csupaszivcsapat.vercel.app</span>
                    <RiExternalLinkLine size={14} />
                </a>
            </div>

            {/* Card 2: Kincsesláda School Site */}
            <div className="w-full bg-white/40 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#4F7942]/15 shadow-sm flex flex-col items-center">
                <div className="mb-3">
                    <h2 className="text-base sm:text-lg font-bold text-[#4F7942] leading-snug max-w-sm mx-auto">
                        {t('kincseslada_title') || 'Próbálja ki az iskola tanítást és tanulást segítő weboldalát is'}
                    </h2>
                </div>

                <div className="p-2.5 bg-white rounded-xl shadow-sm border border-black/5">
                    <img
                        src="/qr-kincseslada.svg"
                        alt="kincseslada.web.app QR kód"
                        className="w-36 h-36 sm:w-44 sm:h-44 rounded-lg object-contain select-none"
                    />
                </div>

                <a
                    href="https://kincseslada.web.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                        e.preventDefault();
                        openExternalUrl?.('https://kincseslada.web.app');
                    }}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#4F7942] hover:text-[#3d5e33] hover:underline transition-colors bg-[#4F7942]/5 hover:bg-[#4F7942]/10 px-3 py-1.5 rounded-lg border border-[#4F7942]/15 cursor-pointer"
                >
                    <span>kincseslada.web.app</span>
                    <RiExternalLinkLine size={14} />
                </a>
            </div>
        </div>
    )
}
