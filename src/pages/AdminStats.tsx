import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, BarChart3, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface DailyStat {
  date: string;
  count: number;
}

const AdminStats = () => {
  const navigate = useNavigate();
  const [total, setTotal] = useState(0);
  const [validated, setValidated] = useState(0);
  const [pending, setPending] = useState(0);
  const [revenueStandard, setRevenueStandard] = useState(0);
  const [revenuePremium, setRevenuePremium] = useState(0);
  const [dailyData, setDailyData] = useState<DailyStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndLoad();
  }, []);

  const checkAuthAndLoad = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/admin/login"); return; }
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
    const isAdmin = roles?.some(r => r.role === "super_admin" || r.role === "admin");
    if (!isAdmin) { navigate("/admin/login"); return; }
    await fetchStats();
  };

  const fetchStats = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cv_submissions")
      .select("statut, product_type, product_price, date_creation, paiement_valide");

    if (error || !data) { setLoading(false); return; }

    setTotal(data.length);
    setValidated(data.filter(s => s.statut === "valide").length);
    setPending(data.filter(s => s.statut === "en_attente").length);

    const validatedSubs = data.filter(s => s.paiement_valide);
    setRevenueStandard(
      validatedSubs
        .filter(s => s.product_type !== "LETTRE_PREMIUM")
        .reduce((sum, s) => sum + (s.product_price || 500), 0)
    );
    setRevenuePremium(
      validatedSubs
        .filter(s => s.product_type === "LETTRE_PREMIUM")
        .reduce((sum, s) => sum + (s.product_price || 1000), 0)
    );

    // Daily aggregation (last 30 days)
    const dailyMap: Record<string, number> = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dailyMap[d.toISOString().slice(0, 10)] = 0;
    }
    data.forEach(s => {
      const day = s.date_creation.slice(0, 10);
      if (dailyMap[day] !== undefined) dailyMap[day]++;
    });
    setDailyData(Object.entries(dailyMap).map(([date, count]) => ({
      date: date.slice(5), // MM-DD
      count,
    })));

    setLoading(false);
  };

  const totalRevenue = revenueStandard + revenuePremium;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate("/admin/dashboard")} className="p-1">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-base font-semibold text-foreground">Statistiques</h1>
      </header>

      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-12">Chargement...</p>
      ) : (
        <div className="p-4 space-y-4 max-w-lg mx-auto">
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{total}</p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-success" />
                <span className="text-xs text-muted-foreground">Validées</span>
              </div>
              <p className="text-2xl font-bold text-success">{validated}</p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-warning" />
                <span className="text-xs text-muted-foreground">En attente</span>
              </div>
              <p className="text-2xl font-bold text-warning">{pending}</p>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Revenus</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{totalRevenue.toLocaleString()} <span className="text-sm font-normal">FCFA</span></p>
            </div>
          </div>

          {/* Revenue breakdown */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Revenus par produit</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Standard (500 FCFA)</span>
                <span className="text-sm font-semibold text-foreground">{revenueStandard.toLocaleString()} FCFA</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: totalRevenue ? `${(revenueStandard / totalRevenue) * 100}%` : "0%" }} />
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-warning">👑 Premium (1000 FCFA)</span>
                <span className="text-sm font-semibold text-warning">{revenuePremium.toLocaleString()} FCFA</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-warning h-2 rounded-full" style={{ width: totalRevenue ? `${(revenuePremium / totalRevenue) * 100}%` : "0%" }} />
              </div>
            </div>
          </div>

          {/* Daily chart */}
          <div className="bg-card border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Soumissions par jour (30j)</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={4} stroke="hsl(var(--muted-foreground))" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Soumissions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStats;
