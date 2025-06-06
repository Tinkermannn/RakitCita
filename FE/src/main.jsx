import React from "react";
import ReactDOM from "react-dom/client";
import { Navigate, createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css"; // Global styles
import App from "./App.jsx";

// Page Imports
import HomePage from "./pages/HomePage/HomePage.jsx";
import LoginPage from "./pages/Login/LoginPage.jsx";
import RegisterPage from "./pages/Register/RegisterPage.jsx";
import ProfilePage from "./pages/Profile/ProfilePage.jsx";
import DashboardPage from "./pages/Dashboard/DashboardPage.jsx";
import CoursesPage from "./pages/Courses/CoursesPage.jsx";
import CourseDetailPage from "./pages/Courses/CourseDetailPage.jsx";
import CreateCoursePage from "./pages/Courses/CreateCoursePage.jsx";
import EditCoursePage from "./pages/Courses/EditCoursePage.jsx";
import CommunitiesPage from "./pages/Communities/CommunitiesPage.jsx";
import CommunityDetailPage from "./pages/Communities/CommunityDetailPage.jsx";
import CreateCommunityPage from "./pages/Communities/CreateCommunityPage.jsx";
import EditCommunityPage from "./pages/Communities/EditCommunity.jsx";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage.jsx";

import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: "/home", element: <HomePage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      {
        path: "/profile/:userId", // :userId bisa diambil dari user yang login jika itu profil sendiri
        element: <ProtectedRoute><ProfilePage /></ProtectedRoute>,
      },
      {
        path: "/dashboard",
        element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
      },
      { path: "/courses", element: <CoursesPage /> },
      { path: "/courses/:courseId", element: <CourseDetailPage /> },
      {
        path: "/courses/create",
        element: <ProtectedRoute roles={['mentor', 'admin']}><CreateCoursePage /></ProtectedRoute>,
      },
      {
        path: "/courses/edit/:courseId",
        element: <ProtectedRoute roles={['mentor', 'admin']}><EditCoursePage /></ProtectedRoute>,
      },
      { path: "/communities", element: <CommunitiesPage /> },
      { path: "/communities/:communityId", element: <CommunityDetailPage /> },
      {
        path: "/communities/create",
        element: <ProtectedRoute><CreateCommunityPage /></ProtectedRoute>,
      },
      {
        path: "/communities/edit/:communityId",
        element: <ProtectedRoute><EditCommunityPage /></ProtectedRoute>, // Perlu logika otorisasi tambahan di page
      },
      { path: "*", element: <NotFoundPage /> } // Catch-all untuk 404
    ],
  },
  {
    path: "/",
    element: <Navigate to="/home" replace />, // Redirect dari root ke /home
  }
]);

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}