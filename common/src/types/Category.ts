export interface Icategory {
  id: string;
  creativesCounter: number;
  title: { ar: string; en: string };
  image: string;
  tags?: string[];
  subCategories?: { title: { en: string; ar: string }; tags: { en: string; ar: string }[] }[];
  jobTitles?: string[];
  cycle: 1 | 2 | 3 | 4;
  status: 0 | 1;
}
