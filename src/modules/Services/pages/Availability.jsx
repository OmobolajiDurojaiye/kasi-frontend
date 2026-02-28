import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { Clock, Calendar, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const Availability = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const response = await api.get('/api/services/schedule');
      setSchedule(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      showToast('error', 'Failed to fetch schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDay = (index, field, value) => {
    const newSchedule = [...schedule];
    newSchedule[index][field] = value;
    setSchedule(newSchedule);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/api/services/schedule', schedule);
      showToast('success', 'Schedule saved successfully');
    } catch (error) {
      showToast('error', 'Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">AI Schedule Hours</h1>
          <p className="text-sm text-gray-500 mt-1">Configure your availability for AI automated bookings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2 disabled:opacity-75"
        >
          {saving ? 'Saving...' : <><CheckCircle2 size={18} /> Save Settings</>}
        </button>
      </div>

      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 flex gap-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
          <Calendar className="text-blue-600" size={20} />
        </div>
        <div>
          <h4 className="font-bold text-gray-900 text-sm mb-1">How AI Scheduling works</h4>
          <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
            Toggle the days you are active. The AI Assistant will only confirm appointments within these active windows. If a client requests a time outside these hours, the AI will automatically suggest the next available opening.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {schedule.map((day, index) => (
            <div 
              key={index} 
              className={clsx(
                "flex items-center flex-wrap gap-4 p-5 border-b border-gray-50 transition-colors",
                !day.is_active && "bg-gray-50/50"
              )}
            >
              {/* Toggle & Day Label */}
              <div className="w-40 flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={day.is_active}
                    onChange={(e) => handleUpdateDay(index, 'is_active', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
                <span className={clsx("font-semibold text-sm", day.is_active ? "text-gray-900" : "text-gray-400 line-through")}>
                  {DAYS_OF_WEEK[day.day_of_week]}
                </span>
              </div>

              {/* Time Pickers */}
              <div className="flex items-center gap-3 mx-auto md:mx-0 opacity-100 transition-opacity" style={{ opacity: day.is_active ? 1 : 0.4, pointerEvents: day.is_active ? 'auto' : 'none' }}>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <input
                    type="time"
                    value={day.start_time || '09:00'}
                    onChange={(e) => handleUpdateDay(index, 'start_time', e.target.value)}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-gray-700 w-32"
                  />
                </div>
                <span className="text-gray-400 text-sm font-medium">to</span>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <input
                    type="time"
                    value={day.end_time || '17:00'}
                    onChange={(e) => handleUpdateDay(index, 'end_time', e.target.value)}
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-gray-700 w-32"
                  />
                </div>
              </div>
              
              {!day.is_active && (
                 <div className="ml-auto text-sm font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                   Closed
                 </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Availability;
