"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, FileText, Server, ShieldAlert, CheckCircle2, MoreHorizontal } from "lucide-react";

const mockUsers = [
  { id: "U-1029", name: "Agent Smith", email: "smith@gov.water.org", role: "Admin", status: "Active" },
  { id: "U-1030", name: "Dr. Jane Doe", email: "j.doe@hydrology.institute", role: "Analyst", status: "Active" },
  { id: "U-1031", name: "John Davis", email: "jdavis@ca.water.gov", role: "Viewer", status: "Pending" },
  { id: "U-1032", name: "Sarah Connor", email: "s.connor@epa.gov", role: "Analyst", status: "Suspended" },
];

const mockDocs = [
  { id: "DOC-992", name: "Q3_California_Aquifer_Report.pdf", uploader: "Agent Smith", date: "2024-10-12", status: "Processed" },
  { id: "DOC-993", name: "Texas_Drought_Analysis_2023.pdf", uploader: "Dr. Jane Doe", date: "2024-10-14", status: "Processing" },
  { id: "DOC-994", name: "AZ_Pinal_Extraction_Logs.csv", uploader: "System API", date: "2024-10-15", status: "Failed" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Admin Setup</h1>
        <p className="text-muted-foreground mt-1">Manage users, documents, and system health.</p>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
        
        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Total Users", value: "1,204", icon: <Users className="w-5 h-5 text-blue-400" />, desc: "+12 pending approvals" },
            { title: "Documents Processed", value: "8,492", icon: <FileText className="w-5 h-5 text-emerald-400" />, desc: "99.8% success rate" },
            { title: "System Health", value: "Optimal", icon: <Server className="w-5 h-5 text-primary" />, desc: "All APIs operational" },
          ].map((stat, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card className="glass-card border-border/40">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <div className="p-2 bg-background rounded-md border border-border/50">{stat.icon}</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* User Management Table */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card border-border/40">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Review and manage platform access</CardDescription>
              </div>
              <Button size="sm" className="bg-primary hover:bg-primary/90">Invite User</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead>User ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((user) => (
                    <TableRow key={user.id} className="border-border/20 hover:bg-primary/5">
                      <TableCell className="font-mono text-xs text-muted-foreground">{user.id}</TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                          user.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' :
                          user.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-destructive/20 text-red-400'
                        }`}>
                          {user.status === 'Active' && <CheckCircle2 className="w-3 h-3" />}
                          {user.status === 'Pending' && <ShieldAlert className="w-3 h-3" />}
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        {/* Document Management Table */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card border-border/40">
            <CardHeader>
              <CardTitle>Document Ingestion Logs</CardTitle>
              <CardDescription>Track the status of AI document parsing</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead>Doc ID</TableHead>
                    <TableHead>Filename</TableHead>
                    <TableHead>Uploader</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockDocs.map((doc) => (
                    <TableRow key={doc.id} className="border-border/20 hover:bg-primary/5">
                      <TableCell className="font-mono text-xs text-muted-foreground">{doc.id}</TableCell>
                      <TableCell className="font-medium text-primary hover:underline cursor-pointer">{doc.name}</TableCell>
                      <TableCell className="text-muted-foreground">{doc.uploader}</TableCell>
                      <TableCell className="text-muted-foreground">{doc.date}</TableCell>
                      <TableCell className="text-right">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          doc.status === 'Processed' ? 'text-emerald-400 border border-emerald-500/30 bg-emerald-500/10' :
                          doc.status === 'Processing' ? 'text-blue-400 border border-blue-500/30 bg-blue-500/10 animate-pulse' :
                          'text-red-400 border border-red-500/30 bg-red-500/10'
                        }`}>
                          {doc.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

      </motion.div>
    </div>
  );
}
