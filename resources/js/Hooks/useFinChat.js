import { useState, useRef, useEffect, useCallback } from 'react';
import { Coffee, Car, ShoppingBag, PlusCircle, TrendingUp, Home, Plane } from 'lucide-react';
import { useAppStore } from '../Store/useAppStore';

const iconComponentMap = {
    Coffee,
    Car,
    ShoppingBag,
    PlusCircle,
    TrendingUp,
    Home,
    Plane,
};

export function useFinChat(serverProps = {}) {
    const [messages, setMessages] = useState([
        { 
            id: 1, 
            text: "Halo! Saya asisten Finoted. Kamu bisa catat apa saja:\n\n" +
                  "**Pribadi**: 'Makan siang 50rb'\n" +
                  "**Kuliah**: 'Bayar UKT 5jt' atau 'Buku kuliah 100rb'\n" +
                  "**Hutang**: 'Utang ke Budi 20rb'\n" +
                  "**Voice**: Klik ikon mic untuk bicara langsung!", 
            sender: 'bot', 
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [activeMode, setActiveMode] = useState(null); // 'expense', 'income', or 'savings'
    const [activeCategory, setActiveCategory] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    
    // For confirmation step
    const [pendingTransaction, setPendingTransaction] = useState(null);
    
    // Global State
    const { balance, goals, dailyLimit, isLimitEnabled, todayExpense, addExpense, addIncome, addSavings, addDebt } = useAppStore();

    const messagesEndRef = useRef(null);

    // Map server categories to include React icon components
    const serverExpenseCategories = (serverProps.expenseCategories || []).map(cat => ({
        ...cat,
        icon: iconComponentMap[cat.icon] || PlusCircle,
    }));

    const serverIncomeCategories = (serverProps.incomeCategories || []).map(cat => ({
        ...cat,
        icon: iconComponentMap[cat.icon] || PlusCircle,
    }));

    // Fallback if server doesn't provide categories
    const expenseCategories = serverExpenseCategories.length > 0 ? serverExpenseCategories : [
        { id: 'makan', label: 'Makan', icon: Coffee, color: 'bg-orange-100 text-orange-600 border-orange-200' },
        { id: 'transport', label: 'Transport', icon: Car, color: 'bg-blue-100 text-blue-600 border-blue-200' },
        { id: 'belanja', label: 'Belanja', icon: ShoppingBag, color: 'bg-purple-100 text-purple-600 border-purple-200' },
        { id: 'lainnya', label: 'Lainnya', icon: PlusCircle, color: 'bg-gray-100 text-gray-600 border-gray-200' },
    ];

    const incomeCategories = serverIncomeCategories.length > 0 ? serverIncomeCategories : [
        { id: 'gaji', label: 'Gaji', icon: TrendingUp, color: 'bg-green-100 text-green-600 border-green-200' },
        { id: 'bonus', label: 'Bonus', icon: PlusCircle, color: 'bg-teal-100 text-teal-600 border-teal-200' },
        { id: 'lainnya', label: 'Lainnya', icon: PlusCircle, color: 'bg-gray-100 text-gray-600 border-gray-200' },
    ];

    const savingsCategories = goals.map(g => ({
        id: g.id,
        label: g.title,
        icon: iconComponentMap[g.icon] || TrendingUp,
        color: `${g.bg} ${g.color} border-transparent`,
        isGoal: true
    }));

    const categories = activeMode === 'expense' ? expenseCategories : (activeMode === 'income' ? incomeCategories : savingsCategories);

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, activeMode, activeCategory, pendingTransaction, scrollToBottom]);

    const addMessage = (text, sender) => {
        setMessages(prev => [...prev, { 
            id: Date.now(), 
            text, 
            sender, 
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
        }]);
    };

    const handleModeSelect = (mode) => {
        setActiveMode(mode);
        let modeText = '';
        if (mode === 'expense') modeText = 'Pengeluaran';
        else if (mode === 'income') modeText = 'Pemasukan';
        else modeText = 'Menabung';
        
        addMessage(`Catat ${modeText}`, 'user');
        
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            if (mode === 'savings') {
                if (goals.length === 0) {
                    addMessage("Belum ada target tabungan nih. Bikin dulu yuk di halaman Goals!", 'bot');
                    setActiveMode(null);
                } else {
                    addMessage("Wah hebat! Mau nabung untuk target yang mana nih?", 'bot');
                }
            } else {
                addMessage("Kategori apa nih?", 'bot');
            }
        }, 600);
    };

    const handleCategorySelect = (category) => {
        setActiveCategory(category);
        addMessage(`${category.label}`, 'user');
        
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            addMessage("Berapa nominalnya? Ketik di bawah ya.", 'bot');
        }, 600);
    };

    const parseIndonesianNominal = (input) => {
        if (!input) return null;
        let text = input.toLowerCase().trim();
        
        // 1. --- Improved Numeric Multiplier Parser (e.g., 3.5jt, 50k, 1,2juta) ---
        // This should take highest priority as it's a specific shorthand
        const multiplierMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(jt|juta|k|rb|ribu)\b/i);
        
        if (multiplierMatch) {
            const numPart = multiplierMatch[1].replace(',', '.');
            const unitPart = multiplierMatch[2].toLowerCase();
            let multiplier = 1;
            
            if (unitPart === 'jt' || unitPart === 'juta') multiplier = 1000000;
            else if (unitPart === 'k' || unitPart === 'rb' || unitPart === 'ribu') multiplier = 1000;
            
            const val = parseFloat(numPart);
            if (!isNaN(val)) return val * multiplier;
        }

        // 2. --- Text-to-Number Conversion (e.g., "sepuluh ribu") ---
        const wordToNum = {
            'satu': 1, 'dua': 2, 'tiga': 3, 'empat': 4, 'lima': 5,
            'enam': 6, 'tujuh': 7, 'delapan': 8, 'sembilan': 9,
            'sepuluh': 10, 'sebelas': 11, 'seratus': 100, 'seribu': 1000,
            'sejuta': 1000000,
        };
        const modifiers = { 'belas': 0, 'puluh': 0, 'ratus': 0, 'ribu': 0, 'juta': 0 };

        const allWords = [...Object.keys(wordToNum), ...Object.keys(modifiers), 'se'];
        const hasTextNumber = allWords.some(w => text.split(/[\s,]+/).includes(w));

        if (hasTextNumber) {
            text = text.replace(/(\w)(puluh|ratus|ribu|juta|belas)/g, '$1 $2');
            const words = text.split(/[\s,]+/).filter(Boolean);
            let total = 0;
            let current = 0;

            for (const word of words) {
                if (wordToNum[word] !== undefined) {
                    current = wordToNum[word];
                } else if (word === 'belas') {
                    current = current + 10;
                } else if (word === 'puluh') {
                    current = current * 10;
                } else if (word === 'ratus') {
                    current = current * 100;
                } else if (word === 'ribu') {
                    if (current === 0) current = 1;
                    total += current * 1000;
                    current = 0;
                } else if (word === 'juta') {
                    if (current === 0) current = 1;
                    total += current * 1000000;
                    current = 0;
                }
            }
            total += current;
            if (total > 0) return total;
        }

        // 3. --- Standard Numeric Parser (Clean decimals and thousand separators) ---
        let cleanText = text.replace(/[^0-9.,]/g, '');
        if (!cleanText) return null;

        // Determine if dot is thousand separator or decimal
        if (cleanText.includes('.') && cleanText.includes(',')) {
            // Standard European/Indonesian format: 1.234,56
            cleanText = cleanText.replace(/\./g, '').replace(',', '.');
        } else if (cleanText.includes('.')) {
            const parts = cleanText.split('.');
            // If dot is followed by exactly 3 digits, assume thousand separator
            if (parts[parts.length - 1].length === 3 && parts.length > 1) {
                cleanText = cleanText.replace(/\./g, '');
            }
        } else if (cleanText.includes(',')) {
            cleanText = cleanText.replace(',', '.');
        }
        
        const finalVal = parseFloat(cleanText);
        return isNaN(finalVal) ? null : finalVal;
    };

    const analyzeInput = (input) => {
        const nominal = parseIndonesianNominal(input);
        if (!nominal) return null;

        let textLower = input.toLowerCase();
        
        // Extract notes: (...) or #tag
        let notes = null;
        const noteMatch = input.match(/\(([^)]+)\)/) || input.match(/#(\w+)/);
        if (noteMatch) {
            notes = noteMatch[1];
        }

        // Wallet Type Detection
        let walletType = 'personal';
        if (textLower.includes('kuliah') || textLower.includes('kampus') || textLower.includes('tugas') || textLower.includes('ukt') || textLower.includes('buku')) {
            walletType = 'business'; // We keep the internal key as 'business' for now but label it 'College' in UI
        }

        const expenseKeywords = ['beli', 'makan', 'minum', 'jajan', 'bayar', 'gojek', 'grab', 'bensin', 'parkir', 'belanja', 'tagihan', 'keluar'];
        const incomeKeywords = ['gaji', 'bonus', 'dapat', 'terima', 'jual', 'masuk'];
        const savingKeywords = ['nabung', 'simpan', 'tabung'];
        const debtKeywords = ['utang', 'hutang', 'pinjam ke', 'pinjam dari'];
        const receivableKeywords = ['pinjamkan', 'kasih pinjam', 'piutang'];

        let mode = 'expense';
        let contactName = null;

        // Debt/Receivable logic (High priority)
        if (debtKeywords.some(kw => textLower.includes(kw))) {
            mode = 'debt';
            const nameMatch = textLower.match(/(?:utang|hutang|pinjam dari)\s+(?:ke\s+)?([a-z]+)/);
            contactName = nameMatch ? nameMatch[1] : 'Seseorang';
        } else if (receivableKeywords.some(kw => textLower.includes(kw)) || textLower.includes('pinjam')) {
            // Check if it's "Budi pinjam 50rb"
            const piutangMatch = textLower.match(/([a-z]+)\s+(?:pinjam|utang)/);
            if (piutangMatch && !['saya', 'aku'].includes(piutangMatch[1])) {
                mode = 'receivable';
                contactName = piutangMatch[1];
            } else if (receivableKeywords.some(kw => textLower.includes(kw))) {
                mode = 'receivable';
                const nameMatch = textLower.match(/(?:pinjamkan|piutang)\s+(?:ke\s+)?([a-z]+)/);
                contactName = nameMatch ? nameMatch[1] : 'Seseorang';
            }
        }

        if (mode === 'expense') {
            if (savingKeywords.some(kw => textLower.includes(kw))) mode = 'savings';
            else if (incomeKeywords.some(kw => textLower.includes(kw))) mode = 'income';
        }

        let categoryId = null;
        let categoryLabel = 'Lainnya';

        if (mode === 'expense') {
            const makanCat = expenseCategories.find(c => c.label === 'Makan');
            const transportCat = expenseCategories.find(c => c.label === 'Transport');
            const belanjaCat = expenseCategories.find(c => c.label === 'Belanja');
            const lainnyaCat = expenseCategories.find(c => c.label === 'Lainnya');

            if (textLower.includes('makan') || textLower.includes('minum') || textLower.includes('kopi') || textLower.includes('jajan') || textLower.includes('kfc') || textLower.includes('mcd') || textLower.includes('padang')) {
                categoryId = makanCat?.id || null;
                categoryLabel = 'Makan';
            } else if (textLower.includes('bensin') || textLower.includes('parkir') || textLower.includes('gojek') || textLower.includes('grab') || textLower.includes('transport') || textLower.includes('tol')) {
                categoryId = transportCat?.id || null;
                categoryLabel = 'Transport';
            } else if (textLower.includes('beli') || textLower.includes('belanja') || textLower.includes('baju') || textLower.includes('sepatu')) {
                categoryId = belanjaCat?.id || null;
                categoryLabel = 'Belanja';
            } else {
                categoryId = lainnyaCat?.id || null;
            }
        } else if (mode === 'income') {
            const gajiCat = incomeCategories.find(c => c.label === 'Gaji');
            const bonusCat = incomeCategories.find(c => c.label === 'Bonus');
            const lainnyaCat = incomeCategories.find(c => c.label === 'Lainnya');

            if (textLower.includes('gaji')) {
                categoryId = gajiCat?.id || null;
                categoryLabel = 'Gaji';
            } else if (textLower.includes('bonus')) {
                categoryId = bonusCat?.id || null;
                categoryLabel = 'Bonus';
            } else {
                categoryId = lainnyaCat?.id || null;
            }
        } else if (mode === 'savings') {
            const firstWordGoal = goals.find(g => textLower.includes(g.title.toLowerCase().split(' ')[0]));
            if (firstWordGoal) {
                categoryId = firstWordGoal.id;
                categoryLabel = firstWordGoal.title;
            } else if (goals.length > 0) {
                categoryId = goals[0].id;
                categoryLabel = goals[0].title;
            } else {
                return null; // Cannot save if no goals
            }
        } else if (mode === 'debt' || mode === 'receivable') {
            categoryLabel = mode === 'debt' ? `Utang ke ${contactName}` : `Piutang ke ${contactName}`;
        }

        return { nominal, mode, categoryId, categoryLabel, notes, walletType, contactName };
    };

    const confirmTransaction = (confirmed) => {
        if (!pendingTransaction) return;
        
        if (!confirmed) {
            addMessage("Batal", 'user');
            setPendingTransaction(null);
            return;
        }

        const { nominal, mode, categoryId, categoryLabel, notes, walletType, contactName } = pendingTransaction;
        const formattedNumber = `Rp ${nominal.toLocaleString('id-ID')}`;
        
        addMessage("Ya, catat!", 'user');
        setIsTyping(true);

        setTimeout(() => {
            setIsTyping(false);
            
            let newBalance = balance;
            
            if (mode === 'expense') {
                addExpense(nominal, categoryLabel, categoryId, notes, walletType);
                newBalance -= nominal;
                
                let botReply = '';
                if (walletType === 'business') botReply += "**[Pencatatan Kuliah]**\n";
                
                if (isLimitEnabled && todayExpense + nominal >= dailyLimit) {
                    botReply += `**Peringatan Limit Harian!**\nOops! Pengeluaranmu hari ini melewati limit harian (Rp ${dailyLimit.toLocaleString('id-ID')}). Harap berhemat!\n\nPengeluaran: ${formattedNumber}\nSisa saldo: Rp ${newBalance.toLocaleString('id-ID')}`;
                } else if (isLimitEnabled && nominal >= (dailyLimit * 2)) {
                    botReply += `**Reality Check!**\nPengeluaran Rp ${nominal.toLocaleString('id-ID')} dicatat. Ini setara dengan lebih dari 2x jatah jajan harianmu lho. Yakin besok mau puasa jajan?\n\nSisa saldo: Rp ${newBalance.toLocaleString('id-ID')}`;
                } else if (nominal >= 1000000) {
                    botReply += `Wow, pengeluaran besar (**${formattedNumber}**) dicatat. Jangan sampai lupa diri, ingat tujuan tabunganmu ya!\n\nSisa saldo: Rp ${newBalance.toLocaleString('id-ID')}`;
                } else {
                    botReply += `Sip!\nPengeluaran **${categoryLabel}** sebesar **${formattedNumber}** berhasil dicatat.\n\nSisa saldo: Rp ${newBalance.toLocaleString('id-ID')}`;
                }
                
                addMessage(botReply, 'bot');
            } else if (mode === 'income') {
                addIncome(nominal, categoryLabel, categoryId, notes, walletType);
                newBalance += nominal;
                let botReply = walletType === 'business' ? "**[Pencatatan Kuliah]**\n" : "";
                botReply += `Yay!\nPemasukan **${categoryLabel}** sebesar **${formattedNumber}** berhasil dicatat.\n\nSaldo saat ini: Rp ${newBalance.toLocaleString('id-ID')}`;
                addMessage(botReply, 'bot');
            } else if (mode === 'savings') {
                addSavings(nominal, categoryId, categoryLabel, notes);
                newBalance -= nominal;
                addMessage(`Keren!\nKamu berhasil menabung **${formattedNumber}** untuk **${categoryLabel}**.\n\nSemangat terus! Sisa saldo: Rp ${newBalance.toLocaleString('id-ID')}`, 'bot');
            } else if (mode === 'debt' || mode === 'receivable') {
                addDebt({
                    contact_name: contactName,
                    amount: nominal,
                    type: mode,
                    notes: notes
                });
                const reply = mode === 'debt' 
                    ? `Catatan tersimpan! Kamu punya utang ke **${contactName}** sebesar **${formattedNumber}**. Jangan lupa bayar ya!`
                    : `Oke! Kamu meminjamkan **${formattedNumber}** ke **${contactName}**. Sudah dicatat di daftar piutang.`;
                addMessage(reply, 'bot');
            }
            
            setPendingTransaction(null);
        }, 800);
    };

    const parsedValue = parseIndonesianNominal(inputValue);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const inputText = inputValue;
        setInputValue('');
        addMessage(inputText, 'user');
        
        setIsTyping(true);

        setTimeout(() => {
            setIsTyping(false);
            
            // IF ALREADY IN A STEP-BY-STEP MODE
            if (activeMode && activeCategory) {
                const amount = parseIndonesianNominal(inputText);
                if (!amount || amount <= 0) {
                    addMessage("Wah, sepertinya format angkanya kurang tepat. Coba masukkan angka (contoh: 50000 atau 50rb)", 'bot');
                    return;
                }

                setPendingTransaction({
                    nominal: amount,
                    mode: activeMode,
                    categoryId: activeCategory.id,
                    categoryLabel: activeCategory.label
                });
                
                const formattedNumber = `Rp ${amount.toLocaleString('id-ID')}`;
                addMessage(`Oke, aku akan catat **${activeMode === 'expense' ? 'Pengeluaran' : activeMode === 'income' ? 'Pemasukan' : 'Tabungan'}** untuk **${activeCategory.label}** sebesar **${formattedNumber}**.\n\nApakah ini benar?`, 'bot');
                
                setActiveMode(null);
                setActiveCategory(null);
            } 
            // ONE-SHOT NLP MODE
            else {
                const analysis = analyzeInput(inputText);
                
                if (analysis) {
                    // IMPLEMENTASI ONE-SHOT NLP (Langsung masuk)
                    const formattedNumber = `Rp ${analysis.nominal.toLocaleString('id-ID')}`;
                    const modeLabel = analysis.mode === 'expense' ? 'Pengeluaran' : analysis.mode === 'income' ? 'Pemasukan' : 'Nabung';
                    
                    // Kita bisa langsung mem-bypass konfirmasi jika Anda mau, tapi agar aman tetap lewat konfirmasi
                    setPendingTransaction(analysis);
                    addMessage(`Kamu ingin mencatat **${modeLabel}** (${analysis.categoryLabel}) sebesar **${formattedNumber}**.\n\nSilakan konfirmasi pencatatan ini.`, 'bot');
                } else {
                    addMessage("Saya kurang paham maksudnya. Anda bisa mengetik format seperti 'Beli kopi 25rb' atau gunakan tombol pilihan di atas.", 'bot');
                }
            }
        }, 1000);
    };

    const cancelTransaction = () => {
        setActiveMode(null);
        setActiveCategory(null);
        setPendingTransaction(null);
        setInputValue('');
    };

    return {
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
    };
}
