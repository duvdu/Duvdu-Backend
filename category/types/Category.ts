export interface Icategory {
  id: string;
  creativesCounter: number;
  title: { ar: string; en: string };
  image: string;
  tags: string[];
  cycle: 1 | 2 | 3 | 4;
}
