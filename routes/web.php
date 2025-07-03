<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PisitionController;
use App\Http\Controllers\DivisionController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\ApplicationController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Manage User (CRUD)
    Route::get('users/summary', [UserController::class, 'summary'])->name('users.summary');
    Route::resource('users', UserController::class);

    // Manage Role (CRUD)
    Route::resource('roles', RoleController::class);

    // Manage Position (CRUD)
    Route::resource('positions', PisitionController::class);

    // Manage Division (CRUD)
    Route::resource('divisions', DivisionController::class);

    // Manage Project (CRUD)
    Route::resource('projects', ProjectController::class);

    // Manage Team (CRUD)
    Route::resource('teams', TeamController::class);

    // Manage Team Members
    Route::get('teams/{team}/members', [\App\Http\Controllers\TeamMemberController::class, 'index'])->name('team-members.index');
    Route::post('teams/{team}/members', [\App\Http\Controllers\TeamMemberController::class, 'store'])->name('team-members.store');
    Route::delete('team-members/{member}', [\App\Http\Controllers\TeamMemberController::class, 'destroy'])->name('team-members.destroy');
    Route::put('team-members/{member}', [\App\Http\Controllers\TeamMemberController::class, 'update'])->name('team-members.update');

    // Manage Application (CRUD)
    Route::resource('applications', ApplicationController::class);

    // Manage Module (CRUD)
    Route::resource('modules', \App\Http\Controllers\ModuleController::class);

    // Manage Sprint (CRUD)
    Route::resource('sprints', \App\Http\Controllers\SprintController::class);

    // Manage Task (CRUD)
    Route::resource('tasks', \App\Http\Controllers\TaskController::class);
});

require __DIR__.'/auth.php';
