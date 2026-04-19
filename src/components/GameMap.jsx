'use client';

import dynamic from 'next/dynamic';
import { useGame } from '../context/GameContext';

// Next.js requires dynamic import with SSR disabled for Leaflet
const MapComponent = dynamic(() => import('./MapComponent'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex flex-col items-center justify-center bg-white/10 rounded-xl border border-white/20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
            <div className="text-white text-xs uppercase tracking-widest font-bold">Térkép betöltése...</div>
        </div>
    )
});

export default function GameMap() {
    const { 
        project, 
        discoveredLocations, 
        getAssetUrl, 
        setSelectedMapLocation, 
        selectedMapLocation,
        language,
        t
    } = useGame();

    return (
        <div className="flex-1 min-h-0 flex justify-center p-4">
            <MapComponent />
        </div>
    );
}
