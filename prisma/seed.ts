import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.transaction.deleteMany();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  // Helper: date in a given month offset
  const d = (monthOffset: number, day: number) =>
    new Date(currentYear, currentMonth + monthOffset, day);

  const transactions = [
    // ----- 2 months ago -----
    { date: d(-2, 1),  type: "income",  category: "משכורת",  description: "משכורת חודשית",        amount: 12000 },
    { date: d(-2, 5),  type: "expense", category: "שכירות",  description: "שכירות דירה",           amount: 4500 },
    { date: d(-2, 8),  type: "expense", category: "מזון",    description: "סופרמרקט שופרסל",       amount: 850  },
    { date: d(-2, 10), type: "expense", category: "תחבורה",  description: "כרטיסייה חודשית",       amount: 250  },
    { date: d(-2, 12), type: "expense", category: "מזון",    description: "אוכל בחוץ",             amount: 380  },
    { date: d(-2, 14), type: "expense", category: "בריאות",  description: "תרופות בית מרקחת",      amount: 160  },
    { date: d(-2, 15), type: "income",  category: "מסחר",   description: "רווח מסחר בשוק ההון",  amount: 1500 },
    { date: d(-2, 18), type: "expense", category: "בילויים", description: "קולנוע + מסעדה",        amount: 320  },
    { date: d(-2, 20), type: "expense", category: "מזון",    description: "סופרמרקט רמי לוי",      amount: 420  },
    { date: d(-2, 22), type: "expense", category: "ביגוד",   description: "קניות בגדים",           amount: 600  },
    { date: d(-2, 25), type: "expense", category: "חיסכון",  description: "העברה לחיסכון",         amount: 1000 },
    { date: d(-2, 28), type: "expense", category: "תחבורה",  description: "דלק",                   amount: 350  },

    // ----- 1 month ago -----
    { date: d(-1, 1),  type: "income",  category: "משכורת",  description: "משכורת חודשית",        amount: 12000 },
    { date: d(-1, 3),  type: "income",  category: "פרילנס",  description: "פרויקט עיצוב אתר",     amount: 3000  },
    { date: d(-1, 5),  type: "expense", category: "שכירות",  description: "שכירות דירה",           amount: 4500  },
    { date: d(-1, 7),  type: "expense", category: "מזון",    description: "סופרמרקט שופרסל",       amount: 920   },
    { date: d(-1, 9),  type: "expense", category: "תחבורה",  description: "תחזוקת רכב",            amount: 480   },
    { date: d(-1, 11), type: "expense", category: "מזון",    description: "הזמנת אוכל אונליין",    amount: 220   },
    { date: d(-1, 13), type: "expense", category: "בילויים", description: "פאב עם חברים",          amount: 250   },
    { date: d(-1, 16), type: "expense", category: "בריאות",  description: "ביקור רופא + תרופות",  amount: 320   },
    { date: d(-1, 18), type: "expense", category: "מזון",    description: "שוק הכרמל",             amount: 310   },
    { date: d(-1, 21), type: "expense", category: "ביגוד",   description: "נעליים",                amount: 450   },
    { date: d(-1, 24), type: "expense", category: "חיסכון",  description: "העברה לחיסכון",         amount: 1500  },
    { date: d(-1, 27), type: "expense", category: "אחר",     description: "מתנה ליום הולדת",       amount: 200   },

    // ----- current month -----
    { date: d(0, 1),  type: "income",  category: "משכורת",  description: "משכורת חודשית",        amount: 12000 },
    { date: d(0, 5),  type: "expense", category: "שכירות",  description: "שכירות דירה",           amount: 4500  },
    { date: d(0, 6),  type: "expense", category: "מזון",    description: "סופרמרקט שופרסל",       amount: 780   },
    { date: d(0, 8),  type: "expense", category: "תחבורה",  description: "כרטיסייה חודשית",       amount: 250   },
    { date: d(0, 10), type: "expense", category: "מזון",    description: "אוכל בחוץ ארוחת צהריים",amount: 180   },
    { date: d(0, 11), type: "expense", category: "בריאות",  description: "פיזיותרפיה",            amount: 280   },
    { date: d(0, 13), type: "expense", category: "בילויים", description: "מופע מוזיקה",           amount: 180   },
    { date: d(0, 15), type: "expense", category: "מזון",    description: "רמי לוי",               amount: 350   },
    { date: d(0, 17), type: "expense", category: "חיסכון",  description: "העברה לחיסכון",         amount: 1000  },
    { date: d(0, 19), type: "expense", category: "אחר",     description: "ספרים וקורסים",         amount: 290   },
  ];

  for (const t of transactions) {
    await prisma.transaction.create({ data: t });
  }

  console.log(`Seeded ${transactions.length} transactions`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
