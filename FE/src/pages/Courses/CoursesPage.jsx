import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import CourseCard from '../../components/CourseCard/CourseCard';
import Loading from '../../components/Loading/Loading';
import { toast } from 'react-toastify';
import { Filter, Search } from 'react-feather';

export default function CoursesPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [levelFilter, setLevelFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 9; // Jumlah item per halaman

    // Kategori dan level bisa diambil dari API jika dinamis
    const categories = ["Teknologi", "Bisnis", "Desain", "Pemasaran", "Pengembangan Diri", "Keterampilan Kerja"]; // Contoh
    const levels = [
        { value: "beginner", label: "Pemula" },
        { value: "intermediate", label: "Menengah" },
        { value: "advanced", label: "Mahir" },
        { value: "all", label: "Semua Level"}
    ];

    const fetchCourses = async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                limit,
                search: searchTerm,
                category: categoryFilter,
                level: levelFilter,
            };
            // Hapus parameter kosong
            Object.keys(params).forEach(key => (params[key] === '' || params[key] === null) && delete params[key]);

            const response = await apiClient.get('/courses', { params });
            if (response.data.success) {
                setCourses(response.data.payload.data || []);
                setTotalPages(response.data.payload.totalPages || 1);
                setTotalItems(response.data.payload.totalItems || 0);
                setCurrentPage(response.data.payload.page || 1);
            } else {
                toast.error("Gagal memuat daftar pelatihan.");
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
            toast.error("Terjadi kesalahan saat memuat pelatihan.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses(currentPage);
    }, [currentPage]); // Hanya fetch ulang saat currentPage berubah

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1); // Reset ke halaman pertama saat filter/search baru
        fetchCourses(1);
    };
    
    const handleResetFilters = () => {
        setSearchTerm('');
        setCategoryFilter('');
        setLevelFilter('');
        setCurrentPage(1);
        fetchCourses(1); // Fetch dengan filter reset
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-gray-800">Temukan Pelatihan Terbaik</h1>
                <p className="text-gray-600 mt-2">Jelajahi berbagai kursus untuk meningkatkan keterampilan Anda.</p>
            </header>

            {/* Filter dan Search Bar */}
            <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <label htmlFor="searchCourse" className="block text-sm font-medium text-gray-700 mb-1">Cari Pelatihan</label>
                        <div className="relative">
                            <input
                                type="text"
                                id="searchCourse"
                                className="input-field pr-10"
                                placeholder="Ketik judul, deskripsi..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                        <select id="categoryFilter" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input-field">
                            <option value="">Semua Kategori</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="levelFilter" className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                        <select id="levelFilter" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="input-field">
                            <option value="">Semua Level</option>
                            {levels.map(lvl => <option key={lvl.value} value={lvl.value}>{lvl.label}</option>)}
                        </select>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 lg:col-span-1 md:col-span-2">
                        <button type="submit" className="btn btn-primary w-full sm:w-auto flex-grow">
                            <Filter size={18} className="mr-2 inline" /> Terapkan
                        </button>
                         <button type="button" onClick={handleResetFilters} className="btn btn-secondary w-full sm:w-auto">
                            Reset
                        </button>
                    </div>
                </form>
            </div>

            {loading ? (
                <Loading />
            ) : courses.length > 0 ? (
                <>
                    <p className="text-sm text-gray-500 mb-4 text-center md:text-left">Menampilkan {courses.length} dari {totalItems} pelatihan.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map(course => (
                            <CourseCard key={course.course_id} course={course} />
                        ))}
                    </div>
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex justify-center items-center space-x-2">
                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="btn btn-secondary px-3 py-1 text-sm disabled:opacity-50">Sebelumnya</button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                 .filter(pageNumber => // Logic to show limited page numbers
                                    pageNumber === 1 ||
                                    pageNumber === totalPages ||
                                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                )
                                .map((pageNumber, index, arr) => (
                                <React.Fragment key={pageNumber}>
                                     {index > 0 && arr[index-1] + 1 !== pageNumber && <span className="px-1">...</span>}
                                    <button
                                        onClick={() => handlePageChange(pageNumber)}
                                        className={`px-3 py-1 rounded-md text-sm ${currentPage === pageNumber ? 'btn-primary' : 'btn-secondary hover:bg-gray-300'}`}
                                    >
                                        {pageNumber}
                                    </button>
                                </React.Fragment>
                            ))}
                            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="btn btn-secondary px-3 py-1 text-sm disabled:opacity-50">Berikutnya</button>
                        </div>
                    )}
                </>
            ) : (
                <p className="text-center text-gray-500 py-10">
                    Tidak ada pelatihan yang sesuai dengan kriteria pencarian Anda.
                </p>
            )}
        </div>
    );
}