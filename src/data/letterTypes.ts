import { FileText, Briefcase, GraduationCap, Building2, HandCoins, Shield, Users, Home, Baby, AlertCircle, FileSearch, Globe, Award, Scale, Clock, BookOpen, Landmark, HeartHandshake, Stamp, FilePen, PenLine, Gavel, FileCheck, UserCheck, Send, FileOutput, Receipt, Plane, Building, ScrollText, Megaphone, BadgeCheck } from "lucide-react";

export interface LetterType {
  id: string;
  title: string;
  description: string;
  icon: typeof FileText;
  popular?: boolean;
  tier: "standard" | "premium";
}

// ── 10 MODÈLES STANDARD (500 FCFA) ──
export const standardLetterTypes: LetterType[] = [
  {
    id: "demande-emploi",
    title: "Demande d'emploi",
    description: "Postuler à un poste dans une administration ou entreprise",
    icon: Briefcase,
    popular: true,
    tier: "standard",
  },
  {
    id: "demande-stage",
    title: "Demande de stage",
    description: "Solliciter un stage académique ou professionnel",
    icon: GraduationCap,
    popular: true,
    tier: "standard",
  },
  {
    id: "lettre-motivation",
    title: "Lettre de motivation",
    description: "Accompagner une candidature avec une lettre personnalisée",
    icon: FileText,
    popular: true,
    tier: "standard",
  },
  {
    id: "demande-maire",
    title: "Demande au maire",
    description: "Adresser une demande officielle au maire de votre commune",
    icon: Building2,
    tier: "standard",
  },
  {
    id: "aide-financiere",
    title: "Demande d'aide financière",
    description: "Solliciter une aide ou un soutien financier",
    icon: HandCoins,
    tier: "standard",
  },
  {
    id: "attestation-honneur",
    title: "Attestation sur l'honneur",
    description: "Déclarer sur l'honneur un fait ou une situation",
    icon: Shield,
    tier: "standard",
  },
  {
    id: "procuration",
    title: "Procuration",
    description: "Autoriser une personne à agir en votre nom",
    icon: Users,
    tier: "standard",
  },
  {
    id: "demande-logement",
    title: "Demande de logement",
    description: "Solliciter l'attribution d'un logement",
    icon: Home,
    tier: "standard",
  },
  {
    id: "autorisation-parentale",
    title: "Autorisation parentale",
    description: "Autoriser un mineur à effectuer une activité",
    icon: Baby,
    tier: "standard",
  },
  {
    id: "reclamation",
    title: "Réclamation administrative",
    description: "Formuler une plainte ou réclamation officielle",
    icon: AlertCircle,
    tier: "standard",
  },
];

// ── 20 MODÈLES PREMIUM (1000 FCFA) ──
export const premiumLetterTypes: LetterType[] = [
  {
    id: "demande-bourse",
    title: "Demande de bourse",
    description: "Solliciter une bourse d'études ou de formation",
    icon: Award,
    popular: true,
    tier: "premium",
  },
  {
    id: "lettre-ambassade",
    title: "Lettre à une ambassade",
    description: "Adresser une demande à une représentation diplomatique",
    icon: Globe,
    tier: "premium",
  },
  {
    id: "extrait-administratif",
    title: "Demande d'extrait administratif",
    description: "Demander un extrait ou certificat administratif",
    icon: FileSearch,
    tier: "premium",
  },
  {
    id: "demande-mutation",
    title: "Demande de mutation",
    description: "Solliciter un changement d'affectation professionnelle",
    icon: Send,
    tier: "premium",
  },
  {
    id: "demande-disponibilite",
    title: "Mise en disponibilité",
    description: "Demander une mise en disponibilité de la fonction publique",
    icon: Clock,
    tier: "premium",
  },
  {
    id: "demande-reintegration",
    title: "Demande de réintégration",
    description: "Solliciter une réintégration après disponibilité ou suspension",
    icon: UserCheck,
    tier: "premium",
  },
  {
    id: "demande-detachement",
    title: "Demande de détachement",
    description: "Solliciter un détachement vers une autre administration",
    icon: FileOutput,
    tier: "premium",
  },
  {
    id: "lettre-demission",
    title: "Lettre de démission",
    description: "Notifier officiellement votre départ d'un poste",
    icon: FilePen,
    tier: "premium",
  },
  {
    id: "demande-conge",
    title: "Demande de congé",
    description: "Solliciter un congé annuel, maladie ou exceptionnel",
    icon: Plane,
    tier: "premium",
  },
  {
    id: "demande-promotion",
    title: "Demande de promotion",
    description: "Solliciter un avancement de grade ou de poste",
    icon: BadgeCheck,
    tier: "premium",
  },
  {
    id: "lettre-recommandation",
    title: "Lettre de recommandation",
    description: "Recommander officiellement un collaborateur ou étudiant",
    icon: PenLine,
    tier: "premium",
  },
  {
    id: "demande-transfert-scolaire",
    title: "Demande de transfert scolaire",
    description: "Solliciter le transfert d'un élève vers un autre établissement",
    icon: BookOpen,
    tier: "premium",
  },
  {
    id: "demande-equivalence",
    title: "Demande d'équivalence",
    description: "Solliciter la reconnaissance d'un diplôme étranger",
    icon: ScrollText,
    tier: "premium",
  },
  {
    id: "plainte-officielle",
    title: "Plainte officielle",
    description: "Déposer une plainte formelle auprès d'une autorité compétente",
    icon: Gavel,
    tier: "premium",
  },
  {
    id: "demande-regularisation",
    title: "Demande de régularisation",
    description: "Régulariser une situation administrative en attente",
    icon: FileCheck,
    tier: "premium",
  },
  {
    id: "mise-en-demeure",
    title: "Mise en demeure",
    description: "Adresser une mise en demeure formelle et juridique",
    icon: Scale,
    tier: "premium",
  },
  {
    id: "demande-audience",
    title: "Demande d'audience",
    description: "Solliciter une audience auprès d'une haute autorité",
    icon: Landmark,
    tier: "premium",
  },
  {
    id: "lettre-resiliation",
    title: "Lettre de résiliation",
    description: "Résilier un contrat, abonnement ou convention",
    icon: Receipt,
    tier: "premium",
  },
  {
    id: "demande-certification",
    title: "Demande de certification",
    description: "Solliciter la certification ou l'homologation d'un document",
    icon: Stamp,
    tier: "premium",
  },
  {
    id: "lettre-appel",
    title: "Lettre d'appel",
    description: "Contester une décision administrative ou disciplinaire",
    icon: Megaphone,
    tier: "premium",
  },
];

// Combiné pour compatibilité
export const letterTypes: LetterType[] = [...standardLetterTypes, ...premiumLetterTypes];

export const westAfricanCountries = [
  "Sénégal",
  "Côte d'Ivoire",
  "Mali",
  "Burkina Faso",
  "Bénin",
  "Guinée",
  "Togo",
  "Niger",
];
