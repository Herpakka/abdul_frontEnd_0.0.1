import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../pages/home';
import { UserIcon, ChevronDownIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import ProfileModal from './profileModal';

export default function NavBar() {
  const { userData, handleLogout } = useContext(UserContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(userData.username || 'Whos that!');
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleProfile = () => {
    console.log('Navigate to profile');
    setIsProfileOpen(true); // Fix: Open the profile modal
    setIsMenuOpen(false);   // Close the dropdown menu
  };

  const onLogoutClick = () => {
    handleLogout();
    setIsMenuOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current &&
          !menuRef.current.contains(event.target) &&
          buttonRef.current &&
          !buttonRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav className="bg-purple-900/95 border-r border-purple-600/40 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              ref={buttonRef}
              onClick={toggleMenu}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-purple-700/60 transition-colors duration-200"
            >
              <UserCircleIcon className="w-8 h-8 text-orange-400" />
              <div className="text-left">
                <p className="text-md text-white">{user}</p>
              </div>
              <ChevronDownIcon className={`w-4 h-4 text-orange-400 transition-transform duration-200 ${
                isMenuOpen ? 'transform rotate-180' : ''
              }`} />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div
                ref={menuRef}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
              >
                {/* Profile */}
                <button
                  onClick={handleProfile}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                >
                  <UserCircleIcon className="w-4 h-4 mr-3 text-gray-500" />
                  Profile
                </button>

                {/* Divider */}
                <div className="border-t border-gray-100 my-1"></div>

                {/* Logout */}
                <button
                  onClick={onLogoutClick}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3 text-red-500" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Profile Modal */}
      {isProfileOpen && (
        <ProfileModal 
          isOpen={isProfileOpen} 
          onClose={() => setIsProfileOpen(false)} 
        />
      )}
    </>
  );
}
