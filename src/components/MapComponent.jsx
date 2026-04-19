'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useGame } from '../context/GameContext';
import locationsData from '../data/locations.json';

// Fix for missing default icon in Leaflet + Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// A custom yellow/amber marker to match the active state
const customActiveIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// A standard marker
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const greyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});


// Helper component to smoothly fly to the selected location
function MapController({ selectedLocation }) {
  const map = useMap();
  useEffect(() => {
    if (selectedLocation) {
      map.flyTo([selectedLocation.lat, selectedLocation.lng], 14, {
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
    return project.boards[boardId].elements.includes(currentElementId);
  };

  return (
    <div 
        className="w-full h-full rounded-xl overflow-hidden border border-white/20 shadow-xl"
        style={{ filter: getColorFilterStyle(colorFilter) }}
    >
      <MapContainer 
        center={selectedMapLocation ? [selectedMapLocation.lat, selectedMapLocation.lng] : defaultCenter} 
        zoom={selectedMapLocation ? 14 : defaultZoom} 
        style={{ height: '100%', width: '100%', background: '#fff' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
               <Popup>
                 <div className="font-bold text-[#4F7942] uppercase text-xs tracking-widest">
                   {language === 'en' ? (loc.name_en || loc.name) : loc.name}
                 </div>
                 <div className="text-xs mt-1 text-zinc-600">
                   {language === 'en' ? (loc.description_en || loc.description) : loc.description}
                 </div>
               </Popup>
             </Marker>
           );
        })}
      </MapContainer>
    </div>
  );
}
