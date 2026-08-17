"use client";

import { Sidebar } from "@/components/Sidebar";
import { useState } from "react";
import { Menu, Activity } from "lucide-react";
import Link from "next/link";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-full flex flex-col lg:flex-row relative">
      {/* Mobile Top Navbar */}
      <div className="lg:hidden h-16 flex items-center justify-between px-4 border-b border-border/40 bg-background/80 backdrop-blur-xl z-30 shrink-0 sticky top-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/50">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-lg tracking-tight gradient-text">
            Ingres
          </span>
        </Link>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 flex flex-col relative overflow-hidden lg:ml-64 min-h-[calc(100vh-4rem)] lg:min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none -z-10" />
        {children}
      </main>
    </div>
  );
}
