import { db } from "./db";
import { users, categories, legalPages } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  const [existingAdmin] = await db.select().from(users).where(eq(users.username, "admin"));
  if (!existingAdmin) {
    await db.insert(users).values({
      username: "admin",
      password: "password123",
    });
    console.log("Seeded admin user (admin / password123)");
  }

  const existingCategories = await db.select().from(categories);
  if (existingCategories.length === 0) {
    await db.insert(categories).values([
      { name: "Dinners", slug: "dinners", description: "Hearty evening meals" },
      { name: "Healthy", slug: "healthy", description: "Nutritious and delicious" },
      { name: "Quick & Easy", slug: "quick-easy", description: "Under 30 minutes" },
      { name: "Desserts", slug: "desserts", description: "Sweet treats" },
      { name: "Breakfast", slug: "breakfast", description: "Start your day right" },
    ]);
    console.log("Seeded default categories");
  }

  const existingPages = await db.select().from(legalPages);
  if (existingPages.length === 0) {
    await db.insert(legalPages).values([
      {
        title: "Privacy Policy",
        slug: "privacy-policy",
        content: "At Wow Recipes, your privacy is extremely important to us. This Privacy Policy outlines the types of personal information that is received and collected by Wow Recipes and how it is used.\n\nWe may use your personal information to provide you with a better user experience, including customizing the content and advertising you see. We will never sell your personal data to third parties.\n\nIf you require any more information or have any questions about our privacy policy, please feel free to contact us by email.",
      },
      {
        title: "Terms of Service",
        slug: "terms-of-service",
        content: 'Welcome to Wow Recipes! By accessing this website, we assume you accept these terms and conditions in full. Do not continue to use Wow Recipes\'s website if you do not accept all of the terms and conditions stated on this page.\n\nThe following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer Notice and any or all Agreements: "Client", "You" and "Your" refers to you, the person accessing this website and accepting the Company\'s terms and conditions.\n\nAll content provided on this website is for informational purposes only. The owner of this blog makes no representations as to the accuracy or completeness of any information on this site or found by following any link on this site.',
      },
      {
        title: "About Us",
        slug: "about-us",
        content: "Wow Recipes was born out of a profound love for bringing people together through delicious, accessible, and beautiful food. Our test kitchen is dedicated to creating recipes that work every single time.\n\nWhether you are a seasoned chef or a complete beginner, our step-by-step guides are designed to help you create culinary magic in your own kitchen.\n\nWe believe that cooking should be an enjoyable experience, not a chore. Thank you for joining us on this delicious journey!",
      },
    ]);
    console.log("Seeded default legal pages");
  }
}
