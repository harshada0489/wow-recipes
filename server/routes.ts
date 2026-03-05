import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCategorySchema, insertRecipeSchema, insertLegalPageSchema, insertAffiliateLinkSchema, insertCommentSchema, insertAdPlacementSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { seedDatabase } from "./seed";

const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  },
});

function requireAuth(req: Request, res: Response, next: () => void) {
  const userId = (req as any).session?.userId;
  if (!userId) return res.status(401).json({ message: "Not authenticated" });
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await seedDatabase();

  app.use("/uploads", (await import("express")).default.static(uploadDir));

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }
    const user = await storage.getUserByUsername(username);
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    (req as any).session.userId = user.id;
    return res.json({ id: user.id, username: user.username });
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    (req as any).session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    const userId = (req as any).session?.userId;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const user = await storage.getUser(userId);
    if (!user) return res.status(401).json({ message: "Not authenticated" });
    return res.json({ id: user.id, username: user.username });
  });

  app.get("/api/categories", async (_req: Request, res: Response) => {
    const cats = await storage.getCategories();
    return res.json(cats);
  });

  app.get("/api/categories/:id", async (req: Request, res: Response) => {
    const cat = await storage.getCategory(req.params.id);
    if (!cat) return res.status(404).json({ message: "Category not found" });
    return res.json(cat);
  });

  app.post("/api/categories", async (req: Request, res: Response) => {
    const parsed = insertCategorySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
    const cat = await storage.createCategory(parsed.data);
    return res.status(201).json(cat);
  });

  app.patch("/api/categories/:id", async (req: Request, res: Response) => {
    const updated = await storage.updateCategory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Category not found" });
    return res.json(updated);
  });

  app.delete("/api/categories/:id", async (req: Request, res: Response) => {
    await storage.deleteCategory(req.params.id);
    return res.json({ message: "Deleted" });
  });

  app.get("/api/recipes", async (_req: Request, res: Response) => {
    const allRecipes = await storage.getRecipes();
    return res.json(allRecipes);
  });

  app.get("/api/recipes/:id", async (req: Request, res: Response) => {
    const recipe = await storage.getRecipe(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    return res.json(recipe);
  });

  app.get("/api/recipes/category/:categoryId", async (req: Request, res: Response) => {
    const r = await storage.getRecipesByCategory(req.params.categoryId);
    return res.json(r);
  });

  app.post("/api/recipes", async (req: Request, res: Response) => {
    const parsed = insertRecipeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
    const recipe = await storage.createRecipe(parsed.data);
    return res.status(201).json(recipe);
  });

  app.patch("/api/recipes/:id", async (req: Request, res: Response) => {
    const updated = await storage.updateRecipe(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Recipe not found" });
    return res.json(updated);
  });

  app.delete("/api/recipes/:id", async (req: Request, res: Response) => {
    await storage.deleteRecipe(req.params.id);
    return res.json({ message: "Deleted" });
  });

  app.post("/api/upload", upload.single("image"), (req: Request, res: Response) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const url = `/uploads/${req.file.filename}`;
    return res.json({ url });
  });

  app.get("/api/pages", async (_req: Request, res: Response) => {
    const pages = await storage.getLegalPages();
    return res.json(pages);
  });

  app.get("/api/pages/by-slug/:slug", async (req: Request, res: Response) => {
    const page = await storage.getLegalPageBySlug(req.params.slug);
    if (!page) return res.status(404).json({ message: "Page not found" });
    return res.json(page);
  });

  app.get("/api/pages/:id", async (req: Request, res: Response) => {
    const page = await storage.getLegalPage(req.params.id);
    if (!page) return res.status(404).json({ message: "Page not found" });
    return res.json(page);
  });

  app.post("/api/pages", async (req: Request, res: Response) => {
    const parsed = insertLegalPageSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
    const page = await storage.createLegalPage(parsed.data);
    return res.status(201).json(page);
  });

  app.patch("/api/pages/:id", async (req: Request, res: Response) => {
    const updated = await storage.updateLegalPage(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Page not found" });
    return res.json(updated);
  });

  app.delete("/api/pages/:id", async (req: Request, res: Response) => {
    await storage.deleteLegalPage(req.params.id);
    return res.json({ message: "Deleted" });
  });

  // Affiliate Links
  app.get("/api/affiliate-links", async (_req: Request, res: Response) => {
    const links = await storage.getAllAffiliateLinks();
    return res.json(links);
  });

  app.get("/api/affiliate-links/recipe/:recipeId", async (req: Request, res: Response) => {
    const links = await storage.getAffiliateLinksByRecipe(req.params.recipeId);
    return res.json(links);
  });

  app.post("/api/affiliate-links", requireAuth, async (req: Request, res: Response) => {
    const parsed = insertAffiliateLinkSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
    const link = await storage.createAffiliateLink(parsed.data);
    return res.status(201).json(link);
  });

  app.patch("/api/affiliate-links/:id", requireAuth, async (req: Request, res: Response) => {
    const updated = await storage.updateAffiliateLink(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Not found" });
    return res.json(updated);
  });

  app.delete("/api/affiliate-links/:id", requireAuth, async (req: Request, res: Response) => {
    await storage.deleteAffiliateLink(req.params.id);
    return res.json({ message: "Deleted" });
  });

  // Comments
  app.get("/api/comments", requireAuth, async (_req: Request, res: Response) => {
    const all = await storage.getComments();
    return res.json(all);
  });

  app.get("/api/comments/recipe/:recipeId", async (req: Request, res: Response) => {
    const all = await storage.getApprovedCommentsByRecipe(req.params.recipeId);
    return res.json(all);
  });

  app.post("/api/comments", async (req: Request, res: Response) => {
    const parsed = insertCommentSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
    const comment = await storage.createComment(parsed.data);
    return res.status(201).json(comment);
  });

  app.patch("/api/comments/:id/approve", requireAuth, async (req: Request, res: Response) => {
    const updated = await storage.approveComment(req.params.id);
    if (!updated) return res.status(404).json({ message: "Not found" });
    return res.json(updated);
  });

  app.patch("/api/comments/:id/reply", requireAuth, async (req: Request, res: Response) => {
    const { adminReply } = req.body;
    if (!adminReply) return res.status(400).json({ message: "adminReply required" });
    const updated = await storage.replyToComment(req.params.id, adminReply);
    if (!updated) return res.status(404).json({ message: "Not found" });
    return res.json(updated);
  });

  app.delete("/api/comments/:id", requireAuth, async (req: Request, res: Response) => {
    await storage.deleteComment(req.params.id);
    return res.json({ message: "Deleted" });
  });

  // Ad Placements
  app.get("/api/ad-placements", async (_req: Request, res: Response) => {
    const ads = await storage.getAdPlacements();
    return res.json(ads);
  });

  app.get("/api/ad-placements/active", async (_req: Request, res: Response) => {
    const ads = await storage.getActiveAdPlacements();
    return res.json(ads);
  });

  app.post("/api/ad-placements", requireAuth, async (req: Request, res: Response) => {
    const parsed = insertAdPlacementSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
    const ad = await storage.createAdPlacement(parsed.data);
    return res.status(201).json(ad);
  });

  app.patch("/api/ad-placements/:id", requireAuth, async (req: Request, res: Response) => {
    const updated = await storage.updateAdPlacement(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "Not found" });
    return res.json(updated);
  });

  app.delete("/api/ad-placements/:id", requireAuth, async (req: Request, res: Response) => {
    await storage.deleteAdPlacement(req.params.id);
    return res.json({ message: "Deleted" });
  });

  return httpServer;
}
