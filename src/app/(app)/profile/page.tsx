"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Building, Clock, ShieldCheck, Settings, LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const activityHistory = [
  { action: "Generated Q3 Report", entity: "Central Aquifer", time: "2 hours ago" },
  { action: "Queried AI Assistant", entity: "Depletion rates in CA", time: "1 day ago" },
  { action: "Updated Notification Settings", entity: "System", time: "3 days ago" },
  { action: "Logged in", entity: "New IP detected", time: "1 week ago" },
];

export default function ProfilePage() {
  const { currentUser, logout, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !currentUser) {
    return <div className="container mx-auto p-8">Loading profile...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile & Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and preferences.</p>
        </div>
        <Button onClick={logout} variant="destructive" className="bg-destructive/20 text-red-400 hover:bg-destructive/30 border border-destructive/50">
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: User Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-1 space-y-6">
          <Card className="glass-card border-border/40 text-center pt-8">
            <CardContent className="flex flex-col items-center">
              <Avatar className="w-24 h-24 border-4 border-background mb-4 shadow-xl">
                <AvatarImage src="https://i.pravatar.cc/150?u=a04258114e29026702d" />
                <AvatarFallback><User className="w-10 h-10 text-muted-foreground" /></AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{currentUser.name || "Unknown User"}</h2>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mt-2 border border-primary/20">
                <ShieldCheck className="w-3.5 h-3.5" /> {currentUser.role}
              </div>
              
              <div className="w-full mt-6 space-y-3 text-sm text-left">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-4 h-4" /> {currentUser.email}
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="w-4 h-4" /> Joined: {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : "N/A"}
                </div>
              </div>

              <Button className="w-full mt-6 bg-primary hover:bg-primary/90">
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column: Activity & Settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2 space-y-6">
          
          <Card className="glass-card border-border/40">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Activity History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l border-border/50 ml-3 space-y-6 pl-6 pb-2">
                {activityHistory.map((item, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-primary/50 ring-4 ring-background" />
                    <p className="font-medium text-sm text-foreground">{item.action}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.entity}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1 uppercase tracking-wider">{item.time}</p>
                  </div>
                ))}
              </div>
              <Button variant="link" className="px-0 mt-4 text-xs text-primary">View Full History</Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/40">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" /> Preferences
              </CardTitle>
              <CardDescription>Manage your notification settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: "Email Notifications", desc: "Receive weekly summary reports" },
                { title: "Critical Alerts", desc: "SMS notifications for severe depletion" },
                { title: "Dark Mode", desc: "System default appearance is forced dark currently" }
              ].map((setting, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{setting.title}</p>
                    <p className="text-xs text-muted-foreground">{setting.desc}</p>
                  </div>
                  <div className="w-10 h-5 bg-primary/20 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-primary rounded-full" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

        </motion.div>
      </div>
    </div>
  );
}
