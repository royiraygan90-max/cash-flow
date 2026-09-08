import { randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9֐-׿]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const name = process.argv[2];
  if (!name) {
    console.error('Usage: npm run create:user -- "Full Name" [https://your-app-domain]');
    process.exit(1);
  }
  const appUrl = process.argv[3] ?? process.env.APP_URL;

  const base = slugify(name) || "user";
  let token = "";
  let user = null;

  // Retry on the unlikely chance the random suffix collides with an existing token.
  for (let attempt = 0; attempt < 5 && !user; attempt++) {
    token = `${base}-${randomBytes(4).toString("hex")}`;
    try {
      user = await prisma.user.create({ data: { name, token } });
    } catch (e: any) {
      if (e?.code !== "P2002") throw e; // unique constraint violation -> retry
    }
  }
  if (!user) throw new Error("Could not generate a unique token after 5 attempts.");

  console.log(`Created user "${user.name}" (id: ${user.id})`);
  console.log(`Token: ${user.token}`);
  console.log(
    appUrl
      ? `Link: ${appUrl.replace(/\/+$/, "")}/enter/${user.token}`
      : `Link: <your-app-domain>/enter/${user.token}`
  );
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
