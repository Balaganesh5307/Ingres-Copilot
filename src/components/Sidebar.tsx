"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Bot, 
  BarChart3, 
  Map as MapIcon, 
  FileText, 
  User, 
  Settings,
  Activity,
  LogOut,
  X,
  Database
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const ALL_LINKS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, access: "all" },
  { name: "AI Assistant", href: "/assistant", icon: Bot, access: "all" },
  { name: "Analytics", href: "/analytics", icon: BarChart3, access: "all" },
  { name: "Interactive Map", href: "/map", icon: MapIcon, access: "all" },
  { name: "Report Summarizer", href: "/summarizer", icon: FileText, access: "all" },
  { name: "Profile", href: "/profile", icon: User, access: "auth" },
  { name: "Admin Setup", href: "/admin", icon: Settings, access: ["Admin"] },
  { name: "Data Ingestion", href: "/admin/datasets", icon: Database, access: ["Admin"] },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { role, isAuthenticated, currentUser, isLoading } = useAuth();

  const sidebarLinks = ALL_LINKS.filter(link => {
    if (link.access === "all") return true;
    if (link.access === "auth" && isAuthenticated) return true;
    if (Array.isArray(link.access) && link.access.includes(role || "")) return true;
    return false;
  });

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`w-64 h-full bg-background/80 backdrop-blur-xl border-r border-border/40 flex flex-col z-50 fixed left-0 top-0 transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-border/40 shrink-0">
          <Link href="/" className="flex items-center gap-2 group" onClick={onClose}>
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/50 group-hover:bg-primary/30 transition-colors">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-lg tracking-tight gradient-text">
              Ingres Copilot
            </span>
          </Link>
          <button 
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-black/5 hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {sidebarLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          
          return (
            <Link key={link.href} href={link.href} className="block" onClick={onClose}>
              <motion.div 
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive 
                    ? "bg-primary/15 text-primary font-medium border border-primary/20" 
                    : "text-muted-foreground hover:bg-black/5 hover:text-foreground"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                {link.name}
              </motion.div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border/40">
        {isLoading ? (
          <div className="flex items-center justify-center py-2">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isAuthenticated ? (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-background/50 border border-border/40 hover:bg-black/5 transition-colors group">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser?.name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{role}</p>
            </div>
          </div>
        ) : (
          <Link href="/login" className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors">
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Sign In</span>
          </Link>
        )}
      </div>
      </div>
    </>
  );
}
