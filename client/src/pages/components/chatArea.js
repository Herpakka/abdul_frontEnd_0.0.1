export default function ChatArea() {
    return (
        <>
            <div class="chat-area" id="chatArea">
                <div class="welcome-message">
                    <h2>Welcome to ABDUL Chatbot</h2>
                    <p>
                        Start a conversation by typing a message below or upload a file
                    </p>
                </div>
            </div>

            <div class="typing-indicator" id="typingIndicator">
                <span>ABDUL is typing</span>
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        </>
    )
}