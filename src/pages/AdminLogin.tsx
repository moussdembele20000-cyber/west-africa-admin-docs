import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lock } from "lucide-react";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Check admin role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);

      const isAdmin = roles?.some(r => r.role === "super_admin" || r.role === "admin");
      if (!isAdmin) {
        await supabase.auth.signOut();
        toast.error("Accès refusé : vous n'êtes pas administrateur");
        return;
      }

      toast.success("Connexion réussie");
      navigate("/admin/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="bg-primary/10 rounded-full p-3 w-fit mx-auto mb-3">
            <Lock className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Administration GEDOC</h1>
          <p className="text-sm text-muted-foreground mt-1">Connexion administrateur</p>
        </div>

        <form onSubmit={handleLogin} className="bg-card border rounded-lg p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-input rounded-lg px-3 py-2.5 text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="admin@lettres-app.local"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Mot de passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-input rounded-lg px-3 py-2.5 text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg text-sm disabled:opacity-50"
          >
            {loading ? "Connexion..." : "SE CONNECTER"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
