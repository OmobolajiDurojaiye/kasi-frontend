import React from 'react';
import clsx from 'clsx';

const StatsCard = ({ icon: Icon, label, value, iconColor, iconBg }) => {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      <div className="flex items-center gap-4">
        <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center", iconBg)}>
            <Icon size={20} className={iconColor} />
        </div>
        <div>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">{label}</p>
            <h3 className="text-xl font-bold text-dark">{value}</h3>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
