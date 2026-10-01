'use client';

import { useEffect, useRef } from 'react';

/**
 * Custom hook to trap keyboard focus within a modal/dialog container
 * and restore focus to the previously focused element upon closing.
 */
export function useFocusTrap(isOpen, onClose) {
    const containerRef = useRef(null);
    const previousFocusRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;

        // Remember previously focused element
        if (typeof document !== 'undefined') {
            previousFocusRef.current = document.activeElement;
        }

        const container = containerRef.current;
        if (!container) return;

        const getFocusable = () => {
            return Array.from(container.querySelectorAll(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )).filter(el => el.offsetParent !== null || el.offsetWidth > 0 || el.offsetHeight > 0);
        };

        // Give small timeout to ensure DOM is rendered
        const timer = setTimeout(() => {
            const focusables = getFocusable();
            if (focusables.length > 0) {
                // Focus on the first element or input if available
                const preferred = focusables.find(el => el.tagName === 'INPUT') || focusables[0];
                preferred.focus();
            }
        }, 50);

        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && onClose) {
                e.stopPropagation();
                onClose();
                return;
            }

            if (e.key !== 'Tab') return;

            const focusables = getFocusable();
            if (focusables.length === 0) {
                e.preventDefault();
                return;
            }

            const first = focusables[0];
            const last = focusables[focusables.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === first || !container.contains(document.activeElement)) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last || !container.contains(document.activeElement)) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('keydown', handleKeyDown);
            if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
                previousFocusRef.current.focus();
            }
        };
    }, [isOpen, onClose]);

    return containerRef;
}
