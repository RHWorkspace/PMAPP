<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Inertia\Inertia;

class RoleController extends Controller
{
    // Tampilkan daftar role
    public function index()
    {
        $roles = Role::all();
        return Inertia::render('Roles/Index', [
            'roles' => $roles,
        ]);
    }

    // Tampilkan form tambah role
    public function create()
    {
        return Inertia::render('Roles/Create');
    }

    // Simpan role baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name',
            'guard_name' => 'nullable|string',
        ]);

        Role::create($validated);

        return redirect()->route('roles.index')->with('success', 'Role berhasil ditambahkan!');
    }

    // Tampilkan detail role
    public function show(Role $role)
    {
        return Inertia::render('Roles/Show', [
            'role' => $role,
        ]);
    }

    // Tampilkan form edit role
    public function edit(Role $role)
    {
        return Inertia::render('Roles/Edit', [
            'role' => $role,
        ]);
    }

    // Update role
    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name,' . $role->id,
            'guard_name' => 'nullable|string',
        ]);

        $role->update($validated);

        return redirect()->route('roles.index')->with('success', 'Role berhasil diupdate!');
    }

    // Hapus role
    public function destroy(Role $role)
    {
        $role->delete();
        return redirect()->route('roles.index')->with('success', 'Role berhasil dihapus!');
    }
}
