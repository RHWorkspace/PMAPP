<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    protected $table = 'applications';

    protected $fillable = [
        'title',
        'description',
        'status',
        'project_id',
        'team_id',
        'start_date',
        'due_date',
        'completed_date',
        'created_by',
    ];

    // Relasi ke Project
    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    // Relasi ke Team
    public function team()
    {
        return $this->belongsTo(Team::class, 'team_id');
    }

    // Relasi ke User (pembuat aplikasi)
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Relasi ke Module
    public function modules()
    {
        return $this->hasMany(Module::class, 'application_id');
    }

    // Relasi ke Task
    public function tasks()
    {
        return $this->hasMany(Task::class, 'application_id');
    }
}
