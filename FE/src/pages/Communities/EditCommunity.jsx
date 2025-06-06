import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../services/api';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading/Loading';
import ReadableText from '../../components/ReadableText/ReadableText';
import { ArrowLeft, Save, UploadCloud } from 'react-feather';

export default function EditCommunityPage() {
    const { communityId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        bannerImage: null, // Untuk file baru
    });
    const [currentBannerUrl, setCurrentBannerUrl] = useState('');
    const [previewBanner, setPreviewBanner] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const userString = localStorage.getItem('user');
        if (userString) {
            setCurrentUser(JSON.parse(userString));
        }
    }, []);

    useEffect(() => {
        const fetchCommunityData = async () => {
            setPageLoading(true);
            try {
                const response = await apiClient.get(`/communities/${communityId}`);
                if (response.data.success) {
                    const communityData = response.data.payload;
                    // Otorisasi: Cek apakah user yang login adalah creator atau admin komunitas ini, atau platform admin
                    const isCreator = currentUser && communityData.creator_id === currentUser.user_id;
                    const isCommunityAdmin = currentUser && communityData.currentUserRoleInCommunity === 'admin'; // Dari backend
                    const isPlatformAdmin = currentUser && currentUser.role === 'admin';

                    if (isCreator || isCommunityAdmin || isPlatformAdmin) {
                        setFormData({
                            name: communityData.name,
                            description: communityData.description || '',
                            bannerImage: null,
                        });
                        setCurrentBannerUrl(communityData.banner_url || '');
                        setPreviewBanner(communityData.banner_url || null);
                    } else {
                        toast.error("Anda tidak diizinkan mengedit komunitas ini.");
                        navigate(`/communities/${communityId}`);
                    }
                } else {
                    toast.error("Gagal memuat data komunitas.");
                    navigate('/communities');
                }
            } catch (err) {
                toast.error("Terjadi kesalahan saat memuat data komunitas.");
                console.error("Fetch community for edit error:", err);
                navigate('/communities');
            } finally {
                setPageLoading(false);
            }
        };

        if (communityId && currentUser) {
            fetchCommunityData();
        } else if (communityId && !currentUser && localStorage.getItem('token')) {
            // Wait for currentUser state to be set
        } else if (!localStorage.getItem('token')) {
            navigate('/login');
        }

    }, [communityId, currentUser, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
         if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error("Ukuran file banner maksimal 5MB.");
                setFormData(prev => ({ ...prev, bannerImage: null }));
                setPreviewBanner(currentBannerUrl);
                e.target.value = null; 
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
                toast.error("Format file banner tidak valid.");
                setFormData(prev => ({ ...prev, bannerImage: null }));
                setPreviewBanner(currentBannerUrl);
                e.target.value = null;
                return;
            }
            setFormData(prev => ({ ...prev, bannerImage: file }));
            setPreviewBanner(URL.createObjectURL(file));
        } else {
            setFormData(prev => ({ ...prev, bannerImage: null }));
            setPreviewBanner(currentBannerUrl);
        }
    };
    
    useEffect(() => {
        return () => {
            if (previewBanner && previewBanner.startsWith('blob:')) {
                URL.revokeObjectURL(previewBanner);
            }
        };
    }, [previewBanner]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.name.trim()) {
            setError('Nama komunitas wajib diisi.');
            setLoading(false);
            toast.error('Nama komunitas wajib diisi.');
            return;
        }

        const dataToSubmit = new FormData();
        dataToSubmit.append('name', formData.name);
        dataToSubmit.append('description', formData.description);
        if (formData.bannerImage) {
            dataToSubmit.append('bannerImage', formData.bannerImage);
        }

        try {
            const response = await apiClient.put(`/communities/${communityId}`, dataToSubmit, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                toast.success('Komunitas berhasil diperbarui!');
                navigate(`/communities/${communityId}`);
            } else {
                setError(response.data.message || 'Gagal memperbarui komunitas.');
                toast.error(response.data.message || 'Gagal memperbarui komunitas.');
            }
        } catch (err) {
            console.error("Edit community error:", err.response || err.message || err);
            const errorMessage = err.response?.data?.message || 'Terjadi kesalahan server.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) return <div className="container mx-auto p-4"><Loading message="Memuat data komunitas..." /></div>;
    if (!formData.name && !pageLoading) return <div className="container mx-auto p-4 text-center">Data komunitas tidak ditemukan atau Anda tidak berhak mengedit.</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="container mx-auto p-4 md:p-8 max-w-2xl">
                <ReadableText
                    tag="button"
                    onClick={() => navigate(`/communities/${communityId}`)}
                    className="mb-6 inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    textToRead="Tombol Kembali ke Detail Komunitas"
                >
                    <ArrowLeft size={20} className="mr-2" /> Kembali ke Detail Komunitas
                </ReadableText>
                <div className="bg-white p-8 rounded-lg shadow-xl border border-blue-100">
                    <ReadableText tag="h1" className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                        <Save size={30} className="mr-3 text-blue-500" /> Edit Komunitas
                    </ReadableText>
                    <ReadableText tag="p" className="text-gray-600 mb-8">
                        Perbarui detail komunitas Anda.
                    </ReadableText>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <div className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</div>}
                        
                        <div>
                            <ReadableText tag="label" htmlFor="name_community_edit" className="block text-sm font-medium text-gray-700 mb-1">
                                Nama Komunitas <span className="text-red-500">*</span>
                            </ReadableText>
                            <input 
                                type="text" 
                                name="name" 
                                id="name_community_edit" 
                                value={formData.name} 
                                onChange={handleChange} 
                                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200" 
                                required
                            />
                        </div>

                        <div>
                            <ReadableText tag="label" htmlFor="description_community_edit" className="block text-sm font-medium text-gray-700 mb-1">
                                Deskripsi (Opsional)
                            </ReadableText>
                            <textarea 
                                name="description" 
                                id="description_community_edit" 
                                rows="4" 
                                value={formData.description} 
                                onChange={handleChange} 
                                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200"
                            ></textarea>
                        </div>
                        
                        <div>
                            <ReadableText tag="label" htmlFor="bannerImage_edit" className="block text-sm font-medium text-gray-700 mb-1">
                                Gambar Banner (Ganti jika perlu)
                            </ReadableText>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-blue-300 border-dashed rounded-md bg-blue-50">
                                <div className="space-y-1 text-center">
                                    {previewBanner ? (
                                        <img src={previewBanner} alt="Preview banner" className="mx-auto h-32 w-auto object-contain mb-2 rounded"/>
                                    ) : (
                                        <UploadCloud size={48} className="mx-auto text-gray-400" />
                                    )}
                                    <div className="flex text-sm text-gray-600">
                                        <ReadableText 
                                            tag="label" 
                                            htmlFor="bannerImage_edit" 
                                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 transition-colors duration-200"
                                            textToRead="Tombol Unggah File Banner Baru"
                                        >
                                            <span>Unggah file baru</span>
                                            <input id="bannerImage_edit" name="bannerImage" type="file" className="sr-only" onChange={handleFileChange} accept="image/jpeg, image/png, image/gif, image/webp"/>
                                        </ReadableText>
                                        <ReadableText tag="p" className="pl-1">atau seret dan lepas</ReadableText>
                                    </div>
                                    <ReadableText tag="p" className="text-xs text-gray-500">PNG, JPG, GIF, WEBP hingga 5MB</ReadableText>
                                    {formData.bannerImage && <ReadableText tag="p" className="text-xs text-green-600 mt-1">{formData.bannerImage.name} (File baru dipilih)</ReadableText>}
                                    {!formData.bannerImage && currentBannerUrl && <ReadableText tag="p" className="text-xs text-blue-600 mt-1">Menggunakan banner saat ini.</ReadableText>}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <ReadableText
                                tag="button"
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center px-6 py-2.5 text-base border border-transparent font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
                                textToRead="Tombol Simpan Perubahan Komunitas"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white inline-block mr-2"></div>
                                ) : null}
                                {loading ? "Menyimpan..." : "Simpan Perubahan"}
                            </ReadableText>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}