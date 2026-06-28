import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Target, FileText, MessagesSquare, Briefcase, GraduationCap, LineChart, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NOVA AI — Build resumes that beat the bots" },
      { name: "description", content: "AI resume builder, ATS scoring, career match, interview coach, cover letters, job tracking — one premium career OS." },
      { property: "og:title", content: "NOVA AI — Resume Architect" },
      { property: "og:description", content: "Your AI career copilot. Land interviews 3× faster." },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: FileText, title: "Resume Architect", desc: "Drag-and-drop builder, 6 templates, live ATS score, one-click optimization." },
  { icon: Target, title: "Career Match", desc: "Match your resume to any role. Get a skill-gap roadmap and salary band." },
  { icon: Briefcase, title: "Job Discovery", desc: "Find roles tuned to your profile. Bookmark, apply, and track in one place." },
  { icon: MessagesSquare, title: "Interview Coach", desc: "AI-graded mock interviews. Behavioral, technical, HR — with confidence scoring." },
  { icon: GraduationCap, title: "Skill Academy", desc: "Personalized learning roadmaps and curated courses for the skills you're missing." },
  { icon: LineChart, title: "Analytics", desc: "Track applications, interviews, and resume strength over time." },
];

function Landing() {
  return (
    <div className="min-h-screen aurora">
      {/* Nav */}
      <header className="px-6 md:px-10 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl nova-gradient grid place-items-center shadow-[0_0_30px_oklch(0.68_0.22_290/0.6)]">
            <Sparkles className="size-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">NOVA<span className="text-muted-foreground">.ai</span></span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition">Features</a>
          <a href="#how" className="hover:text-foreground transition">How it works</a>
          <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition px-3 py-2">Sign in</Link>
          <Link to="/auth" search={{ mode: "signup" }} className="text-sm font-medium nova-gradient text-white rounded-full px-4 py-2 shadow-[0_8px_24px_-6px_oklch(0.68_0.22_290/0.6)]">
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 md:px-10 pt-16 pb-24 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 glass rounded-full px-3.5 py-1.5 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-[var(--nova-violet)] animate-nova-pulse" />
          Now in public beta · GPT-class career intelligence
        </div>
        <h1 className="mt-7 text-5xl md:text-7xl font-semibold tracking-tight">
          Build resumes that <span className="nova-text">beat the bots</span>.
          <br />Land the interviews.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          NOVA is your AI career OS — write, score, and optimize ATS-friendly resumes,
          generate cover letters, prep for interviews, and track every application.
        </p>
        <div className="mt-9 flex items-center justify-center gap-3">
          <Link to="/auth" search={{ mode: "signup" }} className="inline-flex items-center gap-2 nova-gradient text-white rounded-full px-6 py-3 text-sm font-medium shadow-[0_10px_40px_-10px_oklch(0.68_0.22_290/0.7)] hover-lift">
            Start free — no card
            <ArrowRight className="size-4" />
          </Link>
          <Link to="/auth" className="inline-flex items-center gap-2 glass rounded-full px-6 py-3 text-sm hover-lift">
            See live demo
          </Link>
        </div>

        {/* Hero preview card */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 -z-10 blur-3xl opacity-60 nova-gradient rounded-[40px]" />
          <div className="glass-strong rounded-3xl p-4 text-left">
            <div className="flex items-center gap-2 px-2 pb-3">
              <span className="size-2.5 rounded-full bg-red-400/70" />
              <span className="size-2.5 rounded-full bg-yellow-400/70" />
              <span className="size-2.5 rounded-full bg-green-400/70" />
              <span className="ml-3 text-xs text-muted-foreground">nova.ai / dashboard</span>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <div className="md:col-span-2 glass rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Active resume</p>
                    <p className="font-medium">Senior Product Engineer — v3</p>
                  </div>
                  <span className="text-xs glass rounded-full px-2.5 py-1">Modern · Violet</span>
                </div>
                <div className="mt-4 space-y-2">
                  {[
                    "Shipped real-time collab editor used by 12K MAUs, cutting load to 180 ms.",
                    "Led migration to event-driven architecture, reducing infra spend by 38%.",
                    "Mentored 6 engineers; 4 promoted within 12 months.",
                  ].map((t, i) => (
                    <div key={i} className="text-sm flex gap-2"><span className="text-[var(--nova-violet)]">▸</span>{t}</div>
                  ))}
                </div>
              </div>
              <div className="glass rounded-2xl p-5 flex flex-col items-center justify-center">
                <p className="text-xs text-muted-foreground">ATS Score</p>
                <div className="relative mt-2">
                  <div className="size-32 rounded-full grid place-items-center" style={{ background: "conic-gradient(oklch(0.7 0.22 290) 0% 92%, oklch(1 0 0 / 0.08) 92% 100%)" }}>
                    <div className="size-24 rounded-full bg-background grid place-items-center">
                      <span className="text-3xl font-semibold nova-text">92</span>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-xs text-center text-muted-foreground">Excellent — 3 keywords away from a perfect match.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 md:px-10 py-20 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-semibold text-center">An end-to-end career stack</h2>
        <p className="text-center text-muted-foreground mt-3">Eight modules. One unified workspace. Zero context-switching.</p>
        <div className="grid md:grid-cols-3 gap-4 mt-12">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 hover-lift">
              <div className="size-10 rounded-xl nova-gradient grid place-items-center mb-4">
                <f.icon className="size-5 text-white" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="px-6 md:px-10 pb-24">
        <div className="max-w-4xl mx-auto glass-strong rounded-3xl p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 -z-10 aurora opacity-70" />
          <ShieldCheck className="size-8 mx-auto text-[var(--nova-cyan)]" />
          <h2 className="mt-4 text-3xl md:text-4xl font-semibold">Your career, on autopilot.</h2>
          <p className="mt-3 text-muted-foreground">Free forever for students. Pro at $9/mo. Cancel any time.</p>
          <Link to="/auth" search={{ mode: "signup" }} className="mt-8 inline-flex items-center gap-2 nova-gradient text-white rounded-full px-7 py-3 text-sm font-medium hover-lift">
            Create your free account <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="px-6 md:px-10 py-8 text-xs text-muted-foreground border-t border-border/50 text-center">
        © {new Date().getFullYear()} NOVA AI · Made for the next generation of work.
      </footer>
    </div>
  );
}
