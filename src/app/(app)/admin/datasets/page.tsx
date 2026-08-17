"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UploadCloud, Loader2, Plus, Database, DatabaseZap } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, type: "spring" as const } }
};

export default function DataIngestionPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem("auth_token");
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${API_BASE}/documents/`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error("Failed to fetch docs", err);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const token = localStorage.getItem("auth_token");
      const formData = new FormData();
      formData.append("file", file);

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const endpoint = file.name.endsWith(".csv") ? "/documents/upload-csv" : "/documents/upload";
      
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        // give backend a second to register the doc
        setTimeout(fetchDocuments, 1000);
      } else {
        alert("Failed to upload document. Make sure you are an Admin.");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading document");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownload = async (filename: string) => {
    if (!filename) return;
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    
    try {
      // In a real app we might fetch with auth headers if the endpoint requires it,
      // but if we are just using window.open, we can't easily pass headers.
      // Alternatively, we fetch the blob and trigger a download programmatically.
      const token = localStorage.getItem("auth_token");
      const res = await fetch(`${API_BASE}/documents/download/${filename}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error("Failed to download");
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error(err);
      alert("Error downloading document");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl relative min-h-[calc(100vh-4rem)]">
      {/* Background Glows */}
      <div className="absolute top-10 left-20 w-[400px] h-[400px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-20 right-20 w-[300px] h-[300px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight gradient-text mb-2">Knowledge Base Ingestion</h1>
          <p className="text-muted-foreground text-lg">Upload raw data and PDF reports directly to the AI Assistant's retrieval memory.</p>
        </div>
        
        <div className="flex gap-4 items-center">
            <div className="px-4 py-2 rounded-xl bg-black/5 border border-border/20 flex items-center gap-3">
                <DatabaseZap className="w-5 h-5 text-emerald-400" />
                <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Active Records</p>
                    <p className="text-lg font-bold leading-none">{documents.length}</p>
                </div>
            </div>
        </div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
        
        {/* Document Management Table */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card border-slate-200/60 shadow-xl h-full flex flex-col min-h-[500px]">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/20 pb-4 bg-primary/5">
              <div>
                <CardTitle className="text-xl flex items-center gap-2 text-primary">
                  <UploadCloud className="w-5 h-5" /> Ingestion Pipelines
                </CardTitle>
                <CardDescription className="pt-1">Monitor uploads and document parsing statuses</CardDescription>
              </div>
              <div className="relative z-10">
                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.csv" onChange={handleFileUpload} />
                <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.3)] rounded-xl h-11 px-6">
                  {isUploading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Plus className="w-5 h-5 mr-2" />}
                  {isUploading ? "Uploading & Indexing..." : "Upload Dataset"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col">
              <div className="flex-1 overflow-auto">
                <Table>
                  <TableHeader className="bg-black/5 sticky top-0 z-10 backdrop-blur-md">
                    <TableRow className="border-border/20 hover:bg-transparent">
                      <TableHead className="pl-6 font-semibold py-4">Document / File Name</TableHead>
                      <TableHead className="font-semibold">Ingestion Date</TableHead>
                      <TableHead className="text-right pr-6 font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {documents.length === 0 ? (
                        <TableRow className="border-none hover:bg-transparent">
                            <TableCell colSpan={3} className="h-[300px] text-center text-muted-foreground">
                                <div className="flex flex-col items-center justify-center space-y-4">
                                    <Database className="w-12 h-12 opacity-20" />
                                    <p className="font-medium text-lg opacity-50">No datasets ingested yet</p>
                                </div>
                            </TableCell>
                        </TableRow>
                      ) : (
                          documents.map((doc, idx) => (
                          <motion.tr 
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            key={doc._id || doc.id || idx} 
                            className="border-border/20 hover:bg-black/5 transition-colors"
                          >
                            <TableCell className="pl-6 py-4">
                              <div className="flex flex-col">
                                <span 
                                  onClick={() => handleDownload(doc.filename || doc.name)}
                                  className="font-semibold text-primary hover:underline cursor-pointer truncate max-w-[200px] sm:max-w-[400px]"
                                >
                                  {doc.filename || doc.name}
                                </span>
                                <span className="text-xs text-muted-foreground mt-0.5">By {doc.uploadedBy || doc.uploader || "Admin"} • {doc._id || doc.id}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground font-medium text-sm">
                              {doc.ingestedAt ? new Date(doc.ingestedAt).toLocaleDateString() : doc.date}
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border shadow-sm min-w-[100px] text-center ${
                                (doc.status === 'Processed' || doc.status === 'completed') ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_10px_rgba(16,185,129,0.1)]' :
                                (doc.status === 'Processing' || doc.status === 'processing') ? 'text-blue-400 border-blue-500/30 bg-blue-500/10 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.1)]' :
                                (doc.status === 'Failed' || doc.status === 'failed') ? 'text-red-400 border-red-500/30 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.1)]' :
                                'text-muted-foreground border-slate-200/60 bg-black/5'
                              }`}>
                                {doc.status || "Unknown"}
                              </span>
                            </TableCell>
                          </motion.tr>
                        ))
                      )}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
