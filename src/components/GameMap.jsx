'use client';

import { useGame } from '../context/GameContext';
import { RiMapPinLine, RiArrowRightSLine } from '@remixicon/react';

// Scene IDs from project_settings.json
const SCENES = [
    {
        id: '81a30674-aa09-4eb8-8484-59298d37f984',
        name: 'The meeting',
        label: 'Az első találkozás',
        description: 'Ahol a hősök találkoznak.',
    },
    {
        id: '59370898-e089-46cd-b7cf-072b79a76453',
        name: 'Castle Courtyard',
        label: 'Várudvar',
        description: 'A vár belső udvara, szokatlan csenddel.',
    },
];

export default function GameMap() {
    const { colorFilter } = useGame();

    const getColorFilterStyle = (filterId) => {
        switch (filterId) {
            case 'protanopia': return 'url(#protanopia-filter)';
            case 'deuteranopia': return 'url(#deuteranopia-filter)';
            case 'tritanopia': return 'url(#tritanopia-filter)';
            case 'grayscale': return 'grayscale(100%)';
            case 'vibrant': return 'saturate(150%)';
            default: return 'none';
        }
    };

    return (
        <div className="flex-1 min-h-0 flex flex-col justify-center p-4">
            {/* Map image — styled like the Images tab */}
            <div className="relative group overflow-hidden rounded-xl h-full w-fit mx-auto transition-transform duration-700">
                <img
                    src="/maps/1.webp"
                    alt="Térkép"
                    className="h-full w-auto object-contain transition-transform duration-700 block"
                    style={{ filter: getColorFilterStyle(colorFilter) }}
                />
            </div>

            {/* Scene links — Hidden for now as requested
            <div className="space-y-2 mt-4">
                <div className="flex items-center gap-1.5 text-xs text-[#FDF5E6] uppercase tracking-widest px-1 mb-3">
                    <RiMapPinLine size={12} />
                    Jelenetek
                </div>
                {SCENES.map((scene) => (
                    <button
                        key={scene.id}
                        onClick={() => handleNavigate(scene.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-amber-900/10 hover:bg-amber-900/25 border border-amber-700/15 hover:border-amber-600/30 rounded-xl transition-all text-left group"
                    >
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-[#FDF5E6] group-hover:text-[#FDF5E6] transition-colors">
                                {scene.label}
                            </div>
                            <div className="text-xs text-[#FDF5E6] mt-0.5 truncate">
                                {scene.name}
                            </div>
                        </div>
                        <RiArrowRightSLine
                            size={16}
                            className="shrink-0 text-[#FDF5E6] group-hover:text-[#FDF5E6] transition-colors"
                        />
                    </button>
                ))}
            </div>
            */}
        </div>
    );
}
