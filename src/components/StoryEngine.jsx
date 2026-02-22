'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { Choices } from './Choices';

export const StoryEngine = () => {
    const {
        project, currentElementId, executeScript, evaluate, state,
        getAssetUrl, parseRichText, saveGame, loadGame, resetGame,
        loading, error, message, openLightbox, isMuted, colorFilter,
        typewriterSpeed, transitionsEnabled
    } = useGame();



    const [contentSegments, setContentSegments] = useState([]);
    const [totalVisibleChars, setTotalVisibleChars] = useState(0);
    const [isMounted, setIsMounted] = useState(false);

    // Transition states
    const [displayElementId, setDisplayElementId] = useState(currentElementId);
    const [isFading, setIsFading] = useState(false);


    useEffect(() => {
        setIsMounted(true);
    }, []);

    const element = project.elements[displayElementId];
    const audioRef = useRef(null);
    const transitionTimeoutRef = useRef(null);


    // Handle scene transitions
    useEffect(() => {
        if (currentElementId === displayElementId) return;

        if (!transitionsEnabled) {
            setDisplayElementId(currentElementId);
            setIsFading(false);
            return;
        }

        // Reset any existing timeout
        if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);


        setIsFading(true);

        transitionTimeoutRef.current = setTimeout(() => {
            setDisplayElementId(currentElementId);
            setIsFading(false);
        }, 400); // Duration of fade-out

        return () => {
            if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
        };
    }, [currentElementId]);

    // Parse into segments and calculate offsets
    useEffect(() => {
        if (!element) return;

        const rawContent = element.content;
        const segments = parseRichText(rawContent);

        // Enhance segments with text length and cumulative start offsets
        let currentOffset = 0;
        const enhancedSegments = segments.map(seg => {
            const div = document.createElement('div');
            div.innerHTML = seg.content;
            const textLen = (div.textContent || "").length;
            const enhanced = { ...seg, startOffset: currentOffset, length: textLen };
            currentOffset += textLen;
            return enhanced;
        });

        setContentSegments(enhancedSegments);

        // Reset or set to end if typewriter is OFF
        if (typewriterSpeed === 0) {
            setTotalVisibleChars(999999);
        } else {
            setTotalVisibleChars(0);
        }

    }, [displayElementId, element, state.visits[displayElementId], typewriterSpeed]);


    // Global typewriter controller
    useEffect(() => {
        if (typewriterSpeed === 0 || contentSegments.length === 0) return;

        const totalLength = contentSegments[contentSegments.length - 1].startOffset + contentSegments[contentSegments.length - 1].length;
        if (totalVisibleChars >= totalLength) return;

        const timer = setInterval(() => {
            setTotalVisibleChars(prev => {
                if (prev >= totalLength) {
                    clearInterval(timer);
                    return prev;
                }
                return prev + 1;
            });
        }, typewriterSpeed);

        return () => clearInterval(timer);
    }, [contentSegments, typewriterSpeed, totalVisibleChars === 0]);


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
        // Add style to all images in content
        const imgs = container.querySelectorAll('img');
        const filterStyle = getColorFilterStyle(colorFilter);
        imgs.forEach(img => {
            img.classList.add('cursor-pointer', 'hover:opacity-90', 'transition-opacity');
            img.style.filter = filterStyle;
        });

        return () => container.removeEventListener('click', handleImageClick);
    }, [contentSegments, openLightbox, colorFilter]);



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
                audio.volume = isMuted ? 0 : 0.5;
                if (!isMuted) {
                    audio.play().catch(e => console.log("Audio play failed:", e));
                }
                audioRef.current = audio;
            }

        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, [displayElementId, element]);

    // Handle Mute changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : 0.5;
            if (isMuted) {
                audioRef.current.pause();
            } else if (audioRef.current.paused && element?.assets?.audio) {
                audioRef.current.play().catch(e => console.log("Audio play resumed failed:", e));
            }
        }
    }, [isMuted]);



    const coverUrl = element?.assets?.cover ? getAssetUrl(element.assets.cover.id) : null;

    if (!isMounted) return null;

    return (
        <div className={`max-w-2xl mx-auto p-8 bg-zinc-900/60 backdrop-blur-xl rounded-xl shadow-2xl border border-white/5 transition-all duration-500 transform ${isFading ? 'opacity-0 scale-[0.98] translate-y-1' : 'opacity-100 scale-100 translate-y-0'}`}>
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
                        style={{ filter: getColorFilterStyle(colorFilter) }}
                        onClick={() => openLightbox(coverUrl)}
                    />


                </div>
            )}
            <h1 className="text-4xl font-bold mb-6 text-transparent bg-clip-text bg-linear-to-r from-amber-200 to-orange-200 drop-shadow-sm font-serif" dangerouslySetInnerHTML={{ __html: element?.title }}></h1>

            <div className="story-content space-y-4 text-lg text-orange-50/80 leading-relaxed font-light tracking-wide min-h-[100px]">
                {contentSegments.map((seg, idx) => {
                    // How many characters of THIS segment should be visible?
                    const visibleInThisSegment = Math.max(0, Math.min(seg.length, totalVisibleChars - seg.startOffset));

                    return (
                        <TypewriterSegment
                            key={`${displayElementId}-${idx}`}
                            content={seg.content}
                            visibleCount={visibleInThisSegment}
                            isFull={visibleInThisSegment >= seg.length}
                        />
                    );
                })}
            </div>



            <Choices />
        </div>
    );
};

// Accessibility Helper
export const getColorFilterStyle = (filterId) => {
    switch (filterId) {
        case 'protanopia': return 'url(#protanopia-filter)';
        case 'deuteranopia': return 'url(#deuteranopia-filter)';
        case 'tritanopia': return 'url(#tritanopia-filter)';
        case 'grayscale': return 'grayscale(100%)';
        case 'vibrant': return 'saturate(150%)';
        default: return 'none';

    }
};

const TypewriterSegment = React.memo(({ content, visibleCount, isFull }) => {
    // If fully visible, just render normally to avoid DOM walking
    if (isFull) {
        return <div dangerouslySetInnerHTML={{ __html: content }} />;
    }

    // Stable HTML truncation
    const getVisibleHtml = () => {
        if (visibleCount <= 0) return "";

        const div = document.createElement('div');
        div.innerHTML = content;

        let count = 0;
        const walk = (node) => {
            if (count >= visibleCount) {
                node.textContent = "";
                return;
            }
            if (node.nodeType === 3) { // Text Node
                const remaining = visibleCount - count;
                if (node.textContent.length > remaining) {
                    node.textContent = node.textContent.slice(0, remaining);
                }
                count += node.textContent.length;
            } else { // Element Node
                const children = Array.from(node.childNodes);
                for (let i = 0; i < children.length; i++) {
                    if (count >= visibleCount) {
                        node.removeChild(children[i]);
                    } else {
                        walk(children[i]);
                    }
                }
            }
        };
        walk(div);
        return div.innerHTML;
    };

    return <div dangerouslySetInnerHTML={{ __html: getVisibleHtml() }} />;
});

TypewriterSegment.displayName = 'TypewriterSegment';
