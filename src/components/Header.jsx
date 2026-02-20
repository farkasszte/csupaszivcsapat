'use client';

import { usePathname } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import UserMenu from '@/components/Auth/UserMenu';

export default function Header() {
    const pathname = usePathname();
    const { saveGame, loadGame, resetGame, loading } = useGame() || {};

    if (pathname === '/login') {
        return null;
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-amber-900/30 px-6 py-4 flex justify-between items-center">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                <h1 className="text-xl font-bold bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                    Csupaszív Kaland
                </h1>

                {/* Game Toolbar */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={saveGame}
                        disabled={loading}
                        className="px-3 py-1.5 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 text-xs font-medium rounded border border-amber-500/30 transition-all disabled:opacity-50"
                    >
                        Mentés
                    </button>
                    <button
                        onClick={loadGame}
                        disabled={loading}
                        className="px-3 py-1.5 bg-zinc-700/30 hover:bg-zinc-700/50 text-zinc-300 text-xs font-medium rounded border border-zinc-600/30 transition-all disabled:opacity-50"
                    >
                        Betöltés
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('Biztosan elölről kezded?')) {
                                resetGame();
                            }
                        }}
                        disabled={loading}
                        className="px-3 py-1.5 bg-zinc-700/30 hover:bg-zinc-700/50 text-zinc-400 text-xs font-medium rounded border border-zinc-600/30 transition-all disabled:opacity-50"
                    >
                        Újrakezdés
                    </button>
                </div>
            </div>

            <UserMenu />
        </header>
    );
}
