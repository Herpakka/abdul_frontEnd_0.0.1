import { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "../auth/authContext";
import { chatAPI } from "../utils/chatApi";
import { useNavigate } from 'react-router-dom';
import Swal from "sweetalert2";

import NavBar from "../components/navbar";
import SideBar from "../components/sidebar";
import ChatRoomPage from "./home/chatroom";

export const UserContext = createContext(null);
export const ChatContext = createContext(null);

export default function HomePage() {
    const navigate = useNavigate();
    const { getProfile, logout } = useAuth();
    const [userData, setUserData] = useState({
        userId: null,
        username: '',
        email: '',
        isAuthenticated: false,
        isLoading: true
    });
    const [newChat, setNewChat] = useState(true);
    const [chatList, setChatList] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);

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

    const fetchChatList = async () => {
        try {
            const chats = await chatAPI.getChatList(userData.userId);
            if (chats) {
                const data = chats.data || [];

                // Sort by update_at descending (latest first)
                const sortedChats = data
                    .map(chat => ({
                        id: chat.id,
                        title: chat.chat_title || chat.title,
                        time: new Date(chat.update_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                        }),
                        timestamp: chat.update_at // Preserve original timestamp
                    }))
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                setChatList(sortedChats);
                return sortedChats; // Return sorted list
            }
        } catch (error) {
            console.error('Error fetching chat list:', error);
            return [];
        }
    };

    const fetchChatHistory = async () => {
        if (!currentChat) return;
        try {
            const history = await chatAPI.getChatHistory(currentChat.id);
            if (history) {
                const process1 = history.data || [];
                const process2 = process1.map(item => ({
                    ...item,
                    message: {
                        content: item.message.content || item.message,
                        role: item.message.type || 'unknown'
                    },
                    time: new Date(item.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                }));
                setChatHistory(process2 || []);
            }
        } catch (error) {
            console.error('Error fetching chat history:', error);
        }
    };

    const handleChatSelect = (chat) => {
        console.log(`(home) Selected chat: ${chat.title} (ID: ${chat.id})`);
        setChatHistory([]);
        setCurrentChat(chat);
        setNewChat(false);
    };

    const handleChatDelete = async (chatId) => {
        Swal.fire({
            title: 'คุณแน่ใจหรือไม่?',
            text: "การลบแชทจะไม่สามารถกู้คืนได้!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ใช่, ลบแชท',
            cancelButtonText: 'ยกเลิก',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            customClass: {
                confirmButton: 'bg-red-500 text-white hover:bg-red-600 focus:ring-4 focus:ring-red-300',
                cancelButton: 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-4 focus:ring-gray-300'
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await chatAPI.deleteChat(chatId);
                    if (response.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'แชทถูกลบแล้ว',
                            text: 'แชทของคุณถูกลบเรียบร้อยแล้ว',
                            confirmButtonColor: '#10b981'
                        });
                        // Refresh chat list
                        const updatedChatList = await fetchChatList();
                        if (updatedChatList && updatedChatList.length > 0) {
                            setCurrentChat(updatedChatList[0]);
                        } else {
                            setCurrentChat(null);
                        }
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'ไม่สามารถลบแชทได้',
                            text: response.error || 'เกิดข้อผิดพลาดในการลบแชท',
                            confirmButtonColor: '#dc2626'
                        });
                    }
                } catch (error) {
                    console.error('Error deleting chat:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'ไม่สามารถลบแชทได้',
                        text: 'เกิดข้อผิดพลาดที่ไม่คาดคิดขณะลบแชท',
                        confirmButtonColor: '#dc2626'
                    });
                }
            }
        })
    };

    const handleChatRename = async (chatId, newTitle) => {
        if (!newTitle || newTitle.trim() === '') {
            Swal.fire({
                icon: 'warning',
                title: 'ชื่อแชทไม่ถูกต้อง',
                text: 'กรุณาใส่ชื่อแชทที่ไม่ว่างเปล่า',
                confirmButtonColor: '#dc2626'
            });
            return;
        } else if (newTitle.length > 50) {
            Swal.fire({
                icon: 'warning',
                title: 'ชื่อแชทยาวเกินไป',
                text: 'กรุณาใส่ชื่อแชทที่ไม่เกิน 50 ตัวอักษร',
                confirmButtonColor: '#dc2626'
            });
            return;
        } else if (newTitle.length < 3) {
            Swal.fire({
                icon: 'warning',
                title: 'ชื่อแชทสั้นเกินไป',
                text: 'กรุณาใส่ชื่อแชทที่มีความยาวอย่างน้อย 3 ตัวอักษร',
                confirmButtonColor: '#dc2626'
            });
            return;
        } else if (/[^a-zA-Z0-9ก-๙\s]/.test(newTitle)) {
            Swal.fire({
                icon: 'warning',
                title: 'ชื่อแชทไม่ถูกต้อง',
                text: 'กรุณาใช้เฉพาะตัวอักษรภาษาอังกฤษ, ตัวเลข, และตัวอักษรไทยเท่านั้น',
                confirmButtonColor: '#dc2626'
            });
            return;
        } else {
            try {
                const response = await chatAPI.renameChat(chatId, newTitle);
                if (response.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'แชทถูกเปลี่ยนชื่อแล้ว',
                        text: 'ชื่อแชทของคุณถูกเปลี่ยนเรียบร้อยแล้ว',
                        confirmButtonColor: '#10b981'
                    });
                    // Refresh chat list
                    const updatedChatList = await fetchChatList();
                    setChatList(updatedChatList);
                    setCurrentChat(updatedChatList.find(chat => chat.id === chatId));
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'ไม่สามารถเปลี่ยนชื่อแชทได้',
                        text: response.error || 'เกิดข้อผิดพลาดในการเปลี่ยนชื่อแชท',
                        confirmButtonColor: '#dc2626'
                    });
                }
            } catch (error) {
                console.error('Error renaming chat:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'ไม่สามารถเปลี่ยนชื่อแชทได้',
                    text: 'เกิดข้อผิดพลาดที่ไม่คาดคิดขณะเปลี่ยนชื่อแชท',
                    confirmButtonColor: '#dc2626'
                });
            }
        }
    }

    // Function to fetch user profile and update state
    useEffect(() => {
        getProfile()
            .then(profile => {
                if (profile) {
                    setUserData({
                        userId: profile.id,
                        username: profile.username,
                        email: profile.email,
                        isAuthenticated: true,
                        isLoading: false
                    });
                } else {
                    setUserData(prev => ({ ...prev, isLoading: false }));
                }
            })
            .catch(error => {
                console.error('Error fetching user profile:', error);
                setUserData(prev => ({ ...prev, isLoading: false }));
            });
    }, [])

    // if newChat = true, clear currentChat
    useEffect(() => {
        if (newChat) {
            setChatHistory([]);
            setCurrentChat(null);
        }
    }, [newChat]);

    // Fetch chat list when user data is ready
    useEffect(() => {
        if (userData.isAuthenticated && !userData.isLoading) {
            fetchChatList();
        }
    }, [userData.isAuthenticated, userData.userId]);

    // Fetch chat history when current chat is selected
    useEffect(() => {
        fetchChatHistory();
    }, [currentChat]);

    if (userData.isLoading) {
        return <div>Loading...</div>;
    }
    // Handle loading status explicitly
    return (
        <UserContext.Provider value={{
            userData,
            setUserData,
            handleLogout
        }}>
            <ChatContext.Provider value={{
                newChat,
                setNewChat,
                chatList,
                setChatList,
                currentChat,
                setCurrentChat,
                chatHistory,
                setChatHistory,
                fetchChatList,
                fetchChatHistory,
                handleChatDelete,
                handleChatRename,
            }}>
                <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-gray-100">
                    {/* Sidebar */}
                    <div className="lg:flex-shrink-0">
                        <SideBar onChatSelect={handleChatSelect} />
                    </div>

                    {/* Main content area */}
                    <div className="flex flex-col flex-1 min-w-0">
                        {/* Navbar */}
                        <NavBar />
                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">
                            <ChatRoomPage />
                        </div>
                    </div>
                </div>
            </ChatContext.Provider>
        </UserContext.Provider>
    );
}