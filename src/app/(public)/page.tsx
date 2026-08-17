"use client";

import { motion, Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowRight, 
  Droplets, 
  Map, 
  BarChart3, 
  ShieldCheck, 
  Database,
  Cpu
} from "lucide-react";
import Link from "next/link";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-4 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8"
          >
            <ShieldCheck className="w-4 h-4" />
            Government-Grade Intelligence
          </motion.div>
          
          <motion.h1 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8"
          >
            AI Groundwater <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-primary to-cyan-300 bg-clip-text text-transparent">
              Intelligence Assistant
            </span>
          </motion.h1>
          
          <motion.p 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Unleash the power of predictive models and real-time geospatial data to monitor, analyze, and secure critical groundwater resources with unprecedented accuracy.
          </motion.p>
          
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.4)] transition-all hover:scale-105">
                Start Monitoring <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#architecture">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-14 px-8 border-border hover:bg-black/5">
                View Architecture
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-background/50 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Capabilities</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built for hydrologists and decision-makers, Ingres Copilot combines spatial analytics with advanced machine learning.
            </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: <Droplets className="w-8 h-8 text-cyan-400" />,
                title: "Aquifer Modeling",
                desc: "Predictive 3D models of underground aquifers with dynamic recharge rates."
              },
              {
                icon: <Map className="w-8 h-8 text-blue-400" />,
                title: "Geospatial Mapping",
                desc: "Real-time GIS integration for monitoring well levels and extraction points."
              },
              {
                icon: <BarChart3 className="w-8 h-8 text-indigo-400" />,
                title: "Risk Analytics",
                desc: "Automated alerts for over-extraction, contamination, and drought risks."
              }
            ].map((feature, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Card className="glass-card p-8 h-full border-border/50 hover:border-primary/50 transition-colors group">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="py-24 relative z-10 border-t border-border/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="flex flex-col md:flex-row gap-12 items-center"
          >
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Secure AI Infrastructure</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Ingres Copilot is built on a compliant, scalable architecture designed to handle massive datasets securely.
              </p>
              <ul className="space-y-4">
                {[
                  { icon: <Database />, text: "Distributed Data Lake for IoT sensors" },
                  { icon: <Cpu />, text: "Edge computing for real-time anomaly detection" },
                  { icon: <ShieldCheck />, text: "End-to-end encryption (FIPS 140-2 compliant)" }
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground font-medium">
                    <div className="text-primary">{item.icon}</div>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full">
              <div className="aspect-square relative rounded-2xl overflow-hidden glass-card flex items-center justify-center border-border/40 p-8">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50" />
                <div className="relative z-10 w-full h-full border border-primary/20 rounded-xl bg-background/50 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-muted-foreground text-sm font-mono">[ Architecture Diagram Placeholder ]</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="container mx-auto px-4 text-center relative z-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to secure your water future?</h2>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join leading environmental agencies relying on Ingres Copilot.
            </p>
            <Link href="/register">
              <Button size="lg" className="h-16 px-10 text-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-transform hover:scale-105 shadow-xl">
                Deploy Copilot Today
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
