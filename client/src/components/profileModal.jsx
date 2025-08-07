import { useState, useContext } from 'react';
import { UserContext } from '../pages/home';
import { XMarkIcon, UserCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function ProfileModal({ isOpen, onClose }) {
    const { userData } = useContext(UserContext);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                            <UserCircleIcon className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Profile Information</h2>
                            <p className="text-blue-100 text-sm">Manage your account</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* User Info */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <UserCircleIcon className="w-5 h-5 text-gray-500" />
                            <div>
                                <p className="text-sm font-medium text-gray-700">Username</p>
                                <p className="text-gray-900">{userData.username || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <EnvelopeIcon className="w-5 h-5 text-gray-500" />
                            <div>
                                <p className="text-sm font-medium text-gray-700">Email</p>
                                <p className="text-gray-900">{userData.email || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
