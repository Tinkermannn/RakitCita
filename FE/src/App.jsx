import React from "react";
import Navbar from "./components/Navbar/Navbar";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import Footer from "./components/Footer/Footer";
import { ToastContainer } from 'react-toastify'; // Import jika Anda ingin notifikasi
import 'react-toastify/dist/ReactToastify.css'; // CSS untuk react-toastify

export default function App() {
  const location = useLocation();

  // Daftar route dimana footer dan mungkin navbar (jika ada fullscreen page) akan disembunyikan
  const hideFooterRoutes = ["/login", "/register"]; // Sesuaikan path jika prefix /user/ dihilangkan
  // const hideNavbarRoutes = ["/some-fullscreen-page"];

  const shouldHideFooter = hideFooterRoutes.includes(location.pathname);
  // const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollRestoration />
      {/* {!shouldHideNavbar && <Navbar />} */}
      <Navbar /> {/* Untuk MVP, Navbar selalu tampil */}
      <main className="flex-grow"> {/* Konten utama mengambil sisa ruang */}
        <Outlet />
      </main>
      {!shouldHideFooter && <Footer />}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}