import React from 'react';

interface TripSummaryProps {
  travelDuration: string;
  stoppedDuration: string;
  totalDistance: string;
  overSpeedDuration: string;
}

const TripSummary: React.FC<TripSummaryProps> = ({ 
  travelDuration, 
  stoppedDuration, 
  totalDistance, 
  overSpeedDuration 
}) => {
  return (
    <div className="w-full lg:w-80 bg-white dark:bg-[#0a0a0a] rounded-2xl border border-slate-200 dark:border-white/5 p-6 flex flex-col gap-5 shadow-lg dark:shadow-none h-fit transition-colors duration-300">
      <div className="flex justify-between items-center pb-5 border-b border-slate-100 dark:border-white/5">
        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Travel Duration</span>
        <span className="text-sm font-black text-slate-900 dark:text-white">{travelDuration}</span>
      </div>
      <div className="flex justify-between items-center pb-5 border-b border-slate-100 dark:border-white/5">
        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Stopped Duration</span>
        <span className="text-sm font-black text-slate-900 dark:text-white">{stoppedDuration}</span>
      </div>
      <div className="flex justify-between items-center pb-5 border-b border-slate-100 dark:border-white/5">
        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Total Distance</span>
        <span className="text-sm font-black text-slate-900 dark:text-white">{totalDistance}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Overspeed Duration</span>
        <span className="text-sm font-black text-slate-900 dark:text-white">{overSpeedDuration}</span>
      </div>
    </div>
  );
};

export default TripSummary;
