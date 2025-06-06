import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading/Loading';
import ReadableText from '../../components/ReadableText/ReadableText';
import DefaultAvatar from '../../assets/todologo.png';
import { User, Mail, Info, Edit3, Camera } from 'react-feather';
import EditProfileModal from './EditProfileModal';

export default function ProfilePage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isOwnProfile, setIsOwnProfile] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [uploadingPicture, setUploadingPicture] = useState(false);

    useEffect(() => {
        const userStored = localStorage.getItem('user');
        if (userStored) {
            const parsedUser = JSON.parse(userStored);
            setLoggedInUser(parsedUser);
            if (parsedUser.user_id === userId) {
                setIsOwnProfile(true);
            }
        }
    }, [userId]);
    
    const fetchProfile = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
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
                 navigate('/404');
            }
        } finally {
            setLoading(false);
        }
    }, [isOwnProfile, loggedInUser, userId, navigate]);

    useEffect(() => {
        if (userId && (loggedInUser || !isOwnProfile)) {
            fetchProfile();
        }
    }, [userId, loggedInUser, isOwnProfile, fetchProfile]);

    const handleProfileUpdate = (updatedProfileData) => {
        setProfile(prev => ({ ...prev, ...updatedProfileData }));
        if (isOwnProfile && loggedInUser) {
            const updatedLoggedInUser = { ...loggedInUser, ...updatedProfileData };
            localStorage.setItem('user', JSON.stringify(updatedLoggedInUser));
            setLoggedInUser(updatedLoggedInUser);
        }
        toast.success("Profil berhasil diperbarui!");
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="container mx-auto p-4 md:p-8 max-w-4xl">
                <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-blue-100">
                    <div className="relative">
                        <div className="h-48 bg-gradient-to-r from-blue-500 to-blue-700"></div>
                        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                            <div className="relative group">
                                <img
                                    className="h-32 w-32 rounded-full border-4 border-white shadow-lg object-cover"
                                    src={profile.profile_picture_url || DefaultAvatar}
                                    alt={`Foto profil ${profile.name}`}
                                    onError={(e) => { e.target.onerror = null; e.target.src = DefaultAvatar; }}
                                />
                                {isOwnProfile && (
                                    <ReadableText
                                        tag="label"
                                        htmlFor="profilePictureInput"
                                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                        textToRead="Tombol untuk mengubah foto profil"
                                    >
                                        <Camera size={32} className="text-white" />
                                        <input 
                                            type="file" 
                                            id="profilePictureInput" 
                                            className="sr-only" 
                                            accept="image/*" 
                                            onChange={handleFileChange} 
                                            disabled={uploadingPicture}
                                        />
                                    </ReadableText>
                                )}
                            </div>
                             {uploadingPicture && (
                                <ReadableText
                                    tag="div"
                                    className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 mt-1 text-xs text-blue-600"
                                    textToRead="Sedang mengunggah foto profil"
                                >
                                    Mengunggah...
                                </ReadableText>
                            )}
                        </div>
                    </div>

                    <div className="pt-20 p-6 text-center">
                        <ReadableText tag="h1" className="text-3xl font-bold text-gray-800">
                            {profile.name}
                        </ReadableText>
                        <ReadableText tag="p" className="text-sm text-gray-500 capitalize">
                            {profile.role}
                        </ReadableText>
                        
                        {isOwnProfile && (
                            <ReadableText
                                tag="button"
                                onClick={() => setShowEditModal(true)}
                                className="mt-4 inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                textToRead="Tombol untuk mengedit profil"
                            >
                                <Edit3 size={16} className="mr-2" /> Edit Profil
                            </ReadableText>
                        )}
                    </div>

                    <div className="border-t border-blue-100 px-6 py-4">
                        <ReadableText tag="h3" className="text-lg font-semibold text-gray-700 mb-3">
                            Informasi Kontak
                        </ReadableText>
                        <div className="flex items-center text-gray-600 mb-2">
                            <Mail size={18} className="mr-3 text-blue-500 flex-shrink-0" />
                            <ReadableText tag="span" textToRead={`Email: ${profile.email}`}>
                                {profile.email}
                            </ReadableText>
                        </div>

                        {profile.bio && (
                            <>
                                <ReadableText tag="h3" className="text-lg font-semibold text-gray-700 mt-6 mb-3">
                                    Tentang Saya
                                </ReadableText>
                                <div className="flex items-start text-gray-600 mb-2">
                                    <User size={18} className="mr-3 mt-1 text-blue-500 flex-shrink-0" />
                                    <ReadableText 
                                        tag="p" 
                                        className="text-sm leading-relaxed whitespace-pre-line"
                                        textToRead={`Bio: ${profile.bio}`}
                                    >
                                        {profile.bio}
                                    </ReadableText>
                                </div>
                            </>
                        )}

                        {profile.disability_details && (isOwnProfile || loggedInUser?.role === 'admin') && (
                            <>
                                <ReadableText tag="h3" className="text-lg font-semibold text-gray-700 mt-6 mb-3">
                                    Detail Disabilitas (Konfidensial)
                                </ReadableText>
                                <div className="flex items-start text-gray-600 mb-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                    <Info size={18} className="mr-3 mt-1 text-blue-500 flex-shrink-0" />
                                    <ReadableText 
                                        tag="p" 
                                        className="text-sm leading-relaxed whitespace-pre-line"
                                        textToRead={`Detail disabilitas: ${profile.disability_details}`}
                                    >
                                        {profile.disability_details}
                                    </ReadableText>
                                </div>
                            </>
                        )}

                        <ReadableText 
                            tag="div" 
                            className="mt-6 text-xs text-gray-400 text-center"
                            textToRead={`Bergabung pada ${new Date(profile.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}`}
                        >
                            Bergabung pada: {new Date(profile.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </ReadableText>
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
        </div>
    );
}