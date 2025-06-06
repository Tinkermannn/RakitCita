import React from 'react';
import { Link } from 'react-router-dom';
import DefaultCommunityImage from '../../assets/Login/login.png';
import { Users, UserCheck } from 'react-feather';

export default function CommunityCard({ community }) {
    const imageUrl = community.banner_url || DefaultCommunityImage;

    return (
        <Link to={`/communities/${community.community_id}`} className="block group">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
                <div className="relative h-40 bg-gray-200">
                    <img 
                        src={imageUrl} 
                        alt={community.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src=DefaultCommunityImage; }}
                    />
                </div>
                <div className="p-5">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors truncate" title={community.name}>
                        {community.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 h-10 overflow-hidden text-ellipsis">
                        {community.description ? community.description.substring(0, 80) : "Tidak ada deskripsi."}{community.description && community.description.length > 80 && "..."}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                        <Users size={14} className="mr-2 text-orange-500" />
                        <span>{community.member_count || 0} Anggota</span>
                    </div>
                    {community.creator_name && (
                         <div className="flex items-center text-xs text-gray-500">
                            <UserCheck size={14} className="mr-2 text-orange-500" />
                            <span>Dibuat oleh: {community.creator_name}</span>
                        </div>
                    )}
                </div>
                <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
                    <span className="text-sm font-medium text-orange-600 group-hover:underline">
                        Kunjungi Komunitas
                    </span>
                </div>
            </div>
        </Link>
    );
}