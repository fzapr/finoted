<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'type' => 'required|in:expense,income,savings',
            'category_id' => 'nullable|exists:categories,id',
            'goal_id' => 'nullable|exists:goals,id',
            'notes' => 'nullable|string|max:500',
            'wallet_type' => 'nullable|in:personal,business',
        ]);

        $user = $request->user();

        $transaction = $user->transactions()->create([
            'title' => $validated['title'],
            'amount' => $validated['amount'],
            'type' => $validated['type'],
            'category_id' => $validated['category_id'] ?? null,
            'goal_id' => $validated['goal_id'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'wallet_type' => $validated['wallet_type'] ?? 'personal',
            'date' => now(),
        ]);

        // If savings, update goal's current_amount
        if ($validated['type'] === 'savings' && !empty($validated['goal_id'])) {
            $goal = $user->goals()->findOrFail($validated['goal_id']);
            $goal->increment('current_amount', $validated['amount']);
        }

        return back()->with('success', 'Transaksi berhasil dicatat!');
    }

    public function destroy(Request $request, Transaction $transaction)
    {
        // Authorization: only own transactions
        if ($transaction->user_id !== $request->user()->id) {
            abort(403);
        }

        // If it was a savings transaction, reverse the goal amount
        if ($transaction->type === 'savings' && $transaction->goal_id) {
            $goal = $request->user()->goals()->find($transaction->goal_id);
            if ($goal) {
                $goal->decrement('current_amount', $transaction->amount);
            }
        }

        $transaction->delete();

        return back()->with('success', 'Transaksi berhasil dihapus!');
    }

    public function export(Request $request)
    {
        $user = $request->user();
        $transactions = $user->transactions()->with('category')->latest('date')->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="finchat_transactions_' . now()->format('Ymd_His') . '.csv"',
        ];

        $callback = function() use ($transactions) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['ID', 'Tanggal', 'Judul', 'Nominal', 'Tipe', 'Kategori', 'Catatan']);

            foreach ($transactions as $trx) {
                fputcsv($file, [
                    $trx->id,
                    $trx->date->format('Y-m-d H:i:s'),
                    $trx->title,
                    $trx->amount,
                    $trx->type,
                    $trx->category ? $trx->category->name : '-',
                    $trx->notes,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
