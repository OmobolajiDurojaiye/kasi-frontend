import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import clsx from 'clsx';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] space-y-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={clsx(
              "flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg transition-all duration-300 transform translate-x-0 animate-slide-in min-w-[300px]",
              toast.type === 'success' && "bg-white border-l-4 border-green-500 text-dark",
              toast.type === 'error' && "bg-white border-l-4 border-red-500 text-dark",
              toast.type === 'info' && "bg-white border-l-4 border-blue-500 text-dark"
            )}
          >
            {toast.type === 'success' && <CheckCircle className="text-green-500" size={20} />}
            {toast.type === 'error' && <AlertCircle className="text-red-500" size={20} />}
            {toast.type === 'info' && <Info className="text-blue-500" size={20} />}
            
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            
            <button onClick={() => removeToast(toast.id)} className="text-gray-400 hover:text-dark">
                <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
