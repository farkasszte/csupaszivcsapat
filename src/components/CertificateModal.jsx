'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import {
    RiCloseLine,
    RiDownloadLine,
    RiAwardLine,
    RiUser3Line
} from '@remixicon/react';

// Raw SVG string for HTML5 Canvas rasterization
const SEAL_SVG_STRING = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" width="240" height="240">
  <defs>
    <linearGradient id="c_sealGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A"/>
      <stop offset="25%" stop-color="#F59E0B"/>
      <stop offset="60%" stop-color="#D97706"/>
      <stop offset="100%" stop-color="#92400E"/>
    </linearGradient>
    <linearGradient id="c_sealGoldHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFBEB"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
    <radialGradient id="c_sealGreen" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#3B7A32"/>
      <stop offset="65%" stop-color="#1B4D1B"/>
      <stop offset="100%" stop-color="#0E2E0E"/>
    </radialGradient>
    <path id="c_upperSealPath" d="M 42,120 A 78,78 0 1,1 198,120" fill="none" />
    <path id="c_lowerSealPath" d="M 44,120 A 76,76 0 0,0 196,120" fill="none" />
  </defs>
  <polygon points="120.0,4.0 130.6,12.5 142.6,6.2 151.4,16.7 164.4,12.8 170.9,24.8 184.4,23.5 188.5,36.5 202.0,38.0 203.5,51.5 216.5,55.6 215.2,69.1 227.2,75.6 223.3,88.6 233.8,97.4 227.5,109.4 236.0,120.0 227.5,130.6 233.8,142.6 223.3,151.4 227.2,164.4 215.2,170.9 216.5,184.4 203.5,188.5 202.0,202.0 188.5,203.5 184.4,216.5 170.9,215.2 164.4,227.2 151.4,223.3 142.6,233.8 130.6,227.5 120.0,236.0 109.4,227.5 97.4,233.8 88.6,223.3 75.6,227.2 69.1,215.2 55.6,216.5 51.5,203.5 38.0,202.0 36.5,188.5 23.5,184.4 24.8,170.9 12.8,164.4 16.7,151.4 6.2,142.6 12.5,130.6 4.0,120.0 12.5,109.4 6.2,97.4 16.7,88.6 12.8,75.6 24.8,69.1 23.5,55.6 36.5,51.5 38.0,38.0 51.5,36.5 55.6,23.5 69.1,24.8 75.6,12.8 88.6,16.7 97.4,6.2 109.4,12.5"
    fill="url(#c_sealGold)" stroke="#92400E" stroke-width="1.5" />
  <circle cx="120" cy="120" r="103" fill="none" stroke="url(#c_sealGoldHighlight)" stroke-width="2" />
  <circle cx="120" cy="120" r="97" fill="url(#c_sealGreen)" stroke="#D97706" stroke-width="2" />
  <circle cx="120" cy="120" r="91" fill="none" stroke="#FDE68A" stroke-width="1.5" stroke-dasharray="3 4" opacity="0.8" />
  <circle cx="120" cy="120" r="63" fill="none" stroke="#FDE68A" stroke-width="1.5" stroke-dasharray="3 4" opacity="0.8" />
  <text font-family="'Montserrat', 'Arial Black', sans-serif" font-weight="900" font-size="14.5" fill="#FEF08A" letter-spacing="2.8">
    <textPath href="#c_upperSealPath" startOffset="50%" text-anchor="middle">CSUPASZÍV PECSÉT</textPath>
  </text>
  <text font-family="'Montserrat', 'Arial', sans-serif" font-weight="800" font-size="12.5" fill="#FDE68A" letter-spacing="3.5">
    <textPath href="#c_lowerSealPath" startOffset="50%" text-anchor="middle">★ 2026 ★</textPath>
  </text>
  <circle cx="120" cy="120" r="49" fill="url(#c_sealGold)" stroke="#FFFBEB" stroke-width="2" />
  <circle cx="120" cy="120" r="44" fill="url(#c_sealGreen)" stroke="#B45309" stroke-width="1.2" />
  <path d="M 120,111 C 120,102 108,97 99,105 C 91,113 95,124 120,140 C 145,124 149,113 141,105 C 132,97 120,102 120,111 Z"
    fill="url(#c_sealGold)" stroke="#FFFBEB" stroke-width="1.5" />
  <polygon points="120,110 122.2,114.8 127.5,115.5 123.6,119.2 124.6,124.5 120,121.9 115.4,124.5 116.4,119.2 112.5,115.5 117.8,114.8"
    fill="#FFFBEB" />
