"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { Filter, Loader2, Database } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function AnalyticsPage() {
  const [selectedYear, setSelectedYear] = useState<string>("2023");
  const [selectedState, setSelectedState] = useState<string>("all");
  
  const [summary, setSummary] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [stateRankings, setStateRankings] = useState<any[]>([]);
  const [districtRankings, setDistrictRankings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [sumRes, trndRes, srRes, drRes] = await Promise.all([
          fetch('/api/v1/analytics/summary'),
          fetch(`/api/v1/analytics/trends?state=${selectedState}`),
          fetch(`/api/v1/analytics/rankings?level=state&year=${selectedYear}`),
          fetch(`/api/v1/analytics/rankings?level=district&year=${selectedYear}`)
        ]);

        if (sumRes.ok) setSummary(await sumRes.json());
        if (trndRes.ok) {
          const t = await trndRes.json();
          setTrends(t.trends || []);
        }
        if (srRes.ok) {
          const sr = await srRes.json();
          setStateRankings(sr.data || []);
        }
        if (drRes.ok) {
          const dr = await drRes.json();
          setDistrictRankings(dr.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch analytics", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedYear, selectedState]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Deep dive into groundwater metrics and geographical rankings.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-background/50 p-2 rounded-lg border border-border/40 backdrop-blur-md">
          <Filter className="w-4 h-4 text-muted-foreground ml-2" />
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px] bg-transparent border-0 focus:ring-0">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
              <SelectItem value="2021">2021</SelectItem>
              <SelectItem value="2020">2020</SelectItem>
              <SelectItem value="2019">2019</SelectItem>
            </SelectContent>
          </Select>
          <div className="w-px h-6 bg-border/50" />
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="w-[170px] bg-transparent border-0 focus:ring-0">
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              <SelectItem value="Arunachal Pradesh">Arunachal Pradesh</SelectItem>
              <SelectItem value="Assam">Assam</SelectItem>
              <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
              {/* Added a few real states from the DB */}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="h-[400px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={itemVariants}>
              <Card className="glass-card border-border/40 h-[400px] flex flex-col">
                <CardHeader>
                  <CardTitle>Groundwater Resource Trends</CardTitle>
                  <CardDescription>Historical Extractable BCM (Data from official CGWB sources)</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 relative">
                  {trends.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                      <Database className="w-12 h-12 mb-3 opacity-20" />
                      <p>Insufficient historical data for {selectedState === 'all' ? 'this metric' : selectedState}</p>
                    </div>
                  ) : trends.length === 1 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                      <Database className="w-12 h-12 mb-3 opacity-20" />
                      <p>Only a single data point ({trends[0].year}) exists. Not enough for a trend.</p>
                      <p className="font-semibold text-primary mt-2">Value: {trends[0].extractable_bcm?.toFixed(2) || 'N/A'} BCM</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRecharge" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                        <XAxis dataKey="year" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#ffffff20', borderRadius: '8px' }}
                          itemStyle={{ color: '#06b6d4' }}
                        />
                        <Area type="monotone" dataKey="extractable_bcm" name="Extractable BCM" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorRecharge)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="glass-card border-border/40 h-[400px] flex flex-col">
                <CardHeader>
                  <CardTitle>Extraction vs Recharge</CardTitle>
                  <CardDescription>Comparative analysis</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 relative">
                  {/* Since the user's data does not contain Extraction or Recharge, we display the graceful degradation note */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-background/5 rounded-lg border border-dashed border-border/40 m-4 text-center p-6">
                    <Database className="w-12 h-12 mb-3 opacity-20" />
                    <p className="font-medium text-foreground mb-1">Metric unavailable for this region</p>
                    <p className="text-sm">The ingested documents (Phase 4) do not contain structured 'annualRecharge' or 'annualExtraction' fields for the selected dataset.</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div variants={itemVariants}>
              <Card className="glass-card border-border/40">
                <CardHeader>
                  <CardTitle>State Health Rankings ({selectedYear})</CardTitle>
                  <CardDescription>Ranked by Extractable BCM Capacity</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50 hover:bg-transparent">
                        <TableHead className="w-[100px]">Rank</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>Extractable (BCM)</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stateRankings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                            No state data available for {selectedYear}
                          </TableCell>
                        </TableRow>
                      ) : stateRankings.map((row) => (
                        <TableRow key={row.rank} className="border-border/20 hover:bg-primary/5">
                          <TableCell className="font-medium text-muted-foreground">#{row.rank}</TableCell>
                          <TableCell className="font-semibold">{row.state}</TableCell>
                          <TableCell>{row.extractable_bcm.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              row.status === 'Critical' ? 'bg-destructive/20 text-red-400' :
                              row.status === 'Warning' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-emerald-500/20 text-emerald-400'
                            }`}>
                              {row.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="glass-card border-border/40">
                <CardHeader>
                  <CardTitle>Most Affected Districts ({selectedYear})</CardTitle>
                  <CardDescription>Regions with highest % of wells showing deep drops ({'>'}20m)</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50 hover:bg-transparent">
                        <TableHead>District</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>Risk Score</TableHead>
                        <TableHead className="text-right">Risk Level</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {districtRankings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                            No district data available for {selectedYear}
                          </TableCell>
                        </TableRow>
                      ) : districtRankings.map((row) => (
                        <TableRow key={row.rank} className="border-border/20 hover:bg-primary/5">
                          <TableCell className="font-semibold">{row.district}</TableCell>
                          <TableCell className="text-muted-foreground">{row.state || 'N/A'}</TableCell>
                          <TableCell className="text-destructive font-mono">{row.risk_score.toFixed(1)}</TableCell>
                          <TableCell className="text-right">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              row.risk_level === 'Extreme' ? 'bg-purple-500/20 text-purple-400' :
                              row.risk_level === 'High' ? 'bg-destructive/20 text-red-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {row.risk_level}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          </div>

        </motion.div>
      )}
    </div>
  );
}
