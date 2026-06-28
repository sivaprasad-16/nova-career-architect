import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { generateSummary, generateBullets, rewriteBullet } from "@/lib/ai.functions";
import { scoreResume, type ResumeContent } from "@/lib/ats";
import { toast } from "sonner";
import { ArrowLeft, Plus, Sparkles, Loader2, Trash2, Wand2, Download, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/resumes/$id")({
  head: () => ({ meta: [{ title: "Resume Editor — NOVA AI" }] }),
  component: ResumeEditor,
});

function ResumeEditor() {
  const { id } = useParams({ from: "/_authenticated/resumes/$id" });
  const [content, setContent] = useState<ResumeContent>({});
  const [title, setTitle] = useState("Untitled Resume");
  const [accent, setAccent] = useState("#7c5cff");
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const genSummary = useServerFn(generateSummary);
  const genBullets = useServerFn(generateBullets);
  const rewrite = useServerFn(rewriteBullet);

  const { data: row, isLoading } = useQuery({
    queryKey: ["resume", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("resumes").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (row) {
      setContent((row.content as ResumeContent) ?? {});
      setTitle(row.title);
      setAccent(row.accent_color);
    }
  }, [row]);

  const ats = useMemo(() => scoreResume(content), [content]);

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("resumes")
      .update({ title, content: content as never, accent_color: accent, ats_score: ats.total })
      .eq("id", id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
  }

  // Autosave debounce
  useEffect(() => {
    if (!row) return;
    const t = setTimeout(() => { save(); }, 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, accent, ats.total]);

  if (isLoading || !row) {
    return <div className="grid place-items-center h-96"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  }

  function updateExp(i: number, patch: Partial<NonNullable<ResumeContent["experience"]>[number]>) {
    setContent((c) => ({
      ...c,
      experience: (c.experience ?? []).map((e, idx) => idx === i ? { ...e, ...patch } : e),
    }));
  }

  async function aiSummary() {
    setBusy("summary");
    try {
      const res = await genSummary({ data: {
        role: content.experience?.[0]?.role ?? "Software Engineer",
        years: "",
        skills: (content.skills ?? []).join(", "),
        highlights: content.experience?.[0]?.bullets?.join("; ") ?? "",
      }});
      setContent((c) => ({ ...c, summary: res.text }));
      toast.success("Summary generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI error");
    } finally { setBusy(null); }
  }

  async function aiBullets(i: number) {
    const exp = content.experience?.[i];
    if (!exp) return;
    setBusy(`bullets-${i}`);
    try {
      const res = await genBullets({ data: { role: exp.role, company: exp.company, context: exp.bullets.join("; ") } });
      updateExp(i, { bullets: res.bullets });
      toast.success("Bullets regenerated");
    } catch (e) { toast.error(e instanceof Error ? e.message : "AI error"); }
    finally { setBusy(null); }
  }

  async function aiRewrite(i: number, b: number) {
    const exp = content.experience?.[i];
    if (!exp) return;
    setBusy(`rw-${i}-${b}`);
    try {
      const res = await rewrite({ data: { text: exp.bullets[b] } });
      const next = [...exp.bullets]; next[b] = res.text;
      updateExp(i, { bullets: next });
    } catch (e) { toast.error(e instanceof Error ? e.message : "AI error"); }
    finally { setBusy(null); }
  }

  function exportPDF() {
    if (typeof window !== "undefined") window.print();
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap mb-6 print:hidden">
        <Link to="/resumes" className="p-2 rounded-lg hover:bg-white/5"><ArrowLeft className="size-4" /></Link>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} className="max-w-xs glass border-border/60" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Accent</span>
          <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="size-8 rounded-md bg-transparent border border-border" />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" onClick={exportPDF} className="glass border-border/60"><Download className="size-4 mr-2" /> Export</Button>
          <Button onClick={save} disabled={saving} className="nova-gradient text-white border-0">
            {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />} Save
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        {/* Editor */}
        <div className="space-y-4 print:hidden">
          <Section title="Personal">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Name" value={content.personal?.name ?? ""} onChange={(v) => setContent((c) => ({ ...c, personal: { ...c.personal, name: v } }))} />
              <Field label="Email" value={content.personal?.email ?? ""} onChange={(v) => setContent((c) => ({ ...c, personal: { ...c.personal, email: v } }))} />
              <Field label="Phone" value={content.personal?.phone ?? ""} onChange={(v) => setContent((c) => ({ ...c, personal: { ...c.personal, phone: v } }))} />
              <Field label="Location" value={content.personal?.location ?? ""} onChange={(v) => setContent((c) => ({ ...c, personal: { ...c.personal, location: v } }))} />
            </div>
          </Section>

          <Section title="Professional Summary" action={
            <Button size="sm" variant="ghost" onClick={aiSummary} disabled={busy === "summary"} className="text-[var(--nova-violet)] hover:bg-white/5">
              {busy === "summary" ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : <Sparkles className="size-3.5 mr-1.5" />}
              AI generate
            </Button>
          }>
            <Textarea
              value={content.summary ?? ""}
              onChange={(e) => setContent((c) => ({ ...c, summary: e.target.value }))}
              rows={4} className="glass border-border/60 resize-none"
              placeholder="3–4 sentences. Senior X with N years building Y, focused on Z…"
            />
          </Section>

          <Section title="Experience" action={
            <Button size="sm" variant="ghost" onClick={() => setContent((c) => ({ ...c, experience: [...(c.experience ?? []), { company: "", role: "", start: "", end: "", bullets: [""] }] }))} className="hover:bg-white/5">
              <Plus className="size-3.5 mr-1.5" /> Add
            </Button>
          }>
            <div className="space-y-4">
              {(content.experience ?? []).map((e, i) => (
                <div key={i} className="rounded-xl border border-border/60 p-4 space-y-2.5">
                  <div className="grid sm:grid-cols-2 gap-2">
                    <Input value={e.role} placeholder="Role" onChange={(ev) => updateExp(i, { role: ev.target.value })} className="glass border-border/60" />
                    <Input value={e.company} placeholder="Company" onChange={(ev) => updateExp(i, { company: ev.target.value })} className="glass border-border/60" />
                    <Input value={e.start ?? ""} placeholder="Start" onChange={(ev) => updateExp(i, { start: ev.target.value })} className="glass border-border/60" />
                    <Input value={e.end ?? ""} placeholder="End" onChange={(ev) => updateExp(i, { end: ev.target.value })} className="glass border-border/60" />
                  </div>
                  <div className="space-y-1.5">
                    {e.bullets.map((b, bi) => (
                      <div key={bi} className="flex gap-2 items-start">
                        <span className="mt-2.5 size-1.5 rounded-full nova-gradient shrink-0" />
                        <Textarea value={b} onChange={(ev) => {
                          const next = [...e.bullets]; next[bi] = ev.target.value; updateExp(i, { bullets: next });
                        }} rows={2} className="glass border-border/60 resize-none text-sm" />
                        <div className="flex flex-col gap-1">
                          <button onClick={() => aiRewrite(i, bi)} disabled={busy === `rw-${i}-${bi}`} title="AI rewrite" className="p-1.5 rounded-md hover:bg-white/5 text-[var(--nova-violet)]">
                            {busy === `rw-${i}-${bi}` ? <Loader2 className="size-3.5 animate-spin" /> : <Wand2 className="size-3.5" />}
                          </button>
                          <button onClick={() => { const next = e.bullets.filter((_, x) => x !== bi); updateExp(i, { bullets: next }); }} className="p-1.5 rounded-md hover:bg-white/5 text-muted-foreground">
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => updateExp(i, { bullets: [...e.bullets, ""] })} className="hover:bg-white/5"><Plus className="size-3.5 mr-1.5" /> Bullet</Button>
                      <Button size="sm" variant="ghost" onClick={() => aiBullets(i)} disabled={busy === `bullets-${i}`} className="text-[var(--nova-violet)] hover:bg-white/5">
                        {busy === `bullets-${i}` ? <Loader2 className="size-3.5 mr-1.5 animate-spin" /> : <Sparkles className="size-3.5 mr-1.5" />}
                        AI rewrite all
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Skills">
            <Input
              value={(content.skills ?? []).join(", ")}
              onChange={(e) => setContent((c) => ({ ...c, skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }))}
              placeholder="Comma-separated: TypeScript, React, AWS…"
              className="glass border-border/60"
            />
          </Section>

          <Section title="Education" action={
            <Button size="sm" variant="ghost" onClick={() => setContent((c) => ({ ...c, education: [...(c.education ?? []), { school: "", degree: "", start: "", end: "" }] }))} className="hover:bg-white/5">
              <Plus className="size-3.5 mr-1.5" /> Add
            </Button>
          }>
            {(content.education ?? []).map((e, i) => (
              <div key={i} className="grid sm:grid-cols-2 gap-2 mb-2">
                <Input value={e.school} placeholder="School" onChange={(ev) => setContent((c) => ({ ...c, education: c.education?.map((x, idx) => idx === i ? { ...x, school: ev.target.value } : x) }))} className="glass border-border/60" />
                <Input value={e.degree} placeholder="Degree" onChange={(ev) => setContent((c) => ({ ...c, education: c.education?.map((x, idx) => idx === i ? { ...x, degree: ev.target.value } : x) }))} className="glass border-border/60" />
              </div>
            ))}
          </Section>
        </div>

        {/* Preview + ATS */}
        <div className="space-y-4">
          <div className="glass rounded-2xl p-5 print:hidden">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">ATS Score</p>
              <span className="text-xs text-muted-foreground">live</span>
            </div>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-4xl font-semibold nova-text">{ats.total}</span>
              <span className="text-muted-foreground text-sm pb-1.5">/ 100</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-border overflow-hidden">
              <div className="h-full nova-gradient transition-all" style={{ width: `${ats.total}%` }} />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center text-[10px]">
              {Object.entries(ats.breakdown).map(([k, v]) => (
                <div key={k} className="glass rounded-lg p-2">
                  <p className="text-sm font-semibold">{v}</p>
                  <p className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, " $1")}</p>
                </div>
              ))}
            </div>
            {ats.suggestions.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Suggestions</p>
                <ul className="space-y-1.5">
                  {ats.suggestions.map((s, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex gap-2"><span className="text-[var(--nova-violet)]">▸</span>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Live preview */}
          <div className="rounded-2xl bg-white text-zinc-900 p-8 shadow-xl print:shadow-none print:p-12 print:rounded-none" id="resume-preview">
            <div className="border-b-2 pb-3" style={{ borderColor: accent }}>
              <h1 className="text-2xl font-bold" style={{ color: accent }}>{content.personal?.name || "Your Name"}</h1>
              <p className="text-xs text-zinc-600 mt-1">
                {[content.personal?.email, content.personal?.phone, content.personal?.location].filter(Boolean).join(" · ")}
              </p>
            </div>
            {content.summary && <p className="text-sm mt-4 leading-relaxed">{content.summary}</p>}
            {(content.experience ?? []).length > 0 && (
              <div className="mt-5">
                <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>Experience</h2>
                <div className="mt-2 space-y-3">
                  {content.experience!.map((e, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold">{e.role || "Role"} · <span className="font-normal">{e.company}</span></span>
                        <span className="text-zinc-500 text-xs">{e.start} – {e.end}</span>
                      </div>
                      <ul className="mt-1 text-sm list-disc list-inside space-y-0.5">
                        {e.bullets.filter(Boolean).map((b, bi) => <li key={bi}>{b}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {(content.skills ?? []).length > 0 && (
              <div className="mt-5">
                <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>Skills</h2>
                <p className="text-sm mt-1">{content.skills!.join(" · ")}</p>
              </div>
            )}
            {(content.education ?? []).length > 0 && (
              <div className="mt-5">
                <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: accent }}>Education</h2>
                <div className="mt-1 space-y-1">
                  {content.education!.map((e, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span><span className="font-semibold">{e.degree}</span> — {e.school}</span>
                      <span className="text-zinc-500 text-xs">{e.start} – {e.end}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-sm tracking-wide uppercase text-muted-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 glass border-border/60" />
    </div>
  );
}
