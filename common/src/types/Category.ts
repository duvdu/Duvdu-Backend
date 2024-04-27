import { CYCLES } from './cycles';

export interface Icategory {
  id: string;
  creativesCounter: number;
  title: { ar: string; en: string };
  image: string;
  tags?: string[];
  subCategories?: { title: { en: string; ar: string }; tags: { en: string; ar: string }[] }[];
  jobTitles?: string[];
  cycle: CYCLES;
  status: boolean;
}
