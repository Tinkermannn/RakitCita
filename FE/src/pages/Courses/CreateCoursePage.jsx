import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import ReadableText from '../../components/ReadableText/ReadableText';
import { toast } from 'react-toastify';
import { ArrowLeft, PlusCircle, UploadCloud } from 'react-feather';

export default function CreateCoursePage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        level: 'beginner',
        thumbnail: null,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [previewThumbnail, setPreviewThumbnail] = useState(null);

    const categories = ["Teknologi", "Bisnis", "Desain", "Pemasaran", "Pengembangan Diri", "Keterampilan Kerja", "Lainnya"];
    const levels = [
        { value: "beginner", label: "Pemula" },
        { value: "intermediate", label: "Menengah" },
        { value: "advanced", label: "Mahir" },
        { value: "all", label: "Semua Level"}
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Ukuran file thumbnail maksimal 5MB.");
                setFormData(prev => ({ ...prev, thumbnail: null }));
                setPreviewThumbnail(null);
                e.target.value = null;
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
                toast.error("Format file thumbnail tidak valid. Gunakan JPG, PNG, GIF, atau WEBP.");
                setFormData(prev => ({ ...prev, thumbnail: null }));
                setPreviewThumbnail(null);
                e.target.value = null;
                return;
            }
            setFormData(prev => ({ ...prev, thumbnail: file }));
            setPreviewThumbnail(URL.createObjectURL(file));
        } else {
            setFormData(prev => ({ ...prev, thumbnail: null }));
            setPreviewThumbnail(null);
        }
    };
    
    useEffect(() => {
        return () => {
            if (previewThumbnail) {
                URL.revokeObjectURL(previewThumbnail);
            }
        };
    }, [previewThumbnail]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.title || !formData.description || !formData.category || !formData.level) {
            setError('Semua field yang ditandai wajib diisi.');
            setLoading(false);
            toast.error('Harap lengkapi semua field yang wajib diisi.');
            return;
        }

        const dataToSubmit = new FormData();
        dataToSubmit.append('title', formData.title);
        dataToSubmit.append('description', formData.description);
        dataToSubmit.append('category', formData.category);
        dataToSubmit.append('level', formData.level);
        if (formData.thumbnail) {
            dataToSubmit.append('thumbnail', formData.thumbnail);
        }

        try {
            const response = await apiClient.post('/courses', dataToSubmit, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                toast.success('Pelatihan berhasil dibuat!');
                navigate(`/courses/${response.data.payload.course_id}`);
            } else {
                setError(response.data.message || 'Gagal membuat pelatihan.');
                toast.error(response.data.message || 'Gagal membuat pelatihan.');
            }
        } catch (err) {
            console.error("Create course error:", err.response || err.message || err);
            const errorMessage = err.response?.data?.message || 'Terjadi kesalahan server.';
            setError(errorMessage);
            toast.error(errorMessage);
             if (err.response?.data?.payload?.errors) {
                const validationErrors = err.response.data.payload.errors.map(e => e.msg).join('\n');
                setError(prev => prev + '\n' + validationErrors);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-2xl">
            <ReadableText
                tag="button"
                onClick={() => navigate(-1)}
                className="mb-6 inline-flex items-center text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md transition-colors duration-200"
                textToRead="Tombol untuk kembali ke halaman sebelumnya"
            >
                <ArrowLeft size={20} className="mr-2" /> Kembali
            </ReadableText>
            
            <div className="bg-white p-8 rounded-lg shadow-xl border border-blue-100">
                <ReadableText tag="h1" className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                    <PlusCircle size={30} className="mr-3 text-blue-500" /> Buat Pelatihan Baru
                </ReadableText>
                <ReadableText tag="p" className="text-gray-600 mb-8">
                    Bagikan pengetahuan dan keahlian Anda kepada komunitas.
                </ReadableText>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <ReadableText 
                            tag="div" 
                            className="text-sm text-red-600 bg-red-100 p-3 rounded-md whitespace-pre-line border border-red-200"
                            textToRead={`Error: ${error}`}
                        >
                            {error}
                        </ReadableText>
                    )}
                    
                    <div>
                        <ReadableText 
                            tag="label" 
                            htmlFor="title" 
                            className="block text-sm font-medium text-gray-700 mb-1"
                            textToRead="Label untuk input judul pelatihan, field wajib"
                        >
                            Judul Pelatihan <span className="text-red-500">*</span>
                        </ReadableText>
                        <input 
                            type="text" 
                            name="title" 
                            id="title" 
                            value={formData.title} 
                            onChange={handleChange} 
                            className="w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200" 
                            required 
                            placeholder="Contoh: Dasar Pemrograman Python untuk Pemula"
                        />
                    </div>

                    <div>
                        <ReadableText 
                            tag="label" 
                            htmlFor="description" 
                            className="block text-sm font-medium text-gray-700 mb-1"
                            textToRead="Label untuk input deskripsi pelatihan, field wajib"
                        >
                            Deskripsi <span className="text-red-500">*</span>
                        </ReadableText>
                        <textarea 
                            name="description" 
                            id="description" 
                            rows="5" 
                            value={formData.description} 
                            onChange={handleChange} 
                            className="w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200" 
                            required 
                            placeholder="Jelaskan secara detail tentang pelatihan ini, apa yang akan dipelajari, dan untuk siapa."
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <ReadableText 
                                tag="label" 
                                htmlFor="category" 
                                className="block text-sm font-medium text-gray-700 mb-1"
                                textToRead="Label untuk pilihan kategori pelatihan, field wajib"
                            >
                                Kategori <span className="text-red-500">*</span>
                            </ReadableText>
                            <select 
                                name="category" 
                                id="category" 
                                value={formData.category} 
                                onChange={handleChange} 
                                className="w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200" 
                                required
                            >
                                <option value="" disabled>Pilih Kategori</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <ReadableText 
                                tag="label" 
                                htmlFor="level" 
                                className="block text-sm font-medium text-gray-700 mb-1"
                                textToRead="Label untuk pilihan level kesulitan pelatihan, field wajib"
                            >
                                Level Kesulitan <span className="text-red-500">*</span>
                            </ReadableText>
                            <select 
                                name="level" 
                                id="level" 
                                value={formData.level} 
                                onChange={handleChange} 
                                className="w-full px-3 py-2 border border-blue-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200" 
                                required
                            >
                                {levels.map(lvl => <option key={lvl.value} value={lvl.value}>{lvl.label}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <ReadableText 
                            tag="label" 
                            htmlFor="thumbnail" 
                            className="block text-sm font-medium text-gray-700 mb-1"
                            textToRead="Label untuk upload thumbnail pelatihan, field opsional"
                        >
                            Thumbnail Pelatihan (Opsional)
                        </ReadableText>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-blue-300 border-dashed rounded-md hover:border-blue-400 transition-colors duration-200">
                            <div className="space-y-1 text-center">
                                {previewThumbnail ? (
                                    <img src={previewThumbnail} alt="Preview thumbnail" className="mx-auto h-32 w-auto object-contain mb-2 rounded"/>
                                ) : (
                                    <UploadCloud size={48} className="mx-auto text-blue-400" />
                                )}
                                <div className="flex text-sm text-gray-600">
                                    <ReadableText
                                        tag="label"
                                        htmlFor="thumbnail"
                                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 transition-colors duration-200"
                                        textToRead="Tombol untuk mengunggah file thumbnail"
                                    >
                                        <span>Unggah file</span>
                                        <input 
                                            id="thumbnail" 
                                            name="thumbnail" 
                                            type="file" 
                                            className="sr-only" 
                                            onChange={handleFileChange} 
                                            accept="image/jpeg, image/png, image/gif, image/webp" 
                                        />
                                    </ReadableText>
                                    <ReadableText tag="p" className="pl-1" textToRead="atau seret dan lepas file">
                                        atau seret dan lepas
                                    </ReadableText>
                                </div>
                                <ReadableText tag="p" className="text-xs text-gray-500" textToRead="Format file yang didukung PNG, JPG, GIF, WEBP hingga 5MB">
                                    PNG, JPG, GIF, WEBP hingga 5MB
                                </ReadableText>
                                {formData.thumbnail && (
                                    <ReadableText 
                                        tag="p" 
                                        className="text-xs text-green-600 mt-1"
                                        textToRead={`File terpilih: ${formData.thumbnail.name}`}
                                    >
                                        {formData.thumbnail.name}
                                    </ReadableText>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <ReadableText
                            tag="button"
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center px-6 py-2.5 text-base border border-transparent font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                            textToRead={loading ? "Sedang menyimpan pelatihan" : "Tombol untuk membuat pelatihan baru"}
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white inline-block mr-2"></div>
                            ) : null}
                            {loading ? "Menyimpan..." : "Buat Pelatihan"}
                        </ReadableText>
                    </div>
                </form>
            </div>
        </div>
    );
}