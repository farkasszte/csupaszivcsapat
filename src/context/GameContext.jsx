'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import projectSettings from '../data/project_settings.json';
import { ArcScript } from '../logic/ArcScript';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    // Initialize State
    const [currentElementId, setCurrentElementId] = useState(projectSettings.startingElement);

    const [state, setState] = useState({
        visits: {}, // Map<elementId, count>
        variables: { score: 0 }, // Initialize global vars
    });

    const [history, setHistory] = useState([]); // For backtracking if needed

    const arcScript = new ArcScript(projectSettings);

    // Initial load
    useEffect(() => {
        // Register initial visit
        visitElement(projectSettings.startingElement);
    }, []);

    const visitElement = (id) => {
        setState(prev => {
            const newVisits = { ...prev.visits };
            newVisits[id] = (newVisits[id] || 0) + 1;

            return {
                ...prev,
                visits: newVisits
            };
        });
    };

    const navigateTo = (targetId) => {
        if (!targetId) return;

        // Resolve Jumper if needed
        let finalId = targetId;
        const jumper = projectSettings.jumpers[targetId];
        if (jumper) {
            finalId = jumper.elementId;
        }

        // Resolve Branch if we are navigating TO a branch
        const branch = projectSettings.branches[finalId];
        if (branch) {
            const connId = resolveBranch(finalId);
            if (connId) {
                const conn = projectSettings.connections[connId];
                if (conn) {
                    navigateTo(conn.targetid); // Recurse
                    return;
                }
            }
        }

        setHistory(prev => [...prev, currentElementId]);
        setCurrentElementId(finalId);
        visitElement(finalId);
    };

    const executeScript = (script) => {
        const tempState = { ...state, variables: { ...state.variables } };
        arcScript.executeScript(script, tempState);
        setState(prev => ({
            ...prev,
            variables: tempState.variables
        }));
    };

    const evaluate = (condition) => {
        return arcScript.evaluateCondition(condition, state, currentElementId);
    };

    const getAssetUrl = (assetId) => {
        const asset = projectSettings.assets[assetId];
        if (!asset) return null;
        const folder = asset.type === 'template-audio' ? 'Audio' : 'Images';
        return `/assets/${folder}/${asset.name}`;
    };

    const renderRichText = (html) => {
        return arcScript.renderRichText(html, state, currentElementId);
    };

    const parseRichText = (html) => {
        return arcScript.parseRichText(html, state, currentElementId);
    };

    const resolveBranch = (branchId) => {
        const branch = projectSettings.branches[branchId];
        if (!branch) return null;

        const ifCondId = branch.conditions?.ifCondition;
        if (ifCondId) {
            const ifCond = projectSettings.conditions[ifCondId];
            if (evaluate(ifCond.script)) {
                return ifCond.output;
            }
        }

        const elseCondId = branch.conditions?.elseCondition;
        if (elseCondId) {
            const elseCond = projectSettings.conditions[elseCondId];
            return elseCond.output;
        }

        return null;
    };

    const value = {
        project: projectSettings,
        currentElementId,
        state,
        navigateTo,
        executeScript,
        evaluate,
        getAssetUrl,
        renderRichText,
        parseRichText,
        resolveBranch
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};
