import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import PublicLayout from '../layouts/PublicLayout';
import UserLayout from '../layouts/UserLayout';

/**
 * Conditional layout wrapper that shows:
 * - UserLayout (with sidebar) when authenticated
 * - PublicLayout (navbar only) when not authenticated
 */
const ConditionalLayout: React.FC = () => {
    const { isAuthenticated } = useAuth();

    return isAuthenticated ? <UserLayout /> : <PublicLayout />;
};

export default ConditionalLayout;
