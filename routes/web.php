<?php

use App\Http\Controllers\BudgetController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DebtController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TransactionController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // Inertia Pages (server-rendered with data)
    Route::get('/chat', [ChatController::class, 'index'])->name('chat.index');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/goals', [GoalController::class, 'index'])->name('goals.index');

    // Transactions API
    Route::get('/transactions/export', [TransactionController::class, 'export'])->name('transactions.export');
    Route::post('/transactions', [TransactionController::class, 'store'])->name('transactions.store');
    Route::delete('/transactions/{transaction}', [TransactionController::class, 'destroy'])->name('transactions.destroy');

    // Goals API
    Route::post('/goals', [GoalController::class, 'store'])->name('goals.store');
    Route::delete('/goals/{goal}', [GoalController::class, 'destroy'])->name('goals.destroy');
    Route::post('/goals/{goal}/complete', [GoalController::class, 'complete'])->name('goals.complete');

    // Debts API
    Route::post('/debts', [DebtController::class, 'store'])->name('debts.store');
    Route::patch('/debts/{debt}', [DebtController::class, 'update'])->name('debts.update');
    Route::delete('/debts/{debt}', [DebtController::class, 'destroy'])->name('debts.destroy');

    // Budget API
    Route::patch('/budget', [BudgetController::class, 'update'])->name('budget.update');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';

