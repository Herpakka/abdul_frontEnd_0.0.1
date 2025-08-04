import { useState, useContext } from "react";
import { useAuth } from "../auth/authContext";
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";

import NavBar from "../components/navbar";
import SideBar from "../components/sidebar";
import ChatRoomPage from "./home/chatroom";

export default function HomePage() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { user } = useAuth();
    const [username, setUsername] = useState(user ? user.username : '');

    const handleLogout = () => {
        try {
            Swal.fire({
                title: 'จะไปเเล้วเหรออ?',
                text: 'คุณต้องการออกจากระบบใช่ไหม?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'ใช่, ออกจากระบบ',
                cancelButtonText: 'ยกเลิก',
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280',
                customClass: {
                    confirmButton: 'bg-red-500 text-white hover:bg-red-600 focus:ring-4 focus:ring-red-300',
                    cancelButton: 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-4 focus:ring-gray-300'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    logout();
                    navigate('/login');
                }
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'ไม่สามารถออกจากระบบได้',
                text: 'เกิดข้อผิดพลาดที่ไม่คาดคิดขณะออกจากระบบ',
                confirmButtonColor: '#dc2626'
            });
        }
    };

    return (
        <div className="flex h-screen w-screen overflow-hidden">
            {/* Sidebar */}
            <SideBar />

            {/* Main content area */}
            <div className="flex flex-col flex-1 min-w-0">
                {/* Navbar */}
                <NavBar 
                    userName={username}
                    onLogout={handleLogout} />
                {/* Content */}
                <div className="flex-1 overflow-hidden">
                    <ChatRoomPage />
                </div>
            </div>
        </div>
    );
}