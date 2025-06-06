import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../../services/api';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading/Loading';
import DefaultCommunityImage from '../../assets/todologo.png';
import { Users, UserPlus, UserCheck, LogOut, Edit3, Trash2, ArrowLeft, Send, MessageSquare, Clock, Shield, UserX, UserMinus } from 'react-feather';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export default function CommunityDetailPage() {
    const { communityId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [community, setCommunity] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [isMember, setIsMember] = useState(false);
    const [membershipDetails, setMembershipDetails] = useState(null);
    const [isCreatorOrAdmin, setIsCreatorOrAdmin] = useState(false); // Platform admin or community admin/creator

    // Dummy posts state for community feed
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState('');
    const [loadingPosts, setLoadingPosts] = useState(false);

    const [membersPage, setMembersPage] = useState(1);
    const [membersTotalPages, setMembersTotalPages] = useState(1);
    const [loadingMembers, setLoadingMembers] = useState(false);

    const fetchCommunityDetails = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await apiClient.get(`/communities/${communityId}`);
            if (response.data.success) {
                const fetchedCommunity = response.data.payload;
                setCommunity(fetchedCommunity);
                // The backend now includes `isCurrentUserMember` and `currentUserRoleInCommunity`
                setIsMember(fetchedCommunity.isCurrentUserMember || false);
                setMembershipDetails(fetchedCommunity.isCurrentUserMember ? { role_in_community: fetchedCommunity.currentUserRoleInCommunity } : null);

                if (currentUser) {
                    const isCreator = fetchedCommunity.creator_id === currentUser.user_id;
                    const isCommunityAdmin = fetchedCommunity.currentUserRoleInCommunity === 'admin';
                    const isPlatformAdmin = currentUser.role === 'admin';
                    setIsCreatorOrAdmin(isCreator || isCommunityAdmin || isPlatformAdmin);
                }
                
                // Dummy posts
                setPosts([
                    { id: 1, user: 'Citra Kirana', text: 'Ada yang punya tips belajar coding untuk pemula disabilitas netra?', timestamp: new Date(Date.now() - 12000000).toISOString(), avatar: `https://ui-avatars.com/api/?name=Citra+Kirana&background=random`},
                    { id: 2, user: 'Rahmat Hidayat', text: 'Diskusi mingguan kita besok jam berapa ya?', timestamp: new Date(Date.now() - 24000000).toISOString(), avatar: `https://ui-avatars.com/api/?name=Rahmat+Hidayat&background=random`},
                ]);
            } else {
                setError(response.data.message || 'Gagal memuat detail komunitas.');
                toast.error(response.data.message || 'Gagal memuat detail komunitas.');
            }
        } catch (err) {
            console.error("Fetch community detail error:", err.response || err.message || err);
            const errorMessage = err.response?.data?.message || 'Terjadi kesalahan server.';
            setError(errorMessage);
            // toast.error(errorMessage); // Dihandle oleh tampilan error di page
            if (err.response?.status === 404) {
                navigate('/404');
            }
        } finally {
            setLoading(false);
        }
    }, [communityId, navigate, currentUser]); // Tambahkan currentUser

    const fetchMembers = useCallback(async (page = 1) => {
        setLoadingMembers(true);
        try {
            const response = await apiClient.get(`/communities/${communityId}/members?page=${page}&limit=10`);
            if (response.data.success) {
                setMembers(response.data.payload.data || []);
                setMembersTotalPages(response.data.payload.totalPages || 1);
                setMembersPage(response.data.payload.page || 1);
            }
        } catch (error) {
            console.error("Error fetching members:", error);
            toast.error("Gagal memuat daftar anggota.");
        } finally {
            setLoadingMembers(false);
        }
    }, [communityId]);


    useEffect(() => {
        const userString = localStorage.getItem('user');
        if (userString) {
            setCurrentUser(JSON.parse(userString));
        }
        // fetchCommunityDetails akan dipanggil setelah currentUser di-set dan jika communityId ada
    }, []);

    useEffect(() => {
        if (communityId && currentUser !== undefined) { // Pastikan currentUser sudah diinisialisasi (bisa null)
            fetchCommunityDetails();
            fetchMembers();
        }
    }, [communityId, currentUser, fetchCommunityDetails, fetchMembers]);


    const handleJoinLeaveCommunity = async () => {
        if (!currentUser) {
            toast.info("Silakan login untuk bergabung/meninggalkan komunitas.");
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
        setLoading(true); // Atau state loading spesifik
        const action = isMember ? 'leave' : 'join';
        const method = isMember ? 'delete' : 'post';
        try {
            const response = await apiClient[method](`/communities/${communityId}/${action}`);
            if (response.data.success) {
                toast.success(`Berhasil ${action === 'join' ? 'bergabung dengan' : 'meninggalkan'} komunitas!`);
                setIsMember(!isMember);
                setMembershipDetails(action === 'join' ? response.data.payload : null); // Update membership
                fetchCommunityDetails(); // Re-fetch untuk update member count, etc.
                fetchMembers(); // Re-fetch member list
            } else {
                toast.error(response.data.message || `Gagal ${action} komunitas.`);
            }
        } catch (error) {
            console.error(`${action} community error:`, error);
            toast.error(error.response?.data?.message || `Terjadi kesalahan saat ${action} komunitas.`);
        } finally {
            setLoading(false);
        }
    };
    
    const handleDeleteCommunity = async () => {
        if (!isCreatorOrAdmin) return;
        if (window.confirm("Apakah Anda yakin ingin menghapus komunitas ini? Semua data terkait akan hilang.")) {
            setLoading(true);
            try {
                const response = await apiClient.delete(`/communities/${communityId}`);
                if (response.data.success) {
                    toast.success("Komunitas berhasil dihapus.");
                    navigate('/communities');
                } else {
                    toast.error(response.data.message || "Gagal menghapus komunitas.");
                }
            } catch (error) {
                console.error("Delete community error:", error);
                toast.error(error.response?.data?.message || "Terjadi kesalahan saat menghapus.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleAddPost = (e) => {
        e.preventDefault();
        if (!newPost.trim() || !currentUser) return;
        setLoadingPosts(true);
        setTimeout(() => { // Simulasikan API call
            const postToAdd = {
                id: posts.length + 1,
                user: currentUser.name,
                text: newPost,
                timestamp: new Date().toISOString(),
                avatar: currentUser.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`
            };
            setPosts(prev => [postToAdd, ...prev]);
            setNewPost('');
            setLoadingPosts(false);
            toast.success("Postingan berhasil ditambahkan!");
        }, 500);
    };
    
    const handleChangeMemberRole = async (memberId, newRole) => {
        if(!currentUser || (membershipDetails?.role_in_community !== 'admin' && currentUser.role !== 'admin')) {
            toast.error("Anda tidak berhak mengubah peran anggota.");
            return;
        }
        if (window.confirm(`Anda yakin ingin mengubah peran anggota ini menjadi ${newRole}?`)) {
            try {
                const response = await apiClient.patch(`/communities/${communityId}/members/${memberId}/role`, { role_in_community: newRole });
                if (response.data.success) {
                    toast.success("Peran anggota berhasil diubah.");
                    fetchMembers(membersPage); // Refresh member list
                } else {
                    toast.error(response.data.message || "Gagal mengubah peran anggota.");
                }
            } catch (error) {
                 toast.error(error.response?.data?.message || "Terjadi kesalahan.");
            }
        }
    };

    const handleRemoveMember = async (memberId) => {
        if(!currentUser || (membershipDetails?.role_in_community !== 'admin' && currentUser.role !== 'admin')) {
            toast.error("Anda tidak berhak mengeluarkan anggota.");
            return;
        }
         if (memberId === currentUser.user_id) {
            toast.warn("Anda tidak bisa mengeluarkan diri sendiri dengan cara ini. Gunakan tombol 'Tinggalkan Komunitas'.");
            return;
        }
        if (window.confirm("Anda yakin ingin mengeluarkan anggota ini dari komunitas?")) {
            try {
                const response = await apiClient.delete(`/communities/${communityId}/members/${memberId}`);
                 if (response.data.success) {
                    toast.success("Anggota berhasil dikeluarkan.");
                    fetchMembers(membersPage); // Refresh member list
                    fetchCommunityDetails(); // Refresh community details (member count)
                } else {
                    toast.error(response.data.message || "Gagal mengeluarkan anggota.");
                }
            } catch (error) {
                 toast.error(error.response?.data?.message || "Terjadi kesalahan.");
            }
        }
    };

    if (loading && !community) return <div className="container mx-auto p-4"><Loading message="Memuat detail komunitas..." /></div>;
    if (error) return <div className="container mx-auto p-4 text-center text-red-500 bg-red-100 p-4 rounded-md">{error}</div>;
    if (!community) return <div className="container mx-auto p-4 text-center">Detail komunitas tidak ditemukan.</div>;

    const imageUrl = community.banner_url || DefaultCommunityImage;
    const canManageMembers = currentUser && (membershipDetails?.role_in_community === 'admin' || currentUser.role === 'admin');


    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center text-orange-600 hover:text-orange-800">
                    <ArrowLeft size={20} className="mr-2" /> Kembali
                </button>

                <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                    {/* Header Komunitas */}
                    <div className="relative">
                        <img src={imageUrl} alt={community.name} className="w-full h-56 md:h-80 object-cover" 
                             onError={(e) => { e.target.onerror = null; e.target.src = DefaultCommunityImage; }}/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6 md:p-8">
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">{community.name}</h1>
                            <p className="text-orange-300 text-sm flex items-center">
                                <Users size={16} className="mr-1.5"/> {community.member_count || 0} Anggota
                                {community.creator_name && (
                                    <span className="ml-3">Dibuat oleh: 
                                        <Link to={`/profile/${community.creator_id}`} className="hover:text-orange-100"> {community.creator_name}</Link>
                                    </span>
                                )}
                            </p>
                        </div>
                        {isCreatorOrAdmin && (
                            <div className="absolute top-4 right-4 space-x-2">
                                <Link to={`/communities/edit/${communityId}`} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-md">
                                    <Edit3 size={18} />
                                </Link>
                                <button onClick={handleDeleteCommunity} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Konten Detail dan Aksi */}
                    <div className="p-6 md:p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                            <div className="mb-4 md:mb-0">
                                <h2 className="text-2xl font-semibold text-gray-800 mb-1">Tentang Komunitas</h2>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {community.description || "Komunitas ini belum memiliki deskripsi."}
                                </p>
                            </div>
                            {currentUser && (
                                <button
                                    onClick={handleJoinLeaveCommunity}
                                    disabled={loading}
                                    className={`btn ${isMember ? 'btn-secondary' : 'btn-primary'} py-2.5 px-5 text-sm md:text-base inline-flex items-center w-full md:w-auto justify-center`}
                                >
                                    {isMember ? <LogOut size={18} className="mr-2"/> : <UserPlus size={18} className="mr-2"/>}
                                    {loading ? "Memproses..." : (isMember ? "Tinggalkan Komunitas" : "Bergabung Komunitas")}
                                </button>
                            )}
                             {!currentUser && (
                                 <button
                                    onClick={() => {navigate('/login', { state: { from: location.pathname } })}}
                                    className="btn btn-primary py-2.5 px-5 text-sm md:text-base w-full md:w-auto justify-center"
                                >
                                    Login untuk Bergabung
                                </button>
                            )}
                        </div>

                        {/* Tabs: Posts, Members, (Maybe Events later) */}
                        {/* For MVP, let's keep it simple. Show members directly. Feed can be a next feature. */}

                        {/* Community Feed (Dummy) */}
                        {isMember && (
                            <div className="mb-10 pt-6 border-t">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <MessageSquare size={24} className="mr-2 text-orange-500"/> Diskusi Komunitas
                                </h3>
                                <form onSubmit={handleAddPost} className="mb-6">
                                    <textarea
                                        value={newPost}
                                        onChange={(e) => setNewPost(e.target.value)}
                                        placeholder="Mulai diskusi atau bagikan sesuatu..."
                                        rows="3"
                                        className="input-field w-full mb-2"
                                        required
                                    ></textarea>
                                    <button type="submit" className="btn btn-primary btn-sm inline-flex items-center" disabled={loadingPosts}>
                                        <Send size={16} className="mr-2"/> {loadingPosts ? 'Mengirim...' : 'Kirim Postingan'}
                                    </button>
                                </form>
                                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                    {posts.length > 0 ? posts.map(post => (
                                        <div key={post.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md shadow-sm">
                                            <img src={post.avatar} alt={post.user} className="w-10 h-10 rounded-full object-cover"/>
                                            <div>
                                                <p className="font-semibold text-sm text-gray-800">{post.user}</p>
                                                <p className="text-sm text-gray-600">{post.text}</p>
                                                <p className="text-xs text-gray-400 mt-1 flex items-center">
                                                    <Clock size={12} className="mr-1"/> {formatDistanceToNow(parseISO(post.timestamp), { addSuffix: true, locale: id })}
                                                </p>
                                            </div>
                                        </div>
                                    )) : <p className="text-sm text-gray-500 text-center">Belum ada postingan.</p>}
                                </div>
                            </div>
                        )}


                        {/* Daftar Anggota */}
                        <div className="pt-6 border-t">
                             <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                <Users size={24} className="mr-2 text-orange-500"/> Anggota Komunitas ({community.member_count || 0})
                            </h3>
                            {loadingMembers ? (
                                <Loading message="Memuat anggota..." />
                            ) : members.length > 0 ? (
                                <div className="space-y-3">
                                    {members.map(member => (
                                        <div key={member.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md shadow-sm">
                                            <div className="flex items-center space-x-3">
                                                <img 
                                                    src={member.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`} 
                                                    alt={member.name} 
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                                <div>
                                                    <Link to={`/profile/${member.user_id}`} className="font-medium text-gray-800 hover:text-orange-600">{member.name}</Link>
                                                    <p className="text-xs text-gray-500 capitalize flex items-center">
                                                        {member.role_in_community === 'admin' && <Shield size={12} className="mr-1 text-red-500"/>}
                                                        {member.role_in_community === 'moderator' && <UserCheck size={12} className="mr-1 text-blue-500"/>}
                                                        {member.role_in_community}
                                                    </p>
                                                </div>
                                            </div>
                                            {/* Admin actions for members */}
                                            {canManageMembers && member.user_id !== currentUser.user_id && (
                                                <div className="flex space-x-2">
                                                    {member.role_in_community !== 'admin' && (
                                                        <button 
                                                            onClick={() => handleChangeMemberRole(member.user_id, 'admin')}
                                                            title="Jadikan Admin"
                                                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full"
                                                        >
                                                            <Shield size={16} />
                                                        </button>
                                                    )}
                                                     {member.role_in_community !== 'moderator' && member.role_in_community !== 'admin' && (
                                                        <button 
                                                            onClick={() => handleChangeMemberRole(member.user_id, 'moderator')}
                                                            title="Jadikan Moderator"
                                                            className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-full"
                                                        >
                                                            <UserCheck size={16} />
                                                        </button>
                                                    )}
                                                     {(member.role_in_community === 'admin' || member.role_in_community === 'moderator') && member.role_in_community !== 'member' && (
                                                        <button 
                                                            onClick={() => handleChangeMemberRole(member.user_id, 'member')}
                                                            title="Jadikan Member Biasa"
                                                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full"
                                                        >
                                                            <UserIconFeather size={16} /> {/* Menggunakan UserIconFeather dari react-feather */}
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleRemoveMember(member.user_id)}
                                                        title="Keluarkan dari Komunitas"
                                                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full"
                                                    >
                                                        <UserX size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                     {/* Pagination untuk Anggota */}
                                    {membersTotalPages > 1 && (
                                        <div className="mt-6 flex justify-center items-center space-x-1">
                                            <button onClick={() => fetchMembers(membersPage - 1)} disabled={membersPage === 1} className="btn btn-secondary btn-sm px-2 py-1 disabled:opacity-50">Sebelumnya</button>
                                            <span className="text-sm text-gray-600">Hal {membersPage} dari {membersTotalPages}</span>
                                            <button onClick={() => fetchMembers(membersPage + 1)} disabled={membersPage === membersTotalPages} className="btn btn-secondary btn-sm px-2 py-1 disabled:opacity-50">Berikutnya</button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 text-center">Belum ada anggota selain Anda (jika Anda baru saja bergabung).</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}