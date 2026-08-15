"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Info, ArrowRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const legendItems = [
  { label: "Safe", color: "bg-emerald-500", desc: "Extraction < 70%" },
  { label: "Semi-Critical", color: "bg-yellow-500", desc: "Extraction 70-90%" },
  { label: "Critical", color: "bg-orange-500", desc: "Extraction 90-100%" },
  { label: "Over-Exploited", color: "bg-red-500", desc: "Extraction > 100%" },
];

const mockDistricts = [
  { name: "Fresno", status: "Critical", level: "-2.4m", trend: "Down" },
  { name: "Kern", status: "Over-Exploited", level: "-3.1m", trend: "Down" },
  { name: "Tulare", status: "Critical", level: "-1.9m", trend: "Stable" },
  { name: "Kings", status: "Semi-Critical", level: "-0.8m", trend: "Up" },
];

export default function MapPage() {
  const [selectedState, setSelectedState] = useState("California");

  return (
    <div className="flex flex-col h-full p-4 gap-4 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interactive Map</h1>
          <p className="text-muted-foreground mt-1">Geospatial analysis of groundwater extraction and health.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1 min-h-0">
        
        {/* Left Panel: State Selection */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 flex flex-col gap-4"
        >
          <Card className="glass-card border-border/40 flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Regions</CardTitle>
              <CardDescription>Select a state to view details</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
              <ScrollArea className="h-full px-4 pb-4">
                <div className="space-y-2">
                  {["California", "Texas", "Arizona", "Colorado", "Nevada", "New Mexico", "Utah"].map((state) => (
                    <Button 
                      key={state}
                      variant={selectedState === state ? "default" : "ghost"}
                      className={`w-full justify-start ${selectedState === state ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.3)]" : "hover:bg-primary/10"}`}
                      onClick={() => setSelectedState(state)}
                    >
                      <MapPin className="w-4 h-4 mr-2 opacity-70" /> {state}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

        {/* Center Panel: The Map */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 flex flex-col gap-4"
        >
          <Card className="glass-card border-border/40 flex-1 relative overflow-hidden flex flex-col items-center justify-center p-8 group cursor-crosshair">
            <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/India_outline_map.svg/800px-India_outline_map.svg.png')] bg-contain bg-center bg-no-repeat opacity-20 filter invert group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            
            <div className="relative z-10 text-center p-6 rounded-2xl bg-background/60 backdrop-blur-md border border-border/50 shadow-xl">
              <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Interactive Map Layer</h3>
              <p className="text-sm text-muted-foreground max-w-sm mb-4">
                Real geospatial rendering via Leaflet is pending backend integration. Showing placeholder for {selectedState}.
              </p>
              <Button variant="outline" className="bg-background/50 border-primary/50 text-primary">
                Preview Data Points
              </Button>
            </div>

            {/* Legend inside map view */}
            <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-background/80 backdrop-blur-md border border-border/50">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Groundwater Status Legend</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {legendItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${item.color} shadow-[0_0_8px_currentColor]`} />
                    <div>
                      <div className="text-xs font-medium">{item.label}</div>
                      <div className="text-[10px] text-muted-foreground">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Right Panel: District Details */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 flex flex-col gap-4"
        >
          <Card className="glass-card border-border/40 flex-1 flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                {selectedState} Details <Info className="w-4 h-4 text-muted-foreground" />
              </CardTitle>
              <CardDescription>District-level health metrics</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
              <ScrollArea className="h-full px-4 pb-4">
                <div className="space-y-3">
                  {mockDistricts.map((dist, i) => (
                    <div key={i} className="p-3 rounded-lg border border-border/40 bg-background/30 hover:bg-primary/5 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold">{dist.name}</span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          dist.status === 'Critical' ? 'bg-orange-500/20 text-orange-400' :
                          dist.status === 'Over-Exploited' ? 'bg-red-500/20 text-red-400' :
                          dist.status === 'Semi-Critical' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {dist.status}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Water Level</span>
                        <span className="font-medium text-foreground">{dist.level}</span>
                      </div>
                      <Button variant="link" className="px-0 h-auto text-xs text-primary mt-2">
                        View full report <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
