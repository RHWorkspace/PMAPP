<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Buat beberapa role menggunakan Spatie
        $adminRole = Role::firstOrCreate(['name' => 'Admin']);
        $managerRole = Role::firstOrCreate(['name' => 'Manager']);
        $staffRole = Role::firstOrCreate(['name' => 'Staff']);

        // 2. Buat division dulu (tanpa created_by)
        $division1 = DB::table('divisions')->insertGetId([
            'title' => 'IT',
            'description' => 'IT Division',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $division2 = DB::table('divisions')->insertGetId([
            'title' => 'HR',
            'description' => 'HR Division',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 3. Buat user admin dulu (sementara position_id null)
        $admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'nik' => '1000000001',
            'password' => bcrypt('password'),
            'status' => 'Active',
            'type' => 'Karyawan',
            'position_id' => null,
            'division_id' => $division1,
            'join_date' => now(),
            'created_by' => null,
        ]);
        $admin->assignRole($adminRole);

        // 4. Buat beberapa posisi (tanpa created_by)
        $pm = DB::table('positions')->insertGetId([
            'title' => 'PM',
            'description' => 'Project Manager',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $sa = DB::table('positions')->insertGetId([
            'title' => 'SA',
            'description' => 'System Analyst',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $dev = DB::table('positions')->insertGetId([
            'title' => 'DEV',
            'description' => 'Developer',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $tw = DB::table('positions')->insertGetId([
            'title' => 'TW',
            'description' => 'Technical Writer',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $qa = DB::table('positions')->insertGetId([
            'title' => 'QA',
            'description' => 'Quality Assurance',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 5. Update posisi admin agar valid
        $admin->position_id = $pm;
        $admin->created_by = $admin->id;
        $admin->save();

        // 6. Buat user lain
        $manager = User::factory()->create([
            'name' => 'Manager User',
            'email' => 'manager@example.com',
            'nik' => '1000000002',
            'password' => bcrypt('password'),
            'status' => 'Active',
            'type' => 'Karyawan',
            'position_id' => $sa,
            'division_id' => $division1,
            'join_date' => now(),
            'created_by' => $admin->id,
        ]);
        $manager->assignRole($managerRole);

        $staff = User::factory()->create([
            'name' => 'Staff User',
            'email' => 'staff@example.com',
            'nik' => '1000000003',
            'password' => bcrypt('password'),
            'status' => 'Active',
            'type' => 'Magang',
            'position_id' => $dev,
            'division_id' => $division2,
            'join_date' => now(),
            'created_by' => $admin->id,
        ]);
        $staff->assignRole($staffRole);
    }
}
