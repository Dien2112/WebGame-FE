import { Search, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { set } from "zod";

// Giả sử lấy được data người dùng từ API, sẽ chỉnh sửa vào thứ 3 sau.
const mockConversations = [
  {
    id: 1,
    name: "Team Liquid",
    avatar: null,
    status: "Online • In Lobby",
    messages: [
      {
        id: 1,
        sender: "them",
        text: "Hey! Are you guys ready for the practice match tonight?",
      },
      { id: 2, sender: "them", text: "We have the server set up." },
      { id: 3, sender: "me", text: "Yeah, we are just finishing up a review." },
      {
        id: 4,
        sender: "them",
        text: "Cool, Lobby code is 12345. See you there!",
      },
    ],
  },
  {
    id: 2,
    name: "FaZe Clan",
    avatar: null,
    status: "Offline",
    messages: [{ id: 1, sender: "them", text: "GGWP! That was close." }],
  },
];

export default function Messages() {
  //STATE
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messageInput, setMessageInput] = useState("");

  //REF
  const messagesEndRef = useRef(null);

  //EFFECTS: Giả sử gọi API thành công
  useEffect(() => {
    setConversations(mockConversations);
    setSelectedId(mockConversations[0].id);
  }, []);

  //EFFECTS: Cập nhật cuộc trò chuyện được chọn
  const selectedConversation = conversations.find((c) => c.id === selectedId);

  //HANDLERS
  const handleSendMessage = () => {
    if (messageInput.trim() === "" || !selectedConversation) return;
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedId
          ? {
              ...conv,
              messages: [
                ...conv.messages,
                {
                  id: conv.messages.length + 1,
                  sender: "me",
                  text: messageInput,
                },
              ],
            }
          : conv
      )
    );
    setMessageInput("");
  };

  //EFFECTS: Cuộn xuống tin nhắn mới nhất khi có tin nhắn mới
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedConversation?.messages]);

  return (
    <div className="flex h-[calc(100vh-9rem)] bg-background">
      {/* LEFT: Conversation list */}
      <div className="w-[320px] border-r flex flex-col">
        <div className="p-4">
          <Input
            placeholder="Search players or teams..."
            className="rounded-lg"
            startIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 px-2">
          {conversations.map((c) => (
            <Card
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`p-3 cursor-pointer transition ${
                c.id === selectedId
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={c.avatar || undefined} />
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {c.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-sm">{c.name}</p>
                    <span className="text-xs opacity-70">{c.time}</span>
                  </div>
                  <p className="text-xs opacity-80 truncate">
                    {c.messages[c.messages.length - 1]?.sender === "me" && "You: "}
                    {c.messages[c.messages.length - 1]?.text}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* RIGHT: Chat window */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat header */}
            <div className="h-16 border-b flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedConversation.avatar || undefined} />
                  <AvatarFallback>
                    {selectedConversation.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selectedConversation.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation.status}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedConversation.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.sender === "me" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[60%] rounded-2xl px-4 py-2 text-sm ${
                      m.sender === "me"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t flex items-center gap-3">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button size="icon" onClick={handleSendMessage}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation to start chatting.
          </div>
        )}
      </div>
    </div>
  );
}
