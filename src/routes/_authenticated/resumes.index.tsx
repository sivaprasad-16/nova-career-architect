import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { Plus, FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/resumes/")({
  head: () => ({ meta: [{ title: "Resume Architect — NOVA AI" }] }),
  component: ResumesList,
});

const TEMPLATES = [
  { id: "modern", name: "Modern", color: "#7c5cff" },
  { id: "professional", name: "Professional", color: "#3b82f6" },
  { id: "corporate", name: "Corporate", color: "#0ea5e9" },
  { id: "minimal", name: "Minimal", color: "#a78bfa" },
  { id: "student", name: "Student", color: "#22d3ee" },
  { id: "creative", name: "Creative", color: "#ec4899" },
];

const STARTER_CONTENT = {
  personal: { name: "Your Name", email: "you@email.com", phone: "+1 555 000 0000", location: "Remote", website: "" },
  summary: "",
  experience: [{ company: "Company", role: "Role", start: "2023", end: "Present", bullets: ["Add a measurable achievement here."] }],
  education: [{ school: "University", degree: "B.Sc. Computer Science", start: "2019", end: "2023" }],
  projects: [],
  skills: ["TypeScript", "React", "Node.js"],
  certifications: [],
  achievements: [],
  languages: [],
};

function ResumesList() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: resumes = [], isLoading } = useQuery({
    queryKey: ["resumes", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("resumes").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  async function create(template: string, color: string) {
    if (!user) return;
    const { data, error } = await supabase
      .from("resumes")
      .insert({ user_id: user.id, title: "Untitled Resume", template, accent_color: color, content: STARTER_CONTENT })
      .select().single();
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["resumes"] });
    navigate({ to: "/resumes/$id", params: { id: data.id } });
  }

  async function remove(id: string) {
    const { error } = await supabase.from("resumes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["resumes"] });
    toast.success("Resume deleted");
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Resume Architect</p>
          <h1 className="text-3xl md:text-4xl font-semibold mt-1">Your <span className="nova-text">resume library</span></h1>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Start from a template</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {TEMPLATES.map((t) => (
            <button key={t.id} onClick={() => create(t.id, t.color)} className="glass rounded-2xl p-3 hover-lift text-left group">
              <div className="aspect-[3/4] rounded-xl mb-3 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${t.color}33, transparent)`, border: `1px solid ${t.color}44` }}>
                <div className="absolute inset-3 flex flex-col gap-1.5">
                  <div className="h-1 rounded-full bg-white/30 w-2/3" />
                  <div className="h-1 rounded-full bg-white/15 w-1/2" />
                  <div className="mt-3 space-y-1">
                    {[...Array(6)].map((_, i) => <div key={i} className="h-0.5 rounded-full bg-white/15" style={{ width: `${50 + (i * 7) % 40}%` }} />)}
                  </div>
                </div>
                <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition bg-black/40">
                  <Plus className="size-6 text-white" />
                </div>
              </div>
              <p className="text-sm font-medium">{t.name}</p>
              <p className="text-xs text-muted-foreground">Click to create</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Your resumes</h2>
        {isLoading ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => <div key={i} className="glass rounded-2xl h-32 animate-shimmer" />)}
          </div>
        ) : resumes.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <FileText className="size-8 mx-auto text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">No resumes yet. Pick a template above to get started.</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {resumes.map((r) => (
              <div key={r.id} className="glass rounded-2xl p-5 hover-lift group relative">
                <Link to="/resumes/$id" params={{ id: r.id }} className="block">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{r.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 capitalize">{r.template} · {new Date(r.updated_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold nova-text">{r.ats_score || 0}</p>
                      <p className="text-[10px] text-muted-foreground">ATS</p>
                    </div>
                  </div>
                  <div className="mt-4 h-1.5 rounded-full bg-border overflow-hidden">
                    <div className="h-full nova-gradient" style={{ width: `${r.ats_score || 0}%` }} />
                  </div>
                </Link>
                <button onClick={() => remove(r.id)} className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition p-1.5 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
