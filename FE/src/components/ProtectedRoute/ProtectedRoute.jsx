import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, roles }) => {
    const location = useLocation();
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;

    if (!token || !user) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience
        // than dropping them off on the home page.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles && roles.length > 0 && !roles.includes(user.role)) {
        // User does not have the required role, redirect to a 'not authorized' page or home
        // For simplicity, redirecting to home. You might want a specific "Unauthorized" page.
        // Or show a toast message.
        console.warn(`User role '${user.role}' not authorized for this route. Required: ${roles.join(', ')}`);
        return <Navigate to="/home" state={{ message: "Anda tidak diizinkan mengakses halaman ini." }} replace />;
    }

    return children;
};

export default ProtectedRoute;