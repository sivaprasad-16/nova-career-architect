import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { analyzeCareerMatch } from "@/lib/ai.functions";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Target, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/career-match")({
  head: () => ({ meta: [{ title: "Career Match — NOVA AI" }] }),
  component: CareerMatch,
});

type Result = { matchScore: number; strengths: string[]; missingSkills: string[]; nextSteps: string[]; salaryRange: string };

function CareerMatch() {
  const [resume, setResume] = useState("");
  const [role, setRole] = useState("Senior Product Engineer");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const analyze = useServerFn(analyzeCareerMatch);

  async function run() {
    if (resume.length < 40) return toast.error("Paste at least 40 characters of your resume.");
    setLoading(true);
    try {
      const r = await analyze({ data: { resume, targetRole: role } });
      setResult(r as Result);
    } catch (e) { toast.error(e instanceof Error ? e.message : "AI error"); }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Career Match</p>
        <h1 className="text-3xl md:text-4xl font-semibold mt-1">Match your resume to <span className="nova-text">any role</span></h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-6 space-y-3">
          <label className="text-sm font-medium">Target role</label>
          <Input value={role} onChange={(e) => setRole(e.target.value)} className="glass border-border/60" />
          <label className="text-sm font-medium pt-2">Paste your resume</label>
          <Textarea value={resume} onChange={(e) => setResume(e.target.value)} rows={14} placeholder="Paste your resume content..." className="glass border-border/60 resize-none" />
          <Button onClick={run} disabled={loading} className="nova-gradient text-white border-0">
            {loading ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Sparkles className="size-4 mr-2" />}
            Analyze match
          </Button>
        </div>

        <div className="space-y-4">
          {result ? (
            <>
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="size-24 rounded-full grid place-items-center" style={{ background: `conic-gradient(oklch(0.7 0.22 290) 0% ${result.matchScore}%, oklch(1 0 0 / 0.08) ${result.matchScore}% 100%)` }}>
                    <div className="size-18 rounded-full bg-card grid place-items-center px-3 py-2">
                      <span className="text-2xl font-semibold nova-text">{result.matchScore}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Match score</p>
                    <h3 className="text-xl font-semibold">{role}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Est. salary: {result.salaryRange}</p>
                  </div>
                </div>
              </div>
              <Panel title="Strengths" items={result.strengths} accent="cyan" />
              <Panel title="Missing skills" items={result.missingSkills} accent="pink" />
              <Panel title="Next steps" items={result.nextSteps} accent="violet" />
            </>
          ) : (
            <div className="glass rounded-2xl p-10 text-center">
              <Target className="size-8 mx-auto text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">Run an analysis to see your match score and skill-gap roadmap.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Panel({ title, items, accent }: { title: string; items: string[]; accent: "cyan" | "pink" | "violet" }) {
  const colors = { cyan: "var(--nova-cyan)", pink: "var(--nova-pink)", violet: "var(--nova-violet)" };
  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="font-semibold text-sm">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((i, idx) => (
          <li key={idx} className="text-sm text-muted-foreground flex gap-2">
            <span className="mt-1.5 size-1.5 rounded-full shrink-0" style={{ background: colors[accent] }} />
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}
