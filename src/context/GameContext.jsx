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
    const [lightboxImage, setLightboxImage] = useState(null);
    const [typewriterSpeed, setTypewriterSpeed] = useState(30);
    const [transitionsEnabled, setTransitionsEnabled] = useState(true);
    const [volume, setVolume] = useState(0.5);



    const [isMuted, setIsMuted] = useState(false);
    const [colorFilter, setColorFilter] = useState('none');



    const toggleLog = (val) => {
        const next = val !== undefined ? val : !showLog;
        setShowLog(next);
        if (next) { setShowDashboard(false); setShowMap(false); setShowMenu(false); setShowLibrary(false); }
    };



    const toggleDashboard = (val) => {
        const next = val !== undefined ? val : !showDashboard;
        setShowDashboard(next);
        if (next) { setShowLog(false); setShowMap(false); setShowMenu(false); setShowLibrary(false); }
    };



    const toggleMap = (val) => {
        const next = val !== undefined ? val : !showMap;
        setShowMap(next);
        if (next) { setShowLog(false); setShowDashboard(false); setShowMenu(false); setShowLibrary(false); }
    };



    const toggleMenu = (val) => {
        const next = val !== undefined ? val : !showMenu;
        setShowMenu(next);
        if (next) { setShowLog(false); setShowDashboard(false); setShowMap(false); setShowLibrary(false); }
    };



    const toggleLibrary = (val) => {
        const next = val !== undefined ? val : !showLibrary;
        setShowLibrary(next);
        if (next) { setShowLog(false); setShowDashboard(false); setShowMap(false); setShowMenu(false); }
    };



    const openLightbox = (url) => setLightboxImage(url);
    const closeLightbox = () => setLightboxImage(null);

    const toggleMute = () => setIsMuted(prev => !prev);



    // Initial load - ensuring starting element is visited if no state
    useEffect(() => {
        if (Object.keys(store.visits).length === 0) {
            store.visitElement(projectSettings.startingElement);
            store.initStoryLog();
        } else if (store.storyLog.length === 0) {
            store.initStoryLog();
        }
    }, []);

    const getAssetUrl = (assetId) => {
        const asset = projectSettings.assets[assetId];
        if (!asset) return null;
        const folder = asset.type === 'template-audio' ? 'Audio' : 'Images';
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
        typewriterSpeed,
        setTypewriterSpeed,
        transitionsEnabled,
        setTransitionsEnabled,
        volume,
        setVolume,
        navigateTo: store.navigateTo,





        executeScript: store.executeScript,
        evaluate: store.evaluate,
        saveGame: store.saveGame,
        loadGame: store.loadGame,
        resetGame: store.resetGame,
        getAssetUrl,
        renderRichText,
        parseRichText,
        parseRichTextReadOnly,
        resolveBranch: store.resolveBranch,
        lightboxImage,
        openLightbox,
        closeLightbox,
        isMuted,
        toggleMute,
        colorFilter,
        setColorFilter
    };



    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};
