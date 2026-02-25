import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { letterTypes, westAfricanCountries } from "@/data/letterTypes";
import { LetterFormData } from "@/data/letterGenerator";
import { ArrowLeft } from "lucide-react";

const LetterForm = () => {
  const { typeId } = useParams<{ typeId: string }>();
  const navigate = useNavigate();
  const letterType = letterTypes.find((t) => t.id === typeId);

  const [form, setForm] = useState<LetterFormData>({
    senderName: "",
    senderAddress: "",
    senderCity: "",
    senderCountry: "Sénégal",
    senderPhone: "",
    senderEmail: "",
    recipientTitle: "",
    recipientOrganization: "",
    recipientAddress: "",
    recipientCity: "",
    recipientCountry: "Sénégal",
    subject: "",
    description: "",
    writingCity: "",
    gender: "monsieur",
    formality: "standard",
    letterTypeId: typeId || "",
  });

  const update = (field: keyof LetterFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save form data to sessionStorage
    sessionStorage.setItem("gedoc-form", JSON.stringify(form));
    navigate("/apercu");
  };

  if (!letterType) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Modèle introuvable</p>
      </div>
    );
  }

  const inputClass = "w-full border border-input rounded-lg px-3 py-2.5 text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";
  const labelClass = "block text-xs font-medium text-muted-foreground mb-1";
  const sectionClass = "mb-6";
  const sectionTitleClass = "text-sm font-semibold text-foreground mb-3 pb-1 border-b";

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="h-5 w-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-base font-semibold text-foreground">{letterType.title}</h1>
          <p className="text-xs text-muted-foreground">Remplissez le formulaire</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="px-4 py-5 max-w-lg mx-auto">
        {/* Expéditeur */}
        <div className={sectionClass}>
          <h2 className={sectionTitleClass}>Vos informations</h2>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Nom complet *</label>
              <input required className={inputClass} placeholder="Ex: Amadou Diallo" value={form.senderName} onChange={(e) => update("senderName", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Adresse *</label>
              <input required className={inputClass} placeholder="Ex: Quartier Médina, Rue 12" value={form.senderAddress} onChange={(e) => update("senderAddress", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Ville *</label>
                <input required className={inputClass} placeholder="Ex: Dakar" value={form.senderCity} onChange={(e) => update("senderCity", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Pays *</label>
                <select required className={inputClass} value={form.senderCountry} onChange={(e) => update("senderCountry", e.target.value)}>
                  {westAfricanCountries.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Téléphone *</label>
              <input required type="tel" className={inputClass} placeholder="Ex: +221 77 123 45 67" value={form.senderPhone} onChange={(e) => update("senderPhone", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Email (optionnel)</label>
              <input type="email" className={inputClass} placeholder="Ex: amadou@email.com" value={form.senderEmail} onChange={(e) => update("senderEmail", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Destinataire */}
        <div className={sectionClass}>
          <h2 className={sectionTitleClass}>Destinataire</h2>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Fonction / Titre *</label>
              <input required className={inputClass} placeholder="Ex: Monsieur le Directeur" value={form.recipientTitle} onChange={(e) => update("recipientTitle", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Administration / Organisation *</label>
              <input required className={inputClass} placeholder="Ex: Ministère de l'Éducation" value={form.recipientOrganization} onChange={(e) => update("recipientOrganization", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Adresse *</label>
              <input required className={inputClass} placeholder="Ex: Avenue de la République" value={form.recipientAddress} onChange={(e) => update("recipientAddress", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Ville *</label>
                <input required className={inputClass} placeholder="Ex: Dakar" value={form.recipientCity} onChange={(e) => update("recipientCity", e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Pays *</label>
                <select required className={inputClass} value={form.recipientCountry} onChange={(e) => update("recipientCountry", e.target.value)}>
                  {westAfricanCountries.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Lettre */}
        <div className={sectionClass}>
          <h2 className={sectionTitleClass}>Contenu de la lettre</h2>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Objet *</label>
              <input required className={inputClass} placeholder="Ex: Demande de stage" value={form.subject} onChange={(e) => update("subject", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Description / Motif *</label>
              <textarea required className={`${inputClass} min-h-[100px] resize-y`} placeholder="Décrivez votre situation et votre demande..." value={form.description} onChange={(e) => update("description", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Ville d'écriture *</label>
              <input required className={inputClass} placeholder="Ex: Dakar" value={form.writingCity} onChange={(e) => update("writingCity", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Genre</label>
                <select className={inputClass} value={form.gender} onChange={(e) => update("gender", e.target.value)}>
                  <option value="monsieur">Monsieur</option>
                  <option value="madame">Madame</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Formalité</label>
                <select className={inputClass} value={form.formality} onChange={(e) => update("formality", e.target.value)}>
                  <option value="standard">Standard</option>
                  <option value="tres-formel">Très formel</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground font-semibold py-3.5 rounded-lg text-base shadow-sm active:scale-[0.98] transition-transform mb-8"
        >
          GÉNÉRER LA LETTRE
        </button>
      </form>
    </div>
  );
};

export default LetterForm;
