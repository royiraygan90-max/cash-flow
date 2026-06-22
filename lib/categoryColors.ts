export interface CategoryColor {
  bg: string;
  color: string;
  border: string;
  icon: string;
}

const GRAY: CategoryColor = {
  bg: "#9aa6b422",
  color: "#9aa6b4",
  border: "#9aa6b444",
  icon: "category",
};

export const CATEGORY_COLORS: Record<string, CategoryColor> = {
  // Income
  משכורת: { bg: "#34e0a122", color: "#34e0a1", border: "#34e0a144", icon: "payments" },
  פרילנס: { bg: "#34e0a122", color: "#34e0a1", border: "#34e0a144", icon: "payments" },
  מסחר:   { bg: "#34e0a122", color: "#34e0a1", border: "#34e0a144", icon: "payments" },
  // Food
  מזון:    { bg: "#a78bfa22", color: "#a78bfa", border: "#a78bfa44", icon: "restaurant" },
  // Entertainment
  בילויים: { bg: "#f472b622", color: "#f472b6", border: "#f472b644", icon: "celebration" },
  // Transport
  תחבורה:  { bg: "#52b9ff22", color: "#52b9ff", border: "#52b9ff44", icon: "directions_car" },
  // Health
  בריאות:  { bg: "#ffb45422", color: "#ffb454", border: "#ffb45444", icon: "favorite" },
  // Housing
  שכירות:  { bg: "#52b9ff22", color: "#52b9ff", border: "#52b9ff44", icon: "home_work" },
  // Clothing
  ביגוד:   { bg: "#f472b622", color: "#f472b6", border: "#f472b644", icon: "checkroom" },
  // Savings
  חיסכון:  { bg: "#34e0a122", color: "#34e0a1", border: "#34e0a144", icon: "savings" },
  // Subscription
  מנוי:    { bg: "#818cf822", color: "#818cf8", border: "#818cf844", icon: "autorenew" },
  // Fallback
  אחר:     GRAY,
};

export const DEFAULT_CATEGORY_COLOR: CategoryColor = GRAY;
