'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { Choices } from './Choices';
import { RiSearchLine, RiBookOpenLine, RiVolumeUpLine, RiStopCircleLine } from '@remixicon/react';

export const StoryEngine = ({ hideMedia = false }) => {
    const {
        project, currentElementId, state,
        getAssetUrl, parseRichText, error,
        message, clearMessage, openLightbox, isMuted, colorFilter,
        typewriterSpeed, transitionsEnabled, volume,
        recentDiscoveries, clearRecentDiscovery,
        showLog, showDashboard, showMap, showMenu, showLibrary, showProfile,
        storyTranslations,
        language, t
    } = useGame();

    const [contentSegments, setContentSegments] = useState([]);
    const [totalVisibleChars, setTotalVisibleChars] = useState(0);
    const [isMounted, setIsMounted] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const stopSpeech = useCallback(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, []);

    // Stop speaking when moving to another element or unmounting
    useEffect(() => {
        stopSpeech();
    }, [currentElementId, stopSpeech]);

    useEffect(() => {
        return () => {
            stopSpeech();
        };
    }, [stopSpeech]);

    const handleToggleSpeech = () => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
            alert(t('tts_unsupported') || 'A böngésződ nem támogatja a szövegfelolvasást.');
            return;
        }

        if (isSpeaking) {
            stopSpeech();
            return;
        }

        const plainText = contentSegments.map(s => {
            const div = document.createElement('div');
            div.innerHTML = s.content;
            return div.textContent || div.innerText || '';
        }).join(' ').replace(/\s+/g, ' ').trim();

        if (!plainText) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(plainText);
        const langCode = language === 'en' ? 'en-US' : language?.startsWith('sr') ? 'sr-RS' : 'hu-HU';
        utterance.lang = langCode;
        utterance.rate = 0.95;

        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.lang.startsWith(langCode.slice(0, 2)));
        if (voice) utterance.voice = voice;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    // Transition states
    const [displayElementId, setDisplayElementId] = useState(currentElementId);
    const [isFading, setIsFading] = useState(false);

    const scrollRef = useRef(null);

    // Scroll to top on mobile after every choice/transition
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (window.innerWidth < 1024 && scrollRef.current) {
            // Force snap to top of the story container
            scrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
            // Also ensure page wrapper is at top
            window.scrollTo({ top: 0, behavior: 'instant' });
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
        if (language === 'en' && storyTranslations?.[displayElementId]) {
            rawContent = storyTranslations[displayElementId].content || rawContent;
        } else if (language?.startsWith('sr') && storyTranslations?.[language]?.[displayElementId]) {
            rawContent = storyTranslations[language][displayElementId].content || rawContent;
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

    const activeCoverUrl = coverUrl;

    if (!isMounted) return null;

    return (
        <div className="w-full flex flex-col justify-start lg:items-start items-center relative z-10 min-h-0 lg:min-h-full p-0">
            {/* Unified Adaptive Frame Section */}
            <div className={`w-full mx-auto mt-auto lg:mt-auto mb-0 lg:mb-0 rounded-2xl flex flex-col overflow-hidden transition-all duration-500
                ${!hideMedia ? 'bg-transparent border-none shadow-none lg:biophilic-card lg:max-w-5xl h-full' : 'lg:max-w-6xl h-full lg:biophilic-card'}
                ${isChoiceHovered ? 'ring-2 ring-[#4F7942]/40 border-[#4F7942]/60 shadow-glow-primary-lg' : ''}
            `}>

                {/* Story Content Area (Scrollable) */}
                <div
                    ref={scrollRef}
                    className="flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col items-stretch pt-0 pb-10 px-4 lg:px-5 touch-pan-y overscroll-contain"
                >

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
                                        alt=""
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
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

                    {/* Read Aloud (TTS) Button */}
                    <div className="flex justify-end mb-2">
                        <button
                            onClick={handleToggleSpeech}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer select-none ${
                                isSpeaking
                                    ? 'bg-amber-400 text-amber-950 animate-pulse border border-amber-500 shadow-md'
                                    : 'bg-white/60 hover:bg-white/90 text-[#4F7942] border border-[#4F7942]/20 hover:border-[#4F7942]/40'
                            }`}
                            title={isSpeaking ? (t('stop_reading') || 'Leállítás') : (t('read_aloud') || 'Felolvasás')}
                        >
                            {isSpeaking ? (
                                <>
                                    <RiStopCircleLine size={16} className="text-red-700 animate-spin" />
                                    <span>{t('stop_reading') || 'Leállítás'}</span>
                                </>
                            ) : (
                                <>
                                    <RiVolumeUpLine size={16} />
                                    <span>{t('read_aloud') || 'Felolvasás'}</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="story-content space-y-4 sm:space-y-6 text-sm sm:text-lg lg:text-lg text-surface leading-[1.6] sm:leading-[1.8] lg:leading-loose tracking-wide animate-in fade-in duration-500">
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
