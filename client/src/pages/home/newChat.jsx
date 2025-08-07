import { useState, useCallback } from 'react';
import ChatInput from "../../components/chatinput";

export default function NewChatRoom() {
    const [chatData, setChatData] = useState({
        messages: [],
        fileData: null
    });

    const handleNewMessage = useCallback((message) => {
        setChatData(prev => ({
            ...prev,
            messages: [...prev.messages, message]
        }));
        console.log(`New message added: ${JSON.stringify(message)}`);
    }, []);

    const handleFileData = useCallback((fileData) => {
        setChatData(prev => ({
            ...prev,
            fileData: fileData
        }));
    }, []);

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className='flex flex-col'>
                <h1 className="text-2xl font-bold text-center mt-10">Welcome</h1>
                <ChatInput
                    onNewMessage={handleNewMessage}
                    fileData={chatData.fileData}
                    setFileData={handleFileData}
                />
            </div>
        </div>
    )
}