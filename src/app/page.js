'use client';

import { StoryEngine } from '@/components/StoryEngine';
import dynamic from 'next/dynamic';
const StoryLog = dynamic(() => import('@/components/StoryLog'), { ssr: false });
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
            ? 'bg-white/50 text-[#3e2723] shadow-sm'
            : 'text-[#3e2723]/80 hover:text-[#3e2723] hover:bg-white/20'
        }`;

    return (
        <div className="fixed inset-0 overflow-hidden text-[#3e2723]">
            {/* Background layers */}

            {/* Content Wrapper - Strictly bound between header and bottom */}
            <div className="absolute top-[52px] lg:top-8 bottom-0 left-0 right-0 z-10 flex flex-col items-center justify-center p-4 lg:p-6 overflow-hidden">

                {/* Layout: side-by-side when panel open, single column otherwise */}
                <div
                    className={`w-full mx-auto flex justify-center items-center h-full relative ${showPanel ? 'max-w-[1400px] gap-4 flex-col lg:flex-row lg:max-h-[75vh]' : 'max-w-7xl max-h-[100vh] lg:max-h-[85vh]'}`}
                >
                    {/* Shared Desktop Header Row — fixed max-width */}
                    {showPanel && (
                        <div className="hidden lg:flex absolute -top-[50px] left-1/2 -translate-x-1/2 w-full max-w-[800px] items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-1200 z-50">
                            {/* Title + Hamburger (left) */}
                            <div className="flex items-center gap-3 shrink-0">
                                <h1 className="text-lg font-bold text-[#FDF5E6] drop-shadow-md bg-white/20 px-3 py-1 rounded-xl backdrop-blur-md border border-white/20 whitespace-nowrap">
                                    Csupaszív kalandok: A Homokhátság Hősei
                                </h1>
                                <button
                                    onClick={togglePanel}
                                    className="p-1.5 rounded-lg transition-all text-[#FDF5E6] hover:bg-white/40 bg-white/20 backdrop-blur-md shadow-sm border border-white/20 scale-90 hover:scale-100"
                                    title="Panel bezárása"
                                >
                                    <RiMenuLine size={18} />
                                </button>
                            </div>
                            {/* UserMenu (right) */}
                            <div className="flex-1 max-w-md ml-6">
                                <UserMenu />
                            </div>
                        </div>
                    )}

                    {/* Game panel — hidden on mobile when side panel is visible */}
                    <div className={`relative flex flex-col justify-center items-center w-full h-full ${showPanel ? 'hidden lg:flex flex-1 min-w-0' : ''}`}>
                        {/* Title & Hamburger — only when panel is CLOSED */}
                        {!showPanel && (
                            <div className="hidden lg:flex absolute top-2 left-4 w-auto items-center justify-center gap-4 animate-in fade-in duration-1000 z-50">
                                <h1 className="text-lg font-bold text-[#FDF5E6] drop-shadow-md bg-white/20 px-3 py-1 rounded-xl backdrop-blur-md border border-white/20">
                                    Csupaszív kalandok: A Homokhátság Hősei
                                </h1>
                                <button
                                    onClick={togglePanel}
                                    className="p-1.5 rounded-lg transition-all text-[#FDF5E6] hover:bg-white/40 bg-white/20 backdrop-blur-md shadow-sm border border-white/20 scale-90 hover:scale-100"
                                    title="Menü megnyitása"
                                >
                                    <RiMenuLine size={18} />
                                </button>
                            </div>
                        )}
                        <StoryEngine />
                    </div>

                    {/* Side panel */}
                    {showPanel && (
                        <div className="relative h-full flex flex-col justify-center items-center">
                            <div
                                className="h-full w-full max-w-[420px] sm:w-auto sm:max-w-none sm:aspect-9/16 lg:h-full lg:w-auto lg:max-w-none bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-2xl overflow-hidden flex flex-col"
                            >

                                {/* Tab header — desktop only; mobile uses bottom nav */}
                                <div className="hidden lg:flex items-center justify-center flex-wrap px-2 py-2 border-b border-[#3e2723]/10 shrink-0 gap-1">
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



                                 {/* Tab content */}
                                <div className="flex-1 min-h-0 flex flex-col overflow-y-auto no-scrollbar">
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
