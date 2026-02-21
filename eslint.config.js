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

        // ─── src/ v3.0 singletons (enterprise layer) ───
        TBO_DB: "readonly",
        TBO_APP_CONFIG: "readonly",
        TBO_LOGGER: "readonly",
        TBO_ERRORS: "readonly",
        TBO_SANITIZE: "readonly",
        TBO_VALIDATE: "readonly",
        TBO_RBAC: "readonly",
        TBO_HTTP: "readonly",
        TBO_STORAGE: "readonly",
        TBO_FILE_STORAGE: "readonly",
        TBO_ROUTE_REGISTRY: "readonly",

        // Repositories (Data Access Layer)
        RepoBase: "readonly",
        ProjectsRepo: "readonly",
        PeopleRepo: "readonly",
        FinanceRepo: "readonly",
        ChatRepo: "readonly",
        CrmRepo: "readonly",
        AuditRepo: "readonly",

        // Integration contracts
        RDStationIntegration: "readonly",
        OmieIntegration: "readonly",
        FirefliesIntegration: "readonly",
        GoogleCalendarIntegration: "readonly",

        // ─── Legacy singletons (utils/) ───
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
        TBO_UI: "readonly",
        TBO_DIGEST: "readonly",
        TBO_WORKFLOW: "readonly",
        TBO_REALTIME: "readonly",
        TBO_DYNAMIC_TEMPLATES: "readonly",
        TBO_DOCUMENT_VERSIONS: "readonly",
        TBO_PDF_EXPORT: "readonly",
        TBO_CRYPTO: "readonly",
        TBO_NOTIFICATIONS: "readonly",
        TBO_ERP: "readonly",
        TBO_NAVIGATION: "readonly",
        TBO_SEARCH: "readonly",
        TBO_SHORTCUTS: "readonly",
        TBO_BI: "readonly",
        TBO_DS: "readonly",
        TBO_CHAT: "readonly",
        TBO_GOOGLE_CALENDAR: "readonly",

        // ─── UX Components (v3.1) ───
        TBO_COMMAND_REGISTRY: "readonly",
        TBO_COMMAND_PALETTE: "readonly",
        TBO_ACTIVITY: "readonly",
        TBO_ACTIVITY_FEED: "readonly",
        TBO_SKELETON: "readonly",
        TBO_SIDEBAR_ENHANCER: "readonly",
        TBO_FEEDBACK: "readonly",
        ActivityRepo: "readonly",

        // ─── Navigation System (v3.1) ───
        TBO_NAV_TREE: "readonly",
        TBO_NOTION_SIDEBAR: "readonly",
        TBO_NAV_BRIDGE: "readonly",

        // ─── Asana-style UI (v3.2) ───
        TBO_ASANA_LAYOUT: "readonly",
        TBO_DETAILS_PANEL: "readonly",
        TBO_LIST_VIEW: "readonly",
        TBO_INLINE_EDITOR: "readonly",

        // ─── Sidebar Notion v2 (v3.3) ───
        TBO_SIDEBAR_SERVICE: "readonly",
        TBO_SIDEBAR_RENDERER: "readonly",
        TBO_SIDEBAR_BRIDGE: "readonly",
        TBO_ADD_TO_SPACE: "readonly",
        TBO_SECONDARY_SIDEBAR: "readonly",
        TBO_PAGE_EDITOR: "readonly",
        PagesRepo: "readonly",

        // Onboarding globals
        ONBOARDING_CONFIG: "readonly",
        TBO_ONBOARDING_DB: "readonly",
        _escapeHtml: "readonly",

        // CDN globals
        lucide: "readonly",
        Chart: "readonly",
        L: "readonly", // Leaflet
        marked: "readonly" // Markdown parser
      }
    },
    rules: {
      // Erros criticos
      "no-undef": "warn",
      "no-unused-vars": ["warn", {
        "varsIgnorePattern": "^_|^TBO_|Repo$|Integration$",
        "argsIgnorePattern": "^_",
        "caughtErrorsIgnorePattern": "^_"
      }],
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
      "no-throw-literal": "warn",
      "consistent-return": "warn",
      "no-shadow": "warn",
      "prefer-const": "warn",
      "no-var": "warn"
    }
  },
  {
    // src/ + utils/: relaxar no-redeclare (singletons definidos E registrados como globals)
    files: ["src/**/*.js", "utils/**/*.js"],
    rules: {
      "no-redeclare": "off"
    }
  },
  {
    // Ignorar arquivos nao-JS e gerados
    ignores: [
      "node_modules/",
      "database/",
      "supabase/",
      "docs/",
      "dist/",
      "archive/",
      "*.json",
      "*.css",
      "*.html",
      "config.js",
      "config.example.js"
    ]
  }
];
