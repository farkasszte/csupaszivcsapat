'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import projectSettings from '../data/project_settings.json';
import { useGameStore } from '../store/useGameStore';
import { ArcScript } from '../logic/ArcScript';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

const arcScript = new ArcScript(projectSettings);

export const GameProvider = ({ children }) => {
    const store = useGameStore();
    const [showLog, setShowLog] = useState(false);
    const [showDashboard, setShowDashboard] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showLibrary, setShowLibrary] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showImages, setShowImages] = useState(false);
    const [lastActiveTab, setLastActiveTab] = useState('menu');
    const [lightboxImage, setLightboxImage] = useState(null);
    const [selectedMapLocation, setSelectedMapLocation] = useState(null);




    const toggleLog = (val) => {
        const next = val !== undefined ? val : !showLog;
        setShowLog(next);
        if (next) {
            setLastActiveTab('log');
            setShowDashboard(false); setShowMap(false); setShowMenu(false); setShowLibrary(false); setShowProfile(false); setShowImages(false);
        }
    };



    const toggleDashboard = (val) => {
        const next = val !== undefined ? val : !showDashboard;
        setShowDashboard(next);
        if (next) {
            setLastActiveTab('dashboard');
            setShowLog(false); setShowMap(false); setShowMenu(false); setShowLibrary(false); setShowProfile(false); setShowImages(false);
        }
    };



    const toggleMap = (val) => {
        const next = val !== undefined ? val : !showMap;
        setShowMap(next);
        if (next) {
            setLastActiveTab('map');
            setShowLog(false); setShowDashboard(false); setShowMenu(false); setShowLibrary(false); setShowProfile(false); setShowImages(false);
        }
    };



    const toggleMenu = (val) => {
        const next = val !== undefined ? val : !showMenu;
        setShowMenu(next);
        if (next) {
            setLastActiveTab('menu');
            setShowLog(false); setShowDashboard(false); setShowMap(false); setShowLibrary(false); setShowProfile(false); setShowImages(false);
        }
    };



    const toggleLibrary = (val) => {
        const next = val !== undefined ? val : !showLibrary;
        setShowLibrary(next);
        if (next) {
            setLastActiveTab('library');
            setShowLog(false); setShowDashboard(false); setShowMap(false); setShowMenu(false); setShowProfile(false); setShowImages(false);
        }
    };

    const toggleProfile = (val) => {
        const next = val !== undefined ? val : !showProfile;
        setShowProfile(next);
        if (next) {
            setLastActiveTab('profile');
            setShowLog(false); setShowDashboard(false); setShowMap(false); setShowMenu(false); setShowLibrary(false); setShowImages(false);
        }
    };

    const toggleImages = (val) => {
        const next = val !== undefined ? val : !showImages;
        setShowImages(next);
        if (next) {
            setLastActiveTab('images');
            setShowLog(false); setShowDashboard(false); setShowMap(false); setShowMenu(false); setShowLibrary(false); setShowProfile(false);
        }
    };

    const togglePanel = () => {
        const isOpen = showLog || showDashboard || showMap || showMenu || showLibrary || showProfile || showImages;
        if (isOpen) {
            setShowLog(false); setShowDashboard(false); setShowMap(false); setShowMenu(false); setShowLibrary(false); setShowProfile(false); setShowImages(false);
        } else {
            if (lastActiveTab === 'log') toggleLog(true);
            else if (lastActiveTab === 'dashboard') toggleDashboard(true);
            else if (lastActiveTab === 'map') toggleMap(true);
            else if (lastActiveTab === 'library') toggleLibrary(true);
            else if (lastActiveTab === 'profile') toggleProfile(true);
            else if (lastActiveTab === 'images') toggleImages(true);
            else toggleMenu(true);
        }
    };



    const openLightbox = (url) => setLightboxImage(url);
    const closeLightbox = () => setLightboxImage(null);

    const toggleMute = () => store.setIsMuted(!store.isMuted);

    // Initial load and Auto-Save listeners
    useEffect(() => {
        const init = async () => {
            // Try to load saved state from Supabase first
            await store.autoLoad();

            // Read fresh state after autoLoad (React hook snapshot is stale here)
            const fresh = useGameStore.getState();
            if (Object.keys(fresh.visits).length === 0) {
                fresh.visitElement(projectSettings.startingElement);
                fresh.initStoryLog();
            } else if (fresh.storyLog.length === 0) {
                fresh.initStoryLog();
            }
        };
        init();

        // Auto-save on visibility change (tab switch, minimize)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                store.saveGame(true);
            }
        };

        // Auto-save on page close / refresh
        const handleBeforeUnload = () => {
            store.saveGame(true);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);


    const getAssetUrl = (assetId) => {
        if (!assetId) return null;
        const asset = projectSettings.assets[assetId];
        if (!asset) {
            console.warn(`Asset not found: ${assetId}`);
            return null;
        }
        const type = asset.type || '';
        // Handle both 'template-audio' and generic 'audio' types
        const isAudio = type.toLowerCase().includes('audio');
        const folder = isAudio ? 'Audio' : 'Images';
        return `/assets/${folder}/${asset.name}`;
    };

    const renderRichText = (html) => {
        return arcScript.renderRichText(html, { visits: store.visits, variables: store.variables }, store.currentElementId);
    };

    const parseRichText = (html) => {
        return arcScript.parseRichText(html, { visits: store.visits, variables: store.variables }, store.currentElementId);
    };

    // Read-only version for the story log — never executes scripts, just renders text
    const parseRichTextReadOnly = (html, elementId) => {
        return arcScript.parseRichText(
            html,
            { visits: store.visits, variables: { ...store.variables } },
            elementId ?? store.currentElementId,
            { readOnly: true }
        );
    };

    const value = {
        project: projectSettings,
        currentElementId: store.currentElementId,
        state: { visits: store.visits, variables: store.variables },
        loading: store.loading,
        error: store.error,
        message: store.message,
        storyLog: store.storyLog,
        discoveredComponents: store.discoveredComponents,
        recentDiscoveries: store.recentDiscoveries,
        clearRecentDiscovery: store.clearRecentDiscovery,
        showLog,

        setShowLog: toggleLog,
        showDashboard,
        setShowDashboard: toggleDashboard,
        showMap,
        setShowMap: toggleMap,
        showMenu,
        setShowMenu: toggleMenu,
        showLibrary,
        setShowLibrary: toggleLibrary,
        showProfile,
        setShowProfile: toggleProfile,
        showImages,
        setShowImages: toggleImages,
        togglePanel,
        selectedMapLocation,
        setSelectedMapLocation,
        typewriterSpeed: store.typewriterSpeed,
        setTypewriterSpeed: store.setTypewriterSpeed,
        transitionsEnabled: store.transitionsEnabled,
        setTransitionsEnabled: store.setTransitionsEnabled,
        volume: store.volume,
        setVolume: store.setVolume,
        navigateTo: store.navigateTo,






        executeScript: store.executeScript,
        evaluate: store.evaluate,
        saveGame: store.saveGame,
        loadGame: store.loadGame,
        resetGame: store.resetGame,
        clearMessage: store.clearMessage,
        getAssetUrl,

        renderRichText,
        parseRichText,
        parseRichTextReadOnly,
        resolveBranch: store.resolveBranch,
        lightboxImage,
        openLightbox,
        closeLightbox,
        isMuted: store.isMuted,
        toggleMute,
        colorFilter: store.colorFilter,
        setColorFilter: store.setColorFilter
    };




    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};
