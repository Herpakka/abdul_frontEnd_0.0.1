// src/pages/main.js
import React, { useState } from "react";
import { Routes, Route, Link, Outlet, Navigate } from "react-router-dom";
import {
    Bars3Icon,
    XMarkIcon,
    UserCircleIcon,
    HomeIcon,
    PlusCircleIcon,
    MagnifyingGlassIcon
} from "@heroicons/react/24/outline";
import '../css/home.css'; // Assuming you have a CSS file for home styles

import ChatPage from "./home/chatPage";
import ChatManagePage from "./home/managePage";

export default function Home() {
    const [open, setOpen] = useState(true);
    const toggle = () => setOpen((prev) => !prev);
    return (
        <div className="flex h-screen w-screen overflow-hidden">
            {/* === Sidebar === */}
            <aside
                className={`${open ? "w-56" : "w-14"
                    } sidebar text-violet-100 transition-all duration-200`}
            >
                {/* top-left menu button - now matches header height */}
                <button
                    onClick={toggle}
                    className={`py-4 px-4 focus:outline-none hover:bg-violet-800 w-full flex items-center ${open ? "justify-end" : "justify-center"}`}
                    style={{ height: '72px' }} // Same height as header (16px padding * 2 + content height)
                >
                    {open ? (
                        <XMarkIcon className="h-6 w-6" />
                    ) : (
                        <Bars3Icon className="h-6 w-6" />
                    )}
                </button>

                {/* nav links only when open */}
                {open && (
                    <nav className="mt-4 flex flex-col gap-2 px-2">
                        <button
                            className="new-chat-btn"
                        >
                            <PlusCircleIcon className="h-5 w-5" />
                            <span>New chat</span>
                        </button>
                        <button
                            className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-violet-800"
                        >
                            <MagnifyingGlassIcon className="h-5 w-5" />
                            <span>Search</span>
                        </button>
                        <div className="flex flex-col overflow-y-auto max-h-[calc(100vh-200px)] mt-2 pr-1">
                            <span className="text-sm font-semibold text-violet-300 px-3 mb-1">Chats</span>
                            {Array.from({ length: 50 }, (_, index) => (
                                <button
                                    key={index}
                                    className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-violet-800 text-left"
                                >
                                    <span>Chat {index + 1}</span>
                                </button>
                            ))}
                        </div>
                    </nav>
                )}
            </aside>

            {/* === Main content wrapper === */}
            <section className="flex flex-col flex-1 overflow-hidden">
                {/* Navbar */}
                <header className="header">
                    {/* left-aligned "home" logo/title */}
                    <Link to="" className="flex items-center gap-2 font-semibold">
                        <HomeIcon className="h-6 w-6" />
                        <h1 className="hidden sm:inline">Home</h1>
                    </Link>

                    {/* right-aligned profile icon */}
                    <button className="hover:opacity-80">
                        <UserCircleIcon className="h-8 w-8" />
                    </button>
                </header>

                {/* Routed pages */}
                <main 
                    className="routed-page flex-1 overflow-y-auto"
                >
                    <Routes>
                        <Route index element={<ChatManagePage />} />
                        <Route path="chatmanage" element={<ChatManagePage />} />
                        <Route
                            path="*"
                            element={<div className="text-center text-lg">Not Found</div>}
                        />
                    </Routes>
                </main>
            </section>
        </div>
    );
}