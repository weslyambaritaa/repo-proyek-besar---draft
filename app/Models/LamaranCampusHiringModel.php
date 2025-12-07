<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class LamaranCampusHiringModel extends Model
{
    use HasFactory;

    protected $table = 't_lamaran_campus_hiring';
    protected $primaryKey = 'id_lamaran';
    public $incrementing = false;
    protected $keyType = 'string';

    const CREATED_AT = 'tanggal_lamaran';
    const UPDATED_AT = null;

    protected $fillable = [
        'id_lamaran',
        'id_campus_hiring',
        'user_id',
        'nama_pelamar', // <--- WAJIB ADA
        'url_cv',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id_lamaran)) {
                $model->id_lamaran = (string) Str::uuid();
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}