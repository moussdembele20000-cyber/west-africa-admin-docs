import { useNavigate } from "react-router-dom";
import { letterTypes } from "@/data/letterTypes";
import { FileText, Plus, Crown } from "lucide-react";
import InstallPWA from "@/components/InstallPWA";

const Index = () => {
  const navigate = useNavigate();
  const popularTypes = letterTypes.filter((t) => t.popular);
  const standardTypes = letterTypes.filter((t) => t.tier === "standard" && !t.popular);
  const premiumTypes = letterTypes.filter((t) => t.tier === "premium" && !t.popular);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary rounded-lg p-2">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">GEDOC</h1>
            <p className="text-xs text-muted-foreground">Lettres administratives</p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 max-w-lg mx-auto">
        <InstallPWA />

        {/* Hero */}
        <section className="text-center mb-8">
          <h2 className="text-xl font-bold text-foreground mb-2">
            Générateur de lettres administratives
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            Créez rapidement vos lettres officielles prêtes à imprimer
          </p>
          <button
            onClick={() => navigate("/choisir")}
            className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-lg text-base shadow-sm active:scale-[0.98] transition-transform"
          >
            <Plus className="inline-block h-5 w-5 mr-2 -mt-0.5" />
            CRÉER UNE LETTRE
          </button>
        </section>

        {/* Popular */}
        <section className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Les plus demandées
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {popularTypes.map((type) => {
              const Icon = type.icon;
              const isPremium = type.tier === "premium";
              return (
                <button
                  key={type.id}
                  onClick={() => navigate(`/formulaire/${type.id}`)}
                  className="bg-card border rounded-lg p-4 text-left active:scale-[0.97] transition-transform relative"
                >
                  {isPremium && (
                    <span className="absolute top-2 right-2 bg-warning/15 text-warning text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <Crown className="h-3 w-3" /> PRO
                    </span>
                  )}
                  <div className={`rounded-md p-2 w-fit mb-2 ${isPremium ? "bg-warning/10" : "bg-accent"}`}>
                    <Icon className={`h-5 w-5 ${isPremium ? "text-warning" : "text-accent-foreground"}`} />
                  </div>
                  <p className="text-sm font-medium text-foreground leading-tight">
                    {type.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {type.description}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Standard */}
        <section className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Standard — 500 FCFA
            </h3>
            <span className="bg-secondary text-secondary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
              {standardTypes.length + popularTypes.filter(t => t.tier === "standard").length} modèles
            </span>
          </div>
          <div className="space-y-2">
            {standardTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => navigate(`/formulaire/${type.id}`)}
                  className="w-full bg-card border rounded-lg p-3.5 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
                >
                  <div className="bg-accent rounded-md p-2 shrink-0">
                    <Icon className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{type.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{type.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Premium */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold text-warning uppercase tracking-wide flex items-center gap-1">
              <Crown className="h-4 w-4" /> Premium — 1000 FCFA
            </h3>
            <span className="bg-warning/15 text-warning text-[10px] font-bold px-2 py-0.5 rounded-full">
              {premiumTypes.length + popularTypes.filter(t => t.tier === "premium").length} modèles
            </span>
          </div>
          <div className="space-y-2">
            {premiumTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => navigate(`/formulaire/${type.id}`)}
                  className="w-full bg-card border rounded-lg p-3.5 flex items-center gap-3 text-left active:scale-[0.98] transition-transform border-warning/20"
                >
                  <div className="bg-warning/10 rounded-md p-2 shrink-0">
                    <Icon className="h-4 w-4 text-warning" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{type.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{type.description}</p>
                  </div>
                  <Crown className="h-3.5 w-3.5 text-warning shrink-0" />
                </button>
              );
            })}
          </div>
        </section>

        <footer className="mt-10 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            GEDOC — Afrique de l'Ouest
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Index;
