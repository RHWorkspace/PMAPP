<?php

namespace App\Http\Controllers;

use App\Models\Module;
use App\Models\Application;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ModuleController extends Controller
{
    // Tampilkan daftar module
    public function index()
    {
        $modules = Module::with(['parent', 'application', 'creator', 'children'])->get();
        $applications = Application::select('id', 'title')->get();
        return Inertia::render('Modules/Index', [
            'modules' => $modules,
            'applications' => $applications,
        ]);
    }

    // Tampilkan form tambah module
    public function create()
    {
        $applications = Application::select('id', 'title')->get();
        $modules = Module::select('id', 'title')->get(); // Untuk parent module
        return Inertia::render('Modules/Create', [
            'applications' => $applications,
            'modules' => $modules,
        ]);
    }

    // Simpan module baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:modules,id',
            'application_id' => 'nullable|exists:applications,id',
        ]);
        $validated['created_by'] = auth()->id();

        Module::create($validated);

        return redirect()->route('modules.index')->with('success', 'Module berhasil ditambahkan!');
    }

    // Tampilkan detail module
    public function show(Module $module)
    {
        $module->load(['parent', 'application', 'creator', 'children']);
        return Inertia::render('Modules/Show', [
            'module' => $module,
        ]);
    }

    // Tampilkan form edit module
    public function edit(Module $module)
    {
        $applications = Application::select('id', 'title')->get();
        $modules = Module::where('id', '!=', $module->id)->select('id', 'title')->get(); // Hindari parent ke diri sendiri
        return Inertia::render('Modules/Edit', [
            'module' => $module,
            'applications' => $applications,
            'modules' => $modules,
        ]);
    }

    // Update module
    public function update(Request $request, Module $module)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:modules,id',
            'application_id' => 'nullable|exists:applications,id',
        ]);

        $module->update($validated);

        return redirect()->route('modules.index')->with('success', 'Module berhasil diupdate!');
    }

    // Hapus module
    public function destroy(Module $module)
    {
        $module->delete();
        return redirect()->route('modules.index')->with('success', 'Module berhasil dihapus!');
    }
}
