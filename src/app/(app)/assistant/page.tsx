"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Send, Bot, User, Menu, FileText, Search, MessageSquare, PanelRightClose, PanelRightOpen 
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

const API_BASE = "http://localhost:8000/api/v1";

const suggestedQuestions = [
  "Show groundwater depletion rates in Coimbatore.",
  "Which districts have the highest contamination risk?",
  "What is the stage of extraction in Bengaluru Urban?",
  "Is Pune considered safe for groundwater extraction?"
];

export default function AssistantPage() {
  const { isAuthenticated, currentUser } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [citations, setCitations] = useState<any[]>([]);
  
  const [input, setInput] = useState("");
  const [showCitations, setShowCitations] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const getHeaders = () => {
    const token = localStorage.getItem("accessToken");
    return token ? { "Authorization": `Bearer ${token}` } : {};
  };

  const loadConversations = async () => {
    if (!isAuthenticated) {
      setConversations([]);
      createNewConversation();
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/chat/conversations`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        if (data.length > 0) {
          loadSingleConversation(data[0]._id || data[0].id);
        } else {
          createNewConversation();
        }
      }
    } catch (error) {
      console.error("Failed to load conversations", error);
      setMessages([{ role: "assistant", content: "Hello! Backend is not reachable." }]);
    }
  };

  const createNewConversation = async () => {
    try {
      const hdrs: any = { "Content-Type": "application/json", ...getHeaders() };
      const res = await fetch(`${API_BASE}/chat/conversations`, {
        method: "POST",
        headers: hdrs,
        body: JSON.stringify({ title: "New Chat" })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentConvId(data.id);
        setMessages([{ role: "assistant", content: "Hello! I am Ingres Copilot. How can I assist you with groundwater intelligence today?" }]);
        setCitations([]);
        if (isAuthenticated) {
          loadConversations(); // refresh list
        }
      }
    } catch (error) {
      console.error("Failed to create conversation", error);
    }
  };

  const loadSingleConversation = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/chat/conversations/${id}`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setCurrentConvId(data._id || data.id);
        setMessages(data.messages.length > 0 ? data.messages : [{ role: "assistant", content: "Hello! How can I assist you?" }]);
        
        // Load citations from the last assistant message if available
        const lastMsg = [...data.messages].reverse().find(m => m.role === "assistant" && m.citations && m.citations.length > 0);
        setCitations(lastMsg ? lastMsg.citations : []);
      }
    } catch (error) {
      console.error("Failed to load conversation", error);
    }
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || !currentConvId) return;
    
    // Add user message to UI immediately
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInput("");
    setIsTyping(true);
    setCitations([]); // clear citations for new request
    
    try {
      const hdrs: any = { "Content-Type": "application/json", ...getHeaders() };
      const res = await fetch(`${API_BASE}/chat/conversations/${currentConvId}/messages`, {
        method: "POST",
        headers: hdrs,
        body: JSON.stringify({ conversationId: currentConvId, content: text })
      });

      if (!res.ok) throw new Error("Failed to send message");
      if (!res.body) throw new Error("No response body");

      // Add a placeholder assistant message to stream into
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);
      setIsTyping(false);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunkString = decoder.decode(value);
          const lines = chunkString.split("\n\n");
          
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "").trim();
              if (dataStr === "[DONE]") break;
              
              try {
                const data = JSON.parse(dataStr);
                if (data.type === "metadata") {
                  setCitations(data.citations || []);
                } else if (data.type === "chunk") {
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const last = newMessages[newMessages.length - 1];
                    if (last.role === "assistant") {
                      last.content += data.text;
                    }
                    return newMessages;
                  });
                }
              } catch (e) {
                console.error("Error parsing SSE JSON:", e, dataStr);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "An error occurred while connecting to the LLM backend." }]);
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] pt-2">
      {/* Left Sidebar (History) */}
      <div className="hidden md:flex w-64 flex-col border-r border-border/40 bg-background/50">
        <div className="p-4 border-b border-border/40 flex items-center justify-between">
          <span className="font-semibold text-sm">Chat History</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={createNewConversation}>
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1 p-2">
          {conversations.map((conv, i) => (
            <Button 
              key={i} 
              variant="ghost" 
              onClick={() => loadSingleConversation(conv._id || conv.id)}
              className={`w-full justify-start font-normal text-sm mb-1 ${
                currentConvId === (conv._id || conv.id) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageSquare className="mr-2 h-4 w-4 shrink-0" />
              <span className="truncate">{conv.title || "Chat"}</span>
            </Button>
          ))}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
        
        <div className="flex items-center justify-between p-4 border-b border-border/40 z-10 bg-background/50 backdrop-blur-md">
          <h2 className="font-semibold flex items-center gap-2">
            <Bot className="text-primary w-5 h-5" /> Ingres Copilot
          </h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowCitations(!showCitations)}
            className="hidden lg:flex"
            title="Toggle Citations"
          >
            {showCitations ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4 z-10" ref={scrollRef}>
          <div className="max-w-3xl mx-auto space-y-6 pb-20">
            {messages.map((m, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={i} 
                className={`flex gap-4 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <Avatar className="w-8 h-8 border border-primary/20 bg-primary/10">
                    <Bot className="w-5 h-5 m-auto text-primary" />
                  </Avatar>
                )}
                <div className={`p-4 rounded-2xl max-w-[80%] ${
                  m.role === "user" 
                    ? "bg-primary text-primary-foreground rounded-tr-sm" 
                    : "glass-card border-border/50 rounded-tl-sm text-foreground"
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                </div>
                {m.role === "user" && (
                  <Avatar className="w-8 h-8 border border-border/50">
                    <User className="w-5 h-5 m-auto text-muted-foreground" />
                  </Avatar>
                )}
              </motion.div>
            ))}
            {isTyping && (
              <div className="flex gap-4 justify-start">
                <Avatar className="w-8 h-8 border border-primary/20 bg-primary/10">
                  <Bot className="w-5 h-5 m-auto text-primary" />
                </Avatar>
                <div className="p-4 rounded-2xl glass-card rounded-tl-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 z-10 bg-background/50 backdrop-blur-md border-t border-border/40">
          <div className="max-w-3xl mx-auto">
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {suggestedQuestions.map((q, i) => (
                  <Button 
                    key={i} 
                    variant="outline" 
                    size="sm" 
                    className="text-xs bg-background/50 border-border/50 hover:border-primary/50"
                    onClick={() => handleSend(q)}
                  >
                    {q}
                  </Button>
                ))}
              </div>
            )}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
              className="relative flex items-center"
            >
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about groundwater data..."
                className="pr-12 py-6 rounded-xl glass-card border-border/50 focus-visible:ring-primary/30"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!input.trim() || isTyping || !currentConvId}
                className="absolute right-2 h-8 w-8 rounded-lg bg-primary hover:bg-primary/90 transition-transform hover:scale-105 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
            <p className="text-center text-[10px] text-muted-foreground mt-2">
              Ingres Copilot can make mistakes. Verify critical groundwater intelligence.
            </p>
          </div>
        </div>
      </div>

      {/* Right Sidebar (Citations) */}
      {showCitations && (
        <motion.div 
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          className="hidden lg:flex flex-col border-l border-border/40 bg-background/30 backdrop-blur-xl z-20"
        >
          <div className="p-4 border-b border-border/40">
            <h3 className="font-semibold flex items-center gap-2 text-sm">
              <Search className="w-4 h-4 text-primary" /> Citations & Sources
            </h3>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {citations.length === 0 ? (
                <div className="text-center p-4 opacity-50">
                  <Search className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">No citations for the current response.</p>
                </div>
              ) : (
                citations.map((cit, i) => (
                  <Card key={i} className="bg-background/40 border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
                    <CardHeader className="p-3 pb-0">
                      <CardTitle className="text-sm flex items-start gap-2 leading-tight">
                        <FileText className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                        {cit.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-2">
                      <div className="text-xs text-muted-foreground break-all">Source: {cit.source}</div>
                      {cit.page && (
                        <div className="mt-2 text-[10px] text-primary bg-primary/10 inline-block px-2 py-0.5 rounded">
                          Page {cit.page}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </motion.div>
      )}
    </div>
  );
}
