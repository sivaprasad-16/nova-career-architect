import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { Plus, Trash2, ClipboardList } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/applications")({
  head: () => ({ meta: [{ title: "Application Tracker — NOVA AI" }] }),
  component: Applications,
});

const STATUSES = [
  { id: "applied", label: "Applied", color: "from-[var(--nova-blue)] to-[var(--nova-violet)]" },
  { id: "interview", label: "Interview", color: "from-[var(--nova-violet)] to-[var(--nova-pink)]" },
  { id: "offer", label: "Offer", color: "from-[var(--nova-cyan)] to-[var(--nova-blue)]" },
  { id: "rejected", label: "Rejected", color: "from-zinc-500 to-zinc-700" },
] as const;

function Applications() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({ company: "", role: "", location: "" });

  const { data: apps = [] } = useQuery({
    queryKey: ["applications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("applications").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  async function add() {
    if (!user || !form.company || !form.role) return toast.error("Company and role required");
    const { error } = await supabase.from("applications").insert({ user_id: user.id, ...form, status: "applied" });
    if (error) return toast.error(error.message);
    setForm({ company: "", role: "", location: "" });
    qc.invalidateQueries({ queryKey: ["applications"] });
  }

  async function moveTo(id: string, status: string) {
    const { error } = await supabase.from("applications").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["applications"] });
  }

  async function remove(id: string) {
    const { error } = await supabase.from("applications").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["applications"] });
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Application Tracker</p>
        <h1 className="text-3xl md:text-4xl font-semibold mt-1">Your pipeline, <span className="nova-text">all in one place</span></h1>
      </div>

      <div className="glass rounded-2xl p-4 flex flex-wrap gap-2">
        <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Company" className="flex-1 min-w-40 glass border-border/60" />
        <Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Role" className="flex-1 min-w-40 glass border-border/60" />
        <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" className="flex-1 min-w-40 glass border-border/60" />
        <Button onClick={add} className="nova-gradient text-white border-0"><Plus className="size-4 mr-1.5" />Add</Button>
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        {STATUSES.map((s) => {
          const items = apps.filter((a) => a.status === s.id);
          return (
            <div key={s.id} className="glass rounded-2xl p-4 min-h-64">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{s.label}</h3>
                <span className={`text-xs rounded-full px-2 py-0.5 bg-gradient-to-r ${s.color} text-white`}>{items.length}</span>
              </div>
              <div className="mt-3 space-y-2">
                {items.map((a) => (
                  <div key={a.id} className="glass rounded-xl p-3 group">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{a.role}</p>
                        <p className="text-xs text-muted-foreground">{a.company}</p>
                        {a.location && <p className="text-[10px] text-muted-foreground mt-0.5">{a.location}</p>}
                      </div>
                      <button onClick={() => remove(a.id)} className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-destructive"><Trash2 className="size-3.5" /></button>
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {STATUSES.filter((x) => x.id !== s.id).map((x) => (
                        <button key={x.id} onClick={() => moveTo(a.id, x.id)} className="text-[10px] glass rounded-full px-2 py-0.5 hover:bg-white/10">→ {x.label}</button>
                      ))}
                    </div>
                  </div>
                ))}
                {items.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">Empty</p>}
              </div>
            </div>
          );
        })}
      </div>

      {apps.length === 0 && (
        <div className="glass rounded-2xl p-10 text-center">
          <ClipboardList className="size-8 mx-auto text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Add your first application above to start tracking.</p>
        </div>
      )}
    </div>
  );
}
