import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import { toast } from 'react-toastify';
import { UserPlus, User as UserIcon, Mail, Lock, Info } from 'react-feather';

export default function RegisterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'user',
        bio: '',
        disability_details: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNextStep = (e) => {
        e.preventDefault();
        setError('');
        if (step === 1) {
            if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
                setError('Semua kolom wajib diisi.');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Password dan konfirmasi password tidak cocok.');
                return;
            }
            if (formData.password.length < 6) {
                setError('Password minimal 6 karakter.');
                return;
            }
        }
        setStep(step + 1);
    };

    const handlePrevStep = () => {
        setStep(step - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.name || !formData.email || !formData.password) {
            setError('Informasi dasar (nama, email, password) wajib diisi.');
            setLoading(false);
            setStep(1);
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Password dan konfirmasi password tidak cocok.');
            setLoading(false);
            setStep(1);
            return;
        }

        const { confirmPassword: _, ...submitData } = formData;

        try {
            const response = await apiClient.post('/users/register', submitData);
            if (response.data.success) {
                toast.success('Registrasi berhasil! Silakan login.');
                navigate('/login');
            } else {
                setError(response.data.message || 'Registrasi gagal. Silakan coba lagi.');
                toast.error(response.data.message || 'Registrasi gagal.');
            }
        } catch (err) {
            console.error("Register error:", err.response || err.message || err);
            const errorMessage = err.response?.data?.message || 'Terjadi kesalahan pada server.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const inputFieldClass = "relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm";
    const textareaFieldClass = "relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm resize-vertical";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl border border-blue-100">
                <div className="text-center">
                    <div className="flex justify-center mb-6">
                        <UserPlus className="h-12 w-12 text-blue-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Buat Akun Baru
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Sudah punya akun?{' '}
                        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                            Masuk di sini
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={step === 2 ? handleSubmit : handleNextStep}>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
                            {error}
                        </div>
                    )}
                    
                    {/* Step 1: Basic Information */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="sr-only">Nama Lengkap</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                        <UserIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input 
                                        id="name" 
                                        name="name" 
                                        type="text" 
                                        required 
                                        className={inputFieldClass}
                                        placeholder="Nama Lengkap" 
                                        value={formData.name} 
                                        onChange={handleChange} 
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="email-address-register" className="sr-only">Alamat Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input 
                                        id="email-address-register" 
                                        name="email" 
                                        type="email" 
                                        autoComplete="email" 
                                        required 
                                        className={inputFieldClass}
                                        placeholder="Alamat Email" 
                                        value={formData.email} 
                                        onChange={handleChange} 
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="password_register" className="sr-only">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input 
                                        id="password_register" 
                                        name="password" 
                                        type="password" 
                                        autoComplete="new-password" 
                                        required 
                                        className={inputFieldClass}
                                        placeholder="Password (min. 6 karakter)" 
                                        value={formData.password} 
                                        onChange={handleChange} 
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="confirmPassword" className="sr-only">Konfirmasi Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input 
                                        id="confirmPassword" 
                                        name="confirmPassword" 
                                        type="password" 
                                        required 
                                        className={inputFieldClass}
                                        placeholder="Konfirmasi Password" 
                                        value={formData.confirmPassword} 
                                        onChange={handleChange} 
                                    />
                                </div>
                            </div>
                            
                            <div className="pt-4">
                                <button 
                                    type="submit" 
                                    className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                >
                                    Lanjut
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Additional Information */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                                    Saya mendaftar sebagai:
                                </label>
                                <select 
                                    id="role" 
                                    name="role" 
                                    value={formData.role} 
                                    onChange={handleChange} 
                                    className="block w-full px-3 py-3 border border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                >
                                    <option value="user">Pengguna (Pencari Pelatihan/Komunitas)</option>
                                    <option value="mentor">Mentor (Ingin Membuat Pelatihan)</option>
                                </select>
                            </div>
                            
                            <div>
                                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                                    Tentang Saya (Opsional)
                                </label>
                                <div className="relative">
                                    <div className="absolute top-3 left-3 pointer-events-none z-10">
                                        <Info className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <textarea 
                                        id="bio" 
                                        name="bio" 
                                        rows="3" 
                                        className={textareaFieldClass}
                                        placeholder="Ceritakan sedikit tentang diri Anda, minat, atau tujuan Anda." 
                                        value={formData.bio} 
                                        onChange={handleChange}
                                    ></textarea>
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="disability_details" className="block text-sm font-medium text-gray-700 mb-2">
                                    Detail Disabilitas (Opsional & Konfidensial)
                                </label>
                                <div className="relative">
                                    <div className="absolute top-3 left-3 pointer-events-none z-10">
                                        <Info className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <textarea 
                                        id="disability_details" 
                                        name="disability_details" 
                                        rows="3" 
                                        className={textareaFieldClass}
                                        placeholder="Informasi ini membantu kami menyediakan pengalaman yang lebih baik (misal: jenis disabilitas, kebutuhan aksesibilitas). Informasi ini bersifat rahasia." 
                                        value={formData.disability_details} 
                                        onChange={handleChange}
                                    ></textarea>
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    Informasi ini akan dijaga kerahasiaannya dan hanya digunakan untuk meningkatkan layanan kami.
                                </p>
                            </div>
                            
                            <div className="flex justify-between items-center pt-4 space-x-4">
                                <button 
                                    type="button" 
                                    onClick={handlePrevStep} 
                                    className="flex-1 py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                                >
                                    Kembali
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
                                >
                                    {loading ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                    ) : (
                                        "Daftar Akun"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}