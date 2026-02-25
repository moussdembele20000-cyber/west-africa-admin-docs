import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LetterFormData, generateLetter } from "@/data/letterGenerator";
import { letterTypes } from "@/data/letterTypes";
import { ArrowLeft, Copy, Download, Edit, Check, Smartphone, Loader2, Crown, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";

interface Product {
  id: string;
  name: string;
  price: number;
  description: string | null;
}

const LetterPreview = () => {
  const navigate = useNavigate();
  const [letter, setLetter] = useState("");
  const [formData, setFormData] = useState<LetterFormData | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [pdfStatus, setPdfStatus] = useState<{ paiement_valide: boolean; pdf_debloque: boolean; statut: string; product_type?: string } | null>(null);
  const [transactionNumber, setTransactionNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const letterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("gedoc-form");
    if (saved) {
      const data: LetterFormData = JSON.parse(saved);
      setFormData(data);
      setLetter(generateLetter(data));
    }
    const savedId = sessionStorage.getItem("gedoc-submission-id");
    if (savedId) {
      setSubmissionId(savedId);
      checkSubmissionStatus(savedId);
    }
    fetchProducts();
  }, []);

  // Polling every 10 seconds when waiting for validation
  useEffect(() => {
    if (!submissionId || pdfStatus?.paiement_valide) return;
    const interval = setInterval(() => {
      checkSubmissionStatus(submissionId);
    }, 10000);
    return () => clearInterval(interval);
  }, [submissionId, pdfStatus?.paiement_valide]);

  // Auto-download when payment validated
  useEffect(() => {
    if (pdfStatus?.paiement_valide && pdfStatus?.pdf_debloque && submissionId) {
      toast.success("Paiement validé — téléchargement en cours...");
      downloadAuthorizedPDF().then(() => {
        sessionStorage.removeItem("gedoc-submission-id");
        sessionStorage.removeItem("gedoc-form");
        setTimeout(() => navigate("/"), 2000);
      });
    }
  }, [pdfStatus?.paiement_valide, pdfStatus?.pdf_debloque]);

  // Auto-select the right product based on letter tier
  useEffect(() => {
    if (formData && products.length > 0 && !selectedProduct) {
      const lt = letterTypes.find((t) => t.id === formData.letterTypeId);
      const defaultProductId = lt?.tier === "premium" ? "LETTRE_PREMIUM" : "LETTRE_STANDARD";
      const match = products.find((p) => p.id === defaultProductId);
      if (match) setSelectedProduct(match);
    }
  }, [formData, products, selectedProduct]);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*");
    if (data) setProducts(data as Product[]);
  };

  const checkSubmissionStatus = async (id: string) => {
    setChecking(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-submission?id=${id}`,
        { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
      );
      const result = await res.json();
      if (res.status === 404) {
        // Submission no longer exists — clear stale session data
        sessionStorage.removeItem("gedoc-submission-id");
        setSubmissionId(null);
        setPdfStatus(null);
        return;
      }
      if (result.error) throw new Error(result.error);
      setPdfStatus(result);
    } catch (err: any) {
      console.error("Check error:", err);
    } finally {
      setChecking(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(letter);
    toast.success("Texte copié dans le presse-papier");
  };

  const handleDownloadPDF = async () => {
    if (!submissionId) {
      setShowPaywall(true);
      return;
    }
    await checkSubmissionStatus(submissionId);
    if (pdfStatus?.paiement_valide && pdfStatus?.pdf_debloque) {
      await downloadAuthorizedPDF();
    } else {
      toast.error("Paiement non encore validé par l'administration");
    }
  };

  const downloadAuthorizedPDF = async () => {
    if (!submissionId) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/download-pdf?id=${submissionId}`,
        { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
      );
      const result = await res.json();
      if (!result.authorized) {
        toast.error(result.error || "Paiement non validé");
        return;
      }
      generatePDFFromContent(result.contenu_lettre, result.type_lettre, result.product_type);
    } catch {
      toast.error("Erreur lors du téléchargement");
    }
  };

  const generatePDFFromContent = (content: string, typeName: string, productType?: string) => {
    const doc = new jsPDF("p", "mm", "a4");
    const isPremium = productType === "LETTRE_PREMIUM";
    const margin = isPremium ? 25 : 20;
    const pageWidth = 210 - margin * 2;
    const lineHeight = isPremium ? 7 : 6;
    let y = isPremium ? 35 : 25;

    if (isPremium) {
      // Premium header
      doc.setDrawColor(33, 85, 140);
      doc.setLineWidth(0.8);
      doc.line(margin, 15, 210 - margin, 15);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(33, 85, 140);
      doc.text("GEDOC — Document Officiel Premium", margin, 12);
      doc.setFont("times", "normal");
      doc.setFontSize(12);
      doc.setTextColor(30, 30, 30);
    } else {
      doc.setFont("times", "normal");
      doc.setFontSize(12);
    }

    const lines = content.split("\n");
    for (const line of lines) {
      const wrapped = doc.splitTextToSize(line || " ", pageWidth);
      for (const wl of wrapped) {
        if (y > 275) {
          doc.addPage();
          y = isPremium ? 25 : 20;
        }
        doc.text(wl, margin, y);
        y += lineHeight;
      }
    }

    if (isPremium) {
      // Premium footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setDrawColor(33, 85, 140);
        doc.setLineWidth(0.5);
        doc.line(margin, 285, 210 - margin, 285);
        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(`Page ${i}/${pageCount} — Généré par GEDOC Premium`, margin, 290);
      }
    }

    doc.save(`${typeName}-gedoc${isPremium ? "-premium" : ""}.pdf`);
    toast.success("PDF téléchargé avec succès");
  };

  const handleSubmitPayment = async () => {
    if (!transactionNumber.trim() || !formData || !selectedProduct) {
      toast.error("Veuillez choisir une offre et saisir le numéro de transaction");
      return;
    }
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("create-submission", {
        body: {
          nom: formData.senderName,
          email: formData.senderEmail || null,
          telephone: formData.senderPhone,
          type_lettre: formData.letterTypeId,
          contenu_lettre: letter,
          numero_transaction: transactionNumber.trim(),
          product_type: selectedProduct.id,
          product_price: selectedProduct.price,
          user_id: session?.user?.id || null,
        },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setSubmissionId(data.id);
      sessionStorage.setItem("gedoc-submission-id", data.id);
      setShowPaywall(false);
      toast.success("Soumission envoyée ! En attente de validation.");
      setPdfStatus({ paiement_valide: false, pdf_debloque: false, statut: "en_attente", product_type: selectedProduct.id });
    } catch (err: any) {
      if (err.message?.includes("déjà été utilisé")) {
        toast.error("Ce numéro de transaction a déjà été utilisé. Veuillez en saisir un autre.");
      } else {
        toast.error(err.message || "Erreur lors de la soumission");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!letter) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-3">Aucune lettre générée</p>
          <button onClick={() => navigate("/")} className="text-primary text-sm font-medium">Retour à l'accueil</button>
        </div>
      </div>
    );
  }

  const canDownload = pdfStatus?.paiement_valide && pdfStatus?.pdf_debloque;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1"><ArrowLeft className="h-5 w-5 text-foreground" /></button>
          <h1 className="text-base font-semibold text-foreground">Aperçu</h1>
        </div>
      </header>

      {/* Status bar */}
      {submissionId && pdfStatus && (
        <div className={`px-4 py-2 text-xs font-medium ${
          pdfStatus.statut === "valide" ? "bg-success/10 text-success" :
          pdfStatus.statut === "refuse" ? "bg-destructive/10 text-destructive" :
          "bg-warning/10 text-warning"
        }`}>
          {pdfStatus.statut === "valide" && "✓ Paiement validé — PDF disponible"}
          {pdfStatus.statut === "refuse" && "✗ Paiement refusé"}
          {pdfStatus.statut === "en_attente" && "⏳ En attente de validation administrateur"}
          <button onClick={() => checkSubmissionStatus(submissionId)} className="ml-2 underline">
            Actualiser
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 bg-card border-b flex gap-2 overflow-x-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium whitespace-nowrap">
          <Edit className="h-3.5 w-3.5" /> Modifier
        </button>
        <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium whitespace-nowrap">
          <Copy className="h-3.5 w-3.5" /> Copier
        </button>
        <button
          onClick={handleDownloadPDF}
          disabled={checking}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap ${
            canDownload ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground"
          }`}
        >
          {checking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          {canDownload ? "Télécharger PDF" : submissionId ? "PDF (en attente)" : "PDF (Premium)"}
        </button>
      </div>

      {/* Letter */}
      <div className="px-3 py-5">
        <div ref={letterRef} className="a4-preview mx-auto text-sm whitespace-pre-wrap">{letter}</div>
      </div>

      {/* Payment Modal with Standard/Premium choice */}
      {showPaywall && (
        <div className="fixed inset-0 bg-foreground/50 flex items-end z-50" onClick={() => setShowPaywall(false)}>
          <div className="w-full bg-card rounded-t-2xl p-6 pb-8 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-5" />
            <div className="text-center mb-5">
              <div className="bg-accent rounded-full p-3 w-fit mx-auto mb-3">
                <Smartphone className="h-7 w-7 text-accent-foreground" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-1">Choisissez votre offre</h2>
              <p className="text-sm text-muted-foreground">Sélectionnez puis payez via Mobile Money</p>
            </div>

            {/* Product selection */}
            <div className="space-y-3 mb-5">
              {products.map((product) => {
                const isPremium = product.id === "LETTRE_PREMIUM";
                const isSelected = selectedProduct?.id === product.id;
                return (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`w-full text-left border-2 rounded-xl p-4 transition-all ${
                      isSelected
                        ? "border-primary bg-accent"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {isPremium ? <Crown className="h-4 w-4 text-warning" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
                        <span className="font-semibold text-sm text-foreground">{product.name}</span>
                      </div>
                      <span className="font-bold text-foreground">{product.price} FCFA</span>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      {isPremium ? "Mise en page premium, en-tête et pied de page professionnels" : "Export PDF simple, format standard"}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="bg-muted rounded-lg p-3 mb-4">
              <p className="text-xs text-muted-foreground">Orange Money · MTN MoMo · Wave · Free Money</p>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Numéro de transaction *</label>
              <input
                type="text"
                value={transactionNumber}
                onChange={(e) => setTransactionNumber(e.target.value)}
                placeholder="Ex: TXN123456789"
                className="w-full border border-input rounded-lg px-3 py-2.5 text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              onClick={handleSubmitPayment}
              disabled={submitting || !transactionNumber.trim() || !selectedProduct}
              className="w-full bg-success text-success-foreground font-semibold py-3.5 rounded-lg text-base active:scale-[0.98] transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
              {selectedProduct ? `PAYER ${selectedProduct.price} FCFA` : "CHOISISSEZ UNE OFFRE"}
            </button>
            <p className="text-xs text-muted-foreground text-center mt-3">
              Votre PDF sera débloqué après validation par l'administration
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LetterPreview;
