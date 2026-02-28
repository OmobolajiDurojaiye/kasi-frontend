import React, { useState, useEffect } from 'react';
import { Plus, Search, MapPin, Clock, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { formatCurrency } from '../../../utils/formatters';

const Services = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    service_type: 'in_shop',
    duration: 30,
    is_active: true
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get('/api/services/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(response.data);
    } catch (error) {
      showToast('error', 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingService) {
        await axios.put(`/api/services/${editingService.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast('success', 'Service updated successfully');
      } else {
        await axios.post('/api/services/', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast('success', 'Service created successfully');
      }
      setIsModalOpen(false);
      setEditingService(null);
      fetchServices();
    } catch (error) {
      showToast('error', error.response?.data?.error || 'Failed to save service');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (service) => {
    setServiceToDelete(service);
  };

  const executeDelete = async () => {
    if (!serviceToDelete) return;
    setIsDeleting(true);
    try {
      await axios.delete(`/api/services/${serviceToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('success', 'Service deleted successfully');
      setServiceToDelete(null);
      fetchServices();
    } catch (error) {
      showToast('error', 'Failed to delete service');
    } finally {
      setIsDeleting(false);
    }
  };

  const openModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        description: service.description || '',
        price: service.price,
        service_type: service.service_type,
        duration: service.duration,
        is_active: service.is_active
      });
    } else {
      setEditingService(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        service_type: 'in_shop',
        duration: 30,
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Services</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your service offerings and prices</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Add Service</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm animate-pulse">
              <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded-lg w-1/2 mb-6"></div>
              <div className="h-20 bg-gray-100 rounded-xl mb-4"></div>
              <div className="flex gap-2">
                <div className="h-10 bg-gray-100 rounded-xl flex-1"></div>
                <div className="h-10 bg-gray-100 rounded-xl w-12"></div>
              </div>
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="text-green-600" size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No services yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">Create your first service to let AI schedule appointments for you.</p>
          <button
            onClick={() => openModal()}
            className="text-green-600 font-medium hover:text-green-700"
          >
            Create Service →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{service.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <MapPin size={14} className={service.service_type === 'home_service' ? 'text-purple-500' : 'text-blue-500'} />
                    <span>{service.service_type === 'home_service' ? 'Home Service' : 'In Shop'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm">
                    {formatCurrency(service.price)}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 bg-gray-50 w-fit px-3 py-1.5 rounded-lg border border-gray-100">
                 <Clock size={14} />
                 <span>{service.duration} mins</span>
              </div>
              
              <p className="text-sm text-gray-600 mb-6 line-clamp-2">
                {service.description || "No description provided."}
              </p>
              
              <div className="flex gap-2 pt-4 border-t border-gray-50">
                <button
                  onClick={() => openModal(service)}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors flex justify-center items-center gap-2 font-medium text-sm"
                >
                  <Edit2 size={16} /> Edit
                </button>
                <button
                  onClick={() => confirmDelete(service)}
                  className="px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors flex justify-center items-center font-medium text-sm"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {serviceToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Service</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete <span className="font-semibold text-gray-700">{serviceToDelete.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                disabled={isDeleting}
                onClick={() => setServiceToDelete(null)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={executeDelete}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex justify-center items-center"
              >
                {isDeleting ? (
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium text-gray-900"
                  placeholder="e.g. Premium Haircut"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium"
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    required
                    min="5"
                    step="5"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location Type</label>
                <select
                  value={formData.service_type}
                  onChange={(e) => setFormData({...formData, service_type: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-medium text-gray-900"
                >
                  <option value="in_shop">In Shop</option>
                  <option value="home_service">Home Service</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none"
                  placeholder="What is included in this service?"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-900 cursor-pointer">
                  Service is active and bookable
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : editingService ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
