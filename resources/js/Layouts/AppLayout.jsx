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
            root.style.backgroundColor = '#000000';
        } else {
            root.classList.remove('dark');
            root.style.backgroundColor = '';
        }
        localStorage.setItem('finchat-dark', isDark);
    }, [isDark]);

    return (
        <div className="flex w-full h-screen h-[100dvh] bg-seamist dark:bg-black text-indigo-900 dark:text-[#e7e9ea] font-sans overflow-hidden flex-col md:flex-row transition-colors duration-300">
            <LimitWarningModal />
            
            {/* --- DESKTOP SIDEBAR --- */}
            <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-black border-r border-seamist-200 dark:border-[#2f3336] shrink-0 transition-colors duration-300">
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
                                    ? 'text-indigo-700 dark:text-[#e7e9ea] bg-indigo-50 dark:bg-[#1d9bf0]/10'
                                    : 'text-gray-500 dark:text-[#71767b] hover:text-indigo-600 dark:hover:text-[#e7e9ea] hover:bg-seamist-100 dark:hover:bg-[#16181c]'
                            }`}
                        >
                            <item.icon className="h-5 w-5" strokeWidth={item.active ? 2.5 : 2} />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-seamist-200 dark:border-[#2f3336] space-y-1">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={() => setIsDark(!isDark)}
                        className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-gray-500 dark:text-[#71767b] hover:bg-seamist-100 dark:hover:bg-[#16181c] transition-colors text-sm font-medium"
                    >
                        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        {isDark ? 'Mode Terang' : 'Mode Gelap'}
                    </button>
                    <Link
                        href={route('profile.edit')}
                        className="flex items-center gap-3 px-4 py-2 rounded-xl text-gray-500 dark:text-[#71767b] hover:bg-seamist-100 dark:hover:bg-[#16181c] hover:text-indigo-600 dark:hover:text-[#e7e9ea] transition-colors text-sm font-medium"
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
            <div className="flex-1 flex flex-col min-w-0 h-screen h-[100dvh] overflow-hidden relative">
                {/* Header */}
                {header && (
                    <header className="fixed top-0 left-0 right-0 md:sticky bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-sm shrink-0 border-b border-seamist-200 dark:border-[#2f3336] z-30 transition-colors duration-300">
                        <div className="px-3 py-3 md:px-6 md:py-4 lg:px-8 flex items-center justify-between">
                            {header}
                            {/* Mobile Dark Mode Toggle */}
                            <button
                                onClick={() => setIsDark(!isDark)}
                                className="md:hidden p-1.5 rounded-xl text-gray-500 dark:text-[#71767b] hover:bg-seamist-100 dark:hover:bg-[#16181c] transition-colors"
                            >
                                {isDark ? <Sun className="h-4 w-4 md:h-5 md:w-5" /> : <Moon className="h-4 w-4 md:h-5 md:w-5" />}
                            </button>
                        </div>
                    </header>
                )}

                {/* Main scrollable content */}
                <main className={`flex-1 w-full bg-seamist dark:bg-black flex flex-col relative transition-colors duration-300 ${noScroll ? 'overflow-hidden' : 'overflow-y-auto'} ${header ? 'pt-[60px] md:pt-0' : ''} md:pb-0 pb-[64px] overflow-x-hidden`}>
                    {children}
                </main>

                {/* --- MOBILE BOTTOM NAVIGATION --- */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-seamist-200 dark:border-[#2f3336] pb-safe z-30 transition-colors duration-300">
                        <div className="flex justify-around py-1.5 px-2">
                            {navItems.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`flex flex-col items-center p-1.5 rounded-lg transition-colors ${
                                        item.active
                                            ? 'text-indigo-700 dark:text-[#e7e9ea]'
                                            : 'text-gray-400 dark:text-[#71767b] hover:text-indigo-600 dark:hover:text-[#e7e9ea]'
                                    }`}
                                >
                                    <div className={`p-1 rounded-lg ${item.active ? 'bg-indigo-50 dark:bg-[#1d9bf0]/10' : ''}`}>
                                        <item.icon className="h-5 w-5" strokeWidth={item.active ? 2.5 : 2} />
                                    </div>
                                    <span className="text-[9px] mt-0.5 font-medium">{item.name}</span>
                                </Link>
                            ))}
                            {/* Profile item for mobile */}
                            <Link
                                href={route('profile.edit')}
                                className={`flex flex-col items-center p-1.5 rounded-lg transition-colors ${
                                    url.startsWith('/profile')
                                        ? 'text-indigo-700 dark:text-[#e7e9ea]'
                                        : 'text-gray-400 dark:text-[#71767b] hover:text-indigo-600 dark:hover:text-[#e7e9ea]'
                                }`}
                            >
                                <div className={`p-1 rounded-lg ${url.startsWith('/profile') ? 'bg-indigo-50 dark:bg-[#1d9bf0]/10' : ''}`}>
                                    <User className="h-5 w-5" strokeWidth={url.startsWith('/profile') ? 2.5 : 2} />
                                </div>
                                <span className="text-[9px] mt-0.5 font-medium">Profil</span>
                            </Link>
                        </div>
                </nav>
            </div>
            
        </div>
    );
}
