import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import CourseCard from '../../components/CourseCard/CourseCard';
import Loading from '../../components/Loading/Loading';
import ReadableText from '../../components/ReadableText/ReadableText';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { PlusCircle } from 'react-feather';

export default function MyCourses({ user }) {
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [createdCourses, setCreatedCourses] = useState([]);
    const [loadingEnrolled, setLoadingEnrolled] = useState(true);
    const [loadingCreated, setLoadingCreated] = useState(true);
    const [activeSubTab, setActiveSubTab] = useState('enrolled'); // 'enrolled' or 'created'

    const fetchEnrolledCourses = async () => {
        setLoadingEnrolled(true);
        try {
            const response = await apiClient.get('/courses/enrolled/me');
            if (response.data.success) {
                setEnrolledCourses(response.data.payload.data || []);
            } else {
                toast.error("Gagal memuat pelatihan yang diikuti.");
            }
        } catch (error) {
            console.error("Error fetching enrolled courses:", error);
            toast.error("Terjadi kesalahan saat memuat pelatihan yang diikuti.");
        } finally {
            setLoadingEnrolled(false);
        }
    };

    const fetchCreatedCourses = async () => {
        if (user.role !== 'mentor' && user.role !== 'admin') {
            setLoadingCreated(false);
            return;
        }
        setLoadingCreated(true);
        try {
            const response = await apiClient.get(`/courses/instructor/me`);
            if (response.data.success) {
                setCreatedCourses(response.data.payload.data || []);
            } else {
                toast.error("Gagal memuat pelatihan yang Anda buat.");
            }
        } catch (error) {
            console.error("Error fetching created courses:", error);
            toast.error("Terjadi kesalahan saat memuat pelatihan yang Anda buat.");
        } finally {
            setLoadingCreated(false);
        }
    };

    useEffect(() => {
        fetchEnrolledCourses();
        if (user.role === 'mentor' || user.role === 'admin') {
            fetchCreatedCourses();
        }
    }, [user.role]);

    const renderCourseList = (courses, isLoading, type) => {
        if (isLoading) return <Loading message={`Memuat pelatihan ${type === 'enrolled' ? 'yang diikuti' : 'yang dibuat'}...`} />;
        if (courses.length === 0) {
            return (
                <div className="text-center py-10">
                    <ReadableText 
                        tag="p" 
                        className="text-gray-500 mb-4"
                        textToRead={type === 'enrolled' 
                            ? "Anda belum mengikuti pelatihan apapun" 
                            : "Anda belum membuat pelatihan apapun"}
                    >
                        {type === 'enrolled' 
                            ? "Anda belum mengikuti pelatihan apapun." 
                            : "Anda belum membuat pelatihan apapun."}
                    </ReadableText>
                    {type === 'enrolled' && 
                        <Link 
                            to="/courses" 
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            <ReadableText tag="span" textToRead="Link untuk mencari pelatihan">
                                Cari Pelatihan
                            </ReadableText>
                        </Link>
                    }
                     {type === 'created' && (user.role === 'mentor' || user.role === 'admin') &&
                        <Link 
                            to="/courses/create" 
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            <PlusCircle size={18} className="mr-2"/>
                            <ReadableText tag="span" textToRead="Link untuk membuat pelatihan baru">
                                Buat Pelatihan Baru
                            </ReadableText>
                        </Link>
                    }
                </div>
            );
        }
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                    <CourseCard key={course.course_id} course={course} />
                ))}
            </div>
        );
    };

    return (
        <div>
            <div className="mb-6 border-b border-blue-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <ReadableText
                        tag="button"
                        onClick={() => setActiveSubTab('enrolled')}
                        className={`${
                            activeSubTab === 'enrolled'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-blue-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                        textToRead="Tab untuk melihat pelatihan yang diikuti"
                    >
                        Pelatihan Diikuti
                    </ReadableText>
                    {(user.role === 'mentor' || user.role === 'admin') && (
                        <ReadableText
                            tag="button"
                            onClick={() => setActiveSubTab('created')}
                            className={`${
                                activeSubTab === 'created'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-blue-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                            textToRead="Tab untuk melihat pelatihan yang dibuat"
                        >
                            Pelatihan Dibuat
                        </ReadableText>
                    )}
                </nav>
            </div>

            {activeSubTab === 'enrolled' && (
                <div>
                    <ReadableText tag="h2" className="text-2xl font-semibold text-gray-800 mb-6">
                        Pelatihan yang Saya Ikuti
                    </ReadableText>
                    {renderCourseList(enrolledCourses, loadingEnrolled, 'enrolled')}
                </div>
            )}

            {activeSubTab === 'created' && (user.role === 'mentor' || user.role === 'admin') && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <ReadableText tag="h2" className="text-2xl font-semibold text-gray-800">
                            Pelatihan yang Saya Buat
                        </ReadableText>
                        <Link 
                            to="/courses/create" 
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                        >
                            <PlusCircle size={18} className="mr-2"/>
                            <ReadableText tag="span" textToRead="Link untuk membuat pelatihan baru">
                                Buat Pelatihan
                            </ReadableText>
                        </Link>
                    </div>
                    {renderCourseList(createdCourses, loadingCreated, 'created')}
                </div>
            )}
        </div>
    );
}