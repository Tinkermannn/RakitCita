import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import { toast } from 'react-toastify';
import ReadableText from '../../components/ReadableText/ReadableText';
import { ArrowLeft, Users, UploadCloud } from 'react-feather';

export default function CreateCommunityPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        bannerImage: null,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [previewBanner, setPreviewBanner] = useState(null);

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
                setPreviewBanner(null);
                e.target.value = null;
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
                toast.error("Format file banner tidak valid.");
                setFormData(prev => ({ ...prev, bannerImage: null }));
                setPreviewBanner(null);
                e.target.value = null;
                return;
            }
            setFormData(prev => ({ ...prev, bannerImage: file }));
            setPreviewBanner(URL.createObjectURL(file));
        } else {
            setFormData(prev => ({ ...prev, bannerImage: null }));
            setPreviewBanner(null);
        }
    };

    useEffect(() => {
        return () => {
            if (previewBanner) {
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
            const response = await apiClient.post('/communities', dataToSubmit, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                toast.success('Komunitas berhasil dibuat!');
                navigate(`/communities/${response.data.payload.community_id}`);
            } else {
                setError(response.data.message || 'Gagal membuat komunitas.');
                toast.error(response.data.message || 'Gagal membuat komunitas.');
            }
        } catch (err) {
            console.error("Create community error:", err.response || err.message || err);
            const errorMessage = err.response?.data?.message || 'Terjadi kesalahan server.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="container mx-auto p-4 md:p-8 max-w-2xl">
                <ReadableText
                    tag="button"
                    onClick={() => navigate(-1)}
                    className="mb-6 inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    textToRead="Tombol Kembali ke Halaman Sebelumnya"
                >
                    <ArrowLeft size={20} className="mr-2" /> Kembali
                </ReadableText>
                <div className="bg-white p-8 rounded-lg shadow-xl border border-blue-100">
                    <ReadableText tag="h1" className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                        <Users size={30} className="mr-3 text-blue-500" /> Buat Komunitas Baru
                    </ReadableText>
                    <ReadableText tag="p" className="text-gray-600 mb-8">
                        Bangun ruang untuk berdiskusi dan berbagi dengan minat yang sama.
                    </ReadableText>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <div className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</div>}
                        
                        <div>
                            <ReadableText tag="label" htmlFor="name_community" className="block text-sm font-medium text-gray-700 mb-1">
                                Nama Komunitas <span className="text-red-500">*</span>
                            </ReadableText>
                            <input 
                                type="text" 
                                name="name" 
                                id="name_community" 
                                value={formData.name} 
                                onChange={handleChange} 
                                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200" 
                                required 
                                placeholder="Contoh: Pecinta Fotografi Difabel"
                            />
                        </div>

                        <div>
                            <ReadableText tag="label" htmlFor="description_community" className="block text-sm font-medium text-gray-700 mb-1">
                                Deskripsi (Opsional)
                            </ReadableText>
                            <textarea 
                                name="description" 
                                id="description_community" 
                                rows="4" 
                                value={formData.description} 
                                onChange={handleChange} 
                                className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-200" 
                                placeholder="Jelaskan tentang komunitas ini, tujuannya, dan siapa saja yang bisa bergabung."
                            ></textarea>
                        </div>
                        
                        <div>
                            <ReadableText tag="label" htmlFor="bannerImage" className="block text-sm font-medium text-gray-700 mb-1">
                                Gambar Banner (Opsional)
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
                                            htmlFor="bannerImage" 
                                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 transition-colors duration-200"
                                            textToRead="Tombol Unggah File Banner"
                                        >
                                            <span>Unggah file</span>
                                            <input id="bannerImage" name="bannerImage" type="file" className="sr-only" onChange={handleFileChange} accept="image/jpeg, image/png, image/gif, image/webp" />
                                        </ReadableText>
                                        <ReadableText tag="p" className="pl-1">atau seret dan lepas</ReadableText>
                                    </div>
                                    <ReadableText tag="p" className="text-xs text-gray-500">PNG, JPG, GIF, WEBP hingga 5MB</ReadableText>
                                    {formData.bannerImage && <ReadableText tag="p" className="text-xs text-green-600 mt-1">{formData.bannerImage.name}</ReadableText>}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <ReadableText
                                tag="button"
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center px-6 py-2.5 text-base border border-transparent font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
                                textToRead="Tombol Buat Komunitas"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white inline-block mr-2"></div>
                                ) : null}
                                {loading ? "Menyimpan..." : "Buat Komunitas"}
                            </ReadableText>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}