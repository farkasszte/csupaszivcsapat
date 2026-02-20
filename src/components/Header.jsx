'use client';

import { usePathname } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import UserMenu from '@/components/Auth/UserMenu';
import {
    RiSave2Line,
    RiDownload2Line,
    RiRefreshLine,
    RiBookOpenLine,
    RiGamepadLine,
} from '@remixicon/react'

export default function Header() {
    const pathname = usePathname();
    const { saveGame, loadGame, resetGame, loading, showLog, setShowLog } = useGame() || {};

    if (pathname === '/login') {
        return null;
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-amber-900/30 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-2">
            <div className="flex items-center gap-2 sm:gap-6 min-w-0">
                <h1 className="text-base sm:text-xl font-bold bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent whitespace-nowrap">
                    Csupaszív Kaland
                </h1>

                {/* Game Toolbar */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                        onClick={saveGame}
                        disabled={loading}
                        title="Mentés"
                        className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 text-xs font-medium rounded border border-amber-500/30 transition-all disabled:opacity-50"
                    >
                        <RiSave2Line size={14} />
                        <span className="hidden sm:inline">Mentés</span>
                    </button>
                    <button
                        onClick={loadGame}
                        disabled={loading}
                        title="Betöltés"
                        className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-zinc-700/30 hover:bg-zinc-700/50 text-zinc-300 text-xs font-medium rounded border border-zinc-600/30 transition-all disabled:opacity-50"
                    >
                        <RiDownload2Line size={14} />
                        <span className="hidden sm:inline">Betöltés</span>
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('Biztosan elölről kezded?')) {
                                resetGame();
                            }
                        }}
                        disabled={loading}
                        title="Újrakezdés"
                        className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-zinc-700/30 hover:bg-zinc-700/50 text-zinc-400 text-xs font-medium rounded border border-zinc-600/30 transition-all disabled:opacity-50"
                    >
                        <RiRefreshLine size={14} />
                        <span className="hidden sm:inline">Újrakezdés</span>
                    </button>

                    {/* Log toggle */}
                    <button
                        onClick={() => setShowLog?.(!showLog)}
                        title={showLog ? 'Játék nézet' : 'Napló'}
                        className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-medium rounded border transition-all ${showLog
                                ? 'bg-orange-600/20 hover:bg-orange-600/40 text-orange-300 border-orange-500/30'
                                : 'bg-zinc-700/30 hover:bg-zinc-700/50 text-zinc-400 border-zinc-600/30'
                            }`}
                    >
                        {showLog ? <RiGamepadLine size={14} /> : <RiBookOpenLine size={14} />}
                        <span className="hidden sm:inline">{showLog ? 'Játék' : 'Napló'}</span>
                    </button>
                </div>
            </div>

            <UserMenu />
        </header>
    );
}
