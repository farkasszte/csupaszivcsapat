'use client';

import { useGame } from '../context/GameContext';
import { RiMapPinLine, RiArrowRightSLine } from '@remixicon/react';

// Scene IDs from project_settings.json
const SCENES = [
    {
        id: '81a30674-aa09-4eb8-8484-59298d37f984',
        name: 'The stone passage',
        label: 'Kőfolyosó',
        description: 'A kő folyosó, ahol csepeg a víz.',
    },
    {
        id: '59370898-e089-46cd-b7cf-072b79a76453',
        name: 'Castle Courtyard',
        label: 'Várudvar',
        description: 'A vár belső udvara, szokatlan csenddel.',
    },
];

export default function GameMap() {
    const { navigateTo, setShowMap } = useGame();

    const handleNavigate = (id) => {
        navigateTo(id);
        setShowMap(false);
    };

    return (
        <div className="flex flex-col gap-4 p-4">
            {/* Map image */}
            <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg">
                <img
                    src="/cover/cover.jpg"
                    alt="Térkép"
                    className="w-full object-cover"
                    style={{ maxHeight: '220px', objectPosition: 'center' }}
                />
            </div>

            {/* Scene links */}
            <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 uppercase tracking-widest px-1 mb-3">
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
                            <div className="text-sm font-semibold text-amber-200 group-hover:text-amber-100 transition-colors">
                                {scene.label}
                            </div>
                            <div className="text-xs text-zinc-500 mt-0.5 truncate">
                                {scene.name}
                            </div>
                        </div>
                        <RiArrowRightSLine
                            size={16}
                            className="shrink-0 text-zinc-600 group-hover:text-amber-400 transition-colors"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
