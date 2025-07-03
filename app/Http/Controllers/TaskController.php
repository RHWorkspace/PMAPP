<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\Application;
use App\Models\Sprint;
use App\Models\User;
use App\Models\Module;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TaskController extends Controller
{
    // Tampilkan daftar task
    public function index()
    {
        // Pastikan eager load relasi yang dibutuhkan
        $tasks = Task::with(['application', 'module', 'sprint', 'assignedTo', 'parent', 'subtasks'])->get();
        $applications = Application::select('id', 'title')->get();
        $sprints = Sprint::select('id', 'title')->get();
        $users = User::select('id', 'name')->get();
        $modules = Module::select('id', 'title', 'application_id')->get(); // Tambahkan baris ini

        return Inertia::render('Tasks/Index', [
            'tasks' => $tasks,
            'applications' => $applications,
            'sprints' => $sprints,
            'users' => $users,
            'modules' => $modules, // Tambahkan baris ini
        ]);
    }

    // Tampilkan form tambah task
    public function create()
    {
        $applications = Application::with('project.team.members.user')->get();
        $sprints = Sprint::select('id', 'title')->get();
        $users = User::select('id', 'name')->get();
        $tasks = Task::select('id', 'title')->get(); // Untuk parent task
        $modules = Module::select('id', 'title', 'application_id')->get();
        return Inertia::render('Tasks/Create', [
            'applications' => $applications,
            'sprints' => $sprints,
            'users' => $users,
            'tasks' => $tasks,
            'modules' => $modules,
        ]);
    }

    // Simpan task baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string',
            'priority' => 'required|string',
            'application_id' => 'nullable|exists:applications,id',
            'module_id' => 'nullable|exists:modules,id',
            'sprint_id' => 'nullable|exists:sprints,id',
            'assigned_to_user_id' => 'nullable|exists:users,id',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date',
            'completed_date' => 'nullable|date',
            'progress' => 'nullable|integer',
            'est_hours' => 'nullable|numeric',
            'parent_id' => 'nullable|exists:tasks,id',
            'request_by' => 'nullable|string|max:255',
            'request_at' => 'nullable|date',
            'request_code' => 'nullable|string|max:255',
            'link_issue' => 'nullable|string|max:255',
        ]);

        Task::create($validated);

        return redirect()->route('tasks.index')->with('success', 'Task berhasil ditambahkan!');
    }

    // Tampilkan detail task
    public function show(Task $task)
    {
        $task->load(['application', 'sprint', 'assignedTo', 'parent', 'subtasks', 'module']);
        return Inertia::render('Tasks/Show', [
            'task' => $task,
        ]);
    }

    // Tampilkan form edit task
    public function edit(Task $task)
    {
        $applications = Application::select('id', 'title')->get();
        $sprints = Sprint::select('id', 'title')->get();
        $users = User::select('id', 'name')->get();
        $tasks = Task::where('id', '!=', $task->id)->select('id', 'title')->get(); // Hindari parent ke diri sendiri
        $modules = Module::select('id', 'title', 'application_id')->get();
        return Inertia::render('Tasks/Edit', [
            'task' => $task->load(['application', 'sprint', 'assignedTo', 'parent', 'module']),
            'applications' => $applications,
            'sprints' => $sprints,
            'users' => $users,
            'tasks' => $tasks,
            'modules' => $modules,
        ]);
    }

    // Update task
    public function update(Request $request, Task $task)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'required|string',
            'priority' => 'required|string',
            'application_id' => 'nullable|exists:applications,id',
            'module_id' => 'nullable|exists:modules,id',
            'sprint_id' => 'nullable|exists:sprints,id',
            'assigned_to_user_id' => 'nullable|exists:users,id',
            'start_date' => 'nullable|date',
            'due_date' => 'nullable|date',
            'completed_date' => 'nullable|date',
            'progress' => 'nullable|integer',
            'est_hours' => 'nullable|numeric',
            'parent_id' => 'nullable|exists:tasks,id',
            'request_by' => 'nullable|string|max:255',
            'request_at' => 'nullable|date',
            'request_code' => 'nullable|string|max:255',
            'link_issue' => 'nullable|string|max:255',
        ]);

        $task->update($validated);

        return redirect()->route('tasks.index')->with('success', 'Task berhasil diupdate!');
    }

    // Hapus task
    public function destroy(Task $task)
    {
        $task->delete();
        return redirect()->route('tasks.index')->with('success', 'Task berhasil dihapus!');
    }
}
