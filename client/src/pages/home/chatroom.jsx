import React, { createContext, useState, useEffect, useRef, useCallback, useContext } from "react";
import { UserContext, ChatContext } from "../home";
import { chatAPI } from "../../utils/chatApi";
import ChatInput from "../../components/chatinput";

export const ChatRoomContext = createContext();

export default function ChatRoomPage() {
    const { userData } = useContext(UserContext);
    const {
        newChat,
        setNewChat,
        chatHistory,
        setChatHistory,
        currentChat,
        setCurrentChat,
        fetchChatList,
        fetchChatHistory
    } = useContext(ChatContext);

    const [fileView, setFileView] = useState(false);
    const [chatData, setChatData] = useState({
        messages: [],
        chatId: currentChat?.id || null,
        fileData: null
    });
    const [fileData, setFileData] = useState(null);
    const messagesEndRef = useRef(null);

    // Derived values from context
    const userId = userData.userId || null;
    const chatId = currentChat?.id || null;
    const chatTitle = currentChat?.title || "New Chat";

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // **CALLBACK FUNCTION** - This receives messages from ChatInput
    const handleNewMessage = useCallback((message) => {
        setChatData(prev => ({
            ...prev,
            messages: [...prev.messages, message]
        }));
        console.log(`(chatroom) New message added: ${JSON.stringify(message)}`);
    }, []);

    // **CALLBACK FUNCTION** - This handles file data from ChatInput
    const handleFileData = useCallback((fileData) => {
        setChatData(prev => ({
            ...prev,
            fileData: fileData
        }));
        setFileData(fileData);
    }, []);

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getMessageStatusIcon = (message) => {
        if (message.role !== 'human') return null;
        switch (message.status) {
            case 'sent':
                return <span className="text-gray-400">✓</span>;
            case 'delivered':
                return <span className="text-blue-500">✓✓</span>;
            case 'error':
                return <span className="text-red-500">!</span>;
            default:
                return null;
        }
    };

    // Reset chat data when switching to new chat
    useEffect(() => {
        if (newChat) {
            setChatData({
                messages: [],
                chatId: null,
                fileData: null
            });
            setFileData(null);
        }
    }, [newChat]);

    // Update chat data when current chat changes
    useEffect(() => {
        if (currentChat) {
            console.log(`(chatroom) Chat title set to: ${currentChat.title}`);
            setChatData(prev => ({
                ...prev,
                messages: [],      // Will be populated by chatHistory effect
                fileData: null,
                chatId: currentChat.id
            }));
            setFileData(null);
        }
    }, [currentChat]);

    // Load chat history into messages
    useEffect(() => {
        if (newChat) {
            // For new chat, always clear messages
            setChatData(prev => ({
                ...prev,
                messages: []
            }));
        } else if (chatHistory && chatHistory.length > 0) {
            // For existing chat with history, load messages
            const messages = chatHistory.map(item => ({
                content: item.message.content || item.message,
                role: item.message.role || 'unknown',
                time: new Date(item.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                timestamp: item.created_at
            }));
            setChatData(prev => ({
                ...prev,
                messages: messages
            }));
        } else if (currentChat) {
            // For existing chat with no history, clear messages
            setChatData(prev => ({
                ...prev,
                messages: []
            }));
        }
    }, [chatHistory, newChat, currentChat]);

    // Auto-scroll when messages change
    useEffect(() => {
        scrollToBottom();
    }, [chatData.messages]);

    return (
        <div className="flex h-full bg-gray-50">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-semibold text-gray-900">{chatTitle}</h1>
                        <button
                            onClick={() => setFileView(!fileView)}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                            {fileView ? 'Chat View' : 'File View'}
                        </button>
                    </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4">
                    {!fileView ? (
                        // Chat Messages View - Claude-style layout
                        <div className="max-w-4xl mx-auto space-y-6">
                            {chatData.messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                                    <p className="text-gray-500">Start a conversation!</p>
                                </div>
                            ) : (
                                chatData.messages.map((message, index) => (
                                    <div key={index} className="w-full">
                                        {message.role === 'human' ? (
                                            // User Message - Right aligned with smaller width
                                            <div className="flex justify-end">
                                                <div className="max-w-sm sm:max-w-md md:max-w-lg">
                                                    <div className="bg-blue-500 text-white rounded-2xl rounded-br-sm px-4 py-3 shadow-sm">
                                                        {/* Message Content */}
                                                        <div className="break-words">
                                                            {message.content && (
                                                                <p className="text-sm leading-relaxed">{message.content}</p>
                                                            )}

                                                            {/* File Attachment */}
                                                            {message.file && (
                                                                <div className="mt-2 p-3 rounded-lg bg-blue-400 bg-opacity-50">
                                                                    <div className="flex items-center space-x-2">
                                                                        <svg className="w-4 h-4 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                                        </svg>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm font-medium truncate text-white">{message.file.name}</p>
                                                                            <p className="text-xs text-blue-100">
                                                                                {(message.file.size / 1024 / 1024).toFixed(2)} MB
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Message Footer */}
                                                        <div className="flex items-center justify-end mt-2">
                                                            <span className="text-xs text-blue-100 mr-2">
                                                                {message.time || formatTimestamp(message.timestamp)}
                                                            </span>
                                                            {getMessageStatusIcon(message)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            // Bot Message - Claude-style full width with avatar
                                            <div className="w-full">
                                                <div className="flex items-start space-x-4">
                                                    {/* Bot Avatar */}
                                                    <div className="flex-shrink-0 mt-1">
                                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    </div>

                                                    {/* Bot Message Content */}
                                                    <div className="flex-1 min-w-0">
                                                        {/* Bot Name */}
                                                        <div className="flex items-center mb-2">
                                                            <span className="text-sm font-semibold text-gray-900">อับดุล</span>
                                                            <span className="ml-2 text-xs text-gray-500">
                                                                {message.time || formatTimestamp(message.timestamp)}
                                                            </span>
                                                        </div>

                                                        {/* Message Bubble */}
                                                        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                                                            <div className="break-words">
                                                                {message.content && (
                                                                    <div className="prose prose-sm max-w-none text-gray-900 leading-relaxed">
                                                                        {message.content.split('\n').map((line, i) => (
                                                                            <p key={i} className="mb-2 last:mb-0">{line}</p>
                                                                        ))}
                                                                    </div>
                                                                )}

                                                                {/* File Attachment */}
                                                                {message.file && (
                                                                    <div className="mt-3 p-3 rounded-lg bg-gray-100">
                                                                        <div className="flex items-center space-x-3">
                                                                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                                            </svg>
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-sm font-medium text-gray-900 truncate">{message.file.name}</p>
                                                                                <p className="text-xs text-gray-500">
                                                                                    {(message.file.size / 1024 / 1024).toFixed(2)} MB
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    ) : (
                        // File View
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-white rounded-lg border border-gray-200 p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Shared Files</h2>
                                {chatData.fileData ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                            </svg>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{chatData.fileData.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {(chatData.fileData.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-gray-500">No files shared yet</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Chat Input */}
                <div className="border-t border-gray-200 bg-white">
                    <div className="max-w-4xl mx-auto">
                        <ChatRoomContext.Provider value={{ newChat, setNewChat, userId, chatId, fileData, setFileData }}>
                            <ChatInput
                                onNewMessage={handleNewMessage}
                                chatId={chatId}
                                onFileData={handleFileData}
                                setFileData={setFileData}
                            />
                        </ChatRoomContext.Provider>
                    </div>
                </div>
            </div>
        </div>
    );
}