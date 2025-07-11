<?php

namespace App\Http\Controllers;

use App\Models\Position;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PisitionController extends Controller
{
    // Tampilkan daftar position
    public function index()
    {
        $positions = Position::all();
        return Inertia::render('Positions/Index', [
            'positions' => $positions,
        ]);
    }

    // Tampilkan form tambah position
    public function create()
    {
        return Inertia::render('Positions/Create');
    }

    // Simpan position baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'rate' => 'nullable|numeric', // tambahkan validasi rate
        ]);

        Position::create($validated);

        return redirect()->route('positions.index')->with('success', 'Position berhasil ditambahkan!');
    }

    // Tampilkan detail position
    public function show(Position $pisition)
    {
        return Inertia::render('Positions/Show', [
            'position' => $pisition,
        ]);
    }

    // Tampilkan form edit position
    public function edit(Position $pisition)
    {
        return Inertia::render('Positions/Edit', [
            'position' => $pisition,
        ]);
    }

    // Update position
    public function update(Request $request, Position $pisition)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'rate' => 'nullable|numeric', // tambahkan validasi rate
        ]);

        $pisition->update($validated);

        return redirect()->route('positions.index')->with('success', 'Position berhasil diupdate!');
    }

    // Hapus position
    public function destroy(Position $pisition)
    {
        $pisition->delete();
        return redirect()->route('positions.index')->with('success', 'Position berhasil dihapus!');
    }
}
