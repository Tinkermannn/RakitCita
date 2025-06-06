import React from 'react';
import { Link } from 'react-router-dom';
import ReadableText from '../ReadableText/ReadableText';
import DefaultCourseImage from '../../assets/Login/login.png';
import { BookOpen, User, BarChart2 } from 'react-feather';

export default function CourseCard({ course }) {
    const imageUrl = course.thumbnail_url || DefaultCourseImage;

    const levelLabels = {
        beginner: 'Pemula',
        intermediate: 'Menengah', 
        advanced: 'Mahir',
        all: 'Semua Level'
    };

    const levelLabel = levelLabels[course.level] || course.level;

    return (
        <ReadableText
            tag={Link}
            to={`/courses/${course.course_id}`}
            className="block group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-all duration-200"
            textToRead={`Link ke detail pelatihan ${course.title}`}
        >
            <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 border border-blue-100 hover:border-blue-300">
                <div className="relative h-48 bg-blue-50">
                    <img 
                        src={imageUrl} 
                        alt={`Thumbnail untuk pelatihan ${course.title}`}
                        className="w-full h-full object-cover" 
                        onError={(e) => { e.target.onerror = null; e.target.src=DefaultCourseImage; }}
                    />
                    {course.level && (
                        <div className="absolute top-3 right-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                {levelLabel}
                            </span>
                        </div>
                    )}
                </div>
                <div className="p-5">
                    <ReadableText 
                        tag="h3" 
                        className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors truncate" 
                        title={course.title}
                        textToRead={`Judul pelatihan: ${course.title}`}
                    >
                        {course.title}
                    </ReadableText>
                    <ReadableText 
                        tag="p" 
                        className="text-sm text-gray-600 mb-3 h-10 overflow-hidden text-ellipsis"
                        textToRead={`Deskripsi: ${course.description.substring(0, 80)}${course.description.length > 80 ? ', dan seterusnya' : ''}`}
                    >
                        {course.description.substring(0, 80)}{course.description.length > 80 && "..."}
                    </ReadableText>
                    <div className="space-y-2 text-xs text-gray-500">
                        {course.instructor_name && (
                            <div className="flex items-center">
                                <User size={14} className="mr-2 text-blue-500 flex-shrink-0" />
                                <ReadableText 
                                    tag="span"
                                    textToRead={`Instruktur: ${course.instructor_name}`}
                                >
                                    Instruktur: {course.instructor_name}
                                </ReadableText>
                            </div>
                        )}
                        {course.category && (
                            <div className="flex items-center">
                                <BookOpen size={14} className="mr-2 text-blue-500 flex-shrink-0" />
                                <ReadableText 
                                    tag="span"
                                    textToRead={`Kategori: ${course.category}`}
                                >
                                    Kategori: {course.category}
                                </ReadableText>
                            </div>
                        )}
                        {course.level && (
                            <div className="flex items-center">
                                <BarChart2 size={14} className="mr-2 text-blue-500 flex-shrink-0" />
                                <ReadableText 
                                    tag="span"
                                    textToRead={`Level kesulitan: ${levelLabel}`}
                                >
                                    Level: {levelLabel}
                                </ReadableText>
                            </div>
                        )}
                    </div>
                </div>
                <div className="px-5 py-3 bg-blue-50 border-t border-blue-200">
                    <ReadableText 
                        tag="span" 
                        className="text-sm font-medium text-blue-600 group-hover:underline flex items-center"
                        textToRead="Klik untuk melihat detail pelatihan"
                    >
                        Lihat Detail Pelatihan
                        <svg 
                            className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </ReadableText>
                </div>
            </div>
        </ReadableText>
    );
}