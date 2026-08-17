"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, CheckCircle, Loader2, Sparkles, ChevronRight, FileSearch } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function SummarizerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(false);
  const [summaryData, setSummaryData] = useState<{summary: string, insights: {text: string, type: string}[]} | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setResult(false);
    
    try {
      const token = localStorage.getItem("auth_token");
      const formData = new FormData();
      formData.append("file", file);
      
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${API_BASE}/documents/summarize`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });
      
      if (res.ok) {
        const data = await res.json();
        setSummaryData(data);
        setResult(true);
      } else {
        alert("Failed to summarize document");
      }
    } catch (err) {
      console.error(err);
      alert("Error summarizing document");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl relative min-h-[calc(100vh-4rem)]">
      {/* Background Glows */}
      <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="mb-10 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.2)]">
          <FileSearch className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight gradient-text mb-3">AI Document Summarizer</h1>
        <p className="text-muted-foreground text-lg">Upload lengthy hydrogeological PDF reports to instantly extract key metrics, summaries, and action items.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        
        {/* Left Column: Upload */}
        <div className="space-y-6">
          <Card className="glass-card border-slate-200/60 shadow-xl relative overflow-hidden group">
            {/* Subtle glow on hover */}
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-primary" /> Upload Report
              </CardTitle>
              <CardDescription>Drag and drop a PDF file here</CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all duration-300 relative ${
                  file 
                    ? "border-primary/50 bg-primary/10 shadow-[inset_0_0_30px_rgba(var(--primary),0.1)]" 
                    : "border-border/40 hover:border-primary/40 hover:bg-white/5"
                }`}
              >
                {file ? (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-4 border border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                    <p className="font-semibold text-lg">{file.name}</p>
                    <p className="text-sm text-primary/80 mt-1 font-medium">Ready to process</p>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null); setResult(false); }} className="mt-6 text-xs hover:text-destructive hover:bg-destructive/10">
                      Remove File
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center pointer-events-none">
                    <div className="w-20 h-20 rounded-full bg-background/50 flex items-center justify-center mb-5 border border-slate-200/60 shadow-inner group-hover:scale-110 transition-transform duration-500">
                      <UploadCloud className="w-10 h-10 text-muted-foreground/50 group-hover:text-primary transition-colors duration-500" />
                    </div>
                    <p className="font-semibold text-foreground/90 mb-2 text-lg">Drag & Drop your file here</p>
                    <p className="text-sm text-muted-foreground mb-6">Supports PDF up to 50MB</p>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept=".pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          setFile(e.target.files[0]);
                        }
                      }}
                    />
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline" 
                      className="border-slate-200/60 bg-black/5 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 shadow-md pointer-events-auto rounded-xl h-11 px-8"
                    >
                      Browse Files
                    </Button>
                  </motion.div>
                )}
              </div>

              <Button 
                onClick={handleProcess} 
                disabled={!file || isProcessing}
                className="w-full mt-8 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 shadow-[0_0_20px_rgba(var(--primary),0.3)] h-14 rounded-xl text-lg font-semibold group disabled:opacity-50 disabled:shadow-none"
              >
                {isProcessing ? (
                  <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Extracting Insights...</>
                ) : (
                  <><Sparkles className="w-5 h-5 mr-3 group-hover:scale-125 transition-transform" /> Generate Summary</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Results */}
        <div className="space-y-6 relative h-full">
          <AnimatePresence mode="wait">
            {!result && !isProcessing && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full min-h-[500px] flex items-center justify-center border border-border/20 rounded-2xl bg-black/5 border-dashed backdrop-blur-sm"
              >
                <div className="text-center p-8 opacity-40 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-3xl bg-black/10 flex items-center justify-center mb-6">
                    <FileText className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium">Awaiting Document</p>
                  <p className="text-sm mt-2 max-w-[250px]">Upload a document to generate an AI-powered executive summary.</p>
                </div>
              </motion.div>
            )}

            {isProcessing && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full min-h-[500px] flex flex-col items-center justify-center border border-primary/20 rounded-2xl bg-primary/5 backdrop-blur-sm relative overflow-hidden"
              >
                {/* Scanning line effect */}
                <motion.div 
                  className="absolute top-0 left-0 right-0 h-1 bg-primary shadow-[0_0_15px_rgba(var(--primary),1)]"
                  animate={{ top: ["0%", "100%", "0%"] }}
                  transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                />
                
                <div className="w-20 h-20 relative flex items-center justify-center mb-6">
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                  <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
                  <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Analyzing Document</h3>
                <p className="text-sm text-muted-foreground animate-pulse">Running advanced NLP extraction models...</p>
              </motion.div>
            )}

            {result && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="space-y-6 h-full flex flex-col"
              >
                <Card className="glass-card border-primary/30 shadow-[0_0_40px_rgba(var(--primary),0.15)] relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
                  <div className="absolute top-4 right-4 bg-emerald-500/20 p-2 rounded-full border border-emerald-500/30">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Sparkles className="w-5 h-5 text-primary" /> Executive Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base text-foreground/80 leading-relaxed font-medium">
                      {summaryData?.summary || "Summary could not be generated."}
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card border-slate-200/60 flex-1">
                  <CardHeader className="pb-3 border-b border-border/20 bg-primary/5">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Key Insights & Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {summaryData?.insights?.map((insight, i) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 + 0.2 }}
                          key={i} 
                          className="flex items-start gap-3 p-3 rounded-xl bg-black/5 border border-border/20 hover:bg-black/10 transition-colors"
                        >
                          <div className={`mt-0.5 p-1 rounded-md ${
                            insight.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                            insight.type === 'danger' ? 'bg-red-500/20 text-red-400' :
                            insight.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            <ChevronRight className="w-4 h-4" />
                          </div>
                          <span className="font-medium text-sm leading-relaxed text-foreground/90">{insight.text}</span>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-4 pt-2">
                  <Button 
                    onClick={handleExport}
                    disabled={isExporting}
                    variant="outline" 
                    className="flex-1 h-12 rounded-xl border-border/20 bg-black/5 hover:bg-black/10 text-foreground"
                  >
                    {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                    {isExporting ? "Exporting..." : "Export PDF"}
                  </Button>
                  <Button 
                    onClick={() => router.push("/assistant?q=Discuss+the+key+insights+from+the+uploaded+Central+Basin+report.")}
                    className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                  >
                    <Sparkles className="w-4 h-4 mr-2" /> Discuss with AI
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
