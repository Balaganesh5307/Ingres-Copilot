"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Map, 
  MapPin, 
  MessageSquare, 
  Plus, 
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock
} from "lucide-react";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your groundwater intelligence metrics.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-border/50 bg-background/50 backdrop-blur-sm">
            <TrendingUp className="w-4 h-4 mr-2" /> View Reports
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]">
            <Plus className="w-4 h-4 mr-2" /> New Analysis
          </Button>
        </div>
      </div>

      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        {[
          { title: "Total Reports", value: "1,248", change: "+12% from last month", icon: <FileText className="w-4 h-4 text-cyan-400" /> },
          { title: "States Covered", value: "24", change: "Across the nation", icon: <Map className="w-4 h-4 text-blue-400" /> },
          { title: "Districts Covered", value: "412", change: "+5 new this week", icon: <MapPin className="w-4 h-4 text-indigo-400" /> },
          { title: "Queries Processed", value: "8,921", change: "+24% from last month", icon: <MessageSquare className="w-4 h-4 text-purple-400" /> }
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="glass-card border-border/40 hover:border-primary/30 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                  {stat.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="lg:col-span-2">
          <Card className="glass-card border-border/40 h-full">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { icon: <AlertTriangle className="text-destructive w-5 h-5" />, title: "Critical Depletion Alert", desc: "Aquifer level dropped below threshold in District 4.", time: "2 hours ago" },
                  { icon: <CheckCircle2 className="text-emerald-400 w-5 h-5" />, title: "Model Retraining Complete", desc: "Predictive model for Northern Region updated successfully.", time: "5 hours ago" },
                  { icon: <Clock className="text-blue-400 w-5 h-5" />, title: "Automated Report Generated", desc: "Weekly summary for State Water Board is ready.", time: "1 day ago" },
                  { icon: <MessageSquare className="text-purple-400 w-5 h-5" />, title: "AI Assistant Query", desc: "User 'j.doe' queried historical recharge rates for District 12.", time: "2 days ago" },
                ].map((item, i) => (
                  <motion.div key={i} variants={itemVariants} className="flex items-start gap-4">
                    <div className="mt-0.5 p-2 rounded-full bg-background border border-border/50">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <Card className="glass-card border-border/40 h-full">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {[
                { title: "Ask AI Assistant", href: "/assistant", desc: "Query data using natural language" },
                { title: "View Analytics", href: "/analytics", desc: "Explore charts and rankings" },
                { title: "Generate Report", href: "#", desc: "Create a PDF summary" },
                { title: "Manage Alerts", href: "#", desc: "Configure threshold notifications" }
              ].map((action, i) => (
                <Link key={i} href={action.href}>
                  <motion.div variants={itemVariants} className="p-4 rounded-lg border border-border/40 bg-background/30 hover:bg-primary/10 hover:border-primary/30 transition-all group cursor-pointer">
                    <p className="font-medium text-sm group-hover:text-primary transition-colors">{action.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{action.desc}</p>
                  </motion.div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
