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
                        <div className="lg:contents">
                            <div
                                className="lg:sticky lg:top-24 bg-zinc-900/60 backdrop-blur-xl lg:rounded-xl border-0 lg:border border-white/5 shadow-2xl overflow-hidden flex flex-col h-[calc(100vh-4rem)] lg:h-[70vh]"
                            >

                                {/* Tab header — desktop only; mobile uses bottom nav */}
                                <div className="hidden lg:flex items-center px-3 py-2.5 border-b border-white/5 shrink-0 gap-0.5">
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
            </div>
            <Lightbox />
            <ColorFilters />
        </div>


    );
}
