import React from 'react';
import { ProtectedRoute } from './ProtectedRoute';

interface AdminRouteProps {
    children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    return (
        <ProtectedRoute requiredRole="ADMIN">
            {children}
        </ProtectedRoute>
    );
};
