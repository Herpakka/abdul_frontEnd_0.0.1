import React, { useState } from 'react';
import { 
  Bars3Icon, 
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
  ClockIcon,
  StarIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

export default function SideBar() {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const chatHistory = [
    { id: 1, title: "React Development Tips", time: "2 hours ago", starred: true },
    { id: 2, title: "Tailwind CSS Guide", time: "1 day ago", starred: false },
    { id: 3, title: "API Integration Help", time: "3 days ago", starred: false },
    { id: 4, title: "Database Design Discussion", time: "1 week ago", starred: true },
    { id: 5, title: "Project Management Strategies", time: "2 weeks ago", starred: false },
    { id: 6, title: "Frontend Frameworks Comparison", time: "3 weeks ago", starred: true },
    { id: 7, title: "JavaScript ES2023 Features", time: "1 month ago", starred: false },
    { id: 8, title: "CSS Grid vs Flexbox", time: "2 months ago", starred: false },
    { id: 9, title: "Web Accessibility Best Practices", time: "3 months ago", starred: true },
    { id: 10, title: "Performance Optimization Techniques", time: "4 months ago", starred: false }    
  ];

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`left-0 top-16 h-[calc(100vh-4rem)] bg-gradient-to-b from-purple-900/95 via-purple-800/95 to-purple-900/95 backdrop-blur-xl border-r border-purple-600/40 shadow-xl shadow-purple-900/30 transition-all duration-300 z-40 ${
          isOpen ? 'w-80' : 'w-16'
        }`}
      >
        {/* Toggle Button - Always visible at top */}
        <div className="p-4">
          <button
            onClick={toggleSidebar}
            className="w-8 h-8 bg-purple-800/90 hover:bg-purple-700/90 text-orange-400 hover:text-orange-300 rounded-lg border border-purple-600/40 flex items-center justify-center transition-all duration-200 hover:scale-105"
          >
            {isOpen ? (
              <XMarkIcon className="h-4 w-4" />
            ) : (
              <Bars3Icon className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Content - Hidden when closed */}
        <div className={`px-6 pb-6 h-[calc(100%-5rem)] flex flex-col ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-200`}>
          {/* New Chat Button */}
          <button className="w-full p-3 mb-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl shadow-lg shadow-orange-600/30 font-medium flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02]">
            <PlusIcon className="h-5 w-5" />
            New Chat
          </button>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            <h3 className="text-sm font-medium text-purple-300 mb-3 flex items-center gap-2">
              Chats
            </h3>
            
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                className="group p-3 bg-purple-800/40 hover:bg-purple-700/60 rounded-xl border border-purple-600/30 hover:border-orange-400/50 cursor-pointer transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-purple-100 truncate group-hover:text-orange-300 transition-colors">
                      {chat.title}
                    </h4>
                    <p className="text-xs text-purple-400 mt-1">{chat.time}</p>
                  </div>
                  {chat.starred && (
                    <StarIcon className="h-4 w-4 text-orange-400 flex-shrink-0 ml-2" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* User Profile */}
          <div className="mt-6 pt-6 border-t border-purple-600/40">
            <div className="flex items-center gap-3 p-3 bg-purple-800/40 rounded-xl border border-purple-600/30">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-purple-100 truncate">John Doe</h4>
                <p className="text-xs text-purple-400 truncate">john@example.com</p>
              </div>
            </div>
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
    </>
  );
}
