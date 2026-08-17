"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Send, Bot, User, Menu, FileText, Search, MessageSquare, PanelRightClose, PanelRightOpen, Trash2, Edit2, Check, X, Mic, MicOff
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

import { useAuth } from "@/contexts/AuthContext";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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
  const [indicatorMsg, setIndicatorMsg] = useState<string | null>(null);
  
  const [activeEvidenceMessage, setActiveEvidenceMessage] = useState<any>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [showMobileHistory, setShowMobileHistory] = useState(false);
  
  const [isListening, setIsListening] = useState(false);
  const [recognitionLang, setRecognitionLang] = useState("en-IN");
  
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
        body: JSON.stringify({ 
          userId: currentUser?.id || "guest", 
          title: "New Chat" 
        })
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

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this chat?")) return;
    
    if (id.startsWith("mock-")) {
      const updated = conversations.filter(c => (c._id || c.id) !== id);
      setConversations(updated);
      if (currentConvId === id) {
        if (updated.length > 0) loadSingleConversation(updated[0]._id || updated[0].id);
        else createNewConversation();
      }
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/chat/conversations/${id}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      if (res.ok) {
        const updated = conversations.filter(c => (c._id || c.id) !== id);
        setConversations(updated);
        if (currentConvId === id) {
          if (updated.length > 0) loadSingleConversation(updated[0]._id || updated[0].id);
          else createNewConversation();
        }
      }
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const renameConversation = async (id: string, newTitle: string) => {
    if (!newTitle.trim()) {
      setEditingChatId(null);
      return;
    }
    
    if (id.startsWith("mock-")) {
      setConversations(prev => prev.map(c => (c._id || c.id) === id ? { ...c, title: newTitle } : c));
      setEditingChatId(null);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/chat/conversations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getHeaders() },
        body: JSON.stringify({ title: newTitle })
      });
      if (res.ok) {
        setConversations(prev => prev.map(c => (c._id || c.id) === id ? { ...c, title: newTitle } : c));
      }
    } catch (err) {
      console.error("Failed to rename", err);
    }
    setEditingChatId(null);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }
    
    setIsListening(true);
    
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = recognitionLang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev ? prev + " " + transcript : transcript);
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
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
    setIndicatorMsg(null);
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
                if (data.type === "visualization") {
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastIdx = newMessages.length - 1;
                    const last = newMessages[lastIdx];
                    if (last.role === "assistant") {
                      newMessages[lastIdx] = { ...last, visualization: data.data };
                    }
                    return newMessages;
                  });
                } else if (data.type === "mapAction") {
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastIdx = newMessages.length - 1;
                    const last = newMessages[lastIdx];
                    if (last.role === "assistant") {
                      newMessages[lastIdx] = { ...last, mapAction: data.data };
                    }
                    return newMessages;
                  });
                } else if (data.type === "metadata") {
                  setCitations(data.citations || []);
                  // We can hide the indicator once metadata (and response stream) starts
                  setIndicatorMsg(null);
                } else if (data.type === "indicator") {
                  setIndicatorMsg(data.text);
                } else if (data.type === "chunk") {
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastIdx = newMessages.length - 1;
                    const last = newMessages[lastIdx];
                    if (last.role === "assistant") {
                      newMessages[lastIdx] = { ...last, content: last.content + data.text };
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
      setIndicatorMsg(null);
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
    <div className="flex flex-col md:flex-row h-full min-h-[calc(100vh-4rem)] p-4 pt-2 gap-4">
      {/* Mobile History Toggle Overlay Backdrop */}
      {showMobileHistory && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setShowMobileHistory(false)}
        />
      )}

      {/* Left Sidebar (History) */}
      <div className={`${showMobileHistory ? 'flex fixed inset-y-0 left-0 z-50' : 'hidden'} md:flex w-64 flex-col glass-card md:rounded-2xl overflow-hidden border-r md:border border-border/30 shadow-lg relative`}>
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="p-4 border-b border-border/20 flex items-center justify-between relative z-10">
          <span className="font-bold text-sm tracking-wide text-foreground/80">CHAT HISTORY</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/20 text-primary transition-colors" onClick={createNewConversation}>
              <Menu className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-black/5 text-muted-foreground md:hidden" onClick={() => setShowMobileHistory(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1 p-2 relative z-10">
          {conversations.map((conv, i) => {
            const id = conv._id || conv.id;
            const isEditing = editingChatId === id;
            const isActive = currentConvId === id;
            
            return (
              <div 
                key={i}
                className={`w-full flex items-center justify-between font-medium text-sm mb-1 px-3 py-3 rounded-xl transition-all duration-300 group cursor-pointer ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]" 
                    : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                }`}
                onClick={() => !isEditing && loadSingleConversation(id)}
              >
                <div className="flex items-center flex-1 min-w-0 pr-2">
                  <MessageSquare className={`mr-3 h-4 w-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-primary"}`} />
                  {isEditing ? (
                    <input 
                      autoFocus
                      className="bg-background/50 border border-primary/40 text-foreground px-2 py-1 rounded-md text-xs w-full focus:outline-none"
                      value={editTitle}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') renameConversation(id, editTitle);
                        if (e.key === 'Escape') setEditingChatId(null);
                      }}
                    />
                  ) : (
                    <span className="truncate">{conv.title || "Chat"}</span>
                  )}
                </div>
                
                {/* Actions */}
                {!isEditing && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`h-6 w-6 rounded-md ${isActive ? 'hover:bg-black/10 text-primary-foreground' : 'hover:bg-primary/20 text-muted-foreground hover:text-primary'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditTitle(conv.title || "Chat");
                        setEditingChatId(id);
                      }}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`h-6 w-6 rounded-md ${isActive ? 'hover:bg-red-500/20 text-destructive-foreground hover:text-red-700' : 'hover:bg-red-500/10 text-muted-foreground hover:text-red-600'}`}
                      onClick={(e) => deleteConversation(id, e)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
                {isEditing && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-green-400 hover:bg-green-500/20 rounded-md" onClick={(e) => { e.stopPropagation(); renameConversation(id, editTitle); }}>
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:bg-red-500/20 rounded-md" onClick={(e) => { e.stopPropagation(); setEditingChatId(null); }}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col glass-card rounded-2xl overflow-hidden border-border/30 shadow-2xl relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex items-center justify-between p-5 border-b border-border/20 z-10 backdrop-blur-md bg-background/20">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden hover:bg-primary/20 text-primary transition-colors h-10 w-10 rounded-xl"
              onClick={() => setShowMobileHistory(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h2 className="font-bold text-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/40 shadow-[0_0_15px_rgba(var(--primary),0.3)] hidden sm:flex">
                <Bot className="text-primary w-5 h-5" />
              </div>
              <span className="gradient-text">Ingres Copilot</span>
            </h2>
          </div>
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
                <div className={`px-5 py-4 max-w-[85%] leading-relaxed flex flex-col gap-4 ${
                  m.role === "user" 
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm shadow-[0_5px_15px_rgba(var(--primary),0.3)] font-medium" 
                    : "glass border border-slate-200/60 rounded-2xl rounded-tl-sm text-foreground/90 shadow-lg"
                }`}>
                  <p className="text-[15px] whitespace-pre-wrap">{m.content}</p>
                  
                  {/* Dynamic Recharts Visualization */}
                  {m.visualization && m.visualization.type === "bar" && (
                    <div className="w-full h-64 mt-2 bg-background/50 rounded-xl p-4 border border-slate-200/60">
                      <h4 className="text-xs font-bold uppercase mb-4 text-center text-muted-foreground">{m.visualization.title}</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={m.visualization.data}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                          <XAxis dataKey="name" stroke="currentColor" opacity={0.5} fontSize={11} />
                          <YAxis stroke="currentColor" opacity={0.5} fontSize={11} />
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderColor: 'rgba(0,0,0,0.1)', borderRadius: '8px', color: '#000' }}
                            itemStyle={{ color: '#000' }}
                          />
                          <Legend />
                          {Object.keys(m.visualization.data[0] || {}).filter(k => k !== "name").map((key, idx) => (
                            <Bar key={key} dataKey={key} fill={COLORS[idx % COLORS.length]} radius={[4, 4, 0, 0]} />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {m.visualization && m.visualization.type === "pie" && (
                    <div className="w-full h-64 mt-2 bg-background/50 rounded-xl p-4 border border-slate-200/60">
                      <h4 className="text-xs font-bold uppercase mb-2 text-center text-muted-foreground">{m.visualization.title}</h4>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={m.visualization.data}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            nameKey="name"
                          >
                            {m.visualization.data.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderColor: 'rgba(0,0,0,0.1)', borderRadius: '8px', color: '#000' }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {m.mapAction && (
                    <div className="mt-2 text-center">
                      <a 
                        href={`/map?state=${encodeURIComponent(m.mapAction.state || '')}&category=${encodeURIComponent(m.mapAction.category || '')}`}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:scale-105 duration-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        View Map
                      </a>
                    </div>
                  )}
                  {m.role === "assistant" && m.citations && m.citations.length > 0 && (
                    <div className="mt-3 flex justify-start">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 text-xs bg-background/50 border-primary/20 hover:bg-primary/10 hover:text-primary transition-colors flex items-center gap-2"
                        onClick={() => setActiveEvidenceMessage(m)}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        View Evidence ({m.citations.length})
                      </Button>
                    </div>
                  )}
                </div>
                {m.role === "user" && (
                  <Avatar className="w-10 h-10 border border-border/50 bg-background/50 rounded-xl mt-1 shrink-0">
                    <User className="w-5 h-5 m-auto text-muted-foreground" />
                  </Avatar>
                )}
              </motion.div>
            ))}
            {isTyping && (
              <div className="flex flex-col gap-2 justify-start">
                {indicatorMsg && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-emerald-400 italic font-medium ml-14 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {indicatorMsg}
                  </motion.div>
                )}
                <div className="flex gap-4 justify-start">
                  <Avatar className="w-10 h-10 border border-primary/30 bg-primary/10 rounded-xl mt-1 shrink-0">
                    <Bot className="w-5 h-5 m-auto text-primary" />
                  </Avatar>
                  <div className="px-5 py-5 glass border border-slate-200/60 rounded-2xl rounded-tl-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce shadow-[0_0_5px_rgba(var(--primary),0.8)]" />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s] shadow-[0_0_5px_rgba(var(--primary),0.8)]" />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s] shadow-[0_0_5px_rgba(var(--primary),0.8)]" />
                  </div>
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
                placeholder={isListening ? "Listening..." : "Ask about groundwater data..."}
                className={`pr-40 py-7 rounded-2xl glass border-border/30 focus-visible:ring-primary/40 focus-visible:border-primary/50 text-[15px] shadow-inner placeholder:text-muted-foreground/60 ${isListening ? 'border-primary/50 bg-primary/5' : ''}`}
              />
              
              <div className="absolute right-12 sm:right-16 flex items-center gap-1 sm:gap-2">
                <select 
                  value={recognitionLang}
                  onChange={(e) => setRecognitionLang(e.target.value)}
                  className="bg-background/80 border border-border/30 rounded-lg text-xs py-1.5 px-2 text-foreground outline-none focus:border-primary/50 cursor-pointer backdrop-blur-md"
                  title="Select Voice Language"
                >
                  <option value="en-IN" className="bg-white text-black py-1">English (IN)</option>
                  <option value="hi-IN" className="bg-white text-black py-1">Hindi</option>
                  <option value="ta-IN" className="bg-white text-black py-1">Tamil</option>
                  <option value="te-IN" className="bg-white text-black py-1">Telugu</option>
                </select>
                
                <Button 
                  type="button" 
                  size="icon" 
                  variant="ghost"
                  onClick={() => isListening ? setIsListening(false) : startListening()}
                  className={`h-9 w-9 rounded-xl transition-all duration-300 ${isListening ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 animate-pulse' : 'hover:bg-primary/20 text-primary'}`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              </div>

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
                      className="glass border-slate-200/60 hover:border-primary/40 transition-all duration-300 overflow-hidden group"
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

      {/* Evidence Modal Overlay */}
      {activeEvidenceMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={() => setActiveEvidenceMessage(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-3xl glass-card rounded-2xl border border-slate-200/60 shadow-2xl overflow-hidden relative max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border/30 bg-primary/5 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                Evidence Trace
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setActiveEvidenceMessage(null)} className="h-8 w-8 rounded-full hover:bg-black/5">
                ✕
              </Button>
            </div>
            
            <ScrollArea className="flex-1 p-6">
              <div className="mb-6 bg-primary/10 border border-primary/20 rounded-xl p-4">
                <h4 className="text-xs font-bold text-primary uppercase mb-2">AI Answer</h4>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">{activeEvidenceMessage.content}</p>
              </div>
              
              <h4 className="text-sm font-bold text-muted-foreground uppercase mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Evidence Sources
              </h4>
              
              <div className="space-y-4">
                {activeEvidenceMessage.citations?.map((cit: any, idx: number) => (
                  <div key={idx} className="bg-background/50 border border-slate-200/60 rounded-xl p-5 shadow-inner">
                    <div className="mb-4 flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                      <div className="font-bold text-foreground/80 text-base">{cit.title}</div>
                      <span className="font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20 text-xs">{cit.source}</span>
                      {cit.page && (
                        <span className="font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20 text-xs">Page {cit.page}</span>
                      )}
                      {cit.type && (
                        <span className="font-semibold bg-muted px-3 py-1 rounded-full border border-border uppercase text-[10px] tracking-wider">{cit.type}</span>
                      )}
                    </div>
                    
                    <div className="prose prose-invert max-w-none text-sm text-foreground/80">
                      {cit.type === 'document' || !cit.type ? (
                        <>
                          <strong className="text-primary font-bold tracking-wide text-xs uppercase mb-2 block">Source Excerpt</strong>
                          <div className="pl-4 border-l-2 border-primary/40 italic text-muted-foreground">
                            {cit.excerpt || "Excerpt not available."}
                          </div>
                        </>
                      ) : cit.type === 'analytics' ? (
                        <>
                          <strong className="text-primary font-bold tracking-wide text-xs uppercase mb-2 block">MongoDB Analytics Evidence</strong>
                          <div className="grid grid-cols-2 gap-4 font-mono text-xs bg-black/5 p-4 rounded-lg">
                            <div><span className="text-muted-foreground block mb-1">Operation:</span> {cit.operation}</div>
                            {cit.entities && (
                              <div><span className="text-muted-foreground block mb-1">Entities:</span> {cit.entities.join(', ')}</div>
                            )}
                            {cit.assessmentYear && (
                              <div><span className="text-muted-foreground block mb-1">Assessment Year:</span> {cit.assessmentYear}</div>
                            )}
                          </div>
                        </>
                      ) : cit.type === 'assessment' ? (
                        <>
                          <strong className="text-primary font-bold tracking-wide text-xs uppercase mb-2 block">Structured Assessment Record</strong>
                          <div className="grid grid-cols-2 gap-4 font-mono text-xs bg-black/5 p-4 rounded-lg">
                            <div><span className="text-muted-foreground block mb-1">Operation:</span> {cit.operation}</div>
                            <div><span className="text-muted-foreground block mb-1">Target:</span> {cit.target}</div>
                            <div><span className="text-muted-foreground block mb-1">Level:</span> {cit.level}</div>
                          </div>
                        </>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        </div>
      )}
    </div>
  );
}
