import React from 'react';
import { useNavigate } from 'react-router-dom';
import ReadableText from '../ReadableText/ReadableText';

export default function Banner({ title, subtitle, buttonText, buttonLink, imageUrl, imageAlt = "Banner Image" }) {
    const navigate = useNavigate();

    return (
        <div className="relative bg-gray-800 text-white overflow-hidden">
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt={imageAlt}
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-700/60"></div>
            <div className="relative max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 text-center">
                <ReadableText
                    tag="h1"
                    className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white"
                    textToRead={`Judul banner: ${typeof title === 'string' ? title : 'Selamat Datang di RakitCita'}`}
                >
                    {title || "Selamat Datang di RakitCita"}
                </ReadableText>
                <ReadableText
                    tag="p"
                    className="mt-6 max-w-2xl mx-auto text-xl text-blue-100"
                    textToRead={`Deskripsi banner: ${typeof subtitle === 'string' ? subtitle : 'Temukan pelatihan, bergabung dengan komunitas, dan kembangkan potensi Anda bersama kami'}`}
                >
                    {subtitle || "Temukan pelatihan, bergabung dengan komunitas, dan kembangkan potensi Anda bersama kami."}
                </ReadableText>
                {buttonText && buttonLink && (
                    <div className="mt-10">
                        <ReadableText
                            tag="button"
                            onClick={() => navigate(buttonLink)}
                            className="inline-flex items-center bg-blue-600 border border-transparent rounded-md py-3 px-8 font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                            textToRead={`Tombol banner: ${buttonText}`}
                        >
                            {buttonText}
                        </ReadableText>
                    </div>
                )}
            </div>
        </div>
    );
}