import React, { useState, useContext, useEffect } from 'react';
import { ChatContext } from '../pages/home';

export default function RenameModal({ isOpen, onClose, onRename }) {
    const { currentChat, handleChatRename } = useContext(ChatContext);
    const [newTitle, setNewTitle] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Set the current chat title when modal opens
    useEffect(() => {
        if (isOpen && currentChat?.title) {
            setNewTitle(currentChat.title);
        }
    }, [isOpen, currentChat?.title]);

    const handleRename = async () => {
        if (!newTitle.trim() || !currentChat?.id) {
            return;
        }
        
        setIsLoading(true);
        try {
            // Call the handleChatRename function with chatId and newTitle
            await handleChatRename(currentChat.id, newTitle.trim());
            
            // Close modal on success (SweetAlert will show success message)
            setNewTitle('');
            onClose();
        } catch (error) {
            console.error('Rename failed:', error);
            // Error handling is already done in handleChatRename with SweetAlert
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setNewTitle('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        เปลี่ยนชื่อแชท
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isLoading}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Input Field */}
                <div className="mb-6">
                    <label htmlFor="chatTitle" className="block text-sm font-medium text-gray-700 mb-2">
                        ชื่อแชท
                    </label>
                    <input
                        id="chatTitle"
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="ใส่ชื่อแชทใหม่"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        disabled={isLoading}
                        autoFocus
                        maxLength={50}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {newTitle.length}/50 ตัวอักษร (ขั้นต่ำ 3 ตัวอักษร)
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3">
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ยกเลิก
                    </button>
                    <button
                        onClick={handleRename}
                        disabled={isLoading || !newTitle.trim() || newTitle.length < 3}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        {isLoading && (
                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        <span>{isLoading ? 'กำลังเปลี่ยนชื่อ...' : 'เปลี่ยนชื่อ'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
