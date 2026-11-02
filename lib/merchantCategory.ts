/** First match wins. Only a starting point — a category the user picked for the same merchant always beats these. */
const CATEGORY_RULES: { category: string; words: string[] }[] = [
  { category: "בריאות", words: ["סופר-פארם", "סופר פארם", "בי דראג", "בית מרקחת", "מכבי", "כללית", "מאוחדת", "לאומית", "רופא", "קליניקה"] },
  { category: "תחבורה", words: ["דלק", "פז ", "סונול", "דור אלון", "חניון", "חניה", "רב קו", "רב-קו", "אובר", "רכבת", "אגד", "כביש 6", "קווי חוף"] },
  { category: "מזון", words: ["סופר", "שופרסל", "רמי לוי", "מגה", "יוחננוף", "ויקטורי", "אושר עד", "מאפיה", "מאפה", "קפה", "פיצה", "מסעדה", "בורגר", "שווארמה", "פלאפל", "וולט", "תן ביס", "גלידה"] },
  { category: "בילויים", words: ["סינמה", "קולנוע", "יס פלאנט", "נטפליקס", "ספוטיפיי", "בר ", "פאב", "הופעה", "כרטיסים"] },
  { category: "ביגוד", words: ["זארה", "קסטרו", "הולדר", "פוקס", "אמריקן איגל", "שילב", "טרמינל"] },
  { category: "משק בית", words: ["איקאה", "אייס", "הום סנטר", "חשמל", "ארנונה"] },
  { category: "קניות", words: ["אמזון", "עלי אקספרס", "אלי אקספרס", "קסם", "ksp", "באג", "מחסני חשמל"] },
];

/** The category to start a new merchant with, from keywords alone. */
export function guessCategoryFromKeywords(merchant: string): string | null {
  const text = merchant.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.words.some((w) => text.includes(w.toLowerCase()))) return rule.category;
  }
  return null;
}
