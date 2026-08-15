"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Send, 
  Bot, 
  User, 
  Menu, 
  FileText, 
  Search,
  MessageSquare,
  PanelRightClose,
  PanelRightOpen
} from "lucide-react";

const suggestedQuestions = [
  "Show groundwater depletion rates in California for 2023.",
  "Which districts have the highest contamination risk?",
  "Predict aquifer recharge for the next 6 months.",
  "What are the main causes of extraction in Region A?"
];

const mockCitations = [
  { id: 1, title: "CA Water Board Report 2023", snippet: "Depletion rates in the central valley reached an all-time high...", relevance: "98%" },
  { id: 2, title: "Aquifer Study: Region B", snippet: "Recharge rates are hindered by prolonged drought conditions...", relevance: "85%" }
];

export default function AssistantPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I am Ingres Copilot. How can I assist you with groundwater intelligence today?" }
  ]);
  const [input, setInput] = useState("");
  const [showCitations, setShowCitations] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInput("");
    setIsTyping(true);

    // Mock response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "Based on the latest geospatial data and predictive models, I can confirm that the central regions are experiencing higher than normal extraction rates. I have cited the relevant reports in the panel." 
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] pt-2">
      {/* Left Sidebar (History) */}
      <div className="hidden md:flex w-64 flex-col border-r border-border/40 bg-background/50">
        <div className="p-4 border-b border-border/40 flex items-center justify-between">
          <span className="font-semibold text-sm">Chat History</span>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1 p-2">
          {["Depletion in CA", "Contamination Risks", "Recharge Predictions 2024", "Extraction limits"].map((chat, i) => (
            <Button key={i} variant="ghost" className="w-full justify-start font-normal text-sm mb-1 text-muted-foreground hover:text-foreground">
              <MessageSquare className="mr-2 h-4 w-4" />
              {chat}
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

        <ScrollArea className="flex-1 p-4 z-10">
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
                  <p className="text-sm leading-relaxed">{m.content}</p>
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
            {messages.length === 1 && (
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
                disabled={!input.trim() || isTyping}
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
              {mockCitations.map(cit => (
                <Card key={cit.id} className="bg-background/40 border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
                  <CardHeader className="p-3 pb-0">
                    <CardTitle className="text-sm flex items-start gap-2">
                      <FileText className="w-4 h-4 text-blue-400 mt-0.5" />
                      {cit.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-2">
                    <p className="text-xs text-muted-foreground line-clamp-3">"{cit.snippet}"</p>
                    <div className="mt-2 text-[10px] text-primary bg-primary/10 inline-block px-2 py-0.5 rounded">
                      {cit.relevance} Match
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </motion.div>
      )}
    </div>
  );
}
