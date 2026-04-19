'use client';

import React from 'react';
import { useGame } from '../context/GameContext';
import { 
    RiShieldLine, 
    RiUserSharedLine, 
    RiDropLine, 
    RiMastodonLine, // Using a generic marker icon instead of RiFlagLine for variety
    RiRestartLine,
    RiExternalLinkLine
} from '@remixicon/react';

export const FinaleActions = () => {
    const { 
        setShowLibrary, 
        setShowLog, 
        resetGame, 
        t 
    } = useGame();

    const actions = [
        {
            label: t('finale_guard'),
            icon: RiShieldLine,
            color: 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40',
            onClick: () => setShowLibrary(true),
            external: false
        },
        {
            label: t('finale_call'),
            icon: RiUserSharedLine,
            color: 'bg-blue-500/10 text-blue-800 border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40',
            onClick: () => setShowLog(true),
            external: false
        },
        {
            label: t('finale_water'),
            icon: RiDropLine,
            color: 'bg-sky-500/10 text-sky-800 border-sky-500/20 hover:bg-sky-500/20 hover:border-sky-500/40',
            onClick: () => window.open('https://perlatorprogram.hu/', '_blank'),
            external: true
        },
        {
            label: t('finale_present'),
            icon: RiMastodonLine,
            color: 'bg-amber-500/10 text-amber-800 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40',
            onClick: () => window.open('https://www.knp.hu/hu/', '_blank'),
            external: true
        }
    ];

    return (
        <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {actions.map((action, idx) => (
                    <button
                        key={idx}
                        onClick={action.onClick}
                        className={`group flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 shadow-sm hover:shadow-lg transform hover:-translate-y-1 ${action.color}`}
                    >
                        <div className="p-2 lg:p-3 rounded-lg bg-white/60 group-hover:scale-110 transition-transform shadow-inner">
                            <action.icon className="w-6 h-6 lg:w-7 lg:h-7" />
                        </div>
                        <div className="flex flex-col items-start flex-1">
                            <span className="font-bold text-sm lg:text-base text-left leading-tight group-hover:tracking-wide transition-all">
                                {action.label}
                            </span>
                            {action.external && (
                                <span className="text-[10px] uppercase tracking-widest opacity-60 flex items-center gap-1 mt-1">
                                    Külső oldal <RiExternalLinkLine className="w-2.5 h-2.5" />
                                </span>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            <div className="pt-8 flex justify-center">
                <button
                    onClick={() => resetGame?.()}
                    className="group flex items-center gap-2 px-8 py-3 rounded-full bg-red-50 hover:bg-red-100 text-red-900 border border-red-200 font-bold text-xs uppercase tracking-widest transition-all shadow-sm hover:shadow-md active:scale-95"
                >
                    <RiRestartLine className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    {t('reset_game') || 'Újrakezdés'}
                </button>
            </div>
        </div>
    );
};
