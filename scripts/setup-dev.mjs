import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
if (existsSync(".env")) {
  console.info(
    "Existing .env preserved. See .env.example for newly added variables.",
  );
} else {
  const template = readFileSync(".env.example", "utf8");
  writeFileSync(
    ".env",
    template.replace(
      /^BETTER_AUTH_SECRET=$/m,
      `BETTER_AUTH_SECRET=${randomBytes(32).toString("base64")}`,
    ),
  );
  console.info(
    "Development .env created with a random secret and mock AI. Configure your dedicated PostgreSQL database, then run pnpm db:migrate.",
  );
}
