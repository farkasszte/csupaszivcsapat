'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { Choices } from './Choices';
import { RiSearchLine, RiBookOpenLine } from '@remixicon/react';

export const StoryEngine = ({ hideMedia = false }) => {
    const {
        project, currentElementId, state,
        getAssetUrl, parseRichText, error,
        message, clearMessage, openLightbox, isMuted, colorFilter,
        typewriterSpeed, transitionsEnabled, volume,
        recentDiscoveries, clearRecentDiscovery,
        showLog, showDashboard, showMap, showMenu, showLibrary, showProfile
    } = useGame();

    const showPanel = showLog || showDashboard || showMap || showMenu || showLibrary || showProfile;





    const [contentSegments, setContentSegments] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
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

        // Enhance segments with text length
        const enhancedSegments = segments.map(seg => {
            const div = document.createElement('div');
            div.innerHTML = seg.content;
            const textLen = (div.textContent || "").length;
            return { ...seg, length: textLen };
        });

        setContentSegments(enhancedSegments);
        setCurrentStep(0);
    }, [displayElementId, element]);

    // Typewriter visibility reset
    useEffect(() => {
        if (typewriterSpeed === 0) {
            setTotalVisibleChars(999999);
        } else {
            setTotalVisibleChars(0);
        }
    }, [displayElementId, currentStep, typewriterSpeed, element, state.visits[displayElementId]]);

    // Global typewriter controller per step
    useEffect(() => {
        if (typewriterSpeed === 0 || contentSegments.length === 0) return;

        const currentSeg = contentSegments[currentStep];
        if (!currentSeg) return;

        if (totalVisibleChars >= currentSeg.length) return;

        const timer = setInterval(() => {
            setTotalVisibleChars(prev => {
                if (prev >= currentSeg.length) {
                    clearInterval(timer);
                    return prev;
                }
                return prev + 1;
            });
        }, typewriterSpeed);

        return () => clearInterval(timer);
    }, [contentSegments, currentStep, typewriterSpeed, totalVisibleChars === 0]);


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

    // Use the Túzok image exclusively for the first intro node
    const isIntro = displayElementId === "e3d27f29-240f-42ff-84a5-77e3e0727d38";
    const activeCoverUrl = isIntro ? "/assets/Images/tuzok_tanar_ur.png" : coverUrl;

    if (!isMounted) return null;

    return (
        <div key={displayElementId} className="w-full h-full flex flex-col lg:flex-row items-stretch lg:items-stretch justify-center relative z-0">

            {/* Left Image Section / Top on Mobile - only shown if not hidden */}
            {!hideMedia && (
                <div className="w-full lg:w-[40%] flex justify-center items-end lg:items-center relative z-0 pt-20 lg:pt-0 -mb-8 lg:mb-0">
                    {activeDiscoveryComponent && (!videoUrl && !activeCoverUrl) && (
                        // Discovery fallback if no media
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in duration-500">
                            <div className="bg-white/80 backdrop-blur-md border border-surface/30 shadow-lg rounded-full px-4 py-2 flex items-center gap-2 mx-auto w-fit">
                                <RiSearchLine size={14} className="text-surface" />
                                <span className="text-[10px] font-bold tracking-wider text-surface uppercase whitespace-nowrap">
                                    Új felfedezés: <span className="text-surface">{activeDiscoveryComponent.name}</span>
                                </span>
                            </div>
                        </div>
                    )}

                    {(videoUrl || activeCoverUrl) && (
                        <div className="relative w-full overflow-visible flex justify-center">
                            {activeDiscoveryComponent && (
                                <div key={activeDiscoveryId} className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in slide-in-from-top-4 fade-in duration-500">
                                    <div className="bg-white/80 backdrop-blur-md border border-surface/30 shadow-lg rounded-full px-4 py-2 flex items-center gap-2">
                                        <RiSearchLine size={14} className="text-surface" />
                                        <span className="text-[10px] font-bold tracking-wider text-surface uppercase whitespace-nowrap">
                                            Új felfedezés: <span className="text-surface">{activeDiscoveryComponent.name}</span>
                                        </span>
                                    </div>
                                </div>
                            )}
                            {videoUrl ? (
                                <video
                                    key={videoUrl}
                                    src={videoUrl}
                                    autoPlay loop muted playsInline
                                    onCanPlay={() => setIsVideoLoaded(true)}
                                    className={`w-full max-w-[400px] lg:max-w-none h-auto lg:max-h-[80vh] lg:h-full object-contain rounded-xl transition-opacity duration-300 ${isVideoLoaded ? 'opacity-100' : 'opacity-0'}`}
                                    style={{ filter: getColorFilterStyle(colorFilter) }}
                                />
                            ) : (
                                <div className={`w-full mx-auto drop-shadow-2xl ${
                                    isIntro ? 'max-w-[400px] lg:max-w-none' : 'max-w-[250px] lg:max-w-[300px] mt-2 lg:mt-0'
                                }`}>
                                    <div className={`w-full ${isIntro ? '' : 'rounded-2xl overflow-hidden'}`}>
                                        <img
                                            key={activeCoverUrl}
                                            src={activeCoverUrl}
                                            alt="Scene"
                                            className={`w-full h-auto ${
                                                isIntro
                                                    ? 'lg:h-full lg:max-h-[80vh] object-contain'
                                                    : 'object-cover scale-[1.06]'
                                            }`}
                                            style={{ filter: getColorFilterStyle(colorFilter) }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Right Dialogue Section / Bottom on Mobile */}
            <div className={`w-full flex flex-col justify-end lg:justify-start relative z-10 lg:min-h-full ${hideMedia ? 'lg:w-full p-0' : 'lg:w-[60%] p-4 lg:p-8'}`}>

                <div className={`biophilic-card w-full mx-auto mt-auto lg:mt-auto mb-4 lg:mb-0 rounded-2xl shadow-2xl border border-white/30 bg-white/20 backdrop-blur-md flex flex-col overflow-hidden ${hideMedia ? 'h-full lg:max-w-5xl' : 'max-h-[70vh] lg:max-h-[60vh] max-w-3xl lg:mr-8'}`}>

                    {/* Story Text (Middle - Scrollable) */}
                    <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col items-stretch pb-4 p-6 sm:p-8 lg:p-10 touch-pan-y overscroll-contain">
                        {/* Status Messages */}
                        {(error || message) && (
                            <div className="mb-6 shrink-0 animate-in fade-in duration-300">
                                <div className={`p-3 flex items-center justify-between text-xs rounded-lg border ${error ? 'bg-red-100 border-red-500 text-red-900' : 'bg-emerald-100 border-emerald-500 text-emerald-900'}`}>
                                    <span>{error || message}</span>
                                    <button onClick={() => clearMessage?.()} className="ml-2 hover:opacity-70 transition-opacity">✕</button>
                                </div>
                            </div>
                        )}

                        <div className="story-content space-y-4 sm:space-y-6 text-base sm:text-lg lg:text-[19px] text-surface leading-[1.7] sm:leading-[1.8] lg:leading-loose tracking-wide text-justify animate-in fade-in duration-500">
                            {contentSegments.length > 0 && contentSegments[currentStep] && (
                                <TypewriterSegment
                                    key={`${displayElementId}-${currentStep}`}
                                    content={contentSegments[currentStep].content}
                                    visibleCount={totalVisibleChars}
                                    isFull={totalVisibleChars >= contentSegments[currentStep].length}
                                />
                            )}
                        </div>
                    </div>

                    {/* Pagination Controls */}
                    {contentSegments.length > 0 && currentStep < contentSegments.length - 1 && (
                        <div className="shrink-0 flex justify-end px-6 pb-6 sm:px-8 sm:pb-8 lg:px-10 lg:pb-10 pt-4 mt-auto bg-linear-to-t from-white/10 to-transparent border-t border-surface/10">
                            <button
                                onClick={() => setCurrentStep(prev => prev + 1)}
                                className="px-8 py-3 sm:px-10 sm:py-4 bg-[#4F7942] hover:bg-[#3d5e33] text-white text-base sm:text-lg font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 block"
                            >
                                Tovább
                            </button>
                        </div>
                    )}

                    {/* Choices (Bottom) */}
                    {contentSegments.length > 0 && currentStep === contentSegments.length - 1 && (
                        <div className="shrink-0 px-6 pb-6 sm:px-8 sm:pb-8 lg:px-10 lg:pb-10 pt-6 animate-in fade-in slide-in-from-bottom-2 duration-500 mt-auto bg-linear-to-t from-white/10 to-transparent border-t border-surface/10">
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
