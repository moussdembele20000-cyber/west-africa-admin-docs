import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut, Check, X, Eye, Trash2, RefreshCw, Filter, BarChart3 } from "lucide-react";

interface Submission {
  id: string;
  nom: string;
  telephone: string;
  type_lettre: string;
  numero_transaction: string;
  statut: string;
  paiement_valide: boolean;
  pdf_debloque: boolean;
  date_creation: string;
  contenu_lettre: string;
  email: string | null;
  product_type: string | null;
  product_price: number | null;
}

const NOTIFICATION_SOUND_URL = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH+JkpGLfnBka2+FkJaUjn5xZ2dvfIqTlpKJfHBnbHWDjpOVkot+cWdsc4KMkpWTi31xZ2xzgoySlZOLfXFnbHOCjJKVk4t9cWdsc4KMkpWTi31xZ2x0goySlZOLfXJnbHOCjJGVk4t9cWdsc4KMkZWTi31xZ2xzgoyRlJOKfHBnbHOCi5GUk4p8cGdsc4KLkZSTinxwZ2xzgouRlJOKfHBnbHOCi5GUk4p8cGdsc4KLkZSTinyAZ2tzg4uRlJSKfHFnbHOCi5GUk4p8cGZsc4KLkZSTinxwZmtzgouRlJOKfHBna3OCi5GUk4p8cGdrc4KLkZSTinxwZ2xzgouRlJOKfHBnbHOCi5GUk4p8cGdsc4GLkZOTinxwZ2xzgYuRk5OKfHBnbHOBi5GTk4p8cGdsc4GLkZOTinxwZ2xzgYuRk5OKfHBnbHOBi5CTkop8cGdsc4GLkJOSintwZmtzgYuQk5KKe3BmbHOBi5CTkop7cGZrc4GLkJOSintw";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewLetter, setViewLetter] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("tous");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    checkAuth();
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('admin-submissions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'cv_submissions' }, (payload) => {
        const newSub = payload.new as Submission;
        // Play notification sound
        audioRef.current?.play().catch(() => {});
        toast.info(`📩 Nouvelle soumission de ${newSub.nom}`, {
          description: `${newSub.product_type === "LETTRE_PREMIUM" ? "👑 Premium" : "Standard"} — ${newSub.numero_transaction}`,
          duration: 10000,
        });
        setSubmissions((prev) => [newSub, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'cv_submissions' }, (payload) => {
        const updated = payload.new as Submission;
        setSubmissions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'cv_submissions' }, (payload) => {
        const deletedId = (payload.old as any).id;
        setSubmissions((prev) => prev.filter((s) => s.id !== deletedId));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/admin/login"); return; }
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
    const isAdmin = roles?.some(r => r.role === "super_admin" || r.role === "admin");
    if (!isAdmin) { navigate("/admin/login"); return; }
    fetchSubmissions();
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("cv_submissions")
      .select("*")
      .order("date_creation", { ascending: false });
    if (error) toast.error("Erreur de chargement");
    else setSubmissions((data || []) as Submission[]);
    setLoading(false);
  };

  const handleAction = async (id: string, action: "validate" | "reject" | "delete") => {
    setActionLoading(id);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("admin-validate", {
        body: { id, action },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw new Error(res.error.message);
      const labels = { validate: "Paiement validé", reject: "Paiement refusé", delete: "Soumission supprimée" };
      toast.success(labels[action]);
      fetchSubmissions();
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const statusBadge = (statut: string) => {
    const colors: Record<string, string> = {
      en_attente: "bg-warning/20 text-warning",
      valide: "bg-success/20 text-success",
      refuse: "bg-destructive/20 text-destructive",
    };
    const labels: Record<string, string> = { en_attente: "En attente", valide: "Validé", refuse: "Refusé" };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[statut] || ""}`}>{labels[statut] || statut}</span>;
  };

  const productBadge = (productType: string | null) => {
    if (productType === "LETTRE_PREMIUM") {
      return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-warning/20 text-warning">👑 Premium</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">Standard</span>;
  };

  const pendingCount = submissions.filter(s => s.statut === "en_attente").length;
  const filtered = statusFilter === "tous" ? submissions : submissions.filter(s => s.statut === statusFilter);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold text-foreground">Administration GEDOC</h1>
          {pendingCount > 0 && (
            <span className="bg-warning text-warning-foreground text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
              {pendingCount} en attente
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate("/admin/stats")} className="p-2 text-primary"><BarChart3 className="h-4 w-4" /></button>
          <button onClick={fetchSubmissions} className="p-2 text-muted-foreground"><RefreshCw className="h-4 w-4" /></button>
          <button onClick={handleLogout} className="p-2 text-destructive"><LogOut className="h-4 w-4" /></button>
        </div>
      </header>

      <div className="p-4">
        {/* Status filter */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          {[
            { value: "tous", label: "Tous" },
            { value: "en_attente", label: "En attente" },
            { value: "valide", label: "Validés" },
            { value: "refuse", label: "Refusés" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {f.label} {f.value !== "tous" ? `(${submissions.filter(s => s.statut === f.value).length})` : `(${submissions.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Chargement...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Aucune soumission</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((s) => (
              <div key={s.id} className="bg-card border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-foreground text-sm">{s.nom}</p>
                    <p className="text-xs text-muted-foreground">{s.telephone}</p>
                  </div>
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    {productBadge(s.product_type)}
                    {statusBadge(s.statut)}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground space-y-1 mb-3">
                  <p><span className="font-medium">Lettre :</span> {s.type_lettre}</p>
                  <p><span className="font-medium">Produit :</span> {s.product_type || "LETTRE_STANDARD"}</p>
                  <p><span className="font-medium">Prix attendu :</span> {s.product_price || 500} FCFA</p>
                  <p><span className="font-medium">Transaction :</span> {s.numero_transaction}</p>
                  <p><span className="font-medium">Date :</span> {new Date(s.date_creation).toLocaleDateString("fr-FR")}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {s.statut === "en_attente" && (
                    <>
                      <button
                        onClick={() => handleAction(s.id, "validate")}
                        disabled={actionLoading === s.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-success text-success-foreground rounded-lg text-xs font-medium disabled:opacity-50"
                      >
                        <Check className="h-3 w-3" /> Valider
                      </button>
                      <button
                        onClick={() => handleAction(s.id, "reject")}
                        disabled={actionLoading === s.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-destructive text-destructive-foreground rounded-lg text-xs font-medium disabled:opacity-50"
                      >
                        <X className="h-3 w-3" /> Refuser
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setViewLetter(viewLetter === s.id ? null : s.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium"
                  >
                    <Eye className="h-3 w-3" /> Voir
                  </button>
                  <button
                    onClick={() => handleAction(s.id, "delete")}
                    disabled={actionLoading === s.id}
                    className="flex items-center gap-1 px-3 py-1.5 bg-destructive/10 text-destructive rounded-lg text-xs font-medium disabled:opacity-50"
                  >
                    <Trash2 className="h-3 w-3" /> Supprimer
                  </button>
                </div>
                {viewLetter === s.id && (
                  <div className="mt-3 bg-muted rounded-lg p-3 text-xs whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {s.contenu_lettre}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
