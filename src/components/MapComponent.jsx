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
const defaultIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
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
  const { colorFilter, selectedMapLocation } = useGame();
  
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
           const isActive = selectedMapLocation?.id === loc.id;
           
           return (
             <Marker 
               key={loc.id} 
               position={loc.position}
               icon={isActive ? customActiveIcon : defaultIcon}
             >
               <Popup>
                 <div className="font-bold text-[#4F7942] uppercase text-xs tracking-widest">{loc.name}</div>
                 <div className="text-xs mt-1 text-zinc-600">{loc.description}</div>
               </Popup>
             </Marker>
           );
        })}
      </MapContainer>
    </div>
  );
}
