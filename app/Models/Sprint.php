<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Sprint extends Model
{
    protected $table = 'sprints';

    protected $fillable = [
        'title',
        'description',
        'status',
        'team_id',
        'start_date',
        'due_date',
        'completed_date',
        'created_by',
    ];

    // Relasi ke Team
    public function team()
    {
        return $this->belongsTo(Team::class, 'team_id');
    }

    // Relasi ke User (pembuat sprint)
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
