<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $table = 'projects';

    protected $fillable = [
        'title',
        'description',
        'status',
        'division_id',
        'start_date',
        'due_date',
        'completed_date',
        'nilai', // tambahkan ini
    ];

    public function division()
    {
        return $this->belongsTo(Division::class, 'division_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function applications()
    {
        return $this->hasMany(Application::class, 'project_id');
    }
    public function tasks()
    {
        return $this->hasManyThrough(
            Task::class,
            Application::class,
            'project_id', // Foreign key on applications table
            'application_id', // Foreign key on tasks table
            'id', // Local key on projects table
            'id' // Local key on applications table
        );
    }
}
