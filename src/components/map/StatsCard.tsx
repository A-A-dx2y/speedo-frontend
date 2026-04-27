import React from 'react';

interface StatsCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconColorClass: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, iconColorClass }) => {
  return (
    <div className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-slate-200 dark:border-white/5 flex justify-between items-center shadow-md dark:shadow-none transition-colors duration-300">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">{label}</p>
        <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${iconColorClass}`}>
        {icon}
      </div>
    </div>
  );
};

export default StatsCard;
