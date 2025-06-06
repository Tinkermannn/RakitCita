import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import { toast } from 'react-toastify';
import { X } from 'react-feather';

export default function EditProfileModal({ isOpen, onClose, currentUserData, onProfileUpdate }) {
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        disability_details: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (currentUserData) {
            setFormData({
                name: currentUserData.name || '',
                bio: currentUserData.bio || '',
                disability_details: currentUserData.disability_details || ''
            });
        }
    }, [currentUserData, isOpen]); // Re-populate form when modal opens or data changes

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.name.trim()) {
            setError('Nama tidak boleh kosong.');
            setLoading(false);
            return;
        }

        try {
            const response = await apiClient.put('/users/profile', formData);
            if (response.data.success) {
                onProfileUpdate(response.data.payload); // Callback to update parent state
                onClose(); // Close modal
            } else {
                setError(response.data.message || 'Gagal memperbarui profil.');
                toast.error(response.data.message || 'Gagal memperbarui profil.');
            }
        } catch (err) {
            console.error("Update profile error:", err.response || err.message || err);
            const errorMessage = err.response?.data?.message || 'Terjadi kesalahan server.';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">Edit Profil</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
                    <div>
                        <label htmlFor="name_edit" className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                        <input
                            type="text"
                            name="name"
                            id="name_edit"
                            value={formData.name}
                            onChange={handleChange}
                            className="input-field"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="bio_edit" className="block text-sm font-medium text-gray-700 mb-1">Tentang Saya (Bio)</label>
                        <textarea
                            name="bio"
                            id="bio_edit"
                            rows="4"
                            value={formData.bio}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Ceritakan tentang diri Anda..."
                        ></textarea>
                    </div>
                    <div>
                        <label htmlFor="disability_details_edit" className="block text-sm font-medium text-gray-700 mb-1">Detail Disabilitas (Konfidensial)</label>
                        <textarea
                            name="disability_details"
                            id="disability_details_edit"
                            rows="3"
                            value={formData.disability_details}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Informasi ini membantu kami dan bersifat rahasia."
                        ></textarea>
                         <p className="mt-1 text-xs text-gray-500">Akan dijaga kerahasiaannya.</p>
                    </div>

                    <div className="pt-4 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary px-4 py-2"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary px-4 py-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            ) : "Simpan Perubahan"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}