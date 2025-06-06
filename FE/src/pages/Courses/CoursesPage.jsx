import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../services/api';
import CourseCard from '../../components/CourseCard/CourseCard';
import Loading from '../../components/Loading/Loading';
import { toast } from 'react-toastify';
import { Filter, Search } from 'react-feather';
import ReadableText from '../../components/ReadableText/ReadableText';

export default function CoursesPage() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [levelFilter, setLevelFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 9;

    const categories = ["Teknologi", "Bisnis", "Desain", "Pemasaran", "Pengembangan Diri", "Keterampilan Kerja"];
    const levels = [
        { value: "beginner", label: "Pemula" },
        { value: "intermediate", label: "Menengah" },
        { value: "advanced", label: "Mahir" },
        { value: "all", label: "Semua Level"}
    ];

    const fetchCourses = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                limit,
                search: searchTerm,
                category: categoryFilter,
                level: levelFilter,
            };
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
    }, [searchTerm, categoryFilter, levelFilter, limit]);

    useEffect(() => {
        fetchCourses(currentPage);
    }, [currentPage, fetchCourses]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchCourses(1);
    };
    
    const handleResetFilters = () => {
        setSearchTerm('');
        setCategoryFilter('');
        setLevelFilter('');
        setCurrentPage(1);
        fetchCourses(1);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="container mx-auto p-4 md:p-8">
                <header className="mb-8 text-center">
                    <ReadableText tag="h1" className="text-4xl font-bold text-gray-800">
                        Temukan Pelatihan Terbaik
                    </ReadableText>
                    <ReadableText tag="p" className="text-gray-600 mt-2">
                        Jelajahi berbagai kursus untuk meningkatkan keterampilan Anda.
                    </ReadableText>
                </header>

                {/* Filter dan Search Bar */}
                <div className="mb-8 p-6 bg-white rounded-lg shadow-md border border-blue-100">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div>
                            <ReadableText tag="label" htmlFor="searchCourse" className="block text-sm font-medium text-gray-700 mb-1">
                                Cari Pelatihan
                            </ReadableText>
                            <div className="relative">
                                <input
                                    type="text"
                                    id="searchCourse"
                                    className="block w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
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
                            <ReadableText tag="label" htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 mb-1">
                                Kategori
                            </ReadableText>
                            <select 
                                id="categoryFilter" 
                                value={categoryFilter} 
                                onChange={(e) => setCategoryFilter(e.target.value)} 
                                className="block w-full px-3 py-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
                            >
                                <option value="">Semua Kategori</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <ReadableText tag="label" htmlFor="levelFilter" className="block text-sm font-medium text-gray-700 mb-1">
                                Level
                            </ReadableText>
                            <select 
                                id="levelFilter" 
                                value={levelFilter} 
                                onChange={(e) => setLevelFilter(e.target.value)} 
                                className="block w-full px-3 py-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
                            >
                                <option value="">Semua Level</option>
                                {levels.map(lvl => <option key={lvl.value} value={lvl.value}>{lvl.label}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 lg:col-span-1 md:col-span-2">
                            <ReadableText
                                tag="button"
                                type="submit"
                                className="w-full sm:w-auto flex-grow inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm hover:shadow-md"
                                textToRead="Tombol Terapkan Filter"
                            >
                                <Filter size={18} className="mr-2" /> Terapkan
                            </ReadableText>
                            <ReadableText
                                tag="button"
                                type="button"
                                onClick={handleResetFilters}
                                className="w-full sm:w-auto px-4 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                textToRead="Tombol Reset Filter"
                            >
                                Reset
                            </ReadableText>
                        </div>
                    </form>
                </div>

                {loading ? (
                    <Loading />
                ) : courses.length > 0 ? (
                    <>
                        <ReadableText tag="p" className="text-sm text-gray-500 mb-4 text-center md:text-left">
                            Menampilkan {courses.length} dari {totalItems} pelatihan.
                        </ReadableText>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {courses.map(course => (
                                <CourseCard key={course.course_id} course={course} />
                            ))}
                        </div>
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex justify-center items-center space-x-2">
                                <ReadableText
                                    tag="button"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="py-2 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                    textToRead="Tombol Halaman Sebelumnya"
                                >
                                    Sebelumnya
                                </ReadableText>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                     .filter(pageNumber =>
                                        pageNumber === 1 ||
                                        pageNumber === totalPages ||
                                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                    )
                                    .map((pageNumber, index, arr) => (
                                    <React.Fragment key={pageNumber}>
                                         {index > 0 && arr[index-1] + 1 !== pageNumber && <span className="px-1">...</span>}
                                        <ReadableText
                                            tag="button"
                                            onClick={() => handlePageChange(pageNumber)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                                currentPage === pageNumber 
                                                    ? 'bg-blue-600 text-white border border-blue-600' 
                                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                            }`}
                                            textToRead={`Tombol Halaman ${pageNumber}`}
                                        >
                                            {pageNumber}
                                        </ReadableText>
                                    </React.Fragment>
                                ))}
                                <ReadableText
                                    tag="button"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="py-2 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                    textToRead="Tombol Halaman Berikutnya"
                                >
                                    Berikutnya
                                </ReadableText>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20">
                        <div className="bg-white rounded-lg shadow-md border border-blue-100 p-8 max-w-md mx-auto">
                            <ReadableText tag="p" className="text-gray-500 text-lg">
                                Tidak ada pelatihan yang sesuai dengan kriteria pencarian Anda.
                            </ReadableText>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}