import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
});

export const recipes = pgTable("recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  ingredients: text("ingredients").array().notNull(),
  instructions: text("instructions").array().notNull(),
  imageUrl: text("image_url"),
  categoryId: varchar("category_id").notNull(),
  prepTime: text("prep_time"),
  cookTime: text("cook_time"),
  servings: integer("servings"),
  showAds: boolean("show_ads").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const legalPages = pgTable("legal_pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const affiliateLinks = pgTable("affiliate_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  url: text("url").notNull(),
  imageUrl: text("image_url"),
  recipeId: varchar("recipe_id").notNull(),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authorName: text("author_name").notNull(),
  text: text("text").notNull(),
  rating: integer("rating").notNull(),
  adminReply: text("admin_reply"),
  recipeId: varchar("recipe_id").notNull(),
  isApproved: boolean("is_approved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adPlacements = pgTable("ad_placements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  scriptCode: text("script_code").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  location: text("location").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  slug: true,
  description: true,
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  createdAt: true,
});

export const insertLegalPageSchema = createInsertSchema(legalPages).omit({
  id: true,
  updatedAt: true,
});

export const insertAffiliateLinkSchema = createInsertSchema(affiliateLinks).omit({
  id: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  adminReply: true,
  isApproved: true,
  createdAt: true,
});

export const insertAdPlacementSchema = createInsertSchema(adPlacements).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type InsertLegalPage = z.infer<typeof insertLegalPageSchema>;
export type LegalPage = typeof legalPages.$inferSelect;
export type InsertAffiliateLink = z.infer<typeof insertAffiliateLinkSchema>;
export type AffiliateLink = typeof affiliateLinks.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertAdPlacement = z.infer<typeof insertAdPlacementSchema>;
export type AdPlacement = typeof adPlacements.$inferSelect;
