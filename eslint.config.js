import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    // Configuracao global para browser vanilla JS
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser,
        // Supabase CDN global
        supabase: "readonly",
        // TBO OS singletons (definidos em utils/)
        TBO_SUPABASE: "readonly",
        TBO_AUTH: "readonly",
        TBO_PERMISSIONS: "readonly",
        TBO_ROUTER: "readonly",
        TBO_CONFIG: "readonly",
        TBO_TOAST: "readonly",
        TBO_FORMATTER: "readonly",
        TBO_APP: "readonly",
        TBO_WORKSPACE: "readonly",
        TBO_UX: "readonly",
        TBO_DIGEST: "readonly",
        TBO_WORKFLOW: "readonly",
        TBO_REALTIME: "readonly",
        TBO_DYNAMIC_TEMPLATES: "readonly",
        TBO_DOCUMENT_VERSIONS: "readonly",
        TBO_PDF_EXPORT: "readonly",
        TBO_CRYPTO: "readonly",
        TBO_NOTIFICATIONS: "readonly",
        // Onboarding globals
        ONBOARDING_CONFIG: "readonly",
        TBO_ONBOARDING_DB: "readonly",
        _escapeHtml: "readonly",
        // Lucide icons CDN
        lucide: "readonly",
        // Chart.js CDN
        Chart: "readonly"
      }
    },
    rules: {
      // Erros criticos
      "no-undef": "warn",
      "no-unused-vars": "off", // Muitos singletons definidos globalmente
      "no-redeclare": "error",

      // Seguranca
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",

      // Qualidade
      "no-debugger": "warn",
      "no-empty": "warn",
      "no-extra-semi": "warn",
      "no-unreachable": "warn",
      "no-constant-condition": "warn",
      "no-dupe-keys": "error",
      "no-duplicate-case": "error",
      "valid-typeof": "error",
      "eqeqeq": ["warn", "smart"],
      "no-throw-literal": "warn"
    }
  },
  {
    // Ignorar arquivos nao-JS e gerados
    ignores: [
      "node_modules/",
      "database/",
      "supabase/",
      "docs/",
      "*.json",
      "*.css",
      "*.html",
      "config.js",
      "config.example.js"
    ]
  }
];
