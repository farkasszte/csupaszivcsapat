'use client';

import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import {
    RiCloseLine,
    RiExternalLinkLine,
    RiQrCodeLine,
    RiTvLine,
    RiRefreshLine
} from '@remixicon/react';
import { useFocusTrap } from '../hooks/useFocusTrap';

export default function ExternalLinkModal() {
    const { externalModalUrl, closeExternalUrl, t } = useGame();
    const [showQr, setShowQr] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const modalRef = useFocusTrap(Boolean(externalModalUrl), closeExternalUrl);

    useEffect(() => {
        setIsLoading(true);
        setShowQr(false);
    }, [externalModalUrl]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && externalModalUrl) {
                closeExternalUrl();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [externalModalUrl, closeExternalUrl]);

    if (!externalModalUrl) return null;

    let domain = '';
    try {
        domain = new URL(externalModalUrl).hostname;
    } catch {
        domain = externalModalUrl;
    }

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(externalModalUrl)}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
            {/* Modal Container */}
            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="external-modal-domain"
                className="relative w-full max-w-5xl h-[88vh] bg-[#F5F2EB] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#4F7942]/30 modal-gpu-accelerated"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#4F7942] text-white shrink-0 shadow-md">
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="p-1.5 bg-white/10 rounded-lg shrink-0">
                            <RiTvLine className="w-5 h-5 text-amber-300" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold uppercase tracking-wider text-white/80 leading-none">
                                {t('presentation_mode') || 'Bemutató mód'} &bull; {t('external_modal_title') || 'Külső oldal'}
                            </span>
                            <span id="external-modal-domain" className="text-sm font-bold truncate text-white mt-0.5" title={externalModalUrl}>
                                {domain}
                            </span>
                        </div>
                    </div>

                    {/* Actions & Close Button */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* QR Code toggle */}
                        <button
                            onClick={() => setShowQr(!showQr)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                showQr
                                    ? 'bg-amber-400 text-zinc-950 shadow-sm'
                                    : 'bg-white/15 hover:bg-white/25 text-white'
                            }`}
                            title={t('show_qr') || 'QR-kód'}
                        >
                            <RiQrCodeLine className="w-4 h-4" />
                            <span className="hidden sm:inline">{showQr ? (t('webpage') || 'Weboldal') : (t('show_qr') || 'QR-kód')}</span>
                        </button>

                        {/* Open in new tab button */}
                        <a
                            href={externalModalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer"
                            title={t('open_in_new_tab') || 'Megnyitás új lapon'}
                        >
                            <RiExternalLinkLine className="w-4 h-4" />
                            <span className="hidden sm:inline">{t('open_in_new_tab') || 'Új lapon'}</span>
                        </a>

                        {/* Prominent Close button */}
                        <button
                            onClick={closeExternalUrl}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer ml-1"
                        >
                            <RiCloseLine className="w-5 h-5" />
                            <span>{t('close') || 'Bezárás'}</span>
                        </button>
                    </div>
                </div>

                {/* Notice Bar */}
                <div className="bg-amber-100 border-b border-amber-200 px-4 py-1.5 text-amber-900 text-xs flex items-center justify-between gap-2 shrink-0">
                    <span className="truncate">
                        💡 {t('iframe_notice') || 'Ha a külső tartalom nem töltődik be, használd a QR-kód gombot vagy nyisd meg új lapon.'}
                    </span>
                    <button
                        onClick={() => {
                            setIsLoading(true);
                            const frame = document.getElementById('external-iframe');
                            if (frame) frame.src = externalModalUrl;
                        }}
                        className="flex items-center gap-1 text-xs font-bold text-amber-900 hover:underline shrink-0 cursor-pointer"
                    >
                        <RiRefreshLine className="w-3.5 h-3.5" />
                        {t('refresh') || 'Frissítés'}
                    </button>
                </div>

                {/* Body Area */}
                <div className="relative flex-1 w-full bg-white overflow-hidden">
                    {showQr ? (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-zinc-50">
                            <div className="p-4 bg-white rounded-2xl shadow-lg border border-zinc-200 mb-4">
                                <img
                                    src={qrUrl}
                                    alt={`QR code for ${externalModalUrl}`}
                                    className="w-56 h-56 sm:w-64 sm:h-64 object-contain"
                                />
                            </div>
                            <h3 className="text-base font-bold text-zinc-900 mb-1">
                                {t('scan_qr_title') || 'Olvasd be a telefonoddal!'}
                            </h3>
                            <p className="text-xs text-zinc-600 max-w-md break-all">
                                {externalModalUrl}
                            </p>
                            <button
                                onClick={() => setShowQr(false)}
                                className="mt-4 px-4 py-2 bg-[#4F7942] text-white text-xs font-bold rounded-xl shadow hover:bg-[#3d5e33] transition-colors cursor-pointer"
                            >
                                {t('back_to_webview') || 'Vissza a böngésző nézethez'}
                            </button>
                        </div>
                    ) : (
                        <>
                            {isLoading && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/90 backdrop-blur-xs">
                                    <div className="w-8 h-8 border-4 border-[#4F7942] border-t-transparent rounded-full animate-spin mb-2" />
                                    <span className="text-xs font-semibold text-[#4F7942]">{t('loading_webpage') || 'Weboldal betöltése...'}</span>
                                </div>
                            )}

                            <iframe
                                id="external-iframe"
                                src={externalModalUrl}
                                title="External view"
                                className="w-full h-full border-0"
                                onLoad={() => setIsLoading(false)}
                                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
