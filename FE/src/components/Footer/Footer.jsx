import React from "react";
import { Facebook, Instagram, Linkedin, Mail, Twitter, Youtube } from "react-feather";
import PlatformLogo from '../../assets/LogoPaintedRed.png'; // Ganti dengan logo Anda

export default function Footer() {
    return (
        <footer className="bg-gray-800 text-gray-300 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {/* About Section */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-1">
                        <div className="flex items-center mb-4">
                            <img 
                                src={PlatformLogo} 
                                className="h-12 w-12 object-contain mr-3 flex-shrink-0" 
                                alt="Platform Logo" 
                            />
                            <span className="text-2xl font-semibold text-white">RakitCita</span>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-300">
                            Memberdayakan individu penyandang disabilitas melalui pelatihan keterampilan dan koneksi komunitas untuk meraih potensi penuh mereka.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col">
                        <h5 className="text-lg font-semibold text-white mb-4">Navigasi</h5>
                        <ul className="space-y-3">
                            <li>
                                <a 
                                    href="/home" 
                                    className="text-sm hover:text-orange-400 transition-colors duration-200 block"
                                >
                                    Beranda
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="/courses" 
                                    className="text-sm hover:text-orange-400 transition-colors duration-200 block"
                                >
                                    Pelatihan
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="/communities" 
                                    className="text-sm hover:text-orange-400 transition-colors duration-200 block"
                                >
                                    Komunitas
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="/register" 
                                    className="text-sm hover:text-orange-400 transition-colors duration-200 block"
                                >
                                    Daftar
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-col">
                        <h5 className="text-lg font-semibold text-white mb-4">Hubungi Kami</h5>
                        <address className="not-italic space-y-3 text-sm">
                            <p className="text-gray-300 leading-relaxed">
                                Jl. Aksesibilitas No. 123, Kota Inklusif, Indonesia
                            </p>
                            <div className="flex items-start">
                                <Mail size={16} className="mr-2 flex-shrink-0 mt-0.5 text-gray-400" />
                                <a 
                                    href="mailto:info@RakitCita.id" 
                                    className="hover:text-orange-400 transition-colors duration-200 break-all"
                                >
                                    info@RakitCita.id
                                </a>
                            </div>
                        </address>
                    </div>

                    {/* Social Media */}
                    <div className="flex flex-col">
                        <h5 className="text-lg font-semibold text-white mb-4">Ikuti Kami</h5>
                        <div className="flex flex-wrap gap-3">
                            <a 
                                href="#" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-gray-400 hover:text-orange-400 transition-colors duration-200 p-2 rounded-full hover:bg-gray-700" 
                                title="Facebook"
                                aria-label="Kunjungi Facebook kami"
                            >
                                <Facebook size={20} />
                            </a>
                            <a 
                                href="#" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-gray-400 hover:text-orange-400 transition-colors duration-200 p-2 rounded-full hover:bg-gray-700" 
                                title="Instagram"
                                aria-label="Kunjungi Instagram kami"
                            >
                                <Instagram size={20} />
                            </a>
                            <a 
                                href="#" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-gray-400 hover:text-orange-400 transition-colors duration-200 p-2 rounded-full hover:bg-gray-700" 
                                title="Twitter"
                                aria-label="Kunjungi Twitter kami"
                            >
                                <Twitter size={20} />
                            </a>
                            <a 
                                href="#" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-gray-400 hover:text-orange-400 transition-colors duration-200 p-2 rounded-full hover:bg-gray-700" 
                                title="LinkedIn"
                                aria-label="Kunjungi LinkedIn kami"
                            >
                                <Linkedin size={20} />
                            </a>
                            <a 
                                href="#" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-gray-400 hover:text-orange-400 transition-colors duration-200 p-2 rounded-full hover:bg-gray-700" 
                                title="Youtube"
                                aria-label="Kunjungi Youtube kami"
                            >
                                <Youtube size={20} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-gray-700">
                    <div className="text-center text-sm space-y-2">
                        <p className="text-gray-400">
                            © {new Date().getFullYear()} RakitCita. Semua Hak Cipta Dilindungi.
                        </p>
                        <p className="text-gray-400">
                            Dirancang dengan ❤️ untuk Inklusivitas.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}