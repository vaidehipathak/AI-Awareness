import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
    Home,
    LayoutDashboard,
    Gamepad2,
    Brain,
    Newspaper,
    Lightbulb,
    FileText,
    ScrollText,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

interface NavItem {
    to: string;
    label: string;
    icon: React.ElementType;
    adminOnly?: boolean;
    userOnly?: boolean;
}

const Sidebar: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const { user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Define navigation items based on role
    // ADMIN NAVIGATION: Management-focused with full access
    const adminNavItems: NavItem[] = [
        { to: '/', label: 'Home', icon: Home },
        { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
        { to: '/games', label: 'Manage Games', icon: Gamepad2 },
        { to: '/quiz', label: 'Manage Quiz', icon: Brain },
        { to: '/blog', label: 'Manage Blog', icon: Newspaper },
        { to: '/awareness-hub', label: 'Manage AwarenessHub', icon: Lightbulb },
        { to: '/report', label: 'Reports', icon: FileText },
    ];

    // USER NAVIGATION: Action-focused with limited access
    const userNavItems: NavItem[] = [
        { to: '/', label: 'Home', icon: Home },
        { to: '/awareness-hub', label: 'AwarenessHub', icon: Lightbulb },
        { to: '/games', label: 'Games', icon: Gamepad2 },
        { to: '/quiz', label: 'Quiz', icon: Brain },
        { to: '/blog', label: 'Blog', icon: Newspaper },
        { to: '/report', label: 'Report', icon: FileText },
    ];

    const navItems = isAdmin ? adminNavItems : userNavItems;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div
            className={`fixed left-0 top-0 h-screen bg-slate-900 dark:bg-slate-950 border-r border-slate-800 dark:border-slate-700 transition-all duration-300 ease-in-out z-40 ${isExpanded ? 'w-64' : 'w-16'
                }`}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            {/* Sidebar Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 dark:border-slate-700">
                {isExpanded ? (
                    <span className="text-white font-bold text-lg">Awareness.io</span>
                ) : (
                    <span className="text-white font-bold text-sm">A</span>
                )}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-slate-400 hover:text-white transition-colors"
                >
                    {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 py-4">
                <ul className="space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.to);

                        return (
                            <li key={item.to}>
                                <NavLink
                                    to={item.to}
                                    className={`flex items-center px-4 py-3 transition-colors duration-200 group relative ${active
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        }`}
                                    title={!isExpanded ? item.label : undefined}
                                >
                                    <Icon size={20} className="flex-shrink-0" />
                                    {isExpanded && (
                                        <span className="ml-3 text-sm font-medium whitespace-nowrap">
                                            {item.label}
                                        </span>
                                    )}

                                    {/* Tooltip for collapsed state */}
                                    {!isExpanded && (
                                        <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
                                            {item.label}
                                        </div>
                                    )}
                                </NavLink>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User Info & Logout */}
            <div className="border-t border-slate-800 dark:border-slate-700 p-4">
                {isExpanded && user && (
                    <div className="mb-3 px-2">
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <p className="text-xs text-slate-600 mt-1">
                            {isAdmin ? 'Administrator' : 'User'}
                        </p>
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-2 py-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded transition-colors duration-200 group relative"
                    title={!isExpanded ? 'Logout' : undefined}
                >
                    <LogOut size={20} className="flex-shrink-0" />
                    {isExpanded && <span className="ml-3 text-sm font-medium">Logout</span>}

                    {/* Tooltip for collapsed state */}
                    {!isExpanded && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity">
                            Logout
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
