'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../context/GameContext';
import { RiCloseLine } from '@remixicon/react';
import { getColorFilterStyle } from './StoryEngine';

export const Lightbox = () => {
    const { lightboxImage, closeLightbox, colorFilter } = useGame();


    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') closeLightbox();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [closeLightbox]);

    if (!lightboxImage) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md transition-all duration-300 animate-in fade-in"
            onClick={closeLightbox}
        >
            <button
                className="absolute top-6 right-6 p-2 text-white/50 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full z-60"
                onClick={(e) => { e.stopPropagation(); closeLightbox(); }}
            >
                <RiCloseLine size={32} />
            </button>

            <div
                className="relative w-full h-full flex items-center justify-center p-4 animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={lightboxImage}
                    alt="Full size view"
                    className="max-w-[90vw] max-h-[90vh] md:max-w-[90vw] md:max-h-[90vh] lg:max-w-[85vw] lg:max-h-[85vh] object-contain rounded-lg shadow-2xl border border-white/10 transition-transform duration-500 portrait:rotate-90 portrait:max-w-[90vh] portrait:max-h-[90vw] md:portrait:rotate-0 md:portrait:max-w-[90vw] md:portrait:max-h-[90vh]"
                    style={{ filter: getColorFilterStyle(colorFilter) }}
                />
            </div>

        </div>,
        document.body
    );
};
