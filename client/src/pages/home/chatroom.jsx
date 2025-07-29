import React, { useState, useEffect, useRef, useCallback } from "react";
import Axios from "axios";
import ChatInput from "../../components/chatinput";

export default function ChatRoomPage() {
    const [fileView, setFileView] = useState(false);
    const [chatData, setChatData] = useState({
        messages: [],
        fileData: null
    });
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatData.messages]);

    // **CALLBACK FUNCTION** - This receives messages from ChatInput
    const handleNewMessage = useCallback((message) => {
        setChatData(prev => ({
            ...prev,
            messages: [...prev.messages, message]
        }));
        console.log(`New message added: ${JSON.stringify(message)}`);
    }, []);

    // **CALLBACK FUNCTION** - This handles file data from ChatInput
    const handleFileData = useCallback((fileData) => {
        setChatData(prev => ({
            ...prev,
            fileData: fileData
        }));
    }, []);

    const fetchChatHistory = async () => {
        try {
            const response = await Axios.get('/api/chat/history');
            setChatData(prev => ({
                ...prev,
                messages: response.data.messages || [],
                fileData: response.data.fileData
            }));
        } catch (error) {
            console.error("Error fetching chat history:", error);
        }
    };

    // Load chat history on component mount
    useEffect(() => {
        fetchChatHistory();
    }, []);

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getMessageStatusIcon = (message) => {
        if (message.sender !== 'user') return null;

        switch (message.status) {
            case 'sent':
                return <span className="text-blue-200 text-xs">✓</span>;
            case 'delivered':
                return <span className="text-blue-200 text-xs">✓✓</span>;
            case 'error':
                return <span className="text-red-300 text-xs">!</span>;
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-white border-b shadow-sm px-6 py-4">
                <h1 className="text-2xl font-bold text-gray-800">Chat Room</h1>
                <div className="flex items-center space-x-4 mt-2">
                    <button
                        onClick={() => setFileView(!fileView)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                    >
                        {fileView ? 'Hide Files' : 'Show Files'}
                    </button>
                    <span className="text-xs text-gray-500">
                        {chatData.messages.length} messages
                    </span>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Main chat area */}
                <div className="flex-1 flex flex-col">
                    {/* Messages container */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {chatData.messages.length === 0 ? (
                            <div className="text-center text-gray-500 mt-12">
                                <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-md">
                                    <span className="text-2xl">💬</span>
                                </div>
                                <p className="text-lg font-medium">No messages yet</p>
                                <p className="text-sm">Start a conversation!</p>
                            </div>
                        ) : (
                            chatData.messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${message.sender === 'user'
                                                ? 'bg-blue-500 text-white rounded-br-md'
                                                : message.isError
                                                    ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-md'
                                                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                            {message.text}
                                        </p>

                                        {message.file && (
                                            <div className={`mt-2 text-xs p-2 rounded-lg ${message.sender === 'user'
                                                    ? 'bg-blue-400 bg-opacity-50'
                                                    : 'bg-gray-100'
                                                }`}>
                                                <div className="flex items-center space-x-1">
                                                    <span>📎</span>
                                                    <span className="font-medium">{message.file.name}</span>
                                                </div>
                                            </div>
                                        )}

                                        <div className={`text-xs mt-2 flex items-center justify-between ${message.sender === 'user'
                                                ? 'text-blue-100'
                                                : message.isError
                                                    ? 'text-red-600'
                                                    : 'text-gray-500'
                                            }`}>
                                            <span>{formatTimestamp(message.timestamp)}</span>
                                            {getMessageStatusIcon(message)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* **CHATINPUT WITH CALLBACKS** */}
                    <ChatInput
                        onNewMessage={handleNewMessage}
                        fileData={chatData.fileData}
                        setFileData={handleFileData}
                    />
                </div>

                {/* File sidebar */}
                {fileView && (
                    <div className="w-80 bg-white border-l shadow-lg p-4">
                        <h3 className="font-bold text-gray-800 mb-4 text-lg">Shared Files</h3>
                        <div className="space-y-3">
                            {chatData.messages
                                .filter(msg => msg.file)
                                .map((msg) => (
                                    <div key={`file-${msg.id}`} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                                        <p className="text-sm font-medium text-gray-800">{msg.file.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {(msg.file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {formatTimestamp(msg.timestamp)}
                                        </p>
                                    </div>
                                ))
                            }
                            {chatData.messages.filter(msg => msg.file).length === 0 && (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 text-4xl mb-2">📁</div>
                                    <p className="text-gray-500 text-sm">No files shared yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
