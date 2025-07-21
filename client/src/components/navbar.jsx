import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, ChevronDownIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

export default function NavBar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);
    const buttonRef = useRef(null);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleProfile = () => {
        console.log('Navigate to profile');
        setIsMenuOpen(false);
    };

    const handleLogout = () => {
        console.log('Logout user');
        setIsMenuOpen(false);
        navigate('/login'); // Redirect to login page after logout
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && 
                !menuRef.current.contains(event.target) && 
                !buttonRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="w-screen bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 px-6 py-4 flex items-center justify-between border-b border-purple-700/50 backdrop-blur-sm">
            <div className="text-orange-400 font-bold text-xl drop-shadow-md">ABDUL</div>
            
            <div className="relative">
                <button 
                    ref={buttonRef}
                    onClick={toggleMenu}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-800/50 border border-purple-600/40 text-purple-100 hover:bg-purple-700/60 hover:border-orange-400/50 transition-all duration-200"
                >
                    <UserIcon className="h-5 w-5" />
                    <span className="text-sm font-medium">Admin</span>
                    <ChevronDownIcon 
                        className={`h-4 w-4 transition-transform duration-200 ${
                            isMenuOpen ? 'rotate-180' : ''
                        }`} 
                    />
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                    <div 
                        ref={menuRef}
                        className="absolute right-0 top-full mt-2 w-48 bg-purple-800/90 border border-purple-600/40 rounded-xl shadow-xl shadow-purple-900/50 backdrop-blur-xl z-50"
                    >
                        <div className="py-2">
                            {/* Profile */}
                            <button
                                onClick={handleProfile}
                                className="w-full px-4 py-3 text-left flex items-center gap-3 text-purple-100 hover:bg-purple-700/60 hover:text-orange-300 transition-all duration-200"
                            >
                                <UserCircleIcon className="h-5 w-5" />
                                <span className="text-sm font-medium">Profile</span>
                            </button>

                            {/* Divider */}
                            <div className="mx-4 my-2 border-t border-purple-600/40"></div>

                            {/* Logout */}
                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-3 text-left flex items-center gap-3 text-purple-100 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
                            >
                                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                <span className="text-sm font-medium">Logout</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
