import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Ahome from "./admin/Ahome";
import Aknowledge from "./admin/Aknowledge"; // Import other admin components as needed

export default function AdminPage() {
    const [open, setOpen] = useState(true);
    const toggle = () => setOpen((prev) => !prev);
    const [pageContent, setPageContent] = useState(0); // State to manage content
    const pages = [
        { id: 0, title: "Home", component: <Ahome /> },
        { id: 1, title: "Knowledge Base", component: <Aknowledge /> },
        // Add more pages as needed
    ];
    return (
        <div className="flex h-screen w-screen overflow-hidden">
            {/* Sidebar */}
            <aside className={`left-0 top-16 h-full bg-gradient-to-b from-purple-900/95 via-purple-800/95 to-purple-900/95 backdrop-blur-xl border-r border-purple-600/40 shadow-xl shadow-purple-900/30 transition-all duration-300 z-40 ${open ? 'w-80' : 'w-16'}`}>
                <div className="p-4 flex justify-between items-center gap-3 bg-purple-600">
                    <button onClick={toggle} className="w-8 h-8 bg-purple-800/90 hover:bg-purple-700/90 text-orange-400 hover:text-orange-300 rounded-lg border border-purple-600/40 flex items-center justify-center transition-all duration-200 hover:scale-105 flex-shrink-0">
                        {open ? <XMarkIcon className="h-4 w-4" /> : <Bars3Icon className="h-4 w-4" />}
                    </button>
                    <span className={`text-lg font-semibold whitespace-nowrap transition-all duration-300 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                        Admin Panel
                    </span>
                </div>
                <div className={`px-2 pt-1 pb-6 h-[calc(100%-5rem)] flex flex-col transition-all duration-300 ${open ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
                    {/* Admin functionalities */}
                    <div className="flex-1 overflow-y-auto space-y-2">
                        {pages.map((page) => (
                            <button
                                key={page.id}
                                onClick={() => setPageContent(page.id)}
                                className={`w-full text-left px-4 py-2 border border-purple-600/30 hover:border-orange-400/50 rounded-lg hover:bg-purple-700/60 transition-colors duration-200 ${pageContent === page.id ? 'bg-orange-600 text-white hover:bg-orange-500' : 'text-purple-100'}`}
                            >
                                {page.title}
                            </button>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main content area  */}
            <div className="flex-1 flex flex-col min-w-0 bg-gray-100">
                {/* navbar */}
                <div className="bg-purple-600 shadow-md p-4 mb-6">
                    <h1 className="text-2xl font-bold">{pages[pageContent].title}</h1>
                </div>
                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {pages.map((page) => (
                        <div key={page.id} className={`transition-all duration-300 ${pageContent === page.id ? 'block' : 'hidden'}`}>
                            {page.component}
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}