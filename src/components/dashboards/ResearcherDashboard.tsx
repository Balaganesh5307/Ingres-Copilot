"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Library, FileLineChart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ResearcherDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-purple-400">Research & Analytics</h2>
          <p className="text-muted-foreground text-sm">Deep dive into aquifer models and historical data.</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]">
          New Workspace
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Library className="w-5 h-5 text-purple-400" /> Recent Citations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "GWRA-2025 pg. 142 - Tamil Nadu Trends",
                "Aquifer Mapping Report - NW India",
                "Historical Depletion Rates 2010-2020"
              ].map((c, i) => (
                <div key={i} className="text-sm p-3 rounded bg-purple-500/10 text-purple-200 border border-purple-500/20">
                  {c}
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Card className="glass-card h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" /> AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The AI Copilot has identified a strong correlation between monsoon deficits in Q3 and an accelerated extraction rate in the southern peninsula.
              </p>
              <Button variant="outline" className="mt-4 w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
                <FileLineChart className="w-4 h-4 mr-2" /> View Detailed Correlation
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
