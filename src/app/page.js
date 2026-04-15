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
    RiSettings4Line,
    RiImageLine,
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
        showImages, setShowImages,
        togglePanel,
        currentElementId,
        getAssetUrl,
        colorFilter,
    } = useGame();

    // Helper for color filters inside page component
    const getColorFilterStyle = (filterId) => {
        switch (filterId) {
            case 'protanopia': return 'url(#protanopia-filter)';
            case 'deuteranopia': return 'url(#deuteranopia-filter)';
            case 'tritanopia': return 'url(#tritanopia-filter)';
            case 'grayscale': return 'grayscale(100%)';
            case 'vibrant': return 'saturate(150%)';
            default: return 'none';
        }
    };



    const showPanel = showLog || showDashboard || showMap || showMenu || showLibrary || showProfile || showImages;
    const activeTab = showMenu ? 'menu' : showLog ? 'log' : showDashboard ? 'dashboard' : showMap ? 'map' : showLibrary ? 'library' : showProfile ? 'profile' : showImages ? 'images' : null;



    const closeAll = () => {
        setShowLog(false);
        setShowDashboard(false);
        setShowMap(false);
        setShowMenu(false);
        setShowLibrary(false);
        setShowProfile(false);
        setShowImages(false);
    };



    const tabCls = (key) =>
        `flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === key
            ? 'bg-white/60 text-[#4F7942] shadow-sm'
            : 'text-[#4F7942]/80 hover:text-[#4F7942] hover:bg-white/40'
        }`;

    return (
        <div className="fixed inset-0 overflow-hidden text-[#3e2723]">
            {/* Background layers */}

            {/* Content Wrapper - Strictly bound between header and bottom */}
            <div className="absolute top-[52px] lg:top-0 bottom-0 left-0 right-0 z-10 flex flex-col items-center justify-center px-4 pt-10 pb-4 lg:px-6 lg:pt-14 lg:pb-6 overflow-hidden">

                {/* Layout: side-by-side when panel open, single column otherwise */}
                {/* Layout: side-by-side main container, panel as overlay */}
                <div
                    className={`w-full max-w-[1400px] mx-auto flex justify-center items-center h-full relative max-h-[min(80vh,750px)] lg:max-h-[min(90vh,900px)] transition-all duration-500`}
                >
                    {/* Shared Desktop Header Row — fixed max-width */}
                    <div className="hidden lg:flex absolute -top-12 left-0 w-full items-center justify-between animate-in fade-in duration-1200 px-2 z-50">
                        {/* Title + Hamburger (left) */}
                        <div className="flex items-center gap-4 shrink-0">
                            <h1 className="text-lg font-bold text-white whitespace-nowrap bg-white/20 px-3 py-1 rounded-xl backdrop-blur-md border border-white/20">
                                Csupaszív kalandok: A Homokhátság Hősei
                            </h1>
                            <button
                                onClick={togglePanel}
                                className="p-1.5 rounded-lg transition-all text-[#4F7942] bg-white/80 backdrop-blur-md scale-90 hover:scale-100 hover:bg-white/95 shadow-sm border border-[#4F7942]/20"
                                title="Panel bezárása"
                            >
                                <RiMenuLine size={18} />
                            </button>
                        </div>

                        {/* Tabs (Right) - always show top navigation full width */}
                        <div className="flex items-center gap-1 bg-white/60 backdrop-blur-xl p-1 rounded-xl border border-white/60 shadow-sm no-scrollbar scrollbar-hide ml-auto transition-opacity duration-300">
                            <button onClick={() => setShowImages(true)} className={tabCls('images')}>
                                <RiImageLine size={14} /> <span>Képek</span>
                            </button>
                            <div className="w-px h-4 bg-[#4F7942]/20 mx-1 shrink-0" />
                            <button onClick={() => setShowLog(true)} className={tabCls('log')}>
                                <RiBookOpenLine size={14} /> <span>Napló</span>
                            </button>
                            <button onClick={() => setShowDashboard(true)} className={tabCls('dashboard')}>
                                <RiDashboardLine size={14} /> <span>Pontok</span>
                            </button>
                            <button onClick={() => setShowMap(true)} className={tabCls('map')}>
                                <RiMapLine size={14} /> <span>Térkép</span>
                            </button>
                            <button onClick={() => setShowLibrary(true)} className={tabCls('library')}>
                                <RiBookLine size={14} /> <span>Könyvtár</span>
                            </button>
                            <div className="w-px h-4 bg-[#4F7942]/20 mx-1 shrink-0" />
                            <button onClick={() => setShowMenu(true)} className={tabCls('menu')}>
                                <RiSettings4Line size={14} /> <span>Beállítások</span>
                            </button>
                            <button onClick={() => setShowProfile(true)} className={tabCls('profile')}>
                                <RiUserLine size={14} /> <span>Profil</span>
                            </button>
                        </div>
                    </div>

                    {/* 2. Game panel — middle on desktop, main on mobile */}
                    <div className={`relative flex flex-col justify-center items-center w-full h-full`}>
                        <StoryEngine hideMedia={true} />
                    </div>

                    {/* 3. Side panel (Right) - Rendered as Overlay */}
                    {showPanel && (
                        <div className="absolute inset-0 z-50 flex lg:justify-end justify-center pointer-events-none">
                            <div
                                className="pointer-events-auto h-full w-full max-w-[420px] sm:w-auto sm:max-w-none sm:aspect-9/16 lg:h-full lg:w-[420px] lg:max-w-[420px] bg-white/60 backdrop-blur-2xl lg:rounded-l-2xl border-l border-white/40 shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-right-4 duration-500"
                            >





                                 {/* Tab content */}
                                <div className="flex-1 min-h-0 flex flex-col overflow-y-auto no-scrollbar">
                                    {activeTab === 'profile' && <ProfileView />}
                                    {activeTab === 'menu' && <GameMenu />}
                                    {activeTab === 'log' && <StoryLog />}
                                    {activeTab === 'dashboard' && <PlayerDashboard />}
                                    {activeTab === 'map' && <GameMap />}
                                    {activeTab === 'library' && <GameLibrary />}
                                    {activeTab === 'images' && (
                                        <div className="flex-1 min-h-0 flex flex-col justify-center p-4">
                                            {project?.elements?.[currentElementId]?.assets?.cover ? (
                                                <div className="relative group overflow-hidden rounded-xl h-full w-fit mx-auto transition-transform duration-700">
                                                    <img
                                                        src={getAssetUrl(project.elements[currentElementId].assets.cover.id)}
                                                        alt="Scene"
                                                        className="h-full w-auto object-contain transition-transform duration-700 block"
                                                        style={{ filter: typeof getColorFilterStyle === 'function' ? getColorFilterStyle(colorFilter) : 'none' }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="aspect-9/16 bg-zinc-800/40 rounded-lg border border-dashed border-white/10 flex items-center justify-center">
                                                    <span className="text-[10px] text-white/20 uppercase tracking-widest">Nincs kép</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
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
