import js from "@eslint/js";
import globals from "globals";

/* Deliberately minimal: this is a solo vanilla-JS project, so the job here
   is catching real mistakes — typos, unreachable code, accidental globals —
   not enforcing house style. Formatting is left alone. */
export default [
  {
    ignores: ["dist/**", "node_modules/**", "scripts-tmp-*"],
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        Cal: "readonly", // injected by the Cal.com embed script in index.html
      },
    },
    rules: {
      // an unused arg is usually a signature being honoured, not a bug;
      // an unused local almost always is one
      "no-unused-vars": ["warn", { args: "none", varsIgnorePattern: "^_" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "smart"],
      "prefer-const": "warn",
      "no-var": "error",
    },
  },
];
