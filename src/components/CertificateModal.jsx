'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import {
    RiCloseLine,
    RiDownloadLine,
    RiAwardLine,
    RiUser3Line,
    RiCheckLine
} from '@remixicon/react';

export default function CertificateModal({ isOpen, onClose }) {
    const { state, t } = useGame();
    const score = state?.variables?.score ?? 0;
    const [playerName, setPlayerName] = useState('Panni Barátja');
    const [isGenerating, setIsGenerating] = useState(false);
    const canvasRef = useRef(null);

    // Calculate level title
    const rankTitle = score >= 50
        ? (t('level_4') || 'A Vadon Hőse')
        : score >= 25
            ? (t('level_3') || 'Mentőcsapat-tag')
            : score >= 10
                ? (t('level_2') || 'Természetbarát')
                : (t('level_1') || 'Kezdő Megfigyelő');

    const formattedDate = new Intl.DateTimeFormat('hu-HU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date());

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Draw high-resolution certificate on HTML5 Canvas and download
    const handleDownloadCertificate = () => {
        setIsGenerating(true);
        const canvas = document.createElement('canvas');
        canvas.width = 1600;
        canvas.height = 1130;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            setIsGenerating(false);
            return;
        }

        // 1. Parchment Background
        const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        bgGrad.addColorStop(0, '#FFFDF8');
        bgGrad.addColorStop(0.5, '#F9F4E8');
        bgGrad.addColorStop(1, '#F2EAD8');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Outer Ornamental Borders
        ctx.strokeStyle = '#4F7942';
        ctx.lineWidth = 14;
        ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

        ctx.strokeStyle = '#D4AF37'; // Gold
        ctx.lineWidth = 4;
        ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

        // Corner Ornaments
        const drawCorner = (x, y, flipX, flipY) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
            ctx.fillStyle = '#D4AF37';
            ctx.beginPath();
            ctx.arc(0, 0, 24, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#4F7942';
            ctx.beginPath();
            ctx.arc(0, 0, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        };
        drawCorner(60, 60, false, false);
        drawCorner(canvas.width - 60, 60, true, false);
        drawCorner(60, canvas.height - 60, false, true);
        drawCorner(canvas.width - 60, canvas.height - 60, true, true);

        // 3. Header Titles
        ctx.textAlign = 'center';

        ctx.font = 'bold 30px "Montserrat", sans-serif';
        ctx.fillStyle = '#4F7942';
        ctx.letterSpacing = '6px';
        ctx.fillText('CSUPASZÍV KALANDOK • HOMOKHÁTSÁG', canvas.width / 2, 140);

        ctx.font = '900 68px "Montserrat", sans-serif';
        ctx.fillStyle = '#263d20';
        ctx.fillText('DÍSZOKLEVÉL', canvas.width / 2, 230);

        ctx.font = 'italic 500 28px "Montserrat", sans-serif';
        ctx.fillStyle = '#B45309'; // Amber
        ctx.fillText('A Homokhátság Természeti Értékeinek Megóvásáért', canvas.width / 2, 280);

        // Decorative separator line
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 250, 310);
        ctx.lineTo(canvas.width / 2 + 250, 310);
        ctx.stroke();

        // 4. Citation body
        ctx.font = '500 30px "Montserrat", sans-serif';
        ctx.fillStyle = '#3E2723';
        ctx.fillText('Ezennel tanúsítjuk és büszkén igazoljuk, hogy', canvas.width / 2, 380);

        // Player Name (Prominent & highlighted)
        ctx.font = 'bold 64px "Montserrat", sans-serif';
        ctx.fillStyle = '#1e3816';
        ctx.fillText(playerName.trim() || 'A Homokhátság Hőse', canvas.width / 2, 470);

        // Underline for name
        ctx.strokeStyle = '#4F7942';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2 - 350, 495);
        ctx.lineTo(canvas.width / 2 + 350, 495);
        ctx.stroke();

        ctx.font = '500 28px "Montserrat", sans-serif';
        ctx.fillStyle = '#3E2723';
        ctx.fillText('kiemelkedő bátorsággal, természetvédelmi tudással és önzetlen munkájával', canvas.width / 2, 560);
        ctx.fillText('aktívan részt vett a szárazság sújtotta tájak és a védett állatfajok megsegítésében.', canvas.width / 2, 605);

        // 5. Rank & Score Box
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#D4AF37';
        ctx.lineWidth = 3;
        const boxX = canvas.width / 2 - 360;
        const boxY = 660;
        const boxW = 720;
        const boxH = 110;
        ctx.roundRect(boxX, boxY, boxW, boxH, 20);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 36px "Montserrat", sans-serif';
        ctx.fillStyle = '#4F7942';
        ctx.fillText(`Kiérdemelt rang: ${rankTitle}`, canvas.width / 2, boxY + 48);

        ctx.font = '600 24px "Montserrat", sans-serif';
        ctx.fillStyle = '#78350F';
        ctx.fillText(`Megszerzett eredmény: ${score} pont • Kiskunsági Védelmi Érdemérem`, canvas.width / 2, boxY + 88);

        // 6. Seal
        const sealX = canvas.width / 2;
        const sealY = 910;
        ctx.fillStyle = '#D4AF37';
        ctx.beginPath();
        ctx.arc(sealX, sealY, 55, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#4F7942';
        ctx.beginPath();
        ctx.arc(sealX, sealY, 44, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 15px "Montserrat", sans-serif';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText('CSUPASZÍV', sealX, sealY - 8);
        ctx.fillText('PECSÉT', sealX, sealY + 12);
        ctx.fillText('★ 2026 ★', sealX, sealY + 28);

        // 7. Signatures
        // Left Signature: Ürge Panni
        ctx.font = 'italic bold 28px "Georgia", serif';
        ctx.fillStyle = '#263d20';
        ctx.fillText('Ürge Panni', 280, 890);
        ctx.strokeStyle = '#3E2723';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(180, 905);
        ctx.lineTo(380, 905);
        ctx.stroke();
        ctx.font = '600 19px "Montserrat", sans-serif';
        ctx.fillStyle = '#555';
        ctx.fillText('Mentőcsapat vezető', 280, 935);

        // Right Signature: Túzok Tanár Úr
        ctx.font = 'italic bold 28px "Georgia", serif';
        ctx.fillStyle = '#263d20';
        ctx.fillText('Túzok Tanár Úr', canvas.width - 280, 890);
        ctx.beginPath();
        ctx.moveTo(canvas.width - 380, 905);
        ctx.lineTo(canvas.width - 180, 905);
        ctx.stroke();
        ctx.font = '600 19px "Montserrat", sans-serif';
        ctx.fillStyle = '#555';
        ctx.fillText('Tudományos főtanácsadó', canvas.width - 280, 935);

        // Date at bottom
        ctx.font = '600 20px "Montserrat", sans-serif';
        ctx.fillStyle = '#777';
        ctx.fillText(`Kelt: ${formattedDate}`, canvas.width / 2, 1035);

        // Export image
        setTimeout(() => {
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `Csupasziv_Oklevel_${(playerName || 'hos').replace(/\s+/g, '_')}.png`;
            link.href = dataUrl;
            link.click();
            setIsGenerating(false);
        }, 150);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-2xl bg-[#FAF7F0] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#4F7942]/30 modal-gpu-accelerated">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3.5 bg-[#4F7942] text-white shrink-0">
                    <div className="flex items-center gap-2">
                        <RiAwardLine className="w-5 h-5 text-amber-300" />
                        <h3 className="font-bold text-sm sm:text-base">
                            {t('certificate_title') || 'A Homokhátság Ifjú Őrzője'}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-white/20 transition-colors cursor-pointer text-white"
                    >
                        <RiCloseLine size={20} />
                    </button>
                </div>

                {/* Content Body */}
                <div className="p-5 sm:p-6 flex flex-col gap-5 overflow-y-auto max-h-[80vh]">
                    {/* Name Input */}
                    <div className="bg-white p-4 rounded-xl border border-[#4F7942]/20 shadow-xs flex flex-col gap-2">
                        <label className="text-xs font-bold text-[#4F7942] uppercase tracking-wider flex items-center gap-1.5">
                            <RiUser3Line size={14} />
                            {t('certificate_name_label') || 'A Te neved az oklevélen:'}
                        </label>
                        <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            maxLength={35}
                            placeholder="Írd be a teljes neved..."
                            className="w-full px-3 py-2 text-sm sm:text-base font-bold text-zinc-900 border border-zinc-300 rounded-lg focus:outline-none focus:border-[#4F7942] bg-[#FAF7F0]/40"
                        />
                    </div>

                    {/* Certificate Preview Card */}
                    <div className="relative bg-[#FFFDF8] border-4 border-[#4F7942] rounded-xl p-5 sm:p-8 text-center shadow-md overflow-hidden">
                        <div className="absolute inset-1.5 border border-[#D4AF37] rounded-lg pointer-events-none" />

                        <div className="text-[11px] font-bold tracking-widest text-[#4F7942] uppercase mb-1">
                            Csupaszív Kalandok
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-[#263d20] tracking-wide mb-1">
                            DÍSZOKLEVÉL
                        </h2>
                        <div className="text-xs text-amber-700 font-medium italic mb-4">
                            A Homokhátság Természeti Értékeinek Megóvásáért
                        </div>

                        <div className="text-xs text-zinc-600 mb-2">Ezennel tanúsítjuk, hogy</div>
                        <div className="text-xl sm:text-2xl font-bold text-[#1e3816] border-b-2 border-[#4F7942]/30 pb-1 mx-auto max-w-xs mb-3">
                            {playerName.trim() || 'A Homokhátság Hőse'}
                        </div>

                        <div className="text-xs text-zinc-700 leading-relaxed max-w-md mx-auto mb-4">
                            önzetlen munkájával és elhivatottságával sikeresen védelmezte a puszta élővilágát.
                        </div>

                        <div className="inline-block bg-white border border-[#D4AF37] px-4 py-2 rounded-lg shadow-xs mb-3">
                            <div className="text-xs sm:text-sm font-bold text-[#4F7942]">
                                Rang: {rankTitle}
                            </div>
                            <div className="text-[11px] text-amber-900 font-semibold">
                                Eredmény: {score} pont
                            </div>
                        </div>

                        <div className="text-[11px] text-zinc-500 mt-2">
                            Kelt: {formattedDate}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-zinc-300 text-zinc-700 text-xs font-bold hover:bg-zinc-100 transition-colors cursor-pointer"
                        >
                            {t('close') || 'Bezárás'}
                        </button>
                        <button
                            onClick={handleDownloadCertificate}
                            disabled={isGenerating}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#4F7942] hover:bg-[#3d5e33] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                        >
                            <RiDownloadLine size={18} />
                            <span>
                                {isGenerating ? 'Generálás...' : (t('certificate_download_btn') || 'Oklevél letöltése képként (PNG)')}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
