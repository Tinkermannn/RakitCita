import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../../services/api';
import CommunityCard from '../../components/CommunityCard/CommunityCard';
import Loading from '../../components/Loading/Loading';
import ReadableText from '../../components/ReadableText/ReadableText';
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
    const limit = 9;

    const fetchCommunities = useCallback(async (page = 1) => {
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
    }, [searchTerm, limit]);

    useEffect(() => {
        fetchCommunities(currentPage);
    }, [currentPage, fetchCommunities]);

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
                    <ReadableText tag="h1" className="text-4xl font-bold text-gray-800">
                        Temukan Komunitas Anda
                    </ReadableText>
                    <ReadableText tag="p" className="text-gray-600 mt-2">
                        Bergabung, berdiskusi, dan berkembang bersama.
                    </ReadableText>
                </header>

                <div className="mb-8 p-6 bg-white rounded-lg shadow-md border border-blue-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <form onSubmit={handleSearch} className="flex-grow w-full md:w-auto">
                         <ReadableText 
                            tag="label" 
                            htmlFor="searchCommunity" 
                            className="sr-only"
                            textToRead="Label untuk input pencarian komunitas"
                        >
                            Cari Komunitas
                        </ReadableText>
                         <div className="relative">
                            <input
                                type="text"
                                id="searchCommunity"
                                className="block w-full px-3 py-3 pr-10 border border-blue-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
                                placeholder="Ketik nama atau deskripsi komunitas..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <ReadableText
                                tag="button"
                                type="submit"
                                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                textToRead="Tombol untuk mencari komunitas"
                            >
                                <Search className="h-5 w-5" />
                            </ReadableText>
                        </div>
                    </form>
                     {searchTerm && (
                        <ReadableText
                            tag="button"
                            onClick={handleResetSearch}
                            className="py-2 px-4 border border-blue-300 text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 md:ml-2"
                            textToRead="Tombol untuk mereset pencarian"
                        >
                            Reset Pencarian
                        </ReadableText>
                    )}
                    <Link 
                        to="/communities/create" 
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm hover:shadow-md w-full md:w-auto justify-center mt-4 md:mt-0"
                    >
                        <PlusCircle size={20} className="mr-2" />
                        <ReadableText tag="span" textToRead="Link untuk membuat komunitas baru">
                            Buat Komunitas Baru
                        </ReadableText>
                    </Link>
                </div>

                {loading ? (
                    <Loading />
                ) : communities.length > 0 ? (
                    <>
                        <ReadableText 
                            tag="p" 
                            className="text-sm text-gray-500 mb-4 text-center md:text-left"
                            textToRead={`Menampilkan ${communities.length} dari ${totalItems} komunitas`}
                        >
                            Menampilkan {communities.length} dari {totalItems} komunitas.
                        </ReadableText>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {communities.map(community => (
                                <CommunityCard key={community.community_id} community={community} />
                            ))}
                        </div>
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex justify-center items-center space-x-2">
                                <ReadableText
                                    tag="button"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="py-2 px-4 border border-blue-300 text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    textToRead="Tombol untuk ke halaman sebelumnya"
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
                                         {index > 0 && arr[index-1] + 1 !== pageNumber && (
                                            <ReadableText tag="span" className="px-1" textToRead="separator">
                                                ...
                                            </ReadableText>
                                        )}
                                        <ReadableText
                                            tag="button"
                                            onClick={() => handlePageChange(pageNumber)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                                currentPage === pageNumber 
                                                    ? 'bg-blue-600 text-white border border-blue-600' 
                                                    : 'bg-blue-50 text-blue-700 border border-blue-300 hover:bg-blue-100'
                                            }`}
                                            textToRead={`Halaman ${pageNumber}${currentPage === pageNumber ? ', halaman aktif' : ''}`}
                                        >
                                            {pageNumber}
                                        </ReadableText>
                                    </React.Fragment>
                                ))}
                                <ReadableText
                                    tag="button"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="py-2 px-4 border border-blue-300 text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    textToRead="Tombol untuk ke halaman berikutnya"
                                >
                                    Berikutnya
                                </ReadableText>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-20">
                        <div className="bg-white rounded-lg shadow-md border border-blue-100 p-8 max-w-md mx-auto">
                            <ReadableText 
                                tag="p" 
                                className="text-gray-500 mb-4 text-lg"
                                textToRead={searchTerm 
                                    ? "Tidak ada komunitas yang sesuai dengan pencarian Anda" 
                                    : "Belum ada komunitas yang tersedia saat ini"}
                            >
                                {searchTerm 
                                    ? "Tidak ada komunitas yang sesuai dengan pencarian Anda." 
                                    : "Belum ada komunitas yang tersedia saat ini."}
                            </ReadableText>
                            {!searchTerm && 
                                <Link 
                                    to="/communities/create" 
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 shadow-sm hover:shadow-md"
                                >
                                    <PlusCircle size={20} className="mr-2"/>
                                    <ReadableText tag="span" textToRead="Link untuk menjadi yang pertama membuat komunitas">
                                        Jadilah yang Pertama Membuat Komunitas!
                                    </ReadableText>
                                </Link>
                            }
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}