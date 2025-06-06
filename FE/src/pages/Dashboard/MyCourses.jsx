import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import CourseCard from '../../components/CourseCard/CourseCard';
import Loading from '../../components/Loading/Loading';
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
            const response = await apiClient.get(`/courses/instructor/me`); // Endpoint untuk kursus yg dibuat user ini
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
                    <p className="text-gray-500 mb-4">
                        {type === 'enrolled' 
                            ? "Anda belum mengikuti pelatihan apapun." 
                            : "Anda belum membuat pelatihan apapun."}
                    </p>
                    {type === 'enrolled' && 
                        <Link to="/courses" className="btn btn-primary">
                            Cari Pelatihan
                        </Link>
                    }
                     {type === 'created' && (user.role === 'mentor' || user.role === 'admin') &&
                        <Link to="/courses/create" className="btn btn-primary inline-flex items-center">
                            <PlusCircle size={18} className="mr-2"/> Buat Pelatihan Baru
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
            <div className="mb-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveSubTab('enrolled')}
                        className={`${
                            activeSubTab === 'enrolled'
                                ? 'border-orange-500 text-orange-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Pelatihan Diikuti
                    </button>
                    {(user.role === 'mentor' || user.role === 'admin') && (
                        <button
                            onClick={() => setActiveSubTab('created')}
                            className={`${
                                activeSubTab === 'created'
                                    ? 'border-orange-500 text-orange-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Pelatihan Dibuat
                        </button>
                    )}
                </nav>
            </div>

            {activeSubTab === 'enrolled' && (
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Pelatihan yang Saya Ikuti</h2>
                    {renderCourseList(enrolledCourses, loadingEnrolled, 'enrolled')}
                </div>
            )}

            {activeSubTab === 'created' && (user.role === 'mentor' || user.role === 'admin') && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold text-gray-800">Pelatihan yang Saya Buat</h2>
                        <Link to="/courses/create" className="btn btn-primary btn-sm inline-flex items-center">
                            <PlusCircle size={18} className="mr-2"/> Buat Pelatihan
                        </Link>
                    </div>
                    {renderCourseList(createdCourses, loadingCreated, 'created')}
                </div>
            )}
        </div>
    );
}