export interface CategoryColor {
  bg: string;
  color: string;
  border: string;
}

const GRAY: CategoryColor = { bg: "#f3f4f6", color: "#6b7280", border: "#e5e7eb" };

export const CATEGORY_COLORS: Record<string, CategoryColor> = {
  // Subscriptions
  מנוי:    { bg: "#ede9fe", color: "#7c3aed", border: "#ddd6fe" },
  // Food
  אוכל:    { bg: "#fff7ed", color: "#ea580c", border: "#fed7aa" },
  מזון:    { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  // Transport
  תחבורה:  { bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
  // Health
  בריאות:  { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  // Rent
  שכירות:  { bg: "#eef2ff", color: "#4338ca", border: "#c7d2fe" },
  // Entertainment
  בילויים: { bg: "#fdf2f8", color: "#db2777", border: "#fbcfe8" },
  // Clothing
  ביגוד:   { bg: "#fff1f2", color: "#e11d48", border: "#fecdd3" },
  // Savings
  חיסכון:  { bg: "#ecfeff", color: "#0891b2", border: "#a5f3fc" },
  // Income categories
  משכורת:  { bg: "#ecfdf5", color: "#059669", border: "#a7f3d0" },
  פרילנס:  { bg: "#f0fdfa", color: "#0d9488", border: "#99f6e4" },
  מסחר:    { bg: "#f0f9ff", color: "#0284c7", border: "#bae6fd" },
  // Fallback
  אחר:     GRAY,
};

export const DEFAULT_CATEGORY_COLOR: CategoryColor = GRAY;
