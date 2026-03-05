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
  showAds: boolean;
};

export type LegalPage = {
  id: string;
  title: string;
  slug: string;
  content: string;
  updatedAt: string;
};

export type AffiliateLink = {
  id: string;
  title: string;
  url: string;
  imageUrl: string | null;
  recipeId: string;
};

export type Comment = {
  id: string;
  authorName: string;
  text: string;
  rating: number;
  adminReply: string | null;
  recipeId: string;
  isApproved: boolean;
  createdAt: string;
};

export type AdPlacement = {
  id: string;
  title: string;
  scriptCode: string;
  isActive: boolean;
  location: string;
};
