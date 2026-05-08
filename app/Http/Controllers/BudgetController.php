<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class BudgetController extends Controller
{
    public function update(Request $request)
    {
        $validated = $request->validate([
            'daily_limit' => 'sometimes|numeric|min:0',
            'is_enabled' => 'sometimes|boolean',
        ]);

        $user = $request->user();

        $budget = $user->budget ?? $user->budget()->create([
            'daily_limit' => 100000,
            'is_enabled' => true,
        ]);

        $budget->update($validated);

        return back()->with('success', 'Budget berhasil diperbarui!');
    }
}
