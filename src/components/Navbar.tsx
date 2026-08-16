"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 w-full z-50 glass border-b border-border/40"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/50 group-hover:bg-primary/30 transition-colors">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Ingres Copilot
          </span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
          <Link href="/assistant" className="hover:text-primary transition-colors">AI Assistant</Link>
          <Link href="/analytics" className="hover:text-primary transition-colors">Analytics</Link>
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" className="text-muted-foreground hover:text-white">
                  Dashboard
                </Button>
              </Link>
              <Button onClick={logout} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-white">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(0,0,0,0.3)]">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
