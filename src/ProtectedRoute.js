import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isLoggedIn, user } = useAuth();
    const location = useLocation();

    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (adminOnly && !user?.is_staff) {
        // Redirect non-admin users from admin routes
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;