import { test } from "node:test";
import assert from "node:assert/strict";
import { fixture } from "../fixtures/load.js";
import { parseAbilitiesInfo } from "../../src/modules/abilities/regexAbilities.js";

test("parseAbilitiesInfo: nome e descricao", () => {
    const abilities = parseAbilitiesInfo(fixture("abilities.h"));
    const stench = abilities.ABILITY_STENCH;

    assert.ok(stench, "ABILITY_STENCH ausente");
    assert.equal(stench.ingameName, "Stench");
    assert.ok(stench.description.includes("flinch"), stench.description);
    // COMPOUND_STRING multi-linha: o \n do jogo vira espaco
    assert.ok(!stench.description.includes("\\n"), "escape \\n vazou");
});

test("parseAbilitiesInfo: invariantes de estrutura", () => {
    const abilities = parseAbilitiesInfo(fixture("abilities.h"));
    assert.ok(Object.keys(abilities).length >= 3);

    for (const [key, ability] of Object.entries(abilities)) {
        assert.match(key, /^ABILITY_/);
        assert.equal(ability.name, key);
        assert.equal(typeof ability.ingameName, "string");
        assert.equal(typeof ability.description, "string");
        assert.equal(typeof ability.id, "number");
    }
});
