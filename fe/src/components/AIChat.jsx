import { useState, useEffect } from "react";
import { Send, X } from "lucide-react";
import axiosClient from "../config/axiosClient";
import { getUser, getUserRole } from "../service/authService";
import DOMPurify from "dompurify";

const AIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  // Load messages from localStorage when the component mounts
  useEffect(() => {
    try {
      const role = getUserRole();
      const user = getUser();

      setCurrentUserRole(role);
      setCurrentUser(user);

      const savedMessages = localStorage.getItem("aiMessages");
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    } catch (err) {
      setError("Không thể tải thông tin người dùng. Vui lòng thử lại!");
      console.error(err);
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("aiMessages", JSON.stringify(messages.slice(-50)));
    }
  }, [messages]);

  // Function to strip markdown code block markers
  const stripMarkdownCodeBlock = (text) => {
    const markdownRegex = /^```html\n([\s\S]*?)\n```$/;
    const match = text.match(markdownRegex);
    return match ? match[1].trim() : text.trim();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const newUserMessage = { text: input, isUser: true, isApiResponse: false };
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setLoading(true);
    setError(null);

    try {
      // Format chat history for backend
      const chatHistory = messages.map((msg) => ({
        role: msg.isUser ? "user" : "model",
        parts: [{ text: msg.text }],
      }));

      // Call backend /ai-response endpoint
      const response = await axiosClient.post("/ai-response", {
        current_user_role: currentUserRole,
        chat_history: chatHistory,
        new_message: input,
        student_info: currentUserRole === "student" ? currentUser : null,
        parent_info: currentUserRole === "parent" ? currentUser : null,
      });

      // Extract and process all responses from new_contents
      const newMessagesToAdd = response.data.new_contents
        .filter((content) => content.role === "model")
        .flatMap((content) =>
          content.parts.map((part) => ({
            text: part.text,
            isUser: false,
            isApiResponse: part.text.startsWith("API_RESPONSE:"),
          }))
        )
        .filter((msg) => msg.text.trim());

      if (newMessagesToAdd.length === 0) {
        throw new Error("No valid AI response received");
      }

      // Add all responses to messages
      setMessages((prev) => [...prev, ...newMessagesToAdd]);
    } catch (err) {
      setError("Không thể nhận phản hồi từ AI. Vui lòng thử lại!");
      console.error(err);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors duration-200"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white w-96 md:w-[480px] h-[600px] rounded-2xl shadow-xl flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <h3 className="font-semibold">SchoolMedix AI</h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setMessages([]);
                  localStorage.removeItem("aiMessages");
                }}
                className="hover:bg-blue-700 p-1 rounded-full transition-colors duration-200 text-sm"
              >
                Xóa Lịch Sử
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-blue-700 p-1 rounded-full transition-colors duration-200"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.length === 0 && !loading && !error && (
              <p className="text-gray-500 text-center">
                Hỏi tôi bất cứ điều gì về sức khỏe học đường!
              </p>
            )}
            {loading && (
              <p className="text-gray-500 text-center">Đang xử lý...</p>
            )}
            {error && <p className="text-red-500 text-center">{error}</p>}
            {messages
              .filter((message) => !message.isApiResponse)
              .map((message, index) => (
                <div
                  key={index}
                  className={`mb-3 ${
                    message.isUser ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg ${
                      message.isUser
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800 prose prose-sm max-w-none"
                    }`}
                  >
                    {message.isUser ? (
                      message.text
                    ) : (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(
                            stripMarkdownCodeBlock(message.text)
                          ),
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg disabled:opacity-50"
                disabled={loading}
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChat;
