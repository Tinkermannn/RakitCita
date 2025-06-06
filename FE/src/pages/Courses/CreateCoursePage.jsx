import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import { toast } from 'react-toastify';
import { ArrowLeft, PlusCircle, UploadCloud } from 'react-feather';

export default function CreateCoursePage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        level: 'beginner', // Default level
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
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error("Ukuran file thumbnail maksimal 5MB.");
                setFormData(prev => ({ ...prev, thumbnail: null }));
                setPreviewThumbnail(null);
                e.target.value = null; // Reset input file
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
    
    // Cleanup URL Object
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
                navigate(`/courses/${response.data.payload.course_id}`); // Arahkan ke detail pelatihan baru
            } else {
                setError(response.data.message || 'Gagal membuat pelatihan.');
                toast.error(response.data.message || 'Gagal membuat pelatihan.');
            }
        } catch (err) {
            console.error("Create course error:", err.response || err.message || err);
            const errorMessage = err.response?.data?.message || 'Terjadi kesalahan server.';
            setError(errorMessage);
            toast.error(errorMessage);
             if (err.response?.data?.payload?.errors) { // Jika ada validasi error dari backend
                const validationErrors = err.response.data.payload.errors.map(e => e.msg).join('\n');
                setError(prev => prev + '\n' + validationErrors);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-2xl">
            <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center text-orange-600 hover:text-orange-800">
                <ArrowLeft size={20} className="mr-2" /> Kembali
            </button>
            <div className="bg-white p-8 rounded-lg shadow-xl">
                <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                    <PlusCircle size={30} className="mr-3 text-orange-500" /> Buat Pelatihan Baru
                </h1>
                <p className="text-gray-600 mb-8">Bagikan pengetahuan dan keahlian Anda kepada komunitas.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="text-sm text-red-600 bg-red-100 p-3 rounded-md whitespace-pre-line">{error}</div>}
                    
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Judul Pelatihan <span className="text-red-500">*</span></label>
                        <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="input-field" required placeholder="Contoh: Dasar Pemrograman Python untuk Pemula"/>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Deskripsi <span className="text-red-500">*</span></label>
                        <textarea name="description" id="description" rows="5" value={formData.description} onChange={handleChange} className="input-field" required placeholder="Jelaskan secara detail tentang pelatihan ini, apa yang akan dipelajari, dan untuk siapa."></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Kategori <span className="text-red-500">*</span></label>
                            <select name="category" id="category" value={formData.category} onChange={handleChange} className="input-field" required>
                                <option value="" disabled>Pilih Kategori</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">Level Kesulitan <span className="text-red-500">*</span></label>
                            <select name="level" id="level" value={formData.level} onChange={handleChange} className="input-field" required>
                                {levels.map(lvl => <option key={lvl.value} value={lvl.value}>{lvl.label}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Pelatihan (Opsional)</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                {previewThumbnail ? (
                                    <img src={previewThumbnail} alt="Preview thumbnail" className="mx-auto h-32 w-auto object-contain mb-2 rounded"/>
                                ) : (
                                    <UploadCloud size={48} className="mx-auto text-gray-400" />
                                )}
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="thumbnail" className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500">
                                        <span>Unggah file</span>
                                        <input id="thumbnail" name="thumbnail" type="file" className="sr-only" onChange={handleFileChange} accept="image/jpeg, image/png, image/gif, image/webp" />
                                    </label>
                                    <p className="pl-1">atau seret dan lepas</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP hingga 5MB</p>
                                {formData.thumbnail && <p className="text-xs text-green-600 mt-1">{formData.thumbnail.name}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary px-6 py-2.5 text-base disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white inline-block mr-2"></div>
                            ) : null}
                            {loading ? "Menyimpan..." : "Buat Pelatihan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}