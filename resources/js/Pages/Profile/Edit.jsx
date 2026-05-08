import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { useAppStore } from '@/Store/useAppStore';
import { useState } from 'react';
import { Wallet, CheckCircle } from 'lucide-react';

export default function Edit({ mustVerifyEmail, status }) {
    const { dailyLimit, setDailyLimit, isLimitEnabled, setIsLimitEnabled } = useAppStore();
    const [localLimit, setLocalLimit] = useState(dailyLimit);
    const [saved, setSaved] = useState(false);

    const handleLimitSubmit = (e) => {
        e.preventDefault();
        setDailyLimit(Number(localLimit));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <AppLayout
            header={
                <h2 className="text-xl font-bold leading-tight text-indigo-800 dark:text-seamist-300">
                    Pengaturan Profil
                </h2>
            }
        >
            <Head title="Profil" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    
                    {/* FINCHAT SPECIFIC SETTINGS */}
                    <div className="bg-white dark:bg-slate-800 p-6 shadow-sm sm:rounded-3xl border border-seamist-200 dark:border-slate-700">
                        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                    <Wallet className="w-5 h-5 text-indigo-600 dark:text-seamist-300" /> Pengaturan Finoted
                                </h2>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    Atur batas maksimal pengeluaran harianmu. Finoted akan memperingatkanmu jika pengeluaran hari ini melebihi batas yang ditentukan.
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{isLimitEnabled ? 'Aktif' : 'Nonaktif'}</span>
                                <button 
                                    onClick={() => setIsLimitEnabled(!isLimitEnabled)}
                                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${isLimitEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-slate-600'}`}
                                >
                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isLimitEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                        </header>

                        {isLimitEnabled && (
                            <form onSubmit={handleLimitSubmit} className="mt-6 flex items-center gap-4 max-w-xl animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="relative flex-1">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rp</span>
                                    <input
                                        type="number"
                                        value={localLimit}
                                        onChange={(e) => setLocalLimit(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 rounded-xl focus:border-indigo-500 focus:ring-indigo-500 font-bold dark:text-gray-100 dark:placeholder:text-gray-500"
                                        placeholder="Contoh: 100000"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-indigo-700 text-seamist-50 font-bold rounded-xl hover:bg-indigo-800 transition-colors"
                                >
                                    Simpan
                                </button>
                                {saved && (
                                    <span className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1 animate-in fade-in">
                                        <CheckCircle className="w-4 h-4" /> Tersimpan
                                    </span>
                                )}
                            </form>
                        )}
                    </div>

                    {/* DEFAULT BREEZE SETTINGS */}
                    <div className="bg-white dark:bg-slate-800 p-6 shadow-sm sm:rounded-3xl border border-seamist-200 dark:border-slate-700">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 shadow-sm sm:rounded-3xl border border-seamist-200 dark:border-slate-700">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 shadow-sm sm:rounded-3xl border border-seamist-200 dark:border-slate-700 border-red-100 dark:border-red-900/30">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
