import recipe1 from '../assets/images/recipe-1.png';
import recipe2 from '../assets/images/recipe-2.png';
import recipe3 from '../assets/images/recipe-3.png';
import recipe4 from '../assets/images/recipe-4.png';

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
};

export type Recipe = {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  imageUrl: string;
  categoryId: string;
  createdAt: string;
  prepTime: string;
  cookTime: string;
  servings: number;
};

export type LegalPage = {
  id: string;
  title: string;
  slug: string;
  content: string;
  updatedAt: string;
};

export const MOCK_PAGES: LegalPage[] = [
  {
    id: 'p1',
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    content: 'At Wow Recipes, your privacy is extremely important to us. This Privacy Policy outlines the types of personal information that is received and collected by Wow Recipes and how it is used.\n\nWe may use your personal information to provide you with a better user experience, including customizing the content and advertising you see. We will never sell your personal data to third parties.\n\nIf you require any more information or have any questions about our privacy policy, please feel free to contact us by email.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p2',
    title: 'Terms of Service',
    slug: 'terms-of-service',
    content: 'Welcome to Wow Recipes! By accessing this website, we assume you accept these terms and conditions in full. Do not continue to use Wow Recipes\'s website if you do not accept all of the terms and conditions stated on this page.\n\nThe following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer Notice and any or all Agreements: "Client", "You" and "Your" refers to you, the person accessing this website and accepting the Company\'s terms and conditions.\n\nAll content provided on this website is for informational purposes only. The owner of this blog makes no representations as to the accuracy or completeness of any information on this site or found by following any link on this site.',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'p3',
    title: 'About Us',
    slug: 'about-us',
    content: 'Wow Recipes was born out of a profound love for bringing people together through delicious, accessible, and beautiful food. Our test kitchen is dedicated to creating recipes that work every single time.\n\nWhether you are a seasoned chef or a complete beginner, our step-by-step guides are designed to help you create culinary magic in your own kitchen.\n\nWe believe that cooking should be an enjoyable experience, not a chore. Thank you for joining us on this delicious journey!',
    updatedAt: new Date().toISOString()
  }
];

export const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Dinners', slug: 'dinners', description: 'Hearty evening meals' },
  { id: '2', name: 'Healthy', slug: 'healthy', description: 'Nutritious and delicious' },
  { id: '3', name: 'Quick & Easy', slug: 'quick-easy', description: 'Under 30 minutes' },
  { id: '4', name: 'Desserts', slug: 'desserts', description: 'Sweet treats' },
  { id: '5', name: 'Breakfast', slug: 'breakfast', description: 'Start your day right' },
];

