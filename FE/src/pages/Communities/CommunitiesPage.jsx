import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import CommunityCard from '../../components/CommunityCard/CommunityCard';
import Loading from '../../components/Loading/Loading';
import { toast } from 'react-toastify';
import { Search, PlusCircle } from 'react-feather';
import { Link } from 'react-router-dom';

export default function CommunitiesPage() {
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 9; // Jumlah item per halaman

    const fetchCommunities = async (page = 1) => {
        setLoading(true);
        try {
            const params = {
                page,
                limit,
                search: searchTerm,
            };
             Object.keys(params).forEach(key => (params[key] === '' || params[key] === null) && delete params[key]);

            const response = await apiClient.get('/communities', { params });
            if (response.data.success) {
                setCommunities(response.data.payload.data || []);
                setTotalPages(response.data.payload.totalPages || 1);
                setTotalItems(response.data.payload.totalItems || 0);
                setCurrentPage(response.data.payload.page || 1);
            } else {
                toast.error("Gagal memuat daftar komunitas.");
            }
        } catch (error) {
            console.error("Error fetching communities:", error);
            toast.error("Terjadi kesalahan saat memuat komunitas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommunities(currentPage);
    }, [currentPage]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchCommunities(1);
    };

     const handleResetSearch = () => {
        setSearchTerm('');
        setCurrentPage(1);
        fetchCommunities(1);
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
                    <h1 className="text-4xl font-bold text-gray-800">Temukan Komunitas Anda</h1>
                    <p className="text-gray-600 mt-2">Bergabung, berdiskusi, dan berkembang bersama.</p>
                </header>

                <div className="mb-8 p-6 bg-white rounded-lg shadow-md border border-blue-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <form onSubmit={handleSearch} className="flex-grow w-full md:w-auto">
                         <label htmlFor="searchCommunity" className="sr-only">Cari Komunitas</label>
                         <div className="relative">
                            <input
                                type="text"
                                id="searchCommunity"
                                className="block w-full px-3 py-3 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
                                placeholder="Ketik nama atau deskripsi komunitas..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button type="submit" className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-blue-600 transition-colors duration-200">
                                <Search className="h-5 w-5" />
                            </button>
                        </div>
                    </form>
                     {searchTerm && (
                        <button 
                            onClick={handleResetSearch} 
                            className="py-2 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 md:ml-2"
                        >
                            Reset Pencarian
                        </button>
                    )}
                    <Link 
                        to="/communities/create" 
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm hover:shadow-md w-full md:w-auto justify-center mt-4 md:mt-0"
                    >
                        <PlusCircle size={20} className="mr-2" /> Buat Komunitas Baru
                    </Link>
                </div>

                {loading ? (
                    <Loading />
                ) : communities.length > 0 ? (
                    <>
                        <p className="text-sm text-gray-500 mb-4 text-center md:text-left">Menampilkan {communities.length} dari {totalItems} komunitas.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {communities.map(community => (
                                <CommunityCard key={community.community_id} community={community} />
                            ))}
                        </div>
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex justify-center items-center space-x-2">
                                <button 
                                    onClick={() => handlePageChange(currentPage - 1)} 
                                    disabled={currentPage === 1} 
                                    className="py-2 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    Sebelumnya
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(pageNumber => 
                                        pageNumber === 1 ||
                                        pageNumber === totalPages ||
                                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                    )
                                    .map((pageNumber, index, arr) => (
                                    <React.Fragment key={pageNumber}>
                                         {index > 0 && arr[index-1] + 1 !== pageNumber && <span className="px-1">...</span>}
                                        <button
                                            onClick={() => handlePageChange(pageNumber)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                                                currentPage === pageNumber 
                                                    ? 'bg-blue-600 text-white border border-blue-600' 
                                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {pageNumber}
                                        </button>
                                    </React.Fragment>
                                ))}
                                <button 
                                    onClick={() => handlePageChange(currentPage + 1)} 
                                    disabled={currentPage === totalPages} 
                                    className="py-2 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                    Berikutnya
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20">
                        <div className="bg-white rounded-lg shadow-md border border-blue-100 p-8 max-w-md mx-auto">
                            <p className="text-gray-500 mb-4 text-lg">
                                {searchTerm 
                                    ? "Tidak ada komunitas yang sesuai dengan pencarian Anda." 
                                    : "Belum ada komunitas yang tersedia saat ini."}
                            </p>
                            {!searchTerm && 
                                <Link 
                                    to="/communities/create" 
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm hover:shadow-md"
                                >
                                    <PlusCircle size={20} className="mr-2"/> Jadilah yang Pertama Membuat Komunitas!
                                </Link>
                            }
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}