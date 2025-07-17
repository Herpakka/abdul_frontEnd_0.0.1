import React, { useState } from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';

export default function SideBar() {
    const [isOpen, setIsOpen] = useState(true);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* Toggle Button - positioned outside sidebar */}
            {/* <button
                onClick={toggleSidebar}
                className={`fixed z-50 p-2 bg-white border border-gray-300 rounded-lg shadow-lg hover:bg-gray-50 transition-all duration-300 ${
                    isOpen ? 'left-52' : 'left-0'
                }`}
                aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
            >
                <svg 
                    className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    viewBox="0 0 24 24"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M15 19l-7-7 7-7" 
                    />
                </svg>
            </button> */}

            {/* Sidebar */}
            <div 
                className={`bg-white border-r border-gray-200 shadow-lg transition-all duration-300 ease-in-out fixed md:relative h-full z-40 ${
                    isOpen ? 'w-64 translate-x-0' : 'w-10 -translate-x-full md:translate-x-0'
                }`}
            >
                <button onClick={toggleSidebar} className='p-1 bg-white border border-gray-300 rounded-lg shadow-lg hover:bg-gray-50 transition-all duration-300'>
                    <Bars3Icon className={`h-6 w-6 text-gray-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`p-4 h-full overflow-hidden ${isOpen ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
                    {/* Sidebar Header */}
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-1">Navigation</h2>
                        <p className="text-sm text-gray-500">Quick access menu</p>
                    </div>

                    {/* Sidebar Content */}
                    <div className="flex flex-col space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <button 
                                key={i}
                                className="flex items-center w-full px-3 py-2.5 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors duration-200 group"
                            >
                                <div className="flex items-center space-x-3">
                                    {/* Icon for each button */}
                                    <div className="flex-shrink-0">
                                        {i === 0 && (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5a2 2 0 012-2h2a2 2 0 012 2v2H8V5z"/>
                                            </svg>
                                        )}
                                        {i === 1 && (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                                            </svg>
                                        )}
                                        {i === 2 && (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                                            </svg>
                                        )}
                                        {i === 3 && (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                            </svg>
                                        )}
                                        {i === 4 && (
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                            </svg>
                                        )}
                                    </div>
                                    <span className="font-medium">
                                        {i === 0 && 'Dashboard'}
                                        {i === 1 && 'Chat Rooms'}
                                        {i === 2 && 'Analytics'}
                                        {i === 3 && 'Settings'}
                                        {i === 4 && 'Profile'}
                                    </span>
                                </div>
                                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                                    </svg>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Sidebar Footer */}
                    <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">JD</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
                                    <p className="text-xs text-gray-500 truncate">john@example.com</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={toggleSidebar}
                />
            )}
        </>
    );
}