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
    LogOut,
    ChevronLeft,
    ChevronRight,
    Shield,
    Users,
    FileSearch,
} from 'lucide-react';

import AuthGateModal from './AuthGateModal';

interface NavItem {
    to: string;
    label: string;
    icon: React.ElementType;
    adminOnly?: boolean;
    userOnly?: boolean;
    protected?: boolean;
}

const Sidebar: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [triggeredFeature, setTriggeredFeature] = useState<string>('');
    const { user, logout, isAdmin, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // ADMIN NAVIGATION: Management-focused with full access
    const adminNavItems: NavItem[] = [
        { to: '/', label: 'Home', icon: Home },
        { to: '/about-us', label: 'About Us', icon: Users },
        { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
        { to: '/games', label: 'Manage Games', icon: Gamepad2 },
        { to: '/quiz', label: 'Manage Quiz', icon: Brain },
        { to: '/blog', label: 'Manage Blog', icon: Newspaper },
        { to: '/awareness-hub', label: 'Manage AwarenessHub', icon: Lightbulb },
        { to: '/report', label: 'Analysis', icon: FileText },
        { to: '/zkatt', label: 'Forensic Simulator', icon: FileSearch },

    ];

    // USER NAVIGATION: Action-focused with limited access
    const userNavItems: NavItem[] = [
        { to: '/', label: 'Home', icon: Home },
        { to: '/about-us', label: 'About Us', icon: Users },
        { to: '/awareness-hub', label: 'AwarenessHub', icon: Lightbulb },
        { to: '/games', label: 'Games', icon: Gamepad2 },
        { to: '/quiz', label: 'Quiz', icon: Brain },
        { to: '/blog', label: 'Blog', icon: Newspaper },
        { to: '/report', label: 'Analysis', icon: FileText },
        { to: '/zkatt', label: 'Forensic Simulator', icon: FileSearch },

    ];

    // PUBLIC NAVIGATION
    const publicNavItems: NavItem[] = [
        { to: '/', label: 'Home', icon: Home, protected: false },
        { to: '/about-us', label: 'About Us', icon: Users, protected: false },
        { to: '/awareness-hub', label: 'AwarenessHub', icon: Lightbulb, protected: false },
        { to: '/blog', label: 'Blog', icon: Newspaper, protected: false },
        { to: '/games', label: 'Games', icon: Gamepad2, protected: true },
        { to: '/quiz', label: 'Quiz', icon: Brain, protected: true },
        { to: '/report', label: 'Analysis', icon: FileText, protected: true },
        { to: '/zkatt', label: 'Forensic Simulator', icon: FileSearch, protected: true },
    ];

    let navItems = publicNavItems;
    if (isAuthenticated) {
        navItems = isAdmin ? adminNavItems : userNavItems;
    }

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleItemClick = (e: React.MouseEvent, item: NavItem) => {
        if (item.protected && !isAuthenticated) {
            e.preventDefault();
            setTriggeredFeature(item.label);
            setShowAuthModal(true);
        }
    };

    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <>
            <div
                className={`fixed left-0 top-[6.5rem] h-[calc(100vh-6.5rem)] bg-slate-900/95 dark:bg-[#0a0a0a]/60 backdrop-blur-xl border-r border-slate-800 dark:border-white/5 transition-all duration-300 ease-in-out z-40 ${isExpanded ? 'w-64' : 'w-16'
                    }`}
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
            >
                {/* Sidebar Header */}
                <div className="h-14 flex items-center justify-between px-4 border-b border-slate-800 dark:border-white/10">
                    {isExpanded ? (
                        <div className="flex items-center gap-2">
                            <span className="text-white font-black text-base tracking-tight">AwareX</span>
                            <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/30 font-semibold uppercase">Menu</span>
                        </div>
                    ) : null}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors ${!isExpanded ? 'mx-auto' : ''}`}
                        title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
                    >
                        {isExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 py-4">
                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            // Only show active state if not protected or if authenticated
                            const active = isActive(item.to) && (!item.protected || isAuthenticated);

                            return (
                                <li key={item.to}>
                                    <NavLink
                                        to={item.to}
                                        onClick={(e) => handleItemClick(e, item)}
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
                                                {item.protected && !isAuthenticated && (
                                                    <span className="ml-2 text-xs bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">Locked</span>
                                                )}
                                            </span>
                                        )}

                                        {/* Tooltip for collapsed state */}
                                        {!isExpanded && (
                                            <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                                                {item.label} {item.protected && !isAuthenticated ? '(Locked)' : ''}
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
                    {isExpanded && isAuthenticated && user && (
                        <div className="mb-3 px-2">
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                            <p className="text-xs text-slate-600 mt-1">
                                {isAdmin ? 'Administrator' : 'User'}
                            </p>
                        </div>
                    )}

                    {isAuthenticated ? (
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-2 py-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded transition-colors duration-200 group relative"
                            title={!isExpanded ? 'Logout' : undefined}
                        >
                            <LogOut size={20} className="flex-shrink-0" />
                            {isExpanded && <span className="ml-3 text-sm font-medium">Logout</span>}

                            {!isExpanded && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                                    Logout
                                </div>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className="flex items-center w-full px-2 py-2 text-indigo-400 hover:bg-indigo-900/20 hover:text-indigo-300 rounded transition-colors duration-200 group relative"
                            title={!isExpanded ? 'Login' : undefined}
                        >
                            <LogOut size={20} className="flex-shrink-0 rotate-180" /> {/* Simulating Login Icon */}
                            {isExpanded && <span className="ml-3 text-sm font-medium">Login</span>}

                            {!isExpanded && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                                    Login
                                </div>
                            )}
                        </button>
                    )}
                </div>
            </div>

            <AuthGateModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                featureName={triggeredFeature}
            />
        </>
    );
};


export default Sidebar;
