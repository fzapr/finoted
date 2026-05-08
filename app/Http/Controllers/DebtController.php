<?php

namespace App\Http\Controllers;

use App\Models\Debt;
use Illuminate\Http\Request;

class DebtController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'contact_name' => 'required|string|max:255',
            'amount' => 'required|numeric|min:1',
            'type' => 'required|in:debt,receivable',
            'due_date' => 'nullable|date',
            'notes' => 'nullable|string|max:500',
        ]);

        $request->user()->debts()->create($validated);

        return back()->with('success', 'Hutang/Piutang berhasil dicatat!');
    }

    public function update(Request $request, Debt $debt)
    {
        if ($debt->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'status' => 'required|in:active,paid',
        ]);

        if ($validated['status'] === 'paid' && $debt->status !== 'paid') {
            // Create Transaction automatically
            $request->user()->transactions()->create([
                'title' => ($debt->type === 'debt' ? 'Pelunasan Utang: ' : 'Penerimaan Piutang: ') . $debt->contact_name,
                'amount' => $debt->amount,
                'type' => $debt->type === 'debt' ? 'expense' : 'income',
                'notes' => $debt->notes,
                'date' => now(),
            ]);
        }

        $debt->update($validated);

        return back()->with('success', 'Status hutang berhasil diperbarui!');
    }

    public function destroy(Request $request, Debt $debt)
    {
        if ($debt->user_id !== $request->user()->id) {
            abort(403);
        }

        $debt->delete();

        return back()->with('success', 'Catatan hutang berhasil dihapus!');
    }
}
