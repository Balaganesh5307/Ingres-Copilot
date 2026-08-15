"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, CheckCircle, Loader2, Sparkles, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function SummarizerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleProcess = () => {
    if (!file) return;
    setIsProcessing(true);
    setResult(false);
    
    // Mock processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setResult(true);
    }, 2500);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Report Summarizer</h1>
        <p className="text-muted-foreground mt-1">Upload lengthy hydrogeological PDF reports to instantly extract key metrics and summaries.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Upload */}
        <div className="space-y-6">
          <Card className="glass-card border-border/40">
            <CardHeader>
              <CardTitle>Upload Report</CardTitle>
              <CardDescription>Drag and drop a PDF file here</CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors ${
                  file ? "border-primary/50 bg-primary/5" : "border-border/50 hover:border-primary/30 hover:bg-white/5"
                }`}
              >
                {file ? (
                  <>
                    <FileText className="w-12 h-12 text-primary mb-4" />
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">Ready to process</p>
                    <Button variant="ghost" size="sm" onClick={() => { setFile(null); setResult(false); }} className="mt-4 text-xs">
                      Remove File
                    </Button>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="font-medium text-foreground mb-1">Select a file or drag and drop</p>
                    <p className="text-sm text-muted-foreground mb-4">PDF up to 50MB</p>
                    <Button variant="outline" className="border-border/50 bg-background/50">
                      Browse Files
                    </Button>
                  </>
                )}
              </div>

              <Button 
                onClick={handleProcess} 
                disabled={!file || isProcessing}
                className="w-full mt-6 bg-primary hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(var(--primary),0.2)]"
              >
                {isProcessing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Extracting Insights...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" /> Generate Summary</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Results */}
        <div className="space-y-6 relative">
          <AnimatePresence mode="wait">
            {!result && !isProcessing && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full min-h-[400px] flex items-center justify-center border border-border/20 rounded-xl bg-background/20 border-dashed"
              >
                <div className="text-center p-6 opacity-50">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p>Upload a document to see the AI summary here.</p>
                </div>
              </motion.div>
            )}

            {isProcessing && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full min-h-[400px] flex flex-col items-center justify-center border border-border/20 rounded-xl bg-background/20"
              >
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                <p className="text-sm font-medium animate-pulse">Running NLP extraction models...</p>
              </motion.div>
            )}

            {result && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <Card className="glass-card border-primary/30 shadow-[0_0_30px_rgba(var(--primary),0.1)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" /> Executive Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      The uploaded document outlines the 2023 hydrological survey for the Central Basin. It highlights a critical <strong>12% deficit in aquifer recharge</strong> compared to the previous decade. Immediate reduction in industrial extraction is recommended for districts A and B to prevent permanent subsidence.
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card border-border/40">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Key Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {[
                        "Recharge deficit: 12% below 10-year average",
                        "High risk zones identified: District A, District B",
                        "Primary cause: Prolonged drought & agricultural over-extraction",
                        "Recommended action: 15% mandated extraction cut"
                      ].map((insight, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <ChevronRight className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 border-border/50 bg-background/50">
                    Export PDF
                  </Button>
                  <Button variant="outline" className="flex-1 border-border/50 bg-background/50">
                    Send to Assistant
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
