import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, MapPin, Bookmark, ExternalLink, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/jobs")({
  head: () => ({ meta: [{ title: "Job Discovery — NOVA AI" }] }),
  component: Jobs,
});

const JOBS = [
  { id: 1, role: "Senior Product Engineer", company: "Linear", location: "Remote · Global", type: "Full-time", salary: "$160k – $220k", match: 94, tags: ["TypeScript", "React", "Postgres"], logo: "L", color: "#7c5cff" },
  { id: 2, role: "Founding AI Engineer", company: "Quill", location: "San Francisco", type: "Full-time", salary: "$180k – $260k + equity", match: 91, tags: ["Python", "LLMs", "PyTorch"], logo: "Q", color: "#06b6d4" },
  { id: 3, role: "Staff Frontend Engineer", company: "Vercel", location: "Remote · US", type: "Full-time", salary: "$200k – $280k", match: 89, tags: ["Next.js", "Edge", "DX"], logo: "V", color: "#3b82f6" },
  { id: 4, role: "Design Engineer", company: "Framer", location: "Amsterdam", type: "Full-time", salary: "€110k – €150k", match: 86, tags: ["Motion", "Canvas", "TypeScript"], logo: "F", color: "#ec4899" },
  { id: 5, role: "Backend Engineer (Realtime)", company: "Liveblocks", location: "Remote · EU", type: "Full-time", salary: "€90k – €130k", match: 82, tags: ["Node.js", "WebSockets", "Redis"], logo: "L", color: "#22c55e" },
  { id: 6, role: "Full-stack Engineer Intern", company: "Cron", location: "Remote", type: "Internship", salary: "$8k / mo", match: 78, tags: ["Swift", "TypeScript"], logo: "C", color: "#a78bfa" },
];

function Jobs() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "remote" | "internship">("all");

  const filtered = JOBS.filter((j) =>
    (filter === "all" || (filter === "remote" && j.location.toLowerCase().includes("remote")) || (filter === "internship" && j.type === "Internship"))
    && (q ? (j.role + j.company + j.tags.join(" ")).toLowerCase().includes(q.toLowerCase()) : true)
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Job Discovery</p>
        <h1 className="text-3xl md:text-4xl font-semibold mt-1">Roles tuned to <span className="nova-text">your profile</span></h1>
      </div>

      <div className="glass rounded-2xl p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-64">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search roles, companies, skills..." className="pl-9 glass border-border/60" />
        </div>
        {(["all", "remote", "internship"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`text-sm rounded-full px-3.5 py-1.5 capitalize ${filter === f ? "nova-gradient text-white" : "glass hover:bg-white/8"}`}>{f}</button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {filtered.map((j) => (
          <div key={j.id} className="glass rounded-2xl p-5 hover-lift">
            <div className="flex items-start gap-4">
              <div className="size-12 rounded-xl grid place-items-center text-white font-semibold shrink-0" style={{ background: `linear-gradient(135deg, ${j.color}, oklch(0.7 0.2 290))` }}>{j.logo}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{j.role}</p>
                    <p className="text-sm text-muted-foreground">{j.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold nova-text">{j.match}%</p>
                    <p className="text-[10px] text-muted-foreground">match</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><MapPin className="size-3" />{j.location} · {j.type}</p>
                <p className="text-sm mt-1.5">{j.salary}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {j.tags.map((t) => <span key={t} className="text-[11px] glass rounded-full px-2 py-0.5">{t}</span>)}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button className="text-xs nova-gradient text-white rounded-full px-3 py-1.5 inline-flex items-center gap-1.5">Apply <ExternalLink className="size-3" /></button>
                  <button className="text-xs glass rounded-full px-3 py-1.5 inline-flex items-center gap-1.5"><Bookmark className="size-3" /> Save</button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="md:col-span-2 glass rounded-2xl p-12 text-center">
            <Briefcase className="size-8 mx-auto text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No jobs match those filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
