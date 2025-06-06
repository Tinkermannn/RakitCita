import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MyCourses from './MyCourses';
import MyCommunities from './MyCommunities';
import ReadableText from '../../components/ReadableText/ReadableText';
import { BookOpen, Users, Settings, User as UserIconFeather, LogOut } from 'react-feather';

export default function DashboardPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('courses'); // 'courses', 'communities', 'admin'
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const userString = localStorage.getItem('user');
        if (userString) {
            setCurrentUser(JSON.parse(userString));
        } else {
            navigate('/login'); // Jika tidak ada user, redirect ke login
        }
    }, [navigate]);

    if (!currentUser) {
        return null; // Atau tampilkan loading state sementara redirect
    }

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login");
    };

    const tabs = [
        { id: 'courses', label: 'Pelatihan Saya', icon: <BookOpen size={20} />, component: <MyCourses user={currentUser} /> },
        { id: 'communities', label: 'Komunitas Saya', icon: <Users size={20} />, component: <MyCommunities user={currentUser} /> },
    ];

    if (currentUser.role === 'admin') {
        tabs.push({ id: 'admin', label: 'Panel Admin', icon: <Settings size={20} />, component: <AdminSection user={currentUser} /> });
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="container mx-auto p-4 md:p-8">
                <header className="mb-8">
                    <ReadableText tag="h1" className="text-3xl md:text-4xl font-bold text-gray-800">
                        Dashboard Pengguna
                    </ReadableText>
                    <ReadableText tag="p" className="text-gray-600">
                        Selamat datang kembali, {currentUser.name}!
                    </ReadableText>
                </header>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="md:w-1/4 lg:w-1/5">
                        <div className="bg-white p-4 rounded-lg shadow-md border border-blue-100">
                            <div className="text-center mb-6">
                                 <img 
                                    src={currentUser.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random&size=128`} 
                                    alt={`Foto profil ${currentUser.name}`}
                                    className="w-24 h-24 rounded-full mx-auto mb-2 object-cover border-2 border-blue-500"
                                />
                                <ReadableText tag="h2" className="font-semibold text-lg text-gray-800">
                                    {currentUser.name}
                                </ReadableText>
                                <ReadableText tag="p" className="text-sm text-gray-500 capitalize">
                                    {currentUser.role}
                                </ReadableText>
                            </div>
                            <nav className="space-y-2">
                                {tabs.map(tab => (
                                    <ReadableText
                                        key={tab.id}
                                        tag="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors duration-200 ${
                                            activeTab === tab.id 
                                                ? 'bg-blue-500 text-white shadow-sm' 
                                                : 'text-gray-700 hover:bg-blue-50 hover:text-gray-900'
                                        }`}
                                        textToRead={`Navigasi ke ${tab.label}`}
                                    >
                                        {tab.icon}
                                        <span>{tab.label}</span>
                                    </ReadableText>
                                ))}
                                 <Link
                                    to={`/profile/${currentUser.user_id}`}
                                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                >
                                    <UserIconFeather size={20} />
                                    <ReadableText tag="span" textToRead="Link ke halaman edit profil">
                                        Edit Profil
                                    </ReadableText>
                                </Link>
                                <ReadableText
                                    tag="button"
                                    onClick={handleLogout}
                                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                    textToRead="Tombol Logout untuk keluar dari akun"
                                >
                                    <LogOut size={20} />
                                    <span>Logout</span>
                                </ReadableText>
                            </nav>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="md:w-3/4 lg:w-4/5">
                        <div className="bg-white p-6 rounded-lg shadow-md min-h-[400px] border border-blue-100">
                            {tabs.find(tab => tab.id === activeTab)?.component}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}