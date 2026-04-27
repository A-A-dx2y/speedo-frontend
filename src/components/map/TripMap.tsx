import React, { useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import MapBounds from './MapBounds';
import { getMarkerIcon } from '../../utils/mapHelpers';
import { Layers, Map as MapIcon, Globe } from 'lucide-react';

interface TripData {
  id: string;
  name: string;
  startPoint: [number, number];
  endPoint: [number, number];
  allPoints: [number, number][];
  normalSegments: [number, number][][];
  overspeedSegments: [number, number][][];
  eventMarkers: { lat: number; lng: number; status: string; time: string; speed: number }[];
  color?: string; // Optional custom color for this trip's path
}

interface TripMapProps {
  trips: TripData[];
  activeTripId?: string;
}

const mapStyles = {
  light: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
};

type MapStyle = keyof typeof mapStyles;

// Simple color palette for multiple trips
const TRIP_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4'];

const TripMap: React.FC<TripMapProps> = ({
  trips,
  activeTripId
}) => {
  const [activeStyle, setActiveStyle] = useState<MapStyle>('light');
  
  const osIcon = getMarkerIcon('#22c55e');
  const idleIcon = getMarkerIcon('#eab308');
  const stopIcon = getMarkerIcon('#ef4444');

  // Collect all points from all trips for auto-bounds
  const allPoints = trips.flatMap(t => t.allPoints);

  return (
    <div className="w-full h-[400px] sm:h-[500px] bg-slate-100 dark:bg-[#080808] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden relative z-0 shadow-lg dark:shadow-none transition-colors duration-300">
      
      {/* Map Style Switcher Overlay */}
      <div className="absolute top-3 right-3 z-1000">
        <div className="bg-white/30 dark:bg-black/20 backdrop-blur-xl p-1 rounded-xl border border-white/40 dark:border-white/10 shadow-lg flex flex-col gap-1">
          {(Object.keys(mapStyles) as MapStyle[]).map((style) => (
            <div key={style} className="relative group">
              <button
                onClick={() => setActiveStyle(style)}
                className={`
                  w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-300
                  ${activeStyle === style 
                    ? 'bg-blue-600/80 text-white shadow-md shadow-blue-500/20' 
                    : 'text-slate-700 dark:text-white/80 hover:bg-white/20'
                  }
                `}
              >
                {style === 'light' && <MapIcon size={14} strokeWidth={2.5} />}
                {style === 'dark' && <Layers size={14} strokeWidth={2.5} />}
                {style === 'satellite' && <Globe size={14} strokeWidth={2.5} />}
              </button>
              
              {/* Ultra-compact Tooltip */}
              <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                {style}
              </div>
            </div>
          ))}
        </div>
      </div>

      <MapContainer center={trips[0]?.startPoint || [0,0]} zoom={13} className="w-full h-full" zoomControl={true}>
        <TileLayer
          attribution={activeStyle === 'satellite' 
            ? 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          }
          url={mapStyles[activeStyle]}
        />
        <MapBounds points={allPoints} />

        {trips.map((trip, tIdx) => {
          const tripColor = trip.color || TRIP_COLORS[tIdx % TRIP_COLORS.length];
          const isActive = trip.id === activeTripId;

          return (
            <React.Fragment key={trip.id}>
              {/* Path Segments */}
              {trip.normalSegments.map((seg, idx) => (
                <Polyline 
                  key={`${trip.id}-normal-${idx}`} 
                  positions={seg} 
                  color={tripColor} 
                  weight={isActive ? 4 : 2} 
                  opacity={isActive ? 1 : 0.4} 
                />
              ))}

              {trip.overspeedSegments.map((seg, idx) => (
                <Polyline 
                  key={`${trip.id}-os-${idx}`} 
                  positions={seg} 
                  color="#22c55e" 
                  weight={isActive ? 5 : 3} 
                  opacity={isActive ? 1 : 0.4} 
                  pathOptions={{ className: 'drop-shadow-sm' }} 
                />
              ))}

              {/* Only show markers for the active trip or if it's the only one */}
              {(isActive || trips.length === 1) && (
                <>
                  {trip.eventMarkers.map((marker, idx) => (
                    <Marker 
                      key={`${trip.id}-event-${idx}`} 
                      position={[marker.lat, marker.lng]} 
                      icon={marker.status === 'OS' ? osIcon : marker.status === 'Idling' ? idleIcon : stopIcon}
                    >
                      <Popup className="font-sans">
                        <div className="text-center p-1">
                          <p className="text-xs font-black uppercase tracking-widest text-slate-800 mb-1">
                            {marker.status === 'OS' ? 'Overspeeding' : marker.status}
                          </p>
                          <p className="text-[10px] font-bold text-slate-500">Trip: {trip.name}</p>
                          <p className="text-[10px] font-bold text-slate-500">Speed: {marker.speed} km/h</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                  <Marker position={trip.startPoint}><Popup className="font-sans font-bold">Start: {trip.name}</Popup></Marker>
                  <Marker position={trip.endPoint}><Popup className="font-sans font-bold">End: {trip.name}</Popup></Marker>
                </>
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default TripMap;
