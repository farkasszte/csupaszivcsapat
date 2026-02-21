'use client';

import { StoryEngine } from '@/components/StoryEngine';
import StoryLog from '@/components/StoryLog';
import PlayerDashboard from '@/components/PlayerDashboard';
import GameMap from '@/components/GameMap';
import GameMenu from '@/components/GameMenu';
import GameLibrary from '@/components/GameLibrary';
import { useGame } from '@/context/GameContext';
import {
    RiBookOpenLine,
    RiGamepadLine,
    RiDashboardLine,
    RiMapLine,
    RiMenuLine,
    RiBookLine,
} from '@remixicon/react';

export default function Home() {
    const {
        showLog, setShowLog,
        showDashboard, setShowDashboard,
        showMap, setShowMap,
        showMenu, setShowMenu,
        showLibrary, setShowLibrary,
    } = useGame();

    const showPanel = showLog || showDashboard || showMap || showMenu || showLibrary;
    const activeTab = showMenu ? 'menu' : showLog ? 'log' : showDashboard ? 'dashboard' : showMap ? 'map' : showLibrary ? 'library' : null;

    const closeAll = () => {
        setShowLog(false);
        setShowDashboard(false);
        setShowMap(false);
        setShowMenu(false);
        setShowLibrary(false);
    };

    const tabCls = (key) =>
        `flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === key
            ? 'bg-amber-900/30 text-amber-200'
            : 'text-zinc-500 hover:text-zinc-300'
        }`;

    return (
        <div className="min-h-screen bg-zinc-950 text-orange-50/90 bg-[url('/cover/cover.jpg')] bg-cover bg-center bg-no-repeat bg-blend-multiply">
            <div className="absolute inset-0 bg-black/70 z-0 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-8">

                {/* Layout: side-by-side when panel open, single column otherwise */}
                <div className={showPanel ? 'grid lg:grid-cols-2 gap-6' : 'max-w-2xl mx-auto'}>

                    {/* Game panel — hidden on mobile when side panel is visible */}
                    <div className={showPanel ? 'hidden lg:block' : 'block'}>
                        <StoryEngine />
                    </div>

                    {/* Side panel */}
                    {showPanel && (
                        <div>
                            <div
                                className="lg:sticky lg:top-20 bg-zinc-900/60 backdrop-blur-xl rounded-xl border border-white/5 shadow-2xl overflow-hidden flex flex-col"
                                style={{ maxHeight: 'calc(100vh - 6rem)' }}
                            >
                                {/* Tab header */}
                                <div className="flex items-center px-3 py-2.5 border-b border-white/5 shrink-0 gap-0.5">
                                    <button onClick={() => setShowMenu(true)} className={tabCls('menu')}>
                                        <RiMenuLine size={13} /> Játék
                                    </button>

                                    <span className="text-zinc-700 text-xs px-1">|</span>

                                    <button onClick={() => setShowLog(true)} className={tabCls('log')}>
                                        <RiBookOpenLine size={13} /> Napló
                                    </button>

                                    <button onClick={() => setShowDashboard(true)} className={tabCls('dashboard')}>
                                        <RiDashboardLine size={13} /> Jutalmak
                                    </button>

                                    <button onClick={() => setShowMap(true)} className={tabCls('map')}>
                                        <RiMapLine size={13} /> Térkép
                                    </button>

                                    <button onClick={() => setShowLibrary(true)} className={tabCls('library')}>
                                        <RiBookLine size={13} /> Könyvtár
                                    </button>
                                </div>

                                {/* Panel content */}
                                <div className="overflow-y-auto flex-1 py-2">
                                    {activeTab === 'menu' && <GameMenu />}
                                    {activeTab === 'log' && <StoryLog />}
                                    {activeTab === 'dashboard' && <PlayerDashboard />}
                                    {activeTab === 'map' && <GameMap />}
                                    {activeTab === 'library' && <GameLibrary />}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile floating buttons */}
                <div className="fixed bottom-6 right-6 lg:hidden z-50 flex flex-col gap-2 items-end">
                    {showPanel ? (
                        <>
                            {/* Tab switcher row */}
                            <div className="flex gap-1.5 flex-wrap justify-end">
                                {[
                                    { key: 'menu', label: 'Menü', icon: <RiMenuLine size={14} />, action: () => setShowMenu(true) },
                                    { key: 'log', label: 'Napló', icon: <RiBookOpenLine size={14} />, action: () => setShowLog(true) },
                                    { key: 'dashboard', label: 'Jellemző', icon: <RiDashboardLine size={14} />, action: () => setShowDashboard(true) },
                                    { key: 'map', label: 'Térkép', icon: <RiMapLine size={14} />, action: () => setShowMap(true) },
                                    { key: 'library', label: 'Könyvtár', icon: <RiBookLine size={14} />, action: () => setShowLibrary(true) },
                                ].map(({ key, label, icon, action }) => (
                                    <button
                                        key={key}
                                        onClick={action}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold shadow-md transition-all border ${activeTab === key
                                            ? 'bg-amber-700/70 text-amber-100 border-amber-500/50'
                                            : 'bg-zinc-800/90 text-zinc-300 border-zinc-600/50'
                                            }`}
                                    >
                                        {icon} {label}
                                    </button>
                                ))}
                            </div>

                            {/* Close panel → back to game */}
                            <button
                                onClick={closeAll}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold shadow-lg transition-all border bg-orange-700/80 text-amber-100 border-orange-500/50 shadow-orange-900/40"
                            >
                                <RiGamepadLine size={16} /> Játék
                            </button>
                        </>
                    ) : (
                        /* Default: single "Menü" button to open the panel */
                        <button
                            onClick={() => setShowMenu(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold shadow-lg transition-all border bg-zinc-800/90 text-amber-200 border-zinc-600/50 shadow-black/40"
                        >
                            <RiMenuLine size={16} /> Menü
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
