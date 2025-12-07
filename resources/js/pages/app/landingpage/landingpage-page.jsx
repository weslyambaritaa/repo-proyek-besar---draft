import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AUTH_TOKEN_KEY } from '@/lib/consts';

// --- PENTING: Import Toaster & toast langsung dari 'sonner' (Bukan dari components/ui) ---
import { Toaster, toast } from "sonner"; 

// --- IMPORT COMPONENT DIALOG ---
import { LowonganDetailDialog } from './dialogs/lowongan-pekerjaan-detail-dialog'; 
import { CampusHiringDetailDialog } from './dialogs/campus-hiring-detail-dialog'; 
import { PerusahaanDetailDialog } from './dialogs/perusahaan-detail-dialog'; 

// Helper Format Tanggal
const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    
    return date.toLocaleDateString('id-ID', options).replace(/\./g, '/');
};

// --- IKON HELPER ---
const EyeIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
);

// Ikon Sosmed untuk Footer
const InstagramIcon = ({ className }) => (
    <svg fill="currentColor" viewBox="0 0 24 24" className={className}><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
);
const FacebookIcon = ({ className }) => (
    <svg fill="currentColor" viewBox="0 0 24 24" className={className}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
);
const YoutubeIcon = ({ className }) => (
    <svg fill="currentColor" viewBox="0 0 24 24" className={className}><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
);
const XIcon = ({ className }) => (
    <svg fill="currentColor" viewBox="0 0 24 24" className={className}><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>
);


export default function LandingPage({ auth, banners, contentData, degreeOptions, state }) {
    // Ambil Flash Message dari Inertia
    const { flash } = usePage().props;

    // State Lokal
    const [searchTerm, setSearchTerm] = useState(state.search || '');
    const [selectedDegree, setSelectedDegree] = useState(state.degree || 'All Degree');
    const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

    // State Dialog
    const [isLowonganOpen, setIsLowonganOpen] = useState(false);
    const [selectedLowongan, setSelectedLowongan] = useState(null);
    const [isCampusOpen, setIsCampusOpen] = useState(false);
    const [selectedCampus, setSelectedCampus] = useState(null);
    const [isCompanyOpen, setIsCompanyOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);

    // --- FIX "DOUBLE TOAST": Gunakan ID Unik ---
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success, { id: 'flash-success' });
        }
        if (flash?.error) {
            toast.error(flash.error, { id: 'flash-error' });
        }
    }, [flash]);

    // Handler Dialog
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
    
    // Sync URL State
    useEffect(() => {
        setSearchTerm(state.search || '');
        setSelectedDegree(state.degree || 'All Degree');
    }, [state]);

    // Clear token if logged out
    useEffect(() => {
        if (!auth) {
            localStorage.removeItem(AUTH_TOKEN_KEY);
        }
    }, [auth]);

    // Navigasi & Filter
    const handleSearch = () => {
        router.get('/', {
            tab: state.activeTab,
            search: searchTerm,
            degree: selectedDegree
        }, { preserveState: true, preserveScroll: true, only: ['contentData', 'state'] });
    };

    const handleTabChange = (tabName) => {
        router.get('/', {
            tab: tabName,
            search: '', 
            degree: 'All Degree'
        }, { preserveState: true, preserveScroll: true, only: ['contentData', 'state'] });
    };

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
        <div className="min-h-screen bg-white font-sans text-slate-800 flex flex-col">
            <Head title="Career Center IT Del" />

            <Toaster richColors position="top-center" />

            {/* --- NAVBAR --- */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-4">
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

            {/* --- MAIN CONTENT --- */}
            <div className="flex-grow">
                {/* --- HERO / BANNER --- */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {banners.length > 0 ? (
                        <div className="relative w-full aspect-[21/9] bg-blue-100 rounded-2xl overflow-hidden shadow-sm group">
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

                {/* --- TABS & CONTENT --- */}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        {contentData.data.length > 0 ? (
                            contentData.data.slice(0, 6).map((item) => {
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

                    {/* --- LOAD MORE BUTTON --- */}
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
            </div>
            
            {/* --- FOOTER (BARU) --- */}
            <footer className="bg-[#1e293b] text-white pt-16 pb-8 border-t border-gray-700 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
                        {/* Kiri: Logo & Alamat */}
                        <div className="md:col-span-5 space-y-6">
                            <div className="mb-4">
                                <div className="w-24 h-24 bg-white/10 rounded-lg flex items-center justify-center mb-4">
                                     {/* Ganti src dengan path logo Anda yang sebenarnya */}
                                    <img src="/images/logo-del-white.png" alt="Logo IT Del" className="max-w-full p-2" onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentNode.innerHTML = '<span class="text-2xl font-bold">IT DEL</span>';
                                    }}/>
                                </div>
                                <div className="w-24 h-0.5 bg-gray-500 mb-4"></div>
                                <h4 className="text-xl font-bold mb-4">Institut Teknologi Del (IT Del)</h4>
                                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                                    Jl. Sisingamangaraja, Sitoluama,<br/>
                                    Laguboti, Toba Samosir 22381<br/>
                                    Sumatera Utara, Indonesia
                                </p>
                                <div className="space-y-2 text-sm text-gray-300">
                                    <p>
                                        <strong className="text-white">Customer Service</strong><br/>
                                        Phone & Fax: (+62-632) 331234<br/>
                                        Email: info@del.ac.id
                                    </p>
                                    <p>
                                        <strong className="text-white">Employer Service</strong><br/>
                                        Phone & Fax: (+62-632) 331234<br/>
                                        Email: karir@del.ac.id
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Tengah: Menu Links */}
                        <div className="md:col-span-4">
                             <h4 className="text-lg font-bold mb-6">MENU</h4>
                             <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="space-y-3">
                                    <a href="#" className="block text-gray-300 hover:text-white transition">Berita</a>
                                    <a href="#" className="block text-gray-300 hover:text-white transition">Pengumuman</a>
                                    <a href="#" className="block text-gray-300 hover:text-white transition">Daftar Perusahaan</a>
                                </div>
                                <div className="space-y-3">
                                    <a href="#" className="block text-gray-300 hover:text-white transition">Lowongan Pekerjaan</a>
                                    <a href="#" className="block text-gray-300 hover:text-white transition">Tracer Study</a>
                                    <a href="#" className="block text-gray-300 hover:text-white transition">User Survey</a>
                                </div>
                             </div>
                        </div>

                        {/* Kanan: Social Media */}
                        <div className="md:col-span-3">
                            <div className="bg-white rounded-2xl p-6 text-slate-900 shadow-lg">
                                <p className="font-bold text-sm mb-4">Temukan Juga Kami di Sosial Media</p>
                                <div className="flex items-center gap-4">
                                    <a href="#" className="bg-slate-900 text-white p-2 rounded-full hover:bg-slate-700 transition">
                                        <InstagramIcon className="w-5 h-5" />
                                    </a>
                                    <a href="#" className="bg-slate-900 text-white p-2 rounded-full hover:bg-slate-700 transition">
                                        <FacebookIcon className="w-5 h-5" />
                                    </a>
                                    <a href="#" className="bg-slate-900 text-white p-2 rounded-full hover:bg-slate-700 transition">
                                        <YoutubeIcon className="w-5 h-5" />
                                    </a>
                                    <a href="#" className="bg-slate-900 text-white p-2 rounded-full hover:bg-slate-700 transition">
                                        <XIcon className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-700 pt-8 text-center">
                        <p className="text-sm text-gray-400">© Pusat Pengembangan Karir dan Hubungan Alumni</p>
                    </div>
                </div>
            </footer>

            {/* --- DIALOGS --- */}
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