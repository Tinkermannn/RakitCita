import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import CommunityCard from '../../components/CommunityCard/CommunityCard';
import Loading from '../../components/Loading/Loading';
import ReadableText from '../../components/ReadableText/ReadableText';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'react-feather';

export default function MyCommunities() {
    const [joinedCommunities, setJoinedCommunities] = useState([]);
    const [loadingJoined, setLoadingJoined] = useState(true);

    const fetchJoinedCommunities = async () => {
        setLoadingJoined(true);
        try {
            const response = await apiClient.get('/communities/joined/me');
            if (response.data.success) {
                setJoinedCommunities(response.data.payload.data || []);
            } else {
                toast.error("Gagal memuat komunitas yang diikuti.");
            }
        } catch (error) {
            console.error("Error fetching joined communities:", error);
            toast.error("Terjadi kesalahan saat memuat komunitas yang diikuti.");
        } finally {
            setLoadingJoined(false);
        }
    };

    useEffect(() => {
        fetchJoinedCommunities();
    }, []);

    const renderCommunityList = (communities, isLoading) => {
        if (isLoading) return <Loading message="Memuat komunitas yang diikuti..." />;
        if (communities.length === 0) {
            return (
                 <div className="text-center py-10">
                    <ReadableText 
                        tag="p" 
                        className="text-gray-500 mb-4"
                        textToRead="Anda belum bergabung dengan komunitas apapun"
                    >
                        Anda belum bergabung dengan komunitas apapun.
                    </ReadableText>
                    <div className="space-x-4">
                        <Link 
                            to="/communities" 
                            className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            <ReadableText tag="span" textToRead="Link untuk mencari komunitas">
                                Cari Komunitas
                            </ReadableText>
                        </Link>
                         <Link 
                            to="/communities/create" 
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            <PlusCircle size={18} className="mr-2"/>
                            <ReadableText tag="span" textToRead="Link untuk membuat komunitas baru">
                                Buat Komunitas Baru
                            </ReadableText>
                        </Link>
                    </div>
                </div>
            );
        }
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {communities.map(community => (
                    <CommunityCard key={community.community_id} community={community} />
                ))}
            </div>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <ReadableText tag="h2" className="text-2xl font-semibold text-gray-800">
                    Komunitas yang Saya Ikuti
                </ReadableText>
                 <Link 
                    to="/communities/create" 
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                    <PlusCircle size={18} className="mr-2"/>
                    <ReadableText tag="span" textToRead="Link untuk membuat komunitas baru">
                        Buat Komunitas
                    </ReadableText>
                </Link>
            </div>
            {renderCommunityList(joinedCommunities, loadingJoined)}
        </div>
    );
}