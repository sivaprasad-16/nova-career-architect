import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — NOVA AI" }] }),
  component: Settings,
});

function Settings() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => {
      if (data) { setFullName(data.full_name ?? ""); setHeadline(data.headline ?? ""); }
    });
  }, [user]);

  async function save() {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName, headline }).eq("id", user.id);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Settings</p>
        <h1 className="text-3xl md:text-4xl font-semibold mt-1">Account & <span className="nova-text">preferences</span></h1>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold">Profile</h2>
        <div><label className="text-sm">Full name</label><Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1.5 glass border-border/60" /></div>
        <div><label className="text-sm">Headline</label><Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Senior Product Engineer · ex-Stripe" className="mt-1.5 glass border-border/60" /></div>
        <div><label className="text-sm text-muted-foreground">Email</label><Input value={user?.email ?? ""} disabled className="mt-1.5 glass border-border/60 opacity-60" /></div>
        <Button onClick={save} disabled={loading} className="nova-gradient text-white border-0">
          {loading && <Loader2 className="size-4 mr-2 animate-spin" />} Save changes
        </Button>
      </div>

      <div className="glass rounded-2xl p-6 space-y-3">
        <h2 className="font-semibold">Preferences</h2>
        {[
          ["Email notifications", "Job matches and application updates"],
          ["Weekly career digest", "Insights and trends every Monday"],
          ["AI suggestions", "Allow NOVA to suggest improvements in your resumes"],
        ].map(([t, d]) => (
          <div key={t} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
            <div><p className="text-sm font-medium">{t}</p><p className="text-xs text-muted-foreground">{d}</p></div>
            <Switch defaultChecked />
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="font-semibold text-destructive">Danger zone</h2>
        <p className="text-sm text-muted-foreground mt-1">Delete your account and all associated data. This cannot be undone.</p>
        <Button variant="outline" className="mt-4 border-destructive/40 text-destructive hover:bg-destructive/10">Delete account</Button>
      </div>
    </div>
  );
}
