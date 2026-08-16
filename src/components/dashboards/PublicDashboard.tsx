"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Map, Bot, ArrowRight, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export function PublicDashboard() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-4xl font-bold gradient-text">Welcome to Ingres Copilot</h2>
        <p className="text-muted-foreground">
          Explore the state of groundwater across India through interactive maps, AI-driven insights, and detailed analytics.
        </p>
        
        {!isAuthenticated && (
          <div className="pt-4 flex justify-center gap-4">
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary/90">
                <UserPlus className="w-4 h-4 mr-2" /> Request Account
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card h-full hover:border-blue-400/50 transition-colors cursor-pointer group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="w-6 h-6 text-blue-400" /> Interactive Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                View the 2025 Groundwater Resource Assessment data spatially. Check district-wise categories from Over-Exploited to Safe.
              </p>
              <Link href="/map">
                <Button variant="ghost" className="group-hover:text-blue-400 p-0 hover:bg-transparent">
                  Explore Map <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card h-full hover:border-purple-400/50 transition-colors cursor-pointer group">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-6 h-6 text-purple-400" /> AI Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Ask questions in natural language about groundwater policies, depletion rates, and historical statistics.
              </p>
              <Link href="/assistant">
                <Button variant="ghost" className="group-hover:text-purple-400 p-0 hover:bg-transparent">
                  Chat Now <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
