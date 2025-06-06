import React from "react";
import { Facebook, Instagram, Linkedin, Mail, Twitter, Youtube } from "react-feather"; // Added Twitter, Youtube
import PlatformLogo from '../../assets/todologo.png'; // Ganti dengan logo Anda

export default function Footer() {
    return (
        <footer className="bg-gray-800 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* About Section */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-1">
                        <div className="flex items-center mb-4">
                            <img src={PlatformLogo} className="h-12 w-auto mr-3" alt="Platform Logo" />
                            <span className="text-2xl font-semibold text-white">RakitCita</span>
                        </div>
                        <p className="text-sm leading-relaxed">
                            Memberdayakan individu penyandang disabilitas melalui pelatihan keterampilan dan koneksi komunitas untuk meraih potensi penuh mereka.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h5 className="text-lg font-semibold text-white mb-4">Navigasi</h5>
                        <ul className="space-y-2">
                            <li><a href="/home" className="hover:text-orange-400 transition-colors">Beranda</a></li>
                            <li><a href="/courses" className="hover:text-orange-400 transition-colors">Pelatihan</a></li>
                            <li><a href="/communities" className="hover:text-orange-400 transition-colors">Komunitas</a></li>
                            <li><a href="/register" className="hover:text-orange-400 transition-colors">Daftar</a></li>
                            {/* Tambahkan link lain jika perlu */}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h5 className="text-lg font-semibold text-white mb-4">Hubungi Kami</h5>
                        <address className="not-italic space-y-2 text-sm">
                            <p>Jl. Aksesibilitas No. 123, Kota Inklusif, Indonesia</p>
                            <div className="flex items-center">
                                <Mail size={16} className="mr-2 flex-shrink-0" />
                                <a href="mailto:info@RakitCita.id" className="hover:text-orange-400">info@RakitCita.id</a>
                            </div>
                            {/* <div className="flex items-center">
                                <Phone size={16} className="mr-2 flex-shrink-0" />
                                <a href="tel:+62xxxxxxxxx" className="hover:text-orange-400">+62 XXX XXXXXXX</a>
                            </div> */}
                        </address>
                    </div>

                    {/* Social Media */}
                    <div>
                        <h5 className="text-lg font-semibold text-white mb-4">Ikuti Kami</h5>
                        <div className="flex space-x-4">
                            <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-400 transition-colors" title="Facebook">
                                <Facebook size={24} />
                            </a>
                            <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-400 transition-colors" title="Instagram">
                                <Instagram size={24} />
                            </a>
                            <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-400 transition-colors" title="Twitter">
                                <Twitter size={24} />
                            </a>
                            <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-400 transition-colors" title="LinkedIn">
                                <Linkedin size={24} />
                            </a>
                            <a href="#" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-orange-400 transition-colors" title="Youtube">
                                <Youtube size={24} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm">
                    <p>© {new Date().getFullYear()} RakitCita. Semua Hak Cipta Dilindungi.</p>
                    <p className="mt-1">Dirancang dengan ❤️ untuk Inklusivitas.</p>
                </div>
            </div>
        </footer>
    );
}