<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin User
        User::updateOrCreate(
            ['email' => 'admin@libradesk.com'],
            [
                'username' => 'admin',
                'name' => 'Administrator',
                'password' => Hash::make('password'), // Default password
                'role_id' => 1, // Admin role
            ]
        );
    }
}
