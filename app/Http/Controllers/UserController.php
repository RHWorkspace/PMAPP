<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Project;
use App\Models\Module;
use App\Models\Division;
use App\Models\Position;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Auth;
use App\Models\Team;

class UserController extends Controller
{
    // Tampilkan daftar user
    public function index()
    {
        $users = User::with(['position', 'division', 'roles', 'teams'])->get();
        return Inertia::render('Users/Index', [
            'users' => $users,
        ]);
    }

    // Tampilkan form tambah user
    public function create()
    {
        $positions = \App\Models\Position::select('id', 'title', 'description')->get();
        $divisions = \App\Models\Division::select('id', 'title')->get();
        return Inertia::render('Users/Create', [
            'positions' => $positions,
            'divisions' => $divisions,
        ]);
    }

    // Simpan user baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'nik' => 'required|unique:users',
            'password' => 'required|min:6',
            'status' => 'required|in:Active,Inactive',
            'type' => 'required|in:Karyawan,JagooIT,Kontrak,Freelance,Magang',
            'position_id' => 'nullable|exists:positions,id',
            'division_id' => 'nullable|exists:divisions,id',
            'join_date' => 'nullable|date',
            'created_by' => 'nullable|exists:users,id',
        ]);

        $validated['password'] = bcrypt($validated['password']);
        if (empty($validated['join_date'])) {
            $validated['join_date'] = now();
        }
        if (empty($validated['created_by'])) {
            $validated['created_by'] = auth()->id();
        }

        User::create($validated);

        return redirect()->route('users.index')->with('success', 'User berhasil ditambahkan!');
    }

    // Tampilkan detail user
    public function show(User $user)
    {
        $user->load('position', 'division');
        return Inertia::render('Users/Show', [
            'user' => $user,
        ]);
    }

    // Tampilkan form edit user
    public function edit(User $user)
    {
        $positions = \App\Models\Position::select('id', 'title', 'description')->get();
        $divisions = \App\Models\Division::select('id', 'title')->get();
        return Inertia::render('Users/Edit', [
            'user' => $user,
            'positions' => $positions,
            'divisions' => $divisions,
        ]);
    }

    // Update user
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'nik' => 'required|unique:users,nik,' . $user->id,
            'status' => 'required|in:Active,Inactive',
            'type' => 'required|in:Karyawan,JagooIT,Kontrak,Freelance,Magang',
            'position_id' => 'nullable|exists:positions,id',
            'division_id' => 'nullable|exists:divisions,id',
            'join_date' => 'nullable|date',
            'created_by' => 'nullable|exists:users,id',
        ]);

        $user->update($validated);

        return redirect()->route('users.index')->with('success', 'User berhasil diupdate!');
    }

    // Hapus user
    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->route('users.index')->with('success', 'User berhasil dihapus!');
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

        $tasks = \App\Models\Task::all();
        $projects = Project::all();
        $modules = Module::all();

        $user = Auth::user();
        if ($user instanceof User) {
            $user->load('roles');
        }

        return Inertia::render('Summaries/Workload', [
            'header'    => 'Workload Summary',
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
            'teams' => Team::with('users')->get(),
            'team_members' => \App\Models\TeamMember::with(['user', 'team'])->get(),
            'applications' => \App\Models\Application::all(), // <-- Tambahkan baris ini
        ]);
    }
}
