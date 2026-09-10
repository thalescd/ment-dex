import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

// cache.js fala com localStorage, que nao existe no Node. Um stub em memoria
// basta e mantem o teste sem dependencia de browser.
const store = new Map();
globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
};

const { loadCached, readCache, writeCache } =
    await import("../../src/core/cache.js");

beforeEach(() => store.clear());

test("writeCache/readCache: ida e volta", () => {
    writeCache("moves", { MOVE_POUND: { power: 40 } });
    assert.deepEqual(readCache("moves"), { MOVE_POUND: { power: 40 } });
});

test("writeCache: recusa gravar objeto vazio", () => {
    // Este e o bug que deixava a dex vazia cacheada para sempre.
    writeCache("moves", {});
    assert.equal(store.has("moves"), false, "objeto vazio foi cacheado");
    assert.equal(readCache("moves"), null);
});

test("readCache: descarta cache corrompido em vez de estourar", () => {
    store.set("moves", "isto nao e LZString valido");
    assert.equal(readCache("moves"), null);
    assert.equal(
        store.has("moves"),
        false,
        "entrada ruim deveria ser removida"
    );
});

test("loadCached: chama build no miss e reusa no hit", async () => {
    let builds = 0;
    const build = async () => {
        builds++;
        return { MOVE_POUND: { power: 40 } };
    };

    const first = await loadCached("moves", build);
    const second = await loadCached("moves", build);

    assert.equal(builds, 1, "build deveria rodar uma vez so");
    assert.deepEqual(first, second);
});

test("loadCached: build vazio nao e cacheado, entao roda de novo", async () => {
    let builds = 0;
    const build = async () => {
        builds++;
        return {};
    };

    await loadCached("moves", build);
    await loadCached("moves", build);

    assert.equal(builds, 2, "resultado vazio nao deve virar cache");
});
