import React from 'react';
import clsx from 'clsx';

const StatsCard = ({ icon: Icon, label, value, iconColor, iconBg }) => {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      <div className="flex items-center gap-4">
        <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center shrink-0", iconBg)}>
            <Icon size={20} className={iconColor} />
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-gray-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wide truncate" title={label}>{label}</p>
            <h3 className="text-lg sm:text-xl font-bold text-dark truncate" title={value}>{value}</h3>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
