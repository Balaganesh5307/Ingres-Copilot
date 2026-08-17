"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Server, ShieldAlert, CheckCircle2, MoreHorizontal, Shield, Loader2, Plus, X } from "lucide-react";

const initialUsers = [
  { id: "U-1001", name: "Demo Admin", email: "admin@demo.com", role: "Admin", status: "Active" },
  { id: "U-1002", name: "Demo Gov Officer", email: "gov@demo.com", role: "Government Officer", status: "Active" },
  { id: "U-1003", name: "Demo Researcher", email: "researcher@demo.com", role: "Researcher", status: "Active" },
  { id: "U-1004", name: "Demo Public", email: "public@demo.com", role: "Public", status: "Active" },
];

const mockDocs = [
  { id: "DOC-992", name: "Q3_California_Aquifer_Report.pdf", uploader: "Demo Admin", date: "2024-10-12", status: "Processed" },
  { id: "DOC-993", name: "Texas_Drought_Analysis_2023.pdf", uploader: "Demo Researcher", date: "2024-10-14", status: "Processing" },
  { id: "DOC-994", name: "AZ_Pinal_Extraction_Logs.csv", uploader: "System API", date: "2024-10-15", status: "Failed" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, type: "spring" as const } }
};

export default function AdminDashboardPage() {
  const [users, setUsers] = useState(initialUsers);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditComplete, setAuditComplete] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);

  // New User Form State
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("Researcher");

  const handleAudit = () => {
    setIsAuditing(true);
    setAuditComplete(false);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditComplete(true);
      setTimeout(() => setAuditComplete(false), 3000);
    }, 2000);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newRole) return;

    const newUser = {
      id: `U-${1000 + users.length + 1}`,
      name: newName,
      email: newEmail,
      role: newRole,
      status: "Active"
    };

    setUsers([newUser, ...users]);
    setShowAddUser(false);
    setNewName("");
    setNewEmail("");
    setNewRole("Researcher");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl relative min-h-[calc(100vh-4rem)]">
      {/* Background Glows */}
      <div className="absolute top-10 left-20 w-[400px] h-[400px] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-20 right-20 w-[300px] h-[300px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight gradient-text mb-2">Admin Control Center</h1>
          <p className="text-muted-foreground text-lg">Manage system access, document ingestion, and monitor platform health.</p>
        </div>
        <Button 
          onClick={handleAudit}
          disabled={isAuditing}
          className={`${auditComplete ? 'bg-emerald-500 hover:bg-emerald-600 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-primary hover:bg-primary/90 shadow-[0_0_15px_rgba(var(--primary),0.3)]'} text-primary-foreground h-11 px-6 rounded-xl font-semibold transition-all w-[180px]`}
        >
          {isAuditing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Auditing...</>
          ) : auditComplete ? (
            <><CheckCircle2 className="w-4 h-4 mr-2" /> Audit Passed</>
          ) : (
            <><Shield className="w-4 h-4 mr-2" /> Security Audit</>
          )}
        </Button>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
        
        {/* System Stats */}
        <div className="grid grid-cols-1 gap-6">
          {[
            { title: "Total Users", value: (1200 + users.length).toLocaleString(), icon: <Users className="w-6 h-6 text-blue-400" />, desc: "+12 pending approvals", color: "blue" },
            { title: "System Health", value: "Optimal", icon: <Server className="w-6 h-6 text-primary" />, desc: "All APIs operational", color: "primary" },
          ].map((stat, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card className="glass-card border-slate-200/60 shadow-lg relative overflow-hidden group">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/10 rounded-full blur-3xl group-hover:bg-${stat.color}-500/20 transition-colors duration-500`} />
                <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{stat.title}</CardTitle>
                  <div className={`p-2.5 rounded-xl bg-${stat.color}-500/10 border border-${stat.color}-500/20 shadow-[0_0_15px_rgba(var(--${stat.color}),0.15)] group-hover:scale-110 transition-transform duration-300`}>
                    {stat.icon}
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-4xl font-bold text-foreground tracking-tight">{stat.value}</div>
                  <p className="text-sm text-muted-foreground/80 mt-2 font-medium">{stat.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* User Management Table */}
          <motion.div variants={itemVariants} className="flex flex-col">
            <Card className="glass-card border-slate-200/60 shadow-xl h-full flex flex-col relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/20 pb-4 bg-primary/5">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2 text-primary">
                    <Users className="w-5 h-5" /> User Management
                  </CardTitle>
                  <CardDescription className="pt-1">Review and manage platform access limits</CardDescription>
                </div>
                <Button onClick={() => setShowAddUser(!showAddUser)} size="sm" className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 shadow-[0_0_10px_rgba(var(--primary),0.1)] rounded-lg relative z-10">
                  {showAddUser ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  {showAddUser ? "Cancel" : "Add User"}
                </Button>
              </CardHeader>
              <CardContent className="p-0 flex-1 relative flex flex-col">
                
                {/* Add User Dropdown Panel */}
                <AnimatePresence>
                  {showAddUser && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-b border-border/20 bg-black/5"
                    >
                      <form onSubmit={handleAddUser} className="p-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" required value={newName} onChange={e => setNewName(e.target.value)} placeholder="Jane Doe" className="bg-white border-slate-200/60 text-foreground" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="jane@example.com" className="bg-white border-slate-200/60 text-foreground" />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="role">System Role</Label>
                            <Select value={newRole} onValueChange={(val) => val && setNewRole(val)}>
                              <SelectTrigger className="bg-white border-slate-200/60 text-foreground w-full h-10">
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                              <SelectContent className="bg-white border-slate-200/60 text-foreground">
                                <SelectItem value="Admin">Admin</SelectItem>
                                <SelectItem value="Government Officer">Government Officer</SelectItem>
                                <SelectItem value="Researcher">Researcher</SelectItem>
                                <SelectItem value="Public">Public User</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex justify-end pt-2">
                          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.3)]">
                            Create User
                          </Button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="overflow-auto flex-1 max-h-[400px]">
                  <Table>
                    <TableHeader className="bg-black/5 sticky top-0 z-10 backdrop-blur-md">
                      <TableRow className="border-border/20 hover:bg-transparent">
                        <TableHead className="pl-6 font-semibold">User</TableHead>
                        <TableHead className="font-semibold">Role</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="text-right pr-6 font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {users.map((user) => (
                          <motion.tr 
                            key={user.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="border-border/20 hover:bg-black/5 transition-colors border-b"
                          >
                            <TableCell className="pl-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-semibold text-foreground/90">{user.name}</span>
                                <span className="text-xs text-muted-foreground">{user.email}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border ${
                                user.role === 'Admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                user.role === 'Government Officer' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                user.role === 'Researcher' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                'bg-neutral-500/10 text-neutral-400 border-neutral-500/20'
                              }`}>
                                {user.role}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold tracking-wider border shadow-sm ${
                                user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' :
                                user.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]' :
                                'bg-destructive/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                              }`}>
                                {user.status === 'Active' && <CheckCircle2 className="w-3.5 h-3.5" />}
                                {user.status === 'Pending' && <ShieldAlert className="w-3.5 h-3.5" />}
                                {user.status}
                              </span>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

      </motion.div>
    </div>
  );
}
