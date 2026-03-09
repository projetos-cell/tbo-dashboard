import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-plugin-prettier";

const eslintConfig = defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      prettier: prettier,
    },
    rules: {
      "prettier/prettier": "warn",
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "components/ui/**",
  ]),
]);

export default eslintConfig;
