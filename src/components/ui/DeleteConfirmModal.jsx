import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, message, loading }) => {
    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Red accent bar */}
                <div className="h-1 bg-gradient-to-r from-red-500 to-red-600" />

                <div className="p-6 text-center">
                    {/* Icon */}
                    <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                        <AlertTriangle size={28} className="text-red-500" />
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {title || 'Delete this item?'}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-6">
                        {message || 'This action cannot be undone. This will permanently remove the item from your records.'}
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-60"
                        >
                            {loading ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
