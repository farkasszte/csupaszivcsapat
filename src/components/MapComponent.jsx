'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, ImageOverlay, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGame } from '../context/GameContext';
import locationsData from '../data/locations.json';

const createSvgMarkerUrl = (color) => `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="25" height="41">
  <path fill="${color}" stroke="#FFFFFF" stroke-width="1.5" d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24s12-15 12-24c0-6.63-5.37-12-12-12zm0 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
</svg>
`)}`;

const customActiveIcon = new L.Icon({
  iconUrl: createSvgMarkerUrl('#F59E0B'),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const greenIcon = new L.Icon({
  iconUrl: createSvgMarkerUrl('#4F7942'),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const greyIcon = new L.Icon({
  iconUrl: createSvgMarkerUrl('#9CA3AF'),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const redIcon = new L.Icon({
  iconUrl: createSvgMarkerUrl('#EF4444'),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});


// Helper component to smoothly fly to the selected location
function MapController({ selectedLocation }) {
  const map = useMap();
  useEffect(() => {
    if (selectedLocation) {
      map.flyTo([selectedLocation.lat, selectedLocation.lng], 11, {
        animate: true,
        duration: 1.5
      });
    }
  }, [selectedLocation, map]);
  return null;
}

export default function MapComponent() {
  const { colorFilter, selectedMapLocation, currentElementId, state, project, language } = useGame();
  const finishedStories = state?.finishedStories || [];
  
  // Default center roughly on Homokhátság if no selection
  const defaultCenter = [46.4333, 19.4833];
  const defaultZoom = 10;
  
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

  // Story Mapping
  const storyLocations = {
    'loc-11': { index: 1, boardId: '630fdb8a-48d6-473e-9974-2460f7eb2b41' },
    'loc-17': { index: 2, boardId: '6a9aecfe-b7aa-46ba-8946-6a61882f883c' },
    'loc-16': { index: 3, boardId: 'f571e9b2-4ab3-42ee-8f86-5091ca1aa981' }
  };

  // Helper to check if current element is in a board
  const isElementInBoard = (boardId) => {
    if (!project || !project.boards[boardId]) return false;
    return project.boards[boardId].elements?.includes(currentElementId);
  };

  const bounds = [[45.951149686691394, 18.984375], [46.92025531537452, 20.21484375]];

  return (
    <div 
        className="w-full h-full rounded-xl overflow-hidden border border-white/20 shadow-xl"
        style={{ filter: getColorFilterStyle(colorFilter) }}
    >
      <MapContainer 
        center={selectedMapLocation ? [selectedMapLocation.lat, selectedMapLocation.lng] : defaultCenter} 
        zoom={selectedMapLocation ? 11 : defaultZoom} 
        minZoom={9}
        maxZoom={13}
        maxBounds={bounds}
        maxBoundsViscosity={1.0}
        attributionControl={false}
        style={{ height: '100%', width: '100%', background: '#fff' }}
      >
        <ImageOverlay
          url="/map-tiles/zoom_11_merged.png"
          bounds={bounds}
        />
        
        <MapController selectedLocation={selectedMapLocation} />

        {locationsData.map((loc) => {
           if (!loc.position) return null;
           
           const isSelected = selectedMapLocation?.id === loc.id;
           const storyInfo = storyLocations[loc.id];
           
           let icon = greyIcon;

           if (storyInfo) {
             const isFinished = finishedStories.includes(storyInfo.index);
             const isActive = isElementInBoard(storyInfo.boardId);
             
             if (isFinished) {
               icon = greenIcon;
             } else if (isActive) {
               icon = customActiveIcon; // Orange
             } else {
               icon = redIcon;
             }
           } else if (isSelected) {
             icon = customActiveIcon;
           }
           
           return (
             <Marker 
               key={loc.id} 
               position={loc.position}
               icon={icon}
             >
               <Popup maxWidth={220} keepInView={true}>
                 <div className="font-bold text-[#4F7942] uppercase text-xs tracking-widest leading-tight">
                   {loc[`name_${language}`] || loc.name}
                 </div>
                 <div className="text-xs mt-1 text-zinc-600 leading-normal">
                   {loc[`description_${language}`] || loc.description}
                 </div>
               </Popup>
             </Marker>
           );
        })}
      </MapContainer>
    </div>
  );
}
