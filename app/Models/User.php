<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'nik',
        'status',
        'type',
        'position_id',
        'division_id',
        'join_date',
        'created_by',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'join_date' => 'date',
    ];

    // Relasi ke Position
    public function position()
    {
        return $this->belongsTo(Position::class, 'position_id');
    }

    // Relasi ke Division
    public function division()
    {
        return $this->belongsTo(Division::class);
    }

    // Relasi ke Task (task yang di-assign ke user ini)
    public function tasks()
    {
        return $this->hasMany(Task::class, 'assigned_to_user_id');
    }

    // Relasi ke Project (jika user adalah creator project)
    public function createdProjects()
    {
        return $this->hasMany(Project::class, 'created_by');
    }

    // Relasi ke Team (jika ada relasi user-team melalui tabel pivot)
    public function teams()
    {
        return $this->belongsToMany(Team::class, 'team_members', 'user_id', 'team_id');
    }
}
