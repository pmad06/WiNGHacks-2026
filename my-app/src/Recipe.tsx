/**
 * Recipe.tsx – Recipe Discovery Page
 *
 * Frontend structure for health-based recipes.
 * Recipe data is intentionally placeholder — a team member will
 * wire in Gemini API responses to populate each category.
 *
 * Categories:
 *   General    – everyday wellness
 *   Diagnoses  – condition-specific (cold/flu, heart health, etc.)
 *   Symptoms   – symptom-targeted (inflammation, digestion, etc.)
 *   Dietary    – restriction-based (gluten-free, vegan, etc.)
 */

import { useState } from 'react';
import type { CSSProperties } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// COLOR PALETTE — matches app + chatbot theme
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  primary:      '#4E7A3C',
  primaryDark:  '#364B30',
  primaryLight: '#7FA96E',
  primarySoft:  '#E8F2E3',
  accent:       '#C8A435',
  text:         '#1F2937',
  textMuted:    '#556B46',
  textLight:    '#8FA880',
  bg:           '#FFFFFF',
  bgSecondary:  '#F2F7EE',
  border:       '#C8D9BE',
  shadow:       'rgba(54, 75, 48, 0.18)',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
type Category = 'general' | 'diagnoses' | 'symptoms' | 'dietary';

