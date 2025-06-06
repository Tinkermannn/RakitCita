import React from "react";
import { Facebook, Instagram, Linkedin, Mail, Twitter, Youtube } from "react-feather";
import ReadableText from '../ReadableText/ReadableText';
import PlatformLogo from '../../assets/LogoPaintedRed.png';

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
                                alt="Logo RakitCita Platform" 
                            />
                            <ReadableText 
                                tag="span" 
                                className="text-2xl font-semibold text-white"
                                textToRead="RakitCita - Nama platform"
                            >
                                RakitCita
                            </ReadableText>
                        </div>
                        <ReadableText 
                            tag="p" 
                            className="text-sm leading-relaxed text-gray-300"
                            textToRead="Deskripsi platform: Memberdayakan individu penyandang disabilitas melalui pelatihan keterampilan dan koneksi komunitas untuk meraih potensi penuh mereka"
                        >
                            Memberdayakan individu penyandang disabilitas melalui pelatihan keterampilan dan koneksi komunitas untuk meraih potensi penuh mereka.
                        </ReadableText>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col">
                        <ReadableText 
                            tag="h5" 
                            className="text-lg font-semibold text-white mb-4"
                            textToRead="Bagian navigasi situs"
                        >
                            Navigasi
                        </ReadableText>
                        <ul className="space-y-3">
                            <li>
                                <ReadableText
                                    tag="a"
                                    href="/home"
                                    className="text-sm hover:text-orange-400 transition-colors duration-200 block focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded-sm"
                                    textToRead="Link ke halaman beranda"
                                >
                                    Beranda
                                </ReadableText>
                            </li>
                            <li>
                                <ReadableText
                                    tag="a"
                                    href="/courses"
                                    className="text-sm hover:text-orange-400 transition-colors duration-200 block focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded-sm"
                                    textToRead="Link ke halaman pelatihan"
                                >
                                    Pelatihan
                                </ReadableText>
                            </li>
                            <li>
                                <ReadableText
                                    tag="a"
                                    href="/communities"
                                    className="text-sm hover:text-orange-400 transition-colors duration-200 block focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded-sm"
                                    textToRead="Link ke halaman komunitas"
                                >
                                    Komunitas
                                </ReadableText>
                            </li>
                            <li>
                                <ReadableText
                                    tag="a"
                                    href="/register"
                                    className="text-sm hover:text-orange-400 transition-colors duration-200 block focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded-sm"
                                    textToRead="Link ke halaman pendaftaran"
                                >
                                    Daftar
                                </ReadableText>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-col">
                        <ReadableText 
                            tag="h5" 
                            className="text-lg font-semibold text-white mb-4"
                            textToRead="Bagian informasi kontak"
                        >
                            Hubungi Kami
                        </ReadableText>
                        <address className="not-italic space-y-3 text-sm">
                            <ReadableText 
                                tag="p" 
                                className="text-gray-300 leading-relaxed"
                                textToRead="Alamat: Jl. Aksesibilitas No. 123, Kota Inklusif, Indonesia"
                            >
                                Jl. Aksesibilitas No. 123, Kota Inklusif, Indonesia
                            </ReadableText>
                            <div className="flex items-start">
                                <Mail size={16} className="mr-2 flex-shrink-0 mt-0.5 text-gray-400" />
                                <ReadableText
                                    tag="a"
                                    href="mailto:info@RakitCita.id"
                                    className="hover:text-orange-400 transition-colors duration-200 break-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded-sm"
                                    textToRead="Email kontak: info@RakitCita.id"
                                >
                                    info@RakitCita.id
                                </ReadableText>
                            </div>
                        </address>
                    </div>

                    {/* Social Media */}
                    <div className="flex flex-col">
                        <ReadableText 
                            tag="h5" 
                            className="text-lg font-semibold text-white mb-4"
                            textToRead="Bagian media sosial kami"
                        >
                            Ikuti Kami
                        </ReadableText>
                        <div className="flex flex-wrap gap-3">
                            <ReadableText
                                tag="a"
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-orange-400 transition-colors duration-200 p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                                title="Facebook"
                                textToRead="Link ke halaman Facebook kami"
                            >
                                <Facebook size={20} />
                            </ReadableText>
                            <ReadableText
                                tag="a"
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-orange-400 transition-colors duration-200 p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                                title="Instagram"
                                textToRead="Link ke halaman Instagram kami"
                            >
                                <Instagram size={20} />
                            </ReadableText>
                            <ReadableText
                                tag="a"
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-orange-400 transition-colors duration-200 p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                                title="Twitter"
                                textToRead="Link ke halaman Twitter kami"
                            >
                                <Twitter size={20} />
                            </ReadableText>
                            <ReadableText
                                tag="a"
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-orange-400 transition-colors duration-200 p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                                title="LinkedIn"
                                textToRead="Link ke halaman LinkedIn kami"
                            >
                                <Linkedin size={20} />
                            </ReadableText>
                            <ReadableText
                                tag="a"
                                href="#"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-orange-400 transition-colors duration-200 p-2 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                                title="Youtube"
                                textToRead="Link ke halaman Youtube kami"
                            >
                                <Youtube size={20} />
                            </ReadableText>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-gray-700">
                    <div className="text-center text-sm space-y-2">
                        <ReadableText 
                            tag="p" 
                            className="text-gray-400"
                            textToRead={`Hak cipta ${new Date().getFullYear()} RakitCita. Semua Hak Cipta Dilindungi`}
                        >
                            © {new Date().getFullYear()} RakitCita. Semua Hak Cipta Dilindungi.
                        </ReadableText>
                        <ReadableText 
                            tag="p" 
                            className="text-gray-400"
                            textToRead="Dirancang dengan cinta untuk Inklusivitas"
                        >
                            Dirancang dengan ❤️ untuk Inklusivitas.
                        </ReadableText>
                    </div>
                </div>
            </div>
        </footer>
    );
}