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
        <div className="container mx-auto p-4 md:p-8">
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-gray-800">Temukan Komunitas Anda</h1>
                <p className="text-gray-600 mt-2">Bergabung, berdiskusi, dan berkembang bersama.</p>
            </header>

            <div className="mb-8 p-6 bg-white rounded-lg shadow-md flex flex-col md:flex-row justify-between items-center gap-4">
                <form onSubmit={handleSearch} className="flex-grow w-full md:w-auto">
                     <label htmlFor="searchCommunity" className="sr-only">Cari Komunitas</label>
                     <div className="relative">
                        <input
                            type="text"
                            id="searchCommunity"
                            className="input-field pr-10 w-full"
                            placeholder="Ketik nama atau deskripsi komunitas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button type="submit" className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-orange-600">
                            <Search className="h-5 w-5" />
                        </button>
                    </div>
                </form>
                 {searchTerm && (
                    <button onClick={handleResetSearch} className="btn btn-secondary btn-sm md:ml-2">Reset Pencarian</button>
                )}
                <Link to="/communities/create" className="btn btn-primary inline-flex items-center w-full md:w-auto justify-center mt-4 md:mt-0">
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
                            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="btn btn-secondary px-3 py-1 text-sm disabled:opacity-50">Sebelumnya</button>
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
                <div className="text-center py-10">
                    <p className="text-gray-500 mb-4">
                        {searchTerm 
                            ? "Tidak ada komunitas yang sesuai dengan pencarian Anda." 
                            : "Belum ada komunitas yang tersedia saat ini."}
                    </p>
                    {!searchTerm && 
                        <Link to="/communities/create" className="btn btn-primary inline-flex items-center">
                            <PlusCircle size={20} className="mr-2"/> Jadilah yang Pertama Membuat Komunitas!
                        </Link>
                    }
                </div>
            )}
        </div>
    );
}