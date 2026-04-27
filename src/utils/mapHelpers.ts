import L from 'leaflet';
import type { GPSPointDTO } from '../types/trip.types';

export const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m} min ${s} sec`;
};

export const getMarkerIcon = (color: string) => {
  return new L.DivIcon({
    className: 'bg-transparent border-none',
    html: `<svg width="24" height="36" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.373 0 0 5.373 0 12c0 8 12 24 12 24s12-16 12-24c0-6.627-5.373-12-12-12z" fill="${color}" stroke="#fff" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="#fff"/></svg>`,
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36]
  });
};

export const getEffectiveStatus = (pt: GPSPointDTO) => {
  if (pt.isOverspeeding) return 'OS';
  if (pt.status === 'idling') return 'Idling';
  if (pt.status === 'stopped') return 'Stopped';
  return 'Normal';
};

export const processGpsData = (sortedGpsData: GPSPointDTO[]) => {
  const normalSegments: [number, number][][] = [];
  const overspeedSegments: [number, number][][] = [];
  const eventMarkers: { lat: number; lng: number; status: string; time: string; speed: number }[] = [];
  
  if (sortedGpsData.length === 0) return { normalSegments, overspeedSegments, eventMarkers };

  let currentStatus = getEffectiveStatus(sortedGpsData[0]);

  for (let i = 0; i < sortedGpsData.length - 1; i++) {
    const p1 = sortedGpsData[i];
    const p2 = sortedGpsData[i + 1];
    const segment: [number, number][] = [[p1.latitude, p1.longitude], [p2.latitude, p2.longitude]];
    
    const s1 = getEffectiveStatus(p1);
    const s2 = getEffectiveStatus(p2);

    if (s1 !== currentStatus) {
      if (s1 === 'OS' || s1 === 'Idling' || s1 === 'Stopped') {
        eventMarkers.push({ lat: p1.latitude, lng: p1.longitude, status: s1, time: p1.timestamp, speed: p1.speed });
      }
      currentStatus = s1;
    }

    if (s1 === 'OS' || s2 === 'OS') {
      overspeedSegments.push(segment);
    } else {
      normalSegments.push(segment);
    }
  }

  return { normalSegments, overspeedSegments, eventMarkers };
};
