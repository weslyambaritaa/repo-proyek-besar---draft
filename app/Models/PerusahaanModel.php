<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property string $id_perusahaan
 * @property string $nama
 * @property string $lokasi
 * @property string $website
 * @property string $industri
 * @property string $deskripsi
 * @property string $url_logo
 */
class PerusahaanModel extends Model
{
    protected $table = 'm_perusahaan';

    protected $primaryKey = 'id_perusahaan';

    public $incrementing = false;

    protected $keyType = 'string';

    // [PERBAIKAN DISINI]
    // 1. Aktifkan timestamps agar created_at terisi otomatis
    public $timestamps = true;

    // 2. Beritahu Laravel bahwa tabel ini TIDAK punya kolom updated_at
    const UPDATED_AT = null;

    protected $fillable = [
        'id_perusahaan',
        'nama',
        'lokasi',
        'website',
        'industri',
        'deskripsi',
        'url_logo',
        // created_at tidak perlu dimasukkan ke fillable jika otomatis
    ];
}
