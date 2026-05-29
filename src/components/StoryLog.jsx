'use client';

import { useGame } from '../context/GameContext';
import { useEffect, useRef } from 'react';
import { RiArrowRightSLine, RiFileWordLine, RiFilePdfLine } from '@remixicon/react';
import { SlPicture } from 'react-icons/sl';
import { storyTranslations } from '../data/story_translations';

export default function StoryLog() {
    const scrollContainerRef = useRef(null);
    const { storyLog, project, parseRichTextReadOnly, state, openLightbox, getAssetUrl, language, t } = useGame();

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
    }, [storyLog.length]);

    const exportToDocx = async () => {
        try {
            const { Document, Packer, Paragraph, TextRun, AlignmentType } = await import('docx');
            const doc = new Document({
                sections: [{
                    properties: {},
                    children: storyLog.flatMap((entry) => {
                        const element = project.elements[entry.elementId];
                        if (!element) return [];

                        const segments = (() => {
                            if (entry.elementId === '37ba3288-8b3b-4941-9734-98ca9053bb36') {
                                return parseRichTextReadOnly(t('game_title'), entry.elementId);
                            }
                            let content = element.content;
                            if (language === 'en' && storyTranslations[entry.elementId]) {
                                content = storyTranslations[entry.elementId].content || content;
                            } else if (language?.startsWith('sr') && storyTranslations[language]?.[entry.elementId]) {
                                content = storyTranslations[language][entry.elementId].content || content;
                            }
                            return parseRichTextReadOnly(content, entry.elementId);
                        })();
                        const paragraphs = segments.map(seg => {
                            const text = seg.content.replace(/<[^>]*>/g, '').trim();
                            return new Paragraph({
                                children: [new TextRun({ text, size: 24 })],
                                alignment: AlignmentType.JUSTIFIED,
                                spacing: { after: 200 }
                            });
                        });

                        if (entry.choiceMade) {
                            paragraphs.push(new Paragraph({
                                children: [new TextRun({ text: `> ${entry.choiceMade}`, italic: true, size: 18, color: "666666" })],
                                spacing: { before: 200, after: 400 }
                            }));
                        }
                        return paragraphs;
                    })
                }]
            });

            const { data: { user } } = await (await import('@/utils/supabase/client')).createClient().auth.getUser();
            const username = user?.email?.split('@')[0] || 'vendeg';
            const filename = `Homokhátság Hősei-${username}-${new Date().toISOString().split('T')[0]}.docx`;

            const blob = await Packer.toBlob(doc);
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Export DOCX error:', err);
        }
    };

    const exportToPdf = async () => {
        try {
            const html2pdf = (await import('html2pdf.js')).default;
            const { data: { user } } = await (await import('@/utils/supabase/client')).createClient().auth.getUser();
            const username = user?.email?.split('@')[0] || 'vendeg';
            const filename = `Homokhátság Hősei-${username}-${new Date().toISOString().split('T')[0]}.pdf`;

            // Create a styled off-screen element for PDF rendering
            const element = document.createElement('div');
            element.style.padding = '20px 40px';
            element.style.color = '#000000';
            element.style.backgroundColor = '#ffffff';
            element.style.fontFamily = 'Arial, sans-serif';
            element.style.fontSize = '12px';
            element.style.width = '750px';
            element.style.boxSizing = 'border-box';

            let contentStr = `<h1 style="text-align: center; margin-bottom: 40px; color: #92400e;">Homokhátság Hősei</h1>`;
            storyLog.forEach((entry) => {
                const el = project.elements[entry.elementId];
                if (!el) return;

                let nodeContentForPdf = entry.elementId === '37ba3288-8b3b-4941-9734-98ca9053bb36' 
                    ? `<strong>${t('game_title')}</strong>` 
                    : el.content;
                
                if (entry.elementId !== '37ba3288-8b3b-4941-9734-98ca9053bb36') {
                    if (language === 'en' && storyTranslations[entry.elementId]) {
                        nodeContentForPdf = storyTranslations[entry.elementId].content || nodeContentForPdf;
                    } else if (language?.startsWith('sr') && storyTranslations[language]?.[entry.elementId]) {
                        nodeContentForPdf = storyTranslations[language][entry.elementId].content || nodeContentForPdf;
                    }
                }
                contentStr += `<div style="text-align: justify; line-height: 1.6; margin-bottom: 20px; width: 100%; white-space: pre-wrap;">${nodeContentForPdf}</div>`;

                if (entry.choiceMade) {
                    contentStr += `<div style="font-style: italic; color: #666; margin-bottom: 30px; padding-left: 20px;">&gt; ${entry.choiceMade}</div>`;
                }
            });

            element.innerHTML = contentStr;

            const opt = {
                margin: 15,
                filename: filename,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, letterRendering: true, width: 750 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            await html2pdf().set(opt).from(element).save();
        } catch (err) {
            console.error('Export PDF error:', err);
        }
    };


    if (!storyLog || storyLog.length === 0) {
        return (
            <div className="flex items-center justify-center h-32 text-zinc-900 font-medium text-sm text-center px-4">
                {t('no_entries') || 'Még nincs bejegyzés.'}
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Scrollable Content */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto px-1 pt-1 scroll-smooth no-scrollbar"
            >
                {/* Spacer to give room before entries */}
                <div className="h-1" />

                {storyLog.map((entry, idx) => {
                    const isCurrent = idx === storyLog.length - 1;
                    const element = project.elements[entry.elementId];
                    if (!element) return null;

                    const coverUrl = element.assets?.cover?.id ? getAssetUrl(element.assets.cover.id) : null;
                    const segments = parseRichTextReadOnly(element.content, entry.elementId);

                    return (
                        <div
                            key={`${entry.elementId}-${idx}`}
                            className={`flex flex-col border-b border-white/5 last:border-0 ${isCurrent ? 'mb-2' : 'opacity-70 mb-4'}`}
                        >
                            {/* Body text with inline image icon */}
                            <div className={`px-4 py-2 text-xs lg:text-sm text-justify leading-relaxed font-medium ${isCurrent ? 'text-zinc-900' : 'text-zinc-900/80'}`}>
                                {coverUrl && (
                                    <button
                                        onClick={() => openLightbox?.(coverUrl)}
                                        className="float-left mr-3 mb-1 w-10 h-10 rounded-lg bg-white hover:bg-zinc-100 hover:text-[#3d5e33] flex items-center justify-center transition-all shadow-md border border-white/20"
                                        title={t('open_lightbox_hint') || 'Kép megnyitása teljes képernyőn'}
                                    >
                                        <SlPicture size={20} className="text-[#4F7942]" />
                                    </button>
                                )}
                                {(() => {
                                    if (entry.elementId === '37ba3288-8b3b-4941-9734-98ca9053bb36') {
                                        return <div className="story-content-log mb-3 last:mb-0"><strong>{t('game_title')}</strong></div>;
                                    }
                                    let content = element.content;
                                    if (language === 'en' && storyTranslations[entry.elementId]) {
                                        content = storyTranslations[entry.elementId].content || content;
                                    } else if (language?.startsWith('sr') && storyTranslations[language]?.[entry.elementId]) {
                                        content = storyTranslations[language][entry.elementId].content || content;
                                    }
                                    const segments = parseRichTextReadOnly(content, entry.elementId);
                                    return segments.map((seg, sIdx) => (
                                        <div
                                            key={sIdx}
                                            dangerouslySetInnerHTML={{ __html: seg.content }}
                                            className="story-content-log mb-3 last:mb-0"
                                        />
                                    ));
                                })()}
                            </div>

                            {/* Choice made */}
                            {entry.choiceMade && (
                                <div className="flex items-start gap-1.5 px-4 pb-2 text-xs text-zinc-900/90 italic font-semibold">
                                    <RiArrowRightSLine size={14} className="mt-0.5 shrink-0 text-amber-500/50" />
                                    <span>{entry.choiceMade}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
                {/* Space bottom to scroll above sticky bar */}
                <div className="h-0" />
            </div>

            {/* Export Buttons Footer */}
            <div className="flex items-center gap-3 px-4 py-2 z-20 mt-auto">
                <span className="text-xs text-zinc-900/60 mr-auto font-bold px-1">{t('save_story') || 'Mese mentése'}</span>
                <button
                    onClick={exportToDocx}
                    className="p-2 rounded-lg text-zinc-900/60 hover:text-blue-600 transition-colors"
                    title="Word (.docx)"
                >
                    <RiFileWordLine size={18} />
                </button>
                <button
                    onClick={exportToPdf}
                    className="p-2 rounded-lg text-zinc-900/60 hover:text-red-600 transition-colors"
                    title="PDF (.pdf)"
                >
                    <RiFilePdfLine size={18} />
                </button>
            </div>
        </div>
    );
}
