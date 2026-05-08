import { Link, usePage } from '@inertiajs/react';
import { MessageSquare, PieChart, Target, LogOut, User, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import LimitWarningModal from '@/Components/LimitWarningModal';

export default function AppLayout({ children, header, noScroll = false }) {
    const { url } = usePage();

    const navItems = [
        { name: 'Chat', icon: MessageSquare, href: route('chat.index'), active: url.startsWith('/chat') || url === '/' },
        { name: 'Beranda', icon: PieChart, href: route('dashboard'), active: url.startsWith('/dashboard') },
        { name: 'Tabungan', icon: Target, href: route('goals.index'), active: url.startsWith('/goals') },
    ];

    // Dark Mode State (persisted to localStorage)
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('finchat-dark') === 'true';
        }
        return false;
    });

    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('finchat-dark', isDark);
    }, [isDark]);

    return (
        <div className="flex h-screen bg-seamist dark:bg-slate-900 text-indigo-900 dark:text-gray-100 font-sans overflow-hidden flex-col md:flex-row transition-colors duration-300">
            <LimitWarningModal />
            
            {/* --- DESKTOP SIDEBAR --- */}
            <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-seamist-200 dark:border-slate-700 shrink-0 transition-colors duration-300">
                <div className="p-6">
                    <Link href="/">
                        <ApplicationLogo className="h-10 w-auto text-indigo-800 dark:text-seamist-300" />
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${
                                item.active
                                    ? 'text-indigo-700 dark:text-seamist-300 bg-indigo-50 dark:bg-slate-700'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-seamist-300 hover:bg-seamist-100 dark:hover:bg-slate-700'
                            }`}
                        >
                            <item.icon className="h-5 w-5" strokeWidth={item.active ? 2.5 : 2} />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-seamist-200 dark:border-slate-700 space-y-1">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={() => setIsDark(!isDark)}
                        className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-seamist-100 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
                    >
                        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        {isDark ? 'Mode Terang' : 'Mode Gelap'}
                    </button>
                    <Link
                        href={route('profile.edit')}
                        className="flex items-center gap-3 px-4 py-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-seamist-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-seamist-300 transition-colors text-sm font-medium"
                    >
                        <User className="h-4 w-4" /> Profil
                    </Link>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-sm font-medium"
                    >
                        <LogOut className="h-4 w-4" /> Keluar
                    </Link>
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* Header */}
                {header && (
                    <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-sm shrink-0 border-b border-seamist-200 dark:border-slate-700 z-10 sticky top-0 transition-colors duration-300">
                        <div className="px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
                            {header}
                            {/* Mobile Dark Mode Toggle */}
                            <button
                                onClick={() => setIsDark(!isDark)}
                                className="md:hidden p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-seamist-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>
                        </div>
                    </header>
                )}

                {/* Main scrollable content */}
                <main className={`flex-1 bg-seamist dark:bg-slate-900 flex flex-col relative transition-colors duration-300 ${noScroll ? 'overflow-hidden' : 'overflow-y-auto'}`}>
                    {children}
                </main>

                {/* --- MOBILE BOTTOM NAVIGATION --- */}
                <nav className="md:hidden shrink-0 bg-white dark:bg-slate-800 border-t border-seamist-200 dark:border-slate-700 pb-safe z-20 relative transition-colors duration-300">
                    <div className="flex justify-around py-2 px-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                                    item.active
                                        ? 'text-indigo-700 dark:text-seamist-300'
                                        : 'text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-seamist-300'
                                }`}
                            >
                                <div className={`p-1 rounded-xl ${item.active ? 'bg-indigo-50 dark:bg-slate-700' : ''}`}>
                                    <item.icon className="h-6 w-6" strokeWidth={item.active ? 2.5 : 2} />
                                </div>
                                <span className="text-[10px] mt-1 font-medium">{item.name}</span>
                            </Link>
                        ))}
                    </div>
                </nav>
            </div>
            
        </div>
    );
}
