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
        role: 'user', // Default role
        bio: '',
        disability_details: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1); // For multi-step registration

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

        // Final validation before submitting
        if (!formData.name || !formData.email || !formData.password) {
            setError('Informasi dasar (nama, email, password) wajib diisi.');
            setLoading(false);
            setStep(1); // Go back to first step if basic info missing
            return;
        }
         if (formData.password !== formData.confirmPassword) {
            setError('Password dan konfirmasi password tidak cocok.');
            setLoading(false);
            setStep(1);
            return;
        }

        const { confirmPassword, ...submitData } = formData;

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

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
                <div>
                    <UserPlus className="mx-auto h-12 w-auto text-orange-600" />
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Buat Akun Baru
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Sudah punya akun?{' '}
                        <Link to="/login" className="font-medium text-orange-600 hover:text-orange-500">
                            Masuk di sini
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={step === 2 ? handleSubmit : handleNextStep}>
                    {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md text-center">{error}</p>}
                    
                    {/* Step 1: Basic Information */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="sr-only">Nama Lengkap</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <UserIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input id="name" name="name" type="text" required className="input-field pl-10" placeholder="Nama Lengkap" value={formData.name} onChange={handleChange} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="email-address-register" className="sr-only">Alamat Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input id="email-address-register" name="email" type="email" autoComplete="email" required className="input-field pl-10" placeholder="Alamat Email" value={formData.email} onChange={handleChange} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="password_register" className="sr-only">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input id="password_register" name="password" type="password" autoComplete="new-password" required className="input-field pl-10" placeholder="Password (min. 6 karakter)" value={formData.password} onChange={handleChange} />
                                </div>
                            </div>
                             <div>
                                <label htmlFor="confirmPassword" className="sr-only">Konfirmasi Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input id="confirmPassword" name="confirmPassword" type="password" required className="input-field pl-10" placeholder="Konfirmasi Password" value={formData.confirmPassword} onChange={handleChange} />
                                </div>
                            </div>
                            <div>
                                <button type="submit" className="btn btn-primary w-full">
                                    Lanjut
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Additional Information */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700">Saya mendaftar sebagai:</label>
                                <select id="role" name="role" value={formData.role} onChange={handleChange} className="mt-1 input-field">
                                    <option value="user">Pengguna (Pencari Pelatihan/Komunitas)</option>
                                    <option value="mentor">Mentor (Ingin Membuat Pelatihan)</option>
                                    {/* <option value="admin">Admin</option>  Biasanya admin dibuat manual */}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Tentang Saya (Opsional)</label>
                                 <div className="relative">
                                    <div className="absolute inset-y-0 left-0 top-0 pt-3 pl-3 flex items-start pointer-events-none">
                                        <Info className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <textarea id="bio" name="bio" rows="3" className="input-field pl-10" placeholder="Ceritakan sedikit tentang diri Anda, minat, atau tujuan Anda." value={formData.bio} onChange={handleChange}></textarea>
                                 </div>
                            </div>
                             <div>
                                <label htmlFor="disability_details" className="block text-sm font-medium text-gray-700">Detail Disabilitas (Opsional & Konfidensial)</label>
                                 <div className="relative">
                                     <div className="absolute inset-y-0 left-0 top-0 pt-3 pl-3 flex items-start pointer-events-none">
                                        <Info className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <textarea id="disability_details" name="disability_details" rows="3" className="input-field pl-10" placeholder="Informasi ini membantu kami menyediakan pengalaman yang lebih baik (misal: jenis disabilitas, kebutuhan aksesibilitas). Informasi ini bersifat rahasia." value={formData.disability_details} onChange={handleChange}></textarea>
                                 </div>
                                <p className="mt-1 text-xs text-gray-500">Informasi ini akan dijaga kerahasiaannya dan hanya digunakan untuk meningkatkan layanan kami.</p>
                            </div>
                            
                            <div className="flex justify-between items-center pt-2">
                                <button type="button" onClick={handlePrevStep} className="btn btn-secondary">
                                    Kembali
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary group relative flex justify-center py-2 px-4 disabled:opacity-50"
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