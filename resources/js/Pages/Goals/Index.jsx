import AppLayout from '@/Layouts/AppLayout';
import { Head, usePage } from '@inertiajs/react';
import { Target, TrendingUp, Car, Home, Plane, Plus, X, Trash2, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '@/Store/useAppStore';
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import ConfirmModal from '@/Components/ConfirmModal';

const iconMap = {
    TrendingUp,
    Car,
    Home,
    Plane,
};

export default function GoalsIndex() {
    const { props } = usePage();

    // Sync server data into Zustand store on mount
    const syncFromServer = useAppStore(state => state.syncFromServer);
    useEffect(() => {
        syncFromServer(props);
    }, []);

    const { goals, addGoal, deleteGoal, completeGoal } = useAppStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newTarget, setNewTarget] = useState('');
    const [parsedTarget, setParsedTarget] = useState(0);

    // Custom Confirm States
    const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null, title: '' });
    const [confirmComplete, setConfirmComplete] = useState({ isOpen: false, goal: null });

    // Hero Fitur: Analyze nominal from string (50rb -> 50000)
    const analyzeAmount = (input) => {
        if (!input) return 0;
        let text = input.toLowerCase().trim();
        
        // Match numeric multipliers (e.g., 3.5jt, 50k, 1,2juta)
        const multiplierMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(jt|juta|k|rb|ribu)\b/i);
        
        if (multiplierMatch) {
            const numPart = multiplierMatch[1].replace(',', '.');
            const unitPart = multiplierMatch[2].toLowerCase();
            let multiplier = 1;
            
            if (unitPart === 'jt' || unitPart === 'juta') multiplier = 1000000;
            else if (unitPart === 'k' || unitPart === 'rb' || unitPart === 'ribu') multiplier = 1000;
            
            const val = parseFloat(numPart);
            return isNaN(val) ? 0 : Math.floor(val * multiplier);
        } else {
            let cleanText = text.replace(/[^0-9.,]/g, '');
            if (cleanText.includes('.') && cleanText.includes(',')) {
                cleanText = cleanText.replace(/\./g, '').replace(',', '.');
            } else if (cleanText.includes('.')) {
                const parts = cleanText.split('.');
                if (parts[parts.length - 1].length === 3 && parts.length > 1) {
                    cleanText = cleanText.replace(/\./g, '');
                }
            } else if (cleanText.includes(',')) {
                cleanText = cleanText.replace(',', '.');
            }
            const val = parseFloat(cleanText);
            return isNaN(val) ? 0 : Math.floor(val);
        }
    };

    useEffect(() => {
        setParsedTarget(analyzeAmount(newTarget));
    }, [newTarget]);

    const handleAddGoal = (e) => {
        e.preventDefault();
        const finalTarget = parsedTarget || Number(newTarget.replace(/\D/g, ''));
        if (!newTitle.trim() || !finalTarget) return;

        const titleLower = newTitle.toLowerCase();
        let iconName = 'TrendingUp';
        let color = 'text-blue-600';
        let bg = 'bg-blue-100';

        if (titleLower.includes('mobil') || titleLower.includes('motor') || titleLower.includes('kendaraan')) {
            iconName = 'Car';
            color = 'text-orange-600';
            bg = 'bg-orange-100';
        } else if (titleLower.includes('rumah') || titleLower.includes('kos') || titleLower.includes('apart')) {
            iconName = 'Home';
            color = 'text-teal-600';
            bg = 'bg-teal-100';
        } else if (titleLower.includes('libur') || titleLower.includes('jalan') || titleLower.includes('nikah')) {
            iconName = 'Plane';
            color = 'text-purple-600';
            bg = 'bg-purple-100';
        }

        addGoal({
            id: Date.now(),
            title: newTitle,
            target: finalTarget,
            current: 0,
            icon: iconName,
            color,
            bg
        });

        setNewTitle('');
        setNewTarget('');
        setIsModalOpen(false);
    };

    const handleCompleteAction = () => {
        const { goal } = confirmComplete;
        if (!goal) return;
        
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
        
        completeGoal(goal.id);
    };

    // Trigger auto confetti if any goal hits 100% just now (simple approach)
    useEffect(() => {
        goals.forEach(goal => {
            if (goal.current >= goal.target) {
                confetti({
                    particleCount: 50,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#a33b3b', '#bd5353']
                });
                confetti({
                    particleCount: 50,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#a33b3b', '#bd5353']
                });
            }
        });
    }, [goals]);

    return (
        <AppLayout
            header={<h2 className="text-xl font-bold leading-tight text-indigo-800 dark:text-seamist-300">Target Tabungan</h2>}
        >
            <Head title="Tabungan" />

            <div className="p-4 md:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto relative">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-seamist-200 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div>
                        <h3 className="font-extrabold text-gray-800 dark:text-gray-100 text-2xl mb-1">Target Menabung</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">Ayo capai mimpimu pelan-pelan!</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-700 text-seamist-50 rounded-xl font-bold hover:bg-indigo-800 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all"
                    >
                        <Plus className="w-5 h-5" /> Tambah Target
                    </button>
                </div>

                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                        <div className="relative bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-300">
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Target Baru</h3>
                            <form onSubmit={handleAddGoal} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nama Target</label>
                                    <input 
                                        type="text" 
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        placeholder="Contoh: DP Mobil, Liburan..."
                                        className="w-full bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 rounded-xl focus:border-indigo-500 focus:ring-indigo-500 dark:text-gray-100 dark:placeholder:text-gray-500"
                                        required
                                        autoFocus
                                    />
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Sistem akan menyesuaikan icon secara otomatis!</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nominal Target</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rp</span>
                                        <input 
                                            type="text" 
                                            value={newTarget}
                                            onChange={(e) => setNewTarget(e.target.value)}
                                            placeholder="Contoh: 50jt atau 50000000"
                                            className="w-full pl-12 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 rounded-xl focus:border-indigo-500 focus:ring-indigo-500 font-semibold dark:text-gray-100 dark:placeholder:text-gray-500"
                                            required
                                        />
                                    </div>
                                    {parsedTarget > 0 && (
                                        <p className="text-sm font-semibold text-green-600 dark:text-green-400 mt-2 bg-green-50 dark:bg-green-950/30 px-3 py-1 rounded-lg inline-block border border-green-100 dark:border-green-900/30">
                                            = Rp {parsedTarget.toLocaleString('id-ID')}
                                        </p>
                                    )}
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2 leading-tight">
                                        <b>Fitur Pintar:</b> Kamu bisa ketik "50rb", "10jt", atau "100k"! Sistem akan otomatis menghitungnya.
                                    </p>
                                </div>
                                <button type="submit" className="w-full bg-indigo-700 hover:bg-indigo-800 text-seamist-50 font-semibold py-3 rounded-xl transition-all shadow-md mt-4">
                                    Simpan Target
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map((goal, index) => {
                        const percentage = Math.min(Math.round((goal.current / goal.target) * 100), 100);
                        const isComplete = percentage === 100;
                        const Icon = iconMap[goal.icon] || Target;
                        
                        return (
                            <div 
                                key={goal.id} 
                                className={`relative bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 ${isComplete ? 'border-green-400 dark:border-green-600 bg-green-50/30 dark:bg-green-950/20' : 'border-seamist-200 dark:border-slate-700'}`}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <button 
                                    onClick={() => setConfirmDelete({ isOpen: true, id: goal.id, title: goal.title })}
                                    className="absolute top-4 right-4 p-2 text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                <div className="flex items-center gap-4 mb-6 pr-8">
                                    <div className={`p-4 rounded-2xl ${isComplete ? 'bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400' : goal.bg + ' ' + goal.color} group-hover:scale-110 transition-transform duration-300`}>
                                        {isComplete ? <CheckCircle2 className="w-8 h-8" /> : <Icon className="w-8 h-8" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-800 dark:text-gray-100 text-lg mb-1 truncate" title={goal.title}>{goal.title}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-1">Terkumpul</p>
                                        <p className="text-sm text-gray-800 dark:text-gray-200 font-semibold truncate">
                                            Rp {goal.current.toLocaleString('id-ID')} <span className="text-gray-400 dark:text-gray-500 font-normal">/ Rp {goal.target.toLocaleString('id-ID')}</span>
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-full bg-seamist-100 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
                                        <div 
                                            className={`${isComplete ? 'bg-green-500' : 'bg-indigo-600'} h-full rounded-full transition-all duration-1000 ease-out relative`} 
                                            style={{ width: `${percentage}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                                        </div>
                                    </div>
                                    <div className={`font-semibold text-xl min-w-[3rem] text-right ${isComplete ? 'text-green-600 dark:text-green-400' : 'text-indigo-700 dark:text-indigo-400'}`}>{percentage}%</div>
                                </div>

                                {!isComplete && (
                                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mt-1">
                                        Sisa <span className="text-indigo-600 dark:text-indigo-400">Rp {(goal.target - goal.current).toLocaleString('id-ID')}</span> lagi menuju target!
                                    </p>
                                )}

                                {isComplete && (
                                    <button 
                                        onClick={() => setConfirmComplete({ isOpen: true, goal })}
                                        className="w-full mt-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm transition-colors animate-in zoom-in"
                                    >
                                        Selesai & Tarik Saldo
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 bg-gradient-to-r from-seamist-100 dark:from-slate-800 to-indigo-50 dark:to-slate-800 p-8 rounded-3xl border border-seamist-200 dark:border-slate-700 text-center max-w-3xl mx-auto shadow-inner transition-transform hover:scale-[1.02] duration-300">
                    <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Target className="w-8 h-8 text-indigo-600 dark:text-seamist-300" />
                    </div>
                    <h4 className="font-extrabold text-2xl text-indigo-800 dark:text-seamist-300 mb-3">Tetap Semangat!</h4>
                    <p className="text-indigo-700/80 dark:text-gray-300 font-medium text-lg">
                        Kamu bisa menambah saldo tabungan langsung dari halaman <span className="font-bold text-indigo-900 dark:text-seamist-300 bg-white/50 dark:bg-slate-700 px-2 py-1 rounded-md">Chat</span>. Pilih opsi "Menabung"!
                    </p>
                </div>
            </div>

            <ConfirmModal 
                isOpen={confirmDelete.isOpen}
                onClose={() => setConfirmDelete({ isOpen: false, id: null, title: '' })}
                onConfirm={() => { deleteGoal(confirmDelete.id); setConfirmDelete({ isOpen: false, id: null, title: '' }); }}
                title="Hapus Target?"
                message={`Yakin ingin menghapus target "${confirmDelete.title}"? Progress tabunganmu akan hilang.`}
            />

            <ConfirmModal 
                isOpen={confirmComplete.isOpen}
                onClose={() => setConfirmComplete({ isOpen: false, goal: null })}
                onConfirm={handleCompleteAction}
                type="success"
                confirmText="Ya, Tarik Saldo"
                title="Tarik Tabungan?"
                message={`Selamat! Kamu berhasil menabung Rp ${confirmComplete.goal?.current.toLocaleString('id-ID')}. Tarik ke saldo utama sekarang?`}
            />
        </AppLayout>
    );
}
