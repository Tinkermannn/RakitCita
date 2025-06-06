import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MyCourses from './MyCourses';
import MyCommunities from './MyCommunities';
import { BookOpen, Users, Settings, User as UserIconFeather, LogOut } from 'react-feather'; // Tambahkan UserIconFeather dan LogOut

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
        <div className="container mx-auto p-4 md:p-8">
            <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Dashboard Pengguna</h1>
                <p className="text-gray-600">Selamat datang kembali, {currentUser.name}!</p>
            </header>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <aside className="md:w-1/4 lg:w-1/5">
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <div className="text-center mb-6">
                             <img 
                                src={currentUser.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random&size=128`} 
                                alt={currentUser.name}
                                className="w-24 h-24 rounded-full mx-auto mb-2 object-cover border-2 border-orange-500"
                            />
                            <h2 className="font-semibold text-lg text-gray-800">{currentUser.name}</h2>
                            <p className="text-sm text-gray-500 capitalize">{currentUser.role}</p>
                        </div>
                        <nav className="space-y-2">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors
                                        ${activeTab === tab.id 
                                            ? 'bg-orange-500 text-white shadow-sm' 
                                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                             <Link
                                to={`/profile/${currentUser.user_id}`}
                                className="w-full flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                            >
                                <UserIconFeather size={20} />
                                <span>Edit Profil</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                            >
                                <LogOut size={20} />
                                <span>Logout</span>
                            </button>
                        </nav>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="md:w-3/4 lg:w-4/5">
                    <div className="bg-white p-6 rounded-lg shadow-md min-h-[400px]">
                        {tabs.find(tab => tab.id === activeTab)?.component}
                    </div>
                </main>
            </div>
        </div>
    );
}