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
        'team_id',
        'start_date',
        'due_date',
        'completed_date',
    ];

    public function division()
    {
        return $this->belongsTo(Division::class, 'division_id');
    }

    public function team()
    {
        return $this->belongsTo(Team::class, 'team_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function applications()
    {
        return $this->hasMany(Application::class, 'project_id');
    }
}
