"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, MapPin, Droplet, AlertTriangle, FileText, Loader2, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function GovDashboard() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showBrief, setShowBrief] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowBrief(true);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-emerald-400">Government Oversight</h2>
          <p className="text-muted-foreground text-sm">Policy tracking and nationwide status alerts.</p>
        </div>
        <Button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] min-w-[200px]"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
          {isGenerating ? "Compiling Data..." : "Download Policy Brief"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "Critical Zones", value: "112", icon: AlertTriangle, color: "text-red-400" },
          { title: "Districts Monitored", value: "363", icon: MapPin, color: "text-blue-400" },
          { title: "Avg Extraction Rate", value: "62%", icon: Droplet, color: "text-cyan-400" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">{s.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="glass-card border-l-4 border-l-emerald-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" /> Action Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">3 states have reported Stage of Extraction above 80%. A review of groundwater recharge policies in these regions is highly recommended.</p>
        </CardContent>
      </Card>

      {/* Policy Brief Modal Overlay */}
      {showBrief && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={() => setShowBrief(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-3xl glass-card rounded-2xl border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.15)] overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-white/10 bg-emerald-500/10 flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2 text-emerald-400">
                <FileText className="w-5 h-5" />
                National Groundwater Policy Brief (Aug 2026)
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowBrief(false)} className="h-8 w-8 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto">
              <div className="space-y-6 text-sm text-foreground/80 leading-relaxed">
                <div>
                  <h4 className="text-emerald-300 font-semibold mb-2 uppercase tracking-wide text-xs">Executive Summary</h4>
                  <p>
                    The national stage of extraction has reached critical thresholds in 3 primary agricultural states. 
                    Immediate policy interventions are recommended to stabilize aquifer levels before the dry season.
                  </p>
                </div>
                <div>
                  <h4 className="text-emerald-300 font-semibold mb-2 uppercase tracking-wide text-xs">High-Risk Zones Identified</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong className="text-foreground">North-Western Aquifer Block:</strong> Extraction rate at 114% of annual recharge.</li>
                    <li><strong className="text-foreground">Southern Peninsular Shield:</strong> Significant reduction in deep aquifer yields; 42 blocks re-classified as over-exploited.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-emerald-300 font-semibold mb-2 uppercase tracking-wide text-xs">Recommended Actions</h4>
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                    <ol className="list-decimal pl-4 space-y-2">
                      <li>Enforce strict metering for industrial extraction in all 112 critical zones.</li>
                      <li>Initiate immediate managed aquifer recharge (MAR) pilot programs in the southern shield.</li>
                      <li>Subsidize micro-irrigation transitions for water-intensive cash crops.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-white/10 bg-background/50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowBrief(false)} className="border-white/10 hover:bg-white/5">
                Close Preview
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <Download className="w-4 h-4 mr-2" /> Save PDF Report
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
