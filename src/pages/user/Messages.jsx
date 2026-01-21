import { Search, Send, ChevronLeft, ChevronRight, } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "../../context/AuthContext"; // Assuming path based on Friends.jsx location

export default function Messages() {
  //STATE
  const { token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  //REF
  const messagesEndRef = useRef(null);
  const PAGE_SIZE = 6;

  //EFFECTS: Fetch data from API
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const endpoint = searchQuery 
          ? `/api/messages?q=${encodeURIComponent(searchQuery)}`
          : "/api/messages";
        
        const data = await api.get(endpoint);
        const dataArray = Array.isArray(data) ? data : [];

        const formatted = dataArray.map((c) => ({
          id: c.id,
          name: c.name,
          avatar: c.avatar,
          status: c.status ? "Online" : "Offline", // API returns boolean
          messages: (c.messages || []).map((m) => ({
            id: m.id,
            sender: m.is_sender ? "me" : "them",
            text: m.content,
            created_at: m.created_at,
          })),
        }));

        setConversations(formatted);
        if (formatted.length > 0 && !selectedId) {
          setSelectedId(formatted[0].id);
        }
        
        // Set lastSyncAt from the newest message across all conversations
        const allMessages = formatted.flatMap((c) => c.messages);
        if (allMessages.length > 0) {
          const newest = allMessages.reduce((a, b) =>
            new Date(a.created_at) > new Date(b.created_at) ? a : b,
          );
          setLastSyncAt(newest.created_at);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();
  }, [token, searchQuery]);

  useEffect(() => {
    // Don't sync when searching - only sync in normal message view
    if (searchQuery) return;
    
    const interval = setInterval(async () => {
      try {
        const res = await api.get("/api/messages/sync", {
          params: { since: lastSyncAt ?? "1970-01-01T00:00:00.000Z" },
        });

        const messages = res;

        if (!messages || messages.length === 0) return;

        setConversations((prev) => {
          const updated = [...prev];

          messages.forEach((msg) => {
            console.log("Processing message:", {
              id: msg.id,
              sender_id: msg.sender_id,
              receiver_id: msg.receiver_id,
              token_userId: token.userId,
              content: msg.content,
            });

            if (msg.sender_id === token.userId) return; // Skip messages sent by self

            const partnerId =
              msg.sender_id === token.userId ? msg.receiver_id : msg.sender_id;

            let conv = updated.find((c) => c.id === partnerId);

            if (!conv) {
              console.log("Creating new conversation for partner:", partnerId);
              return; // For now, skip messages from unknown conversations
            }

            // Prevent duplicate: check ID strict hơn
            const exists = conv.messages.some((m) => m.id === msg.id);
            if (exists) {
              return;
            }

            // unshift vì backend truyền DESC (mới → cũ)
            conv.messages.unshift({
              id: msg.id,
              sender: msg.sender_id === token.userId ? "me" : "them",
              text: msg.content,
              created_at: msg.created_at,
            });
          });

          return updated;
        });

        setLastSyncAt(messages[messages.length - 1].created_at);
      } catch (e) {
        console.error("Sync failed", e);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [token.userId, searchQuery, lastSyncAt]);

  //EFFECTS: Cập nhật cuộc trò chuyện được chọn
  const selectedConversation = conversations.find((c) => c.id === selectedId);

  //HANDLERS
  const handleSendMessage = async () => {
    if (messageInput.trim() === "" || !selectedConversation) return;

    const tempMessage = {
      id: Date.now(),
      sender: "me",
      text: messageInput,
      created_at: new Date().toISOString(),
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedId
          ? {
            ...conv,
            messages: [tempMessage, ...conv.messages],
          }
          : conv,
      ),
    );
    setMessageInput("");
    
    // Clear search when sending a message (to re-enable sync)
    if (searchQuery) {
      setSearchQuery("");
    }
    
    // Cập nhật lastSyncAt để prevent duplicate khi sync
    setLastSyncAt(new Date().toISOString());
    try {
      await api.post("/api/messages", {
        userId: selectedId,
        text: tempMessage.text,
      });
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  //EFFECTS: Cuộn xuống tin nhắn mới nhất khi có tin nhắn mới
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedConversation?.messages.length]);
  const orderedMessages = selectedConversation
    ? [...selectedConversation.messages].reverse()
    : [];

  const totalPages = Math.ceil(conversations.length / PAGE_SIZE);
  const paginatedConv = conversations.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  useEffect(() => {
    const newTotalPages = Math.ceil(conversations.length / PAGE_SIZE) || 1;

    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
  }, [conversations.length]);


  return (
    <div className="flex h-[calc(100vh-9rem)] bg-background">
      {/* LEFT: Conversation list */}
      <div className="w-[320px] border-r flex flex-col">
        <div className="p-4">
          <Input
            placeholder="Search players or teams..."
            className="rounded-lg"
            startIcon={<Search className="w-4 h-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 px-2">
          {paginatedConv.map((c) => (
            <Card
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`p-3 cursor-pointer transition ${c.id === selectedId
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
                }`}
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={c.avatar || undefined} />
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {c.name ? c.name[0] : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-sm">{c.name}</p>
                    <span className="text-xs opacity-70">
                      {/* Time logic if available, else blank */}
                    </span>
                  </div>
                  <p className="text-xs opacity-80 truncate">
                    {c.messages.length > 0 ? (
                      <>
                        {c.messages[0]?.sender === "me" && "You: "}
                        {c.messages[0]?.text}
                      </>
                    ) : (
                      <span className="italic">No messages yet</span>
                    )}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="h-12 border-t flex items-center justify-between px-4 text-sm">
          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Prev
          </Button>

          <span className="opacity-70">
            {currentPage} / {totalPages || 1}
          </span>

          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
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
                    {selectedConversation.name
                      ? selectedConversation.name[0]
                      : "?"}
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
              {orderedMessages.length > 0 ? (
                orderedMessages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.sender === "me" ? "justify-end" : "justify-start"
                      }`}
                  >
                    <div
                      className={`max-w-[60%] rounded-2xl px-4 py-2 text-sm ${m.sender === "me"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                        }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No messages yet. Start a conversation!
                </div>
              )}
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