import { useState, useEffect } from "react";
import { Send, Trash2, X } from "lucide-react";
import axiosClient from "../config/axiosClient";
import { getUser, getUserRole } from "../service/authService";
import DOMPurify from "dompurify";
import { supabase } from "../config/Supabase";

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
    const markdownRegex = /```(?:html)?\n([\s\S]*?)```/gm;
    const match = markdownRegex.exec(text);
    return match ? match[1].trim() : text.trim();
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newUserMessage = { text: input, isUser: true, isApiResponse: false };
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);
    setLoading(true);
    setError(null);

    try {
      const chatHistory = messages.map((msg) => ({
        role: msg.isUser ? "user" : "model",
        parts: [{ text: msg.text }],
      }));

      // 👉 Lấy token từ supabase
      const { data } = await supabase.auth.getSession();
      const token = data?.session?.access_token;

      const response = await axiosClient.post("/ai-response", {
        current_user_role: currentUserRole,
        chat_history: chatHistory,
        new_message: input,
        student_info: currentUserRole === "student" ? currentUser : null,
        parent_info: currentUserRole === "parent" ? currentUser : null,
        token: token, // ✅ truyền token ở đây nếu backend cần trong body
      });

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

      setMessages((prev) => [...prev, ...newMessagesToAdd]);
    } catch (err) {
      setError("Không thể nhận phản hồi từ AI. Vui lòng thử lại!");
      console.error(err);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem("aiMessages");
  };

  return (
    <>
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes bounce {
          0%,
          20%,
          53%,
          80%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          40%,
          43% {
            transform: translate3d(0, -8px, 0);
          }
          70% {
            transform: translate3d(0, -4px, 0);
          }
          90% {
            transform: translate3d(0, -2px, 0);
          }
        }

        .bounce-animation {
          animation: bounce 2s infinite;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .slide-up {
          animation: slideUp 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .fade-in {
          animation: fadeIn 0.2s ease-in;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }

        .pulse-animation {
          animation: pulse 1s ease-in-out infinite;
        }

        .message-enter {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>

      <div className="fixed bottom-6 right-6 z-50">
        {/* Chat Toggle Button with Bounce Animation */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="bounce-animation bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:shadow-blue-200 hover:scale-110 cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-200"
          >
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </button>
        )}

        {/* Chat Window */}
        {isOpen && (
          <div className="slide-up bg-white w-96 md:w-[480px] h-[620px] rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-blue-500 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full pulse-animation"></div>
                <h3 className="font-semibold text-lg">SchoolMedix AI</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={clearHistory}
                  className="hover:bg-blue-400 bg-blue-600 p-2.5 cursor-pointer rounded-xl transition-all duration-200 text-sm font-medium hover:scale-105 flex items-center gap-1.5"
                  title="Xóa lịch sử chat"
                >
                  <Trash2 size={16} />
                  <span className="hidden sm:inline">Xóa</span>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-blue-400 cursor-pointer p-2.5 rounded-xl transition-all duration-200 hover:scale-105"
                  title="Đóng chat"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 p-5 overflow-y-auto bg-gray-50">
              {messages.length === 0 && !loading && !error && (
                <div className="fade-in text-center py-12">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-lg font-medium">
                    Chào bạn! 👋
                  </p>
                  <p className="text-gray-500 mt-1">
                    Hỏi tôi bất cứ điều gì về sức khỏe học đường
                  </p>
                </div>
              )}

              {loading && (
                <div className="fade-in text-center py-8">
                  <div className="inline-flex items-center gap-2 bg-white px-4 py-3 rounded-2xl shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                    <span className="text-gray-600 text-sm">
                      Đang suy nghĩ...
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <div className="fade-in text-center py-4">
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl">
                    {error}
                  </div>
                </div>
              )}

              {messages
                .filter((message) => !message.isApiResponse)
                .map((message, index) => (
                  <div
                    key={index}
                    className={`message-enter mb-4 ${
                      message.isUser ? "text-right" : "text-left"
                    }`}
                  >
                    <div
                      className={`inline-block max-w-[85%] p-4 rounded-2xl ${
                        message.isUser
                          ? "bg-blue-500 text-white shadow-lg"
                          : "bg-white text-gray-800 shadow-md border border-gray-100"
                      }`}
                    >
                      {message.isUser ? (
                        <p className="text-sm leading-relaxed">
                          {message.text}
                        </p>
                      ) : (
                        <div
                          className="prose prose-sm max-w-none text-sm leading-relaxed"
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

            {/* Input Section */}
            <div className="p-5 bg-white border-t border-gray-100">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Nhập câu hỏi của bạn..."
                  className="flex-1 p-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                  disabled={loading}
                />
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  disabled={loading || !input.trim()}
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AIChat;
