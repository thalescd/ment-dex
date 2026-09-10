// Trava as regras de camada do projeto.
//
// A estrutura de pastas so vale se algo a defender: sem isto, o primeiro
// import conveniente na direcao errada volta a criar o emaranhado que existia
// quando tudo morava em src/utils/ (44% do codigo, 7 ciclos de import).
//
// A regra e uma so: a dependencia aponta para dentro.
//
//   app       -> pode importar tudo (e o orquestrador)
//   features  -> core, vendor, shared, outras features
//   shared    -> core, vendor            (infra que NAO conhece feature)
//   core      -> core, vendor            (folhas genericas)
//   vendor    -> nada
//
// Tambem verifica que o grafo continua sem ciclos.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname, normalize, relative } from "node:path";

const SRC = new URL("../../src/", import.meta.url).pathname;

function jsFiles(dir = SRC, found = []) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name);
        if (entry.isDirectory()) jsFiles(full, found);
        else if (entry.name.endsWith(".js")) found.push(full);
    }
    return found;
}

// pega `from "x"`, `import "x"` e `import("x")`
const IMPORT_RE = /(?:from|import)\s*\(?\s*["'](\.[^"']+)["']/gs;

function importGraph() {
    const files = jsFiles();
    const graph = new Map(files.map((f) => [f, []]));
    for (const file of files) {
        const source = readFileSync(file, "utf8");
        for (const [, spec] of source.matchAll(IMPORT_RE)) {
            const target = normalize(join(dirname(file), spec));
            if (graph.has(target))
                graph.get(target) && graph.get(file).push(target);
        }
    }
    return graph;
}

const LAYERS = ["core", "vendor", "shared", "features", "app"];
const ALLOWED = {
    app: new Set(["app", "features", "shared", "core", "vendor"]),
    features: new Set(["features", "shared", "core", "vendor"]),
    shared: new Set(["shared", "core", "vendor"]),
    core: new Set(["core", "vendor"]),
    vendor: new Set(["vendor"]),
    root: new Set(LAYERS.concat("root")),
};

function layerOf(file) {
    const rel = relative(SRC, file);
    const top = rel.split("/")[0];
    return LAYERS.includes(top) ? top : "root";
}

// Divida conhecida, deliberada, com plano: a infra de tabela contem logica de
// trainers (dificuldade e rematch). O jeito certo e a feature registrar esses
// predicados, como ja acontece com batchSize e useShowFlag em
// shared/table/registry.js. Fica para quando trainers/items forem reescritos
// para o formato do pokeemerald-expansion — hoje esse codigo esta parado.
const KNOWN_VIOLATIONS = new Set([
    "shared/table/table.js -> features/scripts/trainersLogic.js",
    "shared/table/filters.js -> features/scripts/trainersLogic.js",
]);

test("a dependencia entre camadas aponta para dentro", () => {
    const graph = importGraph();
    const unexpected = [];

    for (const [file, targets] of graph) {
        const from = layerOf(file);
        for (const target of targets) {
            const to = layerOf(target);
            if (ALLOWED[from].has(to)) continue;
            const edge = `${relative(SRC, file)} -> ${relative(SRC, target)}`;
            if (!KNOWN_VIOLATIONS.has(edge))
                unexpected.push(`${edge}  [${from} -> ${to}]`);
        }
    }

    assert.deepEqual(
        unexpected,
        [],
        `import(s) atravessando camada na direcao errada:\n  ${unexpected.join("\n  ")}`
    );
});

test("as violacoes conhecidas ainda existem (senao remova-as da lista)", () => {
    const graph = importGraph();
    const edges = new Set();
    for (const [file, targets] of graph) {
        for (const target of targets) {
            edges.add(`${relative(SRC, file)} -> ${relative(SRC, target)}`);
        }
    }
    const stale = [...KNOWN_VIOLATIONS].filter((e) => !edges.has(e));
    assert.deepEqual(
        stale,
        [],
        `ja corrigidas, tire do allowlist:\n  ${stale.join("\n  ")}`
    );
});

test("o grafo de imports nao tem ciclos", () => {
    const graph = importGraph();
    const state = new Map();
    const cycles = [];

    function visit(node, path) {
        if (state.get(node) === "done") return;
        if (state.get(node) === "visiting") {
            cycles.push(
                [...path.slice(path.indexOf(node)), node]
                    .map((f) => relative(SRC, f))
                    .join(" -> ")
            );
            return;
        }
        state.set(node, "visiting");
        for (const next of graph.get(node) ?? []) visit(next, [...path, node]);
        state.set(node, "done");
    }
    for (const node of graph.keys()) visit(node, []);

    assert.deepEqual(cycles, [], `ciclos de import:\n  ${cycles.join("\n  ")}`);
});
