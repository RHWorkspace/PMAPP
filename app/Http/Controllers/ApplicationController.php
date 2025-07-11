<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Project;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ApplicationController extends Controller
{
    // Tampilkan daftar aplikasi
    public function index()
    {
        $applications = \App\Models\Application::with('project', 'team', 'creator')->get();
        $projects = \App\Models\Project::select('id', 'title')->get();
        $teams = \App\Models\Team::select('id', 'title')->get();
        // Ambil status unik dari aplikasi yang ada
        $statuses = \App\Models\Application::select('status')->distinct()->pluck('status');

        return Inertia::render('Applications/Index', [
            'applications' => $applications,
            'projects' => $projects,
            'teams' => $teams,
            'statuses' => $statuses,
        ]);
    }

    // Tampilkan form tambah aplikasi
    public function create()
    {
        $projects = Project::select('id', 'title')->get();
        $teams = \App\Models\Team::select('id', 'title')->get();
        return Inertia::render('Applications/Create', [
            'projects' => $projects,
            'teams' => $teams,
        ]);
    }

    // Simpan aplikasi baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string',
            'project_id' => 'required|exists:projects,id',
            'team_id' => 'required|exists:teams,id',
            'start_date' => 'required|date',
            'due_date' => 'nullable|date',
            'completed_date' => 'nullable|date',
        ]);
        $validated['created_by'] = auth()->id();

        Application::create($validated);

        return redirect()->route('applications.index')->with('success', 'Application berhasil ditambahkan!');
    }

    // Tampilkan detail aplikasi
    public function show(Application $application)
    {
        $application->load([
            'project', 'team', 'creator',
            'modules.tasks',
        ]);
        return Inertia::render('Applications/Show', [
            'application' => $application,
        ]);
    }

    // Tampilkan form edit aplikasi
    public function edit(Application $application)
    {
        $projects = Project::select('id', 'title')->get();
        $teams = \App\Models\Team::select('id', 'title')->get();
        return Inertia::render('Applications/Edit', [
            'application' => $application,
            'projects' => $projects,
            'teams' => $teams,
        ]);
    }

    // Update aplikasi
    public function update(Request $request, Application $application)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string',
            'project_id' => 'required|exists:projects,id',
            'team_id' => 'required|exists:teams,id',
            'start_date' => 'required|date',
            'due_date' => 'nullable|date',
            'completed_date' => 'nullable|date',
        ]);

        $application->update($validated);

        return redirect()->route('applications.index')->with('success', 'Application berhasil diupdate!');
    }

    // Hapus aplikasi
    public function destroy(Application $application)
    {
        $application->delete();
        return redirect()->route('applications.index')->with('success', 'Application berhasil dihapus!');
    }
}
