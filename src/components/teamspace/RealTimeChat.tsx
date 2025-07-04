import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Send, 
  Users, 
  ChevronDown, 
  Shield, 
  ShieldCheck,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getCountryCode, 
  generateRandomUsername, 
  getCountryFlag, 
  formatTimestamp,
  isValidMessage,
  sanitizeMessage,
  truncateText
} from "@/utils/chatUtils";

interface Message {
  id: number;
  username: string;
  text: string;
  country: string;
  is_authenticated: boolean;
  timestamp: string;
}

interface RealTimeChatProps {
  teamId?: string; // Optional for global chat
}

const RealTimeChat = ({ teamId }: RealTimeChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [isOnBottom, setIsOnBottom] = useState(true);
  const [unviewedMessageCount, setUnviewedMessageCount] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(false);

  const { toast } = useToast();
  const { user, session } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  // Initialize user and country
  useEffect(() => {
    const initializeUser = async () => {
      try {
        let userUsername;
        if (session && user) {
          userUsername = user.user_metadata?.user_name || user.email?.split('@')[0] || generateRandomUsername();
        } else {
          userUsername = localStorage.getItem('chat_username') || generateRandomUsername();
        }
        
        setUsername(userUsername);
        localStorage.setItem('chat_username', userUsername);

        const country = await getCountryCode();
        setCountryCode(country);
      } catch (error) {
        console.error('Error initializing user:', error);
        setUsername(generateRandomUsername());
        setCountryCode('US');
      }
    };

    initializeUser();
  }, [session, user]);

  // Fetch initial messages and subscribe to real-time updates
  useEffect(() => {
    if (!username) return;

    const getInitialMessages = async () => {
      try {
        setError("");
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .range(0, 49)
          .order('id', { ascending: false });

        if (error) throw error;

        setMessages(data || []);
        setIsInitialLoad(true);
        setIsLoading(false);
      } catch (error: unknown) {
        console.error('Error fetching messages:', error);
        setError((error as Error).message);
        setIsLoading(false);
      }
    };

    const subscribeToMessages = () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      channelRef.current = supabase
        .channel('custom-all-channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages'
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setMessages(prev => [payload.new as Message, ...prev]);
              
              // Handle unviewed message count
              if (payload.new.username !== username) {
                setUnviewedMessageCount(prev => prev + 1);
              } else {
                scrollToBottom();
              }
            }
          }
        )
        .subscribe();
    };

    getInitialMessages();
    subscribeToMessages();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [username]);

  // Auto-scroll to bottom on initial load
  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(false);
      scrollToBottom();
    }
  }, [messages, isInitialLoad]);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 1;
    
    setIsOnBottom(isAtBottom);
    
    if (isAtBottom) {
      setUnviewedMessageCount(0);
    }

    // Load more messages when reaching top
    if (scrollTop === 0 && messages.length > 0) {
      loadMoreMessages();
    }
  }, [messages.length]);

  const loadMoreMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .range(messages.length, messages.length + 49)
        .order('id', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setMessages(prev => [...prev, ...data]);
        // Maintain scroll position
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = 1;
        }
      }
    } catch (error: unknown) {
      console.error('Error loading more messages:', error);
      toast({
        title: "Error",
        description: "Failed to load more messages",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidMessage(newMessage) || isSending) return;

    const sanitizedMessage = sanitizeMessage(newMessage);
    setIsSending(true);
    setNewMessage("");

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          text: sanitizedMessage,
          username,
          country: countryCode,
          is_authenticated: session ? true : false
        }]);

      if (error) throw error;

    } catch (error: unknown) {
      console.error('Error sending message:', error);
      setNewMessage(sanitizedMessage); // Restore message on error
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const retryConnection = () => {
    setIsLoading(true);
    setError("");
    window.location.reload();
  };

  if (isLoading) {
    return (
      <Card className="workspace-card">
        <CardContent className="flex items-center justify-center h-96">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading chat...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="workspace-card">
        <CardContent className="flex flex-col items-center justify-center h-96 gap-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-center text-muted-foreground">{error}</p>
          <Button onClick={retryConnection} variant="outline">
            Try to reconnect
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="workspace-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Real-time Chat
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <Badge variant="secondary">{messages.length} messages</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <ScrollArea 
            className="h-96 pr-4" 
            ref={scrollAreaRef}
            onScrollCapture={handleScroll}
          >
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No messages yet 😞
              </div>
            ) : (
              <div className="space-y-3">
                {[...messages].reverse().map((message) => {
                  const isYou = message.username === username;
                  const flag = getCountryFlag(message.country);
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isYou ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isYou && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {message.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className={`max-w-[70%] ${isYou ? 'order-first' : ''}`}>
                        <div className={`rounded-lg p-3 ${
                          isYou 
                            ? 'bg-primary text-primary-foreground ml-auto' 
                            : 'bg-muted'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {message.username}
                            </span>
                            {message.is_authenticated && (
                              <ShieldCheck className="h-3 w-3 text-green-500" />
                            )}
                            {flag && (
                              <span className="text-xs" title={message.country}>
                                {flag}
                              </span>
                            )}
                          </div>
                          <p className="text-sm break-words">
                            {truncateText(message.text)}
                          </p>
                          <p className="text-xs opacity-70 mt-1">
                            {formatTimestamp(message.timestamp)}
                          </p>
                        </div>
                      </div>
                      
                      {isYou && (
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {message.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>
          
          {!isOnBottom && (
            <Button
              size="sm"
              className="absolute bottom-2 right-2 rounded-full h-8 w-8 p-0"
              onClick={scrollToBottom}
            >
              <ChevronDown className="h-4 w-4" />
              {unviewedMessageCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs"
                >
                  {unviewedMessageCount}
                </Badge>
              )}
            </Button>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            maxLength={500}
            disabled={isSending}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={!isValidMessage(newMessage) || isSending}
            size="icon"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        
        <p className="text-xs text-muted-foreground text-center">
          ⚠️ Warning: do not share any sensitive information, it's a public chat room 🙂
        </p>
      </CardContent>
    </Card>
  );
};

export default RealTimeChat;
