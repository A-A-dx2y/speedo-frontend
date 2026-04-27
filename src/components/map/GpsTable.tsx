import React from 'react';
import type { GPSPointDTO } from '../../types/trip.types';

interface GpsTableProps {
  currentPoints: GPSPointDTO[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const GpsTable: React.FC<GpsTableProps> = ({ currentPoints, currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex-1 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-lg dark:shadow-none flex flex-col transition-colors duration-300">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 dark:bg-[#080808] text-slate-500 dark:text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-200 dark:border-white/5 transition-colors duration-300">
            <tr>
              <th className="p-5">Time</th>
              <th className="p-5">Point</th>
              <th className="p-5">Ignition</th>
              <th className="p-5">Speed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {currentPoints.map((pt, i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-[#111] transition-colors">
                <td className="p-5 font-bold text-slate-700 dark:text-slate-300">
                  {new Date(pt.timestamp).toLocaleTimeString()}
                </td>
                <td className="p-5 text-slate-500 dark:text-slate-400 font-mono text-xs">
                  {pt.latitude.toFixed(4)}, {pt.longitude.toFixed(4)}
                </td>
                <td className="p-5">
                  <span className={`text-[10px] font-black tracking-widest px-2.5 py-1 rounded-md ${
                    pt.ignition === 'on' 
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' 
                      : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-500/10'
                  }`}>
                    {pt.ignition ? pt.ignition.toUpperCase() : 'N/A'}
                  </span>
                </td>
                <td className="p-5 font-bold text-slate-700 dark:text-slate-300">
                  {pt.speed.toFixed(1)} km/h
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="p-4 border-t border-slate-200 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-[#080808] mt-auto transition-colors duration-300">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button 
            onClick={() => onPageChange(Math.max(1, currentPage - 1))} 
            disabled={currentPage === 1} 
            className="px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-[#222] text-slate-700 dark:text-white rounded-lg text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-colors shadow-sm dark:shadow-none"
          >
            Prev
          </button>
          <button 
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} 
            disabled={currentPage === totalPages} 
            className="px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-[#222] text-slate-700 dark:text-white rounded-lg text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-colors shadow-sm dark:shadow-none"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default GpsTable;
