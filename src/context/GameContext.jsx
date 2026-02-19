'use client';

import React, { createContext, useContext, useEffect } from 'react';
import projectSettings from '../data/project_settings.json';
import { useGameStore } from '../store/useGameStore';
import { ArcScript } from '../logic/ArcScript';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

const arcScript = new ArcScript(projectSettings);

export const GameProvider = ({ children }) => {
    const store = useGameStore();

    // Initial load - ensuring starting element is visited if no state
    useEffect(() => {
        if (Object.keys(store.visits).length === 0) {
            store.visitElement(projectSettings.startingElement);
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

    const value = {
        project: projectSettings,
        currentElementId: store.currentElementId,
        state: { visits: store.visits, variables: store.variables },
        loading: store.loading,
        error: store.error,
        message: store.message,
        navigateTo: store.navigateTo,
        executeScript: store.executeScript,
        evaluate: store.evaluate,
        saveGame: store.saveGame,
        loadGame: store.loadGame,
        resetGame: store.resetGame,
        getAssetUrl,
        renderRichText,
        parseRichText,
        resolveBranch: store.resolveBranch
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};
