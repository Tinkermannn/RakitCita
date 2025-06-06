import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading/Loading';
import DefaultAvatar from '../../assets/todologo.png'; // Ganti dengan avatar default yang sesuai
import { User, Mail, Briefcase, Info, Edit3, Camera } from 'react-feather';
import EditProfileModal from './EditProfileModal'; // Akan kita buat

export default function ProfilePage() {
    const { userId } = useParams(); // ID user yang profilnya dilihat
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [profilePictureFile, setProfilePictureFile] = useState(null);
    const [uploadingPicture, setUploadingPicture] = useState(false);


    useEffect(() => {
        const userStored = localStorage.getItem('user');
        if (userStored) {
            const parsedUser = JSON.parse(userStored);
            setLoggedInUser(parsedUser);
            if (parsedUser.user_id === userId) {
                setIsOwnProfile(true);
            }
        } else {
            // Jika tidak ada user login, mungkin redirect atau handle kasus public profile
        }
    }, [userId]);
    
    const fetchProfile = async () => {
        setLoading(true);
        setError('');
        try {
            // Jika ini profil sendiri dan endpoint /profile sudah ada, gunakan itu.
            // Jika tidak, atau melihat profil orang lain, gunakan /users/:userId
            const endpoint = (isOwnProfile && loggedInUser?.user_id === userId) ? `/users/profile` : `/users/${userId}`;
            const response = await apiClient.get(endpoint);

            if (response.data.success) {
                setProfile(response.data.payload);
            } else {
                setError(response.data.message || 'Gagal memuat profil.');
                toast.error(response.data.message || 'Gagal memuat profil.');
            }
        } catch (err) {
            console.error("Fetch profile error:", err.response || err.message || err);
            const errorMessage = err.response?.data?.message || 'Terjadi kesalahan server.';
            setError(errorMessage);
            toast.error(errorMessage);
            if (err.response?.status === 404) {
                 navigate('/404'); // atau halaman not found
            }
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        // Hanya fetch jika userId tersedia dan (loggedInUser sudah termuat atau bukan profil sendiri)
        if (userId && (loggedInUser || !isOwnProfile)) {
            fetchProfile();
        } else if (userId && isOwnProfile && !loggedInUser) {
            // Case where it's own profile but loggedInUser state hasn't updated yet from localStorage
            // This might cause a slight delay or double fetch if not handled carefully.
            // The dependency on loggedInUser in the first useEffect should handle setting isOwnProfile correctly first.
        }
    }, [userId, loggedInUser, isOwnProfile]); // Re-fetch if userId changes or loggedInUser is identified

    const handleProfileUpdate = (updatedProfileData) => {
        setProfile(prev => ({ ...prev, ...updatedProfileData }));
        // Update localStorage user if it's the logged-in user's profile
        if (isOwnProfile && loggedInUser) {
            const updatedLoggedInUser = { ...loggedInUser, ...updatedProfileData };
            localStorage.setItem('user', JSON.stringify(updatedLoggedInUser));
            setLoggedInUser(updatedLoggedInUser); // Update local state for immediate reflection
        }
        toast.success("Profil berhasil diperbarui!");
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setProfilePictureFile(e.target.files[0]);
            // Optionally, trigger upload immediately or show a preview
            handlePictureUpload(e.target.files[0]);
        }
    };

    const handlePictureUpload = async (fileToUpload) => {
        if (!fileToUpload) return;
        setUploadingPicture(true);
        const formData = new FormData();
        formData.append('profilePicture', fileToUpload);

        try {
            const response = await apiClient.patch('/users/profile/picture', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.data.success) {
                setProfile(response.data.payload);
                 if (isOwnProfile && loggedInUser) {
                    const updatedLoggedInUser = { ...loggedInUser, profile_picture_url: response.data.payload.profile_picture_url };
                    localStorage.setItem('user', JSON.stringify(updatedLoggedInUser));
                    setLoggedInUser(updatedLoggedInUser);
                }
                toast.success('Foto profil berhasil diperbarui!');
                setProfilePictureFile(null); // Clear selection
            } else {
                toast.error(response.data.message || 'Gagal mengunggah foto profil.');
            }
        } catch (err) {
            console.error("Picture upload error:", err.response || err.message || err);
            toast.error(err.response?.data?.message || 'Terjadi kesalahan saat mengunggah.');
        } finally {
            setUploadingPicture(false);
        }
    };


    if (loading) return <div className="container mx-auto p-4"><Loading message="Memuat profil..." /></div>;
    if (error && !profile) return <div className="container mx-auto p-4 text-center text-red-500">{error}</div>;
    if (!profile) return <div className="container mx-auto p-4 text-center">Profil tidak ditemukan.</div>;

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-4xl">
            <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                <div className="relative">
                    <div className="h-48 bg-gradient-to-r from-orange-500 to-yellow-500"></div>
                    <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                        <div className="relative group">
                            <img
                                className="h-32 w-32 rounded-full border-4 border-white shadow-lg object-cover"
                                src={profile.profile_picture_url || DefaultAvatar}
                                alt={profile.name}
                                onError={(e) => { e.target.onerror = null; e.target.src = DefaultAvatar; }}
                            />
                            {isOwnProfile && (
                                <label htmlFor="profilePictureInput" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera size={32} className="text-white" />
                                    <input type="file" id="profilePictureInput" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploadingPicture}/>
                                </label>
                            )}
                        </div>
                         {uploadingPicture && <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 mt-1 text-xs text-orange-600">Mengunggah...</div>}
                    </div>
                </div>

                <div className="pt-20 p-6 text-center">
                    <h1 className="text-3xl font-bold text-gray-800">{profile.name}</h1>
                    <p className="text-sm text-gray-500 capitalize">{profile.role}</p>
                    
                    {isOwnProfile && (
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="mt-4 btn btn-outline btn-sm inline-flex items-center"
                        >
                            <Edit3 size={16} className="mr-2" /> Edit Profil
                        </button>
                    )}
                </div>

                <div className="border-t border-gray-200 px-6 py-4">
                    <h3 className="text-lg font-semibold text-gray-700 mb-3">Informasi Kontak</h3>
                    <div className="flex items-center text-gray-600 mb-2">
                        <Mail size={18} className="mr-3 text-orange-500 flex-shrink-0" />
                        <span>{profile.email}</span>
                    </div>

                    {profile.bio && (
                        <>
                            <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-3">Tentang Saya</h3>
                            <div className="flex items-start text-gray-600 mb-2">
                                <User size={18} className="mr-3 mt-1 text-orange-500 flex-shrink-0" />
                                <p className="text-sm leading-relaxed whitespace-pre-line">{profile.bio}</p>
                            </div>
                        </>
                    )}

                    {profile.disability_details && (isOwnProfile || loggedInUser?.role === 'admin') && ( // Hanya tampilkan ke diri sendiri atau admin
                        <>
                            <h3 className="text-lg font-semibold text-gray-700 mt-6 mb-3">Detail Disabilitas (Konfidensial)</h3>
                            <div className="flex items-start text-gray-600 mb-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <Info size={18} className="mr-3 mt-1 text-blue-500 flex-shrink-0" />
                                <p className="text-sm leading-relaxed whitespace-pre-line">{profile.disability_details}</p>
                            </div>
                        </>
                    )}

                    <div className="mt-6 text-xs text-gray-400 text-center">
                        Bergabung pada: {new Date(profile.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>
            </div>

            {isOwnProfile && showEditModal && (
                <EditProfileModal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    currentUserData={profile}
                    onProfileUpdate={handleProfileUpdate}
                />
            )}
        </div>
    );
}