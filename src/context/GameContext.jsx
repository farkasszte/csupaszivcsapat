'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import projectSettings from '../data/project_settings.json';
import { useGameStore } from '../store/useGameStore';
import { ArcScript } from '../logic/ArcScript';
import { translations } from '../data/translations';
import imageDescriptions from '../data/image_descriptions.json';
import ExternalLinkModal from '../components/ExternalLinkModal';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

const arcScript = new ArcScript(projectSettings);

export const GameProvider = ({ children }) => {
    const store = useGameStore();
    const [showLog, setShowLog] = useState(false);
    const [showDashboard, setShowDashboard] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showLibrary, setShowLibrary] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showImages, setShowImages] = useState(false);
    const [lastActiveTab, setLastActiveTab] = useState('menu');
    const [lightboxImage, setLightboxImage] = useState(null);
    const [selectedMapLocation, setSelectedMapLocation] = useState(null);
    const [librarySearchQuery, setLibrarySearchQuery] = useState('');
    const [externalModalUrl, setExternalModalUrl] = useState(null);
    const [storyTranslations, setStoryTranslations] = useState(null);

    // Lazy load heavy storyTranslations (~256 KB) only when non-Hungarian language is selected
    useEffect(() => {
        if (store.language && store.language !== 'hu' && !storyTranslations) {
            import('../data/story_translations')
                .then(m => setStoryTranslations(m.storyTranslations))
                .catch(err => console.error('Failed to load story translations:', err));
        }
    }, [store.language, storyTranslations]);

    // Synchronize HTML root lang attribute with store.language for accessibility & screen readers
    useEffect(() => {
        if (typeof document !== 'undefined') {
            const langMap = {
                'hu': 'hu',
                'en': 'en',
                'sr-latn': 'sr-Latn',
                'sr-cyrl': 'sr-Cyrl',
            };
            document.documentElement.lang = langMap[store.language] || store.language || 'hu';
        }
    }, [store.language]);

    const openExternalUrl = (url, forceModal = false) => {
        if (!url) return;
        if (store.presentationMode || forceModal) {
            setExternalModalUrl(url);
        } else {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const closeExternalUrl = () => {
        setExternalModalUrl(null);
    };

    // Text-to-Speech (TTS) centralized handling
    const [isSpeaking, setIsSpeaking] = useState(false);

    const stopSpeech = () => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    const getCurrentStoryText = () => {
        const el = projectSettings.elements[store.currentElementId];
        if (!el?.content) return '';
        let raw = el.content;
        if (store.language === 'en' && storyTranslations?.[store.currentElementId]) {
            raw = storyTranslations[store.currentElementId].content || raw;
        } else if (store.language?.startsWith('sr') && storyTranslations?.[store.language]?.[store.currentElementId]) {
            raw = storyTranslations[store.language][store.currentElementId].content || raw;
        }
        if (typeof document !== 'undefined') {
            const tmp = document.createElement('div');
            tmp.innerHTML = raw;
            return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
        }
        return raw.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    };

    const toggleSpeech = () => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
            alert(t('tts_unsupported') || 'A böngésződ nem támogatja a szövegfelolvasást.');
            return;
        }

        if (isSpeaking) {
            stopSpeech();
            return;
        }

        const plainText = getCurrentStoryText();
        if (!plainText) return;

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(plainText);
        const langCode = store.language === 'en' ? 'en-US' : store.language?.startsWith('sr') ? 'sr-RS' : 'hu-HU';
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

    useEffect(() => {
        stopSpeech();
    }, [store.currentElementId, store.language]);

    useEffect(() => {
        return () => {
            stopSpeech();
        };
    }, []);

    useEffect(() => {
        const disableContextMenu = (e) => {
            e.preventDefault();
        };
        window.addEventListener('contextmenu', disableContextMenu);
        return () => window.removeEventListener('contextmenu', disableContextMenu);
    }, []);

    const toggleLog = (val) => {
        const next = val !== undefined ? val : !showLog;
        setShowLog(next);
        if (next) {
            setLastActiveTab('log');
            setShowDashboard(false); setShowMap(false); setShowMenu(false); setShowLibrary(false); setShowProfile(false); setShowImages(false);
        }
    };



    const toggleDashboard = (val) => {
        const next = val !== undefined ? val : !showDashboard;
        setShowDashboard(next);
        if (next) {
            setLastActiveTab('dashboard');
            setShowLog(false); setShowMap(false); setShowMenu(false); setShowLibrary(false); setShowProfile(false); setShowImages(false);
        }
    };



    const toggleMap = (val) => {
        const next = val !== undefined ? val : !showMap;
        setShowMap(next);
        if (next) {
            setLastActiveTab('map');
            setShowLog(false); setShowDashboard(false); setShowMenu(false); setShowLibrary(false); setShowProfile(false); setShowImages(false);
        }
    };



    const toggleMenu = (val) => {
        const next = val !== undefined ? val : !showMenu;
        setShowMenu(next);
        if (next) {
            setLastActiveTab('menu');
            setShowLog(false); setShowDashboard(false); setShowMap(false); setShowLibrary(false); setShowProfile(false); setShowImages(false);
        }
    };



    const toggleLibrary = (val) => {
        const next = val !== undefined ? val : !showLibrary;
        setShowLibrary(next);
        if (next) {
            setLastActiveTab('library');
            setShowLog(false); setShowDashboard(false); setShowMap(false); setShowMenu(false); setShowProfile(false); setShowImages(false);
        }
    };

    const toggleProfile = (val) => {
        const next = val !== undefined ? val : !showProfile;
        setShowProfile(next);
        if (next) {
            setLastActiveTab('profile');
            setShowLog(false); setShowDashboard(false); setShowMap(false); setShowMenu(false); setShowLibrary(false); setShowImages(false);
        }
    };

    const toggleImages = (val) => {
        const next = val !== undefined ? val : !showImages;
        setShowImages(next);
        if (next) {
            setLastActiveTab('images');
            setShowLog(false); setShowDashboard(false); setShowMap(false); setShowMenu(false); setShowLibrary(false); setShowProfile(false);
        }
    };

    const togglePanel = () => {
        const isOpen = showLog || showDashboard || showMap || showMenu || showLibrary || showProfile || showImages;
        if (isOpen) {
            setShowLog(false); setShowDashboard(false); setShowMap(false); setShowMenu(false); setShowLibrary(false); setShowProfile(false); setShowImages(false);
        } else {
            if (lastActiveTab === 'log') toggleLog(true);
            else if (lastActiveTab === 'dashboard') toggleDashboard(true);
            else if (lastActiveTab === 'map') toggleMap(true);
            else if (lastActiveTab === 'library') toggleLibrary(true);
            else if (lastActiveTab === 'profile') toggleProfile(true);
            else if (lastActiveTab === 'images') toggleImages(true);
            else toggleMenu(true);
        }
    };



    const openLightbox = (url) => setLightboxImage(url);
    const closeLightbox = () => setLightboxImage(null);

    const toggleMute = () => store.setIsMuted(!store.isMuted);

    // Initial load and Auto-Save listeners
    useEffect(() => {
        const init = async () => {
            // Try to load saved state from Supabase first
            await store.autoLoad();

            // Read fresh state after autoLoad (React hook snapshot is stale here)
            const fresh = useGameStore.getState();
            if (Object.keys(fresh.visits).length === 0 && fresh.isStarted) {
                fresh.visitElement(projectSettings.startingElement);
                fresh.initStoryLog();
            } else if (fresh.isStarted && fresh.storyLog.length === 0) {
                fresh.initStoryLog();
            }
        };
        init();

        // Auto-save on visibility change (tab switch, minimize)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                store.saveGame(true);
            }
        };

        // Auto-save on page close / refresh
        const handleBeforeUnload = () => {
            store.saveGame(true);
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);


    const getAssetUrl = (assetId) => {
        if (!assetId) return null;
        const asset = projectSettings.assets[assetId];
        if (!asset) {
            console.warn(`Asset not found: ${assetId}`);
            return null;
        }
        const type = asset.type || '';
        // Handle both 'template-audio' and generic 'audio' types
        const isAudio = type.toLowerCase().includes('audio');
        const folder = isAudio ? 'Audio' : 'Images';
        return `/assets/${folder}/${asset.name}`;
    };

    const getImageAlt = (imageNameOrUrl) => {
        if (!imageNameOrUrl) return '';
        try {
            const clean = decodeURIComponent(imageNameOrUrl);
            const filename = clean.split('/').pop().split('?')[0];
            const desc = imageDescriptions[filename];
            if (!desc) return '';
            const lang = store.language || 'hu';
            return desc[lang] || desc['hu'] || desc['en'] || '';
        } catch {
            return '';
        }
    };

    const getAssetAlt = (assetId) => {
        if (!assetId) return '';
        const asset = projectSettings.assets?.[assetId];
        if (!asset?.name) return '';
        return getImageAlt(asset.name);
    };

    const renderRichText = (html) => {
        return arcScript.renderRichText(html, { visits: store.visits, variables: store.variables }, store.currentElementId);
    };

    const parseRichText = (html) => {
        return arcScript.parseRichText(html, { visits: store.visits, variables: store.variables }, store.currentElementId);
    };

    // Read-only version for the story log — never executes scripts, just renders text
    const parseRichTextReadOnly = (html, elementId) => {
        return arcScript.parseRichText(
            html,
            { visits: store.visits, variables: { ...store.variables } },
            elementId ?? store.currentElementId,
            { readOnly: true }
        );
    };

    const t = (key) => {
        return translations[store.language]?.[key] || translations['hu']?.[key] || key;
    };

    const isCyrillic = store.language === 'sr-cyrl';
    const effectiveFont = isCyrillic ? 'montserrat' : (store.fontFamily || 'montserrat');

    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-font', effectiveFont);
        }
    }, [effectiveFont]);

    const value = {
        project: projectSettings,
        currentElementId: store.currentElementId,
        language: store.language,
        setLanguage: store.setLanguage,
        fontFamily: store.fontFamily || 'montserrat',
        setFontFamily: store.setFontFamily,
        effectiveFont,
        isCyrillic,
        t,
        state: { 
            visits: store.visits, 
            variables: store.variables,
            finishedStories: store.finishedStories 
        },
        loading: store.loading,
        error: store.error,
        message: store.message,
        storyLog: store.storyLog,
        discoveredComponents: store.discoveredComponents,
        recentDiscoveries: store.recentDiscoveries,
        clearRecentDiscovery: store.clearRecentDiscovery,
        showLog,

        setShowLog: toggleLog,
        showDashboard,
        setShowDashboard: toggleDashboard,
        showMap,
        setShowMap: toggleMap,
        showMenu,
        setShowMenu: toggleMenu,
        showLibrary,
        setShowLibrary: toggleLibrary,
        showProfile,
        setShowProfile: toggleProfile,
        showImages,
        setShowImages: toggleImages,
        togglePanel,
        selectedMapLocation,
        setSelectedMapLocation,
        librarySearchQuery,
        setLibrarySearchQuery,
        typewriterSpeed: store.typewriterSpeed,
        setTypewriterSpeed: store.setTypewriterSpeed,
        transitionsEnabled: store.transitionsEnabled,
        setTransitionsEnabled: store.setTransitionsEnabled,
        volume: store.volume,
        setVolume: store.setVolume,
        navigateTo: store.navigateTo,






        executeScript: store.executeScript,
        evaluate: store.evaluate,
        saveGame: store.saveGame,
        loadGame: store.loadGame,
        resetGame: store.resetGame,
        clearMessage: store.clearMessage,
        getAssetUrl,
        getImageAlt,
        getAssetAlt,

        renderRichText,
        parseRichText,
        parseRichTextReadOnly,
        resolveBranch: store.resolveBranch,
        resolveTarget: store.resolveTarget,
        lightboxImage,
        openLightbox,
        closeLightbox,
        isMuted: store.isMuted,
        toggleMute,
        colorFilter: store.colorFilter,
        setColorFilter: store.setColorFilter,
        presentationMode: store.presentationMode,
        setPresentationMode: store.setPresentationMode,
        ttsEnabled: store.ttsEnabled,
        setTtsEnabled: store.setTtsEnabled,
        isSpeaking,
        toggleSpeech,
        stopSpeech,
        externalModalUrl,
        openExternalUrl,
        closeExternalUrl,
        storyTranslations,
        isStarted: store.isStarted,
        startStory: store.startStory,
    };




    return (
        <GameContext.Provider value={value}>
            {children}
            <ExternalLinkModal />
        </GameContext.Provider>
    );
};
