<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $budget = $user->budget ?? $user->budget()->create([
            'daily_limit' => 100000,
            'is_enabled' => true,
        ]);

        $expenseCategories = Category::forUser($user->id)
            ->where('type', 'expense')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'label' => $c->name,
                'icon' => $c->icon,
                'color' => $c->color,
            ]);

        $incomeCategories = Category::forUser($user->id)
            ->where('type', 'income')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'label' => $c->name,
                'icon' => $c->icon,
                'color' => $c->color,
            ]);

        $goals = $user->goals()->get()->map(fn ($g) => [
            'id' => $g->id,
            'title' => $g->title,
            'target' => (float) $g->target_amount,
            'current' => (float) $g->current_amount,
            'icon' => $g->icon,
            'color' => $g->color,
            'bg' => $g->bg,
        ]);

        $recentTransactions = $user->transactions()
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'title' => $t->title,
                'amount' => (float) $t->amount,
                'type' => $t->type,
                'date' => $t->date->toISOString(),
            ]);

        return Inertia::render('Chat/Index', [
            'balance' => $user->balance,
            'todayExpense' => $user->today_expense,
            'dailyLimit' => (float) $budget->daily_limit,
            'isLimitEnabled' => $budget->is_enabled,
            'expenseCategories' => $expenseCategories,
            'incomeCategories' => $incomeCategories,
            'goals' => $goals,
            'recentTransactions' => $recentTransactions,
        ]);
    }
}
