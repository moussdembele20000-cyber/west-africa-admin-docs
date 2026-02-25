import { useNavigate } from "react-router-dom";
import { standardLetterTypes, premiumLetterTypes } from "@/data/letterTypes";
import { ArrowLeft, Crown } from "lucide-react";

const ChooseType = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate("/")} className="p-1">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <h1 className="text-base font-semibold text-foreground">Choisir un modèle</h1>
      </header>

      <main className="px-4 py-4 max-w-lg mx-auto">
        {/* Standard */}
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Standard — 500 FCFA</h2>
          <span className="bg-secondary text-secondary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">{standardLetterTypes.length}</span>
        </div>
        <div className="space-y-2 mb-6">
          {standardLetterTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => navigate(`/formulaire/${type.id}`)}
                className="w-full bg-card border rounded-lg p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
              >
                <div className="bg-accent rounded-md p-2.5 shrink-0">
                  <Icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{type.title}</p>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Premium */}
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-semibold text-warning uppercase tracking-wide flex items-center gap-1">
            <Crown className="h-4 w-4" /> Premium — 1000 FCFA
          </h2>
          <span className="bg-warning/15 text-warning text-[10px] font-bold px-2 py-0.5 rounded-full">{premiumLetterTypes.length}</span>
        </div>
        <div className="space-y-2">
          {premiumLetterTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => navigate(`/formulaire/${type.id}`)}
                className="w-full bg-card border rounded-lg p-4 flex items-center gap-3 text-left active:scale-[0.98] transition-transform border-warning/20"
              >
                <div className="bg-warning/10 rounded-md p-2.5 shrink-0">
                  <Icon className="h-5 w-5 text-warning" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{type.title}</p>
                  <p className="text-xs text-muted-foreground">{type.description}</p>
                </div>
                <Crown className="h-3.5 w-3.5 text-warning shrink-0" />
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default ChooseType;
