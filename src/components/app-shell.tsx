import { type ReactNode, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, FileText, Target, Briefcase, MessagesSquare,
  Mail, GraduationCap, ClipboardList, BarChart3, Settings, LogOut,
  Sparkles, Search, Bell, Menu, X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { toast } from "sonner";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/resumes", label: "Resume Architect", icon: FileText },
  { to: "/career-match", label: "Career Match", icon: Target },
  { to: "/jobs", label: "Job Discovery", icon: Briefcase },
  { to: "/interview", label: "Interview Coach", icon: MessagesSquare },
  { to: "/cover-letter", label: "Cover Letter", icon: Mail },
  { to: "/skills", label: "Skill Academy", icon: GraduationCap },
  { to: "/applications", label: "Application Tracker", icon: ClipboardList },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  }

  const initials = (user?.user_metadata?.full_name as string | undefined)?.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase()
    || user?.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 inset-y-0 z-40 w-64 shrink-0 h-screen p-3 transition-transform md:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="glass-strong h-full rounded-2xl flex flex-col p-3">
          <div className="flex items-center justify-between px-2 py-2">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl nova-gradient grid place-items-center shadow-[0_0_24px_oklch(0.68_0.22_290/0.5)]">
                <Sparkles className="size-4 text-white" />
              </div>
              <span className="font-semibold tracking-tight">NOVA<span className="text-muted-foreground">.ai</span></span>
            </Link>
            <button className="md:hidden p-1.5 rounded-md hover:bg-white/5" onClick={() => setMobileOpen(false)}>
              <X className="size-4" />
            </button>
          </div>

          <nav className="mt-3 space-y-0.5 flex-1 overflow-y-auto">
            {NAV.map((item) => {
              const active = pathname === item.to || (item.to !== "/dashboard" && pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition group ${
                    active ? "bg-white/8 text-foreground shadow-[0_0_0_1px_oklch(1_0_0/0.08)]" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <item.icon className={`size-4 ${active ? "text-[var(--nova-violet)]" : ""}`} />
                  {item.label}
                  {active && <span className="ml-auto size-1.5 rounded-full bg-[var(--nova-violet)] shadow-[0_0_8px_var(--nova-violet)]" />}
                </Link>
              );
            })}
          </nav>

          <button onClick={signOut} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-white/5">
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-background/40 border-b border-border/60">
          <div className="flex items-center gap-3 px-4 md:px-8 h-16">
            <button className="md:hidden p-2 rounded-md hover:bg-white/5" onClick={() => setMobileOpen(true)}>
              <Menu className="size-5" />
            </button>
            <div className="flex-1 max-w-md relative">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search resumes, jobs, skills…"
                className="w-full glass rounded-full pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground/70 outline-none focus:ring-2 focus:ring-[var(--nova-violet)]/40"
              />
            </div>
            <button className="relative p-2 rounded-full glass hover:bg-white/8">
              <Bell className="size-4" />
              <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-[var(--nova-pink)]" />
            </button>
            <button className="hidden sm:inline-flex items-center gap-2 nova-gradient text-white rounded-full px-3.5 py-1.5 text-xs font-medium shadow-[0_8px_24px_-8px_oklch(0.68_0.22_290/0.7)]">
              <Sparkles className="size-3.5" />
              Ask NOVA
            </button>
            <div className="size-9 rounded-full nova-gradient grid place-items-center text-white text-sm font-semibold ring-2 ring-background">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
