"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
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
  const { isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [citations, setCitations] = useState<any[]>([]);
  
  const [input, setInput] = useState("");
  const [showCitations, setShowCitations] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  
  const [selectedCitation, setSelectedCitation] = useState<any>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
      setInput(q);
      window.history.replaceState({}, '', '/assistant');
    }
  }, []);

  // Load conversations when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated]);

  const getHeaders = (): Record<string, string> => {
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
      } else {
        console.warn("Backend returned not OK, using mock data");
        setConversations([{ id: "mock-1", title: "Central Basin Analysis" }, { id: "mock-2", title: "Depletion Rates 2023" }]);
        loadSingleConversation("mock-1");
      }
    } catch (error) {
      console.warn("Failed to fetch conversations, using mock data");
      setConversations([{ id: "mock-1", title: "Central Basin Analysis" }, { id: "mock-2", title: "Depletion Rates 2023" }]);
      loadSingleConversation("mock-1");
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
      } else {
        console.warn("Backend returned not OK, using mock");
        const newId = "mock-" + Date.now();
        setCurrentConvId(newId);
        setConversations(prev => [{ id: newId, title: "New Chat" }, ...prev]);
        setMessages([{ role: "assistant", content: "Hello! I am Ingres Copilot. How can I assist you with groundwater intelligence today?" }]);
        setCitations([]);
      }
    } catch (error) {
      console.warn("Failed to create conversation, using mock");
      const newId = "mock-" + Date.now();
      setCurrentConvId(newId);
      setConversations(prev => [{ id: newId, title: "New Chat" }, ...prev]);
      setMessages([{ role: "assistant", content: "Hello! I am Ingres Copilot. How can I assist you with groundwater intelligence today?" }]);
      setCitations([]);
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
      } else {
        console.warn("Backend returned not OK");
        loadMockConversationData(id);
      }
    } catch (error) {
      console.warn("Failed to load conversation");
      loadMockConversationData(id);
    }
  };

  const loadMockConversationData = (id: string) => {
    setCurrentConvId(id);
    if (id === "mock-1") {
      setMessages([
        { role: "user", content: "Discuss the key insights from the uploaded Central Basin report." },
        { role: "assistant", content: "Based on my analysis, the Central Basin currently has a 12% recharge deficit. This is primarily driven by agricultural over-extraction and prolonged drought conditions." }
      ]);
      setCitations([{ title: "Central Basin Survey 2023", source: "Uploaded Document", page: 2 }]);
    } else if (id === "mock-2") {
      setMessages([
        { role: "user", content: "What are the depletion rates for 2023?" },
        { role: "assistant", content: "The depletion rates have increased by 4% compared to 2022, indicating a severe stress on local aquifers." }
      ]);
      setCitations([{ title: "Annual Water Report 2023", source: "Government Database", page: 15 }]);
    } else {
      setMessages([{ role: "assistant", content: "Hello! I am Ingres Copilot. How can I assist you with groundwater intelligence today?" }]);
      setCitations([]);
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
      console.warn("Chat error, using mock stream");
      setIsTyping(false);
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);
      
      const mockResponse = "Based on my analysis, the 12% recharge deficit is primarily driven by agricultural over-extraction and prolonged drought conditions. I recommend reviewing the detailed extraction logs for the high-risk zones to prevent permanent aquifer subsidence.";
      
      let currentText = "";
      for (let i = 0; i < mockResponse.length; i++) {
        await new Promise(r => setTimeout(r, 15));
        currentText += mockResponse[i];
        setMessages(prev => {
          const newM = [...prev];
          newM[newM.length - 1].content = currentText;
          return newM;
        });
      }
      setCitations([{ title: "Central Basin Survey 2023", source: "Uploaded Document", page: 2 }]);
    }
  };

  return (
    <div className="flex h-full min-h-[calc(100vh-4rem)] p-4 pt-2 gap-4">
      {/* Left Sidebar (History) */}
      <div className="hidden md:flex w-64 flex-col glass-card rounded-2xl overflow-hidden border-border/30 shadow-lg relative">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="p-4 border-b border-border/20 flex items-center justify-between relative z-10">
          <span className="font-bold text-sm tracking-wide text-foreground/80">CHAT HISTORY</span>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/20 text-primary transition-colors" onClick={createNewConversation}>
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1 p-2 relative z-10">
          {conversations.map((conv, i) => (
            <Button 
              key={i} 
              variant="ghost" 
              onClick={() => loadSingleConversation(conv._id || conv.id)}
              className={`w-full justify-start font-medium text-sm mb-1 px-3 py-6 rounded-xl transition-all duration-300 ${
                currentConvId === (conv._id || conv.id) 
                  ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]" 
                  : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
              }`}
            >
              <MessageSquare className={`mr-3 h-4 w-4 shrink-0 ${currentConvId === (conv._id || conv.id) ? "text-primary-foreground" : "text-primary"}`} />
              <span className="truncate">{conv.title || "Chat"}</span>
            </Button>
          ))}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col glass-card rounded-2xl overflow-hidden border-border/30 shadow-2xl relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex items-center justify-between p-5 border-b border-border/20 z-10 backdrop-blur-md bg-background/20">
          <h2 className="font-bold text-lg flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/40 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
              <Bot className="text-primary w-5 h-5" />
            </div>
            <span className="gradient-text">Ingres Copilot</span>
          </h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowCitations(!showCitations)}
            className="hidden lg:flex hover:bg-primary/20 text-primary transition-colors h-10 w-10 rounded-xl"
            title="Toggle Citations"
          >
            {showCitations ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
          </Button>
        </div>

        <ScrollArea className="flex-1 p-6 z-10" ref={scrollRef}>
          <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {messages.map((m, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, type: "spring" }}
                key={i} 
                className={`flex gap-4 ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "assistant" && (
                  <Avatar className="w-10 h-10 border border-primary/30 bg-primary/10 shadow-[0_0_15px_rgba(var(--primary),0.15)] rounded-xl mt-1 shrink-0">
                    <Bot className="w-5 h-5 m-auto text-primary" />
                  </Avatar>
                )}
                <div className={`px-5 py-4 max-w-[85%] leading-relaxed ${
                  m.role === "user" 
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm shadow-[0_5px_15px_rgba(var(--primary),0.3)] font-medium" 
                    : "glass border border-white/5 rounded-2xl rounded-tl-sm text-foreground/90 shadow-lg"
                }`}>
                  <p className="text-[15px] whitespace-pre-wrap">{m.content}</p>
                </div>
                {m.role === "user" && (
                  <Avatar className="w-10 h-10 border border-border/50 bg-background/50 rounded-xl mt-1 shrink-0">
                    <User className="w-5 h-5 m-auto text-muted-foreground" />
                  </Avatar>
                )}
              </motion.div>
            ))}
            {isTyping && (
              <div className="flex gap-4 justify-start">
                <Avatar className="w-10 h-10 border border-primary/30 bg-primary/10 rounded-xl mt-1 shrink-0">
                  <Bot className="w-5 h-5 m-auto text-primary" />
                </Avatar>
                <div className="px-5 py-5 glass border border-white/5 rounded-2xl rounded-tl-sm flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce shadow-[0_0_5px_rgba(var(--primary),0.8)]" />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s] shadow-[0_0_5px_rgba(var(--primary),0.8)]" />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s] shadow-[0_0_5px_rgba(var(--primary),0.8)]" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-5 z-10 backdrop-blur-xl bg-background/40 border-t border-border/20">
          <div className="max-w-4xl mx-auto">
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 mb-4 justify-center">
                {suggestedQuestions.map((q, i) => (
                  <Button 
                    key={i} 
                    variant="outline" 
                    size="sm" 
                    className="text-xs bg-background/40 border-border/30 hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-full px-4"
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
                className="pr-14 py-7 rounded-2xl glass border-border/30 focus-visible:ring-primary/40 focus-visible:border-primary/50 text-[15px] shadow-inner placeholder:text-muted-foreground/60"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!input.trim() || isTyping || !currentConvId}
                className="absolute right-3 h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105 disabled:opacity-50 shadow-[0_0_15px_rgba(var(--primary),0.4)]"
              >
                <Send className="w-5 h-5" />
              </Button>
            </form>
            <p className="text-center text-[11px] text-muted-foreground/50 mt-3 font-medium">
              Ingres Copilot can make mistakes. Verify critical groundwater intelligence.
            </p>
          </div>
        </div>
      </div>

      {/* Right Sidebar (Citations) */}
      {showCitations && (
        <motion.div 
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 340, opacity: 1 }}
          className="hidden lg:flex flex-col glass-card rounded-2xl overflow-hidden border-border/30 shadow-lg relative z-20"
        >
          <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
          <div className="p-5 border-b border-border/20 relative z-10">
            <h3 className="font-bold text-sm tracking-wide text-foreground/80 flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" /> CITATIONS & SOURCES
            </h3>
          </div>
          <ScrollArea className="flex-1 p-5 relative z-10">
            <div className="space-y-4">
              {citations.length === 0 ? (
                <div className="text-center p-6 mt-10">
                  <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No active citations</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Sources will appear here based on responses.</p>
                </div>
              ) : (
                citations.map((cit, i) => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i}>
                    <Card 
                      onClick={() => setSelectedCitation(cit)}
                      className="glass border-white/5 hover:border-primary/40 hover:shadow-[0_5px_20px_rgba(var(--primary),0.15)] transition-all duration-300 cursor-pointer overflow-hidden group"
                    >
                      <CardHeader className="p-4 pb-0 bg-gradient-to-b from-primary/10 to-transparent">
                        <CardTitle className="text-sm flex items-start gap-2 leading-snug group-hover:text-primary transition-colors">
                          <FileText className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          {cit.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-3">
                        <div className="text-xs text-muted-foreground/80 break-all leading-relaxed">
                          <span className="font-semibold text-foreground/60">Source:</span> {cit.source}
                        </div>
                        {cit.page && (
                          <div className="mt-3 text-[11px] font-bold tracking-wide text-primary bg-primary/10 border border-primary/20 inline-block px-2.5 py-1 rounded-md shadow-sm">
                            PAGE {cit.page}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </ScrollArea>
        </motion.div>
      )}

      {/* Citation Modal Overlay */}
      {selectedCitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={() => setSelectedCitation(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10 bg-primary/5 flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {selectedCitation.title}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setSelectedCitation(null)} className="h-8 w-8 rounded-full hover:bg-white/10">
                ✕
              </Button>
            </div>
            <div className="p-6">
              <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">{selectedCitation.source}</span>
                {selectedCitation.page && (
                  <span className="font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">Page {selectedCitation.page}</span>
                )}
              </div>
              <div className="prose prose-invert max-w-none text-sm text-foreground/80 bg-background/50 p-6 rounded-xl border border-white/5 shadow-inner">
                <p>
                  <strong className="text-primary font-bold tracking-wide text-xs uppercase">Source Excerpt</strong><br/><br/>
                  ... According to the survey data on <strong>{selectedCitation.title}</strong>, there is a significant indicator of stress on the local aquifer systems. The current dataset points towards a multi-year trend of deficit between extraction and natural recharge, severely exacerbated by fluctuating annual monsoons...
                  <br/><br/>
                  <em className="text-muted-foreground/60">(Note: This is a simulated excerpt viewer since the core RAG backend is currently running in mock mode for this demo interaction.)</em>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
