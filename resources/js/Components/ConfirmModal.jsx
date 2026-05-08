import React from 'react';
import { AlertCircle, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Ya, Lanjutkan", cancelText = "Batal", type = "danger" }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" 
                onClick={onClose}
            ></div>
            <div className="relative bg-white dark:bg-[#16181c] rounded-[2.5rem] w-full max-w-sm shadow-2xl p-8 animate-in zoom-in-95 duration-300 border border-seamist-100 dark:border-[#2f3336]">
                <button 
                    onClick={onClose} 
                    className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-[#e7e9ea] hover:bg-gray-100 dark:hover:bg-[#15202b] rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 ${type === 'danger' ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500' : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'}`}>
                        <AlertCircle className="w-10 h-10" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-[#e7e9ea] mb-2 leading-tight">
                        {title}
                    </h3>
                    <p className="text-gray-500 dark:text-[#71767b] font-medium leading-relaxed mb-8">
                        {message}
                    </p>

                    <div className="flex flex-col w-full gap-3">
                        <button 
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`w-full py-4 rounded-2xl font-bold text-white shadow-lg transition-all hover:-translate-y-1 active:translate-y-0 ${type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-100' : 'bg-indigo-700 hover:bg-indigo-800 shadow-indigo-100'}`}
                        >
                            {confirmText}
                        </button>
                        <button 
                            onClick={onClose}
                            className="w-full py-4 rounded-2xl font-semibold text-gray-400 dark:text-[#71767b] hover:text-gray-600 dark:hover:text-[#e7e9ea] hover:bg-gray-50 dark:hover:bg-[#15202b] transition-all"
                        >
                            {cancelText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
