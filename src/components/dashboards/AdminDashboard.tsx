"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Server, HardDrive, ShieldAlert, Activity, Terminal, X, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function AdminDashboard() {
  const [showLogs, setShowLogs] = useState(false);

  const mockLogs = [
    { time: "2026-08-16 10:45:12", level: "INFO", msg: "User Demo Admin authenticated successfully." },
    { time: "2026-08-16 10:48:33", level: "INFO", msg: "Batch ingestion started for GWRA-2025 Block 4." },
    { time: "2026-08-16 10:49:01", level: "SUCCESS", msg: "Batch ingestion completed. 450 records updated." },
    { time: "2026-08-16 11:02:15", level: "WARNING", msg: "High latency detected on ChromaDB connection." },
    { time: "2026-08-16 11:15:42", level: "ERROR", msg: "Failed unauthorized API request from IP 192.168.1.44." },
    { time: "2026-08-16 11:30:00", level: "INFO", msg: "Scheduled backup of vector database completed." },
    { time: "2026-08-16 11:45:22", level: "WARNING", msg: "API rate limit approaching for Researcher group." },
    { time: "2026-08-16 12:05:10", level: "INFO", msg: "System health check passed." },
  ];

  const getLogIcon = (level: string) => {
    switch (level) {
      case "ERROR": return <X className="w-4 h-4 text-red-400" />;
      case "WARNING": return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case "SUCCESS": return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getLogColor = (level: string) => {
    switch (level) {
      case "ERROR": return "text-red-400 bg-red-400/10";
      case "WARNING": return "text-amber-400 bg-amber-400/10";
      case "SUCCESS": return "text-emerald-400 bg-emerald-400/10";
      default: return "text-blue-400 bg-blue-400/10";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold gradient-text">System Administration</h2>
          <p className="text-muted-foreground text-sm">Manage platform infrastructure and users.</p>
        </div>
        <Button 
          onClick={() => setShowLogs(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]"
        >
          <Terminal className="w-4 h-4 mr-2" /> System Logs
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: "Active Users", value: "1,204", icon: Users, color: "text-blue-400" },
          { title: "Server Load", value: "34%", icon: Server, color: "text-emerald-400" },
          { title: "Storage", value: "842 GB", icon: HardDrive, color: "text-purple-400" },
          { title: "Security Alerts", value: "2", icon: ShieldAlert, color: "text-red-400" }
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{s.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Recent Ingestion Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {["GWRA-2025 Block 4", "TN District Demographics", "Rainfall Historical Data"].map((job, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-background/50 border border-border/50">
                <div className="text-sm font-medium">{job}</div>
                <div className="text-xs px-2 py-1 bg-emerald-400/20 text-emerald-400 rounded-full border border-emerald-400/30">Completed</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Logs Modal */}
      {showLogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={() => setShowLogs(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-4xl glass-card rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10 bg-primary/5 flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Terminal className="w-5 h-5 text-primary" />
                Live System Logs
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowLogs(false)} className="h-8 w-8 rounded-full hover:bg-white/10">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-4 bg-[#0a0a0a] font-mono text-sm max-h-[60vh] overflow-y-auto">
              {mockLogs.map((log, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4 py-2 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors px-2 rounded">
                  <div className="text-muted-foreground whitespace-nowrap shrink-0">[{log.time}]</div>
                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider shrink-0 w-20 text-center flex items-center justify-center gap-1 ${getLogColor(log.level)}`}>
                    {getLogIcon(log.level)}
                    {log.level}
                  </div>
                  <div className="text-foreground/90 break-words">{log.msg}</div>
                </div>
              ))}
              <div className="mt-4 flex items-center gap-2 text-muted-foreground animate-pulse px-2 pb-2">
                <div className="w-2 h-4 bg-primary/70 rounded-sm"></div> Listening for new events...
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
