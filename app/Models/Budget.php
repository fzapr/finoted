<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Budget extends Model
{
    protected $fillable = [
        'user_id',
        'daily_limit',
        'is_enabled',
    ];

    protected $casts = [
        'daily_limit' => 'decimal:2',
        'is_enabled' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
