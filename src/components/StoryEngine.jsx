'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { Choices } from './Choices';
import { RiSearchLine } from '@remixicon/react';

export const StoryEngine = () => {
    const {
        project, currentElementId, executeScript, evaluate, state,
        getAssetUrl, parseRichText, saveGame, loadGame, resetGame,
        loading, error, message, clearMessage, openLightbox, isMuted, colorFilter,
        typewriterSpeed, transitionsEnabled, volume,
        recentDiscoveries, clearRecentDiscovery
    } = useGame();





    const [contentSegments, setContentSegments] = useState([]);
    const [totalVisibleChars, setTotalVisibleChars] = useState(0);
    const [isMounted, setIsMounted] = useState(false);

    // Transition states
    const [displayElementId, setDisplayElementId] = useState(currentElementId);
    const [isFading, setIsFading] = useState(false);

    const [isChoiceHovered, setIsChoiceHovered] = useState(false);
    const [isUiHidden, setIsUiHidden] = useState(false);

    const [activeDiscoveryId, setActiveDiscoveryId] = useState(null);
    const discoveryTimerRef = useRef(null);

    // Process new discoveries purely from the store
    useEffect(() => {
        // If we're already showing a capsule, don't interrupt it
        if (activeDiscoveryId) return;

        // If there are discoveries waiting and we aren't showing one
        if (recentDiscoveries && recentDiscoveries.length > 0) {
            const nextDiscovery = recentDiscoveries[0].id;

            // 1. Immediately remove it from the global store so we don't process it again
            clearRecentDiscovery(nextDiscovery);

            // 2. Set it as active to trigger the UI capsule
            setActiveDiscoveryId(nextDiscovery);

            // 3. Clear the UI capsule after 3 seconds
            if (discoveryTimerRef.current) clearTimeout(discoveryTimerRef.current);
            discoveryTimerRef.current = setTimeout(() => {
                setActiveDiscoveryId(null);
            }, 3000);
        }
    }, [recentDiscoveries, activeDiscoveryId, clearRecentDiscovery]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (discoveryTimerRef.current) clearTimeout(discoveryTimerRef.current);
        };
    }, []);

    const activeDiscoveryComponent = activeDiscoveryId && project?.components ? project.components[activeDiscoveryId] : null;

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Auto-dismiss status messages
    useEffect(() => {
        if (error || message) {
            const timer = setTimeout(() => {
                clearMessage?.();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error, message]);


    const element = project.elements[displayElementId];
    const audioRef = useRef(null);
    const transitionTimeoutRef = useRef(null);


    // Handle scene transitions
    useEffect(() => {
        if (currentElementId === displayElementId) return;

        if (!transitionsEnabled) {
            setDisplayElementId(currentElementId);
            setIsFading(false);
            // Reset UI visibility on scene change
            setIsUiHidden(false);
            return;
        }

        setDisplayElementId(currentElementId);
        setIsFading(false);
        setIsUiHidden(false);

        return () => {
            if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
        };
    }, [currentElementId, transitionsEnabled]);

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
                audio.volume = isMuted ? 0 : volume;

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

    // Handle Mute and Volume changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
            if (isMuted) {
                audioRef.current.pause();
            } else if (audioRef.current.paused && element?.assets?.audio) {
                audioRef.current.play().catch(e => console.log("Audio play resumed failed:", e));
            }
        }
    }, [isMuted, volume]);




    const coverUrl = element?.assets?.cover ? getAssetUrl(element.assets.cover.id) : null;
    let videoUrl = null;
    if (element?.components) {
        element.components.forEach(compId => {
            const comp = project.components?.[compId];
            if (comp?.attributes?.videoUrl) {
                videoUrl = comp.attributes.videoUrl;
            }
        });
    }

    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const prevMediaRef = useRef({ type: null, url: null });

    // Reset loaded state when video source changes
    useEffect(() => {
        if (videoUrl) {
            setIsVideoLoaded(false);
        }
    }, [videoUrl]);

    // Track the last successfully loaded media to use as a fallback background
    useEffect(() => {
        if (!videoUrl && coverUrl) {
            prevMediaRef.current = { type: 'image', url: coverUrl };
        } else if (videoUrl && isVideoLoaded) {
            prevMediaRef.current = { type: 'video', url: videoUrl };
        }
    }, [videoUrl, coverUrl, isVideoLoaded]);

    if (!isMounted) return null;

    return (
        <div key={displayElementId} className={`mx-auto rounded-xl shadow-2xl border border-white/10 relative overflow-hidden h-full w-full max-w-[420px] sm:w-auto sm:max-w-none sm:aspect-[9/16] lg:h-full lg:w-auto lg:max-w-none bg-zinc-950`}>

            {/* Discovery Capsule */}
            {activeDiscoveryComponent && (
                <div key={activeDiscoveryId} className="absolute top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in slide-in-from-top-4 fade-in duration-500">
                    <div className="bg-zinc-800/90 backdrop-blur-md border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.2)] rounded-full px-5 py-2.5 flex items-center gap-3">
                        <RiSearchLine size={16} className="text-[#FDF5E6]" />
                        <span className="text-xs font-bold tracking-wider text-[#FDF5E6] uppercase whitespace-nowrap">
                            Új felfedezés: <span className="text-[#FDF5E6]">{activeDiscoveryComponent.name}</span>
                        </span>
                    </div>
                </div>
            )}

            {/* Persistent Background Layer for smooth load transitions */}
            {prevMediaRef.current.url && (
                prevMediaRef.current.type === 'video' ? (
                    <video
                        src={prevMediaRef.current.url}
                        autoPlay loop muted playsInline
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                        style={{ filter: getColorFilterStyle(colorFilter) }}
                    />
                ) : (
                    <img
                        src={prevMediaRef.current.url}
                        alt="Previous Scene"
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                        style={{ filter: getColorFilterStyle(colorFilter) }}
                    />
                )
            )}

            {/* Background Image or Video */}
            {videoUrl ? (
                <video
                    key={videoUrl}
                    src={videoUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    onCanPlay={() => setIsVideoLoaded(true)}
                    className={`absolute inset-0 w-full h-full object-cover cursor-pointer transition-all duration-300 ${isChoiceHovered ? 'scale-105' : 'scale-100'} ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
                    style={{ filter: getColorFilterStyle(colorFilter) }}
                    onClick={() => setIsUiHidden(!isUiHidden)}
                />
            ) : coverUrl ? (
                <img
                    key={coverUrl}
                    src={coverUrl}
                    alt="Scene"
                    className={`absolute inset-0 w-full h-full object-cover cursor-pointer transition-transform duration-1000 z-10 ${isChoiceHovered ? 'scale-105' : 'scale-100'}`}
                    style={{ filter: getColorFilterStyle(colorFilter) }}
                    onClick={() => setIsUiHidden(!isUiHidden)}
                />
            ) : (
                <div
                    key="no-image"
                    className="absolute inset-0 w-full h-full bg-zinc-900 cursor-pointer z-10"
                    onClick={() => setIsUiHidden(!isUiHidden)}
                />
            )}

            {/* Overlay Container */}
            <div className={`relative z-10 flex flex-col h-full pointer-events-none`}>

                {/* Status Messages */}
                {(error || message) && (
                    <div className="p-4 pointer-events-auto">
                        <div className={`p-2.5 flex items-center justify-between text-xs rounded-lg border animate-in fade-in duration-300 ${error ? 'bg-red-950/60 border-red-500/20 text-[#FDF5E6]' : 'bg-emerald-950/60 border-emerald-500/20 text-[#FDF5E6]'} backdrop-blur-sm`}>
                            <span>{error || message}</span>
                            <button onClick={() => clearMessage?.()} className="ml-2 hover:opacity-70 transition-opacity">✕</button>
                        </div>
                    </div>
                )}

                {/* Spacer pushes content to the bottom */}
                <div className="flex-1" />

                <div className={`transition-all duration-500 transform ${isUiHidden ? 'opacity-0 translate-y-8 pointer-events-none' : 'opacity-100 translate-y-0 pointer-events-auto'} bg-linear-to-b from-transparent via-black/40 to-black/80`}>
                    {/* Choices Overlay (moves above the text box) */}
                    <div className={`px-3 pb-2 z-20 ${isUiHidden ? 'pointer-events-none' : 'pointer-events-auto'}`}>
                        <Choices hasImage={true} onHoverChange={setIsChoiceHovered} />
                    </div>

                    {/* Text Content in Translucent Box */}
                    <div className={`p-4 m-3 mb-4 bg-black/30 backdrop-blur-md rounded-xl border border-white/10 shadow-xl ${isUiHidden ? 'pointer-events-none' : 'pointer-events-auto'}`}>
                        {/* Text area is internally scrollable if content is very long */}
                        <div className={`story-content space-y-3 text-sm lg:text-base text-[#FDF5E6] leading-relaxed font-light tracking-wide overflow-y-auto max-h-[35vh] pr-2`}>
                            {contentSegments.map((seg, idx) => {
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
                    </div>
                </div>
            </div>
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
