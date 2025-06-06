import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'react-feather';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-4">
            <AlertTriangle size={80} className="text-orange-500 mb-6" />
            <h1 className="text-5xl font-bold text-gray-800 mb-3">404</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Halaman Tidak Ditemukan</h2>
            <p className="text-gray-600 max-w-md mb-8">
                Maaf, halaman yang Anda cari tidak ada atau mungkin telah dipindahkan.
                Silakan periksa kembali URL Anda atau kembali ke beranda.
            </p>
            <Link
                to="/home"
                className="btn btn-primary inline-flex items-center text-lg px-6 py-3"
            >
                <Home size={20} className="mr-2" />
                Kembali ke Beranda
            </Link>
        </div>
    );
}