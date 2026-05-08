<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('goals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->decimal('target_amount', 15, 2);
            $table->decimal('current_amount', 15, 2)->default(0);
            $table->string('icon')->default('TrendingUp');
            $table->string('color')->default('text-blue-600');
            $table->string('bg')->default('bg-blue-100');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('goals');
    }
};
