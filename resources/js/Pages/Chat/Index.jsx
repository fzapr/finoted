import AppLayout from '@/Layouts/AppLayout';
import { Head, usePage } from '@inertiajs/react';
import { Send, ArrowUpCircle, ArrowDownCircle, X, Target, Coffee, Car, ShoppingBag, Banknote, Landmark, TrendingUp, ReceiptText, Sparkles, Mic, MicOff } from 'lucide-react';
import { useFinChat } from '@/Hooks/useFinChat';
import { useAppStore } from '@/Store/useAppStore';
import { useEffect, useMemo, useState } from 'react';

export default function ChatIndex() {
    const { props } = usePage();

    // Sync server data into Zustand store on mount
    const syncFromServer = useAppStore(state => state.syncFromServer);
    const transactions = useAppStore(state => state.transactions);
    
    useEffect(() => {
        syncFromServer(props);
    }, []);

    const suggestionChips = useMemo(() => {
        // Find most frequent expense patterns
        const expensePatterns = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                const key = `${t.title}|${t.amount}`;
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {});

        let sorted = Object.entries(expensePatterns)
            .sort((a, b) => b[1] - a[1])
            .map(([key]) => {
                const [title, amountStr] = key.split('|');
                const amount = parseInt(amountStr);
                let amountText = '';
                if (amount >= 1000000) amountText = `${amount / 1000000}jt`;
                else if (amount >= 1000) amountText = `${amount / 1000}rb`;
                else amountText = amount.toString();
                return `${title} ${amountText}`;
            })
            .slice(0, 3);

        // Fallbacks
        if (sorted.length === 0) sorted = ['Makan 50rb', 'Bensin 20rb', 'Kopi 25rb'];
        while (sorted.length < 3) {
            if (!sorted.includes('Makan 50rb')) sorted.push('Makan 50rb');
            else if (!sorted.includes('Bensin 20rb')) sorted.push('Bensin 20rb');
            else if (!sorted.includes('Gaji 5jt')) sorted.push('Gaji 5jt');
            else sorted.push('Belanja 100rb');
        }
        return sorted;
    }, [transactions]);

    const {
        messages,
        inputValue,
        setInputValue,
        parsedValue,
        activeMode,
        activeCategory,
        pendingTransaction,
        isTyping,
        categories,
        messagesEndRef,
        handleModeSelect,
        handleCategorySelect,
        handleSubmit,
        confirmTransaction,
        cancelTransaction
    } = useFinChat(props);

    // Voice Input State
    const [isListening, setIsListening] = useState(false);

    const toggleListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Browser kamu tidak mendukung voice input.');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'id-ID';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInputValue(transcript);
        };

        if (isListening) {
            recognition.stop();
        } else {
            recognition.start();
        }
    };

    // Helper to format bold text in bot messages
    const renderMessageText = (text) => {
        return text.split('**').map((part, i) => 
            i % 2 === 1 ? <strong key={i} className="font-bold">{part}</strong> : part
        );
    };

    return (
        <AppLayout
            header={<div className="w-full flex items-center justify-between"><h2 className="text-xl font-bold leading-tight text-indigo-800 dark:text-seamist-300">Asisten Keuangan</h2></div>}
            noScroll={true}
        >
            <Head title="Chat" />

            <div className="flex flex-col lg:flex-row flex-1 bg-seamist-50 dark:bg-slate-900 w-full relative overflow-hidden">
                {/* Chat Interface (Full Width) */}
                <div className="flex flex-col flex-1 relative min-h-0">
                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:px-12 space-y-6 scroll-smooth bg-gray-50/50 dark:bg-slate-900/50">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                <div className={`flex gap-3 max-w-[90%] md:max-w-[75%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Bot Avatar */}
                                    {msg.sender === 'bot' && (
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shrink-0 shadow-sm mt-1">
                                            <Sparkles className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                    
                                    {/* Message Bubble */}
                                    <div className="flex flex-col">
                                        <div className={`px-5 py-3.5 ${
                                            msg.sender === 'user' 
                                                ? 'bg-gradient-to-tr from-indigo-700 to-indigo-600 text-white rounded-2xl rounded-tr-sm shadow-[0_4px_14px_0_rgba(52,61,138,0.39)]' 
                                                : 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-gray-800 dark:text-gray-100 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 dark:border-slate-700 whitespace-pre-wrap leading-relaxed'
                                        }`}>
                                            {renderMessageText(msg.text)}
                                        </div>
                                        <span className={`text-[10px] text-gray-400 mt-1.5 font-medium ${msg.sender === 'user' ? 'text-right mr-1' : 'ml-1'}`}>{msg.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="flex w-full justify-start animate-in fade-in duration-300">
                                <div className="flex gap-3 max-w-[90%] md:max-w-[75%]">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shrink-0 shadow-sm mt-1">
                                        <Sparkles className="w-4 h-4 text-white animate-pulse" />
                                    </div>
                                    <div className="bg-white/90 backdrop-blur-md border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div ref={messagesEndRef} className="h-4 shrink-0" />
                    </div>

                    {/* Input Area */}
                    <div className="bg-white dark:bg-slate-800 border-t border-seamist-200 dark:border-slate-700 p-4 md:p-6 shrink-0 z-10 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)]">
                        {!activeMode && !pendingTransaction && (
                            <div className="flex gap-2 md:gap-4 max-w-2xl mx-auto mb-4 animate-in slide-in-from-bottom-4 duration-300">
                                <button 
                                    onClick={() => handleModeSelect('expense')}
                                    className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 border border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400 rounded-2xl font-semibold transition-all duration-200 hover:shadow-sm"
                                >
                                    <ArrowDownCircle className="w-5 h-5" /> <span>Keluar</span>
                                </button>
                                <button 
                                    onClick={() => handleModeSelect('income')}
                                    className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/50 border border-green-100 dark:border-green-900/30 text-green-700 dark:text-green-400 rounded-2xl font-semibold transition-all duration-200 hover:shadow-sm"
                                >
                                    <ArrowUpCircle className="w-5 h-5" /> <span>Masuk</span>
                                </button>
                                <button 
                                    onClick={() => handleModeSelect('savings')}
                                    className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 border border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400 rounded-2xl font-semibold transition-all duration-200 hover:shadow-sm"
                                >
                                    <Target className="w-5 h-5" /> <span>Nabung</span>
                                </button>
                            </div>
                        )}

                        {activeMode && !activeCategory && (
                            <div className="max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-300 mb-4">
                                <div className="flex items-center justify-between mb-3 px-2">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pilih Kategori</span>
                                    <button onClick={cancelTransaction} className="text-xs font-semibold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-full transition-colors">
                                        BATAL
                                    </button>
                                </div>
                                <div className="grid grid-cols-4 gap-3">
                                    {categories.map(cat => (
                                        <button 
                                            key={cat.id}
                                            onClick={() => handleCategorySelect(cat)}
                                            className="group flex flex-col items-center gap-1.5"
                                        >
                                            <div className={`w-full aspect-square flex items-center justify-center rounded-2xl border bg-white ${cat.color} group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300`}>
                                                <cat.icon className="w-6 h-6 md:w-8 md:h-8" />
                                            </div>
                                            <span className="text-[10px] md:text-xs text-gray-500 font-semibold uppercase tracking-tight">{cat.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {pendingTransaction && (
                            <div className="animate-in slide-in-from-bottom-4 duration-300 max-w-2xl mx-auto mb-4">
                                <div className="bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/30 p-4 rounded-2xl mb-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold text-indigo-400 dark:text-indigo-500 uppercase tracking-widest mb-0.5">Siap mencatat:</p>
                                        <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100">
                                            {pendingTransaction.categoryLabel} <span className="text-indigo-400 dark:text-indigo-500">Rp {pendingTransaction.nominal.toLocaleString('id-ID')}</span>
                                        </p>
                                        {pendingTransaction.notes && (
                                            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium italic mt-0.5">"{pendingTransaction.notes}"</p>
                                        )}
                                    </div>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${pendingTransaction.mode === 'expense' ? 'bg-red-100 text-red-600' : pendingTransaction.mode === 'income' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {pendingTransaction.mode === 'expense' ? <ArrowDownCircle className="w-5 h-5" /> : pendingTransaction.mode === 'income' ? <ArrowUpCircle className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => confirmTransaction(true)}
                                        className="flex-1 py-4 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-2xl shadow-lg transition-all"
                                    >
                                        Ya, Catat!
                                    </button>
                                    <button 
                                        onClick={() => confirmTransaction(false)}
                                        className="flex-1 py-4 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-500 dark:text-gray-400 font-bold rounded-2xl border border-gray-200 dark:border-slate-600 transition-all"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </div>
                        )}

                        {((activeMode && activeCategory) || (!activeMode && !pendingTransaction)) && (
                            <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-2 duration-300">
                                {/* Suggestion Chips */}
                                {!activeCategory && !pendingTransaction && (
                                    <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-3 pb-1">
                                        {suggestionChips.map((chip, index) => (
                                            <button 
                                                key={index}
                                                onClick={() => setInputValue(chip)}
                                                className="whitespace-nowrap px-4 py-1.5 bg-white dark:bg-slate-700 border border-seamist-200 dark:border-slate-600 text-seamist-700 dark:text-seamist-300 text-xs font-semibold rounded-full hover:bg-seamist-50 dark:hover:bg-slate-600 hover:border-seamist-300 transition-colors shadow-sm"
                                            >
                                                {chip}
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <form onSubmit={handleSubmit} className="flex items-center gap-3">
                                {activeCategory && (
                                    <button 
                                        type="button"
                                        onClick={cancelTransaction}
                                        className="p-3 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-colors shrink-0"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                )}
                                <div className="relative flex-1 group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                                        <span className="font-bold text-indigo-800/40 group-focus-within:text-indigo-800 transition-colors">Rp</span>
                                    </div>
                                    <input 
                                        type="text" 
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder={activeCategory ? "Nominal..." : "Ketik 'Makan padang 50rb'..."}
                                        className="w-full pl-14 pr-12 py-4 bg-white dark:bg-slate-700 border-2 border-indigo-100/50 dark:border-slate-600 rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-950/50 focus:border-indigo-600 text-lg font-bold text-gray-800 dark:text-gray-100 transition-all shadow-sm group-hover:border-indigo-200 dark:group-hover:border-slate-500 placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                        autoFocus
                                        disabled={isTyping}
                                    />
                                    <button 
                                        type="button"
                                        onClick={toggleListening}
                                        className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                                    >
                                        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                    </button>
                                </div>
                                <button 
                                    type="submit"
                                    disabled={!inputValue.trim() || isTyping}
                                    className="p-4 bg-indigo-200 hover:bg-indigo-300 text-white rounded-[1.25rem] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    <Send className="w-7 h-7" />
                                </button>
                                </form>
                            </div>
                        )}
                        {parsedValue > 0 && !pendingTransaction && (
                            <div className="max-w-3xl mx-auto mt-2 pl-14 animate-in fade-in slide-in-from-top-1">
                                <p className={`text-sm font-bold px-3 py-1 rounded-lg inline-block ${activeMode === 'expense' ? 'text-red-600 bg-red-50' : activeMode === 'income' ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50'}`}>
                                    = Rp {parsedValue.toLocaleString('id-ID')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
