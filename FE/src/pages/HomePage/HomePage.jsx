import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Banner from "../../components/Banner/Banner";
import CourseCard from "../../components/CourseCard/CourseCard";
import CommunityCard from "../../components/CommunityCard/CommunityCard";
import Loading from "../../components/Loading/Loading";
import apiClient from "../../services/api";
import LandingBannerImage from '../../assets/Login/login.png'; // Pastikan gambar ini ada dan sesuai
import { ArrowRight } from "react-feather";
import ReadableText from "../../components/ReadableText/ReadableText"; // <--- PASTIKAN PATH INI BENAR

export default function HomePage() {
    const navigate = useNavigate();
    const [latestCourses, setLatestCourses] = useState([]);
    const [popularCommunities, setPopularCommunities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const coursesPromise = apiClient.get('/courses?limit=3&page=1');
                const communitiesPromise = apiClient.get('/communities?limit=3&page=1');

                const [coursesResponse, communitiesResponse] = await Promise.all([coursesPromise, communitiesPromise]);
                
                setLatestCourses(coursesResponse.data.payload.data || []);
                setPopularCommunities(communitiesResponse.data.payload.data || []);

            } catch (error) {
                console.error("Error fetching homepage data:", error);
                // toast.error("Gagal memuat data terbaru."); // Aktifkan jika menggunakan react-toastify
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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
                        // speakOnMount // Jika ingin dibaca saat halaman load, tambahkan ini
                        // textToRead="Ruang Inklusif, Potensi Tanpa Batas." // Bisa juga gabungkan teksnya
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
                        onClick={() => navigate('/register')}
                        className="btn btn-primary text-lg px-8 py-3 transform hover:scale-105 transition-transform duration-300"
                        textToRead="Tombol Mulai Sekarang, Gratis!" // Teks yang akan dibaca saat dihover
                    >
                        Mulai Sekarang, Gratis!
                    </ReadableText>
                </div>
            </div>

            {/* Featured Courses Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <ReadableText tag="h2" className="text-3xl font-bold text-gray-800">
                            Pelatihan Unggulan
                        </ReadableText>
                        <ReadableText tag="p" className="text-gray-600 mt-2">
                            Tingkatkan keahlian Anda dengan kursus pilihan kami.
                        </ReadableText>
                    </div>
                    {loading ? (
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
                            {/* Membungkus teks di dalam Link agar bisa di-hover untuk TTS */}
                            <ReadableText tag="span" textToRead="Lihat Semua Pelatihan">
                                Lihat Semua Pelatihan
                            </ReadableText>
                            <ArrowRight size={20} className="ml-2" aria-hidden="true" /> {/* Ikon tidak perlu dibaca */}
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Communities Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <ReadableText tag="h2" className="text-3xl font-bold text-gray-800">
                            Komunitas Populer
                        </ReadableText>
                        <ReadableText tag="p" className="text-gray-600 mt-2">
                            Bergabung dan berinteraksi dengan komunitas yang relevan.
                        </ReadableText>
                    </div>
                    {loading ? (
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

            {/* Call to Action Banner (menggunakan komponen Banner) */}
            <Banner 
                title={
                    <ReadableText tag="span"> {/* Bungkus dengan ReadableText jika ingin dibaca saat hover */}
                        Siap Mengambil Langkah Berikutnya?
                    </ReadableText>
                }
                subtitle={
                    <ReadableText tag="span">
                        Jadilah bagian dari RakitCita dan mulailah perjalanan Anda menuju kemandirian dan kesuksesan.
                    </ReadableText>
                }
                buttonText="Daftar Sekarang" // Tombol di dalam Banner mungkin perlu dimodifikasi juga jika ingin TTS
                buttonLink="/register"
            />
        </>
    );
}