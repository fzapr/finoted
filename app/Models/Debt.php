<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Debt extends Model
{
    protected $fillable = [
        'user_id',
        'contact_name',
        'amount',
        'type',
        'due_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'due_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
