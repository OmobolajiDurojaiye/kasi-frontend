import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const DetailModal = ({ isOpen, onClose, title, subtitle, icon: Icon, accentColor = 'primary', children }) => {
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const colorMap = {
        primary: { bar: 'from-green-500 to-green-600', bg: 'bg-green-50', text: 'text-green-600' },
        blue: { bar: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600' },
        orange: { bar: 'from-orange-500 to-orange-600', bg: 'bg-orange-50', text: 'text-orange-600' },
        purple: { bar: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', text: 'text-purple-600' },
    };
    const colors = colorMap[accentColor] || colorMap.primary;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Accent bar */}
                <div className={`h-1 bg-gradient-to-r ${colors.bar}`} />

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-3">
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <div className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center`}>
                                <Icon size={20} />
                            </div>
                        )}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content (scrollable) */}
                <div className="px-6 pb-6 overflow-y-auto flex-1">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default DetailModal;
