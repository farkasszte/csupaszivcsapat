'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { Choices } from './Choices';

export const StoryEngine = () => {
    const {
        project, currentElementId, executeScript, evaluate, state,
        getAssetUrl, parseRichText, saveGame, loadGame, resetGame,
        loading, error, message
    } = useGame();

    const [contentSegments, setContentSegments] = useState([]);

    const element = project.elements[currentElementId];
    const audioRef = useRef(null);

    useEffect(() => {
        if (!element) return;

        // Parse content
        const rawContent = element.content;
        const segments = parseRichText(rawContent);
        setContentSegments(segments);

    }, [currentElementId, element, state.visits[currentElementId]]);

    // Audio Playback
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        if (!element?.assets?.audio) return;

        const audioAssets = element.assets.audio;
        if (audioAssets.length > 0) {
            const assetRef = audioAssets[0];
            const url = getAssetUrl(assetRef.asset);
            if (url) {
                const audio = new Audio(url);
                audio.loop = assetRef.mode === 'loop';
                audio.volume = 0.5;
                audio.play().catch(e => console.log("Audio play failed:", e));
                audioRef.current = audio;
            }
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, [currentElementId, element]);


    const coverUrl = element?.assets?.cover ? getAssetUrl(element.assets.cover.id) : null;

    return (
        <div className="max-w-2xl mx-auto p-8 bg-black/60 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 transition-all duration-500">
            {/* Game Toolbar */}
            <div className="flex justify-end gap-3 mb-6">
                <button
                    onClick={saveGame}
                    disabled={loading}
                    className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 text-xs font-medium rounded border border-blue-500/30 transition-all disabled:opacity-50"
                >
                    Mentés
                </button>
                <button
                    onClick={loadGame}
                    disabled={loading}
                    className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 text-xs font-medium rounded border border-purple-500/30 transition-all disabled:opacity-50"
                >
                    Betöltés
                </button>
                <button
                    onClick={() => {
                        if (confirm('Biztosan elölről kezded?')) {
                            resetGame();
                        }
                    }}
                    disabled={loading}
                    className="px-3 py-1.5 bg-gray-600/20 hover:bg-gray-600/40 text-gray-300 text-xs font-medium rounded border border-gray-500/30 transition-all disabled:opacity-50"
                >
                    Újrakezdés
                </button>
            </div>

            {/* Status Messages */}
            {(error || message) && (
                <div className={`mb-4 p-2 text-center text-xs rounded border ${error ? 'bg-red-900/40 border-red-800 text-red-200' : 'bg-green-900/40 border-green-800 text-green-200'}`}>
                    {error || message}
                </div>
            )}

            {coverUrl && (
                <div className="mb-6 rounded-lg overflow-hidden shadow-lg border border-white/10">
                    <img src={coverUrl} alt="Scene" className="w-full h-64 object-cover hover:scale-105 transition-transform duration-700" />
                </div>
            )}
            <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-linear-to-r from-blue-200 to-purple-200 drop-shadow-sm font-serif" dangerouslySetInnerHTML={{ __html: element?.title }}></h1>

            <div className="story-content space-y-4 text-lg text-gray-100 leading-relaxed font-light tracking-wide">
                {contentSegments.map((seg, idx) => (
                    seg.type === 'html' ?
                        <div key={idx} dangerouslySetInnerHTML={{ __html: seg.content }} /> :
                        <span key={idx}>{seg.content}</span>
                ))}
            </div>

            <Choices />
        </div>
    );
};
