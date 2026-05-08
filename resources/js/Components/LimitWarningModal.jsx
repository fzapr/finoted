import { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useAppStore } from '@/Store/useAppStore';

export default function LimitWarningModal() {
    const { todayExpense, dailyLimit, hasTriggeredLimit, setHasTriggeredLimit, isLimitEnabled } = useAppStore();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Trigger if expense exceeds limit and it hasn't triggered yet
        if (todayExpense >= dailyLimit && !hasTriggeredLimit && dailyLimit > 0 && isLimitEnabled) {
            setIsOpen(true);
            setHasTriggeredLimit(true); // only trigger once per session/threshold
        } else if (todayExpense < dailyLimit) {
            // Reset if expense goes down (though usually it only goes up)
            setHasTriggeredLimit(false);
        }
    }, [todayExpense, dailyLimit, hasTriggeredLimit, setHasTriggeredLimit, isLimitEnabled]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={() => setIsOpen(false)}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-300">
                <button 
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center space-y-4">
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                        <AlertTriangle className="w-12 h-12 text-red-500" />
                    </div>
                    
                    <h3 className="text-2xl font-black text-gray-800">Oops! Tunggu Dulu!</h3>
                    
                    <div className="bg-red-50 text-red-800 p-4 rounded-2xl text-sm font-medium leading-relaxed border border-red-100">
                        Pengeluaranmu hari ini udah nyentuh <span className="font-bold text-red-600">Rp {todayExpense.toLocaleString('id-ID')}</span> nih! Padahal limit jatah jajanmu cuma <span className="font-bold text-red-600">Rp {dailyLimit.toLocaleString('id-ID')}</span>. 
                    </div>
                    
                    <p className="text-gray-500 text-sm">
                        Mulai rem dikit yuk jajan-jajannya biar tabungan cepet kekumpul!
                    </p>

                    <button 
                        onClick={() => setIsOpen(false)}
                        className="w-full mt-6 bg-indigo-700 hover:bg-indigo-800 text-seamist-50 font-bold py-4 rounded-2xl transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                        Siap, Aku Akan Berhemat
                    </button>
                </div>
            </div>
        </div>
    );
}
