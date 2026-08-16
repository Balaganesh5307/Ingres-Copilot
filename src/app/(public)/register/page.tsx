"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { login: contextLogin } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    agency: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.password || !formData.agency) {
      setError("Please fill in all fields.");
      return;
    }
    
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || "Registration failed");
      }
      
      contextLogin(data.access_token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] items-center justify-center p-4 relative py-12">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg z-10"
      >
        <Card className="glass-card border-border/50">
          <CardHeader className="space-y-4 items-center text-center pb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/50">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold tracking-tight">Request Access</CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                Apply for secure access to the Ingres Copilot platform.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Jane Doe" 
                    value={formData.name}
                    onChange={handleChange}
                    className="bg-background/50 border-border/50 focus-visible:ring-primary/50"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="agency">Agency / Organization</Label>
                  <Input 
                    id="agency" 
                    placeholder="Dept of Water Resources" 
                    value={formData.agency}
                    onChange={handleChange}
                    className="bg-background/50 border-border/50 focus-visible:ring-primary/50"
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Official Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="agent@gov.water.org" 
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-background/50 border-border/50 focus-visible:ring-primary/50"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-background/50 border-border/50 focus-visible:ring-primary/50"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground mt-1">Must be at least 8 characters.</p>
              </div>
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-sm text-destructive font-medium"
                >
                  {error}
                </motion.div>
              )}

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-2" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {isLoading ? "Submitting Request..." : "Submit Access Request"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border/20 pt-6">
            <p className="text-sm text-muted-foreground">
              Already have access?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
