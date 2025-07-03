<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    protected $table = 'modules';

    protected $fillable = [
        'title',
        'description',
        'parent_id',
        'application_id',
        'created_by',
    ];

    // Relasi ke parent module (jika ada sub-module)
    public function parent()
    {
        return $this->belongsTo(Module::class, 'parent_id');
    }

    // Relasi ke sub-modules
    public function children()
    {
        return $this->hasMany(Module::class, 'parent_id');
    }

    // Relasi ke Application
    public function application()
    {
        return $this->belongsTo(Application::class, 'application_id');
    }

    // Relasi ke User (pembuat module)
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Relasi ke Task
    public function tasks()
    {
        return $this->hasMany(Task::class, 'module_id');
    }
}
