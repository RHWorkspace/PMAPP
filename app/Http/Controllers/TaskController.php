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
        $tasks = Task::select('id', 'title', 'parent_id')->get(); // <-- Tambahkan 'parent_id' di sini
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

        // Logic: jika status Done, completed_date dan progress otomatis
        if (
            isset($validated['status']) &&
            $validated['status'] === 'Done'
        ) {
            // Jika completed_date kosong, isi dengan hari ini
            if (empty($validated['completed_date'])) {
                $validated['completed_date'] = now()->toDateString();
            }
            // Jika progress belum 100, set ke 100
            if (empty($validated['progress']) || $validated['progress'] != 100) {
                $validated['progress'] = 100;
            }
        }

        Task::create($validated);

        // Tambahkan logika update parent jika subtask baru dibuat
        if (!empty($validated['parent_id'])) {
            $parent = Task::find($validated['parent_id']);
            if ($parent) {
                $subtasks = Task::where('parent_id', $parent->id)->get();
                $avgProgress = $subtasks->avg('progress');
                $parent->progress = $avgProgress;

                if ($subtasks->every(fn($t) => $t->status === 'Done')) {
                    $parent->status = 'Done';
                } elseif ($subtasks->contains(fn($t) => $t->status === 'In Progress')) {
                    $parent->status = 'In Progress';
                } else {
                    $parent->status = 'Todo';
                }

                $parent->save();
            }
        }

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
        $tasks = Task::select('id', 'title', 'parent_id', 'est_hours', 'start_date', 'due_date')->get(); // Ambil semua, termasuk subtasks
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

        // Logic: jika status Done, completed_date dan progress otomatis
        if (
            isset($validated['status']) &&
            $validated['status'] === 'Done'
        ) {
            // Jika completed_date kosong, isi dengan hari ini
            if (empty($validated['completed_date'])) {
                $validated['completed_date'] = now()->toDateString();
            }
            // Jika progress belum 100, set ke 100
            if (empty($validated['progress']) || $validated['progress'] != 100) {
                $validated['progress'] = 100;
            }
        }

        $task->update($validated);

        // Jika task ini adalah subtask (punya parent)
        if ($task->parent_id) {
            $parent = Task::find($task->parent_id);
            if ($parent) {
                // Ambil semua subtask parent
                $subtasks = Task::where('parent_id', $parent->id)->get();

                // Hitung progress rata-rata
                $avgProgress = $subtasks->avg('progress');

                // Update progress parent
                $parent->progress = $avgProgress;

                // Update status parent
                if ($subtasks->every(fn($t) => $t->status === 'Done')) {
                    $parent->status = 'Done';
                } elseif ($subtasks->contains(fn($t) => $t->status === 'In Progress')) {
                    $parent->status = 'In Progress';
                } else {
                    $parent->status = 'Todo';
                }

                $parent->save();
            }
        }

        return redirect()->route('tasks.index')->with('success', 'Task berhasil diupdate!');
    }

    // Hapus task
    public function destroy(Task $task)
    {
        $task->delete();
        return redirect()->route('tasks.index')->with('success', 'Task berhasil dihapus!');
    }
}
