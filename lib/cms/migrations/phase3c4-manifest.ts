export interface LegacySourceCertCard {
  sourceIndex: number;
  publicId: string;
  name: string;
  issuer: string;
  imageUrl?: string;
  classification: "CERTIFICATION" | "AWARD_EVIDENCE" | "UNEXPECTED_SOURCE";
  mediaReferenceClassification: "TRUSTED_ORIGIN_DB_REFERENCE" | "FOREIGN_REFERENCE" | "MISSING_REFERENCE";
}

export interface CertificationMigrationTarget {
  manifestKey: string;
  publicId: string;
  name: string;
  issuer: string;
  mediaUrl?: string;
  requiredSkillSlugs: string[];
  publicationStatus: "published";
  displayOrder: number;
}

export const LEGACY_SOURCE_CARDS: LegacySourceCertCard[] = [
  {
    sourceIndex: 0,
    publicId: "cert_b5aab83e27c7e9a3c106a5f6",
    name: "Winner - Hackfest X Datathon 2026, Generative AI module",
    issuer: "Institute Of Business Administration (IBA), Karachi",
    imageUrl:
      "https://pub-211ba5144d3049149f7e5a7ab5ccf343.r2.dev/certificates/cert_b5aab83e27c7e9a3c106a5f6-winner-hackfest-x-datathon-2026-generative-ai-mo.png",
    classification: "AWARD_EVIDENCE",
    mediaReferenceClassification: "TRUSTED_ORIGIN_DB_REFERENCE",
  },
  {
    sourceIndex: 1,
    publicId: "cert_a2d0adc2534a92207a33e23c",
    name: "React – The Complete Guide (incl. Next.js, Redux)",
    issuer: "Udemy",
    imageUrl:
      "https://pub-211ba5144d3049149f7e5a7ab5ccf343.r2.dev/certificates/cert_a2d0adc2534a92207a33e23c-react-the-complete-guide-incl-next-js-redux.jpg",
    classification: "CERTIFICATION",
    mediaReferenceClassification: "TRUSTED_ORIGIN_DB_REFERENCE",
  },
  {
    sourceIndex: 2,
    publicId: "cert_059f546a9e6f169d21e4ccfe",
    name: "CSS – The Complete Guide (incl. Flexbox, Grid & Sass)",
    issuer: "Udemy",
    imageUrl:
      "https://pub-211ba5144d3049149f7e5a7ab5ccf343.r2.dev/certificates/cert_059f546a9e6f169d21e4ccfe-css-the-complete-guide-incl-flexbox-grid-sass.jpg",
    classification: "CERTIFICATION",
    mediaReferenceClassification: "TRUSTED_ORIGIN_DB_REFERENCE",
  },
  {
    sourceIndex: 3,
    publicId: "cert_d05b5eeb359c93e5366bef6e",
    name: "The Complete Full-Stack Web Development Bootcamp",
    issuer: "Udemy",
    imageUrl:
      "https://pub-211ba5144d3049149f7e5a7ab5ccf343.r2.dev/certificates/cert_d05b5eeb359c93e5366bef6e-the-complete-full-stack-web-development-bootcamp.jpg",
    classification: "CERTIFICATION",
    mediaReferenceClassification: "TRUSTED_ORIGIN_DB_REFERENCE",
  },
  {
    sourceIndex: 4,
    publicId: "cert_3b07042cc04c989fe4fae090",
    name: "Understanding Typescript",
    issuer: "Udemy",
    imageUrl:
      "https://pub-211ba5144d3049149f7e5a7ab5ccf343.r2.dev/certificates/cert_3b07042cc04c989fe4fae090-understanding-typescript.png",
    classification: "CERTIFICATION",
    mediaReferenceClassification: "TRUSTED_ORIGIN_DB_REFERENCE",
  },
];

export const LOCKED_CERTIFICATION_TARGETS: CertificationMigrationTarget[] = [
  {
    manifestKey: "cert:react-complete-guide",
    publicId: "cert_a2d0adc2534a92207a33e23c",
    name: "React – The Complete Guide (incl. Next.js, Redux)",
    issuer: "Udemy",
    mediaUrl:
      "https://pub-211ba5144d3049149f7e5a7ab5ccf343.r2.dev/certificates/cert_a2d0adc2534a92207a33e23c-react-the-complete-guide-incl-next-js-redux.jpg",
    requiredSkillSlugs: ["react", "nextjs"],
    publicationStatus: "published",
    displayOrder: 0,
  },
  {
    manifestKey: "cert:css-complete-guide",
    publicId: "cert_059f546a9e6f169d21e4ccfe",
    name: "CSS – The Complete Guide (incl. Flexbox, Grid & Sass)",
    issuer: "Udemy",
    mediaUrl:
      "https://pub-211ba5144d3049149f7e5a7ab5ccf343.r2.dev/certificates/cert_059f546a9e6f169d21e4ccfe-css-the-complete-guide-incl-flexbox-grid-sass.jpg",
    requiredSkillSlugs: [],
    publicationStatus: "published",
    displayOrder: 1,
  },
  {
    manifestKey: "cert:fullstack-bootcamp",
    publicId: "cert_d05b5eeb359c93e5366bef6e",
    name: "The Complete Full-Stack Web Development Bootcamp",
    issuer: "Udemy",
    mediaUrl:
      "https://pub-211ba5144d3049149f7e5a7ab5ccf343.r2.dev/certificates/cert_d05b5eeb359c93e5366bef6e-the-complete-full-stack-web-development-bootcamp.jpg",
    requiredSkillSlugs: [],
    publicationStatus: "published",
    displayOrder: 2,
  },
  {
    manifestKey: "cert:understanding-typescript",
    publicId: "cert_3b07042cc04c989fe4fae090",
    name: "Understanding Typescript",
    issuer: "Udemy",
    mediaUrl:
      "https://pub-211ba5144d3049149f7e5a7ab5ccf343.r2.dev/certificates/cert_3b07042cc04c989fe4fae090-understanding-typescript.png",
    requiredSkillSlugs: ["typescript"],
    publicationStatus: "published",
    displayOrder: 3,
  },
];
