<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    protected $fillable = [
        'user_id',
        'category_id',
        'goal_id',
        'title',
        'amount',
        'type',
        'date',
        'notes',
        'wallet_type',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'date' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function goal(): BelongsTo
    {
        return $this->belongsTo(Goal::class);
    }
}