</svg>`;

// Interactive SVG Seal for Preview Card
function CsupaszivSealSvg({ className = 'w-24 h-24' }) {
    return (
        <svg
            viewBox="0 0 240 240"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="previewSealGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FDE68A" />
                    <stop offset="25%" stopColor="#F59E0B" />
                    <stop offset="60%" stopColor="#D97706" />
                    <stop offset="100%" stopColor="#92400E" />
                </linearGradient>
                <linearGradient id="previewSealHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFBEB" />
                    <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
                <radialGradient id="previewSealGreen" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#3B7A32" />
                    <stop offset="65%" stopColor="#1B4D1B" />
                    <stop offset="100%" stopColor="#0E2E0E" />
                </radialGradient>
                <path id="previewUpperPath" d="M 42,120 A 78,78 0 1,1 198,120" fill="none" />
                <path id="previewLowerPath" d="M 44,120 A 76,76 0 0,0 196,120" fill="none" />
                <filter id="previewSealShadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.35" />
                </filter>
            </defs>

            {/* Rosette 32-point scalloped outer ring */}
            <polygon
                points="120.0,4.0 130.6,12.5 142.6,6.2 151.4,16.7 164.4,12.8 170.9,24.8 184.4,23.5 188.5,36.5 202.0,38.0 203.5,51.5 216.5,55.6 215.2,69.1 227.2,75.6 223.3,88.6 233.8,97.4 227.5,109.4 236.0,120.0 227.5,130.6 233.8,142.6 223.3,151.4 227.2,164.4 215.2,170.9 216.5,184.4 203.5,188.5 202.0,202.0 188.5,203.5 184.4,216.5 170.9,215.2 164.4,227.2 151.4,223.3 142.6,233.8 130.6,227.5 120.0,236.0 109.4,227.5 97.4,233.8 88.6,223.3 75.6,227.2 69.1,215.2 55.6,216.5 51.5,203.5 38.0,202.0 36.5,188.5 23.5,184.4 24.8,170.9 12.8,164.4 16.7,151.4 6.2,142.6 12.5,130.6 4.0,120.0 12.5,109.4 6.2,97.4 16.7,88.6 12.8,75.6 24.8,69.1 23.5,55.6 36.5,51.5 38.0,38.0 51.5,36.5 55.6,23.5 69.1,24.8 75.6,12.8 88.6,16.7 97.4,6.2 109.4,12.5"
                fill="url(#previewSealGold)"
                stroke="#92400E"
                strokeWidth="1.5"
            />

            {/* Concentric gold ring */}
            <circle cx="120" cy="120" r="103" fill="none" stroke="url(#previewSealHighlight)" strokeWidth="2" />

            {/* Green Disc Background */}
            <circle cx="120" cy="120" r="97" fill="url(#previewSealGreen)" stroke="#D97706" strokeWidth="2" />

            {/* Dotted decorative tracks */}
            <circle cx="120" cy="120" r="91" fill="none" stroke="#FDE68A" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.8" />
            <circle cx="120" cy="120" r="63" fill="none" stroke="#FDE68A" strokeWidth="1.5" strokeDasharray="3 4" opacity="0.8" />

            {/* Upper text: CSUPASZÍV PECSÉT */}
            <text fontFamily="'Montserrat', 'Arial Black', sans-serif" fontWeight="900" fontSize="14" fill="#FEF08A" letterSpacing="2.8">
                <textPath href="#previewUpperPath" startOffset="50%" textAnchor="middle">
                    CSUPASZÍV PECSÉT
                </textPath>
            </text>

            {/* Lower text: ★ 2026 ★ */}
            <text fontFamily="'Montserrat', 'Arial', sans-serif" fontWeight="800" fontSize="12" fill="#FDE68A" letterSpacing="3.5">
                <textPath href="#previewLowerPath" startOffset="50%" textAnchor="middle">
                    ★ 2026 ★
                </textPath>
            </text>

            {/* Inner Center Disc */}
            <circle cx="120" cy="120" r="49" fill="url(#previewSealGold)" stroke="#FFFBEB" strokeWidth="2" filter="url(#previewSealShadow)" />
            <circle cx="120" cy="120" r="44" fill="url(#previewSealGreen)" stroke="#B45309" strokeWidth="1.2" />

            {/* Center Emblem: Stylized Heart & Star */}
            <path
                d="M 120,111 C 120,102 108,97 99,105 C 91,113 95,124 120,140 C 145,124 149,113 141,105 C 132,97 120,102 120,111 Z"
                fill="url(#previewSealGold)"
                stroke="#FFFBEB"
                strokeWidth="1.5"
            />
            <polygon
                points="120,110 122.2,114.8 127.5,115.5 123.6,119.2 124.6,124.5 120,121.9 115.4,124.5 116.4,119.2 112.5,115.5 117.8,114.8"
                fill="#FFFBEB"
            />
        </svg>
    );
}

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
            ctx.fillText('CSUPASZÍV: A HOMOKHÁTSÁG HŐSEI', canvas.width / 2, 135);

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

            // 6. Centered SVG Seal under the Rank Box
            const sealSize = 160;
            const sealX = (canvas.width - sealSize) / 2;
            const sealY = 720;

            // Draw SVG Seal onto Canvas
            try {
                const sealImg = new Image();
                sealImg.crossOrigin = 'anonymous';
                const svgDataUri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(SEAL_SVG_STRING);
                await new Promise((resolve, reject) => {
                    sealImg.onload = resolve;
                    sealImg.onerror = reject;
                    sealImg.src = svgDataUri;
                });
                ctx.drawImage(sealImg, sealX, sealY, sealSize, sealSize);
            } catch {
                // Fallback circular seal
                ctx.fillStyle = '#D4AF37';
                ctx.beginPath();
                ctx.arc(sealX + sealSize / 2, sealY + sealSize / 2, sealSize / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#4F7942';
                ctx.beginPath();
                ctx.arc(sealX + sealSize / 2, sealY + sealSize / 2, sealSize / 2 - 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#FFFFFF';
                ctx.font = 'bold 16px "Montserrat", sans-serif';
                ctx.fillText('CSUPASZÍV PECSÉT', sealX + sealSize / 2, sealY + sealSize / 2 + 6);
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

            // 7. Date at bottom
            ctx.font = '600 20px "Montserrat", sans-serif';
            ctx.fillStyle = '#777';
            ctx.fillText(`Kelt: ${formattedDate}`, canvas.width / 2, 1025);

            // Export image
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
                <div className="p-5 sm:p-6 flex flex-col gap-5 overflow-y-auto max-h-[82vh]">
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
                    <div className="relative bg-[#FFFDF8] border-4 border-[#4F7942] rounded-xl p-5 sm:p-7 text-center shadow-md overflow-hidden">
                        <div className="absolute inset-1.5 border border-[#D4AF37] rounded-lg pointer-events-none" />

                        {/* Top Subtitle */}
                        <div className="text-[11px] sm:text-xs font-bold tracking-widest text-[#4F7942] uppercase mb-1">
                            Csupaszív: A homokhátság hősei
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-[#263d20] tracking-wide mb-1">
                            DÍSZOKLEVÉL
                        </h2>
                        <div className="text-xs text-amber-700 font-medium italic mb-3">
                            A Homokhátság Természeti Értékeinek Megóvásáért
                        </div>

                        <div className="text-xs text-zinc-600 mb-1.5">Ezennel tanúsítjuk, hogy</div>
                        <div className="text-xl sm:text-2xl font-bold text-[#1e3816] border-b-2 border-[#4F7942]/30 pb-1 mx-auto max-w-xs mb-2.5">
                            {playerName.trim() || 'A Homokhátság Hőse'}
                        </div>

                        {/* Text under player name */}
                        <div className="text-xs sm:text-sm text-zinc-700 leading-relaxed max-w-md mx-auto mb-3">
                            kiemelkedő bátorsággal és elkötelezettséggel óvta a Homokhátság védett természeti kincseit.
                        </div>

                        {/* Centered Rank Box */}
                        <div className="flex justify-center my-3">
                            <div className="inline-block bg-white border-2 border-[#D4AF37] px-6 py-2.5 rounded-xl shadow-xs text-center">
                                <span className="text-xs sm:text-sm font-bold text-[#4F7942]">
                                    Kiérdemelt rang: {rankTitle}
                                </span>
                            </div>
                        </div>

                        {/* Centered SVG Seal under the Rank Box */}
                        <div className="flex items-center justify-center my-2">
                            <CsupaszivSealSvg className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-md hover:scale-105 transition-transform duration-200" />
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
