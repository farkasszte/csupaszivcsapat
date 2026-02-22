'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

export const Choices = ({ hasImage, onHoverChange }) => {
    const { project, currentElementId, navigateTo, resolveBranch, renderRichText } = useGame();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const element = project.elements[currentElementId];

    if (!isMounted) return null;

    if (!element) return null;

    const outputs = element.outputs || [];

    const availableChoices = outputs.map(connId => {
        let connection = project.connections[connId];
        if (!connection) return null;

        let targetId = connection.targetid;
        let label = connection.label;

        // Branch Resolution
        if (connection.targetType === 'branches') {
            const connIdFromBranch = resolveBranch(targetId);
            if (connIdFromBranch) {
                const resolvedConn = project.connections[connIdFromBranch];
                if (resolvedConn) {
                    targetId = resolvedConn.targetid;
                    label = resolvedConn.label || label;
                }
            } else {
                return null;
            }
        }

        return {
            id: connId,
            targetId,
            label: label ? renderRichText(label) : 'Continue',
            // Strip HTML tags from rendered label for the story log
            rawLabel: label ? renderRichText(label).replace(/<[^>]*>/g, '').trim() : 'Continue',
        };
    }).filter(choice => choice !== null);

    return (
        <div className={`mt-4 ${hasImage ? 'flex flex-wrap gap-2 justify-center' : 'grid gap-4 mt-8'}`}>
            {availableChoices.length > 0 ? (
                availableChoices.map((choice, idx) => (
                    <button
                        key={`${choice.id}-${idx}`}
                        onClick={() => navigateTo(choice.targetId, choice.rawLabel)}
                        onMouseEnter={() => onHoverChange?.(true)}
                        onMouseLeave={() => onHoverChange?.(false)}
                        className={`text-amber-100 font-medium transition-all transform hover:scale-95 shadow-xl backdrop-blur-md border border-white/20 hover:border-amber-400/50 flex-none
                            ${hasImage
                                ? 'px-6 py-2 rounded-full bg-zinc-900/60 hover:bg-zinc-800/80 text-sm'
                                : 'w-full text-left px-6 py-4 rounded-lg bg-linear-to-r from-amber-900/40 to-orange-900/40 hover:from-amber-800/60 hover:to-orange-800/60'
                            }`}
                    >
                        {choice.label}
                    </button>
                ))
            ) : (
                <button
                    onClick={() => window.location.reload()}
                    className={`text-amber-100 font-medium transition-all transform hover:scale-95 shadow-xl backdrop-blur-md border border-white/20 flex-none
                        ${hasImage
                            ? 'px-6 py-2 rounded-full bg-red-950/60 hover:bg-red-900/80 text-sm'
                            : 'w-full text-center px-6 py-4 rounded-lg bg-linear-to-r from-red-900/40 to-orange-900/40 hover:from-red-800/60 hover:to-orange-800/60 border-orange-500/20'
                        }`}
                >
                    Restart Adventure
                </button>
            )}
        </div>
    );
};

