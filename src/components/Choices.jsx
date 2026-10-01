'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { FinaleActions } from './FinaleActions';

export const Choices = ({ hasImage }) => {
    const { 
        project, 
        currentElementId, 
        navigateTo, 
        resolveTarget, 
        renderRichText, 
        resetGame,
        setShowImages,
        storyTranslations,
        language,
        t
    } = useGame();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const element = project?.elements?.[currentElementId];
    const isFinale = currentElementId === '3b3ba9f9-5559-48e5-bf9e-04e5c16493c1';

    const uniqueChoices = useMemo(() => {
        if (!element || isFinale) return [];
        const outputs = element.outputs || [];

        const choices = outputs.map(connId => {
            let connection = project?.connections?.[connId];
            if (!connection) return null;

            const { id: targetId, label: resolvedLabel } = resolveTarget(connection.targetid, connection.label);
            if (!targetId) return null;

            const finalLabel = resolvedLabel || 'Tovább';
            let displayLabel = finalLabel;

            // Apply localization override
            if (language === 'en' && storyTranslations?.[connId]) {
                displayLabel = storyTranslations[connId].label || finalLabel;
            } else if (language === 'en' && finalLabel === 'Tovább') {
                displayLabel = 'Continue';
            } else if (language && language.startsWith('sr') && storyTranslations?.[language]?.[connId]) {
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
                rawLabel: rendered.replace(/<[^>]*>/g, '').trim(),
            };
        }).filter(Boolean);

        const deduped = [];
        const seenLabels = new Set();
        for (const choice of choices) {
            if (!seenLabels.has(choice.rawLabel)) {
                deduped.push(choice);
                seenLabels.add(choice.rawLabel);
            }
        }
        return deduped;
    }, [element, isFinale, project, resolveTarget, language, storyTranslations, renderRichText]);

    // Keyboard navigation (1-9, or Space/Enter when single choice)
    useEffect(() => {
        const handleKeyDown = (e) => {
            const tag = document.activeElement?.tagName;
            if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) {
                return;
            }

            const num = parseInt(e.key, 10);
            if (!isNaN(num) && num >= 1 && num <= uniqueChoices.length) {
                e.preventDefault();
                const selected = uniqueChoices[num - 1];
                if (selected) {
                    navigateTo(selected.targetId, selected.rawLabel);
                    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
                        setShowImages(true);
                    }
                }
            } else if ((e.key === ' ' || e.key === 'Enter') && uniqueChoices.length === 1 && document.activeElement === document.body) {
                e.preventDefault();
                const selected = uniqueChoices[0];
                navigateTo(selected.targetId, selected.rawLabel);
                if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
                    setShowImages(true);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [uniqueChoices, navigateTo, setShowImages]);

    if (!isMounted) return null;
    if (!element) return null;
    if (isFinale) return <FinaleActions />;

    return (
        <div className={`mt-4 ${hasImage ? 'flex flex-wrap gap-2 justify-center' : 'grid gap-4 mt-2'}`}>
            {uniqueChoices.length > 0 ? (
                uniqueChoices.map((choice, idx) => (
                    <button
                        key={`${choice.id}-${idx}`}
                        aria-keyshortcuts={`${idx + 1}`}
                        onClick={() => {
                            navigateTo(choice.targetId, choice.rawLabel);
                            if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
                                setShowImages(true);
                            }
                        }}
                        className={`text-surface font-medium text-base italic transition-all transform hover:scale-102 shadow-xl backdrop-blur-md border border-white/20 hover:border-[#4F7942]/60 whitespace-normal max-w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4F7942]
                            ${hasImage
                                ? 'px-3 py-2 rounded-full bg-white/40 hover:bg-[#d8c5b0]/90 hover:brightness-95 text-sm flex items-center'
                                : 'w-full text-left px-4 py-4 rounded-lg bg-linear-to-r from-white/40 to-white/20 hover:from-[#d8c5b0]/90 hover:to-[#c8b49e]/80 hover:brightness-95'
                            }`}
                    >
                        <div className="flex items-center gap-2.5 w-full">
                            <span className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#4F7942]/15 text-[#4F7942] text-xs font-mono font-bold border border-[#4F7942]/25 shadow-2xs">
                                {idx + 1}
                            </span>
                            <span className="flex-1">{choice.label}</span>
                        </div>
                    </button>
                ))
            ) : (
                <button
                    onClick={() => resetGame?.()}
                    className={`text-red-900 font-semibold text-xs transition-all transform hover:scale-95 active:scale-90 shadow-xl backdrop-blur-md border border-red-500/30 whitespace-normal pointer-events-auto max-w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500
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