export const MOCK_RECIPES: Recipe[] = [
  {
    id: 'r1',
    title: 'Rustic Spaghetti Bolognese',
    description: 'A classic, hearty Italian meat sauce served over al dente spaghetti. Perfect for Sunday family dinners.',
    ingredients: [
      '1 lb ground beef (80/20)',
      '1 lb spaghetti',
      '1 large onion, finely chopped',
      '2 carrots, finely chopped',
      '2 celery stalks, finely chopped',
      '4 cloves garlic, minced',
      '1/2 cup dry red wine',
      '1 can (28 oz) crushed tomatoes',
      'Fresh basil for garnish',
      'Parmesan cheese, grated'
    ],
    instructions: [
      'Heat olive oil in a large pot over medium heat. Sauté onions, carrots, and celery until softened (about 10 mins).',
      'Add minced garlic and cook for 1 minute until fragrant.',
      'Increase heat to medium-high and add the ground beef. Cook, breaking it up, until deeply browned.',
      'Pour in the red wine and scrape up any browned bits from the bottom. Let it reduce by half.',
      'Stir in the crushed tomatoes. Bring to a simmer, then reduce heat to low, cover partially, and let it bubble gently for at least 2 hours.',
      'Cook spaghetti according to package directions in heavily salted water.',
      'Toss the pasta with the sauce, and serve garnished with fresh basil and generous amounts of parmesan.'
    ],
    imageUrl: recipe1,
    categoryId: '1', // Dinners
    createdAt: new Date().toISOString(),
    prepTime: '20 mins',
    cookTime: '2 hrs 30 mins',
    servings: 4
  },
  {
    id: 'r2',
    title: 'Vibrant Avocado Chicken Salad',
    description: 'A fresh, crunchy, and creamy salad packed with protein and healthy fats. Makes for a perfect light lunch.',
    ingredients: [
      '2 grilled chicken breasts, diced',
      '2 ripe avocados, diced',
      '1 cup cherry tomatoes, halved',
      '1/2 red onion, thinly sliced',
      '1/4 cup fresh cilantro, chopped',
      '2 tbsp extra virgin olive oil',
      'Juice of 1 lime',
      'Salt and freshly ground black pepper to taste'
    ],
    instructions: [
      'In a small bowl, whisk together the olive oil, lime juice, salt, and pepper to create the dressing.',
      'In a large mixing bowl, combine the diced chicken, avocados, cherry tomatoes, and red onion.',
      'Pour the dressing over the salad ingredients.',
      'Gently toss everything together, being careful not to mash the avocados too much.',
      'Sprinkle chopped cilantro over the top and serve immediately.'
    ],
    imageUrl: recipe2,
    categoryId: '2', // Healthy
    createdAt: new Date().toISOString(),
    prepTime: '15 mins',
    cookTime: '0 mins',
    servings: 2
  },
  {
    id: 'r3',
    title: 'Authentic Street-Style Beef Tacos',
    description: 'Tender, deeply marinated beef folded into warm corn tortillas with classic fresh garnishes.',
    ingredients: [
      '1.5 lbs flank steak',
      '1/4 cup soy sauce',
      'Juice of 2 oranges',
      '4 cloves garlic, minced',
      '1 tsp cumin',
      '1/2 cup fresh cilantro, finely chopped (divided)',
      '1 small white onion, finely diced',
      '12 small corn tortillas',
      'Lime wedges for serving'
    ],
    instructions: [
      'In a bowl, mix soy sauce, orange juice, garlic, cumin, and half the cilantro. Marinate the steak in this mixture for at least 2 hours, or overnight.',
      'Preheat a grill or heavy cast-iron skillet to high heat.',
      'Remove steak from marinade and sear for 4-5 minutes per side for medium-rare.',
      'Let the meat rest for 10 minutes, then slice very thinly against the grain.',
      'Warm the corn tortillas in a dry skillet until pliable.',
      'Assemble tacos with a generous portion of beef, topped with the diced white onion and remaining cilantro. Serve with lime wedges.'
    ],
    imageUrl: recipe3,
    categoryId: '3', // Quick & Easy
    createdAt: new Date().toISOString(),
    prepTime: '2 hrs (marinate)',
    cookTime: '10 mins',
    servings: 4
  },
  {
    id: 'r4',
    title: 'Decadent Mixed Berry Cheesecake',
    description: 'A rich, creamy New York-style cheesecake topped with a tart and sweet fresh berry compote.',
    ingredients: [
      '1 1/2 cups graham cracker crumbs',
      '1/4 cup sugar (for crust)',
      '6 tbsp butter, melted',
      '32 oz cream cheese, room temperature',
      '1 cup granulated sugar',
      '1 tsp vanilla extract',
      '4 large eggs',
      '2 cups mixed fresh berries (strawberries, blueberries, raspberries)',
      '2 tbsp lemon juice'
    ],
    instructions: [
      'Preheat oven to 325°F (160°C). Mix graham crumbs, 1/4 cup sugar, and melted butter. Press firmly into the bottom of a 9-inch springform pan.',
      'In a large bowl, beat the cream cheese until smooth. Gradually add the 1 cup sugar and vanilla.',
      'Add eggs one at a time, mixing on low speed just until combined. Do not overmix.',
      'Pour batter over the crust. Bake for 55-60 minutes, or until the center is almost set but still slightly jiggly.',
      'Turn off oven, open the door slightly, and leave the cheesecake inside for 1 hour to prevent cracking. Then chill in the fridge for at least 4 hours.',
      'For the topping: simmer berries, a little sugar, and lemon juice in a saucepan until thickened. Let cool before pouring over the chilled cheesecake.'
    ],
    imageUrl: recipe4,
    categoryId: '4', // Desserts
    createdAt: new Date().toISOString(),
    prepTime: '30 mins',
    cookTime: '1 hr',
    servings: 8
  }
];