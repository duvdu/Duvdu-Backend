export interface Category {
  id: string;
  creativesCounter: number;
  title: string;
  image: string;
  tags: string[];
  cycle: 1 | 2 | 3 | 4;
}
