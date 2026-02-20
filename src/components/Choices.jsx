'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

export const Choices = () => {
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
        <div className="mt-8 grid gap-4">
            {availableChoices.length > 0 ? (
                availableChoices.map((choice, idx) => (
                    <button
                        key={`${choice.id}-${idx}`}
                        onClick={() => navigateTo(choice.targetId, choice.rawLabel)}
                        className="w-full text-left px-6 py-4 bg-linear-to-r from-amber-900/40 to-orange-900/40 hover:from-amber-800/60 hover:to-orange-800/60 rounded-lg text-amber-100 font-medium transition-all transform hover:scale-[1.02] shadow-lg border border-amber-500/20 hover:border-amber-400/40 backdrop-blur-sm"
                    >
                        {choice.label}
                    </button>
                ))
            ) : (
                <button
                    onClick={() => window.location.reload()}
                    className="w-full text-center px-6 py-4 bg-linear-to-r from-red-900/40 to-orange-900/40 hover:from-red-800/60 hover:to-orange-800/60 rounded-lg text-amber-100 font-medium transition-all transform hover:scale-[1.02] shadow-lg border border-orange-500/20 hover:border-orange-400/40 backdrop-blur-sm"
                >
                    Restart Adventure
                </button>
            )}
        </div>
    );
};
