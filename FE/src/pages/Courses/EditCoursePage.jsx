import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../services/api';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading/Loading';
import { ArrowLeft, Save, UploadCloud } from 'react-feather';

export default function EditCoursePage() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        level: '',
        thumbnail: null, // Untuk file baru
    });
    const [currentThumbnailUrl, setCurrentThumbnailUrl] = useState('');
    const [previewThumbnail, setPreviewThumbnail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true); // Loading untuk fetch data awal
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    const categories = ["Teknologi", "Bisnis", "Desain", "Pemasaran", "Pengembangan Diri", "Keterampilan Kerja", "Lainnya"];
    const levels = [
        { value: "beginner", label: "Pemula" },
        { value: "intermediate", label: "Menengah" },
        { value: "advanced", label: "Mahir" },
        { value: "all", label: "Semua Level"}
    ];

    useEffect(() => {
        const userString = localStorage.getItem('user');
        if (userString) {
            setCurrentUser(JSON.parse(userString));
        }
    }, []);

    useEffect(() => {
        const fetchCourseData = async () => {
            setPageLoading(true);
            try {
                const response = await apiClient.get(`/courses/${courseId}`);
                if (response.data.success) {
                    const courseData = response.data.payload;
                    // Otorisasi: Cek apakah user yang login adalah instructor course ini atau admin
                    if (currentUser && (courseData.instructor_id === currentUser.user_id || currentUser.role === 'admin')) {
                        setFormData({
                            title: courseData.title,
                            description: courseData.description,
                            category: courseData.category,
                            level: courseData.level,
                            thumbnail: null, // Reset file input
                        });
                        setCurrentThumbnailUrl(courseData.thumbnail_url || '');
                        setPreviewThumbnail(courseData.thumbnail_url || null);
                    } else {
                        toast.error("Anda tidak diizinkan mengedit pelatihan ini.");
                        navigate(`/courses/${courseId}`); // Redirect jika tidak berhak
                    }
                } else {
                    toast.error("Gagal memuat data pelatihan.");
                    navigate('/courses');
                }
            } catch (err) {
                toast.error("Terjadi kesalahan saat memuat data pelatihan.");
                console.error("Fetch course for edit error:", err);
                navigate('/courses');
            } finally {
                setPageLoading(false);
            }
        };

        if (courseId && currentUser) { // Pastikan currentUser sudah ada sebelum fetch
            fetchCourseData();
        } else if (courseId && !currentUser && localStorage.getItem('token')) {
            // Jika token ada tapi currentUser belum ter-set, tunggu useEffect pertama selesai
            // Ini untuk menghindari race condition.
        } else if (!localStorage.getItem('token')) {
            // Jika tidak ada token, kemungkinan user belum login
            navigate('/login');
        }

    }, [courseId, currentUser, navigate]); // Tambahkan currentUser sebagai dependency

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
                setPreviewThumbnail(currentThumbnailUrl); // Kembalikan ke thumbnail lama jika ada
                e.target.value = null; 
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
                toast.error("Format file thumbnail tidak valid.");
                setFormData(prev => ({ ...prev, thumbnail: null }));
                setPreviewThumbnail(currentThumbnailUrl);
                e.target.value = null;
                return;
            }
            setFormData(prev => ({ ...prev, thumbnail: file }));
            setPreviewThumbnail(URL.createObjectURL(file));
        } else { // Jika user batal pilih file
            setFormData(prev => ({ ...prev, thumbnail: null }));
            setPreviewThumbnail(currentThumbnailUrl); // Kembali ke URL thumbnail lama
        }
    };
    
    useEffect(() => {
        return () => {
            if (previewThumbnail && previewThumbnail.startsWith('blob:')) { // Hanya revoke blob URL
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
        if (formData.thumbnail) { // Hanya kirim thumbnail jika ada file baru yang dipilih
            dataToSubmit.append('thumbnail', formData.thumbnail);
        }
        // Jika tidak ada thumbnail baru, backend tidak akan update field thumbnail_url

        try {
            const response = await apiClient.put(`/courses/${courseId}`, dataToSubmit, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                toast.success('Pelatihan berhasil diperbarui!');
                navigate(`/courses/${courseId}`);
            } else {
                setError(response.data.message || 'Gagal memperbarui pelatihan.');
                toast.error(response.data.message || 'Gagal memperbarui pelatihan.');
            }
        } catch (err) {
            console.error("Edit course error:", err.response || err.message || err);
            const errorMessage = err.response?.data?.message || 'Terjadi kesalahan server.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) return <div className="container mx-auto p-4"><Loading message="Memuat data pelatihan..." /></div>;
    if (!formData.title && !pageLoading) return <div className="container mx-auto p-4 text-center">Data pelatihan tidak ditemukan atau Anda tidak berhak mengedit.</div>;


    return (
        <div className="container mx-auto p-4 md:p-8 max-w-2xl">
            <button onClick={() => navigate(`/courses/${courseId}`)} className="mb-6 inline-flex items-center text-orange-600 hover:text-orange-800">
                <ArrowLeft size={20} className="mr-2" /> Kembali ke Detail Pelatihan
            </button>
            <div className="bg-white p-8 rounded-lg shadow-xl">
                <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                    <Save size={30} className="mr-3 text-orange-500" /> Edit Pelatihan
                </h1>
                <p className="text-gray-600 mb-8">Perbarui detail pelatihan Anda.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <div className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</div>}
                    
                    <div>
                        <label htmlFor="title_edit" className="block text-sm font-medium text-gray-700 mb-1">Judul Pelatihan <span className="text-red-500">*</span></label>
                        <input type="text" name="title" id="title_edit" value={formData.title} onChange={handleChange} className="input-field" required />
                    </div>

                    <div>
                        <label htmlFor="description_edit" className="block text-sm font-medium text-gray-700 mb-1">Deskripsi <span className="text-red-500">*</span></label>
                        <textarea name="description" id="description_edit" rows="5" value={formData.description} onChange={handleChange} className="input-field" required></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="category_edit" className="block text-sm font-medium text-gray-700 mb-1">Kategori <span className="text-red-500">*</span></label>
                            <select name="category" id="category_edit" value={formData.category} onChange={handleChange} className="input-field" required>
                                <option value="" disabled>Pilih Kategori</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="level_edit" className="block text-sm font-medium text-gray-700 mb-1">Level Kesulitan <span className="text-red-500">*</span></label>
                            <select name="level" id="level_edit" value={formData.level} onChange={handleChange} className="input-field" required>
                                {levels.map(lvl => <option key={lvl.value} value={lvl.value}>{lvl.label}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="thumbnail_edit" className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Pelatihan (Ganti jika perlu)</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                {previewThumbnail ? (
                                    <img src={previewThumbnail} alt="Preview thumbnail" className="mx-auto h-32 w-auto object-contain mb-2 rounded"/>
                                ) : (
                                    <UploadCloud size={48} className="mx-auto text-gray-400" />
                                )}
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="thumbnail_edit" className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500">
                                        <span>Unggah file baru</span>
                                        <input id="thumbnail_edit" name="thumbnail" type="file" className="sr-only" onChange={handleFileChange} accept="image/jpeg, image/png, image/gif, image/webp"/>
                                    </label>
                                    <p className="pl-1">atau seret dan lepas</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP hingga 5MB</p>
                                {formData.thumbnail && <p className="text-xs text-green-600 mt-1">{formData.thumbnail.name} (File baru dipilih)</p>}
                                {!formData.thumbnail && currentThumbnailUrl && <p className="text-xs text-blue-600 mt-1">Menggunakan thumbnail saat ini.</p>}
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
                            {loading ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}