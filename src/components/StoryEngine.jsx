'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { Choices } from './Choices';

export const StoryEngine = () => {
    const {
        project, currentElementId, executeScript, evaluate, state,
        getAssetUrl, parseRichText, saveGame, loadGame, resetGame,
        loading, error, message, openLightbox
    } = useGame();

    const [contentSegments, setContentSegments] = useState([]);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const element = project.elements[currentElementId];
    const audioRef = useRef(null);

    useEffect(() => {
        if (!element) return;

        // Parse content
        const rawContent = element.content;
        const segments = parseRichText(rawContent);
        setContentSegments(segments);

    }, [currentElementId, element, state.visits[currentElementId]]);

    // Handle clicks on images in story content
    useEffect(() => {
        const container = document.querySelector('.story-content');
        if (!container) return;

        const handleImageClick = (e) => {
            if (e.target.tagName === 'IMG') {
                openLightbox(e.target.src);
            }
        };

        container.addEventListener('click', handleImageClick);
        // Add cursor-pointer to all images in content
        const imgs = container.querySelectorAll('img');
        imgs.forEach(img => img.classList.add('cursor-pointer', 'hover:opacity-90', 'transition-opacity'));

        return () => container.removeEventListener('click', handleImageClick);
    }, [contentSegments, openLightbox]);


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

    if (!isMounted) return null;

    return (
        <div className="max-w-2xl mx-auto p-8 bg-zinc-900/60 backdrop-blur-xl rounded-xl shadow-2xl border border-white/5 transition-all duration-500">
            {/* Status Messages */}
            {(error || message) && (
                <div className={`mb-4 p-2 text-center text-xs rounded border ${error ? 'bg-red-900/40 border-red-800 text-red-200' : 'bg-green-900/40 border-green-800 text-green-200'}`}>
                    {error || message}
                </div>
            )}

            {coverUrl && (
                <div className="mb-6 rounded-lg overflow-hidden shadow-lg border border-white/10">
                    <img
                        src={coverUrl}
                        alt="Scene"
                        className="w-full aspect-video object-cover hover:scale-105 transition-transform duration-700 cursor-pointer"
                        onClick={() => openLightbox(coverUrl)}
                    />

                </div>
            )}
            <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-linear-to-r from-amber-200 to-orange-200 drop-shadow-sm font-serif" dangerouslySetInnerHTML={{ __html: element?.title }}></h1>

            <div className="story-content space-y-4 text-lg text-orange-50/80 leading-relaxed font-light tracking-wide">
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
