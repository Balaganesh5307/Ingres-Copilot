"use client";

import { useAuth } from "@/contexts/AuthContext";
import { AdminDashboard } from "@/components/dashboards/AdminDashboard";
import { GovDashboard } from "@/components/dashboards/GovDashboard";
import { ResearcherDashboard } from "@/components/dashboards/ResearcherDashboard";
import { PublicDashboard } from "@/components/dashboards/PublicDashboard";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { role, isAuthenticated, isLoading } = useAuth();

  const renderDashboard = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }
    
    if (!isAuthenticated) return <PublicDashboard />;
    
    const normalizedRole = role?.toLowerCase()?.trim() || "";
    
    switch (normalizedRole) {
      case "admin":
        return <AdminDashboard />;
      case "government officer":
      case "gov officer":
        return <GovDashboard />;
      case "researcher":
        return <ResearcherDashboard />;
      default:
        // Public User or unmapped role
        return <PublicDashboard />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl relative min-h-[calc(100vh-4rem)]">
      {/* Premium Background Orbs */}
      <div className="absolute top-0 right-10 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <motion.div
        key={role || "public"}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {renderDashboard()}
      </motion.div>
    </div>
  );
}
