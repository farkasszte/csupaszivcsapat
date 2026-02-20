'use client';

import { StoryEngine } from '@/components/StoryEngine';
import StoryLog from '@/components/StoryLog';
import { useGame } from '@/context/GameContext';
import { RiBookOpenLine, RiGamepadLine } from '@remixicon/react';

export default function Home() {
    const { showLog, setShowLog } = useGame();

    return (
        <div className="min-h-screen bg-zinc-950 text-orange-50/90 bg-[url('/cover/cover.jpg')] bg-cover bg-center bg-no-repeat bg-blend-multiply">
            <div className="absolute inset-0 bg-black/70 z-0 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8">

                {/* Layout: side-by-side when showLog, else single column */}
                <div className={showLog ? 'grid lg:grid-cols-[3fr_2fr] gap-6' : 'max-w-2xl mx-auto'}>

                    {/* Game panel — hidden on mobile when log is shown */}
                    <div className={showLog ? 'hidden lg:block' : 'block'}>
                        <StoryEngine />
                    </div>

                    {/* Log panel — only rendered when showLog is true */}
                    {showLog && (
                        <div>
                            <div className="lg:sticky lg:top-20 bg-zinc-900/60 backdrop-blur-xl rounded-xl border border-white/5 shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 6rem)' }}>
                                {/* Log header */}
                                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-amber-200">
                                        <RiBookOpenLine size={15} />
                                        Napló
                                    </div>
                                    <span className="text-xs text-zinc-600">Visszatekintés</span>
                                </div>
                                {/* Scrollable log entries */}
                                <div className="overflow-y-auto flex-1 py-2">
                                    <StoryLog />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile floating toggle (visible only on mobile) */}
                <div className="fixed bottom-6 right-6 lg:hidden z-50">
                    <button
                        onClick={() => setShowLog(!showLog)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold shadow-lg transition-all border ${showLog
                            ? 'bg-orange-700/80 text-amber-100 border-orange-500/50 shadow-orange-900/40'
                            : 'bg-zinc-800/90 text-amber-200 border-zinc-600/50 shadow-black/40'
                            }`}
                    >
                        {showLog ? (
                            <><RiGamepadLine size={16} /> Játék</>
                        ) : (
                            <><RiBookOpenLine size={16} /> Napló</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
