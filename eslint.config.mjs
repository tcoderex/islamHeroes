import { defineConfig } from "eslint/config";
import next from "eslint-config-next";
import path from "node:path";
import { fileURLToPath } from "node:url";

export default defineConfig([
  {
    ignores: [".cloudflare/**", ".next/**", "dist/**", "node_modules/**"],
  },
  {
    extends: [...next],
  },
]);
