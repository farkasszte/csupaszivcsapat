'use client';

import { StoryEngine } from '@/components/StoryEngine';
import StoryLog from '@/components/StoryLog';
import PlayerDashboard from '@/components/PlayerDashboard';
import GameMap from '@/components/GameMap';
import GameMenu from '@/components/GameMenu';
import GameLibrary from '@/components/GameLibrary';
import { useGame } from '@/context/GameContext';


import { Lightbox } from '@/components/Lightbox';
import { ColorFilters } from '@/components/ColorFilters';


import {
    RiBookOpenLine,
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
        <div className="fixed inset-0 overflow-hidden bg-zinc-950 text-orange-50/90">
            {/* Background layers */}
            <div className="hidden lg:block absolute inset-0 top-[64px] bg-[url('/backgrounds/old-book.png')] bg-cover bg-center bg-no-repeat -z-10" />
            <div className="hidden lg:block absolute inset-0 top-[64px] bg-black/40 pointer-events-none -z-10" />

            {/* Content Wrapper - Strictly bound between header and bottom */}
            <div className="absolute top-[52px] lg:top-[64px] bottom-0 left-0 right-0 z-10 flex flex-col items-center justify-center p-4 lg:p-6 overflow-hidden">
                {/* Layout: side-by-side when panel open, single column otherwise */}
                <div
                    className={`w-full max-w-6xl mx-auto flex justify-center items-center gap-6 flex-col lg:flex-row h-full`}
                    style={{ maxHeight: 'min(80vh, 750px)' }}
                >

                    {/* Game panel — hidden on mobile when side panel is visible */}
                    <div className={`flex flex-col justify-center items-center ${showPanel ? 'hidden lg:flex h-full' : 'flex w-full h-full'}`}>
                        <StoryEngine />
                    </div>

                    {/* Side panel */}
                    {showPanel && (
                        <div className="h-full flex flex-col justify-center items-center">
                            <div
                                className="h-full w-auto aspect-9/16 max-w-none bg-zinc-900/60 backdrop-blur-xl rounded-xl border border-white/5 shadow-2xl overflow-hidden flex flex-col"
                            >

                                {/* Tab header — desktop only; mobile uses bottom nav */}
                                <div className="hidden lg:flex items-center justify-center flex-wrap px-2 py-2 border-b border-white/5 shrink-0 gap-1">
                                    <button onClick={() => setShowMenu(true)} className={tabCls('menu')}>
                                        <RiMenuLine size={13} /> Játék
                                    </button>

                                    <button onClick={() => setShowLog(true)} className={tabCls('log')}>
                                        <RiBookOpenLine size={13} /> Napló
                                    </button>

                                    <button onClick={() => setShowDashboard(true)} className={tabCls('dashboard')}>
                                        <RiDashboardLine size={13} /> Pontok
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
            </div >
            <Lightbox />
            <ColorFilters />
        </div >
    );
}
