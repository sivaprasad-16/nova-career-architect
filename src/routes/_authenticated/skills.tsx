import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, BookOpen, CheckCircle2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/skills")({
  head: () => ({ meta: [{ title: "Skill Academy — NOVA AI" }] }),
  component: Skills,
});

const ROADMAPS = [
  { name: "Senior Frontend Engineer", progress: 68, items: ["React Server Components", "Performance budgets", "Accessibility deep dive", "Design systems at scale"] },
  { name: "AI Engineer", progress: 42, items: ["Prompt engineering", "RAG architectures", "LLM evals", "Vector DBs"] },
  { name: "Engineering Manager", progress: 24, items: ["1:1 frameworks", "Hiring loops", "OKR setting", "Conflict resolution"] },
];

const COURSES = [
  { title: "System Design for Senior Engineers", provider: "ByteByteGo", duration: "8h", level: "Advanced" },
  { title: "Production-ready RAG", provider: "DeepLearning.AI", duration: "6h", level: "Intermediate" },
  { title: "TypeScript: The Hard Parts", provider: "Frontend Masters", duration: "5h", level: "Intermediate" },
  { title: "Engineering Management 101", provider: "Lattice", duration: "3h", level: "Beginner" },
];

function Skills() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Skill Academy</p>
        <h1 className="text-3xl md:text-4xl font-semibold mt-1">Personalized <span className="nova-text">learning roadmaps</span></h1>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {ROADMAPS.map((r) => (
          <div key={r.name} className="glass rounded-2xl p-5 hover-lift">
            <div className="flex items-center gap-2"><GraduationCap className="size-4 text-[var(--nova-violet)]" /><h3 className="font-semibold">{r.name}</h3></div>
            <div className="mt-3 h-1.5 rounded-full bg-border overflow-hidden"><div className="h-full nova-gradient" style={{ width: `${r.progress}%` }} /></div>
            <p className="text-xs text-muted-foreground mt-1">{r.progress}% complete</p>
            <ul className="mt-4 space-y-1.5">
              {r.items.map((i, idx) => (
                <li key={i} className="text-sm flex items-center gap-2">
                  {idx < r.items.length * (r.progress / 100) ? <CheckCircle2 className="size-3.5 text-[var(--nova-cyan)]" /> : <div className="size-3.5 rounded-full border border-border" />}
                  <span className={idx < r.items.length * (r.progress / 100) ? "" : "text-muted-foreground"}>{i}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="glass-strong rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground tracking-widest uppercase">AI recommendations</p>
            <h2 className="text-xl font-semibold mt-1">Picked for you</h2>
          </div>
          <Sparkles className="size-5 text-[var(--nova-violet)]" />
        </div>
        <div className="mt-5 grid md:grid-cols-2 gap-3">
          {COURSES.map((c) => (
            <div key={c.title} className="glass rounded-xl p-4 hover-lift flex items-start gap-3">
              <div className="size-10 rounded-lg nova-gradient grid place-items-center shrink-0"><BookOpen className="size-4 text-white" /></div>
              <div className="flex-1">
                <p className="font-medium text-sm">{c.title}</p>
                <p className="text-xs text-muted-foreground">{c.provider} · {c.duration} · {c.level}</p>
              </div>
              <button className="text-xs nova-gradient text-white rounded-full px-3 py-1.5">Enroll</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
