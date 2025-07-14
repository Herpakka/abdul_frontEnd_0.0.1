// src/pages/main.js
import React, { useState } from "react";
import { Routes, Route, Link, Outlet, Navigate } from "react-router-dom";
import {
    Bars3Icon,
    XMarkIcon,
    UserCircleIcon,
    HomeIcon,
} from "@heroicons/react/24/outline";
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
                    } bg-violet-900 text-violet-100 transition-all duration-200`}
            >
                {/* top-left menu button */}
                <button
                    onClick={toggle}
                    className="p-3 focus:outline-none hover:bg-violet-800 w-full flex items-center justify-center"
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
                        <Link
                            to=""
                            className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-violet-800"
                        >
                            <HomeIcon className="h-5 w-5" />
                            <span>Chat</span>
                        </Link>
                        <Link
                            to="chatmanage"
                            className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-violet-800"
                        >
                            <UserCircleIcon className="h-5 w-5" />
                            <span>Manage</span>
                        </Link>
                    </nav>
                )}
            </aside>

            {/* === Main content wrapper === */}
            <section className="flex flex-col flex-1 overflow-hidden">
                {/* Navbar */}
                <header className="flex items-center justify-between bg-violet-800 text-white px-4 h-14 shadow-md">
                    {/* left-aligned "home" logo/title */}
                    <Link to="" className="flex items-center gap-2 font-semibold">
                        <HomeIcon className="h-6 w-6" />
                        <span className="hidden sm:inline">Home</span>
                    </Link>

                    {/* right-aligned profile icon */}
                    <button className="hover:opacity-80">
                        <UserCircleIcon className="h-8 w-8" />
                    </button>
                </header>

                {/* Routed pages */}
                <main className="flex-1 overflow-y-auto bg-slate-100 p-6">
                    <Routes>
                        <Route index element={<ChatPage />} />
                        <Route path="chatmanage" element={<ChatManagePage/>} />
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