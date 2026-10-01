'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import {
    RiDownloadLine,
    RiUser3Line
} from '@remixicon/react';

export default function CertificateModal({ isOpen, onClose }) {
    const { state, t } = useGame();
    const score = state?.variables?.score ?? 0;
    const [playerName, setPlayerName] = useState('Panni Barátja');
    const [isGenerating, setIsGenerating] = useState(false);

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
    const handleDownloadCertificate = async () => {
        setIsGenerating(true);
        try {
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
            ctx.fillText('CSUPASZÍV KALANDOK - A HOMOKHÁTSÁG HŐSEI', canvas.width / 2, 135);

            ctx.font = '900 68px "Montserrat", sans-serif';
            ctx.fillStyle = '#263d20';
            ctx.fillText('DÍSZOKLEVÉL', canvas.width / 2, 220);

            ctx.font = 'italic 500 28px "Montserrat", sans-serif';
            ctx.fillStyle = '#B45309'; // Amber
            ctx.fillText('A Homokhátság Természeti Értékeinek Megóvásáért', canvas.width / 2, 270);

            // Decorative separator line
            ctx.strokeStyle = '#D4AF37';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2 - 250, 300);
            ctx.lineTo(canvas.width / 2 + 250, 300);
            ctx.stroke();

            // 4. Citation body
            ctx.font = '500 28px "Montserrat", sans-serif';
            ctx.fillStyle = '#3E2723';
            ctx.fillText('Ezennel tanúsítjuk és büszkén igazoljuk, hogy', canvas.width / 2, 365);

            // Player Name (Prominent & highlighted)
            ctx.font = 'bold 62px "Montserrat", sans-serif';
            ctx.fillStyle = '#1e3816';
            ctx.fillText(playerName.trim() || 'A Homokhátság Hőse', canvas.width / 2, 450);

            // Underline for name
            ctx.strokeStyle = '#4F7942';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2 - 320, 475);
            ctx.lineTo(canvas.width / 2 + 320, 475);
            ctx.stroke();

            // Text under name
            ctx.font = '500 26px "Montserrat", sans-serif';
            ctx.fillStyle = '#3E2723';
            ctx.fillText('kiemelkedő bátorsággal és elkötelezettséggel', canvas.width / 2, 530);
            ctx.fillText('óvta a Homokhátság védett természeti kincseit.', canvas.width / 2, 570);

            // 5. Centered Rank Box
            const boxW = 660;
            const boxH = 76;
            const boxX = (canvas.width - boxW) / 2;
            const boxY = 615;

            // Draw Rank Box
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = '#D4AF37';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.roundRect(boxX, boxY, boxW, boxH, 18);
            ctx.fill();
            ctx.stroke();

            // Text inside Rank Box
            ctx.textAlign = 'center';
            ctx.font = 'bold 34px "Montserrat", sans-serif';
            ctx.fillStyle = '#4F7942';
            ctx.fillText(`Kiérdemelt rang: ${rankTitle}`, canvas.width / 2, boxY + 49);

            // 6. Centered Logo under the Rank Box (Doubled size: 290px)
            const logoSize = 290;
            const logoX = (canvas.width - logoSize) / 2;
            const logoY = 705;

            try {
                const logoImg = new Image();
                logoImg.crossOrigin = 'anonymous';

                await new Promise((resolve, reject) => {
                    logoImg.onload = resolve;
                    logoImg.onerror = reject;
                    logoImg.src = '/icons/icon-heart.png';
                });

                ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
            } catch (err) {
                console.error('Error drawing logo to canvas:', err);
            }

            // 7. Signatures
            ctx.textAlign = 'center';

            // Left Signature: Ürge Panni
            ctx.font = 'italic bold 28px "Georgia", serif';
            ctx.fillStyle = '#263d20';
            ctx.fillText('Ürge Panni', 300, 860);
            ctx.strokeStyle = '#3E2723';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(190, 878);
            ctx.lineTo(410, 878);
            ctx.stroke();
            ctx.font = '600 19px "Montserrat", sans-serif';
            ctx.fillStyle = '#555';
            ctx.fillText('Mentőcsapat vezető', 300, 908);

            // Right Signature: Túzok Tanár Úr
            ctx.font = 'italic bold 28px "Georgia", serif';
            ctx.fillStyle = '#263d20';
            ctx.fillText('Túzok Tanár Úr', canvas.width - 300, 860);
            ctx.beginPath();
            ctx.moveTo(canvas.width - 410, 878);
            ctx.lineTo(canvas.width - 190, 878);
            ctx.stroke();
            ctx.font = '600 19px "Montserrat", sans-serif';
            ctx.fillStyle = '#555';
            ctx.fillText('Tudományos főtanácsadó', canvas.width - 300, 908);

            // 8. Date at bottom
            ctx.font = '600 20px "Montserrat", sans-serif';
            ctx.fillStyle = '#777';
            ctx.fillText(`Kelt: ${formattedDate}`, canvas.width / 2, 1025);

            // Export PNG
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = `Csupasziv_Oklevel_${(playerName || 'hos').replace(/\s+/g, '_')}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Hiba az oklevél készítésekor:', err);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="absolute inset-0 z-50 bg-[#FAF7F0] flex flex-col overflow-hidden animate-in fade-in duration-200">
            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col items-center text-center gap-3">
                {/* Visual Icon & Titles */}
                <div className="flex flex-col items-center gap-1">
                    <img
                        src="/icons/icon-heart.png"
                        alt="Csupaszív Logó"
                        className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-md"
                    />
                    <h2 className="text-xl sm:text-2xl font-black text-[#263d20]">
                        DÍSZOKLEVÉL
                    </h2>
                    <p className="text-sm text-zinc-700 max-w-sm leading-relaxed">
                        Gratulálunk! Sikeresen óvtad a Homokhátság természeti értékeit. Írd be a neved a díszoklevél kiállításához!
                    </p>
                </div>

                {/* Rank Card - Restored */}
                <div className="w-full bg-white border-2 border-[#D4AF37] p-3.5 rounded-xl shadow-xs flex flex-col items-center">
                    <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                        Kiérdemelt rangod
                    </span>
                    <span className="text-base sm:text-lg font-black text-[#4F7942] mt-0.5">
                        {rankTitle}
                    </span>
                </div>

                {/* Name Input Card - Restored */}
                <div className="w-full bg-white p-3.5 sm:p-4 rounded-xl border border-[#4F7942]/20 shadow-xs flex flex-col gap-2 text-left">
                    <label className="text-xs font-bold text-[#4F7942] uppercase tracking-wider flex items-center gap-1.5">
                        <RiUser3Line size={16} />
                        {t('certificate_name_label') || 'A Te neved az oklevélen:'}
                    </label>
                    <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        maxLength={35}
                        placeholder="Írd be a teljes neved..."
                        className="w-full px-3.5 py-2.5 text-sm sm:text-base font-bold text-zinc-900 border border-zinc-300 rounded-lg focus:outline-none focus:border-[#4F7942] bg-[#FAF7F0]/40 transition-colors"
                    />
                </div>

                {/* Action Buttons */}
                <div className="w-full flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 mt-auto">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-zinc-300 text-zinc-700 text-xs sm:text-sm font-bold hover:bg-zinc-100 transition-colors cursor-pointer"
                    >
                        {t('close') || 'Bezárás'}
                    </button>
                    <button
                        onClick={handleDownloadCertificate}
                        disabled={isGenerating}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#4F7942] hover:bg-[#3d5e33] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                        <RiDownloadLine size={18} />
                        <span>
                            {isGenerating ? 'Generálás...' : (t('certificate_download_btn') || 'Oklevél letöltése')}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
