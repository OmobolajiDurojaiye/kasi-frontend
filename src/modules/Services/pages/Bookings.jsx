import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { CalendarDays, Clock, MapPin, User, CheckCircle, XCircle, ChevronDown, ListTodo } from 'lucide-react';
import clsx from 'clsx';
import { formatCurrency } from '../../../utils/formatters';

const Bookings = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/api/services/bookings');
      setBookings(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      showToast('error', 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await api.put(`/api/services/bookings/${id}/status`, 
        { status: newStatus }
      );
      showToast('success', `Booking marked as ${newStatus}`);
      fetchBookings();
    } catch (error) {
      showToast('error', 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Group bookings by date
  const groupedBookings = bookings.reduce((acc, booking) => {
    const date = new Date(booking.booking_date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(booking);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">Review and manage your AI-generated bookings</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="text-blue-600" size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Bookings yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto">Once the AI schedules an appointment with a client, it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedBookings).map(([dateLabel, dayBookings]) => (
            <div key={dateLabel} className="space-y-4">
               {/* Date Header */}
               <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                 <CalendarDays size={16} />
                 {dateLabel}
               </h3>
               
               {/* Day's Bookings */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {dayBookings.map((booking) => (
                   <div key={booking.id} className={clsx(
                     "bg-white rounded-2xl border p-5 shadow-sm transition-all",
                     booking.status === 'Cancelled' ? 'border-red-100 opacity-75' : 'border-gray-200 hover:border-blue-200 hover:shadow-md'
                   )}>
                     
                     <div className="flex justify-between items-start mb-3">
                       <span className={clsx("px-3 py-1 rounded-full text-xs font-bold border", getStatusColor(booking.status))}>
                         {booking.status}
                       </span>
                       <span className="font-bold text-gray-900">
                         {booking.service ? formatCurrency(booking.service.price) : 'N/A'}
                       </span>
                     </div>

                     <h4 className="font-bold text-lg text-gray-900 mb-1">
                       {booking.service?.name || 'Unknown Service'}
                     </h4>
                     
                     <div className="space-y-2 mt-4">
                       <div className="flex items-center gap-2 text-sm text-gray-600">
                         <Clock size={16} className="text-gray-400" />
                         <span className="font-medium text-gray-900">{booking.booking_time}</span>
                         <span className="text-gray-400 text-xs">(to {booking.end_time})</span>
                       </div>
                       
                       <div className="flex items-center gap-2 text-sm text-gray-600">
                         <User size={16} className="text-gray-400" />
                         <span>{booking.customer?.name || 'Unknown Client'}</span>
                       </div>
                       
                       <div className="flex items-center gap-2 text-sm text-gray-600">
                         <MapPin size={16} className={booking.location_type === 'home_service' ? 'text-purple-400' : 'text-blue-400'} />
                         <span className={clsx("font-medium", booking.location_type === 'home_service' ? 'text-purple-700' : 'text-blue-700')}>
                           {booking.location_type === 'home_service' ? 'Home Service' : 'In Shop'}
                         </span>
                       </div>
                     </div>

                     {/* Action Buttons */}
                     {booking.status === 'Confirmed' && (
                       <div className="flex gap-2 pt-5 border-t border-gray-50 mt-5">
                         <button
                           disabled={updatingId === booking.id}
                           onClick={() => updateStatus(booking.id, 'Completed')}
                           className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl text-sm font-bold transition-colors"
                         >
                           <CheckCircle size={16} /> Complete
                         </button>
                         <button
                           disabled={updatingId === booking.id}
                           onClick={() => updateStatus(booking.id, 'Cancelled')}
                           className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-sm font-bold transition-colors"
                         >
                           <XCircle size={16} /> Cancel
                         </button>
                       </div>
                     )}
                     
                   </div>
                 ))}
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;
