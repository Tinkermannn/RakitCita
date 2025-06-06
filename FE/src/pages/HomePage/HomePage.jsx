// src/pages/HomePage/HomePage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Banner from "../../components/Banner/Banner";
import CourseCard from "../../components/CourseCard/CourseCard"; // Pastikan CourseCard bisa menampilkan alasan jika ada
import CommunityCard from "../../components/CommunityCard/CommunityCard"; // Pastikan CommunityCard bisa menampilkan alasan jika ada
import Loading from "../../components/Loading/Loading";
import apiClient from "../../services/api";
import LandingBannerImage from '../../assets/Login/login.png';
import { ArrowRight, Zap, HelpCircle } from "react-feather";
import ReadableText from "../../components/ReadableText/ReadableText";
import { toast } from 'react-toastify'; // Untuk notifikasi jika ada error

export default function HomePage() {
    const navigate = useNavigate();
    const [latestCourses, setLatestCourses] = useState([]);
    const [popularCommunities, setPopularCommunities] = useState([]);
    const [loadingGeneral, setLoadingGeneral] = useState(true); // Ganti nama state loading

    const [currentUser, setCurrentUser] = useState(null);
    const [recommendedCourses, setRecommendedCourses] = useState([]);
    const [recommendedCommunities, setRecommendedCommunities] = useState([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [recommendationError, setRecommendationError] = useState('');


    useEffect(() => {
        const userString = localStorage.getItem('user');
        if (userString) {
            setCurrentUser(JSON.parse(userString));
        }

        const fetchGeneralData = async () => { // Ganti nama fungsi
            setLoadingGeneral(true);
            try {
                const coursesPromise = apiClient.get('/courses?limit=3&page=1');
                const communitiesPromise = apiClient.get('/communities?limit=3&page=1');
                const [coursesResponse, communitiesResponse] = await Promise.all([coursesPromise, communitiesPromise]);
                setLatestCourses(coursesResponse.data.payload.data || []);
                setPopularCommunities(communitiesResponse.data.payload.data || []);
            } catch (error) {
                console.error("Error fetching homepage general data:", error);
                // toast.error("Gagal memuat beberapa data halaman utama.");
            } finally {
                setLoadingGeneral(false);
            }
        };
        fetchGeneralData();
    }, []);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (currentUser && (currentUser.bio || currentUser.disability_details)) {
                setLoadingRecommendations(true);
                setShowRecommendations(true);
                setRecommendationError(''); // Reset error
                try {
                    const response = await apiClient.post('/recommendations', { // Endpoint dari backend
                        bio: currentUser.bio,
                        disabilityDetails: currentUser.disability_details
                    });

                    if (response.data.success && response.data.payload) {
                        setRecommendedCourses(response.data.payload.recommendedCourses || []);
                        setRecommendedCommunities(response.data.payload.recommendedCommunities || []);
                        if ((response.data.payload.recommendedCourses || []).length === 0 && (response.data.payload.recommendedCommunities || []).length === 0) {
                            // Jika AI tidak mengembalikan apa-apa, mungkin beri tahu pengguna
                            setRecommendationError("Kami belum menemukan rekomendasi yang sangat spesifik untuk Anda saat ini. Silakan jelajahi pilihan lainnya!");
                        }
                    } else {
                        console.warn("AI recommendations not successful or payload missing:", response.data.message);
                        setRecommendedCourses([]);
                        setRecommendedCommunities([]);
                        setRecommendationError(response.data.message || "Tidak dapat mengambil rekomendasi saat ini.");
                    }
                } catch (error) {
                    console.error("Error fetching AI recommendations:", error.response?.data?.message || error.message);
                    setRecommendedCourses([]);
                    setRecommendedCommunities([]);
                    const errMsg = error.response?.data?.message || "Terjadi kesalahan saat mengambil rekomendasi AI.";
                    setRecommendationError(errMsg);
                    // toast.error(errMsg); // Tampilkan notifikasi error
                } finally {
                    setLoadingRecommendations(false);
                }
            } else {
                setShowRecommendations(false);
            }
        };

        if (currentUser !== null) { // Pastikan currentUser sudah di-resolve (bisa jadi objek atau null)
            fetchRecommendations();
        }
    }, [currentUser]);

    // Fungsi untuk render kartu dengan alasan
    const renderRecommendedItem = (item, type) => {
        const cardProps = type === 'course' ? { course: item } : { community: item };
        return (
            <div key={`${type}-${item.course_id || item.community_id}`} className="flex flex-col">
                {type === 'course' ? <CourseCard {...cardProps} /> : <CommunityCard {...cardProps} />}
                {item.recommendationReason && (
                    <div className="mt-2 p-2.5 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-700 flex items-start">
                        <HelpCircle size={16} className="mr-2 flex-shrink-0 mt-0.5 text-yellow-600" />
                        <ReadableText tag="p" textToRead={`Alasan direkomendasikan: ${item.recommendationReason}`}>
                            <strong>Mengapa ini direkomendasikan:</strong> {item.recommendationReason}
                        </ReadableText>
                    </div>
                )}
            </div>
        );
    };


    return (
        <>
            {/* Hero Section */}
            <div
                className="relative w-full h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] bg-cover bg-center flex items-center justify-center"
                style={{ backgroundImage: `url(${LandingBannerImage})` }}
            >
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="relative z-10 text-center px-4">
                    <ReadableText
                        tag="h1"
                        className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6"
                    >
                        <span className="block">Ruang Inklusif,</span>
                        <span className="block text-orange-400">Potensi Tanpa Batas.</span>
                    </ReadableText>
                    <ReadableText
                        tag="p"
                        className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto mb-8"
                    >
                        Temukan pelatihan yang memberdayakan, bergabunglah dengan komunitas suportif, dan raih impianmu bersama RakitCita.
                    </ReadableText>
                    <ReadableText
                        tag="button"
                        onClick={() => navigate(currentUser ? '/dashboard' : '/register')} // Arahkan ke dashboard jika sudah login
                        className="btn btn-primary text-lg px-8 py-3 transform hover:scale-105 transition-transform duration-300"
                        textToRead={currentUser ? "Tombol Masuk ke Dashboard Anda" : "Tombol Mulai Sekarang, Gratis!"}
                    >
                        {currentUser ? "Dashboard Saya" : "Mulai Sekarang, Gratis!"}
                    </ReadableText>
                </div>
            </div>


            {/* AI Recommendations Section */}
            {showRecommendations && (
                <section className="py-16 bg-orange-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <ReadableText tag="h2" className="text-3xl font-bold text-orange-700 flex items-center justify-center">
                                <Zap size={30} className="mr-3" /> Rekomendasi Untuk Anda
                            </ReadableText>
                            <ReadableText tag="p" className="text-gray-600 mt-2">
                                Berdasarkan profil Anda, berikut beberapa hal yang mungkin cocok.
                            </ReadableText>
                        </div>
                        {loadingRecommendations ? (
                            <Loading message="Menganalisis profil & mencari rekomendasi terbaik..." />
                        ) : recommendationError ? (
                            <ReadableText tag="p" className="text-center text-orange-700 bg-orange-100 p-4 rounded-md">
                                {recommendationError}
                            </ReadableText>
                        ) : (
                            <>
                                {recommendedCourses.length > 0 && (
                                    <div className="mb-12">
                                        <ReadableText tag="h3" className="text-2xl font-semibold text-gray-800 mb-6 text-left md:text-center">
                                            Pelatihan Direkomendasikan:
                                        </ReadableText>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                                            {recommendedCourses.map(course => renderRecommendedItem(course, 'course'))}
                                        </div>
                                    </div>
                                )}
                                {recommendedCommunities.length > 0 && (
                                    <div className="mb-6">
                                        <ReadableText tag="h3" className="text-2xl font-semibold text-gray-800 mb-6 text-left md:text-center">
                                            Komunitas Direkomendasikan:
                                        </ReadableText>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                                            {recommendedCommunities.map(community => renderRecommendedItem(community, 'community'))}
                                        </div>
                                    </div>
                                )}
                                {/* Pesan ini sekarang dihandle oleh recommendationError state */}
                            </>
                        )}
                    </div>
                </section>
            )}

            {/* Featured Courses Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <ReadableText tag="h2" className="text-3xl font-bold text-gray-800">
                            {(showRecommendations && (recommendedCourses.length > 0 || recommendedCommunities.length > 0)) && !recommendationError
                                ? "Pelatihan Lainnya"
                                : "Pelatihan Unggulan"}
                        </ReadableText>
                        <ReadableText tag="p" className="text-gray-600 mt-2">
                            Tingkatkan keahlian Anda dengan kursus pilihan kami.
                        </ReadableText>
                    </div>
                    {loadingGeneral ? (
                        <Loading message="Memuat pelatihan..." />
                    ) : latestCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {latestCourses.map(course => (
                                <CourseCard key={course.course_id} course={course} />
                            ))}
                        </div>
                    ) : (
                        <ReadableText tag="p" className="text-center text-gray-500">
                            Belum ada pelatihan tersedia saat ini.
                        </ReadableText>
                    )}
                    <div className="text-center mt-10">
                        <Link to="/courses" className="btn btn-outline inline-flex items-center">
                            <ReadableText tag="span" textToRead="Lihat Semua Pelatihan">
                                Lihat Semua Pelatihan
                            </ReadableText>
                            <ArrowRight size={20} className="ml-2" aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Communities Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <ReadableText tag="h2" className="text-3xl font-bold text-gray-800">
                            {(showRecommendations && (recommendedCourses.length > 0 || recommendedCommunities.length > 0)) && !recommendationError
                                ? "Komunitas Lainnya"
                                : "Komunitas Populer"}
                        </ReadableText>
                        <ReadableText tag="p" className="text-gray-600 mt-2">
                            Bergabung dan berinteraksi dengan komunitas yang relevan.
                        </ReadableText>
                    </div>
                    {loadingGeneral ? (
                        <Loading message="Memuat komunitas..." />
                    ) : popularCommunities.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {popularCommunities.map(community => (
                                <CommunityCard key={community.community_id} community={community} />
                            ))}
                        </div>
                    ) : (
                        <ReadableText tag="p" className="text-center text-gray-500">
                            Belum ada komunitas tersedia saat ini.
                        </ReadableText>
                    )}
                     <div className="text-center mt-10">
                        <Link to="/communities" className="btn btn-outline inline-flex items-center">
                            <ReadableText tag="span" textToRead="Lihat Semua Komunitas">
                                Lihat Semua Komunitas
                            </ReadableText>
                            <ArrowRight size={20} className="ml-2" aria-hidden="true" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Call to Action Banner */}
            <Banner 
                title={ <ReadableText tag="span">Siap Mengambil Langkah Berikutnya?</ReadableText> }
                subtitle={ <ReadableText tag="span">Jadilah bagian dari RakitCita dan mulailah perjalanan Anda.</ReadableText> }
                buttonText="Daftar Sekarang"
                buttonLink="/register"
            />
        </>
    );
}