"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Building, Clock, ShieldCheck, Settings, LogOut, Loader2, Activity, Bell } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const activityHistory = [
  { action: "Generated Q3 Report", entity: "Central Aquifer", time: "2 hours ago", type: "document" },
  { action: "Queried AI Assistant", entity: "Depletion rates in CA", time: "1 day ago", type: "ai" },
  { action: "Updated Notification Settings", entity: "System", time: "3 days ago", type: "system" },
  { action: "Logged in", entity: "New IP detected", time: "1 week ago", type: "security" },
];

const moreLogs = [
  { action: "Exported Dataset", entity: "Texas Groundwater Levels", time: "2 weeks ago", type: "document" },
  { action: "Changed Password", entity: "Security Settings", time: "1 month ago", type: "security" },
  { action: "Queried AI Assistant", entity: "Rainfall impact in AZ", time: "1 month ago", type: "ai" },
  { action: "Account Created", entity: "System Enrollment", time: "2 months ago", type: "system" },
];

export default function ProfilePage() {
  const { currentUser, logout, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  const handleAuditClick = () => {
    setIsLogging(true);
    setTimeout(() => {
      setIsLogging(false);
      setShowAllLogs(true);
    }, 1500);
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !currentUser) {
    return (
      <div className="container mx-auto h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground font-medium uppercase tracking-widest text-sm">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl relative min-h-[calc(100vh-4rem)]">
      {/* Background Glows */}
      <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-20 left-20 w-[300px] h-[300px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight gradient-text mb-2">Profile & Settings</h1>
          <p className="text-muted-foreground text-lg">Manage your account identity and system preferences.</p>
        </div>
        <Button onClick={logout} variant="destructive" className="bg-destructive/10 text-red-400 hover:bg-destructive/20 border border-destructive/30 shadow-[0_0_15px_rgba(239,68,68,0.1)] h-11 px-6 rounded-xl transition-all">
          <LogOut className="w-4 h-4 mr-2" /> Secure Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: User Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, type: "spring" }} className="lg:col-span-1 space-y-8">
          <Card className="glass-card border-white/5 text-center pt-8 overflow-hidden relative shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/10 to-transparent border-b border-primary/5" />
            <CardContent className="flex flex-col items-center relative z-10 pt-4">
              <div className="relative mb-6">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-cyan-500 rounded-full blur opacity-40" />
                <Avatar className="w-28 h-28 border-4 border-[#0a0a0a] relative shadow-2xl bg-black">
                  <AvatarImage src={`https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser.email}&backgroundColor=transparent`} className="p-2" />
                  <AvatarFallback className="bg-black/50"><User className="w-12 h-12 text-muted-foreground" /></AvatarFallback>
                </Avatar>
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#0a0a0a] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              </div>
              
              <h2 className="text-2xl font-bold tracking-tight">{currentUser.name || "Unknown User"}</h2>
              
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mt-3 border shadow-sm ${
                currentUser.role === 'Admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.15)]' :
                currentUser.role === 'Researcher' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.15)]' :
                currentUser.role === 'Government Officer' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]' :
                'bg-primary/10 text-primary border-primary/20 shadow-[0_0_10px_rgba(var(--primary),0.15)]'
              }`}>
                <ShieldCheck className="w-4 h-4" /> {currentUser.role}
              </div>
              
              <div className="w-full mt-8 space-y-4 text-sm text-left px-2">
                <div className="flex items-center gap-4 text-muted-foreground bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="p-2 rounded-lg bg-white/5 text-foreground"><Mail className="w-4 h-4" /></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider font-bold opacity-60">Email Address</span>
                    <span className="text-foreground font-medium">{currentUser.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="p-2 rounded-lg bg-white/5 text-foreground"><Clock className="w-4 h-4" /></div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider font-bold opacity-60">Member Since</span>
                    <span className="text-foreground font-medium">{currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "Recently joined"}</span>
                  </div>
                </div>
              </div>

              <Button className="w-full mt-8 h-12 rounded-xl bg-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(var(--primary),0.3)] font-semibold transition-all">
                Edit Profile Details
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column: Activity & Settings */}
        <div className="lg:col-span-2 space-y-8">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1, type: "spring" }}>
            <Card className="glass-card border-white/5 shadow-xl">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    <Activity className="w-5 h-5" />
                  </div>
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="relative border-l-2 border-white/10 ml-4 space-y-8 pl-8 pb-4">
                  {(showAllLogs ? [...activityHistory, ...moreLogs] : activityHistory).map((item, i) => (
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + (i * 0.1) }} key={i} className="relative group">
                      <div className={`absolute -left-[41px] top-1 w-4 h-4 rounded-full ring-4 ring-[#0a0a0a] group-hover:scale-125 transition-transform ${
                        item.type === 'document' ? 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]' :
                        item.type === 'ai' ? 'bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.8)]' :
                        item.type === 'security' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' :
                        'bg-primary shadow-[0_0_10px_rgba(var(--primary),0.8)]'
                      }`} />
                      <p className="font-semibold text-[15px] text-foreground/90 leading-none">{item.action}</p>
                      <p className="text-sm text-muted-foreground mt-1.5">{item.entity}</p>
                      <p className="text-[10px] text-primary/70 font-bold mt-2 uppercase tracking-widest bg-primary/10 inline-block px-2 py-0.5 rounded border border-primary/20">{item.time}</p>
                    </motion.div>
                  ))}
                </div>
                <Button onClick={handleAuditClick} disabled={showAllLogs || isLogging} variant="outline" className="w-full mt-4 h-11 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {isLogging ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading Logs...</> : showAllLogs ? "All Logs Loaded" : "View Comprehensive Audit Log"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2, type: "spring" }}>
            <Card className="glass-card border-white/5 shadow-xl">
              <CardHeader className="border-b border-white/5 pb-4">
                <CardTitle className="text-xl flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    <Settings className="w-5 h-5" />
                  </div>
                  System Preferences
                </CardTitle>
                <CardDescription className="pt-1">Manage notification and UI settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {[
                  { title: "Weekly Digest Reports", desc: "Receive automated email summaries of regional changes", icon: Mail, active: true },
                  { title: "Critical Alerts", desc: "Immediate SMS notifications for severe aquifer depletion", icon: Bell, active: true },
                  { title: "Forced Dark Mode", desc: "System appearance is locked to dark mode for optimal contrast", icon: Clock, active: true }
                ].map((setting, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-black/40 text-muted-foreground border border-white/5">
                        <setting.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground/90">{setting.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{setting.desc}</p>
                      </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${setting.active ? 'bg-primary' : 'bg-white/10'}`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${setting.active ? 'right-1' : 'left-1 opacity-50'}`} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
