<?php

namespace App\Http\Controllers\App\CampusHiring;

use App\Helper\ConstHelper;
use App\Helper\ToolsHelper;
use App\Http\Controllers\Controller;
use App\Models\CampusHiringModel;
use App\Models\PerusahaanModel;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CampusHiringController extends Controller
{
    public function index(Request $request)
    {
        $auth = $request->attributes->get('auth');
        $isEditor = $this->checkIsEditor($auth);
        $search = $request->query('search', '');
        $page = $request->query('page', 1);
        $perPage = $request->query('perPage', 5);

        if ($perPage <= 0) {
            $perPage = 5;
        }

        $perPageOptions = ConstHelper::OPTION_ROWS_PER_PAGE;

        $campusHiringList = CampusHiringModel::query()
            ->where('id_admin_pembuat', $auth->id)
            ->when($search, function ($query) use ($search) {
                $lower = strtolower($search);
                $query->where(function ($q) use ($lower) {
                    // Perubahan kolom pencarian sesuai Model baru
                    $q->whereRaw('LOWER(nama_campus_hiring) LIKE ?', ["%{$lower}%"])
                        ->orWhereRaw('LOWER(deskripsi) LIKE ?', ["%{$lower}%"])
                        ->orWhereRaw('LOWER(departemen) LIKE ?', ["%{$lower}%"]);
                });
            })
            ->orderByDesc('created_at')
            ->paginate($perPage);

        // Path view disesuaikan (folder: app/campus-hiring)
        return Inertia::render('app/campus-hiring/campus-hiring-page', [
            'campusHiringList' => fn () => $campusHiringList,
            'perusahaanList' => PerusahaanModel::all(),

            // Mengambil opsi statis dari CampusHiringModel
            'jenisLowonganList' => CampusHiringModel::getJenisOptions(),

            'pageName' => Inertia::always('Daftar Campus Hiring'),
            'auth' => Inertia::always($auth),
            'isEditor' => Inertia::always($isEditor),
            'search' => Inertia::always($search),
            'page' => Inertia::always($page),
            'perPage' => Inertia::always($perPage),
            'perPageOptions' => Inertia::always($perPageOptions),
        ]);
    }

    public function postChange(Request $request)
    {
        $auth = $request->attributes->get('auth');
        $isEditor = $this->checkIsEditor($auth);

        if (! $isEditor) {
            return back()->with('error', 'Anda tidak memiliki izin untuk mengolah data Campus Hiring.');
        }

        // Ambil daftar opsi valid dari Model
        $validJenis = CampusHiringModel::getJenisOptions();

        $request->validate([
            'id_perusahaan' => 'required|string',

            // Validasi jenis lowongan
            'jenis_lowongan' => ['required', 'string', Rule::in($validJenis)],

            // Perubahan nama kolom validasi
            'nama_campus_hiring' => 'required|string|max:255',

            'departemen' => 'nullable|string|max:100',
            'deskripsi' => 'nullable|string',
            'kualifikasi' => 'nullable|string',
            'benefit' => 'nullable|string',
            'kualifikasi_pendidikan' => 'nullable|array',
            'batas_akhir' => 'nullable|date',
            // 'link_pendaftaran' dihapus
        ]);

        // --- UPDATE MODE ---
        // Menggunakan id_campus_hiring
        if (isset($request->id_campus_hiring) && ! empty($request->id_campus_hiring)) {
            $campusHiring = CampusHiringModel::where('id_campus_hiring', $request->id_campus_hiring)
                ->where('id_admin_pembuat', $auth->id)
                ->first();

            if (! $campusHiring) {
                return back()->with('error', 'Data tidak ditemukan atau Anda tidak memiliki akses.');
            }

            $campusHiring->id_perusahaan = $request->id_perusahaan;
            $campusHiring->jenis_lowongan = $request->jenis_lowongan;
            $campusHiring->nama_campus_hiring = $request->nama_campus_hiring; // Update kolom nama
            $campusHiring->departemen = $request->departemen;
            $campusHiring->deskripsi = $request->deskripsi;
            $campusHiring->kualifikasi = $request->kualifikasi;
            $campusHiring->benefit = $request->benefit;
            $campusHiring->kualifikasi_pendidikan = $request->kualifikasi_pendidikan;
            $campusHiring->batas_akhir = $request->batas_akhir;

            $campusHiring->save();

            return back()->with('success', 'Campus Hiring berhasil diperbarui.');
        }

        // --- CREATE MODE ---
        CampusHiringModel::create([
            'id_perusahaan' => $request->id_perusahaan,
            'id_admin_pembuat' => $auth->id,
            'jenis_lowongan' => $request->jenis_lowongan,
            'nama_campus_hiring' => $request->nama_campus_hiring, // Create kolom nama
            'departemen' => $request->departemen,
            'deskripsi' => $request->deskripsi,
            'kualifikasi' => $request->kualifikasi,
            'benefit' => $request->benefit,
            'kualifikasi_pendidikan' => $request->kualifikasi_pendidikan,
            'batas_akhir' => $request->batas_akhir,
        ]);

        return back()->with('success', 'Campus Hiring berhasil ditambahkan.');
    }

    public function postDelete(Request $request)
    {
        $auth = $request->attributes->get('auth');
        $isEditor = $this->checkIsEditor($auth);

        if (! $isEditor) {
            return back()->with('error', 'Anda tidak memiliki izin untuk mengolah data Campus Hiring.');
        }

        $request->validate([
            'ids_campus_hiring' => 'required|array', // Perubahan nama parameter
        ]);

        CampusHiringModel::whereIn('id_campus_hiring', $request->ids_campus_hiring)
            ->where('id_admin_pembuat', $auth->id)
            ->delete();

        return back()->with('success', 'Data Campus Hiring yang dipilih berhasil dihapus.');
    }

    private function checkIsEditor($auth)
    {
        // Sesuaikan string role dengan ConstHelper yang baru
        return ToolsHelper::checkRoles('Campus Hiring', $auth->akses);
    }
}
