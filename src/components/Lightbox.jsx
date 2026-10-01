'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useGame } from '../context/GameContext';
import { getColorFilterStyle } from './StoryEngine';
import { RiCloseLine } from '@remixicon/react';
import { useFocusTrap } from '../hooks/useFocusTrap';

export const Lightbox = () => {
    const { lightboxImage, closeLightbox, colorFilter, t, getImageAlt } = useGame();
    const modalRef = useFocusTrap(Boolean(lightboxImage), closeLightbox);

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
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label={t?.('lightbox_title') || 'Kép nagyítása'}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md transition-all duration-300 animate-in fade-in"
            onClick={closeLightbox}
        >
            {/* Accessible Close Button */}
            <button
                type="button"
                onClick={closeLightbox}
                aria-label={t?.('close') || 'Bezárás'}
                className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
                <RiCloseLine size={24} />
            </button>

            <div
                className="relative w-full h-full flex items-center justify-center p-4 animate-in zoom-in-95 duration-300 modal-gpu-accelerated"
            >
                <img
                    src={lightboxImage}
                    alt={getImageAlt?.(lightboxImage) || t?.('lightbox_title') || 'Kép nagyítása'}
                    className="max-w-[95vw] max-h-[95vh] md:max-w-[90vw] md:max-h-[90vh] lg:max-w-[85vw] lg:max-h-[85vh] object-contain rounded-lg shadow-2xl border border-white/10 transition-transform duration-500"
                    style={{ filter: getColorFilterStyle(colorFilter) }}
                />
            </div>

        </div>,
        document.body
    );
};
