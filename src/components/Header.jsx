'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import UserMenu from '@/components/Auth/UserMenu';
import { RiMenuLine, RiBookOpenLine, RiDashboardLine, RiMapLine, RiBookLine } from '@remixicon/react';

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const {
        showLog, showDashboard, showMap, showMenu, showLibrary,
        setShowMenu, setShowLog, setShowDashboard, setShowMap, setShowLibrary,
        t
    } = useGame() || {};

    if (pathname === '/login') return null;

    const onProfile = pathname === '/profile';
    const showPanel = showLog || showDashboard || showMap || showMenu || showLibrary;
    const activeTab = showMenu ? 'menu' : showLog ? 'log' : showDashboard ? 'dashboard' : showMap ? 'map' : showLibrary ? 'library' : null;

    const togglePanel = () => {
        if (showPanel) {
            setShowLog(false);
            setShowDashboard(false);
            setShowMap(false);
            setShowMenu(false);
            setShowLibrary(false);
        } else {
            setShowMenu(true);
        }
    };

    // When on /profile, tab buttons navigate to / first, then open their panel
    const makeTabAction = (setFn) => () => {
        if (onProfile) {
            setFn(true);         // set state (closes others automatically)
            router.push('/');    // navigate away from profile
        } else {
            setFn();             // toggle normally
        }
    };

    const mobileTabs = [
        { key: 'menu', icon: <RiMenuLine size={20} />, label: t('settings'), action: makeTabAction(setShowMenu) },
        { key: 'log', icon: <RiBookOpenLine size={20} />, label: t('log'), action: makeTabAction(setShowLog) },
        { key: 'dashboard', icon: <RiDashboardLine size={20} />, label: t('dashboard'), action: makeTabAction(setShowDashboard) },
        { key: 'map', icon: <RiMapLine size={20} />, label: t('map'), action: makeTabAction(setShowMap) },
        { key: 'library', icon: <RiBookLine size={20} />, label: t('library'), action: makeTabAction(setShowLibrary) },
    ];

    return (
        <>
            {/* ── Mobile top header (removed as per request) ── */}

            {/* ── Desktop header (top bar) ── */}
            {/* Removed as per header decommissioning process */}

            {/* ── Mobile bottom nav bar ── */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-md border-t border-amber-900/30 flex items-stretch">
                {mobileTabs.map(({ key, icon, label, action }) => (
                    <button
                        key={key}
                        onClick={action}
                        className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold transition-colors ${!onProfile && activeTab === key
                            ? 'text-white'
                            : 'text-white hover:text-white'
                            }`}
                    >
                        <span className={`transition-colors ${!onProfile && activeTab === key ? 'text-white' : ''}`}>{icon}</span>
                        {label}
                    </button>
                ))}
                {/* User avatar/menu as last item */}
                <div className="flex-1 flex flex-col items-center justify-center py-2">
                    <UserMenu compact />
                </div>
            </nav>
        </>
    );
}
