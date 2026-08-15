import { Sidebar } from "@/components/Sidebar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-full flex relative">
      <Sidebar />
      <main className="flex-1 flex flex-col relative overflow-hidden ml-64 min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none -z-10" />
        {children}
      </main>
    </div>
  );
}
