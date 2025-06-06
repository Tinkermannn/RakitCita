import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import CommunityCard from '../../components/CommunityCard/CommunityCard';
import Loading from '../../components/Loading/Loading';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'react-feather';

export default function MyCommunities({ user }) {
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
                    <p className="text-gray-500 mb-4">Anda belum bergabung dengan komunitas apapun.</p>
                    <div className="space-x-4">
                        <Link to="/communities" className="btn btn-outline">
                            Cari Komunitas
                        </Link>
                         <Link to="/communities/create" className="btn btn-primary inline-flex items-center">
                            <PlusCircle size={18} className="mr-2"/> Buat Komunitas Baru
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
                <h2 className="text-2xl font-semibold text-gray-800">Komunitas yang Saya Ikuti</h2>
                 <Link to="/communities/create" className="btn btn-primary btn-sm inline-flex items-center">
                    <PlusCircle size={18} className="mr-2"/> Buat Komunitas
                </Link>
            </div>
            {renderCommunityList(joinedCommunities, loadingJoined)}
        </div>
    );
}