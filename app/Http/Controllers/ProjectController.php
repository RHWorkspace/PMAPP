<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Division;
use App\Models\Team;
use App\Models\User;
use App\Models\Task;
use App\Models\Module;
use Spatie\Permission\Models\Role;
use App\Models\Position;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    // Tampilkan daftar project
    public function index()
    {
        $projects = Project::with('applications')->get();
        return Inertia::render('Projects/Index', [
            'projects' => $projects,
        ]);
    }

    // Tampilkan form tambah project
    public function create()
    {
        $divisions = Division::select('id', 'title')->get();
        $teams = Team::select('id', 'title')->get();
        return Inertia::render('Projects/Create', [
            'divisions' => $divisions,
            'teams' => $teams,
        ]);
    }

    // Simpan project baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string',
            'division_id' => 'nullable|exists:divisions,id',
            'team_id' => 'nullable|exists:teams,id',
            'start_date' => 'required|date',
            'due_date' => 'nullable|date',
            'completed_date' => 'nullable|date',
        ]);

        Project::create($validated);

        return redirect()->route('projects.index')->with('success', 'Project berhasil ditambahkan!');
    }

    // Tampilkan detail project
    public function show(Project $project)
    {
        // Eager load semua relasi yang dibutuhkan untuk tampilan detail
        $project->load([
            'division',
            'team',
            'creator',
            'applications' => function ($q) {
                $q->select('id', 'title', 'project_id')
                  ->with(['tasks' => function ($q2) {
                      $q2->select('id', 'application_id', 'status');
                  }]);
            }
        ]);

        return Inertia::render('Projects/Show', [
            'project' => $project,
        ]);
    }

    // Tampilkan form edit project
    public function edit(Project $project)
    {
        $divisions = Division::select('id', 'title')->get();
        $teams = Team::select('id', 'title')->get();
        return Inertia::render('Projects/Edit', [
            'project' => $project,
            'divisions' => $divisions,
            'teams' => $teams,
        ]);
    }

    // Update project
    public function update(Request $request, Project $project)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string',
            'division_id' => 'nullable|exists:divisions,id',
            'team_id' => 'nullable|exists:teams,id',
            'start_date' => 'required|date',
            'due_date' => 'nullable|date',
            'completed_date' => 'nullable|date',
        ]);

        $project->update($validated);

        return redirect()->route('projects.index')->with('success', 'Project berhasil diupdate!');
    }

    // Hapus project
    public function destroy(Project $project)
    {
        $project->delete();
        return redirect()->route('projects.index')->with('success', 'Project berhasil dihapus!');
    }

    public function summary(Request $request)
    {
        $divisionId = $request->input('division_id');
        $positionId = $request->input('position_id');

        $users = User::query()
            ->when($divisionId, fn($q) => $q->where('division_id', $divisionId))
            ->when($positionId, fn($q) => $q->where('position_id', $positionId))
            ->with(['division', 'position', 'roles', 'teams.applications.modules'])
            ->get();

        $tasks = Task::all();
        $projects = Project::all();
        $modules = Module::all();

        return Inertia::render('Summaries/ProjectSummary', [
            'header'    => 'Project Summary',
            'users'     => $users,
            'tasks'     => $tasks,
            'projects'  => $projects,
            'divisions' => Division::all(),
            'positions' => Position::all(),
            'roles'     => Role::all(),
            'modules'   => $modules,
            'filters'   => [
                'division_id' => $divisionId,
                'position_id' => $positionId,
            ],
            'teams' => Team::with(['members.user.position'])->get(),
            'team_members' => \App\Models\TeamMember::with(['user.position', 'team'])->get(),
            'applications' => \App\Models\Application::all(),
        ]);
    }
}
