import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Calendar, Info, Package, CreditCard, Clock } from 'lucide-react';
import { getAnalyticsData } from '../../../api/analytics';
import { AnalyticsSkeleton } from '../../../components/ui/Skeleton';

const formatNaira = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching analytics...");
        const response = await getAnalyticsData();
        console.log("Analytics response:", response);
        if (isMounted) {
          if (response && response.status === 'success') {
            setData(response.data);
          } else {
            console.error("Unexpected response status:", response);
          }
        }
      } catch (error) {
        console.error("Failed to fetch analytics. Complete error details:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, []);

  if (loading || !data) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 min-h-[calc(100vh-theme(spacing.16))] relative">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse w-32"></div>
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-48"></div>
          </div>
          <AnalyticsSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 min-h-[calc(100vh-theme(spacing.16))] relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          <span>Last 30 Days</span>
        </div>
      </div>

      {/* Top Cards & Chart Container */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 space-y-8 relative">
        
        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 align-top">
          {/* Revenue */}
          <div className="space-y-2 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700 pb-4 md:pb-0 pr-0 md:pr-6">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Sales
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{formatNaira(data.total_agent_revenue)}</span>
              <Info className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" title="Total amount generated from all paid invoices" />
            </div>
          </div>

          {/* Click-through Rate -> Customer Visits */}
          <div className="space-y-2 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700 pb-4 md:pb-0 px-0 md:px-6">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
              Customer Visits
            </div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">{data.click_through_rate}%</span>
              <Info className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" title="Percentage of customers who viewed your catalog and engaged" />
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{data.total_clicks.toLocaleString()} Total visits</div>
          </div>

          {/* AI Resolution Rate -> Successful Automatic Replies (Floating Effect) */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-5 transform md:-translate-y-4 md:translate-x-4 relative md:z-10 w-full space-y-2">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Successful Auto-Replies
            </div>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">{data.ai_resolution_rate}%</span>
              <Info className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" title="Percentage of customer queries handled entirely by Kasi AI without human intervention" />
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{data.ai_drop_off_rate}% Need human help</div>
          </div>
        </div>

        {/* Chart */}
        <div className="pt-4 h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.chart_data} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
                tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => [formatNaira(value), "Revenue"]}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#0F8C55" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: '#0F8C55', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
          <div className="bg-green-50 dark:bg-green-500/10 p-3 rounded-lg text-green-600 dark:text-green-500">
            <Package className="w-6 h-6 shrink-0" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total products created</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{data.total_recommended_products.toLocaleString()}</span>
              <Info className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" title="Total active products in your catalog" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
          <div className="bg-green-50 dark:bg-green-500/10 p-3 rounded-lg text-green-600 dark:text-green-500">
            <CreditCard className="w-6 h-6 shrink-0" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Average sale value</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{formatNaira(data.average_order_value)}</span>
              <Info className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" title="Average amount customers pay per completed invoice" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-4">
          <div className="bg-green-50 dark:bg-green-500/10 p-3 rounded-lg text-green-600 dark:text-green-500">
            <Clock className="w-6 h-6 shrink-0" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Average chat time</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{data.average_conversation_length}</span>
              <Info className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" title="Average time an AI spends chatting with a customer" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Analytics;
