import React from 'react';
import { Link } from 'react-router-dom';
import DefaultCourseImage from '../../assets/Login/login.png'; // Placeholder image
import { BookOpen, User, BarChart2 } from 'react-feather';

export default function CourseCard({ course }) {
    const imageUrl = course.thumbnail_url || DefaultCourseImage;

    return (
        <Link to={`/courses/${course.course_id}`} className="block group">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
                <div className="relative h-48 bg-gray-200">
                    <img 
                        src={imageUrl} 
                        alt={course.title} 
                        className="w-full h-full object-cover" 
                        onError={(e) => { e.target.onerror = null; e.target.src=DefaultCourseImage; }} // Fallback for broken image links
                    />
                </div>
                <div className="p-5">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors truncate" title={course.title}>
                        {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 h-10 overflow-hidden text-ellipsis">
                        {course.description.substring(0, 80)}{course.description.length > 80 && "..."}
                    </p>
                    <div className="space-y-1 text-xs text-gray-500">
                        {course.instructor_name && (
                            <div className="flex items-center">
                                <User size={14} className="mr-2 text-orange-500" />
                                <span>Instruktur: {course.instructor_name}</span>
                            </div>
                        )}
                        {course.category && (
                            <div className="flex items-center">
                                <BookOpen size={14} className="mr-2 text-orange-500" />
                                <span>Kategori: {course.category}</span>
                            </div>
                        )}
                        {course.level && (
                            <div className="flex items-center">
                                <BarChart2 size={14} className="mr-2 text-orange-500" />
                                <span className="capitalize">Level: {course.level}</span>
                            </div>
                        )}
                    </div>
                </div>
                 <div className="px-5 py-3 bg-gray-50 border-t border-gray-200">
                    <span className="text-sm font-medium text-orange-600 group-hover:underline">
                        Lihat Detail Pelatihan
                    </span>
                </div>
            </div>
        </Link>
    );
}