<?php

use App\Http\Controllers\App\Banner\BannerController;
use App\Http\Controllers\App\CampusHiring\CampusHiringController;
use App\Http\Controllers\App\HakAkses\HakAksesController;
use App\Http\Controllers\App\Home\HomeController; // Pastikan ini diimport
use App\Http\Controllers\App\Landingpage\LandingpageController;
use App\Http\Controllers\App\LowonganPekerjaan\LowonganPekerjaanController;
use App\Http\Controllers\App\Perusahaan\PerusahaanController;
use App\Http\Controllers\App\Todo\TodoController;
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

Route::middleware(['throttle:req-limit', 'handle.inertia'])->group(function () {

    // [PERBAIKAN] Ubah nama route menjadi 'landing.index' agar sesuai dengan AuthController
    Route::get('/', [LandingpageController::class, 'index'])->name('landing.index');

    // SSO Routes
    Route::group(['prefix' => 'sso'], function () {
        Route::get('/callback', [AuthController::class, 'ssoCallback'])->name('sso.callback');
    });

    // Authentication Routes
    Route::prefix('auth')->group(function () {
        // Login Routes
        Route::get('/login', [AuthController::class, 'login'])->name('auth.login');
        Route::post('/login-check', [AuthController::class, 'postLoginCheck'])->name('auth.login-check');
        Route::post('/login-post', [AuthController::class, 'postLogin'])->name('auth.login-post');

        // Logout Route
        Route::get('/logout', [AuthController::class, 'logout'])->name('auth.logout');

        // TOTP Routes
        Route::get('/totp', [AuthController::class, 'totp'])->name('auth.totp');
        Route::post('/totp-post', [AuthController::class, 'postTotp'])->name('auth.totp-post');
    });

    // Protected Routes
    Route::group(['middleware' => 'check.auth'], function () {
        // Route untuk Dashboard Admin (Pastikan nama route 'home' ada)
        Route::get('/dashboard', [HomeController::class, 'index'])->name('home');

        // Hak Akses Routes
        Route::prefix('hak-akses')->group(function () {
            Route::get('/', [HakAksesController::class, 'index'])->name('hak-akses');
            Route::post('/change', [HakAksesController::class, 'postChange'])->name('hak-akses.change-post');
            Route::post('/delete', [HakAksesController::class, 'postDelete'])->name('hak-akses.delete-post');
            Route::post('/delete-selected', [HakAksesController::class, 'postDeleteSelected'])->name('hak-akses.delete-selected-post');
        });

        // Todo Routes
        Route::prefix('todo')->group(function () {
            Route::get('/', [TodoController::class, 'index'])->name('todo');
            Route::post('/change', [TodoController::class, 'postChange'])->name('todo.change-post');
            Route::post('/delete', [TodoController::class, 'postDelete'])->name('todo.delete-post');
        });

        // Perusahaan Routes
        Route::prefix('perusahaan')->group(function () {
            Route::get('/', [PerusahaanController::class, 'index'])->name('perusahaan');
            Route::post('/change', [PerusahaanController::class, 'postChange'])->name('perusahaan.change-post');
            Route::post('/delete', [PerusahaanController::class, 'postDelete'])->name('perusahaan.delete-post');
        });

        // Lowongan Pekerjaan Routes
        Route::prefix('lowongan-pekerjaan')->group(function () {
            Route::get('/', [LowonganPekerjaanController::class, 'index'])->name('lowongan-pekerjaan');
            Route::post('/change', [LowonganPekerjaanController::class, 'postChange'])->name('lowongan-pekerjaan.change-post');
            Route::post('/delete', [LowonganPekerjaanController::class, 'postDelete'])->name('lowongan-pekerjaan.delete-post');
        });

        // Campus Hiring Routes
        Route::prefix('campus-hiring')->group(function () {
            Route::get('/', [CampusHiringController::class, 'index'])->name('campus-hiring');
            Route::post('/change', [CampusHiringController::class, 'postChange'])->name('campus-hiring.change-post');
            Route::post('/delete', [CampusHiringController::class, 'postDelete'])->name('campus-hiring.delete-post');
        });

        // Banner Routes
        Route::prefix('banner')->group(function () {
            Route::get('/', [BannerController::class, 'index'])->name('banner');
            Route::post('/change', [BannerController::class, 'postChange'])->name('banner.change-post');
            Route::post('/delete', [BannerController::class, 'postDelete'])->name('banner.delete-post');
        });
    });
});