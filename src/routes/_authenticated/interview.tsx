import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mic, MessagesSquare, Sparkles, Play, Trophy } from "lucide-react";

export const Route = createFileRoute("/_authenticated/interview")({
  head: () => ({ meta: [{ title: "Interview Coach — NOVA AI" }] }),
  component: Interview,
});

const TRACKS = [
  { id: "behavioral", label: "Behavioral", icon: MessagesSquare, color: "from-[var(--nova-violet)] to-[var(--nova-blue)]", count: 24 },
  { id: "technical", label: "Technical", icon: Sparkles, color: "from-[var(--nova-blue)] to-[var(--nova-cyan)]", count: 38 },
  { id: "coding", label: "Coding", icon: Sparkles, color: "from-[var(--nova-cyan)] to-[var(--nova-violet)]", count: 50 },
  { id: "hr", label: "HR", icon: MessagesSquare, color: "from-[var(--nova-pink)] to-[var(--nova-violet)]", count: 12 },
];

const QUESTIONS = [
  "Tell me about a time you led a project under tight deadlines.",
  "Describe a conflict with a teammate and how you resolved it.",
  "Walk me through a design decision you regretted.",
  "How do you stay sharp technically?",
];

function Interview() {
  const [track, setTrack] = useState("behavioral");
  const [recording, setRecording] = useState(false);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Interview Coach</p>
        <h1 className="text-3xl md:text-4xl font-semibold mt-1">Train for interviews <span className="nova-text">with AI</span></h1>
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        {TRACKS.map((t) => (
          <button key={t.id} onClick={() => setTrack(t.id)} className={`glass rounded-2xl p-5 hover-lift text-left relative overflow-hidden ${track === t.id ? "nova-ring" : ""}`}>
            <div className={`absolute -top-10 -right-10 size-32 rounded-full bg-gradient-to-br ${t.color} opacity-20 blur-2xl`} />
            <t.icon className="size-4 text-[var(--nova-violet)]" />
            <p className="mt-3 font-medium">{t.label}</p>
            <p className="text-xs text-muted-foreground">{t.count} questions</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-strong rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 aurora opacity-50" />
          <p className="text-xs text-muted-foreground tracking-widest uppercase">Question 1 of 5 · {track}</p>
          <h2 className="mt-3 text-2xl font-semibold">{QUESTIONS[0]}</h2>

          <div className="mt-8 flex flex-col items-center gap-4">
            <button
              onClick={() => setRecording((r) => !r)}
              className={`size-24 rounded-full grid place-items-center transition ${recording ? "bg-[var(--nova-pink)] animate-nova-pulse" : "nova-gradient"} shadow-[0_20px_60px_-20px_oklch(0.68_0.22_290/0.7)]`}
            >
              <Mic className="size-9 text-white" />
            </button>
            <p className="text-sm text-muted-foreground">{recording ? "Listening… speak naturally" : "Tap to start speaking"}</p>
          </div>

          <div className="mt-8 flex justify-between text-xs text-muted-foreground">
            <button className="hover:text-foreground">Skip</button>
            <button className="hover:text-foreground inline-flex items-center gap-1.5"><Play className="size-3" /> Next question</button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2"><Trophy className="size-4 text-[var(--nova-violet)]" /><h3 className="font-semibold text-sm">Last session scores</h3></div>
            {[
              { k: "Clarity", v: 88 }, { k: "Confidence", v: 82 }, { k: "STAR structure", v: 76 }, { k: "Pace", v: 91 },
            ].map((s) => (
              <div key={s.k} className="mt-3">
                <div className="flex justify-between text-xs"><span>{s.k}</span><span className="text-muted-foreground">{s.v}</span></div>
                <div className="mt-1 h-1.5 rounded-full bg-border overflow-hidden"><div className="h-full nova-gradient" style={{ width: `${s.v}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="glass rounded-2xl p-5">
            <h3 className="font-semibold text-sm">AI feedback</h3>
            <p className="mt-2 text-sm text-muted-foreground">Use STAR more explicitly in your last answer. Tie outcomes to numbers — you mentioned "improved performance"; add the % or time saved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
