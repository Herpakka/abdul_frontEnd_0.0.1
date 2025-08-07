import { useRef, useState, useEffect, useContext } from "react";
import Axios from "axios";
import { ChatContext } from "../pages/home";
import { ChatRoomContext } from "../pages/home/chatroom";
import { PDFDocument } from 'pdf-lib';
import { PaperClipIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ChatInput({ onNewMessage, chatId, fileData, setFileData }) {
  const { fetchChatList, chatList, setNewChat, setCurrentChat } = useContext(ChatContext);
  const { newChat, userId } = useContext(ChatRoomContext);
  const inputRef = useRef(null);
  const [chat_id, setChat_id] = useState(chatId || null);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf' || file.size > 25 * 1024 * 1024) {
      alert('Please upload a valid PDF file (max 25MB)');
      return;
    }

    const buffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(buffer);
    const base64 = await pdf.saveAsBase64({ dataUri: true });

    setFileData({
      name: file.name,
      size: file.size,
      mime: file.type,
      dataUri: base64,
      size64: base64.length
    });
  }

  const handleSend = async () => {
    if (chatInput.trim() === "" || isLoading) return;

    const messageText = chatInput.trim();
    const currentFile = fileData;

    // Clear input immediately for better UX
    setChatInput("");
    setFileData(null);

    // Create user message object
    const userMessage = {
      id: Date.now(),
      content: messageText,
      time: new Date().toISOString(),
      role: 'human',
      file: currentFile,
      status: 'sent'
    };

    // Add user message immediately
    onNewMessage(userMessage);
    setIsLoading(true);

    try {
      const response = await sendMessage(messageText, currentFile);
      handleSuccessResponse(response);
    } catch (error) {
      handleErrorResponse(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to send message based on chat type
  const sendMessage = async (messageText, currentFile) => {
    const payload = {
      message: messageText,
      file: currentFile
    };

    if (newChat) {
      return await Axios.post('http://localhost:5678/webhook/create-new-chat', {
        status: 'new',
        user_id: userId,
        ...payload
      });
    } else {
      return await Axios.post('http://localhost:5678/webhook/nlqchat001', {
        chat_id: chat_id,
        ...payload
      });
    }
  };

  // Helper function to handle successful responses
  const handleSuccessResponse = (response) => {
    if (response.data?.output) {
        if (newChat) {
            // Use async/await for better flow control
            const updateChatAndSetCurrent = async () => {
                const updatedChatList = await fetchChatList();
                if (updatedChatList && updatedChatList.length > 0) {
                    // Latest chat is now guaranteed to be first
                    setCurrentChat(updatedChatList[0]);
                    setNewChat(false);
                }
            };
            updateChatAndSetCurrent();
        }
        
        const botMessage = {
            id: Date.now() + Math.random(),
            content: response.data.output.trim(),
            time: new Date().toISOString(),
            role: 'ai',
            status: 'received'
        };

        console.log(`Bot response: ${response.data.output}`);
        onNewMessage(botMessage);
    } else {
        console.warn('Unexpected response format:', response.data);
        createErrorMessage("Received an unexpected response format from the server.");
    }
};


  // Helper function to handle errors
  const handleErrorResponse = (error) => {
    console.error('Failed to send message:', error);
    createErrorMessage("Sorry, I couldn't process your message. Please try again.");
  };

  // Helper function to create error messages
  const createErrorMessage = (content) => {
    const errorMessage = {
      id: Date.now() + Math.random(),
      content,
      time: new Date().toISOString(),
      role: 'ai',
      status: 'error',
      isError: true
    };
    onNewMessage(errorMessage);
  };


  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    setChat_id(chatId);
  }, [chatId]);

  return (
    <div className="border-t bg-white p-4 shadow-lg">
      {/* File preview */}
      {fileData && (
        <div className="mb-3 flex items-center justify-between bg-blue-50 border border-blue-200 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <PaperClipIcon className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">{fileData.name}</span>
            <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              {(fileData.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
          <button
            onClick={() => setFileData(null)}
            className="text-blue-500 hover:text-red-500 transition-colors duration-200"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="mb-3 flex items-center space-x-2 text-blue-600 bg-blue-50 p-2 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="text-sm font-medium">Bot is typing...</span>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="w-full p-3 border-2 border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 text-gray-800 placeholder-gray-400"
            rows="1"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
        </div>

        {/* File upload button */}
        <label className={`cursor-pointer p-3 rounded-xl text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition-all duration-200 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
          <PaperClipIcon className="h-5 w-5" />
          <input
            type="file"
            accept=".pdf"
            onChange={handleFile}
            disabled={isLoading}
            className="hidden"
          />
        </label>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={chatInput.trim() === "" || isLoading}
          className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 font-medium shadow-md hover:shadow-lg"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Sending</span>
            </>
          ) : (
            <span>Send</span>
          )}
        </button>
      </div>
    </div>
  );
}
