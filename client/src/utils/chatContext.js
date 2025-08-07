// ChatContext.js
import React, { createContext, useState } from 'react';

export const ChatContext = createContext(null);

export function ChatProvider({ children }) {
    const [chatList, setChatList] = useState([]);
    const [chatHistory, setChatHistory] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [newChat, setNewChat] = useState(true);
    // Add more state as needed

    return (
        <ChatContext.Provider value={{
            chatList,
            setChatList,
            currentChat,
            setCurrentChat,
            chatHistory,
            setChatHistory,
            newChat,
            setNewChat,
            // Add other setters/states here as needed
        }}>
            {children}
        </ChatContext.Provider>
    );
}
