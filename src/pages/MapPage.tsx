import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tripService } from '../services/trip.service.js';
import type { TripDetailResponse, TripResponse } from '../types/trip.types.js';
import { handleApiError } from '../utils/toast.js';
import { Loader2, ArrowLeft, Clock, AlertTriangle, MapPin, StopCircle, TrendingUp, Hand } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Sub-components
import StatsCard from '../components/map/StatsCard';
import TripMap from '../components/map/TripMap';
import GpsTable from '../components/map/GpsTable';
import TripSummary from '../components/map/TripSummary';

// Utilities
import { formatDuration, processGpsData } from '../utils/mapHelpers';

// Fix Leaflet marker icons issue in React/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // States
  const [allUserTrips, setAllUserTrips] = useState<TripResponse[]>([]);
  const [loadedTrips, setLoadedTrips] = useState<Map<string, TripDetailResponse>>(new Map());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | undefined>(id);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pointsPerPage = 10;

  // Initial load
  useEffect(() => {
    const init = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const [detailRes, listRes] = await Promise.all([
          tripService.getTripById(id),
          tripService.getAllTrips()
        ]);

        if (detailRes.success) {
          setLoadedTrips(prev => new Map(prev).set(id, detailRes.data));
          setSelectedIds(new Set([id]));
          setActiveId(id);
        }
        if (listRes.success) {
          setAllUserTrips(listRes.data);
        }
      } catch (error) {
        handleApiError(error, "Failed to load trip details");
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [id, navigate]);

  const toggleTrip = async (tripId: string) => {
    const newSelected = new Set(selectedIds);
    
    if (newSelected.has(tripId)) {
      // Don't deselect the last trip
      if (newSelected.size > 1) {
        newSelected.delete(tripId);
        if (activeId === tripId) {
          setActiveId(Array.from(newSelected)[0]);
        }
      }
    } else {
      newSelected.add(tripId);
      // Fetch data if not loaded
      if (!loadedTrips.has(tripId)) {
        try {
          const res = await tripService.getTripById(tripId);
          if (res.success) {
            setLoadedTrips(prev => new Map(prev).set(tripId, res.data));
          }
        } catch (error) {
          handleApiError(error, "Failed to load extra trip data");
        }
      }
    }
    setSelectedIds(newSelected);
  };

  const activeTrip = activeId ? loadedTrips.get(activeId) : undefined;
  
  if (isLoading && loadedTrips.size === 0) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-black flex items-center justify-center transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-blue-600 dark:text-blue-500" />
          <p className="text-[10px] font-black tracking-widest uppercase text-slate-500 dark:text-slate-400">Loading Map Overlay...</p>
        </div>
      </div>
    );
  }

  // Data for the map component
  const mapTripsData = Array.from(selectedIds)
    .map(tid => loadedTrips.get(tid))
    .filter((t): t is TripDetailResponse => !!t)
    .map(t => {
      const sorted = [...t.gpsData].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const points = sorted.map(p => [p.latitude, p.longitude] as [number, number]);
      const { normalSegments, overspeedSegments, eventMarkers } = processGpsData(sorted);
      
      return {
        id: t.id,
        name: t.name,
        startPoint: points[0],
        endPoint: points[points.length - 1],
        allPoints: points,
        normalSegments,
        overspeedSegments,
        eventMarkers
      };
    });

  // Data for active trip stats and table
  const sortedGpsData = activeTrip ? [...activeTrip.gpsData].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) : [];
  const currentPoints = sortedGpsData.slice((currentPage - 1) * pointsPerPage, currentPage * pointsPerPage);
  const totalPages = Math.ceil(sortedGpsData.length / pointsPerPage);

  if (!activeTrip || sortedGpsData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] dark:bg-black text-slate-900 dark:text-white transition-colors duration-300">
         <p className="font-bold">No valid GPS coordinates found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#050505] text-slate-900 dark:text-white font-sans p-4 sm:p-6 space-y-6 transition-colors duration-300 pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-white/5">
         <button 
           onClick={() => navigate('/dashboard')} 
           className="flex items-center gap-2 bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-[#1a1a1a] transition-colors text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 shadow-sm dark:shadow-none"
         >
           <ArrowLeft size={14} strokeWidth={2.5} /> Back to Dashboard
         </button>
         <h1 className="font-black text-xl tracking-wide uppercase italic">Map Overlay</h1>
      </div>

      {/* Selector Bar */}
      <div className="bg-white dark:bg-[#0a0a0a] p-5 rounded-xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none transition-colors duration-300">
          <p className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-widest mb-4 text-center sm:text-left">Select Multiple Trips to Overlay</p>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 justify-center sm:justify-start">
             {allUserTrips.map((t) => (
               <div 
                 key={t.id} 
                 className={`group flex items-center gap-3 p-2 pr-4 rounded-xl transition-all border ${selectedIds.has(t.id) ? 'bg-blue-600/5 border-blue-600/20' : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-white/5'}`}
               >
                  <input 
                    type="checkbox" 
                    checked={selectedIds.has(t.id)} 
                    onChange={() => toggleTrip(t.id)}
                    className="w-5 h-5 rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                  />
                  <div 
                    className="flex flex-col cursor-pointer"
                    onClick={() => {
                      if (!selectedIds.has(t.id)) toggleTrip(t.id);
                      setActiveId(t.id);
                      setCurrentPage(1);
                    }}
                  >
                    <span className={`text-xs font-black uppercase tracking-tight transition-colors ${activeId === t.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                      {t.name}
                    </span>
                    {activeId === t.id && <span className="text-[7px] font-black uppercase text-blue-500/60 leading-none">Active Details</span>}
                  </div>
               </div>
             ))}
          </div>
      </div>

      {/* Map Component */}
      <TripMap trips={mapTripsData} activeTripId={activeId} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard label="Total Distance" value={`${(activeTrip.totalDistance / 1000).toFixed(2)} km`} icon={<MapPin size={24} strokeWidth={2.5}/>} iconColorClass="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500" />
        <StatsCard label="Trip Duration" value={formatDuration(activeTrip.totalDuration)} icon={<Clock size={24} strokeWidth={2.5}/>} iconColorClass="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500" />
        <StatsCard label="Idle Time" value={formatDuration(activeTrip.idlingDuration)} icon={<StopCircle size={24} strokeWidth={2.5}/>} iconColorClass="bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-500" />
        <StatsCard label="Over Speeding Duration" value={formatDuration(activeTrip.overSpeedTime)} icon={<AlertTriangle size={24} strokeWidth={2.5}/>} iconColorClass="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500" />
        <StatsCard label="Over Speeding Distance" value={`${(activeTrip.overSpeedDistance / 1000).toFixed(1)} km`} icon={<TrendingUp size={24} strokeWidth={2.5}/>} iconColorClass="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500" />
        <StatsCard label="Stopped Duration" value={formatDuration(activeTrip.stoppageDuration)} icon={<Hand size={24} strokeWidth={2.5}/>} iconColorClass="bg-slate-100 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400" />
      </div>

      {/* Table & Side Panel Container */}
      <div className="flex flex-col lg:flex-row gap-6 pb-10">
        <div className="flex-1 overflow-hidden">
          <GpsTable 
            currentPoints={currentPoints} 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </div>
        
        <TripSummary 
          travelDuration={formatDuration(activeTrip.totalDuration)}
          stoppedDuration={formatDuration(activeTrip.stoppageDuration)}
          totalDistance={`${(activeTrip.totalDistance / 1000).toFixed(1)} km`}
          overSpeedDuration={formatDuration(activeTrip.overSpeedTime)}
        />
      </div>
    </div>
  );
};


export default MapPage;
