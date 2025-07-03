<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $table = 'tasks';

    protected $fillable = [
        'title',
        'description',
        'status',
        'priority',
        'application_id',
        'module_id',
        'sprint_id',
        'assigned_to_user_id',
        'start_date',
        'due_date',
        'completed_date',
        'progress',
        'est_hours',
        'parent_id',
        'request_by',
        'request_at',
        'request_code',
        'link_issue',
    ];

    // Relasi ke Application
    public function application()
    {
        return $this->belongsTo(Application::class, 'application_id');
    }

    // Relasi ke Module
    public function module()
    {
        return $this->belongsTo(Module::class, 'module_id');
    }

    // Relasi ke Sprint
    public function sprint()
    {
        return $this->belongsTo(Sprint::class, 'sprint_id');
    }

    // Relasi ke User yang ditugaskan
    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to_user_id');
    }

    // Relasi ke parent task (jika ada sub-task)
    public function parent()
    {
        return $this->belongsTo(Task::class, 'parent_id');
    }

    // Relasi ke sub-tasks
    public function subtasks()
    {
        return $this->hasMany(Task::class, 'parent_id');
    }
}
