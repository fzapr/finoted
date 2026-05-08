<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            // Expense categories
            ['name' => 'Makan', 'type' => 'expense', 'icon' => 'Coffee', 'color' => 'bg-orange-100 text-orange-600 border-orange-200', 'is_default' => true],
            ['name' => 'Transport', 'type' => 'expense', 'icon' => 'Car', 'color' => 'bg-blue-100 text-blue-600 border-blue-200', 'is_default' => true],
            ['name' => 'Belanja', 'type' => 'expense', 'icon' => 'ShoppingBag', 'color' => 'bg-purple-100 text-purple-600 border-purple-200', 'is_default' => true],
            ['name' => 'Lainnya', 'type' => 'expense', 'icon' => 'PlusCircle', 'color' => 'bg-gray-100 text-gray-600 border-gray-200', 'is_default' => true],

            // Income categories
            ['name' => 'Gaji', 'type' => 'income', 'icon' => 'TrendingUp', 'color' => 'bg-green-100 text-green-600 border-green-200', 'is_default' => true],
            ['name' => 'Bonus', 'type' => 'income', 'icon' => 'PlusCircle', 'color' => 'bg-teal-100 text-teal-600 border-teal-200', 'is_default' => true],
            ['name' => 'Lainnya', 'type' => 'income', 'icon' => 'PlusCircle', 'color' => 'bg-gray-100 text-gray-600 border-gray-200', 'is_default' => true],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
