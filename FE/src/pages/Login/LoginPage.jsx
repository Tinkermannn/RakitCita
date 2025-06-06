import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../../services/api';
import { toast } from 'react-toastify';
import { LogIn, Mail, Lock } from 'react-feather';
// import styles from './login.module.css'; // Contoh penggunaan CSS module jika ada

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.email || !formData.password) {
            setError('Email dan password harus diisi.');
            setLoading(false);
            return;
        }

        try {
            const response = await apiClient.post('/users/login', formData);
            if (response.data.success) {
                localStorage.setItem('token', response.data.payload.token);
                localStorage.setItem('user', JSON.stringify(response.data.payload.user));
                toast.success('Login berhasil!');
                
                // Redirect ke halaman sebelumnya jika ada, atau ke dashboard
                const from = location.state?.from?.pathname || '/dashboard';
                navigate(from, { replace: true });
            } else {
                setError(response.data.message || 'Login gagal. Periksa kembali email dan password Anda.');
                toast.error(response.data.message || 'Login gagal.');
            }
        } catch (err) {
            console.error("Login error:", err.response || err.message || err);
            const errorMessage = err.response?.data?.message || 'Terjadi kesalahan pada server. Silakan coba lagi.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
                <div>
                    <LogIn className="mx-auto h-12 w-auto text-orange-600" />
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Masuk ke Akun Anda
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Atau{' '}
                        <Link to="/register" className="font-medium text-orange-600 hover:text-orange-500">
                            buat akun baru
                        </Link>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md text-center">{error}</p>}
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">Alamat Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="input-field pl-10"
                                    placeholder="Alamat Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="pt-px"> {/* Small fix for border overlap */}
                            <label htmlFor="password_login" className="sr-only">Password</label> {/* Ganti id password */}
                             <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    id="password_login" // Ganti id password
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="input-field pl-10"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Ingat saya</label>
                        </div>
                        <div className="text-sm">
                            <a href="#" className="font-medium text-orange-600 hover:text-orange-500">Lupa password?</a>
                        </div>
                    </div> */}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            ) : (
                                "Masuk"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}