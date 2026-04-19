'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { storyTranslations } from '../data/story_translations';
import { FinaleActions } from './FinaleActions';

export const Choices = ({ hasImage, onHoverChange }) => {
    const { 
        project, 
        currentElementId, 
        navigateTo, 
        resolveTarget, 
        renderRichText, 
        resetGame,
        setShowImages,
        language,
        t
    } = useGame();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const element = project.elements[currentElementId];

    if (!isMounted) return null;

    if (!element) return null;

    if (currentElementId === '3b3ba9f9-5559-48e5-bf9e-04e5c16493c1') {
        return <FinaleActions />;
    }

    const outputs = element.outputs || [];

    const availableChoices = outputs.map(connId => {
        let connection = project.connections[connId];
        if (!connection) return null;

        const { id: targetId, label: resolvedLabel } = resolveTarget(connection.targetid, connection.label);
        if (!targetId) return null;

        const finalLabel = resolvedLabel || 'Tovább';
        let displayLabel = finalLabel;

        // Apply localization override
        if (language === 'en' && storyTranslations[connId]) {
            displayLabel = storyTranslations[connId].label || finalLabel;
        } else if (language === 'en' && finalLabel === 'Tovább') {
            displayLabel = 'Continue';
        } else if (language && language.startsWith('sr') && storyTranslations[language]?.[connId]) {
            displayLabel = storyTranslations[language][connId].label || finalLabel;
        } else if (language === 'sr-latn' && (finalLabel === 'Tovább' || finalLabel === 'Continue')) {
            displayLabel = 'Dalje';
        } else if (language === 'sr-cyrl' && (finalLabel === 'Tovább' || finalLabel === 'Continue')) {
            displayLabel = 'Даље';
        }

        const rendered = renderRichText(displayLabel);

        return {
            id: connId,
            targetId,
            label: rendered,
            // Strip HTML tags from rendered label for the story log
            rawLabel: rendered.replace(/<[^>]*>/g, '').trim(),
        };
    }).filter(choice => choice !== null);

    // Deduplicate by label to avoid multiple identical "Tovább" buttons
    const uniqueChoices = [];
    const seenLabels = new Set();
    for (const choice of availableChoices) {
        if (!seenLabels.has(choice.rawLabel)) {
            uniqueChoices.push(choice);
            seenLabels.add(choice.rawLabel);
        }
    }

    return (
        <div className={`mt-4 ${hasImage ? 'flex flex-wrap gap-2 justify-center' : 'grid gap-4 mt-2'}`}>
            {uniqueChoices.length > 0 ? (
                uniqueChoices.map((choice, idx) => (
                    <button
                        key={`${choice.id}-${idx}`}
                        onClick={() => {
                            navigateTo(choice.targetId, choice.rawLabel);
                            if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
                                setShowImages(true);
                            }
                        }}
                        onMouseEnter={() => onHoverChange?.(true)}
                        onMouseLeave={() => onHoverChange?.(false)}
                        className={`text-surface font-medium text-base italic transition-all transform hover:scale-102 shadow-xl backdrop-blur-md border border-white/20 hover:border-[#4F7942]/50 whitespace-normal max-w-full
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
                    {t('reset_game') || 'Kaland újrakezdése'}
                </button>
            )}
        </div>
    );
};

