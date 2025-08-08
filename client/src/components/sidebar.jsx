import { useState, useEffect, useContext, useRef } from 'react';
import { ChatContext } from '../pages/home';
import {
  Bars3Icon,
  XMarkIcon,
  PlusIcon,
  StarIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';
import RenameModal from './renameModal';

export default function SideBar({ selected_chat, onChatSelect, isOpen, setIsOpen }) {
  const { 
    chatList,
    currentChat, 
    setCurrentChat, 
    setNewChat,
    handleChatDelete
  } = useContext(ChatContext);
  const [chatHistory, setChatHistory] = useState(chatList || []);
  const [selectedChat, setSelectedChat] = useState(selected_chat || null);
  const [hoveredChat, setHoveredChat] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleSidebar = () => {
    if (setIsOpen) setIsOpen(!isOpen);
  };

  const handleChatSelect = (chat) => {
    console.log(`(sidebar) Selected chat: ${chat.title} (ID: ${chat.id})`);
    if (onChatSelect) onChatSelect(chat);
    if (setCurrentChat) setCurrentChat(chat);
  };

  const handleNewChat = () => {
    setNewChat(true);
  };

  const handleMenuAction = (action, chatId, e) => {
    e.stopPropagation();
    console.log(`${action} action for chat:`, chatId);
    
    switch(action) {
      case 'archive':
        // Toggle archive logic here
        break;
      case 'rename':
        setIsRenameModalOpen(true);
        break;
      case 'delete':
        handleChatDelete(chatId);
        break;
    }
    
    setOpenMenu(null);
  };

  const toggleMenu = (chatId, e) => {
    e.stopPropagation();
    setOpenMenu(openMenu === chatId ? null : chatId);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setChatHistory(chatList || []);
  }, [chatList]);

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed md:relative left-0 top-16 h-[calc(100%-4rem)] bg-gradient-to-b from-purple-900/95 via-purple-800/95 to-purple-900/95 backdrop-blur-xl border-r border-purple-600/40 shadow-xl shadow-purple-900/30 transform transition-transform duration-300 z-40 ${isOpen ? 'translate-x-0 w-80' : '-translate-x-full w-80 md:translate-x-0 md:w-16'
          }`}
      >
        {/* Top Bar with Toggle and New Chat Button */}
        <div className="p-4 flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="w-8 h-8 bg-purple-800/90 hover:bg-purple-700/90 text-orange-400 hover:text-orange-300 rounded-lg border border-purple-600/40 flex items-center justify-center transition-all duration-200 hover:scale-105 flex-shrink-0"
          >
            {isOpen ? (
              <XMarkIcon className="h-4 w-4" />
            ) : (
              <Bars3Icon className="h-4 w-4" />
            )}
          </button>

          {/* New Chat Button - Hidden when closed */}
          <button
            className={`h-8 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg shadow-lg shadow-orange-600/30 font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] ${isOpen ? 'flex-1 px-3 opacity-100' : 'w-0 px-0 opacity-0 pointer-events-none'
              }`}
            onClick={handleNewChat}
          >
            <PlusIcon className="h-4 w-4 flex-shrink-0" />
            <span className={`text-sm whitespace-nowrap ${isOpen ? 'block' : 'hidden'}`}>
              New Chat
            </span>
          </button>
        </div>

        {/* Content - Hidden when closed */}
        <div className={`px-6 pb-6 h-[calc(100%-5rem)] flex flex-col ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-200`}>
          {/* Chat List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            <h3 className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
              Chats
            </h3>

            {chatList.map((chat) => {
              const isSelected = currentChat && chat.id === currentChat.id;
              const isHovered = hoveredChat === chat.id;
              const showEllipsis = isSelected || isHovered;
              
              return (
                <div
                  key={chat.id}
                  className={`group p-1 bg-purple-800/40 hover:bg-purple-700/60 rounded-xl border border-purple-600/30 hover:border-orange-400/50 cursor-pointer transition-all duration-200 relative
                    ${isSelected
                      ? 'bg-orange-500/80 text-white shadow-lg border border-orange-400'
                      : 'hover:bg-blue-100'
                    }`}
                  onClick={() => handleChatSelect(chat)}
                  onMouseEnter={() => setHoveredChat(chat.id)}
                  onMouseLeave={() => setHoveredChat(null)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-purple-100 truncate group-hover:text-orange-300 transition-colors">
                        {chat.title}
                      </h4>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {/* Ellipsis Button */}
                      <div className="relative">
                        <button
                          className={`hover:bg-white rounded-full p-1 transition-opacity duration-200 ${showEllipsis ? 'opacity-100' : 'opacity-0'}`}
                          onClick={(e) => toggleMenu(chat.id, e)}
                        >
                          <EllipsisHorizontalIcon className="h-5 w-5 text-purple-400 group-hover:text-orange-300 transition-colors" />
                        </button>

                        {/* Floating Menu */}
                        {openMenu === chat.id && (
                          <div
                            ref={menuRef}
                            className="absolute right-0 top-8 z-50 bg-purple-900/95 backdrop-blur-xl border border-purple-600/40 rounded-lg shadow-xl shadow-purple-900/50 py-1 min-w-[120px]"
                          >
                            <button
                              onClick={(e) => handleMenuAction('archive', chat.id, e)}
                              className="w-full px-3 py-2 text-left text-sm text-purple-100 hover:bg-purple-700/60 flex items-center gap-2 transition-colors duration-150"
                            >
                              <ArchiveBoxIcon className="h-4 w-4" />
                              Archive
                            </button>
                            <button
                              onClick={(e) => handleMenuAction('rename', chat.id, e)}
                              className="w-full px-3 py-2 text-left text-sm text-purple-100 hover:bg-purple-700/60 flex items-center gap-2 transition-colors duration-150"
                            >
                              <PencilIcon className="h-4 w-4" />
                              Rename
                            </button>
                            <button
                              onClick={(e) => handleMenuAction('delete', chat.id, e)}
                              className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-purple-700/60 flex items-center gap-2 transition-colors duration-150"
                            >
                              <TrashIcon className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Star Icon */}
                      {chat.starred && (
                        <StarIcon className="h-4 w-4 text-orange-400 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile when open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm lg:hidden z-30"
          onClick={toggleSidebar}
        ></div>
      )}
      {/* Rename Modal */}
      <RenameModal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
      />
    </>
  );
}