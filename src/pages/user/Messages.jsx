import { Search, Send, Moon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

export default function Messages() {
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
          {[
            { name: "Team Liquid", msg: "Ready for the scrim?", time: "Now", active: true },
            { name: "FaZe Clan", msg: "GGWP! That was close.", time: "2h" },
            { name: "G2 Esports", msg: "Can we reschedule?", time: "1d" },
            { name: "Cloud9", msg: "Check out the new roster update.", time: "3d" },
          ].map((c, i) => (
            <Card
              key={i}
              className={`p-3 cursor-pointer transition ${c.active ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              <div className="flex items-center gap-3">
                <Avatar className="bg-muted text-muted-foreground">
                  <AvatarFallback>{c.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-sm">{c.name}</p>
                    <span className="text-xs opacity-70">{c.time}</span>
                  </div>
                  <p className="text-xs opacity-80 truncate">{c.msg}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* RIGHT: Chat window */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="h-16 border-b flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>T</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">Team Liquid</p>
              <p className="text-xs text-muted-foreground">Online • In Lobby</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex justify-start">
            <div className="max-w-[60%] bg-muted rounded-2xl px-4 py-2 text-sm">
              Hey! Are you guys ready for the practice match tonight?
            </div>
          </div>

          <div className="flex justify-start">
            <div className="max-w-[60%] bg-muted rounded-2xl px-4 py-2 text-sm">
              We have the server set up.
            </div>
          </div>

          <div className="flex justify-end">
            <div className="max-w-[60%] bg-primary text-primary-foreground rounded-2xl px-4 py-2 text-sm">
              Yeah, we are just finishing up a review.
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t flex items-center gap-3">
          <Input placeholder="Type your message..." className="flex-1" />
          <Button size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
