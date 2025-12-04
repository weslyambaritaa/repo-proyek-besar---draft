<?php

namespace App\Http\Controllers\App\Landingpage;

use App\Http\Controllers\Controller;
use App\Models\BannerModel;
use App\Models\CampusHiringModel;
use App\Models\LowonganPekerjaanModel;
use App\Models\PerusahaanModel;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LandingpageController extends Controller
{
    /**
     * Menangani halaman utama Landing Page (Public Access)
     */
    public function index(Request $request)
    {
        // 1. AUTH CHECK (PUBLIC MODE)
        $auth = $request->attributes->get('auth');

        $authData = $auth ? [
            'id'       => $auth->id,
            'nama'     => $auth->name,            // Sesuai dump: field "name"
            'username' => $auth->username,
            'role'     => $auth->alias ?? 'user', // Sesuai dump: field "alias" ("Mahasiswa") cocok untuk role
            'akses'    => $auth->akses ?? [],     // Sesuai dump: array akses yang sudah di-explode di middleware
            'photo'    => $auth->photo ?? null,   // Opsional: ditambahkan karena tersedia di dump
        ] : null;

        // 2. PARAMETER FILTER
        $activeTab = $request->query('tab', 'lowongan');
        $search = $request->query('search', '');
        $degree = $request->query('degree', 'All Degree'); 

        // 3. LOAD BANNER
        $banners = BannerModel::where('shown', true)
            ->orderBy('urutan', 'asc')
            ->get();

        

        // 4. DATA KONTEN
        $contentData = null;
        $degreeOptions = ['D3', 'D4', 'S1', 'S2', 'S3'];
        $toleranceDate = Carbon::now()->subDays(3);

        switch ($activeTab) {
            case 'campus-hiring':
                $query = CampusHiringModel::query();
                
                $query->join('m_perusahaan', 't_campus_hiring.id_perusahaan', '=', 'm_perusahaan.id_perusahaan')
                      ->select(
                          't_campus_hiring.*', 
                          'm_perusahaan.nama as nama_perusahaan', 
                          'm_perusahaan.url_logo', 
                          'm_perusahaan.lokasi'
                      );

                if ($search) {
                    $query->where(function($q) use ($search) {
                        $q->where('t_campus_hiring.nama_campus_hiring', 'LIKE', "%{$search}%")
                          ->orWhere('m_perusahaan.nama', 'LIKE', "%{$search}%");
                    });
                }

                if ($degree !== 'All Degree' && in_array($degree, $degreeOptions)) {
                    $query->whereJsonContains('t_campus_hiring.kualifikasi_pendidikan', $degree);
                }

                $query->whereDate('t_campus_hiring.batas_akhir', '>=', $toleranceDate);

                $contentData = $query->orderBy('t_campus_hiring.created_at', 'desc')
                                     ->paginate(9)
                                     ->withQueryString();
                break;

            case 'perusahaan':
                $query = PerusahaanModel::query();

                if ($search) {
                    $query->where('nama', 'LIKE', "%{$search}%");
                }

                $companies = $query->orderBy('nama', 'asc')
                                   ->paginate(9)
                                   ->withQueryString();

                $companies->getCollection()->transform(function ($company) use ($toleranceDate) {
                    $countLowongan = LowonganPekerjaanModel::where('id_perusahaan', $company->id_perusahaan)
                        ->whereDate('batas_akhir', '>=', $toleranceDate)
                        ->count();
                    
                    $countCampus = CampusHiringModel::where('id_perusahaan', $company->id_perusahaan)
                        ->whereDate('batas_akhir', '>=', $toleranceDate)
                        ->count();

                    $company->total_jobs = $countLowongan + $countCampus;
                    return $company;
                });

                $contentData = $companies;
                break;

            case 'lowongan': 
            default:
                $query = LowonganPekerjaanModel::query();

                $query->join('m_perusahaan', 't_lowongan_pekerjaan.id_perusahaan', '=', 'm_perusahaan.id_perusahaan')
                      ->select(
                          't_lowongan_pekerjaan.*', 
                          'm_perusahaan.nama as nama_perusahaan', 
                          'm_perusahaan.url_logo', 
                          'm_perusahaan.lokasi'
                      );

                if ($search) {
                    $query->where(function($q) use ($search) {
                        $q->where('t_lowongan_pekerjaan.nama_lowongan', 'LIKE', "%{$search}%")
                          ->orWhere('m_perusahaan.nama', 'LIKE', "%{$search}%");
                    });
                }

                if ($degree !== 'All Degree' && in_array($degree, $degreeOptions)) {
                    $query->whereJsonContains('t_lowongan_pekerjaan.kualifikasi_pendidikan', $degree);
                }

                $query->whereDate('t_lowongan_pekerjaan.batas_akhir', '>=', $toleranceDate);

                $contentData = $query->orderBy('t_lowongan_pekerjaan.created_at', 'desc')
                                     ->paginate(9)
                                     ->withQueryString();
                break;
        }

        // Return Inertia Render
        return Inertia::render('app/landingpage/landingpage-page', [
            'auth' => $authData,
            'banners' => $banners,
            'degreeOptions' => $degreeOptions,
            'state' => [
                'activeTab' => $activeTab,
                'search' => $search,
                'degree' => $degree,
            ],
            'contentData' => $contentData,
        ]);
    }
}