interface RecipeItem {
  id:           string;
  title:        string;
  category:     Category;
  subcategory:  string;   // e.g. "Cold & Flu", "Anti-Inflammatory", "Gluten-Free"
  symptomHelp:  string;   // 1-2 sentence health benefit description
  prepTime:     string;
  cookTime:     string;
  servings:     string;
  ingredients:  string[];
  steps:        string[];
  tags:         string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// PLACEHOLDER DATA — replace with Gemini API responses
// ─────────────────────────────────────────────────────────────────────────────
const PLACEHOLDER_RECIPES: RecipeItem[] = [
  {
    id: '1',
    title: 'Golden Turmeric Latte',
    category: 'symptoms',
    subcategory: 'Inflammation',
    symptomHelp: 'Helps reduce inflammation and joint pain. Turmeric contains curcumin, a powerful anti-inflammatory compound shown to ease chronic pain and stiffness.',
    prepTime: '5 min', cookTime: '5 min', servings: '1',
    ingredients: ['1 cup milk of choice', '1 tsp turmeric', '½ tsp cinnamon', '¼ tsp ginger', '1 tsp honey', 'Pinch of black pepper'],
    steps: [
      'Heat milk in a small saucepan over medium heat.',
      'Whisk in turmeric, cinnamon, ginger, and black pepper.',
      'Simmer for 3–5 minutes, stirring frequently.',
      'Remove from heat and stir in honey.',
      'Pour into a mug and enjoy warm.',
    ],
    tags: ['anti-inflammatory', 'warm drink', 'joint pain'],
  },
  {
    id: '2',
    title: 'Immune Boost Ginger Soup',
    category: 'diagnoses',
    subcategory: 'Cold & Flu',
    symptomHelp: 'Supports recovery from cold and flu. Ginger and garlic contain natural antimicrobial compounds that help strengthen the immune response.',
    prepTime: '10 min', cookTime: '20 min', servings: '2',
    ingredients: ['4 cups vegetable broth', '2 cloves garlic, minced', '1 inch fresh ginger, grated', '1 cup noodles', 'Salt and pepper to taste', 'Fresh herbs to garnish'],
    steps: [
      'Mince garlic and grate fresh ginger.',
      'Bring broth to a boil in a medium pot.',
      'Add garlic and ginger; simmer for 5 minutes.',
      'Add noodles and cook until tender (about 8 min).',
      'Season with salt and pepper.',
      'Serve hot, garnished with fresh herbs.',
    ],
    tags: ['cold', 'flu', 'soup', 'immunity'],
  },
  {
    id: '3',
    title: 'Calming Chamomile Oats',
    category: 'general',
    subcategory: 'General Wellness',
    symptomHelp: 'Promotes relaxation and restful sleep. Chamomile has mild natural sedative effects and supports the nervous system for a calmer evening.',
    prepTime: '5 min', cookTime: '10 min', servings: '1',
    ingredients: ['½ cup rolled oats', '1 cup chamomile tea (brewed)', '1 tbsp honey', '¼ tsp vanilla extract', '1 banana, sliced', 'Handful of crushed almonds'],
    steps: [
      'Brew a strong cup of chamomile tea.',
      'Cook oats using chamomile tea instead of water over medium heat.',
      'Stir continuously until oats are creamy (5–7 min).',
      'Remove from heat; stir in honey and vanilla.',
      'Top with banana slices and crushed almonds.',
    ],
    tags: ['sleep', 'calming', 'breakfast'],
  },
  {
    id: '4',
    title: 'Gut Health Green Smoothie',
    category: 'symptoms',
    subcategory: 'Digestive Issues',
    symptomHelp: 'Supports healthy digestion and gut microbiome balance. Fiber-rich greens and probiotic-friendly kefir help ease bloating and promote regularity.',
    prepTime: '5 min', cookTime: '0 min', servings: '1',
    ingredients: ['1 cup spinach', '½ banana (frozen)', '½ cup kefir or yogurt', '1 tbsp chia seeds', '½ cup coconut water', '1 tsp honey'],
    steps: [
      'Add all ingredients to a high-speed blender.',
      'Blend on high for 45–60 seconds until smooth.',
      'Check consistency — add more liquid if needed.',
      'Pour into a glass and drink immediately for best probiotic benefit.',
    ],
    tags: ['digestion', 'gut health', 'smoothie', 'bloating'],
  },
  {
    id: '5',
    title: 'Gluten-Free Energy Bites',
    category: 'dietary',
    subcategory: 'Gluten-Free',
    symptomHelp: 'Provides sustained energy without gluten. Packed with healthy fats, fiber, and natural sugars for a steady energy release without a crash.',
    prepTime: '15 min', cookTime: '0 min', servings: '12 bites',
    ingredients: ['1 cup gluten-free rolled oats', '½ cup peanut butter', '⅓ cup honey', '½ cup dark chocolate chips', '1 tsp vanilla extract', '2 tbsp chia seeds'],
    steps: [
      'Combine all ingredients in a large mixing bowl and stir well.',
      'Cover and refrigerate the mixture for 30 minutes.',
      'Once chilled, roll into 1-inch balls using your hands.',
      'Place on a parchment-lined tray.',
      'Store in an airtight container in the fridge for up to 1 week.',
    ],
    tags: ['gluten-free', 'snack', 'energy', 'no-bake'],
  },
  {
    id: '6',
    title: 'Heart-Healthy Avocado Toast',
    category: 'diagnoses',
    subcategory: 'Heart Health',
    symptomHelp: 'Supports cardiovascular health with every bite. Avocado provides heart-healthy monounsaturated fats that help maintain healthy cholesterol levels.',
    prepTime: '5 min', cookTime: '5 min', servings: '1',
    ingredients: ['2 slices whole-grain bread', '1 ripe avocado', 'Juice of ½ lemon', 'Red pepper flakes', 'Everything bagel seasoning', 'Optional: 1 egg'],
    steps: [
      'Toast the bread to your preferred level of crispiness.',
      'Halve and pit the avocado; scoop flesh into a bowl.',
      'Mash avocado with lemon juice and a pinch of salt.',
      'Spread generously over each toast slice.',
      'Sprinkle with red pepper flakes and seasoning.',
      'Top with a poached or fried egg if desired.',
    ],
    tags: ['heart health', 'breakfast', 'avocado'],
  },
  {
    id: '7',
    title: 'Vegan Protein Buddha Bowl',
    category: 'dietary',
    subcategory: 'Vegan',
    symptomHelp: 'A complete plant-based meal rich in protein and micronutrients. Supports muscle recovery and provides sustained energy throughout the day.',
    prepTime: '15 min', cookTime: '20 min', servings: '2',
    ingredients: ['1 cup cooked quinoa', '1 can chickpeas, roasted', '1 cup steamed broccoli', '1 avocado, sliced', '2 tbsp tahini', '1 lemon (juice)', '1 tsp garlic powder'],
    steps: [
      'Roast chickpeas at 400°F for 20 min with olive oil and spices.',
      'Cook quinoa according to package directions.',
      'Steam broccoli until tender-crisp.',
      'Whisk tahini, lemon juice, garlic powder, and 2 tbsp water for dressing.',
      'Assemble bowls with quinoa, chickpeas, broccoli, and avocado.',
      'Drizzle with tahini dressing and serve.',
    ],
    tags: ['vegan', 'protein', 'meal prep', 'bowl'],
  },
  {
    id: '8',
    title: 'Anti-Stress Adaptogen Smoothie',
    category: 'symptoms',
    subcategory: 'Stress & Anxiety',
    symptomHelp: 'Helps the body adapt to stress and calm the nervous system. Ashwagandha and magnesium-rich ingredients support cortisol balance and relaxation.',
    prepTime: '5 min', cookTime: '0 min', servings: '1',
    ingredients: ['1 cup almond milk', '1 frozen banana', '1 tsp ashwagandha powder', '1 tbsp almond butter', '1 tsp cacao powder', '½ tsp cinnamon', '1 tsp honey'],
    steps: [
      'Add all ingredients to a blender.',
      'Blend until completely smooth.',
      'Taste and adjust sweetness with more honey if desired.',
      'Pour into a glass and enjoy immediately.',
    ],
    tags: ['stress', 'anxiety', 'adaptogen', 'smoothie'],
  },
];

const CATEGORIES: { key: Category; label: string; icon: string; description: string }[] = [
  { key: 'general',   label: 'General Wellness', icon: '🌿', description: 'Everyday recipes for overall health and vitality' },
  { key: 'diagnoses', label: 'By Diagnosis',     icon: '🩺', description: 'Tailored to specific health conditions' },
  { key: 'symptoms',  label: 'By Symptom',       icon: '💊', description: 'Target specific symptoms with food as medicine' },
  { key: 'dietary',   label: 'Dietary Needs',    icon: '🥗', description: 'Filtered for your dietary restrictions' },
];

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL CSS
// ─────────────────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @keyframes recipeFade {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes modalPop {
    from { opacity: 0; transform: scale(0.93) translateY(16px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  .recipe-card { animation: recipeFade 0.25s ease-out; }
  .recipe-card:hover { transform: translateY(-3px) !important; box-shadow: 0 10px 32px rgba(54,75,48,0.18) !important; }
  .cat-tab:hover { background: #E8F2E3 !important; }
  .cat-tab.active { background: #4E7A3C !important; color: white !important; border-color: #4E7A3C !important; }
  .sub-chip:hover { background: #4E7A3C !important; color: white !important; }
  .sub-chip.active { background: #364B30 !important; color: white !important; border-color: #364B30 !important; }
  .recipe-scroll::-webkit-scrollbar { width: 5px; }
  .recipe-scroll::-webkit-scrollbar-thumb { background: #7FA96E; border-radius: 4px; }
  .view-steps-btn:hover { background: #364B30 !important; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// RECIPE DETAIL MODAL (popout for full steps + ingredients)
// ─────────────────────────────────────────────────────────────────────────────
function RecipeModal({ recipe, onClose }: { recipe: RecipeItem; onClose: () => void }) {
  const [tab, setTab] = useState<'ingredients' | 'steps'>('steps');

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1000, display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: 20, width: '100%', maxWidth: 540,
          maxHeight: '88vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
          animation: 'modalPop 0.22s ease-out',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* Modal header */}
        <div style={{
          background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
          padding: '18px 20px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                {recipe.subcategory}
              </div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 18, lineHeight: 1.2 }}>
                🌿 {recipe.title}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8,
                color: 'white', cursor: 'pointer', fontSize: 16, padding: '4px 9px',
                lineHeight: 1, flexShrink: 0, marginLeft: 12,
              }}
            >
              ✕
            </button>
          </div>

          {/* Timing row */}
          <div style={{ display: 'flex', gap: 14, marginTop: 10 }}>
            {recipe.prepTime && <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>⏱️ Prep: <b>{recipe.prepTime}</b></span>}
            {recipe.cookTime && recipe.cookTime !== '0 min' && <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>🔥 Cook: <b>{recipe.cookTime}</b></span>}
            {recipe.servings && <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>🍽️ Serves: <b>{recipe.servings}</b></span>}
          </div>
        </div>

        {/* Symptom help banner */}
        <div style={{
          background: C.primarySoft, padding: '12px 20px',
          borderBottom: `1px solid ${C.border}`, flexShrink: 0,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.primaryDark, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            💚 How This Helps
          </div>
          <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>
            {recipe.symptomHelp}
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex', borderBottom: `1px solid ${C.border}`,
          padding: '0 20px', flexShrink: 0,
        }}>
          {(['steps', 'ingredients'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '12px 16px', border: 'none', cursor: 'pointer',
                background: 'none', fontSize: 13, fontWeight: 600,
                color: tab === t ? C.primary : C.textMuted,
                borderBottom: tab === t ? `2.5px solid ${C.primary}` : '2.5px solid transparent',
                marginBottom: -1, transition: 'all 0.18s', textTransform: 'capitalize',
              }}
            >
              {t === 'steps' ? '📋 Steps' : '🥗 Ingredients'}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div
          className="recipe-scroll"
          style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}
        >
          {tab === 'ingredients' ? (
            <ul style={{ margin: 0, paddingLeft: 20, color: C.text }}>
              {recipe.ingredients.map((ing, i) => (
                <li key={i} style={{ marginBottom: 8, fontSize: 14, lineHeight: 1.5 }}>
                  {ing}
                </li>
              ))}
            </ul>
          ) : (
            <ol style={{ margin: 0, paddingLeft: 20, color: C.text }}>
              {recipe.steps.map((step, i) => (
                <li key={i} style={{ marginBottom: 12, fontSize: 14, lineHeight: 1.65 }}>
                  {step}
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* Tags footer */}
        <div style={{
          padding: '12px 20px', borderTop: `1px solid ${C.border}`,
          display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0,
          background: C.bgSecondary,
        }}>
          {recipe.tags.map(tag => (
            <span
              key={tag}
              style={{
                background: C.primarySoft, color: C.primaryDark,
                border: `1px solid ${C.border}`, borderRadius: 20,
                padding: '2px 10px', fontSize: 11, fontWeight: 500,
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RECIPE CARD
// ─────────────────────────────────────────────────────────────────────────────
function RecipeCard({ recipe, onViewSteps }: { recipe: RecipeItem; onViewSteps: () => void }) {
  const cardStyle: CSSProperties = {
    background: 'white',
    border: `1.5px solid ${C.border}`,
    borderRadius: 16,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: `0 2px 10px ${C.shadow}`,
    cursor: 'default',
  };

  return (
    <div className="recipe-card" style={cardStyle}>
      {/* Card header */}
      <div style={{
        background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
        padding: '12px 14px',
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)',
          textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4,
        }}>
          {recipe.subcategory}
        </div>
        <div style={{ fontWeight: 700, fontSize: 14.5, color: 'white', lineHeight: 1.25 }}>
          🌿 {recipe.title}
        </div>
        {/* Timing */}
        <div style={{ display: 'flex', gap: 10, marginTop: 7, flexWrap: 'wrap' }}>
          {recipe.prepTime && <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.8)' }}>⏱️ {recipe.prepTime}</span>}
          {recipe.cookTime && recipe.cookTime !== '0 min' && <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.8)' }}>🔥 {recipe.cookTime}</span>}
          {recipe.servings && <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.8)' }}>🍽️ {recipe.servings}</span>}
        </div>
      </div>

      {/* Symptom help */}
      <div style={{
        padding: '10px 14px',
        background: C.primarySoft,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.primaryDark, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.4 }}>
          💚 How it helps
        </div>
        <div style={{ fontSize: 12.5, color: C.textMuted, lineHeight: 1.55 }}>
          {recipe.symptomHelp}
        </div>
      </div>

      {/* Ingredients preview */}
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.border}`, flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.primaryDark, marginBottom: 6 }}>
          🥗 Ingredients
        </div>
        <ul style={{ margin: 0, paddingLeft: 16, color: C.text }}>
          {recipe.ingredients.slice(0, 4).map((ing, i) => (
            <li key={i} style={{ fontSize: 12, marginBottom: 3, color: C.text }}>{ing}</li>
          ))}
          {recipe.ingredients.length > 4 && (
            <li style={{ fontSize: 12, color: C.textLight, listStyle: 'none', marginLeft: -16 }}>
              +{recipe.ingredients.length - 4} more...
            </li>
          )}
        </ul>
      </div>

      {/* Steps preview */}
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: C.primaryDark, marginBottom: 6 }}>
          📋 Steps
        </div>
        <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.5 }}>
          <span style={{ fontWeight: 500, color: C.text }}>Step 1:</span> {recipe.steps[0]}
        </div>
        {recipe.steps.length > 1 && (
          <div style={{ fontSize: 11, color: C.textLight, marginTop: 3 }}>
            {recipe.steps.length - 1} more step{recipe.steps.length > 2 ? 's' : ''}…
          </div>
        )}
      </div>

      {/* Tags + View Steps button */}
      <div style={{ padding: '10px 14px', background: C.bgSecondary }}>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
          {recipe.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              style={{
                background: C.primarySoft, color: C.textMuted,
                border: `1px solid ${C.border}`, borderRadius: 20,
                padding: '1px 8px', fontSize: 10, fontWeight: 500,
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
        <button
          className="view-steps-btn"
          onClick={onViewSteps}
          style={{
            width: '100%', padding: '8px 0',
            background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
            color: 'white', border: 'none', borderRadius: 10,
            cursor: 'pointer', fontWeight: 600, fontSize: 12.5,
            transition: 'background 0.18s',
          }}
        >
          View Full Recipe ↗
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN RECIPE PAGE
// ─────────────────────────────────────────────────────────────────────────────
function Recipe() {
  const [activeCategory, setActiveCategory] = useState<Category>('general');
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [modalRecipe, setModalRecipe] = useState<RecipeItem | null>(null);

  // Filter recipes by active category (and subcategory if selected)
  const filtered = PLACEHOLDER_RECIPES.filter(r => {
    if (r.category !== activeCategory) return false;
    if (activeSubcategory && r.subcategory !== activeSubcategory) return false;
    return true;
  });

  // Unique subcategories for current category
  const subcategories = Array.from(
    new Set(PLACEHOLDER_RECIPES.filter(r => r.category === activeCategory).map(r => r.subcategory))
  );

  const currentCat = CATEGORIES.find(c => c.key === activeCategory)!;

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, ${C.primarySoft} 0%, ${C.bg} 300px)`,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        paddingBottom: 60,
      }}>

        {/* ── PAGE HEADER ── */}
        <div style={{
          background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
          padding: '40px 24px 32px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🌿</div>
          <h1 style={{ color: 'white', margin: '0 0 8px', fontSize: 28, fontWeight: 800 }}>
            Wellness Recipes
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.75)', margin: 0, fontSize: 14, maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
            Discover recipes curated for your health — browse by condition, symptom, or dietary need
          </p>
          <div style={{
            marginTop: 12, fontSize: 11, color: 'rgba(255,255,255,0.5)',
            fontStyle: 'italic',
          }}>
            ⚠️ These recipes are informational. Always consult a healthcare professional.
          </div>
        </div>

        {/* ── CATEGORY TABS ── */}
        <div style={{ padding: '20px 20px 0', maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.key}
                className={`cat-tab${activeCategory === cat.key ? ' active' : ''}`}
                onClick={() => { setActiveCategory(cat.key); setActiveSubcategory(null); }}
                style={{
                  padding: '10px 18px', border: `1.5px solid ${C.border}`,
                  borderRadius: 30, cursor: 'pointer', fontWeight: 600, fontSize: 13,
                  background: activeCategory === cat.key ? C.primary : 'white',
                  color: activeCategory === cat.key ? 'white' : C.primaryDark,
                  transition: 'all 0.18s',
                  boxShadow: activeCategory === cat.key ? `0 4px 14px ${C.shadow}` : 'none',
                }}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          {/* Category description */}
          <div style={{
            textAlign: 'center', marginTop: 10,
            fontSize: 13, color: C.textMuted,
          }}>
            {currentCat.description}
          </div>
        </div>

        {/* ── SUBCATEGORY CHIPS ── */}
        {subcategories.length > 1 && (
          <div style={{ padding: '14px 20px 0', maxWidth: 900, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                className={`sub-chip${activeSubcategory === null ? ' active' : ''}`}
                onClick={() => setActiveSubcategory(null)}
                style={{
                  padding: '5px 14px', border: `1px solid ${C.border}`,
                  borderRadius: 20, cursor: 'pointer', fontSize: 12,
                  background: activeSubcategory === null ? C.primaryDark : C.bgSecondary,
                  color: activeSubcategory === null ? 'white' : C.textMuted,
                  transition: 'all 0.15s', fontWeight: 500,
                }}
              >
                All
              </button>
              {subcategories.map(sub => (
                <button
                  key={sub}
                  className={`sub-chip${activeSubcategory === sub ? ' active' : ''}`}
                  onClick={() => setActiveSubcategory(sub)}
                  style={{
                    padding: '5px 14px', border: `1px solid ${C.border}`,
                    borderRadius: 20, cursor: 'pointer', fontSize: 12,
                    background: activeSubcategory === sub ? C.primaryDark : C.bgSecondary,
                    color: activeSubcategory === sub ? 'white' : C.textMuted,
                    transition: 'all 0.15s', fontWeight: 500,
                  }}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── RECIPE GRID ── */}
        <div style={{ padding: '20px', maxWidth: 900, margin: '0 auto' }}>
          {filtered.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 20px',
              color: C.textMuted, fontSize: 15,
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🌱</div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>No recipes here yet</div>
              <div style={{ fontSize: 13, color: C.textLight }}>
                Recipes for this category will appear here once the Gemini API is connected.
              </div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 18,
            }}>
              {filtered.map(r => (
                <RecipeCard
                  key={r.id}
                  recipe={r}
                  onViewSteps={() => setModalRecipe(r)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── COMING SOON BANNER ── */}
        <div style={{
          margin: '0 20px', maxWidth: 860, marginLeft: 'auto', marginRight: 'auto',
          background: C.primarySoft, border: `1.5px dashed ${C.primaryLight}`,
          borderRadius: 14, padding: '16px 20px', textAlign: 'center',
        }}>
          <div style={{ fontWeight: 600, color: C.primaryDark, fontSize: 13, marginBottom: 4 }}>
            🤖 Gemini AI Integration Coming Soon
          </div>
          <div style={{ fontSize: 12, color: C.textMuted }}>
            Recipes will be dynamically generated and categorized by AI based on your health profile and symptoms.
          </div>
        </div>
      </div>

      {/* ── RECIPE DETAIL MODAL ── */}
      {modalRecipe && (
        <RecipeModal recipe={modalRecipe} onClose={() => setModalRecipe(null)} />
      )}
    </>
  );
}

export default Recipe;
