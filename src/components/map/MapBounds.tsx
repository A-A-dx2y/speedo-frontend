import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface MapBoundsProps {
  points: [number, number][];
}

const MapBounds: React.FC<MapBoundsProps> = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      map.fitBounds(points as L.LatLngBoundsExpression, { padding: [50, 50] });
    }
  }, [map, points]);
  return null;
};

export default MapBounds;
