<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Position extends Model
{
    protected $table = 'positions'; // pastikan nama tabel benar

    protected $fillable = [
        'title',
        'description',
    ];

    // Relasi ke User
    public function users()
    {
        return $this->hasMany(User::class, 'position_id');
    }
}
