'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { Choices } from './Choices';
import { RiSearchLine, RiBookOpenLine } from '@remixicon/react';
import { storyTranslations } from '../data/story_translations';

export const StoryEngine = ({ hideMedia = false }) => {
    const {
        project, currentElementId, state,
        getAssetUrl, parseRichText, error,
        message, clearMessage, openLightbox, isMuted, colorFilter,
        typewriterSpeed, transitionsEnabled, volume,
        recentDiscoveries, clearRecentDiscovery,
        showLog, showDashboard, showMap, showMenu, showLibrary, showProfile,
        language, t
    } = useGame();

    const [contentSegments, setContentSegments] = useState([]);
    const [totalVisibleChars, setTotalVisibleChars] = useState(0);
    const [isMounted, setIsMounted] = useState(false);

    // Transition states
    const [displayElementId, setDisplayElementId] = useState(currentElementId);
    const [isFading, setIsFading] = useState(false);

    // Scroll to top on mobile after every choice/transition
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (window.innerWidth < 1024) {
            const containers = [
                document.querySelector('.touch-pan-y'), // page.js main wrapper
                document.querySelector('.story-content')?.parentElement // StoryEngine scrollable area
            ];
            containers.forEach(c => {
                if (c) c.scrollTo({ top: 0, behavior: 'smooth' });
            });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [currentElementId]);

    const [isChoiceHovered, setIsChoiceHovered] = useState(false);
    const [isUiHidden, setIsUiHidden] = useState(false);

    const [activeDiscoveryId, setActiveDiscoveryId] = useState(null);
    const discoveryTimerRef = useRef(null);

    // Process new discoveries purely from the store
    useEffect(() => {
        if (activeDiscoveryId) return;
        if (recentDiscoveries && recentDiscoveries.length > 0) {
            const nextDiscovery = recentDiscoveries[0].id;
            clearRecentDiscovery(nextDiscovery);
            setActiveDiscoveryId(nextDiscovery);
            if (discoveryTimerRef.current) clearTimeout(discoveryTimerRef.current);
            discoveryTimerRef.current = setTimeout(() => {
                setActiveDiscoveryId(null);
            }, 3000);
        }
    }, [recentDiscoveries, activeDiscoveryId, clearRecentDiscovery]);

    useEffect(() => {
        return () => {
            if (discoveryTimerRef.current) clearTimeout(discoveryTimerRef.current);
        };
    }, []);

    useEffect(() => {
        setIsMounted(true);
    }, []);

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

    useEffect(() => {
        if (currentElementId === displayElementId) return;
        if (!transitionsEnabled) {
            setDisplayElementId(currentElementId);
            setIsFading(false);
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

    useEffect(() => {
        if (!element) return;
        let rawContent = element.content;

        // Apply localization override
        if (language === 'en' && storyTranslations[displayElementId]) {
            rawContent = storyTranslations[displayElementId].content || rawContent;
        } else if (language === 'sr' && storyTranslations.sr?.[displayElementId]) {
            rawContent = storyTranslations.sr[displayElementId].content || rawContent;
        }

        const segments = parseRichText(rawContent);
        
        let cumulativeLength = 0;
        const enhancedSegments = segments.map(seg => {
            const div = document.createElement('div');
            div.innerHTML = seg.content;
            const textLen = (div.textContent || "").length;
            const segmentWithOffset = { ...seg, length: textLen, startOffset: cumulativeLength };
            cumulativeLength += textLen;
            return segmentWithOffset;
        });
        
        setContentSegments(enhancedSegments);
    }, [displayElementId, element, language]);

    const totalLength = contentSegments.reduce((sum, seg) => sum + seg.length, 0);

    useEffect(() => {
        if (typewriterSpeed === 0) {
            setTotalVisibleChars(999999);
        } else {
            setTotalVisibleChars(0);
        }
    }, [displayElementId, typewriterSpeed, element, state.visits[displayElementId]]);

    useEffect(() => {
        if (typewriterSpeed === 0 || contentSegments.length === 0 || totalVisibleChars >= totalLength) return;
        
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
    }, [typewriterSpeed, contentSegments, totalLength, totalVisibleChars]);

    useEffect(() => {
        const container = document.querySelector('.story-content');
        if (!container) return;
        const handleImageClick = (e) => {
            if (e.target.tagName === 'IMG') {
                openLightbox(e.target.src);
            }
        };
        container.addEventListener('click', handleImageClick);
        const imgs = container.querySelectorAll('img');
        const filterStyle = getColorFilterStyle(colorFilter);
        imgs.forEach(img => {
            img.classList.add('cursor-pointer', 'hover:opacity-90', 'transition-opacity');
            img.style.filter = filterStyle;
        });
        return () => container.removeEventListener('click', handleImageClick);
    }, [contentSegments, openLightbox, colorFilter]);

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
    
    useEffect(() => {
        if (videoUrl) {
            setIsVideoLoaded(false);
        }
    }, [videoUrl]);

    const isIntro = displayElementId === "e3d27f29-240f-42ff-84a5-77e3e0727d38";
    const activeCoverUrl = isIntro ? "/assets/Images/tuzok_tanar_ur.png" : coverUrl;

    if (!isMounted) return null;

    return (
        <div className="w-full flex flex-col justify-start lg:items-start items-center relative z-10 min-h-0 lg:min-h-full p-0">
            {/* Unified Adaptive Frame Section */}
            <div className={`w-full mx-auto mt-auto lg:mt-auto mb-0 lg:mb-0 rounded-2xl flex flex-col overflow-hidden transition-all duration-500
                ${!hideMedia ? 'bg-transparent border-none shadow-none lg:biophilic-card lg:max-w-5xl h-full' : 'lg:max-w-6xl h-full lg:biophilic-card'}
                ${isChoiceHovered ? 'ring-2 ring-[#4F7942]/40 border-[#4F7942]/60 shadow-glow-primary-lg' : ''}
            `}>

                {/* Story Content Area (Scrollable) */}
                <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col items-stretch pt-0 pb-10 px-4 lg:px-5 touch-pan-y overscroll-contain">
                    
                    {/* Integrated Media (Top of Content) - Mobile Only */}
                    {!hideMedia && (videoUrl || activeCoverUrl) && (
                        <div className="lg:hidden mb-6 relative w-full flex justify-center animate-in fade-in duration-700">
                            {videoUrl ? (
                                <video
                                    key={videoUrl}
                                    src={videoUrl}
                                    autoPlay loop muted playsInline
                                    onCanPlay={() => setIsVideoLoaded(true)}
                                    className={`w-full h-auto shadow-none transition-opacity duration-300 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
                                    style={{ filter: getColorFilterStyle(colorFilter) }}
                                />
                            ) : (
                                <div className="w-full flex justify-center">
                                    <img
                                        key={activeCoverUrl}
                                        src={activeCoverUrl}
                                        alt="Scene"
                                        className="w-full h-auto object-cover shadow-none"
                                        style={{ filter: getColorFilterStyle(colorFilter) }}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Status Messages */}
                    {(error || message) && (
                        <div className="mb-6 shrink-0 animate-in fade-in duration-300">
                            <div className={`p-3 flex items-center justify-between text-xs rounded-lg border ${error ? 'bg-red-100 border-red-500 text-red-900' : 'bg-emerald-100 border-emerald-500 text-emerald-900'}`}>
                                <span>{error || message}</span>
                                <button onClick={() => clearMessage?.()} className="ml-2 hover:opacity-70 transition-opacity">✕</button>
                            </div>
                        </div>
                    )}

                    <div className="story-content space-y-4 sm:space-y-6 text-sm sm:text-lg lg:text-[19px] text-surface leading-[1.6] sm:leading-[1.8] lg:leading-loose tracking-wide animate-in fade-in duration-500">
                        {contentSegments.map((seg, idx) => {
                            const visibleForThisSeg = Math.max(0, Math.min(seg.length, totalVisibleChars - seg.startOffset));
                            return (
                                <TypewriterSegment
                                    key={`${displayElementId}-${idx}`}
                                    content={seg.content}
                                    visibleCount={visibleForThisSeg}
                                    isFull={visibleForThisSeg >= seg.length}
                                />
                            );
                        })}
                    </div>

                    {/* Choices (Inside scrollable area) */}
                    {(typewriterSpeed === 0 || totalVisibleChars >= totalLength) && contentSegments.length > 0 && (
                        <div className="shrink-0 pt-8 animate-in fade-in slide-in-from-bottom-2 duration-500 mt-auto">
                            <Choices hasImage={false} onHoverChange={setIsChoiceHovered} />
                        </div>
                    )}
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
    if (isFull) {
        return <div dangerouslySetInnerHTML={{ __html: content }} />;
    }

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
            if (node.nodeType === 3) {
                const remaining = visibleCount - count;
                if (node.textContent.length > remaining) {
                    node.textContent = node.textContent.slice(0, remaining);
                }
                count += node.textContent.length;
            } else {
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
