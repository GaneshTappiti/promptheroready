
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Sparkles } from "lucide-react";

interface WikiAiAssistantProps {
  onClose: () => void;
}

const WikiAiAssistant: React.FC<WikiAiAssistantProps> = ({ onClose }) => {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { 
      role: "assistant", 
      content: "Hello! I'm your wiki assistant. How can I help you organize your startup knowledge today?" 
    }
  ]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Add user message
    setConversation([...conversation, { role: "user", content: message }]);
    
    // Simulate AI response
    setTimeout(() => {
      setConversation(prev => [
        ...prev,
        { 
          role: "assistant", 
          content: `I can help you with that! Here are some suggestions for "${message}".` 
        }
      ]);
    }, 1000);
    
    setMessage("");
  };

  return (
    <div className="fixed bottom-24 right-8 w-80 sm:w-96 bg-card border rounded-lg shadow-lg overflow-hidden z-50 animate-scale-in">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h3 className="font-medium">Wiki Assistant</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="h-80 overflow-y-auto p-4 space-y-4" id="chat-messages">
        {conversation.map((msg, index) => (
          <div 
            key={index} 
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === "user" 
                  ? "bg-primary text-primary-foreground ml-auto" 
                  : "bg-muted"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2">
        <Input
          placeholder="Ask about your wiki..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
};

export default WikiAiAssistant;
