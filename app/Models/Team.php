<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    protected $table = 'teams';

    protected $fillable = [
        'title',
        'description',
        'division_id',
        'created_by',
    ];

    // Relasi ke Division
    public function division()
    {
        return $this->belongsTo(Division::class, 'division_id');
    }

    // Relasi ke anggota tim (TeamMember, jika ada tabel team_members)
    public function members()
    {
        return $this->hasMany(TeamMember::class, 'team_id');
    }

    // Relasi ke User melalui tabel pivot team_members (many-to-many)
    public function users()
    {
        return $this->belongsToMany(User::class, 'team_members', 'team_id', 'user_id');
    }

    // Relasi ke User yang membuat tim
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Relasi ke Application
    public function applications()
    {
        return $this->hasMany(Application::class, 'project_id');
    }
}
