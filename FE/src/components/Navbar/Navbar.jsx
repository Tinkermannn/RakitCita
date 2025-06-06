import React, { useState, useEffect } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import PlatformLogoRed from '../../assets/LogoPaintedRed.png';
import { User, LogIn, LogOut, BookOpen, Users, Menu as MenuIconFeather, X as XIconFeather } from 'react-feather';
import {Layout} from 'react-feather'

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const controls = useAnimation();
    const [scrolling, setScrolling] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        if (storedUser && token) {
            setCurrentUser(JSON.parse(storedUser));
        } else {
            setCurrentUser(null);
        }
    }, [location]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolling(true);
                controls.start({ opacity: 1, y: 0 });
            } else {
                setScrolling(false);
                controls.start({ opacity: 0, y: -20 });
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [controls]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setCurrentUser(null);
        setMobileMenuOpen(false);
        navigate("/login");
    };

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const baseLinkStyle = "px-4 py-2 rounded-md text-sm font-medium transition-colors";
    const desktopLinkStyle = `${baseLinkStyle} hover:bg-blue-100 hover:text-blue-600`;
    const mobileLinkStyle = `${baseLinkStyle} block w-full text-left hover:bg-blue-100 hover:text-blue-700 py-3 text-base`;
    const activeDesktopLinkStyle = "bg-blue-500 text-white hover:bg-blue-600";
    const activeMobileLinkStyle = "bg-blue-500 text-white hover:bg-blue-600";

    const commonMenuItems = [
        { text: "Pelatihan", path: "/courses", icon: <BookOpen size={18} className="mr-2"/> },
        { text: "Komunitas", path: "/communities", icon: <Users size={18} className="mr-2"/> },
    ];

    const guestMenuItems = [
        ...commonMenuItems,
        { text: "Login", path: "/login", icon: <LogIn size={18} className="mr-2"/> },
        { text: "Register", path: "/register", icon: <User size={18} className="mr-2"/> },
    ];

    const userMenuItems = [
        ...commonMenuItems,
        { text: "Dashboard", path: "/dashboard", icon: <Layout size={18} className="mr-2"/> },
        { text: "Profil", path: `/profile/${currentUser?.user_id}`, icon: <User size={18} className="mr-2"/> },
    ];
    
    if (currentUser && (currentUser.role === 'mentor' || currentUser.role === 'admin')) {
        const createCourseItem = { text: "Buat Pelatihan", path: "/courses/create", icon: <BookOpen size={18} className="mr-2"/> };
        const coursesIndex = userMenuItems.findIndex(item => item.path === "/courses");
        if (coursesIndex !== -1) {
            userMenuItems.splice(coursesIndex + 1, 0, createCourseItem);
        } else {
            userMenuItems.push(createCourseItem);
        }
    }

    const menuItems = currentUser ? userMenuItems : guestMenuItems;

    const NavLink = ({ to, children, isMobile = false, ...props }) => {
        const isActive = location.pathname === to || (to !== "/home" && location.pathname.startsWith(to) && to !== "/");
        const style = isMobile 
            ? (isActive ? `${mobileLinkStyle} ${activeMobileLinkStyle}` : mobileLinkStyle)
            : (isActive ? `${desktopLinkStyle} ${activeDesktopLinkStyle}` : desktopLinkStyle);
        
        return (
            <Link to={to} className={style} onClick={() => isMobile && setMobileMenuOpen(false)} {...props}>
                {children}
            </Link>
        );
    };

    return (
        <>
            <motion.nav
                initial={false}
                animate={scrolling ? { y: 0, opacity: 1 } : { y: 0, opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={`fixed top-0 w-full z-30 transition-shadow duration-300 
                            ${scrolling ? "bg-white shadow-lg" : "bg-transparent"}`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/home" className="flex-shrink-0 flex items-center">
                            <img className="h-10 w-auto" src={PlatformLogoRed} alt="Platform Logo" />
                            <span className={`ml-3 text-xl font-semibold ${scrolling ? "text-gray-800" : "text-white md:text-gray-800"}`}>
                                RakitCita
                            </span>
                        </Link>

                        <div className="hidden md:flex md:items-center md:space-x-2">
                            {menuItems.map((item) => (
                                <NavLink key={item.text} to={item.path}>
                                    <div className={`flex items-center ${scrolling ? "text-gray-700" : "text-white lg:text-gray-700"}`}>
                                      {item.icon} {item.text}
                                    </div>
                                </NavLink>
                            ))}
                            {currentUser && (
                                <button onClick={handleLogout} className={`${desktopLinkStyle} ${scrolling ? "text-red-600 hover:bg-red-100" : "text-white lg:text-red-600 hover:bg-red-100"} flex items-center`}>
                                    <LogOut size={18} className="mr-2"/> Logout
                                </button>
                            )}
                        </div>

                        <div className="md:hidden flex items-center">
                            <button
                                onClick={toggleMobileMenu}
                                type="button"
                                className={`inline-flex items-center justify-center p-2 rounded-md 
                                            ${scrolling ? "text-black hover:text-gray-800 hover:bg-gray-100" : "text-black hover:text-gray-800 hover:bg-white/20"} 
                                            focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500`}
                                aria-controls="mobile-menu"
                                aria-expanded={mobileMenuOpen}
                            >
                                <span className="sr-only">Open main menu</span>
                                {mobileMenuOpen ? <XIconFeather className="block h-6 w-6" aria-hidden="true" /> : <MenuIconFeather className="block h-6 w-6" aria-hidden="true" />}
                            </button>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="md:hidden bg-white shadow-lg rounded-b-md"
                            id="mobile-menu"
                        >
                            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                                {menuItems.map((item) => (
                                     <NavLink key={item.text} to={item.path} isMobile>
                                        <div className="flex items-center text-gray-700">
                                            {item.icon} {item.text}
                                        </div>
                                     </NavLink>
                                ))}
                                {currentUser && (
                                    <button onClick={handleLogout} className={`${mobileLinkStyle} text-red-600 hover:bg-red-100 w-full flex items-center`}>
                                        <LogOut size={18} className="mr-2"/> Logout
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>
            <div className="h-16" />
        </>
    );
}