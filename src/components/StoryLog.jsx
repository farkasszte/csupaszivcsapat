'use client';

import { useGame } from '../context/GameContext';
import { useEffect, useRef } from 'react';
import { RiArrowRightSLine } from '@remixicon/react';

export default function StoryLog() {
    const containerRef = useRef(null);
    const { storyLog, project, parseRichTextReadOnly, state } = useGame();

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [storyLog.length]);


    if (!storyLog || storyLog.length === 0) {
        return (
            <div className="flex items-center justify-center h-32 text-[#FDF5E6] text-sm">
                Még nincs bejegyzés.
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="flex flex-col gap-0 overflow-y-auto pr-1 h-full max-h-[60vh] lg:max-h-[70vh] scroll-smooth"
        >

            {storyLog.map((entry, idx) => {
                const isCurrent = idx === storyLog.length - 1;
                const element = project.elements[entry.elementId];
                if (!element) return null;

                // Render body text from project data in read-only mode (no script side-effects)
                const segments = parseRichTextReadOnly(element.content, entry.elementId);
                const bodyText = segments
                    .map(seg => seg.type === 'html'
                        ? seg.content.replace(/<[^>]*>/g, '')
                        : seg.content)
                    .join(' ')
                    .trim();



                return (
                    <div key={`${entry.elementId}-${idx}`} className={`flex flex-col border-b border-white/5 last:border-0 ${isCurrent ? '' : 'opacity-75'}`}>
                        {/* Element title */}
                        <div className={`px-4 pt-3 pb-1 text-sm font-semibold ${isCurrent ? 'text-[#FDF5E6]' : 'text-[#FDF5E6]'}`}>
                            <span dangerouslySetInnerHTML={{ __html: element.title }} />
                            {isCurrent && (
                                <span className="ml-2 text-xs text-[#FDF5E6] font-normal">← most</span>
                            )}
                        </div>

                        {/* Body text */}
                        {bodyText && (
                            <div className={`px-4 pb-2 text-xs leading-relaxed ${isCurrent ? 'text-[#FDF5E6]' : 'text-[#FDF5E6]'}`}>
                                {bodyText}
                            </div>
                        )}

                        {/* Choice made (arrow to next) */}
                        {entry.choiceMade && (
                            <div className="flex items-start gap-1.5 px-4 py-2 text-xs text-[#FDF5E6] bg-amber-900/10">
                                <RiArrowRightSLine size={14} className="mt-0.5 shrink-0 text-[#FDF5E6]" />
                                <span>{entry.choiceMade}</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>

    );
}
