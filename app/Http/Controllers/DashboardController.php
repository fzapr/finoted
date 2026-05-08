<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $transactions = $user->transactions()
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'title' => $t->title,
                'amount' => (float) $t->amount,
                'type' => $t->type,
                'date' => $t->date->toISOString(),
                'notes' => $t->notes,
                'wallet_type' => $t->wallet_type,
            ]);

        $debts = $user->debts()
            ->where('status', 'active')
            ->orderBy('due_date', 'asc')
            ->get();

        $goals = $user->goals()
            ->get()
            ->map(fn ($g) => [
                'id' => $g->id,
                'title' => $g->title,
                'target' => (float) $g->target_amount,
                'current' => (float) $g->current_amount,
                'icon' => $g->icon,
                'color' => $g->color,
                'bg' => $g->bg,
            ]);

        // Monthly income/expense data for bar chart (last 6 months)
        $monthlyData = [];
        for ($i = 5; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $monthKey = $date->format('Y-m');
            $monthLabel = $date->translatedFormat('M');

            $income = $user->transactions()
                ->where('type', 'income')
                ->whereYear('date', $date->year)
                ->whereMonth('date', $date->month)
                ->sum('amount');

            $expense = $user->transactions()
                ->whereIn('type', ['expense', 'savings'])
                ->whereYear('date', $date->year)
                ->whereMonth('date', $date->month)
                ->sum('amount');

            $monthlyData[] = [
                'label' => $monthLabel,
                'income' => (float) $income,
                'expense' => (float) $expense,
            ];
        }

        return Inertia::render('Dashboard/Index', [
            'balance' => $user->balance,
            'todayExpense' => $user->today_expense,
            'transactions' => $transactions,
            'monthlyData' => $monthlyData,
            'debts' => $debts,
            'goals' => $goals,
        ]);
    }
}
