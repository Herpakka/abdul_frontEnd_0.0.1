import NavBar from "../components/navbar";
import SideBar from "../components/sidebar";
import ChatRoomPage from "./home/chatroom";


export default function HomePage() {

    // If you want to switch content, you can use setContent, but for now just render ChatRoomPage

    return (
        <div className="flex h-screen w-screen overflow-hidden">
            {/* Sidebar */}
            <SideBar />

            {/* Main content area */}
            <div className="flex flex-col flex-1 min-w-0">
                {/* Navbar */}
                <NavBar />

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    <ChatRoomPage />
                </div>
            </div>
        </div>
    );
}