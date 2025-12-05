import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { AUTH_TOKEN_KEY } from '@/lib/consts';

// --- IMPORT COMPONENT DIALOG ---
// Pastikan path ini sesuai dengan lokasi file Anda.
import { LowonganDetailDialog } from './dialogs/lowongan-pekerjaan-detail-dialog'; 
import { CampusHiringDetailDialog } from './dialogs/campus-hiring-detail-dialog'; 
import { PerusahaanDetailDialog } from './dialogs/perusahaan-detail-dialog'; 

// Komponen Helper untuk Format Tanggal (Diaktifkan includeTime untuk jam)
const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    if (includeTime) {
       options.hour = '2-digit';
       options.minute = '2-digit';
    }
    return date.toLocaleDateString('id-ID', options).replace(/\./g, '/');
};

// Komponen Ikon Mata (Heroicons Outline)
const EyeIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

export default function LandingPage({ auth, banners, contentData, degreeOptions, state }) {
    // State lokal untuk input pencarian
    const [searchTerm, setSearchTerm] = useState(state.search || '');
    const [selectedDegree, setSelectedDegree] = useState(state.degree || 'All Degree');

    // State untuk Banner Slider
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

    // --- STATE UNTUK DIALOG (POP-UP) ---
    const [isLowonganOpen, setIsLowonganOpen] = useState(false);
    const [selectedLowongan, setSelectedLowongan] = useState(null);
    const [isCampusOpen, setIsCampusOpen] = useState(false);
    const [selectedCampus, setSelectedCampus] = useState(null);
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
        const interval = setInterval(() => { nextBanner(); }, 5000); 
        return () => clearInterval(interval); 
    }, [currentBannerIndex, banners.length]);

    const nextBanner = () => {
        setCurrentBannerIndex((prevIndex) => prevIndex === banners.length - 1 ? 0 : prevIndex + 1);
    };

    const prevBanner = () => {
        setCurrentBannerIndex((prevIndex) => prevIndex === 0 ? banners.length - 1 : prevIndex - 1);
    };
    
    // Sinkronisasi state jika URL berubah
    useEffect(() => {
        setSearchTerm(state.search || '');
        setSelectedDegree(state.degree || 'All Degree');
    }, [state]);

    useEffect(() => {
        if (!auth) {
            localStorage.removeItem(AUTH_TOKEN_KEY);
        }
    }, [auth]);

    // Fungsi Handle Pencarian / Filter
    const handleSearch = () => {
        router.get('/', {
            tab: state.activeTab,
            search: searchTerm,
            degree: selectedDegree
        }, { preserveState: true, preserveScroll: true, only: ['contentData', 'state'] });
    };

    // Fungsi Ganti Tab
    const handleTabChange = (tabName) => {
        router.get('/', {
            tab: tabName,
            search: '', 
            degree: 'All Degree'
        }, { preserveState: true, preserveScroll: true, only: ['contentData', 'state'] });
    };

    // Helper untuk Label Tombol Lainnya
    const getMoreButtonLabel = () => {
        if (state.activeTab === 'perusahaan') return 'Perusahaan Lainnya';
        if (state.activeTab === 'campus-hiring') return 'Campus Hiring Lainnya';
        return 'Lowongan Kerja Lainnya';
    };

    const isJobTab = state.activeTab === 'lowongan' || state.activeTab === 'campus-hiring';

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
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-4">
                            {/* Logo Placeholder */}
                            <div className="hidden md:block leading-tight text-sm text-blue-600 font-bold uppercase tracking-wide">
                                Sistem Pusat Pengembangan <br /> Karir dan Hubungan Alumni
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {auth ? (
                                <>
                                    <span className="hidden md:inline-block text-sm font-medium text-gray-600">
                                        Hi, {auth.nama}
                                    </span>
                                    {auth.akses && auth.akses.includes('Admin') ? (
                                        <Link href="/dashboard" className="bg-[#2F65FF] text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition">
                                            Dashboard
                                        </Link>
                                    ) : (
                                        <Link href={route('auth.logout')} className="bg-red-500 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-red-600 shadow-lg shadow-red-200 transition">
                                            Log Out
                                        </Link>
                                    )}
                                </>
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
                        
                        {/* Navigasi Banner (Prev/Next/Indicator) */}
                        {banners.length > 1 && (
                            <>
                             <button onClick={prevBanner} className="absolute left-0 top-0 bottom-0 w-16 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-black/20 text-white"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                             <button onClick={nextBanner} className="absolute right-0 top-0 bottom-0 w-16 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-l from-black/20 text-white"><svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                            </>
                        )}
                         <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                            {banners.map((_, idx) => (
                                <button key={idx} onClick={() => setCurrentBannerIndex(idx)} className={`w-2 h-2 rounded-full transition-all ${idx === currentBannerIndex ? 'bg-white w-6' : 'bg-white/50'}`} />
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
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
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
                                >
                                    <option value="All Degree">All Degree</option>
                                    {degreeOptions.map(deg => <option key={deg} value={deg}>{deg}</option>)}
                                </select>
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
            <div className="max-w-5xl mx-auto px-4">
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
                        /* MODIFIKASI: slice(0, 6) untuk membatasi tampilan maksimal 6 */
                        contentData.data.slice(0, 6).map((item) => {
                            // --- CARD PERUSAHAAN (SESUAI REF IMAGE 0) ---
                            if (state.activeTab === 'perusahaan') {
                                return (
                                    <div key={item.id_perusahaan} className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm hover:shadow-md transition flex items-start gap-6">
                                        <div className="w-28 h-28 flex-shrink-0 flex items-center justify-center">
                                            <img 
                                                src={item.url_logo || '/images/default-company.png'} 
                                                alt={item.nama} 
                                                className="max-w-full max-h-full object-contain"
                                                onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=' + item.nama}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold text-[#1F2937] mb-2">{item.nama}</h3>
                                            <span className="inline-block bg-[#FFF4CC] text-[#8A6D3B] text-sm px-4 py-1.5 rounded-full font-medium mb-6">
                                                {item.total_jobs} Lowongan Kerja Tersedia
                                            </span>
                                            <div>
                                                <button 
                                                    onClick={() => handleShowCompany(item)}
                                                    className="flex items-center gap-2 text-blue-600 border border-blue-600 px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition"
                                                >
                                                    <EyeIcon className="w-5 h-5" />
                                                    Detail
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            } else {
                                // --- CARD LOWONGAN & CAMPUS HIRING (SESUAI REF IMAGE 1) ---
                                const title = item.nama_lowongan || item.nama_campus_hiring;
                                const isCampus = state.activeTab === 'campus-hiring';
                                
                                return (
                                    <div key={item.id_lowongan || item.id_campus_hiring} className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm hover:shadow-md transition relative">
                                        {isCampus && (
                                            <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] px-3 py-1.5 rounded-bl-lg font-bold uppercase tracking-wider">
                                                CAMPUS HIRING
                                            </span>
                                        )}
                                        <div className="flex items-start gap-6">
                                            <div className="w-28 h-28 flex-shrink-0 flex items-center justify-center">
                                                <img 
                                                    src={item.url_logo} 
                                                    alt={item.nama_perusahaan} 
                                                    className="max-w-full max-h-full object-contain"
                                                    onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=' + item.nama_perusahaan}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-2xl font-bold text-[#1F2937] leading-tight mb-2">{title}</h3>
                                                <div className="flex flex-wrap gap-2 mb-2 text-sm items-center">
                                                    <span className="text-gray-500">Looking for</span>
                                                    {Array.isArray(item.kualifikasi_pendidikan) && item.kualifikasi_pendidikan.map((edu, idx) => (
                                                        <span key={idx} className="bg-[#FFF4CC] text-[#8A6D3B] px-3 py-1 rounded-full font-medium">
                                                            {edu}
                                                        </span>
                                                    ))}
                                                </div>
                                                <p className="text-[#4B5563] font-medium text-base mb-4">{item.nama_perusahaan}</p>
                                                
                                                <div className="text-sm space-y-1 mb-6">
                                                    <div className="text-[#1F2937] font-medium">
                                                        Posted <span className="font-bold">{formatDate(item.created_at, true)}</span>
                                                    </div>
                                                    <div className="text-[#DC2626] font-bold">
                                                        Deadline {formatDate(item.batas_akhir, true)}
                                                    </div>
                                                </div>
                                                
                                                <button 
                                                    onClick={() => {
                                                        if (isCampus) handleShowCampus(item);
                                                        else handleShowLowongan(item);
                                                    }}
                                                    className="flex items-center gap-2 text-blue-600 border border-blue-600 px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition"
                                                >
                                                    <EyeIcon className="w-5 h-5" />
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

                {/* --- TOMBOL "LAINNYA" (SESUAI REF IMAGE) --- */}
                {/* Tampilkan tombol jika ada next_page_url ATAU data lebih dari 6 */}
                {(contentData.next_page_url || contentData.data.length > 6) && (
                    <div className="flex justify-center mb-16">
                        <Link 
                            href={contentData.next_page_url || '#'} 
                            only={['contentData']}
                            preserveState
                            preserveScroll
                            className="bg-[#5885E6] hover:bg-blue-600 text-white font-bold text-lg py-4 px-12 rounded-full shadow-md transition duration-300 ease-in-out transform hover:-translate-y-1"
                        >
                            {getMoreButtonLabel()}
                        </Link>
                    </div>
                )}
            </div>
            
            <div className="h-10"></div>

            {/* --- RENDER 3 DIALOG BERBEDA --- */}
            <LowonganDetailDialog 
                openDialog={isLowonganOpen} 
                setOpenDialog={setIsLowonganOpen} 
                dataDetail={selectedLowongan} 
            />

            <CampusHiringDetailDialog 
                openDialog={isCampusOpen} 
                setOpenDialog={setIsCampusOpen} 
                dataDetail={selectedCampus} 
                auth={auth}
            />

            <PerusahaanDetailDialog 
                openDialog={isCompanyOpen} 
                setOpenDialog={setIsCompanyOpen} 
                dataDetail={selectedCompany} 
            />

        </div>
    );
}