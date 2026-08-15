import Link from "next/link";
import { Activity } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95 mt-auto">
      <div className="container mx-auto px-4 py-8 md:py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 group">
          <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center border border-primary/50">
            <Activity className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="font-semibold text-sm text-foreground">
            Ingres Copilot
          </span>
        </div>
        
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
          <Link href="#" className="hover:text-primary transition-colors">Contact</Link>
        </div>

        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Ingres Copilot. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
