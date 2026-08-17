"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Loader2, Users, Search, ShieldCheck, Settings, LogIn } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { login: contextLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState("");

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || "Login failed");
      }
      
      contextLogin(data.access_token, {
        id: data.user_id,
        name: "", 
        email,
        role: data.role
      });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = async (role: string) => {
    setDemoLoading(role);
    setError("");
    
    let demoEmail = "";
    if (role === "Public") demoEmail = "public@demo.com";
    if (role === "Researcher") demoEmail = "researcher@demo.com";
    if (role === "Government Officer") demoEmail = "gov@demo.com";
    if (role === "Admin") demoEmail = "admin@demo.com";

    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: demoEmail, password: "demo" })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");
      
      contextLogin(data.access_token, {
        id: data.user_id,
        name: "", 
        email: demoEmail,
        role: data.role
      });
    } catch {
      setError("Failed to load demo account. Ensure seed_demo_users.py was run.");
      setDemoLoading("");
    }
  };

  const demoAccounts = [
    { name: "Public", role: "Public", icon: Users, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/30" },
    { name: "Researcher", role: "Researcher", icon: Search, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/30" },
    { name: "Gov Officer", role: "Government Officer", icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/30" },
    { name: "Admin", role: "Admin", icon: Settings, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/30" },
  ];

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", type: "spring" }}
        className="w-full max-w-5xl z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch"
      >
        <Card className="glass-card border-border/50 flex flex-col justify-center">
          <CardHeader className="space-y-4 pb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/50 shadow-[0_0_20px_rgba(var(--primary),0.3)]">
              <Activity className="w-7 h-7 text-primary" />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold tracking-tight gradient-text">Sign in to Ingres Copilot</CardTitle>
              <CardDescription className="text-muted-foreground mt-2 text-base">
                Secure access to the national groundwater intelligence platform.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground/80">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="agent@gov.water.org" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-background/50 border-border/50 focus-visible:ring-primary/50 text-base"
                  disabled={isLoading || !!demoLoading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground/80">Password</Label>
                  <Link href="#" className="text-xs text-primary hover:underline transition-all">
                    Forgot password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-background/50 border-border/50 focus-visible:ring-primary/50 text-base"
                  disabled={isLoading || !!demoLoading}
                />
              </div>
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-md border border-destructive/20"
                >
                  {error}
                </motion.div>
              )}

              <Button type="submit" className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 mt-2 shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all" disabled={isLoading || !!demoLoading}>
                {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <LogIn className="w-5 h-5 mr-2" />}
                {isLoading ? "Authenticating..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border/20 pt-6 mt-auto">
            <p className="text-sm text-muted-foreground">
              Need access?{" "}
              <Link href="/register" className="text-primary hover:underline font-semibold transition-all">
                Request an account
              </Link>
            </p>
          </CardFooter>
        </Card>

        <Card className="glass-card border-border/50 bg-background/20 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
          <CardHeader>
            <CardTitle className="text-xl">Quick Demo Access</CardTitle>
            <CardDescription>
              Instantly explore the platform using role-based demo accounts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                const isThisLoading = demoLoading === acc.role;
                return (
                  <Button
                    key={acc.role}
                    type="button"
                    variant="outline"
                    onClick={() => handleDemoAccess(acc.role)}
                    disabled={isLoading || !!demoLoading}
                    className={`h-auto flex flex-col items-center justify-center p-6 gap-3 border transition-all duration-300 hover:scale-[1.02] ${acc.bg} ${acc.border} hover:shadow-lg`}
                  >
                    {isThisLoading ? (
                      <Loader2 className={`w-8 h-8 animate-spin ${acc.color}`} />
                    ) : (
                      <Icon className={`w-8 h-8 ${acc.color}`} />
                    )}
                    <div className="text-center">
                      <div className="font-semibold text-foreground">{acc.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">View Dashboard</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
