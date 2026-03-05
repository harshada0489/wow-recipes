import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const legalPages = pgTable("legal_pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type InsertLegalPage = z.infer<typeof insertLegalPageSchema>;
export type LegalPage = typeof legalPages.$inferSelect;
