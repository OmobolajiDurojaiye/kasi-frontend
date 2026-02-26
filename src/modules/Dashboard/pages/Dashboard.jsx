import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MoreVertical, FileText, Wallet, CheckCircle, Clock, Bell } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import ChartsSection from '../components/ChartsSection';
import Button from '../../../components/ui/Button';
import { DashboardSkeleton, TableSkeleton } from '../../../components/ui/Skeleton';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';

import RemindersModal from '../components/RemindersModal';

const Dashboard = () => {
  const { token, user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReminders, setShowReminders] = useState(false);
  
  const [stats, setStats] = useState([
    { icon: FileText, label: 'Total Invoice', value: '0', iconColor: 'text-green-600', iconBg: 'bg-green-100' },
    { icon: Clock, label: 'Outstanding Amounts', value: '₦0.00', iconColor: 'text-green-600', iconBg: 'bg-green-100' },
    { icon: CheckCircle, label: 'Paid this month', value: '₦0.00', iconColor: 'text-green-600', iconBg: 'bg-green-100' },
    { icon: Wallet, label: 'Upcoming Payments', value: '0', iconColor: 'text-green-600', iconBg: 'bg-green-100' },
  ]);

  const [chartData, setChartData] = useState({
      cashflow: [],
      invoiceStatus: []
  });

  // Filter Overdue Invoices
  const overdueInvoices = invoices.filter(inv => inv.status === 'Overdue');
  
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await api.get('/api/invoices/');
        const data = response.data;
        setInvoices(data);

        // Calculate Stats
        const totalCount = data.length;
        const outstanding = data.reduce((acc, inv) => (inv.status !== 'Paid' ? acc + inv.total_amount : acc), 0);
        const paid = data.reduce((acc, inv) => (inv.status === 'Paid' ? acc + inv.total_amount : acc), 0);
        
        setStats([
            { icon: FileText, label: 'Total Invoice', value: totalCount.toString(), iconColor: 'text-green-600', iconBg: 'bg-green-100' },
            { icon: Clock, label: 'Outstanding Amounts', value: `₦${outstanding.toLocaleString()}`, iconColor: 'text-green-600', iconBg: 'bg-green-100' },
            { icon: CheckCircle, label: 'Paid Total', value: `₦${paid.toLocaleString()}`, iconColor: 'text-green-600', iconBg: 'bg-green-100' },
            { icon: Wallet, label: 'Pending Invoices', value: data.filter(i => i.status !== 'Paid').length.toString(), iconColor: 'text-green-600', iconBg: 'bg-green-100' },
        ]);

        // Process Chart Data
        processChartData(data);

      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
        fetchInvoices();
    }
  }, [token]);

  const processChartData = (data) => {
      // 1. Invoice by Amount (Status)
      const statusGroups = { Draft: 0, Sent: 0, Paid: 0, Overdue: 0 };
      data.forEach(inv => {
          if (statusGroups[inv.status] !== undefined) {
              statusGroups[inv.status] += inv.total_amount;
          }
      });

      const invoiceStatusData = [
          { name: 'Draft', value: statusGroups.Draft, color: '#E8F5E9' },
          { name: 'Sent', value: statusGroups.Sent, color: '#E8F5E9' },
          { name: 'Paid', value: statusGroups.Paid, color: '#0F8C55' },
          { name: 'Overdue', value: statusGroups.Overdue, color: '#E8F5E9' },
      ];

      // 2. Cashflow (Paid invoices by month)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonthIndex = new Date().getMonth();
      const last6Months = [];
      
      // Init last 6 months buckets
      for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(currentMonthIndex - i);
          const monthName = months[d.getMonth()];
          last6Months.push({ name: monthName, value: 0, monthIdx: d.getMonth(), year: d.getFullYear() });
      }

      data.forEach(inv => {
          if (inv.status === 'Paid') {
              const d = new Date(inv.date_issued);
              const bucket = last6Months.find(m => m.monthIdx === d.getMonth() && m.year === d.getFullYear());
              if (bucket) {
                  bucket.value += inv.total_amount;
              }
          }
      });

      setChartData({
          cashflow: last6Months,
          invoiceStatus: invoiceStatusData
      });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-700';
      case 'Overdue': return 'bg-gray-100 text-gray-700';
      case 'Sent': return 'bg-gray-100 text-gray-700';
      case 'Draft': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getGreeting = () => {
      const hour = new Date().getHours();
      const name = user?.business_name || 'Chief';
      if (hour < 12) return `Good morning, ${name}!`;
      if (hour < 18) return `Good afternoon, ${name}!`;
      return `Good evening, ${name}!`;
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-dark mb-1">{getGreeting()}</h1>
            <p className="text-gray-500 text-sm">Loading your dashboard...</p>
          </div>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-dark mb-1">{getGreeting()}</h1>
           <p className="text-gray-500 text-sm">Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
             {overdueInvoices.length > 0 && (
                <Button 
                    onClick={() => setShowReminders(true)}
                    className="flex items-center gap-2 bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2.5 rounded-xl transition-colors text-sm font-medium animate-pulse"
                >
                    <Bell size={18} />
                    {overdueInvoices.length} Overdue
                </Button>
            )}
            <Link to="/invoices/create">
                <Button className="flex items-center gap-2 bg-primary hover:bg-green-700 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-green-200 transition-all text-sm font-medium">
                <Plus size={18} />
                Create Invoice
                </Button>
            </Link>
        </div>
      </div>

      <RemindersModal 
        isOpen={showReminders} 
        onClose={() => setShowReminders(false)} 
        overdueInvoices={overdueInvoices}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Section */}
      <ChartsSection cashflowData={chartData.cashflow} invoiceData={chartData.invoiceStatus} />

      {/* Recent Invoices Table */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-dark">Recent Invoices</h3>
             <button className="text-gray-400 hover:text-dark">
                <MoreVertical size={18} />
            </button>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-left border-b border-gray-100">
                        <th className="pb-3 pl-3 font-semibold text-gray-400 text-xs uppercase tracking-wide">
                            <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                        </th>
                        <th className="pb-3 font-semibold text-gray-400 text-xs uppercase tracking-wide">Invoice#</th>
                        <th className="pb-3 font-semibold text-gray-400 text-xs uppercase tracking-wide">Client</th>
                        <th className="pb-3 font-semibold text-gray-400 text-xs uppercase tracking-wide">Issue Date</th>
                        <th className="pb-3 font-semibold text-gray-400 text-xs uppercase tracking-wide">Due Date</th>
                        <th className="pb-3 font-semibold text-gray-400 text-xs uppercase tracking-wide">Amount(₦)</th>
                        <th className="pb-3 font-semibold text-gray-400 text-xs uppercase tracking-wide">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50/50">
                    {loading ? (
                        <tr><td colSpan="7" className="text-center py-12 text-gray-400 text-sm">Loading invoices...</td></tr>
                    ) : invoices.length === 0 ? (
                        <tr><td colSpan="7" className="text-center py-12">
                            <FileText size={36} className="mx-auto text-gray-300 mb-3" />
                            <p className="text-sm font-semibold text-dark mb-1">No invoices yet</p>
                            <p className="text-xs text-gray-400">Create your first invoice to see it here.</p>
                        </td></tr>
                    ) : (
                        invoices.map((invoice) => (
                        <tr key={invoice.id} className="group hover:bg-gray-50 transition-colors">
                            <td className="py-3 pl-3">
                                <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                            </td>
                            <td className="py-3 font-medium text-dark">{invoice.reference}</td>
                            <td className="py-3 text-gray-600 flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                    {invoice.customer.name.charAt(0)}
                                </div>
                                {invoice.customer.name}
                            </td>
                            <td className="py-3 text-gray-500">{invoice.date_issued}</td>
                            <td className="py-3 text-gray-500">{invoice.due_date}</td>
                            <td className="py-3 font-semibold text-dark">₦{invoice.total_amount.toLocaleString()}</td>
                            <td className="py-3">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(invoice.status)}`}>
                                    {invoice.status}
                                </span>
                            </td>
                        </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
