import AppLayout from '@/Layouts/AppLayout';
import { Head, usePage, Link } from '@inertiajs/react';
import { useAppStore } from '@/Store/useAppStore';
import { useState, useMemo, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Wallet, ArrowDownRight, ArrowUpRight, Sparkles, Trash2, TrendingUp, ReceiptText, Eye, EyeOff, FileDown, PieChart, Users, Calendar, CheckCircle2 } from 'lucide-react';
import ConfirmModal from '@/Components/ConfirmModal';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
    const { props } = usePage();
    const user = props.auth.user;
    
    // Sync server data into Zustand store
    const syncFromServer = useAppStore(state => state.syncFromServer);
    useEffect(() => {
        syncFromServer(props);
    }, []);

    // Global State (now populated from server via sync)
    const balance = useAppStore(state => state.balance);
    const todayExpense = useAppStore(state => state.todayExpense);
    const dailyLimit = useAppStore(state => state.dailyLimit);
    const isLimitEnabled = useAppStore(state => state.isLimitEnabled);
    const transactions = useAppStore(state => state.transactions);
    const deleteTransaction = useAppStore(state => state.deleteTransaction);
    const goals = useAppStore(state => state.goals);
    const debts = useAppStore(state => state.debts);
    const markAsPaid = useAppStore(state => state.markAsPaid);
    const deleteDebt = useAppStore(state => state.deleteDebt);
    const walletFilter = useAppStore(state => state.walletFilter);
    const setWalletFilter = useAppStore(state => state.setWalletFilter);

    const safeToSpend = useMemo(() => {
        const goalsShortfall = goals.reduce((acc, goal) => acc + Math.max(0, goal.target - goal.current), 0);
        return Math.max(0, balance - goalsShortfall);
    }, [balance, goals]);

    const limitPercentage = useMemo(() => {
        if (!isLimitEnabled || dailyLimit === 0) return 0;
        return Math.min(Math.round((todayExpense / dailyLimit) * 100), 100);
    }, [todayExpense, dailyLimit, isLimitEnabled]);

    // Local State for Custom Confirm & Privacy
    const [confirmData, setConfirmData] = useState({ isOpen: false, id: null });
    const [isBalanceHidden, setIsBalanceHidden] = useState(false);
    const [filterCategory, setFilterCategory] = useState(null);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        if (transactions.length > 0 || balance > 0) {
            setIsInitialLoad(false);
        }
    }, [transactions, balance]);

    const savingsRate = useMemo(() => {
        const relevantTrx = transactions.filter(t => t.wallet_type === walletFilter);
        const totalIncome = relevantTrx.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
        const totalSavings = relevantTrx.filter(t => t.type === 'savings').reduce((a, b) => a + b.amount, 0);
        if (totalIncome === 0) return 0;
        return Math.round((totalSavings / totalIncome) * 100);
    }, [transactions, walletFilter]);

    // Dynamic Insight Logic
    const insight = useMemo(() => {
        if (transactions.length === 0) return "Mulai catat transaksi pertamamu untuk melihat analisis di sini.";
        if (todayExpense === 0) return "Belum ada pengeluaran hari ini. Pertahankan hematmu!";
        if (todayExpense > 500000) return "Perhatian, pengeluaranmu hari ini cukup besar. Harap tinjau kembali.";
        if (savingsRate >= 20) return `Hebat! Rasio tabunganmu bulan ini mencapai ${savingsRate}%. Terus tingkatkan!`;
        return `Kamu sudah menggunakan Rp ${todayExpense.toLocaleString('id-ID')} hari ini. Tetap terkontrol.`;
    }, [todayExpense, transactions, savingsRate]);

    // Dynamic Data for Doughnut Chart
    const categoryExpenses = useMemo(() => {
        return transactions
            .filter(t => t.type === 'expense' && t.wallet_type === walletFilter)
            .reduce((acc, t) => {
                acc[t.title] = (acc[t.title] || 0) + t.amount;
                return acc;
            }, {});
    }, [transactions, walletFilter]);

    const doughnutData = {
        labels: Object.keys(categoryExpenses).length > 0 ? Object.keys(categoryExpenses) : ['Belum ada data'],
        datasets: [
            {
                data: Object.keys(categoryExpenses).length > 0 ? Object.values(categoryExpenses) : [1],
                backgroundColor: [
                    '#a33b3b', // indigo-600
                    '#f97316', // orange-500
                    '#3b82f6', // blue-500
                    '#10b881', // emerald-500
                    '#8b5cf6', // violet-500
                ],
                borderWidth: 0,
                hoverOffset: 10,
            },
        ],
    };

    const doughnutOptions = {
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
            legend: { 
                position: 'bottom', 
                labels: { 
                    font: { family: "'Outfit', sans-serif", weight: '400' },
                    usePointStyle: true,
                    padding: 20
                } 
            },
            tooltip: {
                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                padding: 12,
                titleFont: { family: "'Outfit', sans-serif", size: 14 },
                bodyFont: { family: "'Outfit', sans-serif", size: 13 },
                cornerRadius: 12,
            }
        },
        onClick: (event, elements) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const label = doughnutData.labels[index];
                if (label !== 'Belum ada data') {
                    setFilterCategory(prev => prev === label ? null : label);
                }
            }
        },
    };

    // Dynamic Data for Bar Chart (from server)
    const serverMonthly = props.monthlyData || [];
    const barData = {
        labels: serverMonthly.map(m => m.label),
        datasets: [
            {
                label: 'Pemasukan',
                data: serverMonthly.map(m => m.income),
                backgroundColor: 'rgba(108, 176, 181, 0.6)', // Seamist 500
                borderRadius: 6,
            },
            {
                label: 'Pengeluaran',
                data: serverMonthly.map(m => m.expense),
                backgroundColor: 'rgba(52, 61, 138, 0.6)', // Indigo 700 (Base)
                borderRadius: 6,
            },
        ],
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { font: { family: "'Outfit', sans-serif", weight: '500' } } },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#f3f4f6', drawBorder: false },
                ticks: {
                    callback: (value) => 'Rp ' + (value/1000000) + 'M',
                    font: { family: "'Outfit', sans-serif", weight: '400' }
                }
            },
            x: { grid: { display: false }, ticks: { font: { family: "'Outfit', sans-serif", weight: '400' } } }
        }
    };

    // Helper: Group Transactions by Date
    const filteredTransactions = useMemo(() => {
        let list = transactions.filter(t => t.wallet_type === walletFilter);
        if (!filterCategory) return list;
        return list.filter(t => t.title === filterCategory || (t.type === 'expense' && filterCategory === 'Lainnya' && !['Makan', 'Transport', 'Belanja'].includes(t.title)));
    }, [transactions, filterCategory, walletFilter]);

    const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
        const dateObj = new Date(transaction.date);
        const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        
        const label = dateStr === todayStr ? 'Hari Ini' : dateStr;
        
        if (!groups[label]) groups[label] = [];
        groups[label].push(transaction);
        return groups;
    }, {});

    return (
        <AppLayout
            header={
                <div className="flex items-center justify-between w-full">
                    <h2 className="text-xl font-bold leading-tight text-indigo-800 dark:text-seamist-300">Beranda Keuangan</h2>
                    <div className="flex bg-gray-100 dark:bg-slate-700 p-1 rounded-xl">
                        <button 
                            onClick={() => setWalletFilter('personal')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${walletFilter === 'personal' ? 'bg-white dark:bg-slate-600 text-indigo-700 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            Pribadi
                        </button>
                        <button 
                            onClick={() => setWalletFilter('business')}
                            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${walletFilter === 'business' ? 'bg-white dark:bg-slate-600 text-indigo-700 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            Kuliah
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Beranda" />

            <div className="p-4 md:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
                
                {/* Greeting Section */}
                <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-seamist-200 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex-1">
                        {isInitialLoad ? (
                            <div className="space-y-2">
                                <div className="h-8 w-48 bg-gray-100 dark:bg-slate-700 rounded-lg animate-pulse"></div>
                                <div className="h-6 w-64 bg-gray-50 dark:bg-slate-700/50 rounded-lg animate-pulse"></div>
                            </div>
                        ) : (
                            <>
                                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-1 tracking-tight">
                                    Halo, {user?.name.split(' ')[0] || 'Teman'}!
                                </h1>
                                <p className="text-indigo-600 dark:text-seamist-300 font-medium bg-indigo-50 dark:bg-slate-700 px-4 py-1.5 rounded-full inline-block text-sm mt-1">
                                    {insight}
                                </p>
                            </>
                        )}
                    </div>
                    <div className="hidden sm:flex p-4 bg-indigo-50 dark:bg-slate-700 text-indigo-600 dark:text-seamist-300 rounded-2xl">
                        <Sparkles className="w-8 h-8 animate-pulse" />
                    </div>
                </div>

                {/* Saldo / Ringkasan Card */}
                <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group transition-all duration-300 hover:shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700"></div>
                    
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2 text-indigo-100/80">
                                    <Wallet className="w-5 h-5" />
                                    <span className="font-medium text-xs uppercase tracking-widest">Saldo Bebas Jajan</span>
                                    <button 
                                        onClick={() => setIsBalanceHidden(!isBalanceHidden)}
                                        className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors text-indigo-200 hover:text-white"
                                        title={isBalanceHidden ? "Tampilkan Saldo" : "Sembunyikan Saldo"}
                                    >
                                        {isBalanceHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <div className="text-4xl md:text-6xl font-semibold tracking-tighter text-white">
                                    {isInitialLoad ? (
                                        <div className="h-12 w-64 bg-white/10 rounded-2xl animate-pulse"></div>
                                    ) : (
                                        <>Rp {isBalanceHidden ? '***.***' : safeToSpend.toLocaleString('id-ID')}</>
                                    )}
                                </div>
                            </div>
                            <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10 self-start md:self-auto">
                                <span className="text-[10px] font-medium text-indigo-200 uppercase tracking-widest block mb-0.5">Total Saldo Tersedia</span>
                                <span className="text-lg font-bold text-white">
                                    Rp {isBalanceHidden ? '***.***' : balance.toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/10 relative overflow-hidden flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-medium text-indigo-200 uppercase tracking-widest mb-1">Pengeluaran Hari Ini</p>
                                    <p className="text-2xl font-semibold">Rp {isBalanceHidden ? '***.***' : todayExpense.toLocaleString('id-ID')}</p>
                                </div>
                                {isLimitEnabled && (
                                    <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                                        {/* Background Circle */}
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                            <path
                                                className="text-white/20"
                                                strokeWidth="3"
                                                stroke="currentColor"
                                                fill="none"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                            {/* Progress Circle */}
                                            <path
                                                className={`${limitPercentage >= 100 ? 'text-red-400' : limitPercentage >= 75 ? 'text-yellow-400' : 'text-seamist-300'} transition-all duration-1000 ease-out`}
                                                strokeWidth="3"
                                                strokeDasharray={`${limitPercentage}, 100`}
                                                strokeLinecap="round"
                                                stroke="currentColor"
                                                fill="none"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                        </svg>
                                        <div className="absolute flex flex-col items-center justify-center">
                                            <span className="text-[10px] font-bold">{limitPercentage}%</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/10 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-medium text-green-200 uppercase tracking-widest mb-1">Pemasukan Bln Ini</p>
                                    <p className="text-2xl font-semibold text-green-300">Rp {transactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0).toLocaleString('id-ID')}</p>
                                </div>
                                <div className="w-14 h-14 flex items-center justify-center shrink-0 bg-green-400/20 rounded-full text-green-300">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="bg-white/10 p-5 rounded-3xl backdrop-blur-md border border-white/10 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-medium text-blue-200 uppercase tracking-widest mb-1">Rasio Tabungan</p>
                                    <p className="text-2xl font-semibold text-blue-300">{savingsRate}% <span className="text-xs font-normal text-blue-200/60 ml-1">dari income</span></p>
                                </div>
                                <div className="w-14 h-14 flex items-center justify-center shrink-0 bg-blue-400/20 rounded-full text-blue-300">
                                    <PieChart className="w-6 h-6" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hutang & Piutang Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-3">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-xl flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-600" />
                                Hutang & Piutang
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {debts.length === 0 ? (
                                <div className="col-span-full bg-white dark:bg-slate-800 p-8 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-slate-700 text-center">
                                    <p className="text-gray-400 font-medium">Bagus! Kamu tidak punya catatan hutang aktif.</p>
                                </div>
                            ) : (
                                debts.map(debt => (
                                    <div key={debt.id} className="bg-white dark:bg-slate-800 p-5 rounded-[2rem] border border-seamist-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${debt.type === 'debt' ? 'bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400'}`}>
                                                {debt.type === 'debt' ? 'Hutang Saya' : 'Piutang'}
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium uppercase">
                                                <Calendar className="w-3 h-3" />
                                                {debt.due_date ? new Date(debt.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Kapan Saja'}
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <p className="text-lg font-bold text-gray-800 dark:text-gray-100">{debt.contact_name}</p>
                                            <p className="text-xl font-extrabold text-indigo-700 dark:text-indigo-400 tracking-tight">Rp {debt.amount.toLocaleString('id-ID')}</p>
                                            {debt.notes && <p className="text-xs text-gray-400 italic mt-1">"{debt.notes}"</p>}
                                        </div>
                                        <div className="flex items-center gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => markAsPaid(debt.id)}
                                                className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition"
                                            >
                                                <CheckCircle2 className="w-4 h-4" /> Lunaskan
                                            </button>
                                            <button 
                                                onClick={() => deleteDebt(debt.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Grafik Bar */}
                    <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-seamist-200 dark:border-slate-700 lg:col-span-2 transition-all duration-300 hover:shadow-md">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg mb-6">Arus Kas Bulanan</h3>
                        <div className="relative h-64 md:h-80">
                            <Bar options={barOptions} data={barData} />
                        </div>
                    </div>

                    {/* Grafik Doughnut */}
                    <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-seamist-200 dark:border-slate-700 transition-all duration-300 hover:shadow-md relative group">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">Alokasi Jajan</h3>
                            {filterCategory && (
                                <button 
                                    onClick={() => setFilterCategory(null)}
                                    className="text-[10px] font-bold uppercase text-indigo-600 bg-indigo-50 dark:bg-slate-700 px-2 py-1 rounded-md hover:bg-indigo-100 dark:hover:bg-slate-600 transition"
                                >
                                    Tampilkan Semua
                                </button>
                            )}
                        </div>
                        <div className="relative h-64 md:h-80 flex justify-center">
                            <Doughnut data={doughnutData} options={doughnutOptions} />
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-12">
                                <span className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tighter">
                                    {filterCategory ? (categoryExpenses[filterCategory] || 0).toLocaleString('id-ID') : '100%'}
                                </span>
                                <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-widest">
                                    {filterCategory ? filterCategory : 'Alokasi'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transaksi Terakhir */}
                <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-seamist-200 dark:border-slate-700 transition-all duration-300 hover:shadow-md mt-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 text-2xl">Riwayat Transaksi</h3>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <a 
                                href={route('transactions.export')}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 text-sm text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30 px-4 py-2 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition shadow-sm"
                            >
                                <FileDown className="w-4 h-4" />
                                Ekspor CSV
                            </a>
                            <Link 
                                href="/chat"
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 text-sm text-white font-bold bg-indigo-700 px-4 py-2 rounded-xl hover:bg-indigo-800 transition shadow-sm"
                            >
                                Lihat Semua
                                <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                    
                    {transactions.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50 dark:bg-slate-700/50 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-slate-600">
                            <ReceiptText className="w-12 h-12 text-gray-300 dark:text-gray-500 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-300 font-bold text-lg">Belum ada transaksi.</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 mb-6">Ayo mulai kelola keuanganmu sekarang!</p>
                            <Link 
                                href="/chat"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-700 text-white font-bold rounded-2xl hover:bg-indigo-800 transition-all shadow-lg hover:-translate-y-1"
                            >
                                Mulai Mencatat Transaksi
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {Object.entries(groupedTransactions).map(([date, items]) => (
                                <div key={date} className="space-y-6">
                                    <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] flex items-center gap-4">
                                        <span>{date}</span>
                                        <div className="h-px bg-gray-100 dark:bg-slate-700 flex-1"></div>
                                    </h4>
                                    <div className="space-y-4">
                                        {items.map((trx) => (
                                            <div key={trx.id} className="group flex items-center justify-between p-5 rounded-[1.5rem] bg-white dark:bg-slate-800 hover:bg-seamist-50 dark:hover:bg-slate-700 transition-all border border-gray-100 dark:border-slate-700 hover:border-seamist-300 dark:hover:border-slate-600">
                                                <div className="flex items-center gap-5">
                                                    <div className={`p-4 rounded-2xl ${trx.type === 'expense' ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400' : trx.type === 'income' ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400' : 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'}`}>
                                                        {trx.type === 'expense' ? <ArrowDownRight className="w-6 h-6" /> : trx.type === 'income' ? <ArrowUpRight className="w-6 h-6" /> : <Wallet className="w-6 h-6" />}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <p className="font-semibold text-gray-800 dark:text-gray-100 text-lg leading-none tracking-tight">{trx.title}</p>
                                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${trx.type === 'expense' ? 'bg-red-100 text-red-700' : trx.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                                {trx.type}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-widest flex items-center gap-2">
                                                            <span>{new Date(trx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                            {trx.notes && (
                                                                <>
                                                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                                    <span className="normal-case italic text-indigo-500 font-semibold truncate max-w-[120px]">"{trx.notes}"</span>
                                                                </>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className={`font-semibold text-xl tracking-tight ${trx.type === 'expense' || trx.type === 'savings' ? 'text-gray-800' : 'text-green-600'}`}>
                                                        {trx.type === 'expense' || trx.type === 'savings' ? '-' : '+'} Rp {trx.amount.toLocaleString('id-ID')}
                                                    </div>
                                                    <button 
                                                        onClick={() => setConfirmData({ isOpen: true, id: trx.id })}
                                                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal 
                isOpen={confirmData.isOpen}
                onClose={() => setConfirmData({ isOpen: false, id: null })}
                onConfirm={() => deleteTransaction(confirmData.id)}
                title="Hapus Transaksi?"
                message="Data transaksi ini akan dihapus permanen dan saldo akan dikoreksi otomatis."
            />
        </AppLayout>
    );
}
