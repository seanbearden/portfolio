export interface BlogPost {
  title: string;
  date: string;
  slug: string;
  oldUrl: string;
  categories: string[];
  tags: string[];
  image?: string;
  body: string;
}

export interface PortfolioProject {
  title: string;
  subtitle?: string;
  slug: string;
  order: number;
  skills: string[];
  link?: string;
  cta?: string;
  relatedPublication?: string;
  image?: string;
  body: string;
}

export interface Publication {
  title: string;
  journal: string;
  year: string;
  link: string;
  preprint?: string;
  type?: string;
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  highlights: string[];
}

export interface Education {
  degree: string;
  school: string;
  year: string;
}

export interface HomeData {
  hero: {
    name: string;
    headline: string;
    email: string;
  };
  social: Record<string, string>;
  experience: Experience[];
  education: Education[];
  awards: string[];
  skills: Record<string, string[]>;
  about: string;
}
