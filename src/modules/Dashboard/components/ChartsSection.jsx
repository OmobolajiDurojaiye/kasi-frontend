import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark text-white text-xs p-2 rounded-lg shadow-lg">
        <p className="font-bold">{label}</p>
        <p>{`₦${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

const ChartsSection = ({ cashflowData, invoiceData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Cashflow Summary Chart */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-dark">Cashflow summary</h3>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">Last 6 Months</span>
        </div>
        <div className="h-64 w-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashflowData}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0F8C55" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#0F8C55" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#9CA3AF'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#9CA3AF'}} tickFormatter={(value) => `₦${value/1000}K`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" stroke="#0F8C55" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>

      {/* Invoice by Amount Chart */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100/50">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-dark">Invoice by Amount</h3>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">Last 6 Months</span>
        </div>
        <div className="h-64 w-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={invoiceData} barSize={40}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F3F4F6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#9CA3AF'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#9CA3AF'}} tickFormatter={(value) => `₦${value/1000}K`} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
                    <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                        {invoiceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ChartsSection;
