'use client';

import { StoryEngine } from '@/components/StoryEngine';
import StoryLog from '@/components/StoryLog';
import PlayerDashboard from '@/components/PlayerDashboard';
import GameMap from '@/components/GameMap';
import GameMenu from '@/components/GameMenu';
import GameLibrary from '@/components/GameLibrary';
import ProfileView from '@/components/ProfileView';
import { useGame } from '@/context/GameContext';


import { Lightbox } from '@/components/Lightbox';
import { ColorFilters } from '@/components/ColorFilters';
import UserMenu from '@/components/Auth/UserMenu';


import {
    RiBookOpenLine,
    RiDashboardLine,
    RiMapLine,
    RiMenuLine,
    RiBookLine,
    RiUserLine,
} from '@remixicon/react';



export default function Home() {
    const {
        project,
        showLog, setShowLog,
        showDashboard, setShowDashboard,
        showMap, setShowMap,
        showMenu, setShowMenu,
        showLibrary, setShowLibrary,
        showProfile, setShowProfile,
        togglePanel,
    } = useGame();



    const showPanel = showLog || showDashboard || showMap || showMenu || showLibrary || showProfile;
    const activeTab = showMenu ? 'menu' : showLog ? 'log' : showDashboard ? 'dashboard' : showMap ? 'map' : showLibrary ? 'library' : showProfile ? 'profile' : null;



    const closeAll = () => {
        setShowLog(false);
        setShowDashboard(false);
        setShowMap(false);
        setShowMenu(false);
        setShowLibrary(false);
        setShowProfile(false);
    };



    const tabCls = (key) =>
        `flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === key
            ? 'bg-amber-900/30 text-amber-200'
            : 'text-zinc-500 hover:text-zinc-300'
        }`;

    return (
        <div className="fixed inset-0 overflow-hidden bg-zinc-950 text-orange-50/90">
            {/* Background layers */}
            <div className="hidden lg:block absolute inset-0 bg-[url('/backgrounds/old-book.webp')] bg-cover bg-center bg-no-repeat -z-10" />
            <div className="hidden lg:block absolute inset-0 bg-black/40 pointer-events-none -z-10" />

            {/* Content Wrapper - Strictly bound between header and bottom */}
            <div className="absolute top-[52px] lg:top-0 bottom-0 left-0 right-0 z-10 flex flex-col items-center justify-center p-4 lg:p-6 overflow-hidden">

                {/* Layout: side-by-side when panel open, single column otherwise */}
                <div
                    className={`w-full max-w-6xl mx-auto flex justify-center items-center gap-6 flex-col lg:flex-row h-full`}
                    style={{ maxHeight: 'min(80vh, 750px)' }}
                >

                    {/* Game panel — hidden on mobile when side panel is visible */}
                    <div className={`relative flex flex-col justify-center items-center ${showPanel ? 'hidden lg:flex h-full' : 'flex w-full h-full'}`}>
                        {/* Title - Absolutely positioned above the panel so it doesn't push it down */}
                        {/* Title & Hamburger - Absolutely positioned above the panel */}
                        <div className="hidden lg:flex absolute -top-10 left-1/2 -translate-x-1/2 w-full items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-1200">
                            <h1 className="text-lg font-bold bg-linear-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                                Csupaszív kalandok: A Homokhátság Hősei
                            </h1>
                            <button
                                onClick={togglePanel}
                                className={`p-1.5 rounded-lg transition-all ${showPanel ? 'text-amber-400 bg-amber-400/10' : 'text-zinc-500 hover:text-amber-200 hover:bg-zinc-800/20'} scale-90 hover:scale-100`}
                                title={showPanel ? "Panel bezárása" : "Menü megnyitása"}
                            >
                                <RiMenuLine size={18} />
                            </button>
                        </div>
                        <StoryEngine />
                    </div>

                    {/* Side panel */}
                    {showPanel && (
                        <div className="relative h-full flex flex-col justify-center items-center">
                            {/* User Menu - Absolutely positioned above the side panel - right aligned */}
                            <div className="hidden lg:block absolute -top-11 right-0 animate-in fade-in slide-in-from-bottom-2 duration-1200 delay-150">
                                <UserMenu />
                            </div>
                            <div
                                className="h-full w-auto aspect-9/16 max-w-none bg-zinc-900/60 backdrop-blur-xl rounded-xl border border-white/5 shadow-2xl overflow-hidden flex flex-col"
                            >

                                {/* Tab header — desktop only; mobile uses bottom nav */}
                                <div className="hidden lg:flex items-center justify-center flex-wrap px-2 py-2 border-b border-white/5 shrink-0 gap-1">
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
                                    {activeTab === 'profile' && <ProfileView />}
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
