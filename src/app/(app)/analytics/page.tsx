"use client";

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
import { Filter } from "lucide-react";

// Mock Data
const rechargeData = [
  { month: "Jan", recharge: 4000, extraction: 2400 },
  { month: "Feb", recharge: 3000, extraction: 1398 },
  { month: "Mar", recharge: 2000, extraction: 9800 },
  { month: "Apr", recharge: 2780, extraction: 3908 },
  { month: "May", recharge: 1890, extraction: 4800 },
  { month: "Jun", recharge: 2390, extraction: 3800 },
  { month: "Jul", recharge: 3490, extraction: 4300 },
];

const stateRankingData = [
  { rank: 1, state: "California", healthIndex: 82.5, status: "Critical" },
  { rank: 2, state: "Texas", healthIndex: 78.1, status: "Warning" },
  { rank: 3, state: "Colorado", healthIndex: 65.4, status: "Stable" },
  { rank: 4, state: "Arizona", healthIndex: 45.2, status: "Critical" },
];

const districtRankingData = [
  { rank: 1, district: "Fresno", state: "CA", levelDrop: "-2.4m", risk: "High" },
  { rank: 2, district: "Kern", state: "CA", levelDrop: "-2.1m", risk: "High" },
  { rank: 3, district: "Lubbock", state: "TX", levelDrop: "-1.8m", risk: "Medium" },
  { rank: 4, district: "Pinal", state: "AZ", levelDrop: "-3.2m", risk: "Extreme" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function AnalyticsPage() {
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
          <Select defaultValue="2024">
            <SelectTrigger className="w-[120px] bg-transparent border-0 focus:ring-0">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2022">2022</SelectItem>
            </SelectContent>
          </Select>
          <div className="w-px h-6 bg-border/50" />
          <Select defaultValue="all">
            <SelectTrigger className="w-[150px] bg-transparent border-0 focus:ring-0">
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              <SelectItem value="ca">California</SelectItem>
              <SelectItem value="tx">Texas</SelectItem>
              <SelectItem value="az">Arizona</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        
        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
            <Card className="glass-card border-border/40 h-[400px] flex flex-col">
              <CardHeader>
                <CardTitle>Groundwater Recharge Trends</CardTitle>
                <CardDescription>Monthly aquifer recharge volume (cubic meters x 1000)</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={rechargeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRecharge" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                    <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#ffffff20', borderRadius: '8px' }}
                      itemStyle={{ color: '#06b6d4' }}
                    />
                    <Area type="monotone" dataKey="recharge" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorRecharge)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="glass-card border-border/40 h-[400px] flex flex-col">
              <CardHeader>
                <CardTitle>Extraction vs Recharge</CardTitle>
                <CardDescription>Comparative analysis across regions</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rechargeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                    <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#ffffff20', borderRadius: '8px' }}
                      cursor={{ fill: '#ffffff05' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                    <Bar dataKey="extraction" name="Extraction" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="recharge" name="Recharge" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
            <Card className="glass-card border-border/40">
              <CardHeader>
                <CardTitle>State Health Rankings</CardTitle>
                <CardDescription>Aggregated groundwater index by state</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="w-[100px]">Rank</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Index (0-100)</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stateRankingData.map((row) => (
                      <TableRow key={row.rank} className="border-border/20 hover:bg-primary/5">
                        <TableCell className="font-medium text-muted-foreground">#{row.rank}</TableCell>
                        <TableCell className="font-semibold">{row.state}</TableCell>
                        <TableCell>{row.healthIndex}</TableCell>
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
                <CardTitle>Most Affected Districts</CardTitle>
                <CardDescription>Regions with highest depletion alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead>District</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Level Drop</TableHead>
                      <TableHead className="text-right">Risk Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {districtRankingData.map((row) => (
                      <TableRow key={row.district} className="border-border/20 hover:bg-primary/5">
                        <TableCell className="font-semibold">{row.district}</TableCell>
                        <TableCell className="text-muted-foreground">{row.state}</TableCell>
                        <TableCell className="text-destructive">{row.levelDrop}</TableCell>
                        <TableCell className="text-right">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            row.risk === 'Extreme' ? 'bg-purple-500/20 text-purple-400' :
                            row.risk === 'High' ? 'bg-destructive/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {row.risk}
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
    </div>
  );
}
