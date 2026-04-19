'use client';

import { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';

/**
 * Maps story board IDs to their respective track numbers.
 * Track 0: Intro/Hub
 * Track 1: Story 1 (Ürge Panni)
 * Track 2: Story 2 (Szalakóta Szilvia)
 * Track 3: Story 3 (Túzok tanár úr)
 * Track 4: Finale (All 3 finished)
 */
const STORY_BOARDS = {
    '630fdb8a-48d6-473e-9974-2460f7eb2b41': 1,
    '6a9aecfe-b7aa-46ba-8946-6a61882f883c': 2,
    'f571e9b2-4ab3-42ee-8f86-5091ca1aa981': 3
};

const STARTING_ELEMENT_ID = "37ba3288-8b3b-4941-9734-98ca9053bb36";

export default function BackgroundMusic() {
    const { state, currentElementId, project, isMuted, volume } = useGame();
    const audioRef = useRef(null);
    const fadeOutIntervalRef = useRef(null);
    const fadeInIntervalRef = useRef(null);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [hasInteracted, setHasInteracted] = useState(false);

    // Track user interaction for auto-play compliance
    useEffect(() => {
        const handleInteraction = () => {
            if (!hasInteracted) {
                setHasInteracted(true);
            }
        };
        window.addEventListener('click', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);
        window.addEventListener('keydown', handleInteraction);
        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };
    }, [hasInteracted]);

    // Determine the correct track based on game state
    useEffect(() => {
        if (!project || !project.boards) return;

        let targetTrack = null;

        const finishedCount = state?.finishedStories?.length || 0;

        if (finishedCount === 3) {
            targetTrack = 4;
        } else {
            // Find which board the current element belongs to
            const boardId = Object.keys(project.boards).find(id => 
                project.boards[id].elements?.includes(currentElementId)
            );
            
            if (STORY_BOARDS[boardId]) {
                targetTrack = STORY_BOARDS[boardId];
            } else {
                // Intro / Hub / Other
                // Music only starts after the first interaction or moving away from start screen
                if (hasInteracted && currentElementId !== STARTING_ELEMENT_ID) {
                    targetTrack = 0;
                } else if (hasInteracted && currentTrack === 0) {
                    // Stay on track 0 if we already started it
                    targetTrack = 0;
                }
            }
        }

        if (targetTrack !== currentTrack) {
            setCurrentTrack(targetTrack);
        }
    }, [currentElementId, state?.finishedStories, project, hasInteracted, currentTrack]);

    // Manage audio playback and switching
    useEffect(() => {
        if (!hasInteracted || currentTrack === null) return;

        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.loop = true;
        }

        const audio = audioRef.current;
        const newSrc = `/assets/Audio/${currentTrack}.ogg`;
        const fullNewSrc = window.location.origin + newSrc;

        if (audio.src !== fullNewSrc) {
            // Stop any existing fade intervals
            if (fadeOutIntervalRef.current) clearInterval(fadeOutIntervalRef.current);
            if (fadeInIntervalRef.current) clearInterval(fadeInIntervalRef.current);

            // Fade out then swap
            const fadeOutStep = audio.volume / 40; // 40 steps * 50ms = 2000ms
            fadeOutIntervalRef.current = setInterval(() => {
                if (audio.volume > fadeOutStep) {
                    audio.volume -= fadeOutStep;
                } else {
                    clearInterval(fadeOutIntervalRef.current);
                    fadeOutIntervalRef.current = null;
                    
                    audio.pause();
                    audio.src = newSrc;
                    audio.load();
                    audio.volume = 0;
                    audio.muted = isMuted;
                    
                    if (!isMuted) {
                        audio.play().then(() => {
                            const fadeInStep = volume / 40;
                            fadeInIntervalRef.current = setInterval(() => {
                                if (audio.volume < (volume - fadeInStep)) {
                                    audio.volume += fadeInStep;
                                } else {
                                    audio.volume = volume;
                                    clearInterval(fadeInIntervalRef.current);
                                    fadeInIntervalRef.current = null;
                                }
                            }, 50);
                        }).catch(e => console.warn("Audio play blocked/failed:", e));
                    }
                }
            }, 50);
        }
    }, [currentTrack, hasInteracted]);

    // Sync volume and mute settings
    useEffect(() => {
        if (audioRef.current) {
            const audio = audioRef.current;
            audio.muted = isMuted;
            // Only update volume directly if not currently fading
            if (!fadeOutIntervalRef.current && !fadeInIntervalRef.current) {
                audio.volume = isMuted ? 0 : volume;
            }
        }
    }, [isMuted, volume]);

    return null;
}
