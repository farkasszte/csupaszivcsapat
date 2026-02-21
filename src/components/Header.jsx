'use client';

import { usePathname } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import UserMenu from '@/components/Auth/UserMenu';
import { RiLayoutRightLine, RiLayoutLine } from '@remixicon/react';

export default function Header() {
    const pathname = usePathname();
    const { showLog, showDashboard, showMap, showMenu, setShowMenu, setShowLog, setShowDashboard, setShowMap } = useGame() || {};

    if (pathname === '/login') return null;

    const showPanel = showLog || showDashboard || showMap || showMenu;

    const togglePanel = () => {
        if (showPanel) {
            // Close all
            setShowLog(false);
            setShowDashboard(false);
            setShowMap(false);
            setShowMenu(false);
        } else {
            // Open to Menu tab by default
            setShowMenu(true);
        }
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-amber-900/30 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-2">
            {/* Left: title */}
            <h1 className="text-base sm:text-xl font-bold bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent whitespace-nowrap">
                Csupaszív Kaland
            </h1>

            {/* Center: panel toggle (desktop only) */}
            <button
                onClick={togglePanel}
                title={showPanel ? 'Panel bezárása' : 'Panel megnyitása'}
                className={`hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded border transition-all ${showPanel
                        ? 'bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border-amber-500/30'
                        : 'bg-zinc-700/30 hover:bg-zinc-700/50 text-zinc-400 border-zinc-600/30'
                    }`}
            >
                {showPanel ? <RiLayoutLine size={14} /> : <RiLayoutRightLine size={14} />}
                <span>{showPanel ? 'Bezár' : 'Menü'}</span>
            </button>

            {/* Right: user menu */}
            <UserMenu />
        </header>
    );
}
