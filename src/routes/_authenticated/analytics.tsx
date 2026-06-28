import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — NOVA AI" }] }),
  component: Analytics,
});

const ATS_HISTORY = [
  { d: "Mon", v: 64 }, { d: "Tue", v: 68 }, { d: "Wed", v: 72 }, { d: "Thu", v: 78 }, { d: "Fri", v: 82 }, { d: "Sat", v: 88 }, { d: "Sun", v: 92 },
];

function Analytics() {
  const { user } = useAuth();
  const { data: apps = [] } = useQuery({
    queryKey: ["applications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("applications").select("*");
      if (error) throw error;
      return data;
    }, enabled: !!user,
  });

  const byStatus = ["applied", "interview", "offer", "rejected"].map((s) => ({
    status: s, count: apps.filter((a) => a.status === s).length,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Analytics</p>
        <h1 className="text-3xl md:text-4xl font-semibold mt-1">Your <span className="nova-text">career signals</span></h1>
      </div>

      <div className="grid md:grid-cols-4 gap-3">
        {[
          { l: "Resume strength", v: "92", s: "+18 this week" },
          { l: "Apps sent", v: apps.length, s: "this month" },
          { l: "Interview rate", v: apps.length ? `${Math.round(apps.filter((a) => a.status !== "applied").length / apps.length * 100)}%` : "—", s: "of applied" },
          { l: "Offers", v: apps.filter((a) => a.status === "offer").length, s: "lifetime" },
        ].map((s) => (
          <div key={s.l} className="glass rounded-2xl p-5">
            <p className="text-xs text-muted-foreground">{s.l}</p>
            <p className="mt-2 text-3xl font-semibold nova-text">{s.v}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.s}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold text-sm">ATS score over time</h3>
          <div className="h-64 mt-3">
            <ResponsiveContainer>
              <AreaChart data={ATS_HISTORY}>
                <defs>
                  <linearGradient id="ag" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.68 0.22 290)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.68 0.22 290)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(1 0 0 / 0.06)" strokeDasharray="3 3" />
                <XAxis dataKey="d" stroke="oklch(0.72 0.025 270)" fontSize={11} />
                <YAxis stroke="oklch(0.72 0.025 270)" fontSize={11} />
                <Tooltip contentStyle={{ background: "oklch(0.18 0.04 270)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="v" stroke="oklch(0.7 0.22 290)" fill="url(#ag)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold text-sm">Applications by status</h3>
          <div className="h-64 mt-3">
            <ResponsiveContainer>
              <BarChart data={byStatus}>
                <CartesianGrid stroke="oklch(1 0 0 / 0.06)" strokeDasharray="3 3" />
                <XAxis dataKey="status" stroke="oklch(0.72 0.025 270)" fontSize={11} />
                <YAxis stroke="oklch(0.72 0.025 270)" fontSize={11} />
                <Tooltip contentStyle={{ background: "oklch(0.18 0.04 270)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="count" fill="oklch(0.7 0.22 290)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
