<?php

namespace App\Http\Controllers;

use App\Models\Sprint;
use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SprintController extends Controller
{
    // Tampilkan daftar sprint
    public function index()
    {
        $sprints = Sprint::with('team', 'creator')->get();
        return Inertia::render('Sprints/Index', [
            'sprints' => $sprints,
        ]);
    }

    // Tampilkan form tambah sprint
    public function create()
    {
        $teams = Team::select('id', 'title')->get();
        return Inertia::render('Sprints/Create', [
            'teams' => $teams,
        ]);
    }

    // Simpan sprint baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string',
            'team_id' => 'nullable|exists:teams,id',
            'start_date' => 'required|date',
            'due_date' => 'nullable|date',
            'completed_date' => 'nullable|date',
        ]);
        $validated['created_by'] = auth()->id();

        Sprint::create($validated);

        return redirect()->route('sprints.index')->with('success', 'Sprint berhasil ditambahkan!');
    }

    // Tampilkan detail sprint
    public function show(Sprint $sprint)
    {
        $sprint->load('team', 'creator');
        return Inertia::render('Sprints/Show', [
            'sprint' => $sprint,
        ]);
    }

    // Tampilkan form edit sprint
    public function edit(Sprint $sprint)
    {
        $teams = Team::select('id', 'title')->get();
        return Inertia::render('Sprints/Edit', [
            'sprint' => $sprint,
            'teams' => $teams,
        ]);
    }

    // Update sprint
    public function update(Request $request, Sprint $sprint)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string',
            'team_id' => 'nullable|exists:teams,id',
            'start_date' => 'required|date',
            'due_date' => 'nullable|date',
            'completed_date' => 'nullable|date',
        ]);

        $sprint->update($validated);

        return redirect()->route('sprints.index')->with('success', 'Sprint berhasil diupdate!');
    }

    // Hapus sprint
    public function destroy(Sprint $sprint)
    {
        $sprint->delete();
        return redirect()->route('sprints.index')->with('success', 'Sprint berhasil dihapus!');
    }
}
