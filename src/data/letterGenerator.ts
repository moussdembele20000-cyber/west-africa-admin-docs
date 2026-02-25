export interface LetterFormData {
  senderName: string;
  senderAddress: string;
  senderCity: string;
  senderCountry: string;
  senderPhone: string;
  senderEmail: string;
  recipientTitle: string;
  recipientOrganization: string;
  recipientAddress: string;
  recipientCity: string;
  recipientCountry: string;
  subject: string;
  description: string;
  writingCity: string;
  gender: "monsieur" | "madame";
  formality: "standard" | "tres-formel";
  letterTypeId: string;
}

const formatDate = (date: Date): string => {
  const months = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre"
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const getAppellation = (gender: string, formality: string): string => {
  const title = gender === "madame" ? "Madame" : "Monsieur";
  return `${title},`;
};

const getPolitesse = (gender: string, recipientTitle: string, formality: string): string => {
  const title = recipientTitle || (gender === "madame" ? "Madame" : "Monsieur");
  if (formality === "tres-formel") {
    return `Je vous prie d'agréer, ${title}, l'expression de ma très haute considération et de mon profond respect.`;
  }
  return `Je vous prie d'agréer, ${title}, l'expression de mes salutations distinguées.`;
};

const getBody = (data: LetterFormData): string => {
  const { letterTypeId, description, gender, formality, senderName, senderAddress, senderCity, senderCountry } = data;
  const honneur = formality === "tres-formel" ? "J'ai l'honneur de" : "Je me permets de";

  const bodies: Record<string, string> = {
    // ── STANDARD ──
    "demande-emploi": `${honneur} venir très respectueusement auprès de votre haute bienveillance solliciter un emploi au sein de votre structure.\n\n${description}\n\nFort(e) de mes compétences et de ma motivation, je reste convaincu(e) de pouvoir apporter une contribution significative à votre organisation. Je me tiens à votre entière disposition pour un entretien au cours duquel je pourrai vous exposer plus en détail mes aptitudes.`,

    "demande-stage": `${honneur} venir très respectueusement auprès de votre haute bienveillance solliciter un stage au sein de votre établissement.\n\n${description}\n\nCe stage me permettrait d'acquérir une expérience pratique précieuse et de mettre en application les connaissances acquises au cours de ma formation. Je m'engage à faire preuve de sérieux et de professionnalisme.`,

    "lettre-motivation": `${honneur} vous adresser ma candidature pour le poste mentionné en objet.\n\n${description}\n\nMa formation et mon expérience me permettent d'affirmer que je possède les qualités requises pour occuper ce poste avec efficacité. Je suis disponible pour un entretien à votre convenance.`,

    "demande-maire": `${honneur} venir très respectueusement auprès de votre haute autorité pour vous adresser la présente demande.\n\n${description}\n\nJe compte sur votre bienveillance habituelle et votre sens de l'écoute pour accorder une suite favorable à ma requête.`,

    "aide-financiere": `${honneur} venir très respectueusement auprès de votre haute bienveillance solliciter une aide financière.\n\n${description}\n\nFace à cette situation, je sollicite votre générosité et votre compréhension pour m'accorder un soutien financier qui me serait d'une aide précieuse.`,

    "attestation-honneur": `Je soussigné(e) ${senderName}, demeurant à ${senderAddress}, ${senderCity}, ${senderCountry}, atteste sur l'honneur que :\n\n${description}\n\nFaite pour servir et valoir ce que de droit.`,

    "procuration": `Je soussigné(e) ${senderName}, demeurant à ${senderAddress}, ${senderCity}, donne par la présente procuration à :\n\n${description}\n\nPour agir en mon nom et pour mon compte dans le cadre de la mission ci-dessus mentionnée. Fait pour servir et valoir ce que de droit.`,

    "demande-logement": `${honneur} venir très respectueusement auprès de votre haute bienveillance solliciter l'attribution d'un logement.\n\n${description}\n\nJe m'engage à respecter toutes les conditions liées à l'occupation dudit logement et à en prendre le plus grand soin.`,

    "autorisation-parentale": `Je soussigné(e) ${senderName}, agissant en qualité de père/mère de l'enfant concerné, autorise par la présente :\n\n${description}\n\nFait pour servir et valoir ce que de droit.`,

    "reclamation": `${honneur} porter à votre attention la réclamation suivante.\n\n${description}\n\nJe vous saurais gré de bien vouloir examiner cette situation avec la plus grande attention et de m'apporter une réponse dans les meilleurs délais.`,

    // ── PREMIUM ──
    "demande-bourse": `${honneur} venir très respectueusement auprès de votre haute bienveillance solliciter l'octroi d'une bourse d'études.\n\n${description}\n\nConscient(e) de l'importance de cette opportunité pour mon parcours académique et professionnel, je m'engage à faire preuve d'assiduité, de rigueur et de sérieux dans mes études. Je suis disposé(e) à justifier de la bonne utilisation de cette bourse par des résultats académiques probants.\n\nJe reste à votre entière disposition pour fournir tout document complémentaire que vous jugeriez nécessaire à l'instruction de mon dossier.`,

    "lettre-ambassade": `${honneur} venir très respectueusement auprès de votre Excellence solliciter votre bienveillante attention sur la demande suivante.\n\n${description}\n\nJe tiens à assurer votre Excellence de ma bonne foi et de mon engagement à respecter l'ensemble des dispositions réglementaires en vigueur. Je me tiens à la disposition de vos services pour tout complément d'information ou tout document justificatif qui pourrait s'avérer nécessaire.\n\nDans l'attente d'une suite favorable, je vous prie de bien vouloir agréer l'expression de ma très haute considération.`,

    "extrait-administratif": `${honneur} venir très respectueusement auprès de vos services solliciter la délivrance d'un extrait administratif.\n\n${description}\n\nCe document m'est indispensable pour la constitution d'un dossier administratif de la plus haute importance. Je vous serais infiniment reconnaissant(e) de bien vouloir traiter cette demande avec la diligence qui s'impose et de me faire parvenir ledit document dans les meilleurs délais.`,

    "demande-mutation": `${honneur} venir très respectueusement auprès de votre haute autorité solliciter une mutation professionnelle.\n\n${description}\n\nCette mutation me permettrait de poursuivre ma carrière dans des conditions plus favorables tout en continuant à servir avec le même dévouement et la même rigueur professionnelle qui ont toujours caractérisé mon engagement. Je m'engage à assurer une transition harmonieuse de mes responsabilités actuelles.\n\nJe reste à votre disposition pour tout entretien que vous jugeriez utile.`,

    "demande-disponibilite": `${honneur} venir très respectueusement auprès de votre haute bienveillance solliciter une mise en disponibilité.\n\n${description}\n\nJe suis pleinement conscient(e) des implications de cette demande sur ma carrière et m'engage à respecter l'ensemble des dispositions statutaires et réglementaires qui régissent la mise en disponibilité dans la fonction publique. Je me tiens à votre disposition pour fournir tout justificatif complémentaire.\n\nJe sollicite votre bienveillance pour l'examen favorable de cette demande.`,

    "demande-reintegration": `${honneur} venir très respectueusement auprès de votre haute autorité solliciter ma réintégration au sein de l'administration.\n\n${description}\n\nAyant bénéficié d'une période de disponibilité conformément aux dispositions réglementaires en vigueur, je souhaite reprendre mes fonctions avec un engagement renouvelé. L'expérience acquise durant cette période constitue un atout supplémentaire que je mets au service de l'administration.\n\nJe m'engage à me conformer à toute affectation qui sera décidée par l'autorité compétente.`,

    "demande-detachement": `${honneur} venir très respectueusement auprès de votre haute autorité solliciter mon détachement auprès d'une autre administration.\n\n${description}\n\nCe détachement s'inscrit dans une démarche de développement professionnel et permettrait de renforcer la coopération interinstitutionnelle. Je m'engage à maintenir le niveau d'excellence et de professionnalisme attendu dans l'exercice de mes nouvelles fonctions.\n\nJe reste à votre disposition pour tout complément d'information relatif à cette demande.`,

    "lettre-demission": `${honneur} vous informer par la présente de ma décision de démissionner de mes fonctions.\n\n${description}\n\nJe tiens à exprimer ma profonde gratitude pour la confiance qui m'a été accordée durant toute la période de ma collaboration avec votre structure. Les compétences acquises et les expériences vécues constituent un enrichissement professionnel inestimable.\n\nJe m'engage à respecter le préavis réglementaire et à assurer une passation complète et ordonnée de mes dossiers et responsabilités. Je reste disponible pour faciliter la transition dans les meilleures conditions.`,

    "demande-conge": `${honneur} venir très respectueusement auprès de votre haute bienveillance solliciter un congé.\n\n${description}\n\nJe m'engage à prendre toutes les dispositions nécessaires pour assurer la continuité du service durant mon absence. L'ensemble de mes dossiers en cours sera transmis à mon remplaçant désigné avec les instructions appropriées.\n\nJe sollicite votre bienveillante compréhension pour l'octroi de ce congé et reste à votre disposition pour toute précision complémentaire.`,

    "demande-promotion": `${honneur} venir très respectueusement auprès de votre haute autorité solliciter un avancement de grade.\n\n${description}\n\nFort(e) de plusieurs années d'expérience au sein de votre structure, j'ai constamment œuvré à l'atteinte des objectifs fixés avec professionnalisme et dévouement. Mes évaluations successives attestent de la qualité de mon engagement et de mes performances.\n\nJe nourris l'ambition de mettre mes compétences renforcées au service de responsabilités élargies, dans l'intérêt supérieur de notre institution.`,

    "lettre-recommandation": `Je soussigné(e) ${senderName}, certifie par la présente recommander vivement la personne désignée ci-après.\n\n${description}\n\nAu cours de notre collaboration, j'ai pu apprécier ses qualités exceptionnelles tant sur le plan professionnel que humain : rigueur intellectuelle, sens des responsabilités, capacité d'adaptation remarquable et intégrité irréprochable. Sa contribution a été déterminante dans la réussite de plusieurs projets stratégiques.\n\nJe recommande cette personne sans la moindre réserve et reste à la disposition de tout organisme souhaitant obtenir des informations complémentaires sur ses compétences et aptitudes.`,

    "demande-transfert-scolaire": `${honneur} venir très respectueusement auprès de votre haute autorité solliciter le transfert scolaire de l'élève concerné.\n\n${description}\n\nCe transfert est motivé par des raisons impérieuses et vise à garantir la continuité pédagogique de l'élève dans les meilleures conditions possibles. Le dossier scolaire complet, comprenant les bulletins, les attestations et les certificats nécessaires, est joint à la présente demande.\n\nJe vous serais reconnaissant(e) de bien vouloir faciliter cette démarche dans les meilleurs délais.`,

    "demande-equivalence": `${honneur} venir très respectueusement auprès de votre haute autorité solliciter la reconnaissance et l'équivalence de mon diplôme.\n\n${description}\n\nLe diplôme dont je sollicite l'équivalence a été obtenu dans un établissement reconnu et accrédité. Je joins à la présente l'ensemble des documents justificatifs requis, dûment certifiés conformes : copie légalisée du diplôme, relevés de notes, programme détaillé de formation et traduction assermentée le cas échéant.\n\nCette équivalence est indispensable à la poursuite de mon projet professionnel et académique.`,

    "plainte-officielle": `${honneur} porter à votre connaissance les faits graves suivants qui nécessitent votre intervention urgente.\n\n${description}\n\nCes faits constituent une violation manifeste des dispositions légales et réglementaires en vigueur et portent un préjudice considérable à mes droits. Je sollicite l'ouverture d'une enquête approfondie et la prise de mesures correctives appropriées.\n\nJe me réserve le droit de saisir les juridictions compétentes si aucune suite favorable n'est donnée à la présente plainte dans un délai raisonnable. Les pièces justificatives sont jointes au présent courrier.`,

    "demande-regularisation": `${honneur} venir très respectueusement auprès de votre haute autorité solliciter la régularisation de ma situation administrative.\n\n${description}\n\nCette situation irrégulière, indépendante de ma volonté, cause un préjudice significatif à mes droits et me place dans une situation d'incertitude juridique préoccupante. Je joins à la présente l'ensemble des pièces justificatives nécessaires à l'instruction de mon dossier.\n\nJe m'engage à me conformer à toute procédure complémentaire qui serait requise pour la résolution définitive de cette situation.`,

    "mise-en-demeure": `Par la présente, je vous mets formellement en demeure de satisfaire aux obligations suivantes dans un délai de quinze (15) jours à compter de la réception de ce courrier.\n\n${description}\n\nÀ défaut d'exécution dans le délai imparti, je me verrai dans l'obligation de saisir les juridictions compétentes pour faire valoir mes droits, sans qu'il soit besoin d'une nouvelle mise en demeure. Dans cette hypothèse, je solliciterai en outre la condamnation aux dépens ainsi qu'au paiement de dommages et intérêts pour le préjudice subi.\n\nJe vous invite à prendre la mesure de la présente mise en demeure et à y donner suite dans les meilleurs délais.`,

    "demande-audience": `${honneur} venir très respectueusement auprès de votre haute autorité solliciter l'honneur d'être reçu(e) en audience.\n\n${description}\n\nL'objet de cette audience revêt une importance particulière et nécessite un échange direct avec votre personne pour exposer avec précision les enjeux de ma démarche. Je me conformerai naturellement à votre emploi du temps et me rendrai disponible à la date et à l'heure que vous aurez la bonté de fixer.\n\nJe vous assure de mon profond respect et de ma considération la plus distinguée.`,

    "lettre-resiliation": `Par la présente, je vous notifie ma décision de résilier le contrat/abonnement référencé en objet, conformément aux dispositions contractuelles et légales en vigueur.\n\n${description}\n\nJe vous demande de bien vouloir prendre acte de cette résiliation et de procéder aux formalités nécessaires, notamment la clôture définitive de mon compte et le remboursement de tout trop-perçu éventuel. Je vous prie de m'adresser un accusé de réception de la présente résiliation dans les meilleurs délais.\n\nEn cas de non-respect de ces obligations, je me réserve le droit de saisir les instances compétentes.`,

    "demande-certification": `${honneur} venir très respectueusement auprès de votre haute autorité solliciter la certification officielle du document mentionné en objet.\n\n${description}\n\nCette certification est indispensable pour authentifier le document en question et lui conférer une valeur juridique et administrative pleine et entière. Je joins à la présente les pièces originales ainsi que les copies requises pour la procédure de certification.\n\nJe vous serais infiniment reconnaissant(e) de bien vouloir accélérer le traitement de cette demande compte tenu de son caractère urgent.`,

    "lettre-appel": `${honneur} former par la présente un recours gracieux à l'encontre de la décision référencée en objet, dont j'estime qu'elle est entachée d'irrégularité.\n\n${description}\n\nCette décision me cause un préjudice grave et méconnaît les dispositions légales et réglementaires applicables en la matière. Je sollicite le réexamen attentif de mon dossier à la lumière des éléments nouveaux ci-joints et demande l'annulation ou la révision de ladite décision.\n\nÀ défaut de réponse favorable dans un délai de deux mois, je me réserve le droit de former un recours contentieux devant les juridictions compétentes.`,
  };

  return bodies[letterTypeId] || `${honneur} vous adresser la présente demande.\n\n${description}\n\nJe reste à votre entière disposition pour tout renseignement complémentaire.`;
};

export const generateLetter = (data: LetterFormData): string => {
  const date = formatDate(new Date());
  const appellation = getAppellation(data.gender, data.formality);
  const body = getBody(data);
  const politesse = getPolitesse(data.gender, data.recipientTitle, data.formality);

  return `${data.senderName}
${data.senderAddress}
${data.senderCity}, ${data.senderCountry}
Tél : ${data.senderPhone}${data.senderEmail ? `\nEmail : ${data.senderEmail}` : ""}


${" ".repeat(40)}${data.recipientTitle}
${" ".repeat(40)}${data.recipientOrganization}
${" ".repeat(40)}${data.recipientAddress}
${" ".repeat(40)}${data.recipientCity}, ${data.recipientCountry}


${" ".repeat(40)}${data.writingCity}, le ${date}


Objet : ${data.subject}


${appellation}

${body}

${politesse}


${data.senderName}`;
};
