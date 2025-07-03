<?php

namespace App\Http\Controllers;

use App\Models\Division;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DivisionController extends Controller
{
    // Tampilkan daftar division
    public function index()
    {
        $divisions = Division::with('parent')->get();
        return Inertia::render('Divisions/Index', [
            'divisions' => $divisions,
        ]);
    }

    // Tampilkan form tambah division
    public function create()
    {
        $parents = Division::select('id', 'title')->get();
        return Inertia::render('Divisions/Create', [
            'parents' => $parents,
        ]);
    }

    // Simpan division baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:divisions,id',
        ]);

        Division::create($validated);

        return redirect()->route('divisions.index')->with('success', 'Division berhasil ditambahkan!');
    }

    // Tampilkan detail division
    public function show(Division $division)
    {
        $division->load('parent', 'children');
        return Inertia::render('Divisions/Show', [
            'division' => $division,
        ]);
    }

    // Tampilkan form edit division
    public function edit(Division $division)
    {
        $parents = Division::where('id', '!=', $division->id)->select('id', 'title')->get();
        return Inertia::render('Divisions/Edit', [
            'division' => $division,
            'parents' => $parents,
        ]);
    }

    // Update division
    public function update(Request $request, Division $division)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:divisions,id',
        ]);

        $division->update($validated);

        return redirect()->route('divisions.index')->with('success', 'Division berhasil diupdate!');
    }

    // Hapus division
    public function destroy(Division $division)
    {
        $division->delete();
        return redirect()->route('divisions.index')->with('success', 'Division berhasil dihapus!');
    }
}
