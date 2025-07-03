<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TeamMember extends Model
{
    protected $fillable = [
        'team_id',
        'user_id',
        'role',
        'status',
        'created_by',
    ];

    // Relasi ke User
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Relasi ke Team
    public function team()
    {
        return $this->belongsTo(Team::class, 'team_id');
    }

    // Relasi ke User yang membuat (created_by)
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
