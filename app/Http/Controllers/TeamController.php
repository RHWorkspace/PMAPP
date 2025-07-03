<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\Division;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeamController extends Controller
{
    // Tampilkan daftar team
    public function index()
    {
        $teams = Team::with('division')->get();
        return Inertia::render('Teams/Index', [
            'teams' => $teams,
        ]);
    }

    // Tampilkan form tambah team
    public function create()
    {
        $divisions = Division::select('id', 'title')->get();
        return Inertia::render('Teams/Create', [
            'divisions' => $divisions,
        ]);
    }

    // Simpan team baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'division_id' => 'nullable|exists:divisions,id',
        ]);
        $validated['created_by'] = auth()->id();

        Team::create($validated);

        return redirect()->route('teams.index')->with('success', 'Team berhasil ditambahkan!');
    }

    // Tampilkan detail team
    public function show($id)
    {
        $team = Team::with([
            'division',
            'creator',
            'members.user.position', // tambahkan ini!
        ])->findOrFail($id);

        return Inertia::render('Teams/Show', [
            'team' => $team
        ]);
    }

    // Tampilkan form edit team
    public function edit(Team $team)
    {
        $divisions = Division::select('id', 'title')->get();
        return Inertia::render('Teams/Edit', [
            'team' => $team,
            'divisions' => $divisions,
        ]);
    }

    // Update team
    public function update(Request $request, Team $team)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'division_id' => 'nullable|exists:divisions,id',
        ]);

        $team->update($validated);

        return redirect()->route('teams.index')->with('success', 'Team berhasil diupdate!');
    }

    // Hapus team
    public function destroy(Team $team)
    {
        $team->delete();
        return redirect()->route('teams.index')->with('success', 'Team berhasil dihapus!');
    }
}
