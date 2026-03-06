import { mysqlTable, text, varchar, int, timestamp, boolean, json } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
});

export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
});

export const recipes = mysqlTable("recipes", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description").notNull(),
  ingredients: json("ingredients").notNull().$type<string[]>(),
  instructions: json("instructions").notNull().$type<string[]>(),
  imageUrl: text("image_url"),
  categoryId: varchar("category_id", { length: 36 }).notNull(),
  prepTime: varchar("prep_time", { length: 100 }),
  cookTime: varchar("cook_time", { length: 100 }),
  servings: int("servings"),
  showAds: boolean("show_ads").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const legalPages = mysqlTable("legal_pages", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const affiliateLinks = mysqlTable("affiliate_links", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  url: text("url").notNull(),
  imageUrl: text("image_url"),
  recipeId: varchar("recipe_id", { length: 36 }).notNull(),
});

export const comments = mysqlTable("comments", {
  id: varchar("id", { length: 36 }).primaryKey(),
  authorName: varchar("author_name", { length: 255 }).notNull(),
  text: text("text").notNull(),
  rating: int("rating").notNull(),
  adminReply: text("admin_reply"),
  recipeId: varchar("recipe_id", { length: 36 }).notNull(),
  isApproved: boolean("is_approved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const adPlacements = mysqlTable("ad_placements", {
  id: varchar("id", { length: 36 }).primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  scriptCode: text("script_code").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  location: varchar("location", { length: 100 }).notNull(),
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
