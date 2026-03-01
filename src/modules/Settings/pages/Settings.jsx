import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { useTheme, THEMES } from '../../../context/ThemeContext';
import Button from '../../../components/ui/Button';
import api from '../../../api/axios';
import { Save, Building, Phone, MapPin, CreditCard, Image as ImageIcon, Palette, User, Check, Brain } from 'lucide-react';

/* ── Tab Button ───────────────────────────────────── */
const TabButton = ({ active, icon: Icon, label, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-xl transition-all
            ${active
                ? 'bg-primary text-white shadow-md shadow-green-200'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
    >
        <Icon size={18} />
        {label}
    </button>
);

/* ── Theme Card ───────────────────────────────────── */
const ThemeCard = ({ theme, isSelected, onSelect }) => (
    <button
        onClick={() => onSelect(theme.id)}
        className={`relative group rounded-2xl overflow-hidden border-2 transition-all hover:scale-[1.03]
            ${isSelected ? 'border-primary shadow-lg shadow-green-100 ring-2 ring-primary/20' : 'border-gray-200 hover:border-gray-300'}`}
        style={{ width: '100%' }}
    >
        {/* Mini preview */}
        <div className="p-3" style={{ backgroundColor: theme.body }}>
            {/* Fake topbar */}
            <div className="h-2 rounded-full mb-2" style={{ backgroundColor: theme.accent, width: '60%', opacity: 0.8 }} />
            {/* Fake card */}
            <div className="rounded-lg p-2 mb-1.5" style={{ backgroundColor: theme.card }}>
                <div className="h-1.5 rounded-full mb-1" style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)', width: '80%' }} />
                <div className="h-1.5 rounded-full" style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', width: '50%' }} />
            </div>
            {/* Fake rows */}
            <div className="space-y-1">
                <div className="h-1 rounded-full" style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', width: '100%' }} />
                <div className="h-1 rounded-full" style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', width: '70%' }} />
            </div>
        </div>

        {/* Label */}
        <div className={`px-3 py-2 text-center text-xs font-semibold border-t
            ${isSelected ? 'bg-green-50 text-green-700 border-green-100' : 'bg-white text-gray-600 border-gray-100'}`}>
            <span className="mr-1">{theme.emoji}</span>
            {theme.name}
        </div>

        {/* Selected check */}
        {isSelected && (
            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center">
                <Check size={12} strokeWidth={3} />
            </div>
        )}
    </button>
);

/* ── Main Settings Page ───────────────────────────── */
const Settings = () => {
    const { user, token, fetchUser } = useAuth();
    const { addToast } = useToast();
    const { theme: currentTheme, setTheme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');

    const [formData, setFormData] = useState({
        business_name: '',
        phone: '',
        address: '',
        logo_url: '',
        bank_name: '',
        account_number: '',
        account_name: '',
        ai_instructions: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                business_name: user.business_name || '',
                phone: user.phone || '',
                address: user.address || '',
                logo_url: user.logo_url || '',
                bank_name: user.bank_name || '',
                account_number: user.account_number || '',
                account_name: user.account_name || '',
                ai_instructions: user.ai_instructions || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.patch('/api/auth/profile', formData);
            if (fetchUser) await fetchUser(); // Hydrate context
            addToast('Profile updated successfully', 'success');
        } catch (error) {
            console.error('Error updating profile:', error);
            addToast('Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-dark mb-1">Settings</h1>
                <p className="text-gray-500 text-sm">Manage your business profile, billing, and appearance.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
                <TabButton active={activeTab === 'profile'} icon={User} label="Profile" onClick={() => setActiveTab('profile')} />
                <TabButton active={activeTab === 'billing'} icon={CreditCard} label="Billing" onClick={() => setActiveTab('billing')} />
                <TabButton active={activeTab === 'ai_rules'} icon={Brain} label="AI Rules" onClick={() => setActiveTab('ai_rules')} />
                <TabButton active={activeTab === 'appearance'} icon={Palette} label="Appearance" onClick={() => setActiveTab('appearance')} />
            </div>

            {/* ── PROFILE TAB ─────────────────────── */}
            {activeTab === 'profile' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                        <h2 className="text-xl font-bold text-dark flex items-center gap-2">
                            <Building className="text-primary" size={24} />
                            Business Details
                        </h2>

                        {/* Logo Upload */}
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden relative group">
                                {formData.logo_url ? (
                                    <img src={formData.logo_url} alt="Business Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon className="text-gray-400" size={32} />
                                )}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    onClick={() => document.getElementById('logoInput').click()}
                                >
                                    <span className="text-white text-xs font-semibold">Change</span>
                                </div>
                            </div>
                            <div>
                                <p className="font-medium text-dark">Business Logo</p>
                                <p className="text-xs text-gray-500 mb-2">Upload your logo to appear on invoices.</p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="text-xs py-1.5 px-3 h-auto"
                                    onClick={() => document.getElementById('logoInput').click()}
                                >
                                    Upload Logo
                                </Button>
                                <input
                                    id="logoInput"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async (e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;

                                        const uploadData = new FormData();
                                        uploadData.append('file', file);

                                        try {
                                            setLoading(true);
                                            const res = await api.post('/api/auth/profile/logo', uploadData, {
                                                headers: {
                                                    'Content-Type': 'multipart/form-data'
                                                }
                                            });
                                            setFormData(prev => ({ ...prev, logo_url: res.data.logo_url }));
                                            addToast('Logo uploaded successfully!', 'success');
                                        } catch (err) {
                                            console.error(err);
                                            addToast('Failed to upload logo', 'error');
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Business Name</label>
                                <input
                                    type="text"
                                    name="business_name"
                                    value={formData.business_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-green-500 focus:ring-0 transition-all font-medium"
                                    placeholder="My Business Ltd"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Phone Number (WhatsApp)</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-green-500 focus:ring-0 transition-all font-medium"
                                        placeholder="+234..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-gray-700">Business Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-green-500 focus:ring-0 transition-all font-medium"
                                        placeholder="123 Market Street, Lagos"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-primary hover:bg-green-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-green-200 inline-flex items-center gap-2"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                            <Save size={20} className="ml-2" />
                        </Button>
                    </div>
                </form>
            )}

            {/* ── BILLING TAB ─────────────────────── */}
            {activeTab === 'billing' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                        <h2 className="text-xl font-bold text-dark flex items-center gap-2">
                            <CreditCard className="text-primary" size={24} />
                            Payment Information
                        </h2>
                        <p className="text-sm text-gray-500 -mt-3">This info appears on your invoices so customers know where to send payment.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Bank Name</label>
                                <input
                                    type="text"
                                    name="bank_name"
                                    value={formData.bank_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-green-500 focus:ring-0 transition-all font-medium"
                                    placeholder="GTBank, Zenith, Opay..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Account Number</label>
                                <input
                                    type="text"
                                    name="account_number"
                                    value={formData.account_number}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-green-500 focus:ring-0 transition-all font-medium"
                                    placeholder="0123456789"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-gray-700">Account Name</label>
                                <input
                                    type="text"
                                    name="account_name"
                                    value={formData.account_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-green-500 focus:ring-0 transition-all font-medium"
                                    placeholder="Must match your business name"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Billing Preview */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Invoice Preview</h3>
                        <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                            <p className="text-xs text-green-600 font-medium uppercase tracking-wider mb-3">Payment Details</p>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-400 text-xs mb-0.5">Bank</p>
                                    <p className="font-semibold text-gray-800">{formData.bank_name || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs mb-0.5">Account</p>
                                    <p className="font-semibold text-gray-800">{formData.account_number || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs mb-0.5">Name</p>
                                    <p className="font-semibold text-gray-800">{formData.account_name || '—'}</p>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400">This is how your payment info will appear on generated invoices.</p>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-primary hover:bg-green-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-green-200 inline-flex items-center gap-2"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                            <Save size={20} className="ml-2" />
                        </Button>
                    </div>
                </form>
            )}

            {/* ── AI RULES TAB ─────────────────────── */}
            {activeTab === 'ai_rules' && (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                        <h2 className="text-xl font-bold text-dark flex items-center gap-2">
                            <Brain className="text-primary" size={24} />
                            Custom AI Instructions
                        </h2>
                        <p className="text-sm text-gray-500 -mt-3">Teach Kasi how to talk to your customers. Add your specific return policies, delivery times, or brand tone here.</p>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Business Context & Rules</label>
                            <textarea
                                name="ai_instructions"
                                value={formData.ai_instructions}
                                onChange={handleChange}
                                rows={8}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-green-500 focus:ring-0 transition-all font-medium text-sm"
                                placeholder="E.g., 'We do not offer refunds, only exchanges. Standard delivery takes 3-5 days in Lagos for ₦3,000. Always end your messages with: Stay Beautiful!'"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-primary hover:bg-green-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-green-200 inline-flex items-center gap-2"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                            <Save size={20} className="ml-2" />
                        </Button>
                    </div>
                </form>
            )}

            {/* ── APPEARANCE TAB ──────────────────── */}
            {activeTab === 'appearance' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-dark flex items-center gap-2">
                                <Palette className="text-primary" size={24} />
                                Theme
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Choose a theme that matches your vibe. Changes apply instantly.</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {THEMES.map((t) => (
                                <ThemeCard
                                    key={t.id}
                                    theme={t}
                                    isSelected={currentTheme === t.id}
                                    onSelect={setTheme}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Helpful note */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500">
                            <span className="font-semibold text-dark">Pro tip:</span> Your selected theme is saved automatically and persists across sessions. The theme applies to your entire dashboard.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
