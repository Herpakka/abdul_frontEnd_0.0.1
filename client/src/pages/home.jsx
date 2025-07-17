
import { useState } from "react";
import NavBar from "../components/navbar";
import SideBar from "../components/sidebar";
import ChatRoomPage from "./home/chatroom";


export default function HomePage() {

    // If you want to switch content, you can use setContent, but for now just render ChatRoomPage

    return (
        <div className="flex h-screen w-screen overflow-hidden">
            <div className="min-h-screen flex flex-col w-full">
                <NavBar />
                <div className="flex flex-1">
                    {/* Sidebar */}
                    <SideBar />
                    {/* Main content */}
                    <div className="flex-1">
                        <ChatRoomPage />
                    </div>
                </div>
            </div>
        </div>
    );
}