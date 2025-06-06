import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading/Loading';
import ReadableText from '../../components/ReadableText/ReadableText';
import DefaultCourseImage from '../../assets/todologo.png';

import { User, Calendar, BarChart2, CheckCircle, Edit3, Trash2, ArrowLeft, Send, MessageSquare, Clock } from 'react-feather';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export default function CourseDetailPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrollmentDetails, setEnrollmentDetails] = useState(null);
    const [isInstructor, setIsInstructor] = useState(false);

    // Dummy comments state
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);

    useEffect(() => {
        const userString = localStorage.getItem('user');
        if (userString) {
            setCurrentUser(JSON.parse(userString));
        }
    }, []);

    const fetchCourseDetails = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await apiClient.get(`/courses/${courseId}`);
            if (response.data.success) {
                const fetchedCourse = response.data.payload;
                setCourse(fetchedCourse);
                if (currentUser && fetchedCourse.instructor_id === currentUser.user_id) {
                    setIsInstructor(true);
                }
                // Fetch dummy comments
                setComments([
                    { id: 1, user: 'Budi', text: 'Materi sangat bermanfaat!', timestamp: new Date(Date.now() - 3600000).toISOString(), avatar: `https://ui-avatars.com/api/?name=Budi&background=random`},
                    { id: 2, user: 'Ani', text: 'Penjelasannya mudah dipahami.', timestamp: new Date(Date.now() - 7200000).toISOString(), avatar: `https://ui-avatars.com/api/?name=Ani&background=random` },
                ]);
            } else {
                setError(response.data.message || 'Gagal memuat detail pelatihan.');
                toast.error(response.data.message || 'Gagal memuat detail pelatihan.');
            }
        } catch (err) {
            console.error("Fetch course detail error:", err.response || err.message || err);
            const errorMessage = err.response?.data?.message || 'Terjadi kesalahan server.';
            setError(errorMessage);
            toast.error(errorMessage);
            if (err.response?.status === 404) {
                navigate('/404');
            }
        } finally {
            setLoading(false);
        }
    }, [courseId, currentUser, navigate]);

    const checkEnrollmentStatus = useCallback(async () => {
        if (!currentUser) return;
        try {
            const response = await apiClient.get('/courses/enrolled/me');
            if (response.data.success) {
                const enrolled = response.data.payload.data.find(c => c.course_id === courseId);
                if (enrolled) {
                    setIsEnrolled(true);
                    setEnrollmentDetails(enrolled);
                } else {
                    setIsEnrolled(false);
                    setEnrollmentDetails(null);
                }
            }
        } catch (error) {
            console.error("Error checking enrollment status:", error);
        }
    }, [currentUser, courseId]);

    useEffect(() => {
        fetchCourseDetails();
    }, [fetchCourseDetails]);

    useEffect(() => {
        if (currentUser && course) {
            checkEnrollmentStatus();
            if (course.instructor_id === currentUser.user_id) {
                setIsInstructor(true);
            }
        }
    }, [currentUser, course, courseId, checkEnrollmentStatus]);

    const handleEnroll = async () => {
        if (!currentUser) {
            toast.info("Silakan login terlebih dahulu untuk mendaftar pelatihan.");
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
        setLoading(true);
        try {
            const response = await apiClient.post(`/courses/${courseId}/enroll`);
            if (response.data.success) {
                toast.success("Berhasil mendaftar pelatihan!");
                setIsEnrolled(true);
                setEnrollmentDetails(response.data.payload);
            } else {
                toast.error(response.data.message || "Gagal mendaftar pelatihan.");
            }
        } catch (error) {
            console.error("Enroll error:", error);
            toast.error(error.response?.data?.message || "Terjadi kesalahan saat mendaftar.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleUpdateProgress = async (newProgress) => {
        if (!isEnrolled || !enrollmentDetails) return;
        try {
            const response = await apiClient.patch(`/courses/${courseId}/progress`, { progress: newProgress });
            if (response.data.success) {
                setEnrollmentDetails(response.data.payload);
                toast.success("Progres berhasil diperbarui!");
            } else {
                toast.error(response.data.message || "Gagal memperbarui progres.");
            }
        } catch (error) {
            console.error("Update progress error:", error);
            toast.error(error.response?.data?.message || "Terjadi kesalahan saat update progres.");
        }
    };

    const handleDeleteCourse = async () => {
        if (!isInstructor) return;
        if (window.confirm("Apakah Anda yakin ingin menghapus pelatihan ini? Tindakan ini tidak dapat diurungkan.")) {
            setLoading(true);
            try {
                const response = await apiClient.delete(`/courses/${courseId}`);
                if (response.data.success) {
                    toast.success("Pelatihan berhasil dihapus.");
                    navigate('/courses');
                } else {
                    toast.error(response.data.message || "Gagal menghapus pelatihan.");
                }
            } catch (error) {
                console.error("Delete course error:", error);
                toast.error(error.response?.data?.message || "Terjadi kesalahan saat menghapus.");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleAddComment = (e) => {
        e.preventDefault();
        if (!newComment.trim() || !currentUser) return;
        setLoadingComments(true);
        setTimeout(() => {
            const commentToAdd = {
                id: comments.length + 1,
                user: currentUser.name,
                text: newComment,
                timestamp: new Date().toISOString(),
                avatar: currentUser.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`
            };
            setComments(prev => [commentToAdd, ...prev]);
            setNewComment('');
            setLoadingComments(false);
            toast.success("Komentar ditambahkan!");
        }, 500);
    };

    if (loading && !course) return <div className="container mx-auto p-4"><Loading message="Memuat detail pelatihan..." /></div>;
    if (error) return <div className="container mx-auto p-4 text-center text-red-500 bg-red-100 rounded-md">{error}</div>;
    if (!course) return <div className="container mx-auto p-4 text-center">Detail pelatihan tidak ditemukan.</div>;

    const imageUrl = course.thumbnail_url || DefaultCourseImage;

    return (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <ReadableText
                    tag="button"
                    onClick={() => navigate(-1)}
                    className="mb-6 inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
                    textToRead="Tombol Kembali ke Halaman Sebelumnya"
                >
                    <ArrowLeft size={20} className="mr-2" /> Kembali
                </ReadableText>

                <div className="bg-white shadow-xl rounded-lg overflow-hidden border border-blue-100">
                    {/* Header Pelatihan */}
                    <div className="relative">
                        <img src={imageUrl} alt={course.title} className="w-full h-64 md:h-96 object-cover" 
                             onError={(e) => { e.target.onerror = null; e.target.src = DefaultCourseImage; }}/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6 md:p-8">
                            <ReadableText tag="h1" className="text-3xl md:text-4xl font-bold text-white mb-2">
                                {course.title}
                            </ReadableText>
                            {course.instructor_name && (
                                <Link to={`/profile/${course.instructor_id}`} className="text-blue-300 hover:text-blue-100 flex items-center text-sm transition-colors duration-200">
                                    <img src={course.instructor_profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor_name)}&background=random`} 
                                         alt={course.instructor_name} className="w-6 h-6 rounded-full mr-2 object-cover"/>
                                    <ReadableText tag="span" textToRead={`Instruktur: ${course.instructor_name}`}>
                                        Oleh {course.instructor_name}
                                    </ReadableText>
                                </Link>
                            )}
                        </div>
                        {isInstructor && (
                            <div className="absolute top-4 right-4 space-x-2">
                                <Link to={`/courses/edit/${courseId}`} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-md transition-colors duration-200">
                                    <Edit3 size={18} />
                                </Link>
                                <ReadableText
                                    tag="button"
                                    onClick={handleDeleteCourse}
                                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md transition-colors duration-200"
                                    textToRead="Tombol Hapus Pelatihan"
                                >
                                    <Trash2 size={18} />
                                </ReadableText>
                            </div>
                        )}
                    </div>

                    {/* Detail Konten */}
                    <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <ReadableText tag="h2" className="text-2xl font-semibold text-gray-800 mb-4">
                                Deskripsi Pelatihan
                            </ReadableText>
                            <ReadableText tag="p" className="text-gray-700 leading-relaxed whitespace-pre-line mb-8">
                                {course.description}
                            </ReadableText>
                            
                            <ReadableText tag="h3" className="text-xl font-semibold text-gray-800 mt-8 mb-4">
                                Materi Pelajaran (Contoh)
                            </ReadableText>
                            <ul className="space-y-3 list-disc list-inside text-gray-700 mb-10">
                                <ReadableText tag="li">Modul 1: Pengenalan Dasar</ReadableText>
                                <ReadableText tag="li">Modul 2: Konsep Inti</ReadableText>
                                <ReadableText tag="li">Modul 3: Studi Kasus dan Aplikasi</ReadableText>
                                <ReadableText tag="li">Modul 4: Proyek Akhir</ReadableText>
                            </ul>

                            {/* Bagian Diskusi/Komentar */}
                            <div className="pt-6 border-t border-blue-100">
                                <ReadableText tag="h3" className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <MessageSquare size={24} className="mr-2 text-blue-500"/> Diskusi Pelatihan
                                </ReadableText>
                                {currentUser ? (
                                    <form onSubmit={handleAddComment} className="mb-6">
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Tulis komentar Anda di sini..."
                                            rows="3"
                                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2 transition-colors duration-200"
                                            required
                                        ></textarea>
                                        <ReadableText
                                            tag="button"
                                            type="submit"
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
                                            disabled={loadingComments}
                                            textToRead="Tombol Kirim Komentar"
                                        >
                                            <Send size={16} className="mr-2"/> {loadingComments ? 'Mengirim...' : 'Kirim Komentar'}
                                        </ReadableText>
                                    </form>
                                ) : (
                                    <ReadableText tag="p" className="text-sm text-gray-600 mb-4">
                                        <Link to="/login" state={{from: location.pathname}} className="text-blue-600 hover:underline">Masuk</Link> untuk berdiskusi.
                                    </ReadableText>
                                )}
                                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                    {comments.length > 0 ? comments.map(comment => (
                                        <div key={comment.id} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-md border border-blue-100">
                                            <img src={comment.avatar} alt={comment.user} className="w-10 h-10 rounded-full object-cover"/>
                                            <div>
                                                <ReadableText tag="p" className="font-semibold text-sm text-gray-800">
                                                    {comment.user}
                                                </ReadableText>
                                                <ReadableText tag="p" className="text-sm text-gray-600">
                                                    {comment.text}
                                                </ReadableText>
                                                <ReadableText tag="p" className="text-xs text-gray-400 mt-1 flex items-center">
                                                    <Clock size={12} className="mr-1"/> {formatDistanceToNow(parseISO(comment.timestamp), { addSuffix: true, locale: id })}
                                                </ReadableText>
                                            </div>
                                        </div>
                                    )) : (
                                        <ReadableText tag="p" className="text-sm text-gray-500">
                                            Belum ada komentar.
                                        </ReadableText>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Detail */}
                        <aside className="lg:col-span-1 space-y-6">
                            <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                                <ReadableText tag="h3" className="text-lg font-semibold text-blue-700 mb-3">
                                    Detail Pelatihan
                                </ReadableText>
                                <div className="space-y-2 text-sm text-gray-700">
                                    {course.category && (
                                        <ReadableText tag="p" className="flex items-center">
                                            <User size={16} className="mr-2 text-blue-600" /> Kategori: <strong className="ml-1">{course.category}</strong>
                                        </ReadableText>
                                    )}
                                    {course.level && (
                                        <ReadableText tag="p" className="flex items-center capitalize">
                                            <BarChart2 size={16} className="mr-2 text-blue-600" /> Level: <strong className="ml-1">{course.level}</strong>
                                        </ReadableText>
                                    )}
                                    <ReadableText tag="p" className="flex items-center">
                                        <Calendar size={16} className="mr-2 text-blue-600" /> Dibuat: <strong className="ml-1">{new Date(course.created_at).toLocaleDateString('id-ID')}</strong>
                                    </ReadableText>
                                </div>
                            </div>
                            
                            {/* Aksi Pengguna (Enroll, Progress) */}
                            {currentUser && (
                                <div className="p-6 bg-white rounded-lg shadow border border-blue-100">
                                    {isEnrolled ? (
                                        <div>
                                            <div className="flex items-center text-green-600 mb-3">
                                                <CheckCircle size={20} className="mr-2" />
                                                <ReadableText tag="h3" className="text-lg font-semibold">
                                                    Anda Terdaftar
                                                </ReadableText>
                                            </div>
                                            <ReadableText tag="p" className="text-sm text-gray-600 mb-1">
                                                Progres Anda: {enrollmentDetails?.progress || 0}%
                                            </ReadableText>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                                                <div className="bg-blue-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${enrollmentDetails?.progress || 0}%` }}></div>
                                            </div>
                                            {enrollmentDetails?.progress < 100 && (
                                                <div className="flex space-x-2">
                                                    <ReadableText
                                                        tag="button"
                                                        onClick={() => handleUpdateProgress(Math.min(100, (enrollmentDetails?.progress || 0) + 25))}
                                                        className="flex-1 px-3 py-2 text-sm border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                                        textToRead="Tombol Tandai Selesai Sebagian"
                                                    >
                                                        Tandai Selesai Sebagian
                                                    </ReadableText>
                                                    <ReadableText
                                                        tag="button"
                                                        onClick={() => handleUpdateProgress(100)}
                                                        className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                                        textToRead="Tombol Selesaikan Pelatihan"
                                                    >
                                                        Selesaikan Pelatihan
                                                    </ReadableText>
                                                </div>
                                            )}
                                            {enrollmentDetails?.completed_at && (
                                                <ReadableText tag="p" className="text-xs text-green-500 mt-2">
                                                    Selesai pada: {new Date(enrollmentDetails.completed_at).toLocaleDateString('id-ID')}
                                                </ReadableText>
                                            )}
                                        </div>
                                    ) : !isInstructor ? (
                                        <ReadableText
                                            tag="button"
                                            onClick={handleEnroll}
                                            disabled={loading}
                                            className="w-full px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
                                            textToRead="Tombol Daftar Pelatihan Ini"
                                        >
                                            {loading ? "Memproses..." : "Daftar Pelatihan Ini"}
                                        </ReadableText>
                                    ) : (
                                        <ReadableText tag="p" className="text-sm text-center text-gray-500">
                                            Anda adalah instruktur pelatihan ini.
                                        </ReadableText>
                                    )}
                                </div>
                            )}
                            {!currentUser && !isInstructor && (
                                <div className="p-6 bg-white rounded-lg shadow border border-blue-100">
                                    <ReadableText
                                        tag="button"
                                        onClick={() => {navigate('/login', { state: { from: location.pathname } })}}
                                        className="w-full px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                        textToRead="Tombol Login untuk Mendaftar"
                                    >
                                        Login untuk Mendaftar
                                    </ReadableText>
                                </div>
                            )}

                            {/* Informasi Instruktur */}
                            {course.instructor_name && (
                                <div className="p-6 bg-white rounded-lg shadow border border-blue-100">
                                    <ReadableText tag="h3" className="text-lg font-semibold text-gray-800 mb-3">
                                        Tentang Instruktur
                                    </ReadableText>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <img src={course.instructor_profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor_name)}&background=random&size=64`} 
                                             alt={course.instructor_name} className="w-16 h-16 rounded-full object-cover"/>
                                        <div>
                                            <Link to={`/profile/${course.instructor_id}`} className="font-semibold text-blue-600 hover:underline">
                                                <ReadableText tag="span" textToRead={`Profil instruktur ${course.instructor_name}`}>
                                                    {course.instructor_name}
                                                </ReadableText>
                                            </Link>
                                        </div>
                                    </div>
                                    <ReadableText tag="p" className="text-sm text-gray-600 leading-relaxed mb-2">
                                        {course.instructor_bio ? course.instructor_bio.substring(0,150) + '...' : 'Instruktur ini belum menambahkan bio.'}
                                    </ReadableText>
                                    <Link to={`/profile/${course.instructor_id}`} className="text-sm text-blue-600 hover:underline inline-block">
                                        <ReadableText tag="span" textToRead="Link Lihat profil instruktur">
                                            Lihat profil instruktur
                                        </ReadableText>
                                    </Link>
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            </div>
        </div>
    );
}