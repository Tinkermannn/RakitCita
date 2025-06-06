import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading/Loading';
import DefaultCourseImage from '../../assets/todologo.png';

import { User, Calendar, BarChart2, CheckCircle, Edit3, Trash2, ArrowLeft, Send, MessageSquare, Clock } from 'react-feather';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { id } from 'date-fns/locale'; // Untuk format tanggal Indonesia

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

    const fetchCourseDetails = async () => {
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
    };

    const checkEnrollmentStatus = async () => {
        if (!currentUser) return;
        try {
            // Asumsi: kita perlu cek ke daftar enrolled courses user
            // Jika ada endpoint khusus untuk cek enrollment by courseId, gunakan itu.
            // Untuk MVP, kita bisa fetch semua enrolled courses dan cek manual.
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
            // Tidak perlu toast error di sini, user mungkin belum login
        }
    };


    useEffect(() => {
        fetchCourseDetails();
    }, [courseId]);

    useEffect(() => {
        if (currentUser && course) { // Cek setelah course detail ada
            checkEnrollmentStatus();
             if (course.instructor_id === currentUser.user_id) {
                setIsInstructor(true);
            }
        }
    }, [currentUser, course, courseId]);


    const handleEnroll = async () => {
        if (!currentUser) {
            toast.info("Silakan login terlebih dahulu untuk mendaftar pelatihan.");
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
        setLoading(true); // Atau state loading spesifik untuk enroll
        try {
            const response = await apiClient.post(`/courses/${courseId}/enroll`);
            if (response.data.success) {
                toast.success("Berhasil mendaftar pelatihan!");
                setIsEnrolled(true);
                setEnrollmentDetails(response.data.payload); // Backend harus return detail enrollment
                // Mungkin fetch ulang detail course jika perlu update data terkait enrollment
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
        // setLoadingProgress(true) // state loading spesifik
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
        // finally { setLoadingProgress(false) }
    };

    const handleDeleteCourse = async () => {
        if (!isInstructor) return;
        if (window.confirm("Apakah Anda yakin ingin menghapus pelatihan ini? Tindakan ini tidak dapat diurungkan.")) {
            setLoading(true); // Atau state loading spesifik
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
        setLoadingComments(true); // Simulasikan loading
        setTimeout(() => { // Simulasikan API call
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
    if (error) return <div className="container mx-auto p-4 text-center text-red-500 bg-red-100 p-4 rounded-md">{error}</div>;
    if (!course) return <div className="container mx-auto p-4 text-center">Detail pelatihan tidak ditemukan.</div>;

    const imageUrl = course.thumbnail_url || DefaultCourseImage;

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center text-orange-600 hover:text-orange-800">
                    <ArrowLeft size={20} className="mr-2" /> Kembali
                </button>

                <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                    {/* Header Pelatihan */}
                    <div className="relative">
                        <img src={imageUrl} alt={course.title} className="w-full h-64 md:h-96 object-cover" 
                             onError={(e) => { e.target.onerror = null; e.target.src = DefaultCourseImage; }}/>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-6 md:p-8">
                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{course.title}</h1>
                            {course.instructor_name && (
                                <Link to={`/profile/${course.instructor_id}`} className="text-orange-300 hover:text-orange-100 flex items-center text-sm">
                                    <img src={course.instructor_profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor_name)}&background=random`} 
                                         alt={course.instructor_name} className="w-6 h-6 rounded-full mr-2 object-cover"/>
                                    Oleh {course.instructor_name}
                                </Link>
                            )}
                        </div>
                        {isInstructor && (
                            <div className="absolute top-4 right-4 space-x-2">
                                <Link to={`/courses/edit/${courseId}`} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-md">
                                    <Edit3 size={18} />
                                </Link>
                                <button onClick={handleDeleteCourse} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Detail Konten */}
                    <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Deskripsi Pelatihan</h2>
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{course.description}</p>
                            
                            {/* TODO: Tambahkan bagian untuk modul/materi pelajaran jika ada */}
                            <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">Materi Pelajaran (Contoh)</h3>
                            <ul className="space-y-3 list-disc list-inside text-gray-700">
                                <li>Modul 1: Pengenalan Dasar</li>
                                <li>Modul 2: Konsep Inti</li>
                                <li>Modul 3: Studi Kasus dan Aplikasi</li>
                                <li>Modul 4: Proyek Akhir</li>
                            </ul>

                             {/* Bagian Diskusi/Komentar (Dummy) */}
                            <div className="mt-10 pt-6 border-t">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                                    <MessageSquare size={24} className="mr-2 text-orange-500"/> Diskusi Pelatihan
                                </h3>
                                {currentUser ? (
                                    <form onSubmit={handleAddComment} className="mb-6">
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Tulis komentar Anda di sini..."
                                            rows="3"
                                            className="input-field w-full mb-2"
                                            required
                                        ></textarea>
                                        <button type="submit" className="btn btn-primary btn-sm inline-flex items-center" disabled={loadingComments}>
                                            <Send size={16} className="mr-2"/> {loadingComments ? 'Mengirim...' : 'Kirim Komentar'}
                                        </button>
                                    </form>
                                ) : (
                                    <p className="text-sm text-gray-600 mb-4">
                                        <Link to="/login" state={{from: location.pathname}} className="text-orange-600 hover:underline">Masuk</Link> untuk berdiskusi.
                                    </p>
                                )}
                                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                    {comments.length > 0 ? comments.map(comment => (
                                        <div key={comment.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
                                            <img src={comment.avatar} alt={comment.user} className="w-10 h-10 rounded-full object-cover"/>
                                            <div>
                                                <p className="font-semibold text-sm text-gray-800">{comment.user}</p>
                                                <p className="text-sm text-gray-600">{comment.text}</p>
                                                <p className="text-xs text-gray-400 mt-1 flex items-center">
                                                    <Clock size={12} className="mr-1"/> {formatDistanceToNow(parseISO(comment.timestamp), { addSuffix: true, locale: id })}
                                                </p>
                                            </div>
                                        </div>
                                    )) : <p className="text-sm text-gray-500">Belum ada komentar.</p>}
                                </div>
                            </div>

                        </div>

                        {/* Sidebar Detail */}
                        <aside className="lg:col-span-1 space-y-6">
                            <div className="p-6 bg-orange-50 rounded-lg border border-orange-200">
                                <h3 className="text-lg font-semibold text-orange-700 mb-3">Detail Pelatihan</h3>
                                <div className="space-y-2 text-sm text-gray-700">
                                    {course.category && (
                                        <p className="flex items-center"><User size={16} className="mr-2 text-orange-600" /> Kategori: <strong>{course.category}</strong></p>
                                    )}
                                    {course.level && (
                                        <p className="flex items-center capitalize"><BarChart2 size={16} className="mr-2 text-orange-600" /> Level: <strong>{course.level}</strong></p>
                                    )}
                                    <p className="flex items-center"><Calendar size={16} className="mr-2 text-orange-600" /> Dibuat: <strong>{new Date(course.created_at).toLocaleDateString('id-ID')}</strong></p>
                                    {/* Tambahkan info lain seperti durasi, jumlah modul, dll. */}
                                </div>
                            </div>
                            
                            {/* Aksi Pengguna (Enroll, Progress) */}
                            {currentUser && (
                                <div className="p-6 bg-white rounded-lg shadow">
                                    {isEnrolled ? (
                                        <div>
                                            <div className="flex items-center text-green-600 mb-3">
                                                <CheckCircle size={20} className="mr-2" />
                                                <h3 className="text-lg font-semibold">Anda Terdaftar</h3>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-1">Progres Anda: {enrollmentDetails?.progress || 0}%</p>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-3">
                                                <div className="bg-orange-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${enrollmentDetails?.progress || 0}%` }}></div>
                                            </div>
                                            {enrollmentDetails?.progress < 100 && (
                                                <div className="flex space-x-2">
                                                     <button 
                                                        onClick={() => handleUpdateProgress(Math.min(100, (enrollmentDetails?.progress || 0) + 25))} // Contoh increment
                                                        className="btn btn-outline btn-sm w-full"
                                                    >
                                                        Tandai Selesai Sebagian
                                                    </button>
                                                    <button 
                                                        onClick={() => handleUpdateProgress(100)}
                                                        className="btn btn-primary btn-sm w-full"
                                                    >
                                                        Selesaikan Pelatihan
                                                    </button>
                                                </div>
                                            )}
                                            {enrollmentDetails?.completed_at && (
                                                <p className="text-xs text-green-500 mt-2">Selesai pada: {new Date(enrollmentDetails.completed_at).toLocaleDateString('id-ID')}</p>
                                            )}
                                        </div>
                                    ) : !isInstructor ? ( // Jangan tampilkan tombol daftar jika dia instrukturnya
                                        <button 
                                            onClick={handleEnroll} 
                                            disabled={loading} // Atau state loading spesifik
                                            className="btn btn-primary w-full text-lg py-3"
                                        >
                                            {loading ? "Memproses..." : "Daftar Pelatihan Ini"}
                                        </button>
                                    ) : (
                                        <p className="text-sm text-center text-gray-500">Anda adalah instruktur pelatihan ini.</p>
                                    )}
                                </div>
                            )}
                            {!currentUser && !isInstructor && (
                                 <div className="p-6 bg-white rounded-lg shadow">
                                    <button 
                                        onClick={() => {navigate('/login', { state: { from: location.pathname } })}}
                                        className="btn btn-primary w-full text-lg py-3"
                                    >
                                        Login untuk Mendaftar
                                    </button>
                                 </div>
                            )}

                             {/* Informasi Instruktur */}
                            {course.instructor_name && (
                                <div className="p-6 bg-white rounded-lg shadow">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Tentang Instruktur</h3>
                                    <div className="flex items-center space-x-3 mb-2">
                                        <img src={course.instructor_profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor_name)}&background=random&size=64`} 
                                             alt={course.instructor_name} className="w-16 h-16 rounded-full object-cover"/>
                                        <div>
                                            <Link to={`/profile/${course.instructor_id}`} className="font-semibold text-orange-600 hover:underline">{course.instructor_name}</Link>
                                            {/* <p className="text-xs text-gray-500">Jabatan Instruktur</p> */}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {course.instructor_bio ? course.instructor_bio.substring(0,150) + '...' : 'Instruktur ini belum menambahkan bio.'}
                                    </p>
                                    <Link to={`/profile/${course.instructor_id}`} className="text-sm text-orange-600 hover:underline mt-2 inline-block">Lihat profil instruktur</Link>
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            </div>
        </div>
    );
}