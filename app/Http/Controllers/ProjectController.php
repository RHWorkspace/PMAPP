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
        // Hapus eager load 'team'
        $projects = Project::with(['applications','division'])->get();
        return Inertia::render('Projects/Index', [
            'projects' => $projects,
        ]);
    }

    // Tampilkan form tambah project
    public function create()
    {
        $divisions = Division::select('id', 'title')->get();
        // Tidak perlu ambil teams di sini jika tidak dipakai
        return Inertia::render('Projects/Create', [
            'divisions' => $divisions,
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
            'start_date' => 'required|date',
            'due_date' => 'nullable|date',
            'completed_date' => 'nullable|date',
            'nilai' => 'nullable|numeric', // tambahkan ini
        ]);

        Project::create($validated);

        return redirect()->route('projects.index')->with('success', 'Project berhasil ditambahkan!');
    }

    // Tampilkan detail project
    public function show(Project $project)
    {
        // Hapus eager load 'team'
        $project->load([
            'division',
            'creator',
            'applications' => function ($q) {
                $q->select('id', 'title', 'project_id', 'team_id')
                  ->with(['team', 'tasks' => function ($q2) {
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
        return Inertia::render('Projects/Edit', [
            'project' => $project,
            'divisions' => $divisions,
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
            'start_date' => 'required|date',
            'due_date' => 'nullable|date',
            'completed_date' => 'nullable|date',
            'nilai' => 'nullable|numeric', // tambahkan ini
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

    public function timeline()
    {
        // Ambil semua project beserta aplikasi, module, dan task-nya
        $projects = Project::with([
            'applications' => function ($q) {
                $q->select('id', 'title', 'project_id', 'start_date', 'due_date')
                  ->with([
                      'modules' => function ($qMod) {
                          $qMod->select('id', 'title', 'application_id')
                               ->with(['tasks' => function ($qTask) {
                                   $qTask->select('id', 'module_id', 'title', 'status', 'start_date', 'due_date');
                               }]);
                      },
                      'tasks' => function ($q2) {
                          $q2->select('id', 'application_id', 'title', 'status', 'start_date', 'due_date');
                      }
                  ]);
            }
        ])->select('id', 'title', 'start_date', 'due_date', 'nilai')->get();

        return Inertia::render('Summaries/Timeline', [
            'projects' => $projects,
        ]);
    }
    public function comparison(Request $request)
    {
        $divisions = Division::select('id', 'title', 'parent_id')->get();
        $users = User::select('id', 'name', 'type', 'division_id', 'position_id')->get();
        // Hapus 'team_id' dari select project
        $projects = Project::select('id', 'division_id', 'title', 'status', 'start_date', 'due_date', 'nilai')->get();
        // Tambahkan 'team_id' di application
        $applications = \App\Models\Application::select('id', 'title', 'description', 'status', 'start_date', 'due_date', 'completed_date',  'project_id', 'team_id')->get();
        $teams = \App\Models\Team::select('id', 'title', 'division_id', 'description')->get();
        $positions = \App\Models\Position::select('id', 'title', 'description', 'rate')->get();
        $team_members = \App\Models\TeamMember::select('id', 'team_id', 'user_id')->get();

        return Inertia::render('Summaries/Comparison', [
            'divisions'    => $divisions,
            'users'        => $users,
            'projects'     => $projects,
            'applications' => $applications,
            'teams'        => $teams,
            'positions'    => $positions,
            'team_members' => $team_members,
            'header'       => 'Comparison',
        ]);
    }
}