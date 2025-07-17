import React, { useState } from "react";

import ChatInput from "../../components/chatinput"

export default function ChatRoomPage() {
    const [fileData, setFileData] = useState(null);
    const [fileView, setFileView] = useState(false);
    return (
        <div className="flex flex-col justify-between h-full bg-gray-50">
            <div className="flex grow flex-row">
                <div className="flex grow flex-row border-2 border-red-600">
                    <div className="flex grow flex-col p-6 border-2 border-green-600">
                        <h1 className="text-2xl font-bold mb-4">Chat Room
                        </h1>
                        <p className="text-gray-700">Welcome to the chat room! Here you can discuss topics with others.</p>
                        <button onClick={() => setFileView(!fileView)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                            {fileView ? "Hide File View" : "Show File View"}
                        </button>
                    </div>
                    {fileView && (
                        <div className="border-2 border-green-600">
                            <h2>File View</h2>
                            <p>Here you can view files related to the chat.</p>
                            {fileData && (
                                <div className="border rounded-lg overflow-hidden shadow">
                                    <div className="bg-gray-100 px-4 py-2 text-sm font-medium">
                                        {fileData.name}/ {fileData.size}/ {fileData.size64}
                                    </div>
                                    <iframe
                                        title={fileData.name}
                                        src={fileData.dataUri}
                                        className="w-full h-96"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <ChatInput fileData={fileData} setFileData={setFileData} />
        </div>
    )
}