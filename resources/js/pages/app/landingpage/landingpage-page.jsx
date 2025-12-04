import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';

// --- IMPORT COMPONENT DIALOG ---
// Pastikan path ini sesuai dengan lokasi file Anda. 
// Jika file ada di folder Components, gunakan '@/Components/NamaFile'
import { LowonganDetailDialog } from './dialogs/lowongan-pekerjaan-detail-dialog'; 
import { CampusHiringDetailDialog } from './dialogs/campus-hiring-detail-dialog'; 
import { PerusahaanDetailDialog } from './dialogs/perusahaan-detail-dialog'; 

// Komponen Helper untuk Format Tanggal
const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    // if (includeTime) {
    //     options.hour = '2-digit';
    //     options.minute = '2-digit';
    // }
    return date.toLocaleDateString('id-ID', options).replace(/\./g, '/');
};

export default function LandingPage({ auth, banners, contentData, degreeOptions, state }) {
    // State lokal untuk input pencarian
    const [searchTerm, setSearchTerm] = useState(state.search || '');
    const [selectedDegree, setSelectedDegree] = useState(state.degree || 'All Degree');

    // State untuk Banner Slider
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

    // --- STATE UNTUK DIALOG (POP-UP) ---
    // 1. Lowongan
    const [isLowonganOpen, setIsLowonganOpen] = useState(false);
    const [selectedLowongan, setSelectedLowongan] = useState(null);

    // 2. Campus Hiring
    const [isCampusOpen, setIsCampusOpen] = useState(false);
    const [selectedCampus, setSelectedCampus] = useState(null);

    // 3. Perusahaan
    const [isCompanyOpen, setIsCompanyOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);


    // --- HANDLER FUNGSI PEMBUKA DIALOG ---
    const handleShowLowongan = (item) => {
        setSelectedLowongan(item);
        setIsLowonganOpen(true);
    };

    const handleShowCampus = (item) => {
        setSelectedCampus(item);
        setIsCampusOpen(true);
    };

    const handleShowCompany = (item) => {
        setSelectedCompany(item);
        setIsCompanyOpen(true);
    };


    // Auto Play Banner
    useEffect(() => {
        if (banners.length <= 1) return; 

        const interval = setInterval(() => {
            nextBanner();
        }, 5000); 

        return () => clearInterval(interval); 
    }, [currentBannerIndex, banners.length]);

    const nextBanner = () => {
        setCurrentBannerIndex((prevIndex) => 
            prevIndex === banners.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevBanner = () => {
        setCurrentBannerIndex((prevIndex) => 
            prevIndex === 0 ? banners.length - 1 : prevIndex - 1
        );
    };
    
    // Sinkronisasi state jika URL berubah
    useEffect(() => {
        setSearchTerm(state.search || '');
        setSelectedDegree(state.degree || 'All Degree');
    }, [state]);

    // Fungsi Handle Pencarian / Filter
    const handleSearch = () => {
        router.get('/', {
            tab: state.activeTab,
            search: searchTerm,
            degree: selectedDegree
        }, { 
            preserveState: true, 
            preserveScroll: true, 
            only: ['contentData', 'state'] 
        });
    };

    // Fungsi Ganti Tab
    const handleTabChange = (tabName) => {
        router.get('/', {
            tab: tabName,
            search: '', 
            degree: 'All Degree'
        }, { 
            preserveState: true,
            preserveScroll: true, 
            only: ['contentData', 'state'] 
        });
    };

    const isJobTab = state.activeTab === 'lowongan' || state.activeTab === 'campus-hiring';

    // Helper Title & Placeholder
    const getSearchTitle = () => {
        if (state.activeTab === 'perusahaan') return 'Cari Perusahaan';
        if (state.activeTab === 'campus-hiring') return 'Temukan Campus Hiring';
        return 'Temukan Lowongan Kerja';
    };

    const getSearchPlaceholder = () => {
        if (state.activeTab === 'perusahaan') return 'Masukkan Nama Perusahaan';
        if (state.activeTab === 'campus-hiring') return 'Masukkan Judul Campus Hiring';
        return 'Masukkan Judul Lowongan Kerja';
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-800">
            <Head title="Career Center IT Del" />

            {/* --- NAVBAR --- */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                {/* Bagian Atas: Logo & Sign In */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        {/* Logo */}
                        <div className="flex items-center gap-4">
                            <img 
                                src="/img/logo-del.png" 
                                alt="IT Del Logo" 
                                className="h-12 w-auto" 
                                onError={(e) => {
                                    e.target.onerror = null; // Mencegah looping jika link ini juga error
                                    e.target.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGGtqPUIDaG8AqC7G33BzvS2v3vXVNJrGebg&s';
                                }} 
                            />
                            <div className="hidden md:block leading-tight text-sm text-blue-600 font-bold uppercase tracking-wide">
                                Sistem Pusat Pengembangan <br /> Karir dan Hubungan Alumni
                            </div>
                        </div>

                        {/* Sign In Button */}
                        <div>
                            {auth ? (
                                <Link href="/dashboard" className="bg-[#2F65FF] text-white px-8 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition">
                                    Dashboard
                                </Link>
                            ) : (
                                <Link href={route('auth.login')} className="bg-[#2F65FF] text-white px-8 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition">
                                    Sign in
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bagian Bawah: Menu Biru */}
                <div className="bg-[#4285F4] w-full">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-center gap-8 py-3 overflow-x-auto whitespace-nowrap text-white text-sm font-semibold">
                            {['Home', 'Berita', 'Pengumuman', 'Daftar Perusahaan', 'Lowongan Pekerjaan', 'Campus Hiring', 'Tracer Study', 'User Survey'].map((item) => (
                                <a key={item} href="#" className="hover:text-blue-100 hover:underline transition">
                                    {item}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </nav>

            {/* --- HERO / BANNER SECTION --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {banners.length > 0 ? (
                    <div className="relative w-full aspect-[20/9] bg-blue-100 rounded-2xl overflow-hidden shadow-sm group">
                        
                        {/* TRACK SLIDER */}
                        <div 
                            className="flex h-full transition-transform duration-500 ease-out"
                            style={{ transform: `translateX(-${currentBannerIndex * 100}%)` }}
                        >
                            {banners.map((banner, index) => (
                                <div key={banner.id_banner || index} className="min-w-full h-full relative">
                                    <img 
                                        src={banner.url_gambar} 
                                        alt={banner.nama_banner} 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                        
                        {/* TOMBOL PREVIOUS */}
                        {banners.length > 1 && (
                            <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-blue-500/20 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button 
                                    onClick={prevBanner} 
                                    className="bg-white/30 hover:bg-white/50 p-2 rounded-full text-white backdrop-blur-sm transform hover:scale-110 transition"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                            </div>
                        )}

                        {/* TOMBOL NEXT */}
                        {banners.length > 1 && (
                            <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-blue-500/20 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <button 
                                    onClick={nextBanner} 
                                    className="bg-white/30 hover:bg-white/50 p-2 rounded-full text-white backdrop-blur-sm transform hover:scale-110 transition"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        )}

                        {/* INDIKATOR */}
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                            {banners.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentBannerIndex(idx)}
                                    className={`w-2 h-2 rounded-full transition-all shadow-sm ${
                                        idx === currentBannerIndex ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
                                    }`}
                                />
                            ))}
                        </div>

                    </div>
                ) : (
                    <div className="w-full h-64 bg-blue-400 rounded-2xl flex items-center justify-center text-white">
                        <span className="text-lg font-semibold">Selamat Datang di Career Center IT Del</span>
                    </div>
                )}

                <div className="text-center mt-8 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Temukan Karir Anda Di sini !</h2>
                </div>
            </div>

            {/* --- SEARCH BOX --- */}
            <div className="max-w-5xl mx-auto px-4 mb-10">
                <div className="bg-[#5c8bf5] rounded-lg p-6 shadow-lg">
                    <div className="mb-5">
                        <h3 className="text-white text-xl font-bold flex items-center gap-2 mb-3">
                            {getSearchTitle()}
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </h3>
                        <div className="w-full h-[1px] bg-blue-300/50"></div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-3">
                        {isJobTab && (
                            <div className="relative md:w-48">
                                <select 
                                    value={selectedDegree}
                                    onChange={(e) => setSelectedDegree(e.target.value)}
                                    className="w-full appearance-none px-4 py-3 rounded-lg border-none focus:ring-0 text-gray-800 font-medium bg-white cursor-pointer"
                                    style={{ backgroundImage: 'none' }}
                                >
                                    <option value="All Degree">All Degree</option>
                                    {degreeOptions.map(deg => (
                                        <option key={deg} value={deg}>{deg}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </div>
                            </div>
                        )}

                        <input 
                            type="text" 
                            placeholder={getSearchPlaceholder()}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 px-4 py-3 rounded-lg border-none focus:ring-0 placeholder-gray-400 text-gray-700 bg-white"
                        />

                        <button 
                            onClick={handleSearch}
                            className="bg-white text-[#5c8bf5] px-10 py-3 rounded-lg font-bold hover:bg-gray-100 transition shadow-sm"
                        >
                            Cari
                        </button>
                    </div>
                </div>
            </div>

            {/* --- TABS --- */}
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex gap-8 border-b border-gray-200 mb-8 overflow-x-auto">
                    {[
                        { id: 'lowongan', label: 'Lowongan Pekerjaan' },
                        { id: 'campus-hiring', label: 'Campus Hiring' },
                        { id: 'perusahaan', label: 'Perusahaan' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`pb-3 text-lg font-bold whitespace-nowrap transition-colors border-b-4 ${
                                state.activeTab === tab.id 
                                    ? 'border-blue-500 text-blue-600' 
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* --- CONTENT GRID --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    {contentData.data.length > 0 ? (
                        contentData.data.map((item) => {
                            // --- LOGIKA PERUSAHAAN ---
                            if (state.activeTab === 'perusahaan') {
                                return (
                                    <div key={item.id_perusahaan} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition flex items-start gap-4">
                                        <div className="w-16 h-16 flex-shrink-0 bg-gray-50 rounded-lg p-2 flex items-center justify-center border border-gray-100">
                                            <img 
                                                src={item.url_logo || '/images/default-company.png'} 
                                                alt={item.nama} 
                                                className="max-w-full max-h-full object-contain"
                                                onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=' + item.nama}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-blue-900 mb-1">{item.nama}</h3>
                                            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-medium mb-4">
                                                {item.total_jobs} Lowongan Kerja Tersedia
                                            </span>
                                            <div>
                                                {/* TOMBOL DETAIL PERUSAHAAN */}
                                                <button 
                                                    onClick={() => handleShowCompany(item)}
                                                    className="flex items-center gap-1 text-gray-500 border border-gray-300 px-3 py-1 rounded text-xs hover:bg-gray-50 transition"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    Detail
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            } else {
                                // --- LOGIKA LOWONGAN & CAMPUS HIRING ---
                                const title = item.nama_lowongan || item.nama_campus_hiring;
                                const isCampus = state.activeTab === 'campus-hiring';
                                
                                return (
                                    <div key={item.id_lowongan || item.id_campus_hiring} className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition relative">
                                        {isCampus && (
                                            <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] px-2 py-1 rounded-bl-lg font-bold">
                                                CAMPUS HIRING
                                            </span>
                                        )}
                                        <div className="flex items-start gap-4">
                                            <div className="w-14 h-14 flex-shrink-0">
                                                <img 
                                                    src={item.url_logo} 
                                                    alt={item.nama_perusahaan} 
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=' + item.nama_perusahaan}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-blue-900 leading-tight mb-1">{title}</h3>
                                                <div className="flex flex-wrap gap-2 mb-2 text-xs items-center">
                                                    <span className="text-gray-400">Looking for</span>
                                                    {Array.isArray(item.kualifikasi_pendidikan) && item.kualifikasi_pendidikan.map((edu, idx) => (
                                                        <span key={idx} className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-bold">
                                                            {edu}
                                                        </span>
                                                    ))}
                                                </div>
                                                <p className="text-gray-600 font-medium text-sm mb-3">{item.nama_perusahaan}</p>
                                                <div className="text-xs space-y-1 mb-4">
                                                    <div className="text-gray-500 font-semibold">
                                                        Posted <span className="text-gray-700">{formatDate(item.created_at, true)}</span>
                                                    </div>
                                                    <div className="text-red-500 font-bold">
                                                        Deadline {formatDate(item.batas_akhir, true)}
                                                    </div>
                                                </div>
                                                
                                                {/* TOMBOL DETAIL (LOWONGAN & CAMPUS) */}
                                                <button 
                                                    onClick={() => {
                                                        // Cek apakah tab saat ini campus hiring atau bukan
                                                        if (isCampus) {
                                                            handleShowCampus(item);
                                                        } else {
                                                            handleShowLowongan(item);
                                                        }
                                                    }}
                                                    className="flex items-center gap-1 text-gray-500 border border-gray-300 px-4 py-1.5 rounded text-xs font-medium hover:bg-gray-50 transition"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                    Detail
                                                </button>

                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        })
                    ) : (
                        <div className="col-span-1 md:col-span-2 text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500">Belum ada data yang tersedia untuk kategori ini.</p>
                        </div>
                    )}
                </div>

                {/* --- PAGINATION BUTTON --- */}
                {contentData.next_page_url && (
                    <div className="flex justify-center mb-16">
                        <Link 
                            href={contentData.next_page_url} 
                            only={['contentData']}
                            preserveState
                            preserveScroll
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition"
                        >
                            {state.activeTab === 'perusahaan' ? 'Perusahaan Lainnya' : 'Lowongan Kerja Lainnya'}
                        </Link>
                    </div>
                )}
            </div>
            
            <div className="h-10"></div>

            {/* --- RENDER 3 DIALOG BERBEDA DI SINI --- */}
            
            {/* 1. Dialog Lowongan */}
            <LowonganDetailDialog 
                openDialog={isLowonganOpen} 
                setOpenDialog={setIsLowonganOpen} 
                dataDetail={selectedLowongan} 
            />

            {/* 2. Dialog Campus Hiring */}
            <CampusHiringDetailDialog 
                openDialog={isCampusOpen} 
                setOpenDialog={setIsCampusOpen} 
                dataDetail={selectedCampus} 
                auth={auth}
            />

            {/* 3. Dialog Perusahaan */}
            <PerusahaanDetailDialog 
                openDialog={isCompanyOpen} 
                setOpenDialog={setIsCompanyOpen} 
                dataDetail={selectedCompany} 
            />

        </div>
    );
}