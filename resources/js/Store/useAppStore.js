import { create } from 'zustand';
import { router } from '@inertiajs/react';

export const useAppStore = create((set, get) => ({
    // State — initialized from server props via `syncFromServer()`
    balance: 0,
    dailyLimit: 100000,
    isLimitEnabled: localStorage.getItem('finchat_limit_enabled') !== 'false', // Default to true if not set
    todayExpense: 0,
    hasTriggeredLimit: false,
    transactions: [],
    goals: [],
    debts: [],
    walletFilter: 'personal', // 'personal' or 'business'

    /**
     * Sync store state from Inertia server props.
     * Called once on page load in each page component.
     */
    syncFromServer: (props) => set((state) => {
        const updates = {};
        if (props.balance !== undefined) updates.balance = props.balance;
        if (props.todayExpense !== undefined) updates.todayExpense = props.todayExpense;
        if (props.transactions !== undefined) updates.transactions = props.transactions;
        if (props.goals !== undefined) updates.goals = props.goals;
        if (props.dailyLimit !== undefined) updates.dailyLimit = props.dailyLimit;
        
        // Priority for persistence: localStorage, then server props
        const localEnabled = localStorage.getItem('finchat_limit_enabled');
        if (localEnabled !== null) {
            updates.isLimitEnabled = localEnabled === 'true';
        } else if (props.isLimitEnabled !== undefined) {
            updates.isLimitEnabled = props.isLimitEnabled;
        }

        if (props.debts !== undefined) updates.debts = props.debts;
        return updates;
    }),

    // --- TRANSACTION ACTIONS (Optimistic + Server) ---

    addExpense: (amount, categoryLabel = 'Pengeluaran', categoryId = null, notes = null, walletType = 'personal') => {
        // Optimistic update
        set((state) => ({
            balance: state.balance - amount,
            todayExpense: state.todayExpense + amount,
            transactions: [
                { id: Date.now(), title: categoryLabel, amount: amount, type: 'expense', date: new Date().toISOString(), notes: notes, wallet_type: walletType },
                ...state.transactions
            ]
        }));

        // Server sync
        router.post('/transactions', {
            title: categoryLabel,
            amount: amount,
            type: 'expense',
            category_id: categoryId,
            notes: notes,
            wallet_type: walletType,
        }, { preserveScroll: true, preserveState: true });
    },
    
    addIncome: (amount, categoryLabel = 'Pemasukan', categoryId = null, notes = null, walletType = 'personal') => {
        set((state) => ({
            balance: state.balance + amount,
            transactions: [
                { id: Date.now(), title: categoryLabel, amount: amount, type: 'income', date: new Date().toISOString(), notes: notes, wallet_type: walletType },
                ...state.transactions
            ]
        }));

        router.post('/transactions', {
            title: categoryLabel,
            amount: amount,
            type: 'income',
            category_id: categoryId,
            notes: notes,
            wallet_type: walletType,
        }, { preserveScroll: true, preserveState: true });
    },

    addSavings: (amount, goalId, goalTitle = 'Tabungan', notes = null) => {
        set((state) => ({
            balance: state.balance - amount,
            goals: state.goals.map(goal => 
                goal.id === goalId 
                    ? { ...goal, current: goal.current + amount } 
                    : goal
            ),
            transactions: [
                { id: Date.now(), title: `Nabung: ${goalTitle}`, amount: amount, type: 'savings', date: new Date().toISOString(), notes: notes },
                ...state.transactions
            ]
        }));

        router.post('/transactions', {
            title: `Nabung: ${goalTitle}`,
            amount: amount,
            type: 'savings',
            goal_id: goalId,
            notes: notes,
        }, { preserveScroll: true, preserveState: true });
    },

    // --- GOAL ACTIONS ---

    addGoal: (newGoal) => {
        // Optimistic
        set((state) => ({
            goals: [...state.goals, newGoal]
        }));

        router.post('/goals', {
            title: newGoal.title,
            target_amount: newGoal.target,
            icon: newGoal.icon,
            color: newGoal.color,
            bg: newGoal.bg,
        }, { preserveScroll: true, preserveState: true });
    },

    deleteGoal: (goalId) => {
        set((state) => ({
            goals: state.goals.filter(goal => goal.id !== goalId)
        }));

        router.delete(`/goals/${goalId}`, {
            preserveScroll: true,
            preserveState: true,
        });
    },

    completeGoal: (goalId) => {
        const goal = get().goals.find(g => g.id === goalId);
        if (!goal) return;

        // Optimistic: add income + remove goal
        set((state) => ({
            balance: state.balance + goal.current,
            goals: state.goals.filter(g => g.id !== goalId),
            transactions: [
                { id: Date.now(), title: `Pencairan: ${goal.title}`, amount: goal.current, type: 'income', date: new Date().toISOString() },
                ...state.transactions
            ]
        }));

        router.post(`/goals/${goalId}/complete`, {}, {
            preserveScroll: true,
            preserveState: true,
        });
    },

    // --- TRANSACTION DELETE ---

    deleteTransaction: (id) => {
        set((state) => {
            const trx = state.transactions.find(t => t.id === id);
            if (!trx) return state;

            let newState = {
                transactions: state.transactions.filter(t => t.id !== id),
                balance: trx.type === 'income' ? state.balance - trx.amount : state.balance + trx.amount
            };

            if (trx.type === 'expense') {
                newState.todayExpense = state.todayExpense - trx.amount;
            }

            return newState;
        });

        router.delete(`/transactions/${id}`, {
            preserveScroll: true,
            preserveState: true,
        });
    },

    // --- BUDGET ACTIONS ---

    setDailyLimit: (amount) => {
        set({ dailyLimit: amount });
        router.patch('/budget', { daily_limit: amount }, { preserveScroll: true, preserveState: true });
    },

    setIsLimitEnabled: (val) => {
        set({ isLimitEnabled: val });
        localStorage.setItem('finchat_limit_enabled', val ? 'true' : 'false');
        router.patch('/budget', { is_enabled: val }, { preserveScroll: true, preserveState: true });
    },

    setHasTriggeredLimit: (val) => set({ hasTriggeredLimit: val }),
    
    // --- DEBT ACTIONS ---

    addDebt: (debtData) => {
        set((state) => ({
            debts: [{ ...debtData, id: Date.now(), status: 'active' }, ...state.debts]
        }));

        router.post('/debts', debtData, { preserveScroll: true, preserveState: true });
    },

    markAsPaid: (debtId) => {
        set((state) => ({
            debts: state.debts.map(d => d.id === debtId ? { ...d, status: 'paid' } : d)
        }));

        router.patch(`/debts/${debtId}`, { status: 'paid' }, { preserveScroll: true, preserveState: true });
    },

    deleteDebt: (debtId) => {
        set((state) => ({
            debts: state.debts.filter(d => d.id !== debtId)
        }));

        router.delete(`/debts/${debtId}`, { preserveScroll: true, preserveState: true });
    },

    setWalletFilter: (filter) => set({ walletFilter: filter }),
    
    resetTodayExpense: () => set({ todayExpense: 0, hasTriggeredLimit: false })
}));
