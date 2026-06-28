import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { FileText, Target, Briefcase, MessagesSquare, TrendingUp, ArrowUpRight, Sparkles, ClipboardList } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — NOVA AI" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const name = (user?.user_metadata?.full_name as string | undefined)?.split(" ")[0] ?? "there";

  const { data: resumes = [] } = useQuery({
    queryKey: ["resumes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("resumes").select("*").order("updated_at", { ascending: false }).limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["applications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("applications").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const topAts = resumes[0]?.ats_score ?? 0;
  const interviews = applications.filter((a) => a.status === "interview").length;
  const offers = applications.filter((a) => a.status === "offer").length;

  const stats = [
    { label: "Top ATS Score", value: topAts || "—", suffix: topAts ? "/100" : "", trend: "+12", icon: TrendingUp, accent: "from-[var(--nova-violet)] to-[var(--nova-blue)]" },
    { label: "Applications", value: applications.length, trend: `+${applications.length}`, icon: ClipboardList, accent: "from-[var(--nova-blue)] to-[var(--nova-cyan)]" },
    { label: "Interviews", value: interviews, trend: interviews ? "+1" : "—", icon: MessagesSquare, accent: "from-[var(--nova-violet)] to-[var(--nova-pink)]" },
    { label: "Offers", value: offers, trend: "—", icon: Target, accent: "from-[var(--nova-cyan)] to-[var(--nova-violet)]" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="text-3xl md:text-4xl font-semibold mt-1">Hey {name}, ready to <span className="nova-text">ship today</span>?</h1>
        </div>
        <Link to="/resumes" className="inline-flex items-center gap-2 nova-gradient text-white rounded-full px-4 py-2.5 text-sm font-medium shadow-[0_10px_30px_-10px_oklch(0.68_0.22_290/0.7)]">
          <Sparkles className="size-4" /> New AI resume
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="glass rounded-2xl p-5 hover-lift relative overflow-hidden">
            <div className={`absolute -top-10 -right-10 size-32 rounded-full bg-gradient-to-br ${s.accent} opacity-20 blur-2xl`} />
            <div className="flex items-start justify-between">
              <s.icon className="size-4 text-muted-foreground" />
              <span className="text-xs text-[var(--nova-cyan)]">{s.trend}</span>
            </div>
            <div className="mt-4 flex items-end gap-1">
              <span className="text-3xl font-semibold">{s.value}</span>
              <span className="text-sm text-muted-foreground pb-1">{s.suffix}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Resume Architect feature card */}
        <div className="lg:col-span-2 glass-strong rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 aurora opacity-60" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground tracking-widest uppercase">Featured · Resume Architect</p>
              <h2 className="mt-2 text-2xl font-semibold">Optimize your resume to <span className="nova-text">92+ ATS</span></h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md">Run a one-click pass to rewrite weak bullets, surface missing keywords, and quantify wins.</p>
            </div>
            <div className="hidden md:grid size-24 place-items-center rounded-full" style={{ background: "conic-gradient(oklch(0.7 0.22 290) 0% 78%, oklch(1 0 0 / 0.08) 78% 100%)" }}>
              <div className="size-18 rounded-full bg-background grid place-items-center px-3 py-2">
                <span className="text-xl font-semibold nova-text">{topAts || 78}</span>
              </div>
            </div>
          </div>
          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            {resumes.slice(0, 4).map((r) => (
              <Link key={r.id} to="/resumes/$id" params={{ id: r.id }} className="glass rounded-xl p-4 hover-lift flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground">Updated {new Date(r.updated_at).toLocaleDateString()}</p>
                </div>
                <span className="text-sm font-semibold nova-text">{r.ats_score || 0}</span>
              </Link>
            ))}
            {resumes.length === 0 && (
              <Link to="/resumes" className="sm:col-span-2 glass rounded-xl p-5 hover-lift flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-lg nova-gradient grid place-items-center"><FileText className="size-4 text-white"/></div>
                  <div>
                    <p className="text-sm font-medium">Create your first resume</p>
                    <p className="text-xs text-muted-foreground">AI-assisted, ATS-friendly, 6 templates.</p>
                  </div>
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </Link>
            )}
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-[var(--nova-violet)]" />
            <h3 className="font-semibold">AI suggestions</h3>
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            {[
              "Add measurable outcomes to 3 bullets in your Senior Engineer resume.",
              "You're a strong match for 4 new Product Engineer roles posted today.",
              "Practice 5 behavioral questions before Friday's interview.",
              "Add 'Kubernetes' and 'gRPC' to align with your target role.",
            ].map((tip, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="mt-1.5 size-1.5 rounded-full nova-gradient shrink-0" />
                <span className="text-muted-foreground">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-3xl p-6">
          <h3 className="font-semibold">Recent applications</h3>
          <div className="mt-4 divide-y divide-border/60">
            {applications.slice(0, 5).map((a) => (
              <div key={a.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{a.role}</p>
                  <p className="text-xs text-muted-foreground">{a.company} · {a.location ?? "Remote"}</p>
                </div>
                <span className="text-xs glass rounded-full px-2.5 py-1 capitalize">{a.status}</span>
              </div>
            ))}
            {applications.length === 0 && <p className="text-sm text-muted-foreground py-4">No applications yet. <Link to="/applications" className="underline">Track your first →</Link></p>}
          </div>
        </div>
        <div className="glass rounded-3xl p-6">
          <h3 className="font-semibold">Quick actions</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { to: "/cover-letter", label: "Cover Letter", icon: FileText },
              { to: "/interview", label: "Mock Interview", icon: MessagesSquare },
              { to: "/career-match", label: "Career Match", icon: Target },
              { to: "/jobs", label: "Find Jobs", icon: Briefcase },
            ].map((q) => (
              <Link key={q.to} to={q.to} className="glass rounded-xl p-4 hover-lift flex flex-col gap-2">
                <q.icon className="size-4 text-[var(--nova-violet)]" />
                <span className="text-sm font-medium">{q.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
