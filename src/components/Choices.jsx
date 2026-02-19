'use client';

import React from 'react';
import { useGame } from '../context/GameContext';

export const Choices = () => {
    const { project, currentElementId, navigateTo, resolveBranch, renderRichText } = useGame();
    const element = project.elements[currentElementId];

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
            label: label ? renderRichText(label) : 'Continue'
        };
    }).filter(choice => choice !== null);

    return (
        <div className="mt-8 grid gap-4">
            {availableChoices.length > 0 ? (
                availableChoices.map((choice, idx) => (
                    <button
                        key={`${choice.id}-${idx}`}
                        onClick={() => navigateTo(choice.targetId)}
                        className="w-full text-left px-6 py-4 bg-linear-to-r from-blue-900/50 to-indigo-900/50 hover:from-blue-800 hover:to-indigo-800 rounded-lg text-white font-medium transition-all transform hover:scale-[1.02] shadow-lg border border-white/10 hover:border-white/30 backdrop-blur-sm"
                    >
                        {choice.label}
                    </button>
                ))
            ) : (
                <button
                    onClick={() => window.location.reload()}
                    className="w-full text-center px-6 py-4 bg-linear-to-r from-red-900/50 to-orange-900/50 hover:from-red-800 hover:to-orange-800 rounded-lg text-white font-medium transition-all transform hover:scale-[1.02] shadow-lg border border-white/10 hover:border-white/30 backdrop-blur-sm"
                >
                    Restart Adventure
                </button>
            )}
        </div>
    );
};
