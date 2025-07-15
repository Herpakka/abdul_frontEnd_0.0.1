import React, { useState, useRef } from 'react';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';

export default function ChatBar() {
  const [message, setMessage] = useState('');
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Selected file:', file);
      setFilePreview(file.name);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      console.log('Sending message:', message);
      setMessage('');
      setFilePreview(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-purple-900/90 via-slate-800/90 to-purple-900/90 backdrop-blur-xl border-t border-purple-500/30">
      {/* File Preview */}
      {filePreview && (
        <div className="mb-3 p-3 bg-purple-800/30 border border-purple-500/50 rounded-xl flex items-center justify-between backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <DocumentArrowUpIcon className="w-5 h-5 text-orange-400" />
            <div>
              <div className="text-sm font-medium text-purple-100">{filePreview}</div>
              <div className="text-xs text-purple-300">Ready to upload</div>
            </div>
          </div>
          <button
            onClick={removeFile}
            className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 hover:scale-110 transition-all duration-200 flex items-center justify-center"
          >
            ×
          </button>
        </div>
      )}

      {/* Input Container */}
      <div className="flex items-end gap-3 bg-purple-800/40 rounded-3xl p-2 border-2 border-purple-500/50 focus-within:border-orange-400 focus-within:shadow-lg focus-within:shadow-orange-400/20 transition-all duration-300 backdrop-blur-sm">
        {/* Upload Button */}
        <button
          onClick={handleUploadClick}
          className={`flex-shrink-0 w-11 h-11 rounded-full border transition-all duration-200 flex items-center justify-center ${
            filePreview
              ? 'bg-orange-500/40 border-orange-400 text-orange-300'
              : 'bg-orange-500/20 border-orange-500/30 text-orange-400 hover:bg-orange-500/30 hover:scale-105 hover:shadow-lg hover:shadow-orange-400/30'
          }`}
        >
          <DocumentArrowUpIcon className="w-5 h-5" />
        </button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="*/*"
        />

        {/* Text Input */}
        <div className="flex-1 min-h-[44px] max-h-32 overflow-y-auto">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="w-full bg-transparent text-purple-100 placeholder-purple-300 border-none outline-none resize-none py-3 px-4 text-sm leading-5 min-h-[44px] max-h-32"
            rows="1"
            style={{ 
              height: 'auto',
              minHeight: '44px'
            }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
            }}
          />
        </div>

        {/* Send Button */}
        <button
          onClick={sendMessage}
          disabled={!message.trim()}
          className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/40 hover:from-orange-600 hover:to-orange-700 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg transition-all duration-200 flex items-center justify-center"
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
