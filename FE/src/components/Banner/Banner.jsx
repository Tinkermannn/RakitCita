import React from 'react';
import { useNavigate } from 'react-router-dom';

// Anda mungkin ingin gambar banner yang lebih spesifik untuk platform disabilitas
// Untuk sekarang, ini adalah contoh banner umum
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
            <div className="relative max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                    {title || "Selamat Datang di RakitCita"}
                </h1>
                <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-300">
                    {subtitle || "Temukan pelatihan, bergabung dengan komunitas, dan kembangkan potensi Anda bersama kami."}
                </p>
                {buttonText && buttonLink && (
                    <div className="mt-10">
                        <button
                            onClick={() => navigate(buttonLink)}
                            className="inline-block bg-orange-500 border border-transparent rounded-md py-3 px-8 font-medium text-white hover:bg-orange-600 transition-colors"
                        >
                            {buttonText}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}