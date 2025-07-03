<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Division extends Model
{
    protected $table = 'divisions';

    protected $fillable = [
        'title',
        'description',
        'parent_id',
    ];

    // Relasi ke User
    public function users()
    {
        return $this->hasMany(User::class, 'division_id');
    }

    // Relasi parent division (atasan)
    public function parent()
    {
        return $this->belongsTo(Division::class, 'parent_id');
    }

    // Relasi child divisions (bawahan)
    public function children()
    {
        return $this->hasMany(Division::class, 'parent_id');
    }
}
