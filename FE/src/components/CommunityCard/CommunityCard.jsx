import React from 'react';
import { Link } from 'react-router-dom';
import ReadableText from '../ReadableText/ReadableText';
import DefaultCommunityImage from '../../assets/Login/login.png';
import { Users, UserCheck } from 'react-feather';

export default function CommunityCard({ community }) {
    const imageUrl = community.banner_url || DefaultCommunityImage;

    return (
        <Link 
            to={`/communities/${community.community_id}`} 
            className="block group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-all duration-200"
        >
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 border border-blue-100 hover:border-blue-300">
                <div className="relative h-40 bg-blue-100">
                    <img 
                        src={imageUrl} 
                        alt={`Banner komunitas ${community.name}`} 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src=DefaultCommunityImage; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-5">
                    <ReadableText 
                        tag="h3" 
                        className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors truncate" 
                        title={community.name}
                        textToRead={`Komunitas ${community.name}`}
                    >
                        {community.name}
                    </ReadableText>
                    <ReadableText 
                        tag="p" 
                        className="text-sm text-gray-600 mb-3 h-10 overflow-hidden text-ellipsis"
                        textToRead={community.description ? `Deskripsi: ${community.description.substring(0, 80)}${community.description.length > 80 ? ' dan seterusnya' : ''}` : "Tidak ada deskripsi"}
                    >
                        {community.description ? community.description.substring(0, 80) : "Tidak ada deskripsi."}{community.description && community.description.length > 80 && "..."}
                    </ReadableText>
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                        <Users size={14} className="mr-2 text-blue-500" />
                        <ReadableText 
                            tag="span"
                            textToRead={`${community.member_count || 0} anggota`}
                        >
                            {community.member_count || 0} Anggota
                        </ReadableText>
                    </div>
                    {community.creator_name && (
                         <div className="flex items-center text-xs text-gray-500">
                            <UserCheck size={14} className="mr-2 text-blue-500" />
                            <ReadableText 
                                tag="span"
                                textToRead={`Dibuat oleh ${community.creator_name}`}
                            >
                                Dibuat oleh: {community.creator_name}
                            </ReadableText>
                        </div>
                    )}
                </div>
                <div className="px-5 py-3 bg-blue-50 border-t border-blue-200 group-hover:bg-blue-100 transition-colors duration-300">
                    <ReadableText 
                        tag="span" 
                        className="text-sm font-medium text-blue-600 group-hover:underline"
                        textToRead="Klik untuk mengunjungi komunitas"
                    >
                        Kunjungi Komunitas
                    </ReadableText>
                </div>
            </div>
        </Link>
    );
}