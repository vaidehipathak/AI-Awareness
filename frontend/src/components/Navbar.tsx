import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import GoogleTranslateWidget from './GoogleTranslateWidget';


import { useAuth } from '../contexts/AuthContext';
import AuthGateModal from './AuthGateModal';


interface NavLinksProps {
  isMobile: boolean;
  closeMenu?: () => void;
  onProtectedClick: (featureName: string) => void;
  isAuthenticated: boolean;
}

const NavLinks: React.FC<NavLinksProps> = ({ isMobile, closeMenu, onProtectedClick, isAuthenticated }) => {
  const { isAdmin } = useAuth();

  // Public navigation (logged out)
  const publicNavItems = [
    { to: '/', text: 'Home', protected: false, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { to: '/awareness-hub', text: 'AwarenessHub', protected: false, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg> },
    { to: '/blog', text: 'Blog', protected: false, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  ];

  // Authenticated navigation (logged in)
  const authNavItems = [
    { to: '/', text: 'Home', protected: false, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { to: '/games', text: 'Games', protected: false, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { to: '/quiz', text: 'Quiz', protected: false, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { to: '/report', text: 'Report', protected: false, icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
  ];

  // Choose nav items based on auth state
  const navItems = isAuthenticated ? authNavItems : publicNavItems;

  const handleClick = (e: React.MouseEvent, item: typeof navItems[0]) => {
    if (item.protected && !isAuthenticated) {
      e.preventDefault();
      onProtectedClick(item.text);
      if (closeMenu) closeMenu();
    } else {
      if (closeMenu) closeMenu();
    }
  };

  const baseClasses = isMobile
    ? "block py-3 px-4 text-lg text-center w-full"
    : "px-4 py-2";
  const activeClasses = isMobile
    ? "bg-primary text-white font-bold rounded-lg"
    : "text-primary font-semibold underline underline-offset-4 decoration-2";
  const inactiveClasses = isMobile
    ? "hover:bg-primary/20 rounded-lg"
    : "hover:text-primary transition-colors duration-300";

  return (
    <>
      {navItems.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={(e) => handleClick(e, item)}
          className={({ isActive }) =>
            `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
          }
        >
          <div className="flex items-center justify-center gap-2">
            {item.icon}
            <span>{item.text}</span>
          </div>
        </NavLink>
      ))}
    </>
  );
};

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [triggeredFeature, setTriggeredFeature] = useState<string>('');

  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handeProtectedClick = (featureName: string) => {
    setTriggeredFeature(featureName);
    setShowAuthModal(true);
  };

  return (
    <>
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-md dark:shadow-gray-800 fixed top-0 left-0 right-0 z-50">
        <nav className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <button onClick={() => navigate('/')} className="text-2xl font-bold text-primary focus:outline-none">
            AI AwareX
          </button>

          <div className="hidden md:flex items-center space-x-2 text-gray-700 dark:text-gray-300">
            {/* Only show navigation links when NOT authenticated (sidebar provides navigation when logged in) */}
            {!isAuthenticated && (
              <NavLinks
                isMobile={false}
                onProtectedClick={handeProtectedClick}
                isAuthenticated={isAuthenticated}
              />
            )}
            <div className="ml-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <GoogleTranslateWidget />

              </div>
              {isAuthenticated && (
                <>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {user?.email}
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="px-3 py-1 text-sm text-white bg-red-600 hover:bg-red-700 rounded transition"
                  >
                    Logout
                  </button>
                </>
              )}
              {!isAuthenticated && (
                <NavLink
                  to="/login"
                  className="px-3 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded transition"
                >
                  Login
                </NavLink>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center space-x-4">
            <div className="flex items-center gap-2">

              <ThemeToggle />
              <GoogleTranslateWidget />

            </div>
            <button onClick={toggleMenu} aria-label="Toggle menu">
              {isOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} bg-white dark:bg-gray-900 transition-all duration-300 ease-in-out`}>
          <div className="flex flex-col items-center space-y-2 py-4 border-t border-gray-200 dark:border-gray-700">
            {!isAuthenticated && (
              <NavLinks
                isMobile={true}
                closeMenu={() => setIsOpen(false)}
                onProtectedClick={handeProtectedClick}
                isAuthenticated={isAuthenticated}
              />
            )}
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                  setIsOpen(false);
                }}
                className="mt-4 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded transition w-11/12"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => {
                  navigate('/login');
                  setIsOpen(false);
                }}
                className="mt-4 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded transition w-11/12"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      <AuthGateModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        featureName={triggeredFeature}
      />
    </>
  );
};

export default Navbar;
