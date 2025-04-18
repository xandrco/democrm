<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        for ($i = 1; $i <= 5; $i++) {
            $username = $i === 1 ? 'admin' : "admin{$i}";
            
            User::create([
                'name' => ucfirst($username),
                'email' => "{$username}@democrm.com",
                'password' => Hash::make('password'),
            ]);
        }
    }
}
