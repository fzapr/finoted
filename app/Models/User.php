<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function debts(): HasMany
    {
        return $this->hasMany(Debt::class);
    }

    public function goals(): HasMany
    {
        return $this->hasMany(Goal::class);
    }

    public function budget(): HasOne
    {
        return $this->hasOne(Budget::class);
    }

    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    /**
     * Computed balance: sum(income) - sum(expense) - sum(savings)
     */
    public function getBalanceAttribute(): float
    {
        $income = $this->transactions()->where('type', 'income')->sum('amount');
        $expense = $this->transactions()->where('type', 'expense')->sum('amount');
        $savings = $this->transactions()->where('type', 'savings')->sum('amount');

        return (float) ($income - $expense - $savings);
    }

    /**
     * Today's total expense amount.
     */
    public function getTodayExpenseAttribute(): float
    {
        return (float) $this->transactions()
            ->where('type', 'expense')
            ->whereDate('date', today())
            ->sum('amount');
    }
}
