import React, { useState, useEffect } from 'react';
import { Package, Plus, Pencil, Trash2, X, Upload, ImageIcon } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { ProductGridSkeleton } from '../../../components/ui/Skeleton';

const Products = () => {
  const { token } = useAuth();
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    min_price: '',
    in_stock: true,
  });

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/products/', { headers });
      setProducts(res.data);
    } catch {
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', min_price: '', in_stock: true });
    setEditing(null);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await axios.patch(`/api/products/${editing}`, form, { headers });
        showToast('Product updated!', 'success');
      } else {
        await axios.post('/api/products/', form, { headers });
        showToast('Product added!', 'success');
      }
      resetForm();
      fetchProducts();
    } catch {
      showToast('Failed to save product', 'error');
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      min_price: product.min_price || '',
      in_stock: product.in_stock,
    });
    setEditing(product.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await axios.delete(`/api/products/${id}`, { headers });
      showToast('Product deleted', 'success');
      fetchProducts();
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  const handleImageUpload = async (productId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      await axios.post(`/api/products/${productId}/image`, formData, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
      });
      showToast('Image uploaded!', 'success');
      fetchProducts();
    } catch {
      showToast('Failed to upload image', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-dark">Products</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your product catalog — the AI assistant uses this to answer customer queries
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl hover:bg-green-700 transition-colors text-sm font-medium"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <ProductGridSkeleton />
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Package size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-dark mb-2">No products yet</h3>
          <p className="text-gray-500 text-sm mb-4">
            Add your products so the AI can answer pricing and availability questions.
          </p>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <Plus size={18} />
            Add Your First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Image area */}
              <div className="relative h-40 bg-gray-50 flex items-center justify-center">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon size={32} className="text-gray-300" />
                )}
                {/* Upload button overlay */}
                <label className="absolute bottom-2 right-2 p-2 bg-white/90 rounded-lg shadow-sm cursor-pointer hover:bg-white transition-colors">
                  <Upload size={14} className="text-gray-500" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files[0]) handleImageUpload(product.id, e.target.files[0]);
                    }}
                  />
                </label>
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-dark text-sm">{product.name}</h3>
                    {product.description && (
                      <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{product.description}</p>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      product.in_stock
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {product.in_stock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <span className="text-lg font-bold text-primary">₦{Number(product.price).toLocaleString()}</span>
                  {product.min_price && (
                    <span className="text-xs text-gray-400">Min: ₦{Number(product.min_price).toLocaleString()}</span>
                  )}
                </div>

                <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary transition-colors"
                  >
                    <Pencil size={13} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors ml-auto"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload spinner overlay */}
      {uploading && (
        <div className="fixed inset-0 z-[1000] bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-xl px-6 py-4 shadow-lg text-sm font-medium text-dark">
            Uploading image...
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-bold text-dark">
                {editing ? 'Edit Product' : 'Add Product'}
              </h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Red Lipgloss"
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief product description"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="5000"
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Price (₦)</label>
                  <input
                    type="number"
                    value={form.min_price}
                    onChange={(e) => setForm({ ...form, min_price: e.target.value })}
                    placeholder="3000"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="in_stock"
                  checked={form.in_stock}
                  onChange={(e) => setForm({ ...form, in_stock: e.target.checked })}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="in_stock" className="text-sm text-gray-700">In Stock</label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  {editing ? 'Update' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
