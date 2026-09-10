import js from "@eslint/js";
import globals from "globals";

export default [
    // Codigo vendorizado: nao e nosso, nao lintar
    {
        ignores: ["src/vendor/**", "node_modules/**"],
    },

    // Codigo da aplicacao: roda no browser, ES modules
    {
        files: ["src/**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: globals.browser,
        },
        rules: {
            ...js.configs.recommended.rules,

            // Pega variavel/import/parametro que ninguem usa.
            // args: "after-used" => parametro nao usado antes de um usado e ok.
            "no-unused-vars": [
                "warn",
                { args: "after-used", caughtErrors: "none" },
            ],

            // Bugs silenciosos que o projeto pode ter
            eqeqeq: ["warn", "always"], // == faz coercao surpresa
            "no-implicit-coercion": "warn",
            "no-var": "warn", // var tem escopo de funcao, nao de bloco
            "prefer-const": "warn", // let que nunca e reatribuido
            "no-throw-literal": "warn", // throw "erro" perde o stack trace
        },
    },

    // Testes e scripts de tooling rodam no Node, nao no browser
    {
        files: ["test/**/*.js", "*.config.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: globals.node,
        },
        rules: { ...js.configs.recommended.rules },
    },
];
