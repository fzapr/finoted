<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('debts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('contact_name');
            $table->decimal('amount', 15, 2);
            $table->enum('type', ['debt', 'receivable']); // debt = utang kita ke orang, receivable = piutang (orang utang ke kita)
            $table->date('due_date')->nullable();
            $table->enum('status', ['active', 'paid'])->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->enum('wallet_type', ['personal', 'business'])->default('personal')->after('notes');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('debts');
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn('wallet_type');
        });
    }
};
