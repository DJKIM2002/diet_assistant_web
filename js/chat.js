// 메시지 전송 함수
async function sendMessage() {
    const userMessageInput = document.getElementById("userMessage");
    const message = userMessageInput.value.trim();

    if (!message) return;

    const email = localStorage.getItem("email"); // 로그인한 사용자 이메일 확인
    if (!email) {
        alert("로그인이 필요합니다.");
        return;
    }

    addMessageToChat("user", message);
    userMessageInput.value = "";

    try {
        // AI 응답 가져오기
        const response = await fetch("http://210.117.212.105:3000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message }),
        });

        if (!response.ok) throw new Error("응답 실패");

        const data = await response.json();
        const assistantResponse = data.response;

        addMessageToChat("assistant", assistantResponse);

        // 채팅 기록 저장
        await saveChatHistory(email, message, assistantResponse);
    } catch (error) {
        console.error("Error:", error);
        addMessageToChat("assistant", "에러가 발생했습니다. 다시 시도해 주세요.");
    }
}

// 채팅 기록 저장 함수
async function saveChatHistory(email, userMessage, assistantMessage) {
    try {
        const response = await fetch("http://210.117.212.105:3001/chat_history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email,
                userMessage,
                assistantMessage,
            }),
        });

        if (!response.ok) throw new Error("채팅 기록 저장 실패");

        const data = await response.json();
        if (!data.success) {
            console.error("채팅 기록 저장 실패:", data.message);
        }
    } catch (error) {
        console.error("채팅 기록 저장 중 에러:", error);
    }
}

function addMessageToChat(sender, message) {
    const chatMessages = document.getElementById("chatMessages");

    // 메시지 박스 생성
    const messageDiv = document.createElement("div");
    messageDiv.className = sender === "user" ? "user-message" : "assistant-message";

    // 메시지 텍스트 추가
    const messageText = document.createElement("p");
    messageText.innerText = message;
    messageDiv.appendChild(messageText);

    // 채팅 창에 메시지 추가
    chatMessages.appendChild(messageDiv);

    // 스크롤을 아래로 이동
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 엔터 키 입력 시 메시지 전송
document.getElementById("userMessage").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        sendMessage();
        event.preventDefault();
    }
});

// 전송 버튼 클릭 시 메시지 전송
document.getElementById("sendBtn").addEventListener("click", function () {
    sendMessage();
});
