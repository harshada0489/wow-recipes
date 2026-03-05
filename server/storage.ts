import {
  type User, type InsertUser,
  type Category, type InsertCategory,
  type Recipe, type InsertRecipe,
  type LegalPage, type InsertLegalPage,
  type AffiliateLink, type InsertAffiliateLink,
  type Comment, type InsertComment,
  type AdPlacement, type InsertAdPlacement,
  users, categories, recipes, legalPages,
  affiliateLinks, comments, adPlacements,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(cat: InsertCategory): Promise<Category>;
  updateCategory(id: string, cat: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<void>;

  getRecipes(): Promise<Recipe[]>;
  getRecipe(id: string): Promise<Recipe | undefined>;
  getRecipesByCategory(categoryId: string): Promise<Recipe[]>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  updateRecipe(id: string, recipe: Partial<InsertRecipe>): Promise<Recipe | undefined>;
  deleteRecipe(id: string): Promise<void>;

  getLegalPages(): Promise<LegalPage[]>;
  getLegalPage(id: string): Promise<LegalPage | undefined>;
  getLegalPageBySlug(slug: string): Promise<LegalPage | undefined>;
  createLegalPage(page: InsertLegalPage): Promise<LegalPage>;
  updateLegalPage(id: string, page: Partial<InsertLegalPage>): Promise<LegalPage | undefined>;
  deleteLegalPage(id: string): Promise<void>;

  getAffiliateLinksByRecipe(recipeId: string): Promise<AffiliateLink[]>;
  getAllAffiliateLinks(): Promise<AffiliateLink[]>;
  createAffiliateLink(link: InsertAffiliateLink): Promise<AffiliateLink>;
  updateAffiliateLink(id: string, link: Partial<InsertAffiliateLink>): Promise<AffiliateLink | undefined>;
  deleteAffiliateLink(id: string): Promise<void>;
  deleteAffiliateLinksByRecipe(recipeId: string): Promise<void>;

  getComments(): Promise<Comment[]>;
  getApprovedCommentsByRecipe(recipeId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  approveComment(id: string): Promise<Comment | undefined>;
  replyToComment(id: string, adminReply: string): Promise<Comment | undefined>;
  deleteComment(id: string): Promise<void>;

  getAdPlacements(): Promise<AdPlacement[]>;
  getActiveAdPlacements(): Promise<AdPlacement[]>;
  createAdPlacement(ad: InsertAdPlacement): Promise<AdPlacement>;
  updateAdPlacement(id: string, ad: Partial<InsertAdPlacement>): Promise<AdPlacement | undefined>;
  deleteAdPlacement(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [cat] = await db.select().from(categories).where(eq(categories.id, id));
    return cat;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [cat] = await db.select().from(categories).where(eq(categories.slug, slug));
    return cat;
  }

  async createCategory(cat: InsertCategory): Promise<Category> {
    const [created] = await db.insert(categories).values(cat).returning();
    return created;
  }

  async updateCategory(id: string, cat: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updated] = await db.update(categories).set(cat).where(eq(categories.id, id)).returning();
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  async getRecipes(): Promise<Recipe[]> {
    return db.select().from(recipes).orderBy(desc(recipes.createdAt));
  }

  async getRecipe(id: string): Promise<Recipe | undefined> {
    const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id));
    return recipe;
  }

  async getRecipesByCategory(categoryId: string): Promise<Recipe[]> {
    return db.select().from(recipes).where(eq(recipes.categoryId, categoryId)).orderBy(desc(recipes.createdAt));
  }

  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const [created] = await db.insert(recipes).values(recipe).returning();
    return created;
  }

  async updateRecipe(id: string, recipe: Partial<InsertRecipe>): Promise<Recipe | undefined> {
    const [updated] = await db.update(recipes).set(recipe).where(eq(recipes.id, id)).returning();
    return updated;
  }

  async deleteRecipe(id: string): Promise<void> {
    await db.delete(affiliateLinks).where(eq(affiliateLinks.recipeId, id));
    await db.delete(comments).where(eq(comments.recipeId, id));
    await db.delete(recipes).where(eq(recipes.id, id));
  }

  async getLegalPages(): Promise<LegalPage[]> {
    return db.select().from(legalPages);
  }

  async getLegalPage(id: string): Promise<LegalPage | undefined> {
    const [page] = await db.select().from(legalPages).where(eq(legalPages.id, id));
    return page;
  }

  async getLegalPageBySlug(slug: string): Promise<LegalPage | undefined> {
    const [page] = await db.select().from(legalPages).where(eq(legalPages.slug, slug));
    return page;
  }

  async createLegalPage(page: InsertLegalPage): Promise<LegalPage> {
    const [created] = await db.insert(legalPages).values(page).returning();
    return created;
  }

  async updateLegalPage(id: string, page: Partial<InsertLegalPage>): Promise<LegalPage | undefined> {
    const [updated] = await db.update(legalPages).set({ ...page, updatedAt: new Date() }).where(eq(legalPages.id, id)).returning();
    return updated;
  }

  async deleteLegalPage(id: string): Promise<void> {
    await db.delete(legalPages).where(eq(legalPages.id, id));
  }

  async getAffiliateLinksByRecipe(recipeId: string): Promise<AffiliateLink[]> {
    return db.select().from(affiliateLinks).where(eq(affiliateLinks.recipeId, recipeId));
  }

  async getAllAffiliateLinks(): Promise<AffiliateLink[]> {
    return db.select().from(affiliateLinks);
  }

  async createAffiliateLink(link: InsertAffiliateLink): Promise<AffiliateLink> {
    const [created] = await db.insert(affiliateLinks).values(link).returning();
    return created;
  }

  async updateAffiliateLink(id: string, link: Partial<InsertAffiliateLink>): Promise<AffiliateLink | undefined> {
    const [updated] = await db.update(affiliateLinks).set(link).where(eq(affiliateLinks.id, id)).returning();
    return updated;
  }

  async deleteAffiliateLink(id: string): Promise<void> {
    await db.delete(affiliateLinks).where(eq(affiliateLinks.id, id));
  }

  async deleteAffiliateLinksByRecipe(recipeId: string): Promise<void> {
    await db.delete(affiliateLinks).where(eq(affiliateLinks.recipeId, recipeId));
  }

  async getComments(): Promise<Comment[]> {
    return db.select().from(comments).orderBy(desc(comments.createdAt));
  }

  async getApprovedCommentsByRecipe(recipeId: string): Promise<Comment[]> {
    return db.select().from(comments)
      .where(and(eq(comments.recipeId, recipeId), eq(comments.isApproved, true)))
      .orderBy(desc(comments.createdAt));
  }

  async createComment(comment: InsertComment): Promise<Comment> {
    const [created] = await db.insert(comments).values(comment).returning();
    return created;
  }

  async approveComment(id: string): Promise<Comment | undefined> {
    const [updated] = await db.update(comments).set({ isApproved: true }).where(eq(comments.id, id)).returning();
    return updated;
  }

  async replyToComment(id: string, adminReply: string): Promise<Comment | undefined> {
    const [updated] = await db.update(comments).set({ adminReply }).where(eq(comments.id, id)).returning();
    return updated;
  }

  async deleteComment(id: string): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
  }

  async getAdPlacements(): Promise<AdPlacement[]> {
    return db.select().from(adPlacements);
  }

  async getActiveAdPlacements(): Promise<AdPlacement[]> {
    return db.select().from(adPlacements).where(eq(adPlacements.isActive, true));
  }

  async createAdPlacement(ad: InsertAdPlacement): Promise<AdPlacement> {
    const [created] = await db.insert(adPlacements).values(ad).returning();
    return created;
  }

  async updateAdPlacement(id: string, ad: Partial<InsertAdPlacement>): Promise<AdPlacement | undefined> {
    const [updated] = await db.update(adPlacements).set(ad).where(eq(adPlacements.id, id)).returning();
    return updated;
  }

  async deleteAdPlacement(id: string): Promise<void> {
    await db.delete(adPlacements).where(eq(adPlacements.id, id));
  }
}

export const storage = new DatabaseStorage();
