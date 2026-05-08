<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GoalController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $goals = $user->goals()->orderBy('created_at', 'desc')->get()->map(fn ($g) => [
            'id' => $g->id,
            'title' => $g->title,
            'target' => (float) $g->target_amount,
            'current' => (float) $g->current_amount,
            'icon' => $g->icon,
            'color' => $g->color,
            'bg' => $g->bg,
        ]);

        return Inertia::render('Goals/Index', [
            'goals' => $goals,
            'balance' => $user->balance,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:1',
            'icon' => 'required|string|max:50',
            'color' => 'required|string|max:100',
            'bg' => 'required|string|max:100',
        ]);

        $request->user()->goals()->create($validated);

        return back()->with('success', 'Target berhasil dibuat!');
    }

    public function destroy(Request $request, Goal $goal)
    {
        if ($goal->user_id !== $request->user()->id) {
            abort(403);
        }

        $goal->delete();

        return back()->with('success', 'Target berhasil dihapus!');
    }

    /**
     * Complete a goal: create income transaction and delete the goal.
     */
    public function complete(Request $request, Goal $goal)
    {
        if ($goal->user_id !== $request->user()->id) {
            abort(403);
        }

        $user = $request->user();

        // Create income transaction for the withdrawn amount
        $user->transactions()->create([
            'title' => 'Pencairan: ' . $goal->title,
            'amount' => $goal->current_amount,
            'type' => 'income',
            'goal_id' => $goal->id,
            'date' => now(),
        ]);

        $goal->delete();

        return back()->with('success', 'Tabungan berhasil ditarik!');
    }
}
