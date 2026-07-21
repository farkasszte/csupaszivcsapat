'use client';

import { StoryEngine } from '@/components/StoryEngine';
import { useEffect } from 'react';
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
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import {
    RiBookOpenLine,
    RiDashboardLine,
    RiMapLine,
    RiMenuLine,
    RiBookLine,
    RiUserLine,
    RiSettings4Line,
    RiImageLine,
    RiHome4Line,
} from '@remixicon/react';



export default function Home() {
    const router = useRouter();
    const {
        currentElementId,
        project,
        isStarted,
        showLog, setShowLog,
        showDashboard, setShowDashboard,
        showMap, setShowMap,
        showMenu, setShowMenu,
        showLibrary, setShowLibrary,
        showProfile, setShowProfile,
        showImages, setShowImages,
        togglePanel,
        getAssetUrl,
        colorFilter,
        t, language, setLanguage
    } = useGame();

    useEffect(() => {
        if (isStarted === false) {
            router.push('/login');
        }
    }, [isStarted, router]);

    const showPanel = showLog || showDashboard || showMap || showMenu || showLibrary || showProfile || showImages;
    const activeTab = showMenu ? 'menu' : showLog ? 'log' : showDashboard ? 'dashboard' : showMap ? 'map' : showLibrary ? 'library' : showProfile ? 'profile' : showImages ? 'images' : null;

    const makeTabAction = (setter) => () => {
        Object.keys({ setShowLog, setShowDashboard, setShowMap, setShowMenu, setShowLibrary, setShowProfile, setShowImages }).forEach(key => {
            if (key !== setter.name) {
                const s = { setShowLog, setShowDashboard, setShowMap, setShowMenu, setShowLibrary, setShowProfile, setShowImages }[key];
                if (typeof s === 'function') s(false);
            }
        });
        setter(true);
    };

    // Force panel open on desktop if closed
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth >= 1024 && !showPanel) {
            setShowDashboard(true);
        }
    }, [showPanel, setShowDashboard]);

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

    const tabCls = (key) =>
        `flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === key
            ? 'bg-white/60 text-[#4F7942] shadow-sm'
            : 'text-[#4F7942]/80 hover:text-[#4F7942] hover:bg-white/40'
        }`;

    return (
        <div className="fixed inset-0 overflow-hidden text-surface">
            {/* Background layers */}

            {/* Content Wrapper - Strictly bound between header and bottom */}
            <div className="absolute top-0 lg:top-0 bottom-0 left-0 right-0 z-10 flex flex-col items-center justify-start lg:justify-center px-1 lg:px-6 pt-4 lg:pt-14 pb-16 lg:pb-6 overflow-y-auto lg:overflow-hidden no-scrollbar touch-pan-y">

                {/* Layout: side-by-side when panel open, single column otherwise */}
                <div
                    className={`w-full max-w-[1500px] mx-auto flex justify-center items-stretch gap-6 flex-col lg:flex-row min-h-full lg:h-full relative max-h-none lg:max-h-[min(90vh,900px)] transition-all duration-500`}
                >
                    {/* Shared Desktop Header Row — fixed max-width */}
                    <div className="hidden lg:flex absolute -top-12 left-0 w-full items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-1200 px-2">
                        {/* Title + Hamburger (left) */}
                        <div className="flex items-center gap-4 shrink-0">
                            <h1 className="text-lg font-bold text-[#4F7942] whitespace-nowrap bg-white/20 px-3 py-1 rounded-xl backdrop-blur-md border border-white/20">
                                {t('game_title')}
                            </h1>
                        </div>

                        {/* Tabs (Right) */}
                        <div className="flex items-center gap-1 bg-white/60 backdrop-blur-xl p-1 rounded-xl border border-white/60 shadow-sm no-scrollbar scrollbar-hide ml-auto">
                            <button onClick={() => setShowImages(true)} className={tabCls('images')}>
                                <RiImageLine size={14} /> <span>{t('images')}</span>
                            </button>
                            <div className="w-px h-4 bg-[#4F7942]/20 mx-1 shrink-0" />
                            <button onClick={() => setShowLog(true)} className={tabCls('log')}>
                                <RiBookOpenLine size={14} /> <span>{t('log')}</span>
                            </button>
                            <button onClick={() => setShowDashboard(true)} className={tabCls('dashboard')}>
                                <RiDashboardLine size={14} /> <span>{t('dashboard')}</span>
                            </button>
                            <button onClick={() => setShowMap(true)} className={tabCls('map')}>
                                <RiMapLine size={14} /> <span>{t('map')}</span>
                            </button>
                            <button onClick={() => setShowLibrary(true)} className={tabCls('library')}>
                                <RiBookLine size={14} /> <span>{t('library')}</span>
                            </button>
                            <div className="w-px h-4 bg-[#4F7942]/20 mx-1 shrink-0" />
                            <button onClick={() => setShowMenu(true)} className={tabCls('menu')}>
                                <RiSettings4Line size={14} /> <span>{t('settings')}</span>
                            </button>
                            <button onClick={() => setShowProfile(true)} className={tabCls('profile')}>
                                <RiUserLine size={14} /> <span>{t('profile')}</span>
                            </button>
                        </div>
                    </div>

                    {/* 2. Game panel — middle on desktop, main on mobile */}
                    <div className={`relative flex flex-col justify-center items-stretch ${showPanel ? 'hidden lg:flex h-full flex-1' : 'flex w-full h-full'}`}>
                        {/* Title & Hamburger — only when panel is CLOSED */}
                        {!showPanel && (
                            <div className="hidden lg:flex absolute top-2 left-4 w-auto items-center justify-center gap-4 animate-in fade-in duration-1000 z-50">
                                <h1 className="text-lg font-bold text-white drop-shadow-md bg-white/20 px-3 py-1 rounded-xl backdrop-blur-md border border-white/20">
                                    {t('game_title')}
                                </h1>
                            </div>
                        )}
                        <StoryEngine />
                    </div>

                    {/* 3. Side panel (Right) */}
                    {(showPanel || true) && (
                        <div className={`relative h-full flex flex-col justify-center items-center ${!showPanel ? 'hidden lg:flex' : ''}`}>
                            <div
                                className="h-full w-full max-w-[420px] sm:w-auto sm:max-w-none sm:aspect-9/16 lg:h-full lg:w-auto lg:max-w-none bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-2xl overflow-hidden flex flex-col"
                            >





                                {/* Tab content */}
                                <div className="flex-1 min-h-0 flex flex-col overflow-y-auto no-scrollbar touch-pan-y overscroll-contain">
                                    {activeTab === 'profile' && <ProfileView />}
                                    {activeTab === 'menu' && <GameMenu />}
                                    {activeTab === 'log' && <StoryLog />}
                                    {activeTab === 'dashboard' && <PlayerDashboard />}
                                    {activeTab === 'map' && <GameMap />}
                                    {activeTab === 'library' && <GameLibrary />}
                                    {activeTab === 'images' && (() => {
                                        const element = project?.elements?.[currentElementId];
                                        const coverUrl = element?.assets?.cover ? getAssetUrl(element.assets.cover.id) : null;
                                        let videoUrl = null;

                                        if (element?.components) {
                                            element.components.forEach(compId => {
                                                const comp = project.components?.[compId];
                                                if (comp?.attributes?.videoUrl) {
                                                    videoUrl = comp.attributes.videoUrl;
                                                }
                                            });
                                        }

                                        return (
                                            <div className="flex-1 min-h-0 flex flex-col bg-zinc-900 shadow-inner">
                                                {videoUrl ? (
                                                    <div className="relative group w-full h-full transition-transform duration-700">
                                                        <video
                                                            src={videoUrl}
                                                            autoPlay loop muted playsInline
                                                            className="w-full h-full object-cover transition-transform duration-700 block"
                                                            style={{ filter: getColorFilterStyle(colorFilter) }}
                                                        />
                                                    </div>
                                                ) : coverUrl ? (
                                                    <div className="relative group w-full h-full transition-transform duration-700">
                                                        <img
                                                            src={coverUrl}
                                                            alt="Scene"
                                                            className="w-full h-full object-cover transition-transform duration-700 block"
                                                            style={{ filter: getColorFilterStyle(colorFilter) }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full bg-zinc-800/40 border border-dashed border-white/10 flex items-center justify-center">
                                                        <span className="text-[10px] text-white/20 uppercase tracking-widest">Nincs kép</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
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
