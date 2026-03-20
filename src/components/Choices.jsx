'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

export const Choices = ({ hasImage, onHoverChange }) => {
    const { project, currentElementId, navigateTo, resolveBranch, renderRichText, resetGame } = useGame();
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
        <div className={`mt-4 ${hasImage ? 'flex flex-wrap gap-2 justify-center' : 'grid gap-4 mt-2'}`}>
            {availableChoices.length > 0 ? (
                availableChoices.map((choice, idx) => (
                    <button
                        key={`${choice.id}-${idx}`}
                        onClick={() => navigateTo(choice.targetId, choice.rawLabel)}
                        onMouseEnter={() => onHoverChange?.(true)}
                        onMouseLeave={() => onHoverChange?.(false)}
                        className={`text-[#FDF5E6] text-base italic transition-all transform hover:scale-102 shadow-xl backdrop-blur-md border border-white/20 hover:border-amber-400/50 whitespace-normal max-w-full
                            ${hasImage
                                ? 'px-2 py-2 rounded-full bg-white/40 hover:bg-white/60 text-sm'
                                : 'w-full text-left px-4 py-4 rounded-lg bg-linear-to-r from-white/40 to-white/20 hover:from-white/60 hover:to-white/40'
                            }`}
                    >
                        {choice.label}
                    </button>
                ))
            ) : (
                <button
                    onClick={() => resetGame?.()}
                    onMouseEnter={() => onHoverChange?.(true)}
                    onMouseLeave={() => onHoverChange?.(false)}
                    className={`text-red-900 font-semibold text-xs transition-all transform hover:scale-95 active:scale-90 shadow-xl backdrop-blur-md border border-red-500/30 whitespace-normal pointer-events-auto max-w-full
                        ${hasImage
                            ? 'px-6 py-2 rounded-full bg-red-100/80 hover:bg-red-200/90 text-sm'
                            : 'w-full text-center px-6 py-4 rounded-lg bg-linear-to-r from-red-100/80 to-red-200/80 hover:from-red-200/80 hover:to-red-300/80'
                        }`}
                >
                    Kaland újrakezdése
                </button>
            )}
        </div>
    );
};

