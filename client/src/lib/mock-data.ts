export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export type Recipe = {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  imageUrl: string | null;
  categoryId: string;
  createdAt: string;
  prepTime: string | null;
  cookTime: string | null;
  servings: number | null;
};

export type LegalPage = {
  id: string;
  title: string;
  slug: string;
  content: string;
  updatedAt: string;
};
