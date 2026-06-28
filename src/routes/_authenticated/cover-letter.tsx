import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { generateCoverLetter } from "@/lib/ai.functions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Save, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/cover-letter")({
  head: () => ({ meta: [{ title: "Cover Letter — NOVA AI" }] }),
  component: CoverLetter,
});

const TONES = ["professional", "friendly", "enthusiastic", "confident"] as const;

function CoverLetter() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [tone, setTone] = useState<typeof TONES[number]>("professional");
  const [background, setBackground] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const gen = useServerFn(generateCoverLetter);

  const { data: history = [] } = useQuery({
    queryKey: ["cover-letters", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("cover_letters").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  async function run() {
    if (!company || !role) return toast.error("Add company and role");
    setBusy(true);
    try {
      const res = await gen({ data: { company, role, tone, background } });
      setBody(res.text);
    } catch (e) { toast.error(e instanceof Error ? e.message : "AI error"); }
    finally { setBusy(false); }
  }

  async function save() {
    if (!user || !body) return;
    const { error } = await supabase.from("cover_letters").insert({ user_id: user.id, title: `${role} @ ${company}`, company, role, tone, body });
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["cover-letters"] });
    toast.success("Saved");
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Cover Letter</p>
        <h1 className="text-3xl md:text-4xl font-semibold mt-1">Generate tailored <span className="nova-text">cover letters</span></h1>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.4fr] gap-4">
        <div className="glass rounded-2xl p-6 space-y-3">
          <div><label className="text-sm font-medium">Company</label><Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Linear" className="mt-1.5 glass border-border/60" /></div>
          <div><label className="text-sm font-medium">Role</label><Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Senior Product Engineer" className="mt-1.5 glass border-border/60" /></div>
          <div>
            <label className="text-sm font-medium">Tone</label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {TONES.map((t) => (
                <button key={t} onClick={() => setTone(t)} className={`text-xs rounded-full px-3 py-1.5 capitalize ${tone === t ? "nova-gradient text-white" : "glass hover:bg-white/8"}`}>{t}</button>
              ))}
            </div>
          </div>
          <div><label className="text-sm font-medium">Your background</label><Textarea value={background} onChange={(e) => setBackground(e.target.value)} rows={8} placeholder="3-4 lines about your experience and what you bring" className="mt-1.5 glass border-border/60 resize-none" /></div>
          <Button onClick={run} disabled={busy} className="w-full nova-gradient text-white border-0">
            {busy ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Sparkles className="size-4 mr-2" />}
            Generate
          </Button>

          {history.length > 0 && (
            <div className="pt-4 border-t border-border/60">
              <p className="text-xs text-muted-foreground mb-2">Saved versions</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {history.map((h) => (
                  <button key={h.id} onClick={() => setBody(h.body)} className="block w-full text-left text-sm glass rounded-lg p-2.5 hover:bg-white/8">
                    <p className="font-medium truncate">{h.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleDateString()}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="glass-strong rounded-2xl p-6 relative">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-muted-foreground">Letter</p>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(body); toast.success("Copied"); }} disabled={!body} className="hover:bg-white/5"><Copy className="size-3.5 mr-1.5" />Copy</Button>
              <Button size="sm" onClick={save} disabled={!body} className="nova-gradient text-white border-0"><Save className="size-3.5 mr-1.5" />Save</Button>
            </div>
          </div>
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={22} placeholder="Your AI-generated cover letter will appear here…" className="glass border-border/60 resize-none font-serif text-[15px] leading-relaxed" />
        </div>
      </div>
    </div>
  );
}
